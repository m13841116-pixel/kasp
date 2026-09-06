import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('const [viewReportData, setViewReportData] = useState<any>(null);')) {
  code = code.replace(
    "const [aiTeamGoal, setAiTeamGoal] = useState<string>('');",
    "const [aiTeamGoal, setAiTeamGoal] = useState<string>('');\n  const [viewReportData, setViewReportData] = useState<any>(null);"
  );
}

fs.writeFileSync('src/App.tsx', code);
