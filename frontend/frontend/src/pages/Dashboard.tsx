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
import { Loader2 } from "lucide-react";
import { API_URL } from "@/config";



type ActiveMenu = "tasks" | "chat" | "performance" | "submission";

const DashboardContent = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>("tasks");
  const [userField, setUserField] = useState<InternshipField>("frontend");
  const [userLevel, setUserLevel] = useState<InternshipLevel>("junior");

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
      <Sidebar
        activeMenu={activeMenu}
        onMenuChange={(menu) => setActiveMenu(menu as ActiveMenu)}
        onLogout={handleLogout}
        userField={userField}
        userLevel={userLevel}
      />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="h-full animate-fade-in">{renderContent()}</div>
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
