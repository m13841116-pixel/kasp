import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "const [aiTeamGoal, setAiTeamGoal] = useState('');",
  "const [aiTeamGoal, setAiTeamGoal] = useState('');\n  const [viewReportData, setViewReportData] = useState<any>(null);"
);

code = code.replace(
  "initialGoal={aiTeamGoal}",
  "initialGoal={aiTeamGoal}\n              initialReport={viewReportData}"
);

code = code.replace(
  "<CustomerDashboard onLogout={handleLogout} />",
  "<CustomerDashboard onLogout={handleLogout} onViewReport={(report) => { setViewReportData(report); setActiveTab('landing'); }} />"
);

fs.writeFileSync('src/App.tsx', code);
