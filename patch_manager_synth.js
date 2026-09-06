import fs from 'fs';
let code = fs.readFileSync('src/server/agents/manager.ts', 'utf8');

code = code.replace(
/private async synthesizeReport\([\s\S]*?\): Promise<FinalBusinessReport> \{/,
`private async synthesizeReport(
    projectId: string,
    rawGoal: string,
    plan: ManagerPlan,
    research: any,
    competitor: any,
    customer: any,
    marketing: MarketingOutput
  ): Promise<FinalBusinessReport> {`
);

code = code.replace(
/اطلاعات و پژوهش واحد تحقیق بازار \(شامل جستجوی زنده در صورت وجود\):\n\$\{JSON\.stringify\(research\)\}/,
`اطلاعات بازار:
\${JSON.stringify(research)}

اطلاعات رقبا:
\${JSON.stringify(competitor)}

اطلاعات مشتریان:
\${JSON.stringify(customer)}`
);

fs.writeFileSync('src/server/agents/manager.ts', code);
