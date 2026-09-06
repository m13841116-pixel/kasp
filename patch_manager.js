import fs from 'fs';
let code = fs.readFileSync('src/server/agents/manager.ts', 'utf8');

code = code.replace(
/export interface WorkflowStageEvent \{[\s\S]*?\}/,
`export interface WorkflowStageEvent {
  stage: 
    | 'manager_planning'
    | 'research_started'
    | 'research_completed'
    | 'competitor_started'
    | 'competitor_completed'
    | 'customer_started'
    | 'customer_completed'
    | 'marketing_started'
    | 'marketing_completed'
    | 'manager_synthesis'
    | 'finished';
  title: string;
  description: string;
  progressPercent: number;
  timestamp: number;
  partialData?: any;
}`
);

fs.writeFileSync('src/server/agents/manager.ts', code);
