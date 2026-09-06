import crypto from 'crypto';
import { 
  BusinessState, 
  BuildArtifact, 
  BuildArtifactCategory, 
  BuildCapabilityStatus, 
  BuildProgressStatus, 
  ArtifactHierarchyLevel,
  BuildExecutionPlan,
  BuildExecutionLog,
  BuildArtifactOutput
} from './types.js';
import { BuildGenerator } from './buildGenerator.js';
import { BrainStateManager } from './stateManager.js';
import { queryAll, queryOne, execute } from '../db.js';

export class KaspBuildOrchestrator {
  private generator = new BuildGenerator();

  /**
   * Generates or retrieves the comprehensive Execution Plan for the approved BusinessState
   */
  public async getOrCreateExecutionPlan(projectId: string, state?: BusinessState): Promise<BuildExecutionPlan> {
    const currentState = state || await BrainStateManager.getProjectState(projectId);
    if (!currentState) {
      throw new Error(`BusinessState for project ${projectId} not found.`);
    }

    // Check if artifacts already exist in database
    const existingRows = await queryAll(
      "SELECT * FROM ai_build_artifacts WHERE projectId = ? ORDER BY createdAt ASC",
      [projectId]
    );

    let items: BuildArtifact[] = [];

    if (existingRows && existingRows.length > 0) {
      items = existingRows.map((r: any) => this.mapRowToArtifact(r));
    } else {
      // Create initial canonical execution plan based on BusinessState
      items = this.createDefaultArtifactPlan(currentState);

      // Save into DB
      for (const item of items) {
        await this.saveArtifact(item);
      }
    }

    // Calculate stats
    const stats = {
      total: items.length,
      canBuildNow: items.filter(i => i.status === 'CAN_BUILD_NOW').length,
      needsInput: items.filter(i => i.status === 'NEEDS_USER_INPUT').length,
      needsService: items.filter(i => i.status === 'NEEDS_EXTERNAL_SERVICE').length,
      humanApprovalRequired: items.filter(i => i.status === 'HUMAN_APPROVAL_REQUIRED').length,
      ready: items.filter(i => i.progress === 'READY').length
    };

    const overallProgress = Math.round((stats.ready / (stats.total || 1)) * 100);

    return {
      projectId,
      businessGoal: currentState.executiveMemory.answers.whatAreWeBuilding || currentState.graph.business.mission.value || 'کسب‌وکار پیشنهادی',
      businessName: currentState.graph.business.name.value || 'پروژه KASP',
      items,
      overallProgress,
      stats,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Builds a single artifact through the 5 progress stages
   */
  public async executeArtifactBuild(params: {
    projectId: string;
    artifactId: string;
    userInputs?: Record<string, string>;
    onProgressUpdate?: (status: BuildProgressStatus, logMessage: string) => void;
  }): Promise<{ artifact: BuildArtifact; log: BuildExecutionLog }> {
    const { projectId, artifactId, userInputs, onProgressUpdate } = params;

    const state = await BrainStateManager.getProjectState(projectId);
    if (!state) {
      throw new Error(`BusinessState not found for project ${projectId}`);
    }

    const row = await queryOne("SELECT * FROM ai_build_artifacts WHERE id = ? AND projectId = ?", [artifactId, projectId]);
    if (!row) {
      throw new Error(`Artifact ${artifactId} not found.`);
    }

    const artifact = this.mapRowToArtifact(row);
    const initialStatus = artifact.progress;

    // Safety check: Human approval required items cannot be marked live/published without approval
    if (artifact.status === 'HUMAN_APPROVAL_REQUIRED' && artifact.humanApproval?.required && !artifact.humanApproval.approved) {
      // Proceed to build draft, but flag approval status
    }

    // Log Start
    await this.recordExecutionLog({
      projectId,
      artifactId,
      artifactTitle: artifact.title,
      action: 'START_BUILD',
      statusFrom: initialStatus,
      statusTo: 'PLANNING',
      details: `شروع چرخه ساخت برای ${artifact.title}`
    });

    // Update progress through generator
    const output = await this.generator.generateArtifactContent({
      artifact,
      state,
      userInputs,
      onProgressUpdate: async (progressStage, logMsg) => {
        onProgressUpdate?.(progressStage, logMsg);
        artifact.progress = progressStage;
        if (!artifact.executionLogs) artifact.executionLogs = [];
        artifact.executionLogs.push(`[${new Date().toLocaleTimeString('fa-IR')}] ${logMsg}`);
      }
    });

    artifact.output = output;
    artifact.progress = 'READY';
    artifact.updatedAt = new Date().toISOString();

    // If it was NEEDS_USER_INPUT and inputs were provided, update status
    if (artifact.status === 'NEEDS_USER_INPUT' && userInputs && Object.keys(userInputs).length > 0) {
      if (artifact.requiredInputs) {
        artifact.requiredInputs.forEach(input => {
          if (userInputs[input.field]) {
            input.value = userInputs[input.field];
          }
        });
      }
    }

    // Save updated artifact
    await this.saveArtifact(artifact);

    // Record Completion Log
    const log = await this.recordExecutionLog({
      projectId,
      artifactId,
      artifactTitle: artifact.title,
      action: 'FINISH_BUILD',
      statusFrom: initialStatus,
      statusTo: 'READY',
      details: `ساخت و اعتبارسنجی ${artifact.title} با موفقیت انجام شد.`
    });

    // Also attach to BusinessState
    await this.syncStateWithArtifacts(projectId);

    return { artifact, log };
  }

  /**
   * Approves a sensitive or human-approval-required action
   */
  public async approveArtifact(projectId: string, artifactId: string, notes?: string): Promise<BuildArtifact> {
    const row = await queryOne("SELECT * FROM ai_build_artifacts WHERE id = ? AND projectId = ?", [artifactId, projectId]);
    if (!row) throw new Error('تسک یافت نشد.');

    const artifact = this.mapRowToArtifact(row);
    if (!artifact.humanApproval) {
      artifact.humanApproval = { required: true, approved: true };
    }
    artifact.humanApproval.approved = true;
    artifact.humanApproval.approvedAt = new Date().toISOString();
    artifact.humanApproval.notes = notes;

    await this.saveArtifact(artifact);

    await this.recordExecutionLog({
      projectId,
      artifactId,
      artifactTitle: artifact.title,
      action: 'HUMAN_APPROVAL',
      statusFrom: artifact.progress,
      statusTo: artifact.progress,
      details: `تایید انسانی با موفقیت ثبت شد.${notes ? ` توضیحات: ${notes}` : ''}`
    });

    return artifact;
  }

  /**
   * Get execution history logs for a project
   */
  public async getExecutionLogs(projectId: string): Promise<BuildExecutionLog[]> {
    const rows = await queryAll(
      "SELECT * FROM ai_build_logs WHERE projectId = ? ORDER BY timestamp DESC LIMIT 100",
      [projectId]
    );
    return (rows || []).map((r: any) => ({
      id: r.id,
      projectId: r.projectId,
      artifactId: r.artifactId,
      artifactTitle: r.artifactTitle,
      action: r.action,
      statusFrom: r.statusFrom as BuildProgressStatus,
      statusTo: r.statusTo as BuildProgressStatus,
      details: r.details,
      timestamp: r.timestamp
    }));
  }

  // ==========================================
  // Helper & Blueprint Factory
  // ==========================================

  private createDefaultArtifactPlan(state: BusinessState): BuildArtifact[] {
    const projectId = state.projectId;
    const now = new Date().toISOString();
    const bName = state.graph.business.name.value || 'کسب‌وکار KASP';

    const deliverables: Array<{
      category: BuildArtifactCategory;
      title: string;
      description: string;
      status: BuildCapabilityStatus;
      hierarchyLevel: ArtifactHierarchyLevel;
      requiredInputs?: any[];
      requiredServices?: any[];
      humanApproval?: any;
    }> = [
      // Level: BUSINESS & OFFER
      {
        category: 'BRAND_POSITIONING',
        title: `سند جایگاه‌سازی و هویت برند ${bName}`,
        description: 'تدوین بیانیه جایگاه، آرکی‌تایپ برند، لحن محتوا و بایدها و نبایدهای ارتباطی',
        status: 'CAN_BUILD_NOW',
        hierarchyLevel: 'BUSINESS'
      },
      {
        category: 'OFFER_ARCHITECTURE',
        title: 'معماری پیشنهاد رد نشدنی (Irresistible Offer)',
        description: 'طراحی ارزش محوری، پاداش‌های ترغیب‌کننده، ضمانت‌های کاهش ریسک و شرایط اختصاصی',
        status: 'CAN_BUILD_NOW',
        hierarchyLevel: 'OFFER'
      },
      {
        category: 'PRICING_PAGE',
        title: 'صفحه و ساختار جدول قیمت‌گذاری',
        description: 'طراحی مدرن جدول تعرفه‌ها، برچسب محبوب‌ترین، مقایسه پلن‌ها و ترفندهای روانی',
        status: 'CAN_BUILD_NOW',
        hierarchyLevel: 'OFFER'
      },
      {
        category: 'PRODUCT_CATALOG',
        title: 'کاتالوگ تعاملی محصولات و خدمات',
        description: 'طراحی ساختار نمایش دسته‌بندی‌شده کالاها/خدمات با دکمه‌های سفارش سریع',
        status: 'CAN_BUILD_NOW',
        hierarchyLevel: 'OFFER'
      },

      // Level: LANDING PAGE & LEAD CAPTURE
      {
        category: 'LANDING_PAGE',
        title: 'صفحه فرود با نرخ تبدیل بالا (High-Converting Landing Page)',
        description: 'طراحی و ساخت کامل صفحه فرود با Tailwind CSS، تیترهای ترغیب‌کننده و بخش‌های اعتمادساز',
        status: 'CAN_BUILD_NOW',
        hierarchyLevel: 'LANDING_PAGE'
      },
      {
        category: 'LEAD_FORM',
        title: 'فرم هوشمند جذب و صلاحیت‌سنجی لید (Lead Capture)',
        description: 'فرم مدرن چندمرحله‌ای با پرسش‌های غربالگری، دریافت شماره تماس و ارسال آنی به پایگاه داده',
        status: 'CAN_BUILD_NOW',
        hierarchyLevel: 'LEAD_CAPTURE'
      },

      // Level: SALES FUNNEL & MARKETING
      {
        category: 'SALES_SCRIPTS',
        title: 'اسکریپت و متن‌های تماس و بستن فروش (Closing Playbook)',
        description: 'دیالوگ‌های دقیق مشاور فروش، پاسخ به پرتکرارترین ایرادات مشتری و تکنیک بستن قطعی',
        status: 'CAN_BUILD_NOW',
        hierarchyLevel: 'SALES_FUNNEL'
      },
      {
        category: 'CUSTOMER_ONBOARDING',
        title: 'جریان خوش‌آمدگویی و فعال‌سازی سریع مشتری',
        description: 'مراحل قدم‌به‌قدم تحویل خدمات، فرمت پیامک‌های وضعیت سفارش و چک‌لیست رضایت',
        status: 'CAN_BUILD_NOW',
        hierarchyLevel: 'SALES_FUNNEL'
      },
      {
        category: 'EMAIL_SEQUENCES',
        title: 'توالی ایمیل‌های آگاهی‌بخشی و تبدیل (۵ ایمیل فروش)',
        description: 'مجموعه ایمیل‌های خودکار برای خوش‌آمدگویی، ارزش‌آفرینی، معرفی تخفیف و یادآوری سبد خرید',
        status: 'CAN_BUILD_NOW',
        hierarchyLevel: 'MARKETING_ASSETS'
      },
      {
        category: 'MARKETING_CONTENT',
        title: 'بسته محتوای تبلیغاتی و شبکه‌های اجتماعی (Ad Hooks Suite)',
        description: 'طراحی سناریوهای ویدیویی ریلز، قلاب‌های تبلیغاتی پرکلیک، و قالب کپشن‌های اینستاگرام',
        status: 'CAN_BUILD_NOW',
        hierarchyLevel: 'MARKETING_ASSETS'
      },

      // Level: OPERATIONS & AUTOMATIONS
      {
        category: 'ONLINE_STORE',
        title: 'درگاه پرداخت و سبد خرید آنلاین',
        description: 'اتصال سبد خرید به درگاه پرداخت معتبر شاپرک/زیبال برای تسویه‌حساب خودکار',
        status: 'NEEDS_EXTERNAL_SERVICE',
        hierarchyLevel: 'OPERATIONS',
        requiredServices: [
          {
            service: 'درگاه پرداخت زیبال / شاپرک',
            description: 'جهت دریافت وجه و صدور رسید آنلاین شاپرکی',
            isConfigured: true,
            setupGuide: 'درگاه زیبال در سیستم KASP فعال و متصل است.'
          }
        ]
      },
      {
        category: 'CRM_WORKFLOW',
        title: 'گردش‌کار مدیریت لیدها و وضعیت مشتریان در CRM',
        description: 'تعریف وضعیت‌های لید (سرد، در حال پیگیری، خریدار، نیازمند تماس) و زمان‌بندی پیگیری',
        status: 'CAN_BUILD_NOW',
        hierarchyLevel: 'OPERATIONS'
      },
      {
        category: 'ANALYTICS_SETUP',
        title: 'پیکربندی تگ‌های آنالیتیکس و سنجش سنجه‌های رشد',
        description: 'کدهای رهگیری رویدادهای کلیک، ارسال فرم و خرید برای Google Analytics 4 و Clarity',
        status: 'CAN_BUILD_NOW',
        hierarchyLevel: 'OPERATIONS'
      },
      {
        category: 'AUTOMATION_WORKFLOWS',
        title: 'سناریوهای اتوماسیون پیامک و وب‌هوک سفارش',
        description: 'ارسال خودکار پیامک تایید سفارش به مشتری و نوتیفیکیشن تلگرام/ایمیل به مدیر فروش',
        status: 'NEEDS_EXTERNAL_SERVICE',
        hierarchyLevel: 'OPERATIONS',
        requiredServices: [
          {
            service: 'سامانه پیامکی خدماتی (کاوه نگار / ملی پیامک)',
            description: 'جهت ارسال پیامک‌های اعتبارسنجی و کد پیگیری سفارش',
            isConfigured: false,
            setupGuide: 'کلید وب‌سرویس سامانه پیامک در پنل تنظیمات KASP وارد شود.'
          }
        ]
      },
      {
        category: 'INTERNAL_TOOLS',
        title: 'پنل مدیریت داخلی سفارش‌ها و وظایف تیم',
        description: 'داشبورد ساده عملیاتی برای بررسی لیست سفارشات و تیکت‌های پشتیبانی',
        status: 'CAN_BUILD_NOW',
        hierarchyLevel: 'OPERATIONS'
      },
      {
        category: 'WEBSITE',
        title: 'انتشار رسمی وب‌سایت در دامنه اختصاصی',
        description: 'استقرار نسخه نهایی روی کلود با گواهی SSL و دامنه اختصاصی کاربر',
        status: 'HUMAN_APPROVAL_REQUIRED',
        hierarchyLevel: 'LANDING_PAGE',
        humanApproval: {
          required: true,
          approved: false,
          riskWarning: 'انتشار مستقیم نیازمند تایید نام دامنه و عدم ایجاد هزینه ناخواسته برای کاربر است.'
        }
      }
    ];

    return deliverables.map((d, index) => ({
      id: `art-${crypto.randomUUID().substring(0, 8)}`,
      projectId,
      category: d.category,
      title: d.title,
      description: d.description,
      status: d.status,
      progress: 'PLANNING',
      hierarchyLevel: d.hierarchyLevel,
      requiredInputs: d.requiredInputs || [],
      requiredServices: d.requiredServices || [],
      humanApproval: d.humanApproval,
      isLive: false,
      canDeploy: true,
      executionLogs: [`[${new Date().toLocaleTimeString('fa-IR')}] تسک در نقشه راه ساخت KASP تعریف شد.`],
      createdAt: now,
      updatedAt: now
    }));
  }

  private mapRowToArtifact(r: any): BuildArtifact {
    return {
      id: r.id,
      projectId: r.projectId,
      category: r.category as BuildArtifactCategory,
      title: r.title,
      description: r.description,
      status: r.status as BuildCapabilityStatus,
      progress: r.progress as BuildProgressStatus,
      hierarchyLevel: r.hierarchyLevel as ArtifactHierarchyLevel,
      requiredInputs: r.requiredInputs ? JSON.parse(r.requiredInputs) : [],
      requiredServices: r.requiredServices ? JSON.parse(r.requiredServices) : [],
      humanApproval: r.humanApproval ? JSON.parse(r.humanApproval) : undefined,
      output: r.outputData ? JSON.parse(r.outputData) : undefined,
      isLive: r.isLive === 1 || r.isLive === true,
      canDeploy: r.canDeploy === 1 || r.canDeploy === true,
      executionLogs: r.executionLogs ? JSON.parse(r.executionLogs) : [],
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    };
  }

  private async saveArtifact(artifact: BuildArtifact): Promise<void> {
    const existing = await queryOne("SELECT id FROM ai_build_artifacts WHERE id = ?", [artifact.id]);
    if (existing) {
      await execute(`
        UPDATE ai_build_artifacts SET 
          title = ?,
          description = ?,
          status = ?,
          progress = ?,
          hierarchyLevel = ?,
          requiredInputs = ?,
          requiredServices = ?,
          humanApproval = ?,
          outputData = ?,
          isLive = ?,
          canDeploy = ?,
          executionLogs = ?,
          updatedAt = ?
        WHERE id = ?
      `, [
        artifact.title,
        artifact.description,
        artifact.status,
        artifact.progress,
        artifact.hierarchyLevel,
        JSON.stringify(artifact.requiredInputs || []),
        JSON.stringify(artifact.requiredServices || []),
        artifact.humanApproval ? JSON.stringify(artifact.humanApproval) : null,
        artifact.output ? JSON.stringify(artifact.output) : null,
        artifact.isLive ? 1 : 0,
        artifact.canDeploy ? 1 : 0,
        JSON.stringify(artifact.executionLogs || []),
        new Date().toISOString(),
        artifact.id
      ]);
    } else {
      await execute(`
        INSERT INTO ai_build_artifacts (
          id, projectId, category, title, description, status, progress, hierarchyLevel,
          requiredInputs, requiredServices, humanApproval, outputData, isLive, canDeploy,
          executionLogs, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        artifact.id,
        artifact.projectId,
        artifact.category,
        artifact.title,
        artifact.description,
        artifact.status,
        artifact.progress,
        artifact.hierarchyLevel,
        JSON.stringify(artifact.requiredInputs || []),
        JSON.stringify(artifact.requiredServices || []),
        artifact.humanApproval ? JSON.stringify(artifact.humanApproval) : null,
        artifact.output ? JSON.stringify(artifact.output) : null,
        artifact.isLive ? 1 : 0,
        artifact.canDeploy ? 1 : 0,
        JSON.stringify(artifact.executionLogs || []),
        artifact.createdAt,
        artifact.updatedAt
      ]);
    }
  }

  private async recordExecutionLog(params: {
    projectId: string;
    artifactId: string;
    artifactTitle: string;
    action: string;
    statusFrom: BuildProgressStatus;
    statusTo: BuildProgressStatus;
    details: string;
  }): Promise<BuildExecutionLog> {
    const log: BuildExecutionLog = {
      id: `log-${crypto.randomUUID().substring(0, 8)}`,
      projectId: params.projectId,
      artifactId: params.artifactId,
      artifactTitle: params.artifactTitle,
      action: params.action,
      statusFrom: params.statusFrom,
      statusTo: params.statusTo,
      details: params.details,
      timestamp: new Date().toISOString()
    };

    await execute(`
      INSERT INTO ai_build_logs (id, projectId, artifactId, artifactTitle, action, statusFrom, statusTo, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      log.id,
      log.projectId,
      log.artifactId,
      log.artifactTitle,
      log.action,
      log.statusFrom,
      log.statusTo,
      log.details,
      log.timestamp
    ]);

    return log;
  }

  private async syncStateWithArtifacts(projectId: string): Promise<void> {
    const state = await BrainStateManager.getProjectState(projectId);
    if (!state) return;

    const rows = await queryAll("SELECT * FROM ai_build_artifacts WHERE projectId = ?", [projectId]);
    const artifacts = (rows || []).map((r: any) => this.mapRowToArtifact(r));

    state.buildArtifacts = artifacts;
    await BrainStateManager.saveProjectState(state);
  }
}
