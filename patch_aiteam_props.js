import fs from 'fs';
let code = fs.readFileSync('src/components/AIBusinessTeam/AITeamSection.tsx', 'utf8');

code = code.replace(
  "interface AITeamSectionProps {",
  "interface AITeamSectionProps {\n  initialReport?: FinalBusinessReport;"
);

code = code.replace(
  "export const AITeamSection: React.FC<AITeamSectionProps> = ({",
  "export const AITeamSection: React.FC<AITeamSectionProps> = ({\n  initialReport,"
);

code = code.replace(
  "const [report, setReport] = useState<FinalBusinessReport | null>(null);",
  "const [report, setReport] = useState<FinalBusinessReport | null>(initialReport || null);"
);

// Also add a useEffect to sync if initialReport changes
code = code.replace(
  "  useEffect(() => {\n    if (initialGoal && initialGoal !== goal) {\n      setGoal(initialGoal);\n    }\n  }, [initialGoal]);",
  "  useEffect(() => {\n    if (initialGoal && initialGoal !== goal) {\n      setGoal(initialGoal);\n    }\n  }, [initialGoal]);\n\n  useEffect(() => {\n    if (initialReport) {\n      setReport(initialReport);\n      setGoal(initialReport.businessGoal);\n      setTimeout(() => {\n        const el = document.getElementById('kasp-final-report-document');\n        el?.scrollIntoView({ behavior: 'smooth' });\n      }, 500);\n    }\n  }, [initialReport]);"
);

fs.writeFileSync('src/components/AIBusinessTeam/AITeamSection.tsx', code);
