import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, CheckCircle2, AlertTriangle, Info, Clock,
  X, Package, Truck, Loader2,
} from "lucide-react";
import api from "@/lib/api";

const TYPE_CONFIG = {
  success: { icon: CheckCircle2, color: "text-[var(--green-primary)]", bg: "bg-green-50",  dot: "bg-[var(--green-primary)]" },
  warning: { icon: AlertTriangle,color: "text-orange-500",             bg: "bg-orange-50", dot: "bg-orange-500"             },
  info:    { icon: Info,         color: "text-blue-500",               bg: "bg-blue-50",   dot: "bg-blue-500"               },
  pending: { icon: Clock,        color: "text-yellow-600",             bg: "bg-yellow-50", dot: "bg-yellow-500"             },
};

export default function NotificationBell() {
  const [open, setOpen]               = useState(false);
  const [notifications, setNotifs]    = useState([]);
  const [unread, setUnread]           = useState(0);
  const [loading, setLoading]         = useState(false);
  const ref                           = useRef(null);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/notifications");
      setNotifs(data.notifications ?? []);
      setUnread(data.count ?? 0);
    } catch (err) {
      console.error("[NotificationBell] Failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount + every 60s
  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen((v) => !v); if (!open) fetchNotifs(); }}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center text-[var(--muted-text)] hover:bg-[var(--bg-color-light)] hover:text-[var(--text-color)] transition-all"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center px-0.5 border-2 border-[var(--card-bg)]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[var(--card-bg)] border border-[rgba(0,0,0,0.08)] rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[var(--text-color)]" />
                <span className="text-sm font-bold text-[var(--text-color)]">Notifications</span>
                {unread > 0 && (
                  <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">{unread} new</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-[10px] text-[var(--green-primary)] font-semibold hover:underline">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--muted-text)] hover:bg-[var(--bg-color-light)] transition-colors">
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="max-h-[400px] overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-10 gap-3 text-[var(--muted-text)]">
                  <Loader2 className="w-5 h-5 animate-spin text-[var(--green-primary)]" />
                  <span className="text-xs font-medium">Loading...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-[var(--muted-text)]">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--bg-color-light)] flex items-center justify-center">
                    <Bell className="w-6 h-6 opacity-30" />
                  </div>
                  <p className="text-xs font-semibold text-[var(--text-color)]">All caught up</p>
                  <p className="text-[11px]">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-[rgba(0,0,0,0.04)]">
                  {notifications.map((n, i) => {
                    const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;
                    const Icon = cfg.icon;
                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-color-light)] transition-colors cursor-default ${
                          !n.read ? "bg-[var(--green-primary)]/3" : ""
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                          <Icon className={`w-4 h-4 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-[var(--text-color)] leading-snug">{n.title}</p>
                            {!n.read && <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${cfg.dot}`} />}
                          </div>
                          <p className="text-[11px] text-[var(--muted-text)] mt-0.5 leading-snug">{n.message}</p>
                          <p className="text-[10px] text-[var(--muted-text)] mt-1 font-medium">{n.time}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-[rgba(0,0,0,0.06)] text-center">
                <button onClick={fetchNotifs} className="text-[11px] text-[var(--green-primary)] font-semibold hover:underline flex items-center gap-1 mx-auto">
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  Refresh
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
