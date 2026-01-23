import { useNavigate } from "react-router-dom";
import { AuthScreen } from "@/components/AuthScreen";
import { LanguageProvider } from "@/contexts/LanguageContext";

const AuthContent = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/dashboard");
  };

  return <AuthScreen onLogin={handleLogin} />;
};

const Auth = () => {
  return (
    <LanguageProvider>
      <AuthContent />
    </LanguageProvider>
  );
};

export default Auth;
