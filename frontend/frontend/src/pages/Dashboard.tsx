import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { TaskPanel } from "@/components/TaskPanel";
import { MentorChat } from "@/components/MentorChat";
import { PerformanceDashboard } from "@/components/PerformanceDashboard";
import { SubmissionHub } from "@/components/SubmissionHub";
import {
  OnboardingFlow,
  InternshipField,
  InternshipLevel,
} from "@/components/OnboardingFlow";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Loader2, Menu, Terminal } from "lucide-react";
import { API_URL } from "@/config";



type ActiveMenu = "tasks" | "chat" | "performance" | "submission";

const DashboardContent = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>("tasks");
  const [userField, setUserField] = useState<InternshipField>("frontend");
  const [userLevel, setUserLevel] = useState<InternshipLevel>("junior");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if user already has field and level set
  useEffect(() => {
    const checkUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();

          // If user has field and level already set, skip onboarding
          if (data.internship_field && data.internship_level) {
            setUserField(data.internship_field as InternshipField);
            setUserLevel(data.internship_level as InternshipLevel);
            setIsOnboarded(true);
          }
        } else if (response.status === 401) {
          // Token expired, redirect to login
          localStorage.removeItem('token');
          navigate('/auth');
          return;
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate("/");
  };

  const handleOnboardingComplete = async (
    field: InternshipField,
    level: InternshipLevel,
  ) => {
    // Save to API
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`${API_URL}/users/me`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            internship_field: field,
            internship_level: level
          })
        });
      } catch (error) {
        console.error('Failed to save onboarding data:', error);
      }
    }

    setUserField(field);
    setUserLevel(level);
    setIsOnboarded(true);
  };

  // Show loading while checking profile
  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isOnboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  const renderContent = () => {
    switch (activeMenu) {
      case "tasks":
        return <TaskPanel field={userField} level={userLevel} />;
      case "chat":
        return <MentorChat />;
      case "performance":
        return <PerformanceDashboard />;
      case "submission":
        return <SubmissionHub />;
      default:
        return <TaskPanel field={userField} level={userLevel} />;
    }
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          activeMenu={activeMenu}
          onMenuChange={(menu) => setActiveMenu(menu as ActiveMenu)}
          onLogout={handleLogout}
          userField={userField}
          userLevel={userLevel}
          collapsed={isSidebarCollapsed}
          onCollapseToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-border flex items-center justify-between bg-sidebar">
           <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center neon-glow">
              <Terminal className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-gradient-primary">InternSim</span>
          </div>
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="p-2 hover:bg-muted rounded-md">
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80 border-r-sidebar-border bg-sidebar">
              <Sidebar
                activeMenu={activeMenu}
                onMenuChange={(menu) => {
                  setActiveMenu(menu as ActiveMenu);
                  setIsMobileMenuOpen(false);
                }}
                onLogout={handleLogout}
                userField={userField}
                userLevel={userLevel}
                isMobile={true}
              />
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="h-full animate-fade-in">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
};

const Dashboard = () => {
  return (
    <LanguageProvider>
      <DashboardContent />
    </LanguageProvider>
  );
};

export default Dashboard;
