import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "react-toastify";

export default function RatingModal({ orderId, foodName, onClose, onRated }) {
  const [rating, setRating]   = useState(0);
  const [hover, setHover]     = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const submit = async () => {
    if (!rating) { toast.error("Please select a rating."); return; }
    setLoading(true);
    try {
      await api.post("/delivery/rate", { orderId, rating, comment });
      setDone(true);
      toast.success("Rating submitted!");
      setTimeout(() => { onRated?.(); onClose(); }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="bg-[var(--card-bg)] rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted-text)] hover:bg-[var(--bg-color-light)] transition-colors">
            <X size={14} />
          </button>

          {done ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-[var(--green-primary)] mx-auto mb-3" />
              <p className="text-base font-bold text-[var(--text-color)]">Thank you!</p>
              <p className="text-xs text-[var(--muted-text)] mt-1">Your feedback helps improve Zarfo.</p>
            </div>
          ) : (
            <>
              <h3 className="text-base font-bold text-[var(--text-color)] mb-1">Rate your delivery</h3>
              <p className="text-xs text-[var(--muted-text)] mb-5">{foodName || "How was your experience?"}</p>

              {/* Stars */}
              <div className="flex items-center justify-center gap-2 mb-5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s}
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(s)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star className={`w-8 h-8 transition-colors ${
                      s <= (hover || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-[var(--muted-text)]"
                    }`} />
                  </button>
                ))}
              </div>

              {/* Labels */}
              <p className="text-center text-xs text-[var(--muted-text)] mb-4 h-4">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>

              {/* Comment */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment (optional)..."
                rows={3}
                className="w-full rounded-xl border border-[rgba(0,0,0,0.1)] bg-[var(--bg-color-light)] px-3 py-2.5 text-sm text-[var(--text-color)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--green-primary)]/30 resize-none mb-4"
              />

              <Button onClick={submit} disabled={loading || !rating}
                className="w-full h-10 rounded-xl bg-gradient-to-r from-[var(--green-primary)] to-[var(--green-dark)] text-white font-semibold border-0 disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Submit Rating
              </Button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
