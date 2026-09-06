import fs from 'fs';
let code = fs.readFileSync('src/server/agents/manager.ts', 'utf8');

// Also update constructor
code = code.replace(
  /private researchAgent: ResearchAgent;\s+private marketingAgent: MarketingAgent;\s+constructor\(\) \{\s+this\.researchAgent = new ResearchAgent\(\);\s+this\.marketingAgent = new MarketingAgent\(\);\s+\}/,
  `private researchAgent: ResearchAgent;
  private competitorAgent: CompetitorAgent;
  private customerAgent: CustomerAgent;
  private marketingAgent: MarketingAgent;

  constructor() {
    this.researchAgent = new ResearchAgent();
    this.competitorAgent = new CompetitorAgent();
    this.customerAgent = new CustomerAgent();
    this.marketingAgent = new MarketingAgent();
  }`
);

// We need to replace the entire `execute` method
const executeReplacement = `async execute(
    input: AgentInput,
    onStageUpdate?: (event: WorkflowStageEvent) => void
  ): Promise<AgentResult<FinalBusinessReport>> {
    const startTime = Date.now();
    const projectId = \`proj-\${crypto.randomUUID()}\`;
    const rawGoal = input.goal.trim();

    // 1. Manager Planning
    if (onStageUpdate) {
      onStageUpdate({
        stage: 'manager_planning',
        title: 'مدیر KASP در حال تحلیل هدف و تدوین وظایف...',
        description: 'استخراج هدف تجاری، تعیین نیازمندی‌های اطلاعاتی و تفکیک ماموریت بین واحد تحقیق، رقبا، مخاطبان و بازاریابی',
        progressPercent: 10,
        timestamp: Date.now(),
      });
    }

    const plan = await this.planDirectives(rawGoal);

    // 2. Dispatch to Research Unit
    if (onStageUpdate) {
      onStageUpdate({
        stage: 'research_started',
        title: 'واحد تحقیق در حال بررسی بازار و روندها...',
        description: 'بررسی اندازه تقاضا و فرصت‌های بکر بازار',
        progressPercent: 25,
        timestamp: Date.now(),
      });
    }

    const researchResult = await this.researchAgent.execute({
      goal: plan.extractedGoal,
      businessDomain: plan.businessDomain,
      contextData: { directives: plan.researchDirectives }
    });

    if (onStageUpdate) {
      onStageUpdate({
        stage: 'research_completed',
        title: 'تحقیقات بازار با موفقیت تکمیل شد',
        description: 'روندها و اطلاعات کلیدی بازار استخراج شدند.',
        progressPercent: 35,
        timestamp: Date.now(),
        partialData: { research: researchResult.data }
      });
    }

    // 3. Dispatch to Competitor Unit
    if (onStageUpdate) {
      onStageUpdate({
        stage: 'competitor_started',
        title: 'واحد رقبا در حال تحلیل رقبا...',
        description: 'شناسایی و بررسی نقاط قوت و ضعف رقبا',
        progressPercent: 45,
        timestamp: Date.now(),
      });
    }

    const competitorResult = await this.competitorAgent.execute({
      goal: plan.extractedGoal,
      businessDomain: plan.businessDomain
    });

    if (onStageUpdate) {
      onStageUpdate({
        stage: 'competitor_completed',
        title: 'تحلیل رقبا تکمیل شد',
        description: 'نقاط ضعف و قوت رقبا استخراج شدند.',
        progressPercent: 55,
        timestamp: Date.now(),
        partialData: { competitor: competitorResult.data }
      });
    }

    // 4. Dispatch to Customer Unit
    if (onStageUpdate) {
      onStageUpdate({
        stage: 'customer_started',
        title: 'واحد مشتریان در حال بررسی مخاطبان هدف...',
        description: 'تحلیل دغدغه‌ها، دردها و پرسونای مشتری',
        progressPercent: 65,
        timestamp: Date.now(),
      });
    }

    const customerResult = await this.customerAgent.execute({
      goal: plan.extractedGoal,
      businessDomain: plan.businessDomain
    });

    if (onStageUpdate) {
      onStageUpdate({
        stage: 'customer_completed',
        title: 'تحلیل مشتریان تکمیل شد',
        description: 'پرسونای هدف و نیازهای مشتری مشخص شد.',
        progressPercent: 75,
        timestamp: Date.now(),
        partialData: { customer: customerResult.data }
      });
    }

    // 5. Dispatch to Marketing Unit
    if (onStageUpdate) {
      onStageUpdate({
        stage: 'marketing_started',
        title: 'واحد بازاریابی در حال تدوین استراتژی فروش، تبلیغات و محتوا...',
        description: 'طراحی پیشنهاد ارزش (USP)، قیف فروش، کمپین‌های پربازده، قلاب‌های تبلیغاتی',
        progressPercent: 85,
        timestamp: Date.now(),
      });
    }

    const marketingResult = await this.marketingAgent.execute({
      goal: plan.extractedGoal,
      businessDomain: plan.businessDomain,
      contextData: { 
        research: researchResult.data,
        competitor: competitorResult.data,
        customer: customerResult.data
      }
    });

    if (onStageUpdate) {
      onStageUpdate({
        stage: 'marketing_completed',
        title: 'استراتژی بازاریابی تدوین شد',
        description: 'پیشنهاد ارزش، کانال‌های تبلیغاتی و ایده‌ها آماده شدند',
        progressPercent: 90,
        timestamp: Date.now(),
        partialData: { marketing: marketingResult.data }
      });
    }

    // 6. Manager Synthesizes and Reviews Everything
    if (onStageUpdate) {
      onStageUpdate({
        stage: 'manager_synthesis',
        title: 'مدیر KASP در حال یکپارچه‌سازی و آماده‌سازی گزارش...',
        description: 'تدوین برنامه اقدام ۳۰ روزه همراه با پیشنهادهای تخصصی',
        progressPercent: 95,
        timestamp: Date.now(),
      });
    }

    const finalReport = await this.synthesizeReport(
      projectId,
      rawGoal,
      plan,
      researchResult.data,
      competitorResult.data,
      customerResult.data,
      marketingResult.data
    );

    if (onStageUpdate) {
      onStageUpdate({
        stage: 'finished',
        title: 'برنامه کسب‌وکاری شما آماده شد!',
        description: 'گزارش کامل ۱۴ بخشی KASP آماده مطالعه است.',
        progressPercent: 100,
        timestamp: Date.now(),
        partialData: { report: finalReport }
      });
    }

    return {
      success: true,
      role: this.role,
      agentName: this.name,
      data: finalReport,
      executionTimeMs: Date.now() - startTime,
    };
  }`;

// Use regex to replace the execute method
code = code.replace(/async execute\([\s\S]*?\n  }\n/m, executeReplacement + '\n');
fs.writeFileSync('src/server/agents/manager.ts', code);
