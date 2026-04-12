"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import api from "@/lib/api"; // fetch-based client

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    role: "user",
    email: "",
    password: "",
    houseNo: "",
    suburb: "",
    city: "",
    state: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
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
    navigate("/login");
  } catch (err) {
    setError(err.response?.data?.error || "Registration failed");
  } finally {
    setLoading(false);
  }
};


  const roles = [
    { label: "Hotel Partner", value: "hotel" },
    { label: "Customer", value: "user" },
    { label: "Night Robin (Volunteer)", value: "robin" },
    { label: "Night Worker (Recipient)", value: "worker" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color-light)] text-[var(--text-color)] px-4 transition-colors duration-300 relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Register Card */}
      <div className="bg-[var(--card-bg)] p-10 rounded-2xl shadow-2xl w-full max-w-2xl transition-colors duration-300 space-y-6">
        <h2 className="text-3xl font-bold text-center text-[var(--green-primary)]">
          Create your Zarfo Account
        </h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name + Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label className="text-[var(--text-color)]">Full Name</Label>
              <Input
                name="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-[var(--text-color)]">Role</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between mt-2 border-gray-300 text-[var(--text-color)]"
                  >
                    {
                      roles.find((r) => r.value === form.role)?.label ||
                      form.role.charAt(0).toUpperCase() + form.role.slice(1)
                    }
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[var(--card-bg)] border border-gray-200 shadow-md rounded-lg">
                  {roles.map((r) => (
                    <DropdownMenuItem
                      key={r.value}
                      onClick={() => setForm({ ...form, role: r.value })}
                      className="cursor-pointer hover:bg-[var(--green-light)]/10 hover:text-[var(--green-primary)] transition-colors"
                    >
                      {r.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Email + Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label className="text-[var(--text-color)]">Email</Label>
              <Input
                type="email"
                name="email"
                placeholder="Enter email"
                value={form.email}
                onChange={handleChange}
                required
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-[var(--text-color)]">Password</Label>
              <Input
                type="password"
                name="password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                required
                className="mt-2"
              />
            </div>
          </div>

          {/* Address - House + Street */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label className="text-[var(--text-color)]">House No & Street</Label>
              <Input
                name="houseNo"
                placeholder="House number"
                value={form.houseNo}
                onChange={handleChange}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-[var(--text-color)]">Suburb</Label>
              <Input
                name="suburb"
                placeholder="Eg: Malad"
                value={form.suburb}
                onChange={handleChange}
                className="mt-2"
              />
            </div>
          </div>

          {/* Address - Suburb + State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label className="text-[var(--text-color)]">City</Label>
              <Input
                name="city"
                placeholder="Eg: Mumbai"
                value={form.city}
                onChange={handleChange}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-[var(--text-color)]">State</Label>
              <Input
                name="state"
                placeholder="State"
                value={form.state}
                onChange={handleChange}
                className="mt-2"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--green-primary)] hover:bg-[var(--green-dark)] text-white text-lg py-5 rounded-xl transition-all"
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-sm text-center mt-4 text-[var(--muted-text)]">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-[var(--green-primary)] hover:underline cursor-pointer font-medium"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
