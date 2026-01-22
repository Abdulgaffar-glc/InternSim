import { useState } from 'react';
import { X, Clock, Zap, ChevronRight, Code2, Bug, Database, FileText, Brain, Shield, Server } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { InternshipField, InternshipLevel } from './OnboardingFlow';

interface Task {
  id: number;
  titleKey: string;
  descKey: string;
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

const allTasks: Task[] = [
  // Frontend tasks
  {
    id: 1,
    titleKey: 'frontendTask1',
    descKey: 'frontendTask1Desc',
    difficulty: 'mid',
    xp: 200,
    status: 'progress',
    dueDate: '3',
    icon: Code2,
    field: 'frontend',
  },
  {
    id: 2,
    titleKey: 'frontendTask2',
    descKey: 'frontendTask2Desc',
    difficulty: 'junior',
    xp: 100,
    status: 'todo',
    dueDate: '2',
    icon: Code2,
    field: 'frontend',
  },
  {
    id: 3,
    titleKey: 'frontendTask3',
    descKey: 'frontendTask3Desc',
    difficulty: 'senior',
    xp: 350,
    status: 'done',
    dueDate: '0',
    icon: Code2,
    field: 'frontend',
  },
  // Backend tasks
  {
    id: 4,
    titleKey: 'backendTask1',
    descKey: 'backendTask1Desc',
    difficulty: 'mid',
    xp: 250,
    status: 'progress',
    dueDate: '4',
    icon: Server,
    field: 'backend',
  },
  {
    id: 5,
    titleKey: 'backendTask2',
    descKey: 'backendTask2Desc',
    difficulty: 'junior',
    xp: 150,
    status: 'todo',
    dueDate: '2',
    icon: Database,
    field: 'backend',
  },
  {
    id: 6,
    titleKey: 'backendTask3',
    descKey: 'backendTask3Desc',
    difficulty: 'senior',
    xp: 400,
    status: 'done',
    dueDate: '0',
    icon: Server,
    field: 'backend',
  },
  // AI tasks
  {
    id: 7,
    titleKey: 'aiTask1',
    descKey: 'aiTask1Desc',
    difficulty: 'senior',
    xp: 400,
    status: 'progress',
    dueDate: '5',
    icon: Brain,
    field: 'ai',
  },
  {
    id: 8,
    titleKey: 'aiTask2',
    descKey: 'aiTask2Desc',
    difficulty: 'mid',
    xp: 250,
    status: 'todo',
    dueDate: '3',
    icon: Database,
    field: 'ai',
  },
  {
    id: 9,
    titleKey: 'aiTask3',
    descKey: 'aiTask3Desc',
    difficulty: 'mid',
    xp: 300,
    status: 'done',
    dueDate: '0',
    icon: Brain,
    field: 'ai',
  },
  // Cybersecurity tasks
  {
    id: 10,
    titleKey: 'cyberTask1',
    descKey: 'cyberTask1Desc',
    difficulty: 'mid',
    xp: 250,
    status: 'progress',
    dueDate: '3',
    icon: Shield,
    field: 'cybersecurity',
  },
  {
    id: 11,
    titleKey: 'cyberTask2',
    descKey: 'cyberTask2Desc',
    difficulty: 'senior',
    xp: 350,
    status: 'todo',
    dueDate: '4',
    icon: Bug,
    field: 'cybersecurity',
  },
  {
    id: 12,
    titleKey: 'cyberTask3',
    descKey: 'cyberTask3Desc',
    difficulty: 'junior',
    xp: 150,
    status: 'done',
    dueDate: '0',
    icon: Shield,
    field: 'cybersecurity',
  },
];

export const TaskPanel = ({ field }: TaskPanelProps) => {
  const { t, language } = useLanguage();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'todo' | 'progress' | 'done'>('all');

  const tasks = allTasks.filter((task) => task.field === field);
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
    return t[task.titleKey as keyof typeof t] as string;
  };

  const getTaskDesc = (task: Task): string => {
    return t[task.descKey as keyof typeof t] as string;
  };

  const getDueText = (dueDate: string): string => {
    if (dueDate === '0') return t.completed;
    return language === 'tr' ? `${dueDate} gün` : `${dueDate} days`;
  };

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
