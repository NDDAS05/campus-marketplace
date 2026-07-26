import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { listingsApi } from '../utils/api';
import ConfirmDialog from '../components/common/ConfirmDialog';

const CATEGORY_OPTIONS = [
  "Books", "Electronics", "Cycles", "Hostel Essentials",
  "Stationery", "Clothing", "Sports", "Other",
];

// listingId: from the route
// navigate: the app's fake-router setter
const EditListingPage = ({ listingId, navigate }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    count: 1,
    location: "",
  });

  const [originalStatus, setOriginalStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load the existing listing so the form starts pre-filled.
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await listingsApi.getListingById(listingId);
        const listing = data.listing;

        // Guard against someone landing here directly on a Pending/Under
        // Review listing (e.g. a stale link) — the backend would reject
        // the save anyway, but this avoids showing an editable form for
        // a listing that isn't actually editable right now.
        if (!["Listed", "Rejected"].includes(listing.status)) {
          setError(`This listing can't be edited while it's "${listing.status}".`);
          setOriginalStatus(listing.status);
          return;
        }

        setOriginalStatus(listing.status);
        setForm({
          title: listing.title || "",
          description: listing.description || "",
          price: listing.price ?? "",
          category: listing.category || "",
          count: listing.count || 1,
          location: listing.location || "",
        });
      } catch (err) {
        setError(err.message || "Couldn't load this listing.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [listingId]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Form submit just opens the confirmation — the actual PUT happens in
  // handleConfirmSave once the person says "yes".
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        price: form.price,
        category: form.category,
        count: form.count || 1,
        location: form.location,
      };
      const data = await listingsApi.updateListing(listingId, payload);
      navigate(`/listing/${data.listing._id}`);
    } catch (err) {
      // Surfaces both the "not editable right now" and the
      // "daily edit limit reached" (429) messages from the backend as-is.
      setError(err.message || "Couldn't update this listing. Please try again.");
      setIsSubmitting(false);
      setShowSaveConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-24 bg-gray-50 dark:bg-gray-950 w-full min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-gray-500" />
      </div>
    );
  }

  // Not editable (wrong status) — show the reason, no form.
  if (error && !originalStatus) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 bg-gray-50 dark:bg-gray-950 w-full min-h-screen text-red-500 dark:text-red-400 text-sm gap-3">
        <p>{error}</p>
        <button
          onClick={() => navigate(`/listing/${listingId}`)}
          className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Back to listing
        </button>
      </div>
    );
  }
  if (error && originalStatus && !["Listed", "Rejected"].includes(originalStatus)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 bg-gray-50 dark:bg-gray-950 w-full min-h-screen text-red-500 dark:text-red-400 text-sm gap-3">
        <p>{error}</p>
        <button
          onClick={() => navigate(`/listing/${listingId}`)}
          className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Back to listing
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-8 bg-gray-50 dark:bg-gray-950 w-full min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Edit Listing</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Saving will resubmit this listing for review before it goes live again.
        </p>

        <form onSubmit={handleFormSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex flex-col gap-4">
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
              className="w-full bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Description</label>
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              rows={4}
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
                className="w-full bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 -mt-1">
            Images can't be changed here — delete and repost if you need to swap photos.
          </p>

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Saving..." : "Save & Resubmit"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/listing/${listingId}`)}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-lg font-medium text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        isOpen={showSaveConfirm}
        title="Save and resubmit for review?"
        message="This listing will go back to Pending until it's re-approved."
        confirmLabel="Save & Resubmit"
        isLoading={isSubmitting}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />
    </div>
  );
};

export default EditListingPage;