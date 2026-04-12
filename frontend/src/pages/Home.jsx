import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Truck, Handshake, ShoppingBag, Feather, ChefHat, ArrowRight, Leaf, Zap, Heart } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import heroVideo from "../assets/hero.mp4";

const roles = [
  {
    icon: Building2,
    title: "Hotel Partner",
    desc: "List surplus food, set pickup times, and track instant CSR metrics and tax savings.",
    color: "from-green-400 to-emerald-500",
    bg: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    icon: Feather,
    title: "Night Robin",
    desc: "Accept optimized AI delivery routes to pick up surplus food and drop it off at designated points.",
    color: "from-sky-400 to-blue-500",
    bg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  {
    icon: Truck,
    title: "Night Worker",
    desc: "Request and receive warm meals directly. Confirm delivery and provide quality feedback.",
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: ShoppingBag,
    title: "Customer",
    desc: "Purchase discounted, high-quality surplus meals through flash deals before they expire.",
    color: "from-violet-400 to-purple-500",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
];

const stats = [
  { value: "120+", label: "Hotels onboarded" },
  { value: "50k+", label: "Meals saved"       },
  { value: "300+", label: "Night Robins"      },
  { value: "10k+", label: "Workers fed"       },
];

const features = [
  { icon: Zap,    title: "AI-Powered Pricing",    desc: "Our model analyzes shelf life and demand to set optimal prices in real time."    },
  { icon: Leaf,   title: "Zero Waste Mission",     desc: "Every listing is tracked from kitchen to delivery, minimizing food waste."       },
  { icon: Heart,  title: "Community First",        desc: "Night workers receive free meals. Hotels earn CSR credits. Everyone wins."       },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-[var(--bg-color)] text-[var(--text-color)] min-h-screen overflow-x-hidden font-sans">

      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <header className="fixed w-full z-50 flex justify-between items-center px-6 md:px-12 py-4 backdrop-blur-md bg-[var(--bg-color)]/60 border-b border-[rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--green-primary)] to-[var(--green-dark)] flex items-center justify-center shadow-md">
            <ChefHat className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-black text-[var(--green-primary)] tracking-tight">Zarfo</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button onClick={() => navigate("/login")}
            className="text-sm font-semibold text-[var(--text-color)] hover:text-[var(--green-primary)] transition-colors px-3 py-1.5">
            Sign In
          </button>
          <button onClick={() => navigate("/register")}
            className="bg-[var(--green-primary)] text-white text-sm font-bold px-5 py-2 rounded-xl hover:bg-[var(--green-dark)] transition-colors shadow-md shadow-[var(--green-primary)]/25">
            Get Started
          </button>
        </div>
      </header>

      {/* ── Hero — full-screen video ─────────────────────────────────── */}
      <section className="relative h-screen w-full flex items-end justify-center pb-16">
        <video autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src={heroVideo}
        />
        {/* Gradient overlay at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
          className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => navigate("/register")}
              className="flex items-center gap-2 bg-[var(--green-primary)] text-white font-bold px-7 py-3 rounded-2xl hover:bg-[var(--green-dark)] transition-colors shadow-xl shadow-[var(--green-primary)]/40">
              Join Zarfo <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate("/login")}
              className="flex items-center gap-2 bg-white/15 border border-white/25 text-white font-semibold px-7 py-3 rounded-2xl hover:bg-white/20 transition-colors backdrop-blur-sm">
              Sign In
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────── */}
      <section className="bg-[var(--green-primary)] py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-6">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }} viewport={{ once: true }} className="text-center">
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="text-white/70 text-xs mt-1 font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-20 bg-[var(--bg-color)]">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} viewport={{ once: true }}
          className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--green-primary)] mb-3">The Smart Redistribution Engine</p>
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-[var(--text-color)] leading-tight">
            We Connect Surplus to <span className="text-[var(--green-primary)]">Need</span>.
          </h2>
          <p className="text-lg leading-relaxed text-[var(--muted-text)] max-w-3xl mx-auto">
            Our platform uses an advanced AI Agent to analyze food shelf life, location logistics, and real-time demand — ensuring every meal is utilized before its expiry.
          </p>
        </motion.div>

        {/* Feature cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[rgba(0,0,0,0.05)] shadow-sm hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-2xl bg-[var(--green-primary)]/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[var(--green-primary)]" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-color)] mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--muted-text)] leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Roles timeline ───────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[var(--bg-color-light)] relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest uppercase text-[var(--green-primary)] mb-3">Roles</p>
            <h2 className="text-4xl md:text-5xl font-black text-[var(--text-color)]">What's your role at Zarfo?</h2>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--green-primary)]/40 via-[var(--green-primary)]/20 to-transparent -translate-x-1/2 hidden md:block" />
            <div className="space-y-12">
              {roles.map((role, i) => {
                const Icon = role.icon;
                const isLeft = i % 2 === 0;
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className={`relative flex items-center gap-8 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"} flex-col`}>
                    {/* Card */}
                    <div className="md:w-5/12 bg-[var(--card-bg)] rounded-2xl p-6 border border-[rgba(0,0,0,0.05)] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                      <div className={`w-12 h-12 rounded-2xl ${role.bg} flex items-center justify-center mb-4`}>
                        <Icon className={`w-6 h-6 ${role.iconColor}`} />
                      </div>
                      <h3 className="text-lg font-bold text-[var(--text-color)] mb-2">{role.title}</h3>
                      <p className="text-sm text-[var(--muted-text)] leading-relaxed">{role.desc}</p>
                    </div>
                    {/* Center dot */}
                    <div className="hidden md:flex md:w-2/12 justify-center">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${role.color} border-4 border-[var(--bg-color-light)] shadow-lg`} />
                    </div>
                    <div className="md:w-5/12" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-primary)] text-white text-center relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-black/10 blur-3xl pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} viewport={{ once: true }} className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">Ready to make your surplus count?</h2>
          <p className="text-white/70 text-base mb-8 leading-relaxed">
            Join hundreds of hotels, volunteers, and workers already using Zarfo every night.
          </p>
          <button onClick={() => navigate("/register")}
            className="inline-flex items-center gap-2 bg-white text-[var(--green-dark)] font-black px-8 py-3.5 rounded-2xl hover:bg-green-50 transition-colors shadow-xl text-sm">
            Register Your Role <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="py-8 text-center text-sm bg-[var(--bg-color)] text-[var(--muted-text)] border-t border-[rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[var(--green-primary)] to-[var(--green-dark)] flex items-center justify-center">
            <ChefHat className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-[var(--text-color)]">Zarfo</span>
        </div>
        <p>© {new Date().getFullYear()} Zarfo. AI-Powered Food Logistics.</p>
      </footer>
    </div>
  );
}
