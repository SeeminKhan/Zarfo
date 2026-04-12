import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [loading, setLoading] = useState(false);

  // Use Textarea component if available, otherwise use fallback
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
    setLat("");
    setLng("");
  };

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate required fields
    if (!foodName || !category || !prepTime || !expiryTime || !quantity || !price) {
      toast.error("Please fill in all required fields", { position: "top-right", autoClose: 3000 });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", foodName);
      formData.append("category", category);

      // Send datetime-local values directly (ISO format handled by backend if needed, or send as is)
      // The backend expects ISO string or date string. datetime-local value is "YYYY-MM-DDTHH:mm"
      // We can convert to full ISO string to be safe.
      formData.append("prepTime", new Date(prepTime).toISOString());
      formData.append("expiryTime", new Date(expiryTime).toISOString());

      formData.append("quantity", quantity);
      formData.append("sellingPrice", price);
      if (imageFile) formData.append("photo", imageFile);
      if (lat) formData.append("lat", lat);
      if (lng) formData.append("lng", lng);

      const { data } = await api.post("/hotel/food/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Food Live on Zarfo!", { position: "top-right", autoClose: 3000 });

      if (onAdded) onAdded(data);

      // Reset form
      setFoodName("");
      setCategory("");
      setPrepTime("");
      setExpiryTime("");
      setQuantity("");
      setPrice("");
      setImageFile(null);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to add food listing", { position: "top-right", autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[var(--card-bg)] text-[var(--text-color)] transition-colors duration-300">
        <DialogHeader>
          <DialogTitle>Add Food</DialogTitle>
          <DialogDescription>Provide the details for your listing in Zarfo.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="food-name">Food Name *</Label>
            <Input
              id="food-name"
              placeholder="e.g., Veg Biryani, Paneer Tikka"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-input bg-[var(--card-bg)] px-3 py-2 text-sm shadow-sm outline-none ring-0 focus-visible:ring-2 focus-visible:ring-[var(--green-primary)]"
              required
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="prep-date">Prep Date & Time *</Label>
              <Input
                id="prep-date"
                type="datetime-local"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expiry-date">Expiry Date & Time *</Label>
              <Input
                id="expiry-date"
                type="datetime-local"
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="e.g., 25"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                min="1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="e.g., 60"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
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

          {/* Location (for route optimizer) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lat" className="text-xs font-semibold text-[var(--text-color)]">Latitude</Label>
              <Input id="lat" type="number" step="any" placeholder="e.g., 19.0760"
                value={lat} onChange={(e) => setLat(e.target.value)}
                className="rounded-xl border-[rgba(0,0,0,0.1)] bg-[var(--bg-color-light)] h-10 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lng" className="text-xs font-semibold text-[var(--text-color)]">Longitude</Label>
              <Input id="lng" type="number" step="any" placeholder="e.g., 72.8777"
                value={lng} onChange={(e) => setLng(e.target.value)}
                className="rounded-xl border-[rgba(0,0,0,0.1)] bg-[var(--bg-color-light)] h-10 text-sm" />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-semibold text-[var(--text-color)]">Notes (optional)</Label>
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