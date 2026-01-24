import { useState, useEffect } from 'react';
import { X, Clock, Zap, ChevronRight, Code2, Brain, Shield, Server, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { InternshipField, InternshipLevel } from './OnboardingFlow';
import { API_URL } from '@/config';

interface Task {
  id: number;
  title: string;
  description: string;
  requirements: string[];
  difficulty: 'junior' | 'mid' | 'senior';
  xp: number;
  status: 'todo' | 'progress' | 'done';
  dueDate: string;
  field: string;
  score?: number;
}

interface TaskPanelProps {
  field: InternshipField;
  level: InternshipLevel;
}



const fieldIcons: Record<string, React.ElementType> = {
  frontend: Code2,
  backend: Server,
  ai: Brain,
  cybersecurity: Shield,
};

export const TaskPanel = ({ field, level }: TaskPanelProps) => {
  const { t, language } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'todo' | 'progress' | 'done'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch tasks on mount and when field changes
  useEffect(() => {
    fetchTasks();
  }, [field]);

  const getToken = () => localStorage.getItem('token');

  const fetchTasks = async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/tasks/?field=${field}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          requirements: t.requirements || [],
          difficulty: t.difficulty || 'mid',
          xp: t.xp || 100,
          status: t.status || 'todo',
          dueDate: t.due_days?.toString() || '3',
          field: t.field,
          score: t.score
        })));
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewTask = async () => {
    const token = getToken();
    if (!token) return;

    try {
      setIsGenerating(true);
      const response = await fetch(`${API_URL}/tasks/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          domain: field,
          level: level,
          language: language  // Send current language for Turkish/English tasks
        })
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks(prev => [{
          id: newTask.id,
          title: newTask.title,
          description: newTask.description,
          requirements: newTask.requirements || [],
          difficulty: newTask.difficulty,
          xp: newTask.xp,
          status: newTask.status,
          dueDate: '3',
          field: newTask.field
        }, ...prev]);
      }
    } catch (error) {
      console.error('Failed to generate task:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}/status?status=${newStatus}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: newStatus as any } : t
        ));
        if (selectedTask?.id === taskId) {
          setSelectedTask({ ...selectedTask, status: newStatus as any });
        }
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  const groupedTasks = {
    todo: tasks.filter((t) => t.status === 'todo'),
    progress: tasks.filter((t) => t.status === 'progress'),
    done: tasks.filter((t) => t.status === 'done'),
  };

  const statusConfig = {
    todo: { label: t.todo, class: 'badge-status-todo' },
    progress: { label: t.inProgress, class: 'badge-status-progress' },
    done: { label: t.done, class: 'badge-status-done' },
  };

  const difficultyConfig = {
    junior: { label: t.junior, class: 'badge-junior' },
    mid: { label: t.mid, class: 'badge-mid' },
    senior: { label: t.senior, class: 'badge-senior' },
  };

  const getDueText = (dueDate: string): string => {
    if (dueDate === '0') return t.completed;
    return language === 'tr' ? `${dueDate} gün` : `${dueDate} days`;
  };

  const Icon = fieldIcons[field] || Code2;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.taskPanelTitle}</h1>
          <p className="text-muted-foreground mt-1">{t.taskPanelDesc}</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={generateNewTask}
            disabled={isGenerating}
            className="btn-primary flex items-center gap-2 flex-grow md:flex-grow-0 justify-center"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {language === 'tr' ? 'Oluşturuluyor...' : 'Generating...'}
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                {language === 'tr' ? 'AI Görev Oluştur' : 'Generate AI Task'}
              </>
            )}
          </button>
          <div className="flex gap-2 bg-secondary/50 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
            {(['all', 'todo', 'progress', 'done'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap flex-1 ${filter === f
                ? 'bg-primary text-primary-foreground neon-glow'
                : 'bg-transparent text-secondary-foreground hover:bg-white/5'
                }`}
            >
              {f === 'all' ? t.all : statusConfig[f].label}
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{t.pending}</p>
              <p className="text-3xl font-bold text-foreground mt-1">{groupedTasks.todo.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{t.ongoing}</p>
              <p className="text-3xl font-bold text-accent mt-1">{groupedTasks.progress.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-accent" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{t.completed}</p>
              <p className="text-3xl font-bold text-success mt-1">{groupedTasks.done.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto scrollbar-cyber space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <Icon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {language === 'tr' ? 'Henüz görev yok' : 'No tasks yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === 'tr'
                ? 'AI ile yeni bir görev oluşturun!'
                : 'Generate a new task with AI!'}
            </p>
            <button onClick={generateNewTask} className="btn-primary">
              <Zap className="w-4 h-4 mr-2" />
              {language === 'tr' ? 'Görev Oluştur' : 'Generate Task'}
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="task-card group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {task.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className={`badge ${difficultyConfig[task.difficulty]?.class || 'badge-mid'}`}>
                      {difficultyConfig[task.difficulty]?.label || task.difficulty}
                    </span>
                    <span className={`badge ${statusConfig[task.status].class}`}>
                      {statusConfig[task.status].label}
                    </span>
                    <span className="badge bg-primary/20 text-primary">
                      <Zap className="w-3 h-3 mr-1 inline" />
                      {task.xp} XP
                    </span>
                    {task.requirements && task.requirements.length > 0 && (
                      <span className="badge bg-muted text-muted-foreground">
                        {task.requirements.length} {language === 'tr' ? 'ister' : 'req.'}
                      </span>
                    )}
                    {task.score !== null && task.score !== undefined && (
                      <span className="badge bg-success/20 text-success">
                        {language === 'tr' ? 'Puan' : 'Score'}: {task.score}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {getDueText(task.dueDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass-card w-full max-w-2xl mx-4 p-6 animate-slide-up neon-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedTask.title}</h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">{t.description}</h4>
                <p className="text-muted-foreground">{selectedTask.description}</p>
              </div>

              {/* Requirements Section */}
              {selectedTask.requirements && selectedTask.requirements.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    {language === 'tr' ? 'Gereksinimler (İsterler)' : 'Requirements'}
                  </h4>
                  <ul className="space-y-2">
                    {selectedTask.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-primary">{index + 1}</span>
                        </div>
                        <span className="text-sm text-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground mb-1">{t.difficulty}</p>
                  <span className={`badge ${difficultyConfig[selectedTask.difficulty]?.class || 'badge-mid'}`}>
                    {difficultyConfig[selectedTask.difficulty]?.label || selectedTask.difficulty}
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground mb-1">{t.status}</p>
                  <span className={`badge ${statusConfig[selectedTask.status].class}`}>
                    {statusConfig[selectedTask.status].label}
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground mb-1">{t.earnXp}</p>
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="font-bold text-primary">{selectedTask.xp}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {selectedTask.status === 'todo' && (
                  <button
                    onClick={() => updateTaskStatus(selectedTask.id, 'progress')}
                    className="btn-primary flex-1 py-3"
                  >
                    {t.startTask}
                  </button>
                )}
                {selectedTask.status === 'progress' && (
                  <p className="text-sm text-muted-foreground flex-1 flex items-center justify-center">
                    {language === 'tr'
                      ? 'Bu görevi tamamlamak için Proje Teslim sayfasından kod gönderin'
                      : 'Submit code from Project Submission page to complete this task'}
                  </p>
                )}
                {selectedTask.status === 'done' && selectedTask.score !== undefined && (
                  <div className="flex-1 p-3 bg-success/10 rounded-lg text-center">
                    <p className="text-success font-semibold">
                      {language === 'tr' ? 'Tamamlandı!' : 'Completed!'}
                      <span className="ml-2">{language === 'tr' ? 'Puan' : 'Score'}: {selectedTask.score}/100</span>
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setSelectedTask(null)}
                  className="btn-secondary py-3 flex-1 md:flex-none"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
