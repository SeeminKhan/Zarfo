import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChefHat, ArrowLeft, User, Mail, Lock, MapPin, Building2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import api from "@/lib/api";

const roles = [
  { label: "Hotel Partner",           value: "hotel",  desc: "List surplus food"         },
  { label: "Customer",                value: "user",   desc: "Buy discounted meals"       },
  { label: "Night Robin (Volunteer)", value: "robin",  desc: "Deliver food to workers"    },
  { label: "Night Worker (Recipient)",value: "worker", desc: "Receive free meals"         },
];

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [roleOpen, setRoleOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", role: "user", email: "", password: "",
    houseNo: "", suburb: "", city: "", state: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", {
        name: form.name, email: form.email, password: form.password, role: form.role,
        address: { houseNo: form.houseNo, suburb: form.suburb, city: form.city, state: form.state },
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roles.find((r) => r.value === form.role);

  return (
    <div className="min-h-screen flex bg-[var(--bg-color-light)] text-[var(--text-color)]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-primary)] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-black/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 text-white text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <ChefHat className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-black tracking-tight mb-3">Join Zarfo</h2>
          <p className="text-white/70 text-base leading-relaxed max-w-xs">
            Choose your role and start making a difference in food redistribution tonight.
          </p>
          <div className="mt-10 space-y-3 text-left">
            {roles.map((r) => (
              <div key={r.value} onClick={() => setForm({ ...form, role: r.value })}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all ${
                  form.role === r.value ? "bg-white/25 border border-white/30" : "bg-white/10 hover:bg-white/15"
                }`}>
                <div className={`w-2 h-2 rounded-full ${form.role === r.value ? "bg-white" : "bg-white/40"}`} />
                <div>
                  <p className="text-sm font-bold text-white">{r.label}</p>
                  <p className="text-white/60 text-xs">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-y-auto">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
        <button onClick={() => navigate("/")}
          className="absolute top-4 left-4 flex items-center gap-1.5 text-xs text-[var(--muted-text)] hover:text-[var(--text-color)] transition-colors font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />Back
        </button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="w-full max-w-lg">
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--green-primary)] to-[var(--green-dark)] flex items-center justify-center shadow-lg">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-[var(--green-primary)]">Zarfo</span>
          </div>

          <h1 className="text-3xl font-black text-[var(--text-color)] mb-1">Create account</h1>
          <p className="text-sm text-[var(--muted-text)] mb-6">Join the food redistribution movement.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name + Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[var(--green-primary)]" />Full Name
                </Label>
                <Input name="name" placeholder="Your full name" value={form.name} onChange={handleChange} required
                  className="h-10 rounded-xl border-[rgba(0,0,0,0.1)] bg-[var(--bg-color-light)] focus:ring-2 focus:ring-[var(--green-primary)]/30 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Role</Label>
                <div className="relative">
                  <button type="button" onClick={() => setRoleOpen((v) => !v)}
                    className="w-full h-10 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[var(--bg-color-light)] px-3 text-sm text-left flex items-center justify-between focus:ring-2 focus:ring-[var(--green-primary)]/30 transition-all">
                    <span className="font-medium">{selectedRole?.label}</span>
                    <ChevronDown className={`w-4 h-4 text-[var(--muted-text)] transition-transform ${roleOpen ? "rotate-180" : ""}`} />
                  </button>
                  {roleOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--card-bg)] border border-[rgba(0,0,0,0.08)] rounded-xl shadow-xl z-20 overflow-hidden">
                      {roles.map((r) => (
                        <button key={r.value} type="button"
                          onClick={() => { setForm({ ...form, role: r.value }); setRoleOpen(false); }}
                          className={`w-full text-left px-3 py-2.5 text-sm hover:bg-[var(--bg-color-light)] transition-colors ${form.role === r.value ? "text-[var(--green-primary)] font-semibold" : ""}`}>
                          {r.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Email + Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[var(--green-primary)]" />Email
                </Label>
                <Input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required
                  className="h-10 rounded-xl border-[rgba(0,0,0,0.1)] bg-[var(--bg-color-light)] focus:ring-2 focus:ring-[var(--green-primary)]/30 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[var(--green-primary)]" />Password
                </Label>
                <Input type="password" name="password" placeholder="Min 8 characters" value={form.password} onChange={handleChange} required
                  className="h-10 rounded-xl border-[rgba(0,0,0,0.1)] bg-[var(--bg-color-light)] focus:ring-2 focus:ring-[var(--green-primary)]/30 text-sm" />
              </div>
            </div>

            {/* Address */}
            <div>
              <Label className="text-xs font-semibold flex items-center gap-1.5 mb-3">
                <MapPin className="w-3.5 h-3.5 text-[var(--green-primary)]" />Address
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "houseNo", placeholder: "House / Street" },
                  { name: "suburb",  placeholder: "Suburb"         },
                  { name: "city",    placeholder: "City"           },
                  { name: "state",   placeholder: "State"          },
                ].map((f) => (
                  <Input key={f.name} name={f.name} placeholder={f.placeholder} value={form[f.name]} onChange={handleChange}
                    className="h-10 rounded-xl border-[rgba(0,0,0,0.1)] bg-[var(--bg-color-light)] focus:ring-2 focus:ring-[var(--green-primary)]/30 text-sm" />
                ))}
              </div>
            </div>

            <Button type="submit" disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[var(--green-primary)] to-[var(--green-dark)] hover:opacity-90 text-white font-bold text-sm border-0 shadow-lg shadow-[var(--green-primary)]/25 mt-1">
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-sm text-center mt-5 text-[var(--muted-text)]">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")} className="text-[var(--green-primary)] font-semibold hover:underline cursor-pointer">
              Sign in
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
