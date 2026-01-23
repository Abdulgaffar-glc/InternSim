import { useState } from "react";
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

type ActiveMenu = "tasks" | "chat" | "performance" | "submission";

const DashboardContent = () => {
  const navigate = useNavigate();
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>("tasks");
  const [userField, setUserField] = useState<InternshipField>("frontend");
  const [userLevel, setUserLevel] = useState<InternshipLevel>("junior");

  const handleLogout = () => {
    navigate("/auth");
  };

  const handleOnboardingComplete = (
    field: InternshipField,
    level: InternshipLevel,
  ) => {
    setUserField(field);
    setUserLevel(level);
    setIsOnboarded(true);
  };

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
