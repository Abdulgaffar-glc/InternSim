import { Terminal, ClipboardList, MessageSquare, BarChart3, Upload, LogOut, User, Sparkles, Code2, Server, Brain, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { InternshipField, InternshipLevel } from './OnboardingFlow';

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  onLogout: () => void;
  userField: InternshipField;
  userLevel: InternshipLevel;
}

const fieldIcons = {
  frontend: Code2,
  backend: Server,
  ai: Brain,
  cybersecurity: Shield,
};

const fieldColors = {
  frontend: 'text-blue-400',
  backend: 'text-green-400',
  ai: 'text-purple-400',
  cybersecurity: 'text-red-400',
};

export const Sidebar = ({ activeMenu, onMenuChange, onLogout, userField, userLevel }: SidebarProps) => {
  const { t } = useLanguage();
  
  const menuItems = [
    { id: 'tasks', label: t.taskPanel, icon: ClipboardList },
    { id: 'chat', label: t.aiMentor, icon: MessageSquare },
    { id: 'performance', label: t.performance, icon: BarChart3 },
    { id: 'submission', label: t.projectSubmission, icon: Upload },
  ];

  const FieldIcon = fieldIcons[userField];
  const levelLabels = { junior: t.junior, mid: t.mid, senior: t.senior };
  const fieldLabels = { frontend: t.frontend, backend: t.backend, ai: t.ai, cybersecurity: t.cybersecurity };

  return (
    <div className="w-72 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center neon-glow">
              <Terminal className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-primary">{t.appName}</h1>
              <p className="text-xs text-muted-foreground">{t.virtualInternship}</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 mx-4 mt-4 rounded-xl bg-muted/50 border border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">Ahmet Yılmaz</h3>
            <div className="flex items-center gap-2">
              <FieldIcon className={`w-3 h-3 ${fieldColors[userField]}`} />
              <p className="text-xs text-muted-foreground">
                {levelLabels[userLevel]} {fieldLabels[userField]}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t.level}</span>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-semibold text-primary">12</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">XP</span>
              <span className="text-foreground">2,450 / 3,000</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '82%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-cyber">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-3">
          {t.modules}
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onMenuChange(item.id)}
              className={`sidebar-item w-full ${isActive ? 'active' : ''}`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
              <span className={isActive ? 'text-primary font-medium' : ''}>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={onLogout}
          className="sidebar-item w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <span>{t.logout}</span>
        </button>
      </div>
    </div>
  );
};
