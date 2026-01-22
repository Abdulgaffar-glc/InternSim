import { useState } from 'react';
import { Upload, Check, X, AlertCircle, Code, FileCode, Sparkles, Play, Terminal, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChecklistItem {
  id: number;
  labelKey: string;
  checked: boolean;
  required: boolean;
}

const initialChecklist: ChecklistItem[] = [
  { id: 1, labelKey: 'cleanCode', checked: true, required: true },
  { id: 2, labelKey: 'unitTests', checked: true, required: true },
  { id: 3, labelKey: 'documentation', checked: false, required: false },
  { id: 4, labelKey: 'codeReview', checked: false, required: true },
  { id: 5, labelKey: 'linter', checked: true, required: true },
  { id: 6, labelKey: 'edgeCases', checked: false, required: false },
];

const sampleCode = `// User Authentication Service
import { createClient } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

export class AuthService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
  }

  async signIn(email: string, password: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      return {
        id: data.user.id,
        email: data.user.email!,
        role: data.user.user_metadata.role || 'user',
      };
    } catch (err) {
      console.error('Sign in failed:', err);
      return null;
    }
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }
}`;

export const SubmissionHub = () => {
  const { t, language } = useLanguage();
  const [code, setCode] = useState(sampleCode);
  const [checklist, setChecklist] = useState(initialChecklist);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<null | 'success' | 'warning'>(null);

  const checklistLabels: Record<string, { tr: string; en: string }> = {
    cleanCode: { tr: 'Kod clean code standartlarına uygun mu?', en: 'Does code follow clean code standards?' },
    unitTests: { tr: 'Unit testler yazıldı mı?', en: 'Were unit tests written?' },
    documentation: { tr: 'Dokümantasyon eklendi mi?', en: 'Was documentation added?' },
    codeReview: { tr: 'Code review yapıldı mı?', en: 'Was code review done?' },
    linter: { tr: 'Linter hataları temizlendi mi?', en: 'Were linter errors fixed?' },
    edgeCases: { tr: 'Edge case\'ler handle edildi mi?', en: 'Were edge cases handled?' },
  };

  const aiSuggestions = {
    tr: [
      'Error handling için try-catch blokları ekleyin',
      'Fonksiyonlar için JSDoc yorumları yazın',
      'Input validasyonu için Zod kullanmayı düşünün',
    ],
    en: [
      'Add try-catch blocks for error handling',
      'Write JSDoc comments for functions',
      'Consider using Zod for input validation',
    ],
  };

  const getChecklistLabel = (labelKey: string): string => {
    return checklistLabels[labelKey]?.[language] || labelKey;
  };

  const toggleChecklist = (id: number) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const completedRequired = checklist.filter((c) => c.required && c.checked).length;
  const totalRequired = checklist.filter((c) => c.required).length;

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult(completedRequired === totalRequired ? 'success' : 'warning');
    }, 2000);
  };

  return (
    <div className="h-full flex gap-6">
      {/* Code Editor Section */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t.submissionTitle}</h1>
            <p className="text-muted-foreground mt-1">{t.submissionDesc}</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {t.uploadFile}
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="btn-primary flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  {t.analyzing}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  {t.analyzeSubmit}
                </>
              )}
            </button>
          </div>
        </div>

        {/* IDE-like Editor */}
        <div className="flex-1 glass-card overflow-hidden flex flex-col">
          {/* Editor Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/80" />
              <div className="w-3 h-3 rounded-full bg-warning/80" />
              <div className="w-3 h-3 rounded-full bg-success/80" />
            </div>
            <div className="flex-1 flex items-center gap-2 ml-4">
              <div className="px-3 py-1.5 bg-secondary rounded-t-md border-b-2 border-primary flex items-center gap-2">
                <FileCode className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">authService.ts</span>
              </div>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 flex">
            {/* Line Numbers */}
            <div className="w-12 bg-muted/20 text-right py-4 pr-3 text-xs text-muted-foreground font-mono select-none border-r border-border">
              {code.split('\n').map((_, i) => (
                <div key={i} className="leading-6">{i + 1}</div>
              ))}
            </div>

            {/* Code Area */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="code-editor flex-1 border-0 rounded-none bg-transparent leading-6"
              spellCheck={false}
            />
          </div>

          {/* Terminal Output */}
          {analysisResult && (
            <div className="border-t border-border p-4 bg-muted/30 animate-slide-up">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{t.analysisResult}</span>
              </div>
              <div className={`p-3 rounded-lg ${
                analysisResult === 'success' 
                  ? 'bg-success/10 border border-success/30' 
                  : 'bg-warning/10 border border-warning/30'
              }`}>
                <div className="flex items-start gap-2">
                  {analysisResult === 'success' ? (
                    <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      analysisResult === 'success' ? 'text-success' : 'text-warning'
                    }`}>
                      {analysisResult === 'success' ? t.analysisSuccess : t.analysisWarning}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {analysisResult === 'success'
                        ? language === 'tr' 
                          ? 'Kod kalitesi: 92/100 | Complexity: Düşük | Testler: 4/4 Geçti'
                          : 'Code quality: 92/100 | Complexity: Low | Tests: 4/4 Passed'
                        : `${language === 'tr' ? 'Gereksinimler' : 'Requirements'}: ${completedRequired}/${totalRequired} ${language === 'tr' ? 'tamamlandı' : 'completed'}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checklist Sidebar */}
      <div className="w-80 flex-shrink-0 glass-card p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">{t.requirementsList}</h2>
          <span className={`badge ${
            completedRequired === totalRequired 
              ? 'bg-success/20 text-success' 
              : 'bg-warning/20 text-warning'
          }`}>
            {completedRequired}/{totalRequired}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-cyber space-y-2">
          {checklist.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleChecklist(item.id)}
              className={`w-full p-3 rounded-lg text-left flex items-start gap-3 transition-all duration-200 ${
                item.checked
                  ? 'bg-success/10 border border-success/30'
                  : 'bg-secondary/50 border border-transparent hover:border-border'
              }`}
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                item.checked 
                  ? 'bg-success text-success-foreground' 
                  : 'bg-muted border border-border'
              }`}>
                {item.checked && <Check className="w-3 h-3" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${item.checked ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {getChecklistLabel(item.labelKey)}
                </p>
                {item.required && (
                  <span className="text-xs text-primary mt-1 inline-block">{t.required}</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Analysis Tips */}
        <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">{t.aiSuggestions}</span>
          </div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {aiSuggestions[language].map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
