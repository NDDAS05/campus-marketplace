import React, { useState, useEffect } from 'react';
import { Loader2, X, ImagePlus } from 'lucide-react';
import { listingsApi } from '../utils/api';

const CATEGORY_OPTIONS = [
  "Books", "Electronics", "Cycles", "Hostel Essentials",
  "Stationery", "Clothing", "Sports", "Other",
];

const MAX_IMAGES = 10; // matches upload.array('images', 10) on the backend
const MAX_FILE_SIZE_MB = 5; // matches multer's limits.fileSize
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]; // matches upload.middleware.js's fileFilter

// navigate: the app's fake-router setter
const CreateListingPage = ({ navigate }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    count: 1,
    location: "",
  });

  // Each entry: { file, previewUrl }
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Revoke object URLs when the component unmounts or images change,
  // so we don't leak memory from createObjectURL.
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // allow re-selecting the same file after removing it

    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      setError(`You can only add up to ${MAX_IMAGES} images.`);
      return;
    }

    const accepted = [];
    const rejected = [];
    for (const file of files.slice(0, room)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        rejected.push(`${file.name} — only jpg, png, and webp images are allowed`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        rejected.push(`${file.name} is over ${MAX_FILE_SIZE_MB}MB`);
        continue;
      }
      accepted.push({ file, previewUrl: URL.createObjectURL(file) });
    }

    if (accepted.length > 0) {
      setImages((prev) => [...prev, ...accepted]);
    }
    setError(rejected.length > 0 ? rejected.join(", ") : null);
  };

  const removeImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (images.length === 0) {
      setError("Add at least one image.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("count", form.count || 1);
      if (form.location) formData.append("location", form.location);
      images.forEach((img) => formData.append("images", img.file));

      const data = await listingsApi.createListing(formData);
      navigate(`/listing/${data.listing._id}`);
    } catch (err) {
      setError(err.message || "Couldn't create this listing. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-8 bg-gray-50 dark:bg-gray-950 w-full min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Post an Item</h1>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex flex-col gap-4">
          {error && (
            <div className="px-4 py-2.5 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={handleChange("title")}
              required
              minLength={3}
              maxLength={100}
              placeholder="e.g. Engineering Mathematics Textbook"
              className="w-full bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Description</label>
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              rows={4}
              placeholder="Condition, why you're selling, anything a buyer should know..."
              className="w-full bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Price (₹)</label>
              <input
                type="number"
                value={form.price}
                onChange={handleChange("price")}
                required
                min={0}
                placeholder="0"
                className="w-full bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Quantity</label>
              <input
                type="number"
                value={form.count}
                onChange={handleChange("count")}
                min={1}
                step={1}
                className="w-full bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Category</label>
              <select
                value={form.category}
                onChange={handleChange("category")}
                required
                className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-gray-700 dark:text-gray-200"
              >
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={handleChange("location")}
                placeholder="Shibpur, Howrah"
                className="w-full bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
              Images ({images.length}/{MAX_IMAGES})
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 group">
                  <img src={img.previewUrl} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-500 rounded-full text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {images.length < MAX_IMAGES && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-1 text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-500 dark:hover:text-gray-400 cursor-pointer transition-colors">
                  <ImagePlus className="w-5 h-5" />
                  <span className="text-xs">Add</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleFilesSelected}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Posting..." : "Post Listing"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-lg font-medium text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListingPage;