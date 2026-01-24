import { useState, useEffect } from 'react';
import { Upload, Check, X, AlertCircle, Code, Sparkles, Play, Terminal, ChevronRight, Star, ChevronDown, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { API_URL } from '@/config';



interface Task {
  id: number;
  title: string;
  description: string;
  requirements: string[];
  field: string;
  status: string;
  xp: number;
}

interface ChecklistItem {
  id: number;
  labelKey: string;
  checked: boolean;
  required: boolean;
}

interface EvaluationResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  mentor_feedback: string;
  xp_earned: number;
}

const initialChecklist: ChecklistItem[] = [
  { id: 1, labelKey: 'cleanCode', checked: false, required: true },
  { id: 2, labelKey: 'unitTests', checked: false, required: true },
  { id: 3, labelKey: 'documentation', checked: false, required: false },
  { id: 4, labelKey: 'codeReview', checked: false, required: true },
  { id: 5, labelKey: 'linter', checked: false, required: true },
  { id: 6, labelKey: 'edgeCases', checked: false, required: false },
];

export const SubmissionHub = () => {
  const { t, language } = useLanguage();
  const [code, setCode] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [checklist, setChecklist] = useState(initialChecklist);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [timeSpent, setTimeSpent] = useState<number>(30); // Minutes

  const getToken = () => localStorage.getItem('token');

  // Fetch user's tasks
  useEffect(() => {
    const fetchTasks = async () => {
      const token = getToken();
      if (!token) {
        setLoadingTasks(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/tasks/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Filter to show only in-progress tasks
          const inProgressTasks = data.filter((t: any) => t.status === 'progress' || t.status === 'todo');
          setTasks(inProgressTasks.map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            requirements: t.requirements || [],
            field: t.field,
            status: t.status,
            xp: t.xp
          })));
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, []);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const getChecklistLabel = (labelKey: string): string => {
    const labels: Record<string, Record<string, string>> = {
      cleanCode: { tr: 'Temiz Kod', en: 'Clean Code' },
      unitTests: { tr: 'Birim Testleri', en: 'Unit Tests' },
      documentation: { tr: 'Dokümantasyon', en: 'Documentation' },
      codeReview: { tr: 'Kod İncelemesi', en: 'Code Review' },
      linter: { tr: 'Linter Kontrolü', en: 'Linter Check' },
      edgeCases: { tr: 'Edge Case Kontrolü', en: 'Edge Cases' },
    };
    return labels[labelKey]?.[language] || labelKey;
  };

  const toggleChecklist = (id: number) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const requiredComplete = checklist
    .filter(item => item.required)
    .every(item => item.checked);

  const handleAnalyze = async () => {
    if (!selectedTaskId || !code.trim()) {
      return;
    }

    const token = getToken();
    if (!token) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/ai-feedback/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          task_id: selectedTaskId,
          submission: code,
          time_spent_minutes: timeSpent
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult({
          score: data.score,
          strengths: data.strengths,
          weaknesses: data.weaknesses,
          mentor_feedback: data.mentor_feedback,
          xp_earned: data.xp_earned
        });

        // Remove the task from the list (it's now completed)
        setTasks(prev => prev.filter(t => t.id !== selectedTaskId));
        setSelectedTaskId(null);
      } else {
        const errorData = await response.json();
        console.error('Evaluation failed:', errorData);
      }
    } catch (error) {
      console.error('Error during evaluation:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-success/20';
    if (score >= 60) return 'bg-warning/20';
    return 'bg-destructive/20';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t.submissionTitle}</h1>
        <p className="text-muted-foreground mt-1">{t.submissionDesc}</p>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
        {/* Left: Code Editor */}
        <div className="flex flex-col min-h-0">
          {/* Task Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              {language === 'tr' ? 'Teslim Edilecek Görev' : 'Task to Submit'}
            </label>
            <div className="relative">
              <button
                onClick={() => setShowTaskDropdown(!showTaskDropdown)}
                className="w-full px-4 py-3 bg-secondary rounded-lg text-left flex items-center justify-between hover:bg-secondary/80 transition-colors"
              >
                {loadingTasks ? (
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {language === 'tr' ? 'Yükleniyor...' : 'Loading...'}
                  </span>
                ) : selectedTask ? (
                  <span className="text-foreground">{selectedTask.title}</span>
                ) : (
                  <span className="text-muted-foreground">
                    {language === 'tr' ? 'Görev seçin...' : 'Select a task...'}
                  </span>
                )}
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showTaskDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showTaskDropdown && tasks.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {tasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setShowTaskDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                    >
                      <p className="font-medium text-foreground">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
                    </button>
                  ))}
                </div>
              )}

              {showTaskDropdown && tasks.length === 0 && !loadingTasks && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 p-4 text-center">
                  <p className="text-muted-foreground">
                    {language === 'tr'
                      ? 'Teslim edilecek aktif görev yok. Önce bir görev oluşturun ve başlatın.'
                      : 'No active tasks to submit. Create and start a task first.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Selected Task Requirements */}
          {selectedTask && selectedTask.requirements && selectedTask.requirements.length > 0 && (
            <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                {language === 'tr' ? 'Bu Görevin İsterleri' : 'Task Requirements'}
              </h4>
              <ul className="space-y-1.5">
                {selectedTask.requirements.map((req, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary font-medium">{index + 1}.</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Code Editor */}
          <div className="glass-card p-4 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">
                  {language === 'tr' ? 'Kod Editörü' : 'Code Editor'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {language === 'tr' ? 'Harcanan Süre:' : 'Time Spent:'}
                </span>
                <input
                  type="number"
                  value={timeSpent}
                  onChange={(e) => setTimeSpent(parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 bg-muted rounded text-foreground text-center"
                  min="1"
                />
                <span className="text-muted-foreground">
                  {language === 'tr' ? 'dk' : 'min'}
                </span>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={language === 'tr'
                ? '// Kodunuzu buraya yapıştırın...\n\nfunction example() {\n  // implementation\n}'
                : '// Paste your code here...\n\nfunction example() {\n  // implementation\n}'}
              className="flex-1 w-full p-4 bg-background rounded-lg border border-border font-mono text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Right: Checklist & Results */}
        <div className="flex flex-col gap-4 min-h-0 overflow-y-auto scrollbar-cyber">
          {/* Pre-submission Checklist */}
          <div className="glass-card p-4">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              {language === 'tr' ? 'Teslim Öncesi Kontrol Listesi' : 'Pre-submission Checklist'}
            </h3>
            <div className="space-y-2">
              {checklist.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${item.checked
                    ? 'bg-success/10 border border-success/30'
                    : 'bg-muted/50 border border-transparent hover:border-border'
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.checked ? 'bg-success' : 'border-2 border-muted-foreground'
                    }`}>
                    {item.checked && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`flex-1 text-left ${item.checked ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {getChecklistLabel(item.labelKey)}
                  </span>
                  {item.required && (
                    <span className="text-xs text-destructive">
                      {language === 'tr' ? 'Zorunlu' : 'Required'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleAnalyze}
            disabled={!requiredComplete || isAnalyzing || !code.trim() || !selectedTaskId}
            className={`btn-primary flex items-center justify-center gap-2 py-4 text-lg ${(!requiredComplete || !code.trim() || !selectedTaskId) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-5 h-5 animate-pulse" />
                {language === 'tr' ? 'AI Değerlendiriyor...' : 'AI Evaluating...'}
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                {language === 'tr' ? 'Teslim Et ve Değerlendir' : 'Submit & Evaluate'}
              </>
            )}
          </button>

          {!selectedTaskId && (
            <p className="text-sm text-center text-muted-foreground">
              {language === 'tr'
                ? 'Lütfen önce teslim edeceğiniz görevi seçin'
                : 'Please select a task to submit first'}
            </p>
          )}

          {/* Results */}
          {result && (
            <div className="glass-card p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {language === 'tr' ? 'AI Değerlendirme Sonucu' : 'AI Evaluation Result'}
                </h3>
                <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${getScoreBgColor(result.score)}`}>
                  <Star className={`w-6 h-6 ${getScoreColor(result.score)}`} />
                  <span className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}
                  </span>
                  <span className="text-muted-foreground">/100</span>
                </div>
              </div>

              {/* XP Earned */}
              <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/30">
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-medium">
                    {language === 'tr' ? 'Kazanılan XP' : 'XP Earned'}
                  </span>
                  <span className="text-2xl font-bold text-primary">+{result.xp_earned} XP</span>
                </div>
              </div>

              {/* Strengths */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-success mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {language === 'tr' ? 'Güçlü Yönler' : 'Strengths'}
                </h4>
                <ul className="space-y-1.5">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-warning mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {language === 'tr' ? 'Geliştirilebilir Alanlar' : 'Areas for Improvement'}
                </h4>
                <ul className="space-y-1.5">
                  {result.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mentor Feedback */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {language === 'tr' ? 'Mentor Geri Bildirimi' : 'Mentor Feedback'}
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {result.mentor_feedback}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
