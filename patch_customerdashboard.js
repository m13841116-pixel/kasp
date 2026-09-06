import fs from 'fs';
let code = fs.readFileSync('src/components/CustomerDashboard.tsx', 'utf8');

code = code.replace(
  "export const CustomerDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {",
  "export const CustomerDashboard: React.FC<{ onLogout: () => void, onViewReport: (report: any) => void }> = ({ onLogout, onViewReport }) => {\n  const [loadingReport, setLoadingReport] = useState<string | null>(null);"
);

const fetchAndOpenReport = `
  const handleOpenReport = async (projectId: string) => {
    setLoadingReport(projectId);
    try {
      const res = await apiFetch(\`/api/ai-team/projects/\${projectId}\`);
      if (res.ok) {
        const report = await res.json();
        onViewReport(report);
      } else {
        alert('خطا در دریافت گزارش کامل. لطفاً دوباره تلاش کنید.');
      }
    } catch (e) {
      alert('خطا در برقراری ارتباط با سرور.');
    } finally {
      setLoadingReport(null);
    }
  };
`;

code = code.replace(
  "const [loading, setLoading] = useState(true);",
  "const [loading, setLoading] = useState(true);\n" + fetchAndOpenReport
);

code = code.replace(
  /<a\s+href=\{`\/api\/ai-team\/projects\/\$\{p\.id\}`\}\s+target="_blank"\s+rel="noreferrer"\s+className="px-3\.5 py-2 rounded-xl bg-purple-600\/10 text-purple-600 dark:text-purple-300 hover:bg-purple-600\/20 border border-purple-500\/30 text-xs font-bold flex items-center justify-center gap-1\.5 transition-colors shrink-0"\s+>\s+<Sparkles className="w-3\.5 h-3\.5" \/>\s+<span>مشاهده گزارش کامل هوش تجاری<\/span>\s+<\/a>/g,
  `<button
                        onClick={() => handleOpenReport(p.id)}
                        disabled={loadingReport === p.id}
                        className="px-3.5 py-2 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-300 hover:bg-purple-600/20 border border-purple-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{loadingReport === p.id ? 'در حال بارگذاری...' : 'مشاهده گزارش کامل هوش تجاری'}</span>
                      </button>`
);

fs.writeFileSync('src/components/CustomerDashboard.tsx', code);
