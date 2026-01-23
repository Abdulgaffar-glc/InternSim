import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/api";

type ActiveMenu = "tasks" | "chat" | "performance" | "submission";

const DashboardContent = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>("tasks");
  const [userField, setUserField] = useState<InternshipField>("frontend");
  const [userLevel, setUserLevel] = useState<InternshipLevel>("junior");
  const { logout } = useAuth();

  // Check for existing internship on mount
  useEffect(() => {
    const checkInternship = async () => {
      try {
        const res = await api.get("/internship/me");
        if (res.data && res.data.status !== "no_active_internship") {
          setUserField(res.data.track as InternshipField);
          setUserLevel(res.data.level as InternshipLevel);
          setIsOnboarded(true);
        }
      } catch (error) {
        console.error("Failed to check internship status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkInternship();
  }, []); // Only run once on mount

  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  const handleOnboardingComplete = async (
    field: InternshipField,
    level: InternshipLevel
  ) => {
    try {
      setIsLoading(true);
      await api.post("/internship/start", {
        track: field,
        level: level,
      });
      setUserField(field);
      setUserLevel(level);
      setIsOnboarded(true);
      toast.success("Internship started successfully!");
    } catch (error) {
      console.error("Failed to start internship:", error);
      toast.error("Failed to start internship. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
