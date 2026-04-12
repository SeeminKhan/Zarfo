import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import api from "@/lib/api"; // fetch-based client

export default function Login() {
  const navigate = useNavigate();
  const { login, user} = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);


// Redirect if already logged in
useEffect(() => {
  if (!loading && user) {
    const role = user.role;
    if (role === "admin") navigate("/admin/dashboard");
    else if (role === "hotel") navigate("/hotel/dashboard");
    else if (role === "robin") navigate("/robin/dashboard");
    else if (role === "worker") navigate("/worker/dashboard");
    else navigate("/user/dashboard");
  }
}, [user, loading]);


  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", form);
      login(data.accessToken, data.user);

      const role = data.user.role;
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "hotel") navigate("/hotel/dashboard");
      else if (role === "robin") navigate("/robin/dashboard");
      else if (role === "worker") navigate("/worker/dashboard");
      else navigate("/user/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color-light)] text-[var(--text-color)] px-4 transition-colors duration-300">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <Card className="w-full max-w-md p-8 rounded-3xl shadow-xl backdrop-blur-md bg-[var(--card-bg)] border-none transition-colors duration-300">
        <CardHeader className="text-center mb-4">
          <CardTitle className="text-3xl font-bold text-[var(--green-primary)]">
            Welcome back
          </CardTitle>
          <p className="text-sm text-[var(--muted-text)] mt-1">
            Sign in to continue your journey with <span className="font-semibold text-[var(--green-primary)]">Zarfo</span>.
          </p>
        </CardHeader>

        {error && (
          <div className="text-red-500 text-sm text-center mb-2">{error}</div>
        )}

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-[var(--muted-text)]" size={18} />
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="pl-10 focus:ring-[var(--green-primary)] focus:border-[var(--green-primary)]"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-[var(--muted-text)]" size={18} />
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="pl-10 pr-10 focus:ring-[var(--green-primary)] focus:border-[var(--green-primary)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-3.5 text-[var(--muted-text)] hover:text-[var(--text-color)] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--green-primary)] hover:bg-[var(--green-dark)] text-white font-semibold py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p className="text-sm text-center mt-5 text-[var(--muted-text)]">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-[var(--green-primary)] font-medium hover:underline cursor-pointer"
            >
              Register
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
