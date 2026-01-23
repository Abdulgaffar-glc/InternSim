import { useNavigate } from "react-router-dom";
import { AuthScreen } from "@/components/AuthScreen";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    navigate("/dashboard");
  };

  return <AuthScreen onLogin={handleLogin} />;
};

export default Auth;
