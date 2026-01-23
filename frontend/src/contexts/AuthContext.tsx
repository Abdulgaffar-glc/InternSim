import { createContext, useContext, useEffect, useState } from "react";
import api from "@/api/api";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  /** 🔁 Shared logic */
  const loadUser = async () => {
    try {
      const res = await api.get("/auth/protected");
      setUser(res.data);
    } catch {
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });

    const token = res.data.access_token;
    localStorage.setItem("token", token);

    // 🔥 SET HEADER
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const me = await api.get("/auth/protected");
    setUser(me.data);
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await api.post("/auth/register", { email, password, name });
    localStorage.setItem("token", res.data.access_token);
    await loadUser();
  };

  const logout = () => {
    console.log("LOGOUT CALLED");

    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);

    console.log("TOKEN AFTER LOGOUT:", localStorage.getItem("token"));
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      try {
        const res = await api.get("/auth/protected");
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
