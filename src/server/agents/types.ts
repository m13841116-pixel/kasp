export type AgentRole = 'manager' | 'research' | 'competitor' | 'customer' | 'marketing';

export interface AgentInput<T = any> {
  goal: string;
  businessDomain?: string;
  contextData?: T;
}

export interface AgentResult<T = any> {
  success: boolean;
  role: AgentRole;
  agentName: string;
  data: T;
  executionTimeMs?: number;
  error?: string;
}

export interface AgentInterface<TInput = any, TOutput = any> {
  role: AgentRole;
  name: string;
  instructions: string;
  execute(input: AgentInput<TInput>): Promise<AgentResult<TOutput>>;
}

export interface TargetPersona {
  personaName: string;
  demographics: string;
  painPoints: string[];
  buyingTriggers: string[];
}

export interface CompetitorAnalysisItem {
  name: string;
  strengths: string;
  weaknesses: string;
  ourAdvantage: string;
}

export interface GroundingSource {
  title: string;
  url: string;
  claim: string;
}

export interface PricingStrategy {
  pricingModel: string;
  suggestedPriceRange: string;
  grossMarginEstimate: string;
  psychologicalTactics: string[];
  promotionsAndOffers: string[];
}

export interface ActionPlanItem {
  timeframe: string;
  action: string;
  objective: string;
  kpi: string;
  priority: 'فوری و ضروری (P0)' | 'اولویت بالا (P1)' | 'بهینه‌سازی (P2)';
}

export interface KaspScore {
  marketOpportunity: number;
  competition: number;
  customerDemand: number;
  executionDifficulty: number;
  marketingPotential: number;
  totalOpportunityScore: number;
  scoreRationale: string;
}

export type VerdictStatus = 'GO' | 'TEST_FIRST' | 'NO_GO';

export interface KaspVerdict {
  status: VerdictStatus;
  badge: '🟢 GO' | '🟡 TEST FIRST' | '🔴 NO-GO';
  title: string;
  rationale: string;
  keyAssumptionsToValidate: string[];
}

export interface ResearchOutput {
  marketOverview: string;
  targetAudience: TargetPersona[];
  competitors: CompetitorAnalysisItem[];
  marketOpportunities: string[];
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  positioningStatement: string;
  criticalRisks: string[];
  groundedFactsVsEstimates: {
    verifiedFacts: string[];
    groundedEstimates: string[];
    modelInferences?: string[];
  };
  sources: GroundingSource[];
  searchGroundingStatus: string;
}

export interface AdConcept {
  hook: string;
  targetAngle: string;
  format: string;
  channel: string;
}

export interface ContentIdea {
  title: string;
  contentType: string;
  captionDraft: string;
  cta: string;
}

export interface CampaignSuggestion {
  title: string;
  objective: string;
  timeline: string;
  expectedKpi: string;
}

export interface MarketingOutput {
  uniqueSellingProposition: string;
  brandVoiceAndCoreMessage: string;
  salesStrategy: {
    funnelSteps: string[];
    pricingModelSuggestion: string;
    closingTactics: string[];
  };
  advertisingIdeas: AdConcept[];
  contentIdeasAndCaptions: ContentIdea[];
  suggestedCampaigns: CampaignSuggestion[];
  primaryChannels: {
    channel: string;
    rationale: string;
    priority: 'high' | 'medium';
  }[];
}

export interface ManagerPlan {
  extractedGoal: string;
  businessDomain: string;
  coreChallenges: string[];
  researchDirectives: string[];
  marketingDirectives: string[];
}

export interface FinalBusinessReport {
  id: string;
  businessGoal: string;
  createdAt: string;
  isPublic?: boolean;

  // 14 Core Sections of KASP Business Intelligence Report
  executiveSummary: string; // 1. خلاصه اجرایی
  ideaAndProductAnalysis: string; // 2. تحلیل ایده / محصول
  targetCustomers: { // 3. مشتریان هدف و پرسونا
    summary: string;
    personas: TargetPersona[];
  };
  marketStatus: string; // 4. تحلیل بازار
  competitors: { // 5. تحلیل رقبا
    summary: string;
    list: CompetitorAnalysisItem[];
  };
  coreOpportunities: string[]; // 6. فرصت‌های اصلی
  valueProposition: string; // 7. پیشنهاد ارزش و USP
  pricingStrategy: PricingStrategy; // 8. استراتژی قیمت‌گذاری
  customerAcquisitionStrategy: { // 9. استراتژی جذب مشتری
    primaryChannels: { channel: string; rationale: string; priority: string }[];
    funnel: string[];
    closingTactics: string[];
  };
  advertisingAndContent: { // 10. ایده‌های تبلیغاتی و محتوایی
    adConcepts: AdConcept[];
    contentIdeas: ContentIdea[];
    campaigns: CampaignSuggestion[];
  };
  actionPlan30Days: ActionPlanItem[]; // 11. برنامه اجرایی ۳۰ روزه
  risksAndChallenges: { // 12. ریسک‌ها و راهکار کاهش ریسک
    criticalRisks: string[];
    mitigationPlan: string[];
  };
  kaspVerdict: KaspVerdict; // 13. نتیجه نهایی KASP
  kaspScore: KaspScore; // امتیازدهی KASP
  managerDirectAdvice?: string; // 15. اگر من جای شما بودم... (توصیه بی‌پرده و استراتژیک مدیر KASP)
  groundedFactsVsEstimates?: { // 14. منابع، شواهد و تفکیک داده‌ها
    verifiedFacts: string[];
    groundedEstimates: string[];
    modelInferences?: string[];
  };
  sources?: GroundingSource[];
  searchGroundingStatus?: string;

  // Backward compatibility fields
  salesStrategy: {
    funnel: string[];
    pricingModel: string;
    closingTactics: string[];
  };
  marketingStrategyAndChannels: {
    brandVoice: string;
    channels: { channel: string; rationale: string; priority: string }[];
    campaigns: CampaignSuggestion[];
  };
  advertisingIdeas: AdConcept[];
  contentStrategyAndCaptions: ContentIdea[];
  nextActionableSteps: string[];
  kaspRecommendations: {
    softwareSolution: string;
    recommendedTechStack: string;
    estimatedLaunchTimeline: string;
    actionSteps: string[];
  };
}
