import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthScreen } from "@/components/AuthScreen";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Auth = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialView = searchParams.get("view") === "register" ? "register" : "login";

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Login failed");
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    try {
      await register(email, password, name);
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Registration failed");
    }
  };

  return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} initialView={initialView} />;
};


export default Auth;
