import { useNavigate } from "react-router-dom";
import { AuthScreen } from "@/components/AuthScreen";
import { LanguageProvider } from "@/contexts/LanguageContext";
import api from "@/api/api";

const AuthContent = () => {
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data);

      // ✅ TEMP: navigate after success
      navigate("/dashboard");
    } catch (err) {
      console.error("LOGIN FAILED:", err);
    }
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
