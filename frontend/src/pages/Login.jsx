import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, Loader2, ChefHat, ArrowLeft, Building2, Truck, ShoppingBag, Feather } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import api from "@/lib/api";

const DEMO_ACCOUNTS = [
  { role: "Hotel",   email: "demo.hotel@zarfo.com",  password: "demo1234", icon: Building2, color: "bg-green-50 text-green-700 border-green-200",  desc: "List surplus food" },
  { role: "Robin",   email: "demo.robin@zarfo.com",  password: "demo1234", icon: Truck,     color: "bg-blue-50 text-blue-700 border-blue-200",     desc: "Deliver food" },
  { role: "User",    email: "demo.user@zarfo.com",   password: "demo1234", icon: ShoppingBag, color: "bg-purple-50 text-purple-700 border-purple-200", desc: "Buy discounted meals" },
  { role: "Worker",  email: "demo.worker@zarfo.com", password: "demo1234", icon: Feather,   color: "bg-orange-50 text-orange-700 border-orange-200", desc: "Receive free meals" },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [form, setForm]               = useState({ email: "", password: "" });
  const [loading, setLoading]         = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);
  const [error, setError]             = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      const r = user.role;
      if (r === "admin")  navigate("/admin/dashboard");
      else if (r === "hotel")  navigate("/hotel/dashboard");
      else if (r === "robin")  navigate("/robin/dashboard");
      else if (r === "worker") navigate("/worker/dashboard");
      else navigate("/user/dashboard");
    }
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const doLogin = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    login(data.accessToken, data.user);
    const r = data.user.role;
    if (r === "admin")  navigate("/admin/dashboard");
    else if (r === "hotel")  navigate("/hotel/dashboard");
    else if (r === "robin")  navigate("/robin/dashboard");
    else if (r === "worker") navigate("/worker/dashboard");
    else navigate("/user/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await doLogin(form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (account) => {
    setDemoLoading(account.role);
    setError("");
    try {
      await doLogin(account.email, account.password);
    } catch (err) {
      setError(`Demo login failed for ${account.role}. Run the seed script first.`);
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg-color-light)] text-[var(--text-color)]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-primary)] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-black/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 text-center text-white">
          <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <ChefHat className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-black tracking-tight mb-3">Zarfo</h2>
          <p className="text-white/70 text-base leading-relaxed max-w-xs">
            AI-powered food redistribution. Connecting surplus to need, every night.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-left">
            {[
              { label: "Hotels onboarded", value: "120+" },
              { label: "Meals saved",      value: "50k+"  },
              { label: "Night Robins",     value: "300+"  },
              { label: "Workers fed",      value: "10k+"  },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-2xl px-4 py-3">
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-y-auto">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
        <button onClick={() => navigate("/")}
          className="absolute top-4 left-4 flex items-center gap-1.5 text-xs text-[var(--muted-text)] hover:text-[var(--text-color)] transition-colors font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />Back
        </button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--green-primary)] to-[var(--green-dark)] flex items-center justify-center shadow-lg">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-[var(--green-primary)]">Zarfo</span>
          </div>

          <h1 className="text-3xl font-black text-[var(--text-color)] mb-1">Welcome back</h1>
          <p className="text-sm text-[var(--muted-text)] mb-6">
            Sign in to continue your journey with <span className="font-semibold text-[var(--green-primary)]">Zarfo</span>.
          </p>

          {/* Demo access */}
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted-text)] mb-3">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((account) => {
                const Icon = account.icon;
                const isLoading = demoLoading === account.role;
                return (
                  <button
                    key={account.role}
                    onClick={() => handleDemo(account)}
                    disabled={!!demoLoading || loading}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all hover:shadow-sm disabled:opacity-60 ${account.color}`}
                  >
                    <div className="flex-shrink-0">
                      {isLoading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Icon className="w-4 h-4" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold leading-none">{account.role}</p>
                      <p className="text-[10px] opacity-70 mt-0.5 leading-none truncate">{account.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[rgba(0,0,0,0.08)]" />
            <span className="text-[11px] text-[var(--muted-text)] font-medium">or sign in manually</span>
            <div className="flex-1 h-px bg-[rgba(0,0,0,0.08)]" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-color)]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
                <Input type="email" name="email" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} required
                  className="pl-9 h-11 rounded-xl border-[rgba(0,0,0,0.1)] bg-[var(--bg-color-light)] focus:ring-2 focus:ring-[var(--green-primary)]/30" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-color)]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
                <Input type={showPassword ? "text" : "password"} name="password" placeholder="Your password"
                  value={form.password} onChange={handleChange} required
                  className="pl-9 pr-10 h-11 rounded-xl border-[rgba(0,0,0,0.1)] bg-[var(--bg-color-light)] focus:ring-2 focus:ring-[var(--green-primary)]/30" />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-text)] hover:text-[var(--text-color)] transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading || !!demoLoading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[var(--green-primary)] to-[var(--green-dark)] hover:opacity-90 text-white font-bold text-sm border-0 shadow-lg shadow-[var(--green-primary)]/25 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Signing in...</> : "Sign In"}
            </Button>
          </form>

          <p className="text-sm text-center mt-6 text-[var(--muted-text)]">
            Don't have an account?{" "}
            <span onClick={() => navigate("/register")}
              className="text-[var(--green-primary)] font-semibold hover:underline cursor-pointer">
              Create one
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
