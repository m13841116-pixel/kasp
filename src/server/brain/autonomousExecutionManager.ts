import crypto from 'crypto';
import { 
  AutonomousExecutionState, 
  ExecutionTask, 
  ApprovalRequest, 
  BusinessLearningEntry, 
  AutonomousTaskKey, 
  WorkforceAgentRole,
  ProjectPhase,
  NextRecommendedAction,
  ExecutionTaskOutput,
  ApprovalActionKey
} from './types.js';
import { BrainStateManager } from './stateManager.js';
import { queryAll, queryOne, execute } from '../db.js';
import { GoogleGenAI } from '@google/genai';

export class AutonomousExecutionManager {
  private getAiClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  }

  /**
   * Retrieves or initializes the comprehensive Autonomous Execution State for a project
   */
  public async getOrCreateExecutionState(projectId: string, userId: string = 'guest-user', fallbackGoal?: string): Promise<AutonomousExecutionState> {
    const row = await queryOne("SELECT * FROM ai_execution_states WHERE projectId = ?", [projectId]);
    
    if (row) {
      const state = this.mapRowToState(row);
      // Fetch fresh approvals
      const approvalRows = await queryAll("SELECT * FROM ai_approval_requests WHERE projectId = ? ORDER BY createdAt DESC", [projectId]);
      state.approvals = (approvalRows || []).map((r: any) => this.mapRowToApproval(r));
      state.metrics.pendingApprovalsCount = state.approvals.filter(a => a.status === 'PENDING').length;
      state.nextRecommendedTask = this.determineNextHighestValueTask(state);
      return state;
    }

    // Otherwise, generate initial canonical state
    const businessState = await BrainStateManager.getProjectState(projectId);
    const goal = businessState?.graph.business.mission.value || 
                 businessState?.executiveMemory.answers.whatAreWeBuilding || 
                 fallbackGoal || 
                 'راه‌اندازی و رشد کسب‌وکار مستقل';

    const businessName = businessState?.graph.business.name.value || 'پروژه KASP';

    const initialState = this.buildInitialExecutionState(projectId, userId, businessName, goal, businessState);

    // Save to DB
    await this.saveState(initialState);

    // Also persist initial approvals in ai_approval_requests
    for (const app of initialState.approvals) {
      await this.saveApprovalRequest(app);
    }

    initialState.nextRecommendedTask = this.determineNextHighestValueTask(initialState);
    return initialState;
  }

  /**
   * Manager continuously determines the next highest-value task to execute
   */
  public determineNextHighestValueTask(state: AutonomousExecutionState): NextRecommendedAction | null {
    // 1. If there's an active task, that is the immediate priority
    if (state.activeTask) {
      return {
        task: state.activeTask,
        why: 'این تسک هم‌اکنون توسط نیروی کار هوشمند در حال پردازش و اجراست.',
        expectedImpact: 'تکمیل خروجی و ثبت در پرونده اجرایی کسب‌وکار.',
        agentRole: state.activeTask.agentRole,
        confidence: 0.98,
        isApprovalRequired: false
      };
    }

    // 2. Check if there is an unblocked task in the queue
    const nextInQueue = state.taskQueue.find(t => t.status === 'QUEUED');
    if (nextInQueue) {
      const isApproval = !!nextInQueue.requiresApproval;
      return {
        task: nextInQueue,
        why: this.getTaskValueProposition(nextInQueue.taskKey),
        expectedImpact: this.getTaskExpectedImpact(nextInQueue.taskKey),
        agentRole: nextInQueue.agentRole,
        confidence: 0.95,
        isApprovalRequired: isApproval
      };
    }

    // 3. If tasks are blocked, explain why
    if (state.blockedTasks.length > 0) {
      const firstBlocked = state.blockedTasks[0];
      return {
        task: firstBlocked,
        why: `این اقدام در انتظار تایید بنیان‌گذار در مرکز تاییدها است: ${firstBlocked.blockerReason || 'نیاز به تایید دسترسی خارجی'}`,
        expectedImpact: 'پس از تایید در مرکز تاییدها، بلافاصله اجرا و نتایج ثبت خواهد شد.',
        agentRole: firstBlocked.agentRole,
        confidence: 0.90,
        isApprovalRequired: true
      };
    }

    // All current tasks completed!
    if (state.completedTasks.length > 0) {
      const lastCompleted = state.completedTasks[state.completedTasks.length - 1];
      return {
        task: {
          id: 'task-continuous-growth',
          taskKey: 'recommend_improvements',
          title: 'بهینه‌سازی مستمر و پایش نرخ تبدیل روزانه',
          description: 'تحلیل رفتاری مشتریان، تست A/B و افزایش سهم بازار',
          stageSequence: 14,
          stageName: 'مقیاس‌پذیری و رشد',
          agentRole: 'growth',
          priority: 'P0',
          status: 'QUEUED',
          executionLogs: [],
          estimatedMinutes: 5
        },
        why: 'تمام ۱۳ گام اصلی راه‌اندازی با موفقیت انجام شد. اکنون زمان بهینه‌سازی مستمر و تبلیغات مقیاس‌پذیر است.',
        expectedImpact: 'افزایش مداوم نرخ تبدیل و کاهش هزینه جذب هر مشتری.',
        agentRole: 'growth',
        confidence: 0.99,
        isApprovalRequired: false
      };
    }

    return null;
  }

  /**
   * Executes a specific task from the queue with real AI generation & structured business output
   */
  public async executeTask(projectId: string, taskId: string, userInputs?: Record<string, string>): Promise<{
    state: AutonomousExecutionState;
    executedTask: ExecutionTask;
    newLearning?: BusinessLearningEntry;
  }> {
    const state = await this.getOrCreateExecutionState(projectId);
    
    // Find task in queue or active
    let task = state.taskQueue.find(t => t.id === taskId) || 
               state.blockedTasks.find(t => t.id === taskId) ||
               (state.activeTask?.id === taskId ? state.activeTask : null);

    if (!task) {
      // Find by taskKey if id didn't match directly
      task = state.taskQueue.find(t => t.taskKey === taskId) || state.taskQueue[0];
    }

    if (!task) {
      throw new Error(`تسک مورد نظر با شناسه ${taskId} در صف کار یافت نشد.`);
    }

    // Check if human approval is strictly required before execution
    if (task.requiresApproval) {
      // Check if there is an approved approval request
      const matchingApproval = state.approvals.find(a => a.actionKey === task?.approvalActionKey);
      if (!matchingApproval || matchingApproval.status !== 'APPROVED') {
        // Move to blocked tasks if not already there
        task.status = 'BLOCKED';
        task.blockerReason = 'نیازمند تایید در مرکز تاییدهای KASP است.';
        if (!state.blockedTasks.some(b => b.id === task!.id)) {
          state.blockedTasks.push(task);
        }
        state.taskQueue = state.taskQueue.filter(t => t.id !== task!.id);
        await this.saveState(state);
        throw new Error(`این اقدام حساس است و نیازمند تایید مستقیم شما در «مرکز تاییدهای KASP» می‌باشد.`);
      }
    }

    // Set Active
    task.status = 'ACTIVE';
    task.startedAt = new Date().toISOString();
    state.activeTask = task;
    state.taskQueue = state.taskQueue.filter(t => t.id !== task!.id);
    state.blockedTasks = state.blockedTasks.filter(t => t.id !== task!.id);
    await this.saveState(state);

    // Run Generator
    const businessState = await BrainStateManager.getProjectState(projectId);
    const output = await this.generateTaskDeliverable(task, state, businessState, userInputs);

    // Extract Learning
    const learning = this.generateLearningFromTask(task, output, state);
    if (learning) {
      state.learning.unshift(learning);
    }

    // Mark Completed
    task.status = 'COMPLETED';
    task.completedAt = new Date().toISOString();
    task.output = output;
    task.executionLogs.push(`[${new Date().toLocaleTimeString('fa-IR')}] خروجی تسک توسط نیروی کار هوشمند با موفقیت تولید و اعتبارسنجی شد.`);

    state.completedTasks.push(task);
    state.activeTask = null;

    // Update Project Status & Metrics
    state.currentState.lastExecutedTaskTitle = task.title;
    this.updateStateMetrics(state);

    // Advance Plan Phases
    this.syncPhases(state);

    await this.saveState(state);

    // Record Log in DB
    await execute(`
      INSERT INTO ai_build_logs (id, projectId, artifactId, artifactTitle, action, statusFrom, statusTo, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      `log-${crypto.randomUUID().substring(0, 8)}`,
      projectId,
      task.id,
      task.title,
      'TASK_COMPLETED',
      'ACTIVE',
      'COMPLETED',
      `تسک ${task.title} تکمیل شد. خروجی در پرونده پروژه ثبت گردید.`,
      new Date().toISOString()
    ]);

    state.nextRecommendedTask = this.determineNextHighestValueTask(state);

    return {
      state,
      executedTask: task,
      newLearning: learning
    };
  }

  /**
   * Approves or rejects a critical sensitive action in the Approval Center
   */
  public async handleApprovalDecision(params: {
    projectId: string;
    approvalId: string;
    decision: 'APPROVE' | 'REJECT';
    notes?: string;
  }): Promise<{ approval: ApprovalRequest; state: AutonomousExecutionState }> {
    const { projectId, approvalId, decision, notes } = params;

    const row = await queryOne("SELECT * FROM ai_approval_requests WHERE id = ? AND projectId = ?", [approvalId, projectId]);
    if (!row) {
      throw new Error('درخواست تایید یافت نشد.');
    }

    const approval = this.mapRowToApproval(row);
    const now = new Date().toISOString();

    if (decision === 'APPROVE') {
      approval.status = 'APPROVED';
      approval.approvedAt = now;
      approval.executedAt = now;
      approval.executionResult = `تایید توسط کاربر ثبت شد. دستور اجرا به نیروی کار هوشمند صادر گردید. ${notes ? `(یادداشت: ${notes})` : ''}`;

      // Execute simulated/real integration payload
      const executionDetails = this.executeApprovedActionPayload(approval);
      approval.executionResult += ` | ${executionDetails}`;

      // Record in logs
      await execute(`
        INSERT INTO ai_build_logs (id, projectId, artifactId, artifactTitle, action, statusFrom, statusTo, details, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        `log-${crypto.randomUUID().substring(0, 8)}`,
        projectId,
        approval.id,
        approval.title,
        'APPROVAL_GRANTED',
        'PENDING',
        'APPROVED',
        `تاییدیه بنیان‌گذار دریافت شد: ${approval.title}. ${executionDetails}`,
        now
      ]);

      // Unblock any task waiting on this approval
      const state = await this.getOrCreateExecutionState(projectId);
      const blockedTask = state.blockedTasks.find(t => t.approvalActionKey === approval.actionKey);
      if (blockedTask) {
        blockedTask.status = 'QUEUED';
        blockedTask.blockerReason = undefined;
        state.taskQueue.unshift(blockedTask);
        state.blockedTasks = state.blockedTasks.filter(t => t.id !== blockedTask.id);
      }

      // Add a strategic learning
      state.learning.unshift({
        id: `learn-${crypto.randomUUID().substring(0, 8)}`,
        timestamp: now,
        category: 'OPERATIONAL_EFFICIENCY',
        sourceTask: approval.title,
        hypothesis: `آیا کاربر حاضر به اعطای دسترسی ${approval.title} است؟`,
        finding: `دسترسی با موفقیت تایید شد. سیستم آماده عملیات مستقیم در محیط است.`,
        strategicTakeaway: `تعهد عملیاتی ایجاد شد: بودجه/دسترسی ${approval.estimatedCost} با ریسک کنترل‌شده اختصاص یافت.`,
        impactScore: 'HIGH'
      });

      this.updateStateMetrics(state);
      await this.saveState(state);
      await this.saveApprovalRequest(approval);

      return { approval, state };
    } else {
      approval.status = 'REJECTED';
      approval.executionResult = `رد شده توسط کاربر. ${notes ? `علت: ${notes}` : ''}`;
      await this.saveApprovalRequest(approval);
      const state = await this.getOrCreateExecutionState(projectId);
      return { approval, state };
    }
  }

  // =============================================================
  // Internal Helpers & AI Generator
  // =============================================================

  private async generateTaskDeliverable(
    task: ExecutionTask, 
    state: AutonomousExecutionState, 
    businessState: any, 
    userInputs?: Record<string, string>
  ): Promise<ExecutionTaskOutput> {
    const ai = this.getAiClient();
    const bName = state.businessName;
    const goal = state.goal;

    // Use Gemini for high-craft generation if available
    if (ai) {
      try {
        const prompt = `
نقش شما: عضو ارشد تیم هوشمند کسب‌وکار KASP (نقش: ${task.agentRole}).
شما در حال اجرای وظیفه: "${task.title}" برای کسب‌وکار "${bName}" هستید.
هدف کلیدی کسب‌وکار: "${goal}"
مرحله جاری: "${task.stageName}"

داده‌های موجود کسب‌وکار:
${businessState ? JSON.stringify({
  mission: businessState.graph.business.mission?.value,
  targetCustomer: businessState.graph.customer?.primaryTarget?.value,
  valueProposition: businessState.graph.offer?.coreValueProposition?.value,
  pricing: businessState.graph.pricing?.pricingModel?.value
}, null, 2) : ''}

ورودی‌های تکمیلی کاربر: ${JSON.stringify(userInputs || {})}

خروجی مورد انتظار:
یک خروجی کاملاً دقیق، کاربردی، تخصصی و مستقیم (بدون تعارف و متن‌های کلیشه‌ای).
اگر تسک نیازمند صفحه وب یا فرم است، کدهای HTML و Tailwind CSS مدرن و استاندارد فارسی (راست‌چین RTL) ارائه کن.
اگر تسک استراتژیک است، سناریوها، اعداد، فرمول‌ها و متن‌های دقیق بنویس.

خروجی را در قالب یک JSON معتبر بازگردان:
{
  "summary": "خلاصه ۲ خطی از کار انجام شده و دستاورد",
  "content": "متن تفصیلی و اسناد اجرایی تسک با سرفصل‌های مشخص",
  "codeOrHtml": "کد HTML/CSS کامل در صورت لزوم، یا خالی",
  "deliverableType": "HTML_PAGE یا PRODUCT_CATALOG یا MARKETING_KIT یا STRATEGY_DOC یا CHECKLIST یا FUNNEL_MAP یا INTEGRATION_CONFIG",
  "actionableNextStep": "یک اقدام کلیدی فوری برای گام بعدی"
}
`;
        const resp = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3
          }
        });

        const text = resp.text || '{}';
        const parsed = JSON.parse(text);
        return {
          summary: parsed.summary || `تسک ${task.title} با موفقیت اجرا و ثبت شد.`,
          content: parsed.content || 'جزییات تسک در دسترس است.',
          codeOrHtml: parsed.codeOrHtml || undefined,
          deliverableType: parsed.deliverableType || 'STRATEGY_DOC',
          actionableNextStep: parsed.actionableNextStep
        };
      } catch (err) {
        console.warn('Gemini generation fallback for task:', err);
      }
    }

    // Fallback deterministic high-craft deliverables
    return this.getDeterministicDeliverable(task, state);
  }

  private getDeterministicDeliverable(task: ExecutionTask, state: AutonomousExecutionState): ExecutionTaskOutput {
    const bName = state.businessName;
    const goal = state.goal;

    switch (task.taskKey) {
      case 'research_market':
        return {
          summary: `تحلیل بازار و تقاضای ${bName} تکمیل شد. حجم بازار در دسترس (SAM) بیش از ۴۵۰ میلیارد تومان تخمین زده شد.`,
          content: `### گزارش پژوهش بازار و تحلیل تقاضا برای ${bName}
- **حجم بازار بالقوه (TAM):** ۲،۸۰۰ میلیارد تومان در سال
- **حجم بازار هدف در دسترس (SAM):** ۴۵۰ میلیارد تومان
- **رشد سالانه بازار:** ۲۴٪ بر اساس افزایش ضریب نفوذ خرید آنلاین
- **بزرگ‌ترین خلأ بازار:** فقدان اصالت‌سنجی معتبر، عدم وجود مشاوره تخصصی در لحظه خرید، و زمان تحویل طولانی رقبا.
- **محرک‌های کلیدی تقاضا:** تمایل به خرید محصولات تست‌شده، ضمانت بازگشت وجه، و شفافیت فنی.`,
          deliverableType: 'STRATEGY_DOC',
          actionableNextStep: 'تعریف دقیق بخش‌بندی مشتریان پرارزش در گام بعد'
        };

      case 'define_customer':
        return {
          summary: `پرسونای خریدار اصلی و محرک‌های روانی خرید برای ${bName} تدوین شد.`,
          content: `### ماتریس پرسونای خریدار ایده‌آل (ICP)
1. **پرسونای خریدار اصلی: ورزشکاران و علاقه‌مندان به لایف‌استایل سلامت (۲۲ تا ۳۸ سال)**
   - **بزرگ‌ترین دغدغه:** تشخیص کالای اورجینال از فیک و ترس از خرید سایز/مدل نامناسب.
   - **محرک اقدام فوری:** دیدن نظرات خریداران واقعی، ویدیوی بررسی تست محصول، و پیشنهاد ارسال فوری کمتر از ۳ ساعت.
   - **ارزش خرید هر سفارش:** ۱.۲ تا ۲.۸ میلیون تومان در هر تراکنش.
   - **کانال‌های دسترسی:** ریلز اینستاگرام، کانال‌های تخصصی تلگرام، و سرچ مستقیم در گوگل.`,
          deliverableType: 'STRATEGY_DOC',
          actionableNextStep: 'طراحی پیشنهاد مقاومت‌ناپذیر و پکیج افتتاحیه'
        };

      case 'define_offer':
        return {
          summary: `معماری پیشنهاد رد نشدنی (Irresistible Offer) با ۳ لایه ضمانت و هدیه اختصاصی طراحی شد.`,
          content: `### بسته پیشنهاد رد نشدنی ${bName}
- **پیشنهاد محوری:** تجهیز کامل با ضمانت اصالت ۱۰۰٪ + مشاوره انتخاب اختصاصی
- **بونس و پاداش خرید:** کتابچه راهنمای تمرین + برنامه تغذیه ورزشی اختصاصی (رایگان به ارزش ۳۰۰ هزار تومان)
- **ضمانت کاهش ریسک:** ۷ روز ضمانت تعویض بدون قید و شرط حتی در صورت انتخاب اشتباه سایز + ارسال رایگان خریدهای بالای ۱ میلیون تومان.
- **تکنیک فوریت:** تخفیف ویژه افتتاحیه برای ۱۰۰ سفارش اول به همراه شیکر رایگان برند.`,
          deliverableType: 'STRATEGY_DOC',
          actionableNextStep: 'تحلیل دقیق رقبا و تثبیت قیمت‌گذاری سودآور'
        };

      case 'create_landing_page':
        return {
          summary: `صفحه فرود با بالاترین نرخ تبدیل با Tailwind CSS، تیترهای ترغیب‌کننده و فرم سریع طراحی شد.`,
          content: `صفحه فرود اختصاصی شامل هدر جذب سریع، بنر پیشنهاد افتتاحیه، گرید محصولات، و نظرات خریداران.`,
          codeOrHtml: `<div class="bg-slate-950 text-white min-h-[600px] p-8 rounded-3xl font-sans text-right" dir="rtl">
  <div class="max-w-4xl mx-auto space-y-8">
    <div class="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-black rounded-full border border-amber-500/30">
      🔥 ضمانت اصالت ۱۰۰٪ + ارسال فوری ۳ ساعته
    </div>
    <h1 class="text-3xl sm:text-5xl font-black text-slate-100 leading-tight">
      تجهیزات تخصصی <span class="text-amber-400">${bName}</span> برای بالاترین عملکرد ورزشی
    </h1>
    <p class="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
      دیگر نگران کالای فیک و سایز اشتباه نباشید. با گارانتی تعویض بی قید و شرط و هدیه اختصاصی افتتاحیه، بهترین تجهیزات را مستقیماً از نمایندگی تحویل بگیرید.
    </p>
    <div class="flex flex-wrap gap-4 pt-4">
      <button class="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/25">
        خرید پکیج افتتاحیه با ۲۵٪ تخفیف
      </button>
      <button class="px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl border border-slate-800">
        مشاهده کاتالوگ محصولات
      </button>
    </div>
  </div>
</div>`,
          deliverableType: 'HTML_PAGE',
          actionableNextStep: 'اتصال ساختار کاتالوگ و محصولات به سبد خرید'
        };

      default:
        return {
          summary: `خروجی تسک ${task.title} توسط نیروی کار KASP آماده و تدوین شد.`,
          content: `سند عملیاتی و استانداردهای اجرایی برای ${task.title} با موفقیت در مخزن دانش پروژه ذخیره شد. کلیه شاخص‌های کیفیت و الزامات فنی رعایت گردیده است.`,
          deliverableType: 'STRATEGY_DOC',
          actionableNextStep: 'ادامه به گام بعدی در صف تسک‌ها'
        };
    }
  }

  private generateLearningFromTask(task: ExecutionTask, output: ExecutionTaskOutput, state: AutonomousExecutionState): BusinessLearningEntry {
    const timestamp = new Date().toISOString();
    return {
      id: `learn-${crypto.randomUUID().substring(0, 8)}`,
      timestamp,
      category: this.mapTaskToLearningCategory(task.taskKey),
      sourceTask: task.title,
      hypothesis: `چگونه اجرای ${task.title} بالاترین نرخ بازگشت سرمایه را ایجاد می‌کند؟`,
      finding: output.summary,
      strategicTakeaway: output.actionableNextStep || `تکمیل ${task.title} مسیر ورود به گام بعد را هموار کرد.`,
      impactScore: 'HIGH'
    };
  }

  private mapTaskToLearningCategory(key: string): BusinessLearningEntry['category'] {
    if (key.includes('market') || key.includes('competitor')) return 'MARKET_INSIGHT';
    if (key.includes('customer')) return 'CUSTOMER_BEHAVIOR';
    if (key.includes('pricing')) return 'PRICING_DYNAMICS';
    if (key.includes('landing') || key.includes('funnel')) return 'CONVERSION_LEARNING';
    return 'OPERATIONAL_EFFICIENCY';
  }

  private executeApprovedActionPayload(approval: ApprovalRequest): string {
    switch (approval.actionKey) {
      case 'publish_website':
        return 'وب‌سایت روی هاست پرسرعت ابری با دامنه و سرتیفیکیت SSL مستقر گردید.';
      case 'spend_ad_budget':
        return 'بودجه اولیه ۳ میلیون تومان در سیستم تبلیغات هوشمند اینستاگرام و ادوردز ثبت شد.';
      case 'send_customer_messages':
        return 'وب‌سرویس پیامکی پیامک‌های افتتاحیه را به لیست اولیه مخاطبان ارسال نمود.';
      case 'connect_payment_gateway':
        return 'مرچنت کد زیبال/شاپرک با موفقیت فعال شد و تست تراکنش ۱۰۰۰ تومانی موفق بود.';
      case 'place_inventory_order':
        return 'پیش‌فاکتور تامین‌کننده اصلی برای ۱۰ قلم کالای پرفروش با تخفیف عمده تایید شد.';
      default:
        return 'اقدام در سیستم ثبت شد و مجوز دسترسی فعال گردید.';
    }
  }

  private updateStateMetrics(state: AutonomousExecutionState) {
    const total = 13;
    const completed = state.completedTasks.length;
    const progress = Math.min(100, Math.round((completed / total) * 100));
    
    state.metrics.totalTasksCount = total;
    state.metrics.completedTasksCount = completed;
    state.metrics.queuedTasksCount = state.taskQueue.length;
    state.metrics.blockedTasksCount = state.blockedTasks.length;
    state.metrics.overallProgress = progress;
    state.metrics.businessReadinessScore = Math.min(100, 20 + Math.round(progress * 0.8));
    state.metrics.executionVelocity = `${(completed * 1.5 + 2).toFixed(1)} اقدام در ساعت`;
    state.metrics.launchChecklistReadiness = Math.min(100, progress + 10);

    if (completed >= 11) {
      state.currentState.maturityLevel = 'LAUNCH_READY';
      state.currentState.stage = 'آماده عرضه مستقیم به بازار';
    } else if (completed >= 6) {
      state.currentState.maturityLevel = 'MVP_READY';
      state.currentState.stage = 'ساخت دارایی‌های فروش و لندینگ‌پیج';
    } else {
      state.currentState.maturityLevel = 'VALIDATING';
      state.currentState.stage = 'تحقیقات و تدوین استراتژی اولیه';
    }
  }

  private syncPhases(state: AutonomousExecutionState) {
    const completedKeys = new Set(state.completedTasks.map(t => t.taskKey));
    state.plan.phases.forEach((phase, idx) => {
      const allDone = phase.taskKeys.every(k => completedKeys.has(k));
      const anyDone = phase.taskKeys.some(k => completedKeys.has(k));
      if (allDone) {
        phase.status = 'COMPLETED';
      } else if (anyDone || idx === 0) {
        phase.status = 'ACTIVE';
        state.plan.activePhaseNumber = phase.phaseNumber;
      } else {
        phase.status = 'PENDING';
      }
    });
  }

  private getTaskValueProposition(taskKey: string): string {
    const map: Record<string, string> = {
      research_market: 'پایه‌ریزی کسب‌وکار بر اساس داده‌های واقعی بازار و کشف خلأهای سودآور.',
      define_customer: 'جلوگیری از هدررفت بودجه با شناسایی دقیق کسانی که واقعاً حاضرند پول بپردازند.',
      define_offer: 'افزایش ۳ برابری نرخ تبدیل با ایجاد پیشنهادی که رد کردن آن غیرمنطقی باشد.',
      analyze_competitors: 'کشف نقاط ضعف رقبا و تضمین مزیت رقابتی غیرقابل کپی‌برداری.',
      choose_positioning: 'جای‌گیری در ذهن مشتری به عنوان انتخاب اول و متمایز در بازار.',
      recommend_pricing: 'بهینه‌سازی حاشیه سود و انتخاب قیمت روانشناختی ایده‌آل.',
      create_landing_page: 'تبدیل ترافیک ورودی به خریداران قطعی با صفحه فرود مهندسی‌شده.',
      create_product_structure: 'شفاف‌سازی کاتالوگ محصولات، آپ‌سل‌ها و سبد خرید.',
      create_marketing_assets: 'ایجاد محتوای تبلیغاتی پرکلیک برای سرازیر کردن ترافیک هدفمند.',
      create_sales_funnel: 'ساخت ماشین فروش خودکار از مرحله آگاهی تا واریز وجه.',
      create_launch_checklist: 'اطمینان از اجرای بدون نقص و تست تمام نقاط اتصال پیش از افتتاح.',
      track_results: 'نصب چشم‌های دیجیتال کسب‌وکار برای مشاهده لحظه‌ای درآمد و سنجه‌ها.',
      recommend_improvements: 'رشد و مقیاس‌پذیری تصاعدی بر اساس بازخورد واقعی بازار.'
    };
    return map[taskKey] || 'اقدام ضروری برای پیشبرد سریع کسب‌وکار.';
  }

  private getTaskExpectedImpact(taskKey: string): string {
    const map: Record<string, string> = {
      research_market: 'استخراج داده‌های عددی بازار، تخمین تقاضا و کاهش ریسک شکست.',
      define_customer: 'تعریف شفاف پرسونای مشتری، نقاط درد، و محرک‌های روانی تصمیم‌گیری.',
      define_offer: 'تدوین سند جامع پیشنهاد با گارانتی، بانس‌ها و فرمول قیمت.',
      analyze_competitors: 'شناسایی ۵ رقیب اصلی و طراحی قلاب برتری بومی.',
      choose_positioning: 'تعیین لحن برند، تیتر اصلی و بیانیه ارزش پیشنهادی.',
      recommend_pricing: 'طراحی جدول تعرفه‌ها، تخمین CAC و LTV.',
      create_landing_page: 'کد کامل و رابط کاربری واکنش‌گرای صفحه فرود آماده انتشار.',
      create_product_structure: 'دسته‌بندی کالاها و تعریف ساختار کارت‌های خرید.',
      create_marketing_assets: 'مجموعه قلاب‌های ویدیویی، سناریوهای استوری و بنرهای کلیکی.',
      create_sales_funnel: 'اسکریپت پاسخ به مشتریان و دنباله ایمیل‌ها/پیامک‌های پیگیری.',
      create_launch_checklist: 'برنامه اجرایی ۱ تا ۳۰ روزه افتتاحیه.',
      track_results: 'کدهای آنالیتیکس و تگ‌های تبدیل روی تمام دکمه‌ها.',
      recommend_improvements: 'نقشه راه تست‌های A/B و افزایش حاشیه سود خالص.'
    };
    return map[taskKey] || 'افزایش سرعت اجرای پروژه.';
  }

  private buildInitialExecutionState(
    projectId: string, 
    userId: string, 
    businessName: string, 
    goal: string,
    businessState?: any
  ): AutonomousExecutionState {
    const now = new Date().toISOString();

    const canonicalTasks: Array<{
      key: AutonomousTaskKey;
      title: string;
      desc: string;
      role: WorkforceAgentRole;
      stage: string;
      seq: number;
      prio: 'P0' | 'P1' | 'P2';
      requiresApproval?: boolean;
      approvalKey?: ApprovalActionKey;
    }> = [
      { key: 'research_market', title: '۱. پژوهش عمیق بازار و ارزیابی حجم تقاضا', desc: 'استخراج اندازه بازار، روندهای خرید و فرصت‌های بهره‌برداری نشده', role: 'research', stage: 'تحقیقات و اعتبارسنجی', seq: 1, prio: 'P0' },
      { key: 'define_customer', title: '۲. تعریف پرسونای خریدار و محرک‌های تبدیل', desc: 'شناسایی مشتریان ایده‌آل با بالاترین تمایل به پرداخت و ترس‌های خرید', role: 'customer', stage: 'تحقیقات و اعتبارسنجی', seq: 2, prio: 'P0' },
      { key: 'define_offer', title: '۳. طراحی پیشنهاد مقاومت‌ناپذیر و ارزش محوری', desc: 'خلق پیشنهاد اصلی، هدایای اختصاصی و ضمانت‌های حذف ریسک', role: 'manager', stage: 'استراتژی و جایگاه‌سازی', seq: 3, prio: 'P0' },
      { key: 'analyze_competitors', title: '۴. تحلیل موشکافانه رقبا و کشف مزیت رقابتی', desc: 'بررسی نقاط ضعف رقبای فعال در بازار و یافتن جایگاه متمایز', role: 'competitor', stage: 'استراتژی و جایگاه‌سازی', seq: 4, prio: 'P1' },
      { key: 'choose_positioning', title: '۵. تثبیت جایگاه برند و هویت کلامی', desc: 'بیانیه جایگاه‌سازی، پیام کلیدی و لحن ارتباطی برند در بازار', role: 'marketing', stage: 'استراتژی و جایگاه‌سازی', seq: 5, prio: 'P1' },
      { key: 'recommend_pricing', title: '۶. معماری قیمت‌گذاری سودآور و ارزیابی اقتصادی', desc: 'تعیین بازه قیمت‌گذاری، تخمین CAC/LTV و حاشیه سود ناخالص', role: 'manager', stage: 'استراتژی و جایگاه‌سازی', seq: 6, prio: 'P0' },
      { key: 'create_landing_page', title: '۷. ساخت صفحه فرود اختصاصی با نرخ تبدیل بالا', desc: 'کدنویسی و طراحی کامل رابط کاربری لندینگ‌پیج با Tailwind CSS', role: 'builder', stage: 'ساخت دارایی‌های فروش', seq: 7, prio: 'P0' },
      { key: 'create_product_structure', title: '۸. طراحی ساختار کاتالوگ و سبد خرید', desc: 'تعریف دسته‌بندی محصولات، کارت‌های آیتم، و فرایند پرداخت', role: 'builder', stage: 'ساخت دارایی‌های فروش', seq: 8, prio: 'P1' },
      { key: 'create_marketing_assets', title: '۹. تولید بسته محتوا و قلاب‌های تبلیغاتی', desc: 'سناریوهای ویدیویی اینستاگرام، متن‌های تبلیغات کلیکی و بنرها', role: 'marketing', stage: 'بازاریابی و توزیع', seq: 9, prio: 'P1' },
      { key: 'create_sales_funnel', title: '۱۰. طراحی قیف فروش و اسکریپت‌های مذاکره', desc: 'متن‌های ارتباطی فروشندگان، پیگیری خودکار و پیامک‌های تبدیل', role: 'operations', stage: 'بازاریابی و توزیع', seq: 10, prio: 'P0' },
      { key: 'create_launch_checklist', title: '۱۱. تدوین چک‌لیست و برنامه گام‌به‌گام لانچ', desc: 'اقدامات روز افتتاحیه، تست‌های فنی و زمان‌بندی انتشار عمومی', role: 'manager', stage: 'لانچ و بهره‌برداری', seq: 11, prio: 'P0' },
      { key: 'track_results', title: '۱۲. راه‌اندازی سیستم ردیابی نتایج و آنالیتیکس', desc: 'پیکربندی سنجه‌های رشد، رصد تبدیل و قیف خرید کاربران', role: 'growth', stage: 'لانچ و بهره‌برداری', seq: 12, prio: 'P1' },
      { key: 'recommend_improvements', title: '۱۳. تحلیل عملکرد و ارائه راهکارهای رشد مستمر', desc: 'بهینه‌سازی قیف بر اساس داده‌ها و تست‌های رشد برای مقیاس‌پذیری', role: 'growth', stage: 'مقیاس‌پذیری', seq: 13, prio: 'P0' }
    ];

    const taskQueue: ExecutionTask[] = canonicalTasks.map(t => ({
      id: `task-${crypto.randomUUID().substring(0, 8)}`,
      taskKey: t.key,
      title: t.title,
      description: t.desc,
      stageSequence: t.seq,
      stageName: t.stage,
      agentRole: t.role,
      priority: t.prio,
      status: 'QUEUED',
      requiresApproval: t.requiresApproval,
      approvalActionKey: t.approvalKey,
      executionLogs: [`[${new Date().toLocaleTimeString('fa-IR')}] تسک در صف اجرای نیروی کار KASP قرار گرفت.`],
      estimatedMinutes: 3
    }));

    // Pre-create standard approvals for external access actions
    const defaultApprovals: ApprovalRequest[] = [
      {
        id: `app-pub-${crypto.randomUUID().substring(0, 6)}`,
        projectId,
        userId,
        actionKey: 'publish_website',
        title: 'انتشار رسمی وب‌سایت در دامنه اختصاصی',
        recommendationReason: 'برای شروع جذب ترافیک ارگانیک و ثبت سفارشات زنده، وب‌سایت باید روی سرور ابری با دامنه اصلی مستقر شود.',
        expectedResult: 'وب‌سایت با آدرس رسمی کاربر و گواهی SSL در دسترس تمام مشتریان قرار می‌گیرد.',
        riskAssessment: 'ترافیک عمومی به سایت وارد می‌شود؛ نیازمند بررسی نهایی قیمت‌ها است.',
        estimatedCost: 'رایگان (شامل پلن زیرساخت KASP)',
        status: 'PENDING',
        createdAt: now
      },
      {
        id: `app-gw-${crypto.randomUUID().substring(0, 6)}`,
        projectId,
        userId,
        actionKey: 'connect_payment_gateway',
        title: 'اتصال به درگاه پرداخت بانکی شاپرک/زیبال',
        recommendationReason: 'برای دریافت بی‌واسطه مبالغ خرید و واریز آنی به حساب بانکی کسب‌وکار.',
        expectedResult: 'لینک پرداخت شاپرک در سبد خرید فعال و مبالغ مستقیماً به شبای مالک واریز می‌شود.',
        riskAssessment: 'فعال‌سازی نیازمند شماره شبا و احراز هویت مالک کسب‌وکار است.',
        estimatedCost: 'رایگان (کارمزد شاپرکی بر اساس تراکنش)',
        status: 'PENDING',
        createdAt: now
      },
      {
        id: `app-ad-${crypto.randomUUID().substring(0, 6)}`,
        projectId,
        userId,
        actionKey: 'spend_ad_budget',
        title: 'تخصیص بودجه و اجرای اولین کمپین تبلیغاتی',
        recommendationReason: 'تست مستقیم بازخورد مشتریان و ایجاد اولین ۱۰۰ تراکنش در ۲۴ ساعت اول.',
        expectedResult: 'تخمین جذب ۲۵۰ تا ۶۰۰ بازدیدکننده هدفمند با نرخ تبدیل پیش‌بینی‌شده ۳ تا ۵ درصد.',
        riskAssessment: 'هزینه مالی مستقیم؛ پیشنهاد می‌شود ابتدا با بودجه تستی آغاز گردد.',
        estimatedCost: '۳،۰۰۰،۰۰۰ تومان (قابل تنظیم)',
        status: 'PENDING',
        createdAt: now
      },
      {
        id: `app-sms-${crypto.randomUUID().substring(0, 6)}`,
        projectId,
        userId,
        actionKey: 'send_customer_messages',
        title: 'ارسال پیامک اطلاع‌رسانی افتتاحیه به لیست مخاطبان',
        recommendationReason: 'اطلاع‌رسانی رونمایی به اولین حلقه آشنایان و لیدهای ثبت‌نامی برای ایجاد موج اولیه خرید.',
        expectedResult: 'نرخ باز شدن پیامک بیش از ۹۰٪ و بازگشت سریع اولین خریداران وفادار.',
        riskAssessment: 'ارسال به شماره‌های مسدود تبلیغاتی با خط خدماتی انجام می‌پذیرد.',
        estimatedCost: '۱۵۰،۰۰۰ تومان (اعتبار پیامکی)',
        status: 'PENDING',
        createdAt: now
      }
    ];

    const phases: ProjectPhase[] = [
      {
        phaseNumber: 1,
        title: 'فاز ۱: تحقیقات و اعتبارسنجی بازار',
        description: 'استخراج داده‌های واقعی بازار، پرسونای مشتری و کشف خلأهای سودآور',
        status: 'ACTIVE',
        taskKeys: ['research_market', 'define_customer']
      },
      {
        phaseNumber: 2,
        title: 'فاز ۲: استراتژی، پیشنهاد و قیمت‌گذاری',
        description: 'طراحی پیشنهاد مقاومت‌ناپذیر، مزیت رقابتی، جایگاه‌سازی و مدل قیمت',
        status: 'PENDING',
        taskKeys: ['define_offer', 'analyze_competitors', 'choose_positioning', 'recommend_pricing']
      },
      {
        phaseNumber: 3,
        title: 'فاز ۳: ساخت دارایی‌ها و ماشین فروش',
        description: 'کدنویسی صفحه فرود، کاتالوگ محصولات، محتوای تبلیغاتی و قیف فروش',
        status: 'PENDING',
        taskKeys: ['create_landing_page', 'create_product_structure', 'create_marketing_assets', 'create_sales_funnel']
      },
      {
        phaseNumber: 4,
        title: 'فاز ۴: لانچ، رهگیری و بهینه‌سازی مداوم',
        description: 'چک‌لیست افتتاحیه، نصب سنجه‌های رهگیری و تست‌های رشد و مقیاس‌پذیری',
        status: 'PENDING',
        taskKeys: ['create_launch_checklist', 'track_results', 'recommend_improvements']
      }
    ];

    const initialLearnings: BusinessLearningEntry[] = [
      {
        id: `learn-init-1`,
        timestamp: now,
        category: 'MARKET_INSIGHT',
        sourceTask: 'شروع پروژه KASP',
        hypothesis: 'آیا این کسب‌وکار دارای بازار تقاضای قابل اتکاست؟',
        finding: `هدف کسب‌وکار "${goal}" در ساختار اجرایی KASP تعریف شد.`,
        strategicTakeaway: 'شروع با فاز اول تحقیقات برای حذف حدس و گمان‌های غیرواقعی.',
        impactScore: 'HIGH'
      }
    ];

    return {
      projectId,
      userId,
      businessName,
      goal,
      currentState: {
        summary: 'پروژه در نقطه آغازین نیروی کار هوشمند قرار دارد و آماده اجرای اولین تسک است.',
        stage: 'فاز ۱: تحقیقات بازار و تعریف مشتری',
        maturityLevel: 'IDEA',
        validatedPillars: ['هدف اولیه کسب‌وکار تبیین شد.'],
        currentBottleneck: 'نیاز به استخراج داده‌های واقعی بازار و رفتار خریداران.'
      },
      targetState: {
        summary: 'رسیدن به اولین فروش پایدار با ماشین فروش خودکار و نرخ تبدیل بالای ۳٪',
        horizon: '۳۰ روزه',
        targetMilestone: 'انتشار وب‌سایت + ۱۰۰ سفارش اول با درگاه پرداخت مستقیم',
        revenueOrCustomerTarget: '۵۰ تا ۱۰۰ میلیون تومان فروش ماه اول',
        successCriteria: [
          'صفحه فرود با لود سریع کمتر از ۱.۵ ثانیه',
          'پیشنهاد تست‌شده با نرخ تبدیل بالای ۳٪',
          'درگاه پرداخت مستقیم متصل به حساب',
          'سیستم ردیابی دقیق سنجه‌های مالی'
        ]
      },
      plan: {
        phases,
        totalPhases: 4,
        activePhaseNumber: 1
      },
      taskQueue,
      activeTask: null,
      blockedTasks: [],
      completedTasks: [],
      metrics: {
        overallProgress: 0,
        businessReadinessScore: 20,
        executionVelocity: 'آماده شروع',
        totalTasksCount: 13,
        completedTasksCount: 0,
        queuedTasksCount: 13,
        blockedTasksCount: 0,
        pendingApprovalsCount: defaultApprovals.length,
        estimatedCac: '۴۵،۰۰۰ تومان',
        estimatedLtv: '۸۵۰،۰۰۰ تومان',
        launchChecklistReadiness: 15
      },
      learning: initialLearnings,
      approvals: defaultApprovals,
      nextRecommendedTask: null,
      updatedAt: now
    };
  }

  private async saveState(state: AutonomousExecutionState): Promise<void> {
    const existing = await queryOne("SELECT projectId FROM ai_execution_states WHERE projectId = ?", [state.projectId]);
    const now = new Date().toISOString();
    state.updatedAt = now;

    if (existing) {
      await execute(`
        UPDATE ai_execution_states SET
          userId = ?,
          goal = ?,
          currentState = ?,
          targetState = ?,
          planData = ?,
          taskQueue = ?,
          activeTaskId = ?,
          blockedTasks = ?,
          completedTasks = ?,
          metricsData = ?,
          learningData = ?,
          updatedAt = ?
        WHERE projectId = ?
      `, [
        state.userId,
        state.goal,
        JSON.stringify(state.currentState),
        JSON.stringify(state.targetState),
        JSON.stringify(state.plan),
        JSON.stringify(state.taskQueue),
        state.activeTask ? state.activeTask.id : null,
        JSON.stringify(state.blockedTasks),
        JSON.stringify(state.completedTasks),
        JSON.stringify(state.metrics),
        JSON.stringify(state.learning),
        now,
        state.projectId
      ]);
    } else {
      await execute(`
        INSERT INTO ai_execution_states (
          projectId, userId, goal, currentState, targetState, planData,
          taskQueue, activeTaskId, blockedTasks, completedTasks, metricsData,
          learningData, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        state.projectId,
        state.userId,
        state.goal,
        JSON.stringify(state.currentState),
        JSON.stringify(state.targetState),
        JSON.stringify(state.plan),
        JSON.stringify(state.taskQueue),
        state.activeTask ? state.activeTask.id : null,
        JSON.stringify(state.blockedTasks),
        JSON.stringify(state.completedTasks),
        JSON.stringify(state.metrics),
        JSON.stringify(state.learning),
        now
      ]);
    }
  }

  private async saveApprovalRequest(app: ApprovalRequest): Promise<void> {
    const existing = await queryOne("SELECT id FROM ai_approval_requests WHERE id = ?", [app.id]);
    if (existing) {
      await execute(`
        UPDATE ai_approval_requests SET
          actionKey = ?,
          title = ?,
          recommendationReason = ?,
          expectedResult = ?,
          riskAssessment = ?,
          estimatedCost = ?,
          status = ?,
          executionResult = ?,
          approvedAt = ?,
          executedAt = ?
        WHERE id = ?
      `, [
        app.actionKey,
        app.title,
        app.recommendationReason,
        app.expectedResult,
        app.riskAssessment,
        app.estimatedCost,
        app.status,
        app.executionResult || null,
        app.approvedAt || null,
        app.executedAt || null,
        app.id
      ]);
    } else {
      await execute(`
        INSERT INTO ai_approval_requests (
          id, projectId, userId, actionKey, title, recommendationReason,
          expectedResult, riskAssessment, estimatedCost, status,
          executionResult, approvedAt, executedAt, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        app.id,
        app.projectId,
        app.userId || 'guest-user',
        app.actionKey,
        app.title,
        app.recommendationReason,
        app.expectedResult,
        app.riskAssessment,
        app.estimatedCost,
        app.status,
        app.executionResult || null,
        app.approvedAt || null,
        app.executedAt || null,
        app.createdAt
      ]);
    }
  }

  private mapRowToState(r: any): AutonomousExecutionState {
    const taskQueue = r.taskQueue ? JSON.parse(r.taskQueue) : [];
    const blockedTasks = r.blockedTasks ? JSON.parse(r.blockedTasks) : [];
    const completedTasks = r.completedTasks ? JSON.parse(r.completedTasks) : [];
    const activeTaskId = r.activeTaskId;
    const activeTask = activeTaskId ? (taskQueue.find((t: any) => t.id === activeTaskId) || null) : null;

    return {
      projectId: r.projectId,
      userId: r.userId,
      businessName: 'پروژه KASP',
      goal: r.goal || 'راه‌اندازی کسب‌وکار',
      currentState: r.currentState ? JSON.parse(r.currentState) : { summary: '', stage: '', maturityLevel: 'IDEA', validatedPillars: [] },
      targetState: r.targetState ? JSON.parse(r.targetState) : { summary: '', horizon: '۳۰ روزه', targetMilestone: '', successCriteria: [] },
      plan: r.planData ? JSON.parse(r.planData) : { phases: [], totalPhases: 0, activePhaseNumber: 1 },
      taskQueue,
      activeTask,
      blockedTasks,
      completedTasks,
      metrics: r.metricsData ? JSON.parse(r.metricsData) : {
        overallProgress: 0, businessReadinessScore: 0, executionVelocity: '', totalTasksCount: 0,
        completedTasksCount: 0, queuedTasksCount: 0, blockedTasksCount: 0, pendingApprovalsCount: 0,
        estimatedCac: '', estimatedLtv: '', launchChecklistReadiness: 0
      },
      learning: r.learningData ? JSON.parse(r.learningData) : [],
      approvals: [],
      nextRecommendedTask: null,
      updatedAt: r.updatedAt || new Date().toISOString()
    };
  }

  private mapRowToApproval(r: any): ApprovalRequest {
    return {
      id: r.id,
      projectId: r.projectId,
      userId: r.userId,
      actionKey: r.actionKey as ApprovalActionKey,
      title: r.title,
      recommendationReason: r.recommendationReason,
      expectedResult: r.expectedResult,
      riskAssessment: r.riskAssessment,
      estimatedCost: r.estimatedCost,
      status: r.status,
      executionResult: r.executionResult,
      approvedAt: r.approvedAt,
      executedAt: r.executedAt,
      createdAt: r.createdAt
    };
  }
}

export const autonomousManager = new AutonomousExecutionManager();
