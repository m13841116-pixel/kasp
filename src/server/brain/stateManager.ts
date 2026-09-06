import crypto from 'crypto';
import { queryOne, queryAll, execute } from '../db.js';
import { 
  BusinessState, 
  BusinessLoopStage, 
  BusinessGraph, 
  ExecutiveMemory,
  EpistemicStatus,
  TaskItem,
  DecisionLogEntry,
  AssumptionEntry
} from './types.js';

export class BrainStateManager {
  /**
   * Retrieves full BusinessState for a given project ID
   */
  static async getProjectState(projectId: string): Promise<BusinessState | null> {
    try {
      const row = await queryOne(
        "SELECT * FROM ai_business_states WHERE projectId = ? ORDER BY version DESC LIMIT 1",
        [projectId]
      );

      if (row && row.graphData) {
        return {
          projectId: row.projectId,
          userId: row.userId,
          currentStage: (row.currentStage as BusinessLoopStage) || 'UNDERSTAND',
          completedStages: row.completedStages ? JSON.parse(row.completedStages) : ['UNDERSTAND'],
          graph: typeof row.graphData === 'string' ? JSON.parse(row.graphData) : row.graphData,
          executiveMemory: typeof row.executiveMemory === 'string' ? JSON.parse(row.executiveMemory) : row.executiveMemory,
          version: Number(row.version || 1),
          createdAt: row.createdAt || new Date().toISOString(),
          updatedAt: row.updatedAt || new Date().toISOString()
        };
      }

      // Fallback: Check if there's a traditional report in ai_team_projects
      const projectRow = await queryOne(
        "SELECT * FROM ai_team_projects WHERE id = ?",
        [projectId]
      );

      if (projectRow && projectRow.reportData) {
        const report = typeof projectRow.reportData === 'string' ? JSON.parse(projectRow.reportData) : projectRow.reportData;
        if (report._businessState) {
          return report._businessState;
        }
      }

      return null;
    } catch (err) {
      console.error('[BrainStateManager] Error loading project state:', err);
      return null;
    }
  }

  /**
   * Retrieves the latest active state for a user to enable persistent project memory
   */
  static async getLatestUserState(userId: string): Promise<BusinessState | null> {
    try {
      const row = await queryOne(
        "SELECT * FROM ai_business_states WHERE userId = ? ORDER BY updatedAt DESC LIMIT 1",
        [userId]
      );

      if (row && row.graphData) {
        return {
          projectId: row.projectId,
          userId: row.userId,
          currentStage: (row.currentStage as BusinessLoopStage) || 'UNDERSTAND',
          completedStages: row.completedStages ? JSON.parse(row.completedStages) : ['UNDERSTAND'],
          graph: typeof row.graphData === 'string' ? JSON.parse(row.graphData) : row.graphData,
          executiveMemory: typeof row.executiveMemory === 'string' ? JSON.parse(row.executiveMemory) : row.executiveMemory,
          version: Number(row.version || 1),
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
        };
      }
      return null;
    } catch (err) {
      console.error('[BrainStateManager] Error loading latest user state:', err);
      return null;
    }
  }

  /**
   * Saves or updates a BusinessState version
   */
  static async saveProjectState(state: BusinessState): Promise<void> {
    try {
      const id = `state-${crypto.randomUUID()}`;
      const now = new Date().toISOString();
      const completedStagesStr = JSON.stringify(state.completedStages || []);
      const graphStr = JSON.stringify(state.graph);
      const memoryStr = JSON.stringify(state.executiveMemory);

      // Check if state exists
      const existing = await queryOne(
        "SELECT id, version FROM ai_business_states WHERE projectId = ?",
        [state.projectId]
      );

      if (existing) {
        const newVersion = (existing.version || 1) + 1;
        await execute(
          `UPDATE ai_business_states 
           SET currentStage = ?, completedStages = ?, graphData = ?, executiveMemory = ?, version = ?, updatedAt = ? 
           WHERE projectId = ?`,
          [state.currentStage, completedStagesStr, graphStr, memoryStr, newVersion, now, state.projectId]
        );
      } else {
        await execute(
          `INSERT INTO ai_business_states (id, projectId, userId, currentStage, completedStages, graphData, executiveMemory, version, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, state.projectId, state.userId, state.currentStage, completedStagesStr, graphStr, memoryStr, 1, now, now]
        );
      }
    } catch (err) {
      console.error('[BrainStateManager] Error saving project state:', err);
    }
  }

  /**
   * Advances project to next loop stage and records the milestone
   */
  static async advanceLoopStage(projectId: string, nextStage: BusinessLoopStage): Promise<BusinessState | null> {
    const state = await this.getProjectState(projectId);
    if (!state) return null;

    if (!state.completedStages.includes(state.currentStage)) {
      state.completedStages.push(state.currentStage);
    }
    state.currentStage = nextStage;
    state.updatedAt = new Date().toISOString();

    state.executiveMemory.decisionsLog.push({
      id: `dec-${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
      stage: nextStage,
      decision: `انتقال به فاز ${nextStage} در چرخه ۷ مرحله‌ای کسب‌وکار KASP`,
      rationale: 'تکمیل نیازمندی‌های فاز پیشین و فعال‌سازی اقدامات فاز جدید',
      epistemicType: 'FACT'
    });

    await this.saveProjectState(state);
    return state;
  }

  /**
   * Records a strategic decision in persistent executive memory
   */
  static async recordDecision(
    projectId: string, 
    decision: string, 
    rationale: string, 
    epistemicType: EpistemicStatus = 'INFERENCE'
  ): Promise<void> {
    const state = await this.getProjectState(projectId);
    if (!state) return;

    state.executiveMemory.decisionsLog.push({
      id: `dec-${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
      stage: state.currentStage,
      decision,
      rationale,
      epistemicType
    });

    state.updatedAt = new Date().toISOString();
    await this.saveProjectState(state);
  }

  /**
   * Updates task status and logs blockers
   */
  static async updateTaskStatus(
    projectId: string,
    taskId: string,
    status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED',
    blockerReason?: string
  ): Promise<void> {
    const state = await this.getProjectState(projectId);
    if (!state) return;

    const tasks = state.graph.tasks.roadmap.value || [];
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex >= 0) {
      tasks[taskIndex].status = status;
      if (status === 'BLOCKED' && blockerReason) {
        tasks[taskIndex].blockerReason = blockerReason;
        if (!state.executiveMemory.answers.whatIsBlocked.includes(blockerReason)) {
          state.executiveMemory.answers.whatIsBlocked.push(blockerReason);
        }
      } else if (status === 'DONE') {
        const title = tasks[taskIndex].title;
        if (!state.executiveMemory.answers.whatHasAlreadyBeenDone.includes(title)) {
          state.executiveMemory.answers.whatHasAlreadyBeenDone.push(title);
        }
      }
    }

    state.updatedAt = new Date().toISOString();
    await this.saveProjectState(state);
  }
}
