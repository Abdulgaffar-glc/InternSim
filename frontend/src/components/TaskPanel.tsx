import { useState, useEffect } from 'react';
import { X, Clock, Zap, ChevronRight, Code2, Bug, Database, FileText, Brain, Shield, Server, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { InternshipField, InternshipLevel } from './OnboardingFlow';
import api from "@/api/api";
import { toast } from 'sonner';

interface Task {
  id: number;
  title: string;
  description: string;
  difficulty: 'junior' | 'mid' | 'senior';
  xp: number;
  status: 'todo' | 'progress' | 'done';
  dueDate: string;
  icon: React.ElementType;
  field: InternshipField;
}

interface TaskPanelProps {
  field: InternshipField;
  level: InternshipLevel;
}

const getXPFromDifficulty = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'junior': return 100;
    case 'mid': return 250;
    case 'senior': return 400;
    default: return 100;
  }
};

const getIconFromField = (field: string) => {
  switch (field) {
    case 'ai': return Brain;
    case 'cybersecurity': return Shield;
    case 'backend': return Server;
    default: return Code2;
  }
};

export const TaskPanel = ({ field }: TaskPanelProps) => {
  const { t, language } = useLanguage();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'todo' | 'progress' | 'done'>('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/task/list");
      // Map backend tasks to frontend structure
      const mappedTasks = res.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        difficulty: item.difficulty || 'junior',
        xp: getXPFromDifficulty(item.difficulty || 'junior'),
        status: (item.status === 'active' ? 'progress' : item.status) as 'todo' | 'progress' | 'done',
        dueDate: '3', // Default for now
        icon: getIconFromField(field),
        field: field
      }));
      setTasks(mappedTasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      toast.error("Could not load tasks");
    } finally {
      setIsLoading(false);
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

  const getTaskTitle = (task: Task): string => {
    return task.title;
  };

  const getTaskDesc = (task: Task): string => {
    return task.description;
  };

  const getDueText = (dueDate: string): string => {
    if (dueDate === '0') return t.completed;
    return language === 'tr' ? `${dueDate} gün` : `${dueDate} days`;
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.taskPanelTitle}</h1>
          <p className="text-muted-foreground mt-1">{t.taskPanelDesc}</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'todo', 'progress', 'done'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                filter === f
                  ? 'bg-primary text-primary-foreground neon-glow'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {f === 'all' ? t.all : statusConfig[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
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
              <FileText className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto scrollbar-cyber space-y-3">
        {filteredTasks.map((task) => {
          const Icon = task.icon;
          return (
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
                        {getTaskTitle(task)}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {getTaskDesc(task)}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className={`badge ${difficultyConfig[task.difficulty].class}`}>
                      {difficultyConfig[task.difficulty].label}
                    </span>
                    <span className={`badge ${statusConfig[task.status].class}`}>
                      {statusConfig[task.status].label}
                    </span>
                    <span className="badge bg-primary/20 text-primary">
                      <Zap className="w-3 h-3 mr-1 inline" />
                      {task.xp} XP
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {getDueText(task.dueDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass-card w-full max-w-2xl mx-4 p-6 animate-slide-up neon-border">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <selectedTask.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{getTaskTitle(selectedTask)}</h2>
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
                <p className="text-muted-foreground">{getTaskDesc(selectedTask)}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground mb-1">{t.difficulty}</p>
                  <span className={`badge ${difficultyConfig[selectedTask.difficulty].class}`}>
                    {difficultyConfig[selectedTask.difficulty].label}
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
                {selectedTask.status !== 'done' && (
                  <button className="btn-primary flex-1">
                    {selectedTask.status === 'todo' ? t.startTask : t.markAsDone}
                  </button>
                )}
                <button
                  onClick={() => setSelectedTask(null)}
                  className="btn-secondary"
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
