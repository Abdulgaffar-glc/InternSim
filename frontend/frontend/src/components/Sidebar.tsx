import { useState, useEffect } from 'react';
import { Terminal, ClipboardList, MessageSquare, BarChart3, Upload, LogOut, User, Sparkles, Code2, Server, Brain, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { InternshipField, InternshipLevel } from './OnboardingFlow';
import { API_URL } from '@/config';



interface UserData {
  name: string;
  level: number;
  current_xp: number;
  next_level_xp: number;
  xp_progress: number;
  xp_needed: number;
  internship_field: string;
  internship_level: string;
}

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  onLogout: () => void;
  userField: InternshipField;
  userLevel: InternshipLevel;
  isOpen?: boolean;
  onClose?: () => void;
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

export const Sidebar = ({ activeMenu, onMenuChange, onLogout, userField, userLevel, isOpen = false, onClose }: SidebarProps) => {
  const { t } = useLanguage();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/users/me/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData({
            name: data.user?.name || 'Stajyer',
            level: data.level || 1,
            current_xp: data.current_xp || 0,
            next_level_xp: data.next_level_xp || 500,
            xp_progress: data.xp_progress || 0,
            xp_needed: data.xp_needed || 500,
            internship_field: data.user?.internship_field || userField,
            internship_level: data.user?.internship_level || userLevel
          });
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userField, userLevel]);

  const menuItems = [
    { id: 'tasks', label: t.taskPanel, icon: ClipboardList },
    { id: 'chat', label: t.aiMentor, icon: MessageSquare },
    { id: 'performance', label: t.performance, icon: BarChart3 },
    { id: 'submission', label: t.projectSubmission, icon: Upload },
  ];

  // Use API data or fallback to props
  const displayField = (userData?.internship_field as InternshipField) || userField;
  const displayLevel = (userData?.internship_level as InternshipLevel) || userLevel;

  const FieldIcon = fieldIcons[displayField] || Code2;
  const levelLabels = { junior: t.junior, mid: t.mid, senior: t.senior };
  const fieldLabels = { frontend: t.frontend, backend: t.backend, ai: t.ai, cybersecurity: t.cybersecurity };

  // Calculate XP percentage
  const xpPercentage = userData
    ? Math.round((userData.xp_progress / userData.xp_needed) * 100)
    : 0;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 h-screen bg-sidebar border-r border-sidebar-border flex flex-col
        transition-transform duration-300 ease-in-out md:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
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
            {/* Mobile Close Button */}
            {onClose && (
              <button 
                onClick={onClose}
                className="md:hidden p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 mx-4 mt-4 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-20"></div>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-foreground truncate">
                    {userData?.name || 'Stajyer'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <FieldIcon className={`w-3 h-3 ${fieldColors[displayField] || 'text-primary'}`} />
                    <p className="text-xs text-muted-foreground">
                      {levelLabels[displayLevel]} {fieldLabels[displayField]}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t.level}</span>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-semibold text-primary">
                  {loading ? '--' : userData?.level || 1}
                </span>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">XP</span>
                <span className="text-foreground">
                  {loading ? '--' : `${userData?.current_xp?.toLocaleString() || 0} / ${userData?.next_level_xp?.toLocaleString() || 500}`}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill transition-all duration-500"
                  style={{ width: `${xpPercentage}%` }}
                />
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
                onClick={() => {
                  onMenuChange(item.id);
                  onClose?.(); // Close menu on selection on mobile
                }}
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
    </>
  );
};
