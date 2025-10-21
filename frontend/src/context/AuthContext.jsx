import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refresh = async () => {
      try {
        const { data } = await api.post("/auth/refresh"); // uses HttpOnly cookie

        if (data?.accessToken) {
          localStorage.setItem("zarfo_token", data.accessToken);
          setToken(data.accessToken);

          if (data?.user) {
            setUser(data.user);
          } else {
            const userRes = await api.get("/auth/me");
            setUser(userRes.data);
          }
        }
      } catch (err) {
        setUser(null);
        setToken(null);
        localStorage.removeItem("zarfo_token");
      } finally {
        setLoading(false);
      }
    };

    refresh();
  }, []);

  const login = (accessToken, user) => {
    localStorage.setItem("zarfo_token", accessToken);
    setToken(accessToken);
    setUser(user);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout"); // clears refresh token cookie
    } catch {
      // even if logout request fails, proceed to clear local auth state 
    }
    localStorage.removeItem("zarfo_token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
