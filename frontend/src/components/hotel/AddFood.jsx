import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ChefHat, Loader2, UtensilsCrossed, Clock, Calendar,
  Hash, IndianRupee, ImagePlus, Leaf, Flame, Candy, Zap, Tag,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-toastify";

const FallbackTextarea = (props) => (
  <textarea
    {...props}
    className="flex min-h-[80px] w-full rounded-xl border border-[rgba(0,0,0,0.1)] bg-[var(--bg-color-light)] px-3 py-2.5 text-sm outline-none placeholder:text-[var(--muted-text)] focus:ring-2 focus:ring-[var(--green-primary)]/30 focus:border-[var(--green-primary)]/50 transition-all"
  />
);

const categories = [
  { value: "veg", label: "Vegetarian", icon: Leaf, color: "text-green-600 bg-green-50 border-green-200" },
  { value: "non-veg", label: "Non-Veg", icon: Flame, color: "text-red-600 bg-red-50 border-red-200" },
  { value: "sweet", label: "Sweet", icon: Candy, color: "text-pink-600 bg-pink-50 border-pink-200" },
  { value: "spicy", label: "Spicy", icon: Zap, color: "text-orange-600 bg-orange-50 border-orange-200" },
  { value: "other", label: "Other", icon: Tag, color: "text-gray-600 bg-gray-50 border-gray-200" },
];

export default function AddFoodModal({ open, onOpenChange, onAdded }) {
  const [foodName, setFoodName] = useState("");
  const [category, setCategory] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [expiryTime, setExpiryTime] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const TextAreaComp = Textarea || FallbackTextarea;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const resetForm = () => {
    setFoodName("");
    setCategory("");
    setPrepTime("");
    setExpiryTime("");
    setQuantity("");
    setPrice("");
    setImageFile(null);
    setImagePreview(null);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!foodName || !category || !prepTime || !expiryTime || !quantity || !price) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", foodName);
      formData.append("category", category);
      formData.append("prepTime", new Date(prepTime).toISOString());
      formData.append("expiryTime", new Date(expiryTime).toISOString());
      formData.append("quantity", quantity);
      formData.append("sellingPrice", price);
      if (imageFile) formData.append("photo", imageFile);

      const { data } = await api.post("/hotel/food/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Food listed on Zarfo successfully!");
      if (onAdded) onAdded(data);
      resetForm();
      onOpenChange(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add food listing");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="max-w-xl bg-[var(--card-bg)] text-[var(--text-color)] border border-[rgba(0,0,0,0.08)] rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--green-primary)] to-[var(--green-dark)] px-6 py-5">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-white text-base font-bold leading-none">Add Food Listing</DialogTitle>
                <p className="text-white/70 text-xs mt-1">List surplus food on Zarfo marketplace</p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Food Name */}
          <div className="space-y-1.5">
            <Label htmlFor="food-name" className="text-xs font-semibold text-[var(--text-color)] flex items-center gap-1.5">
              <UtensilsCrossed className="w-3.5 h-3.5 text-[var(--green-primary)]" />
              Food Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="food-name"
              placeholder="e.g., Veg Biryani, Paneer Tikka"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              required
              className="rounded-xl border-[rgba(0,0,0,0.1)] bg-[var(--bg-color-light)] focus:ring-2 focus:ring-[var(--green-primary)]/30 focus:border-[var(--green-primary)]/50 h-10 text-sm"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-[var(--text-color)] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[var(--green-primary)]" />
              Category <span className="text-red-400">*</span>
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border text-[10px] font-semibold transition-all duration-150 ${
                      isSelected
                        ? `${cat.color} border-current shadow-sm scale-105`
                        : "border-[rgba(0,0,0,0.08)] bg-[var(--bg-color-light)] text-[var(--muted-text)] hover:border-[rgba(0,0,0,0.15)]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? "" : "opacity-60"}`} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prep & Expiry Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prep-date" className="text-xs font-semibold text-[var(--text-color)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--green-primary)]" />
                Prep Time <span className="text-red-400">*</span>
              </Label>
              <Input
                id="prep-date"
                type="datetime-local"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                required
                className="rounded-xl border-[rgba(0,0,0,0.1)] bg-[var(--bg-color-light)] focus:ring-2 focus:ring-[var(--green-primary)]/30 h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expiry-date" className="text-xs font-semibold text-[var(--text-color)] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-red-400" />
                Expiry Time <span className="text-red-400">*</span>
              </Label>
              <Input
                id="expiry-date"
                type="datetime-local"
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
                required
                className="rounded-xl border-[rgba(0,0,0,0.1)] bg-[var(--bg-color-light)] focus:ring-2 focus:ring-[var(--green-primary)]/30 h-10 text-sm"
              />
            </div>
          </div>

          {/* Quantity & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quantity" className="text-xs font-semibold text-[var(--text-color)] flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[var(--green-primary)]" />
                Quantity <span className="text-red-400">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder="e.g., 25"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                min="1"
                className="rounded-xl border-[rgba(0,0,0,0.1)] bg-[var(--bg-color-light)] focus:ring-2 focus:ring-[var(--green-primary)]/30 h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-xs font-semibold text-[var(--text-color)] flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-[var(--green-primary)]" />
                Price (INR) <span className="text-red-400">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="e.g., 60"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                className="rounded-xl border-[rgba(0,0,0,0.1)] bg-[var(--bg-color-light)] focus:ring-2 focus:ring-[var(--green-primary)]/30 h-10 text-sm"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[var(--text-color)] flex items-center gap-1.5">
              <ImagePlus className="w-3.5 h-3.5 text-[var(--green-primary)]" />
              Food Photo
            </Label>
            <label
              htmlFor="image-upload"
              className="flex items-center gap-3 w-full rounded-xl border-2 border-dashed border-[rgba(0,0,0,0.1)] bg-[var(--bg-color-light)] hover:border-[var(--green-primary)]/40 hover:bg-[var(--green-primary)]/5 transition-all cursor-pointer p-3 group"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-[var(--green-primary)]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--green-primary)]/15 transition-colors">
                  <ImagePlus className="w-6 h-6 text-[var(--green-primary)]" />
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-[var(--text-color)]">
                  {imageFile ? imageFile.name : "Click to upload image"}
                </p>
                <p className="text-[10px] text-[var(--muted-text)] mt-0.5">PNG, JPG up to 5MB</p>
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-semibold text-[var(--text-color)]">
              Notes (optional)
            </Label>
            <TextAreaComp
              id="notes"
              placeholder="Any additional info about the food, allergens, serving suggestions..."
              className="rounded-xl border-[rgba(0,0,0,0.1)] bg-[var(--bg-color-light)] text-sm resize-none focus:ring-2 focus:ring-[var(--green-primary)]/30 focus:border-[var(--green-primary)]/50 transition-all"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-[var(--green-primary)] to-[var(--green-dark)] hover:opacity-90 text-white font-semibold text-sm border-0 shadow-lg shadow-[var(--green-primary)]/25 transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Listing food...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ChefHat className="w-4 h-4" />
                List on Zarfo
              </span>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
