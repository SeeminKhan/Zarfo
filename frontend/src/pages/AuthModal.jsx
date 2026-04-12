// src/components/AuthModal.jsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import api from "@/lib/api"; // fetch-based client

export default function AuthModal({ type, isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "user",
    houseNo: "",
    suburb: "",
    city: "",
    state: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    { label: "Hotel Partner", value: "hotel" },
    { label: "Customer", value: "user" },
    { label: "Night Robin (Volunteer)", value: "robin" },
    { label: "Night Worker (Recipient)", value: "worker" },
  ];

  useEffect(() => {
    if (!isOpen) setError("");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (type === "login") {
        const { data } = await api.post("/auth/login", {
          email: form.email,
          password: form.password,
        });
        onSuccess?.(data); // parent handles login
      } else {
        // register
        const payload = {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          address: {
            houseNo: form.houseNo,
            suburb: form.suburb,
            city: form.city,
            state: form.state,
          },
        };
        await api.post("/auth/register", payload);
        onSuccess?.({ type: "register" });
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--card-bg)] p-8 rounded-2xl w-[90%] max-w-md relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--muted-text)] font-bold text-xl"
        >
          ✕
        </button>

        <div className="absolute top-4 right-16"><ThemeToggle /></div>

        <h2 className="text-2xl font-bold text-[var(--text-color)] mb-6 text-center">
          {type === "login" ? "Login" : "Register"}
        </h2>

        {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {type === "register" && (
            <>
              <Input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                required
                className="p-3 rounded-lg border border-[var(--green-primary)] bg-[var(--bg-color)] text-[var(--text-color)]"
              />
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="p-3 rounded-lg border border-[var(--green-primary)] bg-[var(--bg-color)] text-[var(--text-color)]"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <Input
                name="houseNo"
                placeholder="House/Street"
                value={form.houseNo}
                onChange={handleChange}
                className="p-3 rounded-lg border border-[var(--green-primary)] bg-[var(--bg-color)] text-[var(--text-color)]"
              />
              <Input
                name="suburb"
                placeholder="Suburb"
                value={form.suburb}
                onChange={handleChange}
                className="p-3 rounded-lg border border-[var(--green-primary)] bg-[var(--bg-color)] text-[var(--text-color)]"
              />
              <Input
                name="city"
                placeholder="City"
                value={form.city}
                onChange={handleChange}
                className="p-3 rounded-lg border border-[var(--green-primary)] bg-[var(--bg-color)] text-[var(--text-color)]"
              />
              <Input
                name="state"
                placeholder="State"
                value={form.state}
                onChange={handleChange}
                className="p-3 rounded-lg border border-[var(--green-primary)] bg-[var(--bg-color)] text-[var(--text-color)]"
              />
            </>
          )}

          {/* Email & Password */}
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="p-3 rounded-lg border border-[var(--green-primary)] bg-[var(--bg-color)] text-[var(--text-color)]"
          />

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="p-3 rounded-lg border border-[var(--green-primary)] bg-[var(--bg-color)] text-[var(--text-color)] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-3 text-[var(--muted-text)]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-[var(--green-primary)] text-white py-3 rounded-lg mt-2 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" />}
            {loading ? (type === "login" ? "Logging in..." : "Registering...") : type === "login" ? "Login" : "Register"}
          </Button>
        </form>
      </div>
    </div>
  );
}
