/**
 * KASP BUSINESS BRAIN — CORE DOMAIN TYPES
 * 
 * Epistemic Knowledge Representation and Dynamic Business Graph
 * Supporting the 7-Step Autonomous Business Operating System:
 * UNDERSTAND → RESEARCH → DESIGN → BUILD → LAUNCH → MEASURE → IMPROVE
 */

export type EpistemicStatus = 
  | 'FACT' 
  | 'SEARCH_GROUNDED' 
  | 'INFERENCE' 
  | 'ESTIMATE' 
  | 'USER_PROVIDED';

export interface EpistemicClaim<T = any> {
  value: T;
  epistemicType: EpistemicStatus;
  confidence: number; // 0.0 to 1.0
  source?: string;
  sourceUrl?: string;
  verifiedAt?: string;
  notes?: string;
}

export type BusinessLoopStage = 
  | 'UNDERSTAND' 
  | 'RESEARCH' 
  | 'DESIGN' 
  | 'BUILD' 
  | 'LAUNCH' 
  | 'MEASURE' 
  | 'IMPROVE';

// 1. Business Identity Node
export interface BusinessNode {
  name: EpistemicClaim<string>;
  domain: EpistemicClaim<string>;
  mission: EpistemicClaim<string>;
  currentLoopStage: BusinessLoopStage;
  maturityLevel: 'IDEA' | 'MVP_READY' | 'LAUNCHED' | 'SCALING';
}

// 2. Offer Architecture Node
export interface OfferNode {
  coreValueProposition: EpistemicClaim<string>;
  problemSolved: EpistemicClaim<string>;
  solutionDescription: EpistemicClaim<string>;
  primaryDeliverables: EpistemicClaim<string[]>;
  guaranteesAndTrustBuilders: EpistemicClaim<string[]>;
}

// 3. Product Specification Node
export interface ProductNode {
  name: EpistemicClaim<string>;
  productType: 'DIGITAL_PRODUCT' | 'PHYSICAL_GOODS' | 'SERVICE' | 'SAAS' | 'MARKETPLACE' | 'CONSULTING';
  mvpFeatures: EpistemicClaim<string[]>;
  deliveryMechanism: EpistemicClaim<string>;
  futurePhases: EpistemicClaim<string[]>;
}

// 4. Customer & Persona Node
export interface CustomerPersona {
  name: string;
  role: string;
  demographics: string;
  painPoints: string[];
  buyingTriggers: string[];
  willingnessToPay: string;
}

export interface CustomerNode {
  primaryTarget: EpistemicClaim<string>;
  personas: EpistemicClaim<CustomerPersona[]>;
  customerUrgency: EpistemicClaim<'HIGH' | 'MEDIUM' | 'LOW'>;
  commonObjections: EpistemicClaim<string[]>;
}

// 5. Market Dynamics Node
export interface MarketNode {
  marketOverview: EpistemicClaim<string>;
  tamSamSomEstimate: EpistemicClaim<{ tam: string; sam: string; som: string }>;
  marketTrends: EpistemicClaim<string[]>;
  timingRationale: EpistemicClaim<string>;
  regulationsAndCompliance: EpistemicClaim<string[]>;
}

// 6. Competitors Node
export interface CompetitorItem {
  name: string;
  strengths: string[];
  weaknesses: string[];
  pricingRange?: string;
  ourAdvantage: string;
}

export interface CompetitorsNode {
  summary: EpistemicClaim<string>;
  directCompetitors: EpistemicClaim<CompetitorItem[]>;
  indirectCompetitors: EpistemicClaim<CompetitorItem[]>;
  defensibleMoat: EpistemicClaim<string>;
}

// 7. Pricing Architecture Node
export interface PricingNode {
  pricingModel: EpistemicClaim<string>;
  suggestedPriceRange: EpistemicClaim<string>;
  grossMarginEstimate: EpistemicClaim<string>;
  tierBreakdown: EpistemicClaim<Array<{ tier: string; price: string; features: string[] }>>;
  discountsAndPsychology: EpistemicClaim<string[]>;
}

// 8. Unit Economics Node
export interface UnitEconomicsNode {
  estimatedCac: EpistemicClaim<string>;
  estimatedLtv: EpistemicClaim<string>;
  ltvToCacRatio: EpistemicClaim<string>;
  paybackPeriodMonths: EpistemicClaim<string>;
  contributionMarginPercent: EpistemicClaim<string>;
}

// 9. Distribution Channels Node
export interface DistributionChannel {
  channel: string;
  type: 'ORGANIC' | 'PAID' | 'PARTNERSHIP' | 'DIRECT' | 'OUTBOUND';
  priority: 'P0' | 'P1' | 'P2';
  expectedCacRange: string;
  rationale: string;
}

export interface DistributionNode {
  primaryChannels: EpistemicClaim<DistributionChannel[]>;
  partnershipOpportunities: EpistemicClaim<string[]>;
  organicFlywheelStrategy: EpistemicClaim<string>;
}

// 10. Marketing Strategy Node
export interface MarketingNode {
  uniqueSellingProposition: EpistemicClaim<string>;
  brandVoiceAndTone: EpistemicClaim<string>;
  coreMessage: EpistemicClaim<string>;
  campaignConcepts: EpistemicClaim<Array<{ title: string; objective: string; timeline: string; kpi: string }>>;
  contentPillars: EpistemicClaim<string[]>;
}

// 11. Sales Funnel Node
export interface SalesFunnelNode {
  topOfFunnelLeadMagnet: EpistemicClaim<string>;
  middleOfFunnelNurturing: EpistemicClaim<string[]>;
  bottomOfFunnelClosing: EpistemicClaim<string[]>;
  conversionOptimizationTactics: EpistemicClaim<string[]>;
}

// 12. Operations & Fulfillment Node
export interface OperationsNode {
  fulfillmentWorkflow: EpistemicClaim<string[]>;
  keyToolsAndSoftware: EpistemicClaim<string[]>;
  bottlenecksAndLimits: EpistemicClaim<string[]>;
  automationOpportunities: EpistemicClaim<string[]>;
}

// 13. Technology Stack Node
export interface TechnologyNode {
  architectureType: EpistemicClaim<string>;
  coreStack: EpistemicClaim<string[]>;
  thirdPartyIntegrations: EpistemicClaim<string[]>;
  estimatedInfrastructureCost: EpistemicClaim<string>;
}

// 14. Brand Identity Node
export interface BrandNode {
  brandArchetype: EpistemicClaim<string>;
  positioningStatement: EpistemicClaim<string>;
  visualIdentityNotes: EpistemicClaim<string>;
  doAndDontRules: EpistemicClaim<string[]>;
}

// 15. Risks & Mitigation Node
export interface RiskItem {
  risk: string;
  category: 'MARKET' | 'FINANCIAL' | 'EXECUTION' | 'REGULATORY' | 'COMPETITIVE';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  likelihood: 'HIGH' | 'MEDIUM' | 'LOW';
  mitigationStrategy: string;
}

export interface RisksNode {
  criticalRisks: EpistemicClaim<RiskItem[]>;
  killTriggers: EpistemicClaim<string[]>;
}

// 16. Experiments Node
export interface ExperimentItem {
  id: string;
  title: string;
  hypothesis: string;
  testMethod: string;
  metricToTrack: string;
  successThreshold: string;
  durationDays: number;
  status: 'PROPOSED' | 'RUNNING' | 'VALIDATED' | 'FAILED';
}

export interface ExperimentsNode {
  validationExperiments: EpistemicClaim<ExperimentItem[]>;
}

// 17. KPIs & Milestones Node
export interface KPIItem {
  name: string;
  category: 'NORTH_STAR' | 'FINANCIAL' | 'ACQUISITION' | 'RETENTION';
  currentValue?: string;
  target30Days: string;
  target90Days: string;
}

export interface KPIsNode {
  northStarMetric: EpistemicClaim<string>;
  keyMetrics: EpistemicClaim<KPIItem[]>;
}

// 18. Tasks Roadmap Node
export interface TaskItem {
  id: string;
  title: string;
  timeframe: string;
  priority: 'P0' | 'P1' | 'P2';
  stage: BusinessLoopStage;
  agentRole: 'manager' | 'research' | 'competitor' | 'customer' | 'marketing' | 'builder';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
  blockerReason?: string;
  acceptanceCriteria: string;
}

export interface TasksNode {
  roadmap: EpistemicClaim<TaskItem[]>;
}

// 19. Assets Node
export interface AssetSnippet {
  id: string;
  title: string;
  category: 'AD_HOOK' | 'HEADLINE' | 'LANDING_PAGE_COPY' | 'EMAIL_DRAFT' | 'PROPOSITION_SCRIPT';
  content: string;
}

export interface AssetsNode {
  generatedAssets: EpistemicClaim<AssetSnippet[]>;
}

// Comprehensive Business Graph
export interface BusinessGraph {
  business: BusinessNode;
  offer: OfferNode;
  product: ProductNode;
  customer: CustomerNode;
  market: MarketNode;
  competitors: CompetitorsNode;
  pricing: PricingNode;
  unitEconomics: UnitEconomicsNode;
  distribution: DistributionNode;
  marketing: MarketingNode;
  salesFunnel: SalesFunnelNode;
  operations: OperationsNode;
  technology: TechnologyNode;
  brand: BrandNode;
  risks: RisksNode;
  experiments: ExperimentsNode;
  kpis: KPIsNode;
  tasks: TasksNode;
  assets: AssetsNode;
}

// Manager's 8 Executive Answers
export interface ExecutiveQA {
  whatAreWeBuilding: string;
  whyAreWeBuildingIt: string;
  whoIsItFor: string;
  whatEvidenceSupportsIt: string[];
  whatIsCurrentlyUncertain: string[];
  whatShouldHappenNext: string[];
  whatHasAlreadyBeenDone: string[];
  whatIsBlocked: string[];
}

// Project Persistent Memory & State
export interface DecisionLogEntry {
  id: string;
  timestamp: string;
  stage: BusinessLoopStage;
  decision: string;
  rationale: string;
  epistemicType: EpistemicStatus;
}

export interface AssumptionEntry {
  id: string;
  assumption: string;
  testMethod: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'UNTESTED' | 'VALIDATED' | 'INVALIDATED';
  validatedEvidence?: string;
}

export interface ExecutiveMemory {
  answers: ExecutiveQA;
  decisionsLog: DecisionLogEntry[];
  assumptionsToValidate: AssumptionEntry[];
  founderNotes?: string[];
}

export interface BusinessState {
  projectId: string;
  userId: string;
  currentStage: BusinessLoopStage;
  completedStages: BusinessLoopStage[];
  graph: BusinessGraph;
  executiveMemory: ExecutiveMemory;
  buildArtifacts?: BuildArtifact[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// KASP BUILD MODE (EXECUTION OPERATING SYSTEM)
// ==========================================

export type BuildCapabilityStatus = 
  | 'CAN_BUILD_NOW' 
  | 'NEEDS_USER_INPUT' 
  | 'NEEDS_EXTERNAL_SERVICE' 
  | 'HUMAN_APPROVAL_REQUIRED' 
  | 'NOT_SUPPORTED';

export type BuildProgressStatus = 
  | 'PLANNING' 
  | 'RESEARCHING' 
  | 'BUILDING' 
  | 'TESTING' 
  | 'READY';

export type BuildArtifactCategory =
  | 'WEBSITE'
  | 'LANDING_PAGE'
  | 'ONLINE_STORE'
  | 'PRODUCT_CATALOG'
  | 'BRAND_POSITIONING'
  | 'OFFER_ARCHITECTURE'
  | 'PRICING_PAGE'
  | 'LEAD_FORM'
  | 'CRM_WORKFLOW'
  | 'EMAIL_SEQUENCES'
  | 'MARKETING_CONTENT'
  | 'SALES_SCRIPTS'
  | 'ANALYTICS_SETUP'
  | 'CUSTOMER_ONBOARDING'
  | 'INTERNAL_TOOLS'
  | 'AUTOMATION_WORKFLOWS';

export type ArtifactHierarchyLevel = 
  | 'BUSINESS' 
  | 'OFFER' 
  | 'LANDING_PAGE' 
  | 'LEAD_CAPTURE' 
  | 'SALES_FUNNEL' 
  | 'MARKETING_ASSETS'
  | 'OPERATIONS';

export interface BuildRequiredInput {
  field: string;
  label: string;
  placeholder: string;
  value?: string;
  required: boolean;
}

export interface BuildRequiredService {
  service: string;
  description: string;
  isConfigured: boolean;
  setupGuide: string;
}

export interface BuildHumanApproval {
  required: boolean;
  approved: boolean;
  approvedAt?: string;
  notes?: string;
  riskWarning?: string;
}

export interface BuildArtifactOutput {
  type: 'REACT_HTML_COMPONENT' | 'DOCUMENT' | 'WORKFLOW_JSON' | 'CODE_SNIPPET' | 'PROMPT_TEMPLATE';
  content: string;
  previewHtml?: string;
  metadata?: Record<string, any>;
}

export interface BuildArtifact {
  id: string;
  projectId: string;
  category: BuildArtifactCategory;
  title: string;
  description: string;
  status: BuildCapabilityStatus;
  progress: BuildProgressStatus;
  hierarchyLevel: ArtifactHierarchyLevel;
  requiredInputs?: BuildRequiredInput[];
  requiredServices?: BuildRequiredService[];
  humanApproval?: BuildHumanApproval;
  output?: BuildArtifactOutput;
  isLive: boolean;
  canDeploy: boolean;
  executionLogs?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BuildExecutionPlan {
  projectId: string;
  businessGoal: string;
  businessName: string;
  items: BuildArtifact[];
  overallProgress: number;
  stats: {
    total: number;
    canBuildNow: number;
    needsInput: number;
    needsService: number;
    humanApprovalRequired: number;
    ready: number;
  };
  generatedAt: string;
}

export interface BuildExecutionLog {
  id: string;
  projectId: string;
  artifactId: string;
  artifactTitle: string;
  action: string;
  statusFrom: BuildProgressStatus;
  statusTo: BuildProgressStatus;
  details: string;
  timestamp: string;
}

// -------------------------------------------------------------
// KASP VOICE ADVISOR TYPES
// -------------------------------------------------------------

export interface VoiceBriefingSection {
  title: string;
  key: 'whatItIs' | 'kaspPerspective' | 'biggestOpportunity' | 'biggestRisk' | 'nextThreeActions' | 'ifKaspWereFounder';
  spokenText: string;
  summaryBullet: string;
}

export interface VoiceBriefing {
  id: string;
  projectId: string;
  userId?: string;
  businessName: string;
  headline: string;
  sections: {
    whatItIs: VoiceBriefingSection;
    kaspPerspective: VoiceBriefingSection;
    biggestOpportunity: VoiceBriefingSection;
    biggestRisk: VoiceBriefingSection;
    nextThreeActions: VoiceBriefingSection & { actions: string[] };
    ifKaspWereFounder: VoiceBriefingSection;
  };
  fullTranscript: string;
  audioBase64?: string;
  audioMimeType?: string;
  audioDurationSeconds?: number;
  voiceName?: string;
  generatedAt: string;
}

export interface VoiceInteractionMessage {
  id: string;
  sender: 'user' | 'advisor';
  text: string;
  audioBase64?: string;
  timestamp: string;
}

export interface VoiceInteractionRequest {
  projectId: string;
  userSpeechText: string;
  contextMode?: 'strategic' | 'tactical' | 'financial' | 'general';
}

export interface VoiceInteractionResponse {
  spokenResponse: string;
  bulletSummary?: string;
  audioBase64?: string;
  audioMimeType?: string;
  relevantGraphNode?: string;
  suggestedFollowUps?: string[];
  timestamp: string;
}

// =============================================================
// KASP AUTONOMOUS EXECUTION LAYER TYPES
// =============================================================

export type AutonomousTaskKey =
  | 'research_market'
  | 'define_customer'
  | 'define_offer'
  | 'analyze_competitors'
  | 'choose_positioning'
  | 'recommend_pricing'
  | 'create_landing_page'
  | 'create_product_structure'
  | 'create_marketing_assets'
  | 'create_sales_funnel'
  | 'create_launch_checklist'
  | 'track_results'
  | 'recommend_improvements';

export type WorkforceAgentRole = 
  | 'manager' 
  | 'research' 
  | 'competitor' 
  | 'customer' 
  | 'marketing' 
  | 'builder' 
  | 'operations'
  | 'growth';

export type TaskExecutionStatus = 'QUEUED' | 'ACTIVE' | 'BLOCKED' | 'COMPLETED';

export interface ExecutionTaskOutput {
  summary: string;
  content: string;
  codeOrHtml?: string;
  deliverableType: 'HTML_PAGE' | 'PRODUCT_CATALOG' | 'MARKETING_KIT' | 'STRATEGY_DOC' | 'CHECKLIST' | 'FUNNEL_MAP' | 'INTEGRATION_CONFIG';
  actionableNextStep?: string;
  metadata?: Record<string, any>;
}

export interface ExecutionTask {
  id: string;
  taskKey: AutonomousTaskKey | string;
  title: string;
  description: string;
  stageSequence: number; // 1 to 13
  stageName: string;
  agentRole: WorkforceAgentRole;
  priority: 'P0' | 'P1' | 'P2';
  status: TaskExecutionStatus;
  blockerReason?: string;
  requiresApproval?: boolean;
  approvalActionKey?: ApprovalActionKey;
  approvalId?: string;
  output?: ExecutionTaskOutput;
  executionLogs: string[];
  estimatedMinutes: number;
  startedAt?: string;
  completedAt?: string;
}

export type ApprovalActionKey =
  | 'publish_website'
  | 'spend_ad_budget'
  | 'send_customer_messages'
  | 'create_paid_account'
  | 'connect_payment_gateway'
  | 'place_inventory_order'
  | 'make_financial_commitment';

export interface ApprovalRequest {
  id: string;
  projectId: string;
  userId?: string;
  actionKey: ApprovalActionKey;
  title: string;
  recommendationReason: string; // Why KASP recommends this action
  expectedResult: string;        // Expected result
  riskAssessment: string;        // Risk
  estimatedCost: string;         // Estimated cost
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  executionResult?: string;
  approvedAt?: string;
  executedAt?: string;
  createdAt: string;
}

export interface BusinessLearningEntry {
  id: string;
  timestamp: string;
  category: 'MARKET_INSIGHT' | 'CUSTOMER_BEHAVIOR' | 'PRICING_DYNAMICS' | 'COMPETITIVE_EDGE' | 'CONVERSION_LEARNING' | 'OPERATIONAL_EFFICIENCY';
  sourceTask: string;
  hypothesis: string;
  finding: string;
  strategicTakeaway: string;
  impactScore: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ProjectPhase {
  phaseNumber: number;
  title: string;
  description: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
  taskKeys: string[];
}

export interface AutonomousExecutionMetrics {
  overallProgress: number; // 0-100%
  businessReadinessScore: number; // 0-100%
  executionVelocity: string;
  totalTasksCount: number;
  completedTasksCount: number;
  queuedTasksCount: number;
  blockedTasksCount: number;
  pendingApprovalsCount: number;
  estimatedCac: string;
  estimatedLtv: string;
  launchChecklistReadiness: number;
}

export interface NextRecommendedAction {
  task: ExecutionTask;
  why: string;
  expectedImpact: string;
  agentRole: WorkforceAgentRole;
  confidence: number;
  isApprovalRequired: boolean;
}

export interface AutonomousExecutionState {
  projectId: string;
  userId: string;
  businessName: string;
  goal: string;
  currentState: {
    summary: string;
    stage: string;
    maturityLevel: 'IDEA' | 'VALIDATING' | 'MVP_READY' | 'LAUNCH_READY' | 'SCALING';
    validatedPillars: string[];
    currentBottleneck?: string;
    lastExecutedTaskTitle?: string;
  };
  targetState: {
    summary: string;
    horizon: string;
    targetMilestone: string;
    revenueOrCustomerTarget?: string;
    successCriteria: string[];
  };
  plan: {
    phases: ProjectPhase[];
    totalPhases: number;
    activePhaseNumber: number;
  };
  taskQueue: ExecutionTask[];
  activeTask: ExecutionTask | null;
  blockedTasks: ExecutionTask[];
  completedTasks: ExecutionTask[];
  metrics: AutonomousExecutionMetrics;
  learning: BusinessLearningEntry[];
  approvals: ApprovalRequest[];
  nextRecommendedTask: NextRecommendedAction | null;
  updatedAt: string;
}



