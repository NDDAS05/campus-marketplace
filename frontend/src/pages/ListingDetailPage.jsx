import React, { useState, useEffect } from 'react';
import {
  MapPin, Heart, MessageCircle, Phone, Loader2, ChevronLeft, ChevronRight,
  Trash2, Tag, Package
} from 'lucide-react';
import { listingsApi, userApi } from '../utils/api';
import { getStatusStyles } from '../utils/listingStatus';
import ConfirmDialog from '../components/common/ConfirmDialog';

const CATEGORY_OPTIONS = [
  "Books", "Electronics", "Cycles", "Hostel Essentials",
  "Stationery", "Clothing", "Sports", "Other",
];

// --- Reusable pill button with a small hover "pop" tooltip ---
// variant: "primary" | "secondary" | "danger"
const PillButton = ({ variant = "secondary", active, disabled, tooltip, icon: Icon, onClick, children }) => {
  const base = "relative group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ease-out";
  const variants = {
    primary: "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-300 hover:-translate-y-0.5 hover:shadow-md shadow-sm",
    secondary: active
      ? "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:-translate-y-0.5 hover:shadow-md"
      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600",
    danger: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900 hover:-translate-y-0.5 hover:shadow-md",
  };
  const disabledClasses = "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none";

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${disabled ? disabledClasses : ""}`}
    >
      {Icon && <Icon className={`w-4 h-4 ${active && variant === "secondary" ? "fill-rose-500 text-rose-500" : ""}`} />}
      {children}
      {tooltip && (
        <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-800 dark:bg-slate-700 text-white text-xs px-3 py-1 opacity-0 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-all duration-200 shadow-md">
          {tooltip}
        </span>
      )}
    </button>
  );
};

// Pill stays as-is for category/year/department (unchanged, still uses tone prop)
const Pill = ({ children, tone = "slate" }) => {
  const tones = {
    slate: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    emerald: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
    rose: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400",
  };
  return (
    <span className={`text-xs font-medium px-3 py-1 rounded-full ${tones[tone]}`}>
      {children}
    </span>
  );
};

// Dedicated status pill — pulls its color from the shared getStatusStyles
// utility so it always matches Home.jsx and Profilepage.jsx exactly.
const StatusPill = ({ status }) => {
  const { label, pill } = getStatusStyles(status);
  return (
    <span className={`text-xs font-medium px-3 py-1 rounded-full ${pill}`}>
      {label}
    </span>
  );
};

// --- Image gallery: big sliding image + thumbnail strip ---
const ImageGallery = ({ images }) => {
  const [index, setIndex] = useState(0);
  if (!images || images.length === 0) {
    return <div className="w-full h-80 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600 text-sm">No images</div>;
  }

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));

  return (
    <div>
      <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 group">
        <div
          className="flex h-full w-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((img, i) => (
            <img key={i} src={img} alt={`Image ${i + 1}`} className="w-full h-full flex-shrink-0 object-cover" />
          ))}
        </div>
        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === index ? "border-slate-700 dark:border-slate-300" : "border-transparent opacity-70 hover:opacity-100"}`}
            >
              <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Single comment row ---
const CommentItem = ({ comment, currentUserId, onDelete, onGoToProfile }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isOwn = currentUserId && comment.user?._id === currentUserId;

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(comment._id);
      setShowDeleteConfirm(false);
    } catch (err) {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      alert(err.message || "Couldn't delete this comment.");
    }
  };

  return (
    <div className="flex gap-3 py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <button
        onClick={() => comment.user?._id && onGoToProfile(comment.user._id)}
        className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-semibold text-slate-600 dark:text-slate-200 flex-shrink-0 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
      >
        {comment.user?.name?.[0]?.toUpperCase() || "?"}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => comment.user?._id && onGoToProfile(comment.user._id)}
            className="text-sm font-semibold text-slate-800 dark:text-slate-100 hover:underline"
          >
            {comment.user?.name || "Deleted user"}
          </button>
          {comment.user?.username && (
            <span className="text-xs text-slate-400 dark:text-slate-500">@{comment.user.username}</span>
          )}
        </div>
        <p className={`text-sm mt-0.5 ${comment.isDeleted ? "italic text-slate-400 dark:text-slate-500" : "text-slate-600 dark:text-slate-300"}`}>
          {comment.text}
        </p>
      </div>
      {isOwn && !comment.isDeleted && (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isDeleting}
          className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors flex-shrink-0 self-start"
          title="Delete comment"
        >
          {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete this comment?"
        message="This can't be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

// listingId: from the route
// navigate: the app's fake-router setter
// currentUser: { id } or null if logged out
const ListingDetailPage = ({ listingId, navigate, currentUser }) => {
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const [showContact, setShowContact] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState(null);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeletingListing, setIsDeletingListing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveEditConfirm, setShowSaveEditConfirm] = useState(false);

  // --- Inline "Edit Listing" form state (shown in place of the read-only
  // title/location/description blocks below, instead of navigating away) ---
  const [isEditingListing, setIsEditingListing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "", description: "", price: "", category: "", count: 1, location: "",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState(null);

  const openEditForm = () => {
    setEditForm({
      title: listing.title || "",
      description: listing.description || "",
      price: listing.price ?? "",
      category: listing.category || "",
      count: listing.count || 1,
      location: listing.location || "",
    });
    setEditError(null);
    setIsEditingListing(true);
  };

  const handleEditFormChange = (field) => (e) => {
    setEditForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleEditFormSubmit = (e) => {
    e.preventDefault();
    setEditError(null);
    setShowSaveEditConfirm(true);
  };

  const handleConfirmSaveEdit = async () => {
    setIsSavingEdit(true);
    try {
      const payload = {
        title: editForm.title,
        description: editForm.description,
        price: editForm.price,
        category: editForm.category,
        count: editForm.count || 1,
        location: editForm.location,
      };
      // Same PUT /api/listings/:id the standalone EditListingPage uses —
      // backend resets status to "Pending" and re-triggers moderation,
      // so the returned listing already reflects that.
      const data = await listingsApi.updateListing(listingId, payload);
      setListing(data.listing);
      setIsEditingListing(false);
      setShowSaveEditConfirm(false);
    } catch (err) {
      setEditError(err.message || "Couldn't update this listing. Please try again.");
      setShowSaveEditConfirm(false);
    } finally {
      setIsSavingEdit(false);
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await listingsApi.getListingById(listingId);
        setListing(data.listing);

        // Check wishlist membership only if logged in — separate call since
        // getListingById doesn't (and shouldn't) return another user's wishlist.
        if (currentUser) {
          try {
            const profile = await userApi.getProfile();
            setIsWishlisted(profile.wishlist?.some((w) => w._id === listingId) || false);
          } catch {
            // not fatal — wishlist button just starts unselected
          }
        }
      } catch (err) {
        setError(err.message || "Couldn't load this listing.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [listingId, currentUser]);

  const handleToggleWishlist = async () => {
    const next = !isWishlisted;
    setIsWishlisted(next); // optimistic
    setIsTogglingWishlist(true);
    try {
      if (next) {
        await userApi.addToWishlist(listingId);
      } else {
        await userApi.removeFromWishlist(listingId);
      }
    } catch (err) {
      setIsWishlisted(!next); // revert
      alert(err.message || "Couldn't update your wishlist.");
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    setCommentError(null);
    try {
      const data = await listingsApi.addComment(listingId, commentText.trim());
      setListing((prev) => ({ ...prev, comments: data.listing.comments }));
      setCommentText("");
    } catch (err) {
      setCommentError(err.message || "Couldn't post your comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const data = await listingsApi.deleteComment(listingId, commentId);
    setListing((prev) => ({ ...prev, comments: data.listing.comments }));
  };

  const handleToggleListingStatus = async () => {
    setIsUpdatingStatus(true);
    try {
      const newStatus = listing.status === "Sold" ? "Listed" : "Sold";
      await listingsApi.updateStatus(listingId, newStatus);
      setListing((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert(err.message || "Couldn't update listing status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConfirmDeleteListing = async () => {
    setIsDeletingListing(true);
    try {
      await listingsApi.deleteListing(listingId);
      navigate("/profile");
    } catch (err) {
      setIsDeletingListing(false);
      setShowDeleteConfirm(false);
      alert(err.message || "Couldn't delete this listing.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-24 bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400 dark:text-slate-600" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 bg-slate-50 dark:bg-slate-950 text-rose-500 dark:text-rose-400 text-sm gap-3">
        <p>{error || "Listing not found."}</p>
        <button onClick={() => navigate("/")} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-200 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
          Back to feed
        </button>
      </div>
    );
  }

  const isOwner = currentUser && listing.seller?._id === currentUser.id;
  const contactAvailable = listing.seller?.contactInfo && listing.seller.contactInfo !== "Hidden";

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 w-full min-h-screen p-4 sm:p-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">

        {/* --- Title --- */}
        {!isEditingListing && (
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
              {listing.title}
            </h1>
            <div className="text-2xl font-bold text-slate-700 dark:text-slate-200 mt-2">₹{listing.price}</div>
          </div>
        )}

        {/* --- Seller + pills --- */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => listing.seller?._id && navigate(`/user/${listing.seller._id}`)}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:underline"
          >
            <span className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-200">
              {listing.sellerName?.[0]?.toUpperCase() || "?"}
            </span>
            {listing.sellerName}
          </button>
          <Pill>{listing.category}</Pill>
          <StatusPill status={listing.status} />
          {listing.sellerYear && <Pill>{listing.sellerYear}</Pill>}
          {listing.sellerDepartment && <Pill>{listing.sellerDepartment}</Pill>}
          {listing.count > 1 && (
            <Pill><span className="inline-flex items-center gap-1"><Package className="w-3 h-3" /> Qty: {listing.count}</span></Pill>
          )}
        </div>

        {!isEditingListing ? (
          <>
            {/* --- Location --- */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-3 shadow-sm">
              <MapPin className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <div>
                <div className="text-xs text-slate-400 dark:text-slate-500">Location</div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{listing.location}</div>
              </div>
            </div>

            {/* --- Description --- */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Description
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {listing.description || "No description provided."}
              </p>
            </div>
          </>
        ) : (
          /* --- Inline Edit Listing form (replaces title/location/description
             while active — this is what shows in place of the old
             navigate-to-a-separate-page behavior) --- */
          <form
            onSubmit={handleEditFormSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-4"
          >
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Edit Listing</h2>

            {editError && (
              <div className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-sm rounded-lg">
                {editError}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Title</label>
              <input
                type="text"
                value={editForm.title}
                onChange={handleEditFormChange("title")}
                required
                minLength={3}
                maxLength={100}
                className="w-full bg-slate-100 dark:bg-slate-800 dark:text-slate-100 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Description</label>
              <textarea
                value={editForm.description}
                onChange={handleEditFormChange("description")}
                rows={4}
                className="w-full bg-slate-100 dark:bg-slate-800 dark:text-slate-100 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Price (₹)</label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={handleEditFormChange("price")}
                  required
                  min={0}
                  className="w-full bg-slate-100 dark:bg-slate-800 dark:text-slate-100 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Quantity</label>
                <input
                  type="number"
                  value={editForm.count}
                  onChange={handleEditFormChange("count")}
                  min={1}
                  step={1}
                  className="w-full bg-slate-100 dark:bg-slate-800 dark:text-slate-100 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Category</label>
                <select
                  value={editForm.category}
                  onChange={handleEditFormChange("category")}
                  required
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 outline-none text-slate-700 dark:text-slate-200"
                >
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={handleEditFormChange("location")}
                  className="w-full bg-slate-100 dark:bg-slate-800 dark:text-slate-100 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 outline-none"
                />
              </div>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 -mt-1">
              Images can't be changed here — delete and repost if you need to swap photos. Saving resubmits this listing for review.
            </p>

            <div className="flex gap-3 mt-2">
              <PillButton variant="primary" disabled={isSavingEdit}>
                {isSavingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSavingEdit ? "Saving..." : "Save & Resubmit"}
              </PillButton>
              <button
                type="button"
                onClick={() => { setIsEditingListing(false); setEditError(null); }}
                disabled={isSavingEdit}
                className="px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* --- Images --- */}
        <ImageGallery images={listing.images} />

        {/* --- Actions --- */}
            {isEditingListing ? null : isOwner ? (
            <div className="flex flex-wrap gap-3">
              {["Listed", "Rejected"].includes(listing.status) && (
                <PillButton
                  variant="secondary"
                  onClick={openEditForm}
                  tooltip="Edit this listing"
                >
                  Edit Listing
                </PillButton>
              )}
              <PillButton
                variant="primary"
                onClick={handleToggleListingStatus}
                disabled={isUpdatingStatus}
                tooltip={listing.status === "Sold" ? "Relist this item" : "Mark this item as sold"}
              >
                {isUpdatingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
                Mark as {listing.status === "Sold" ? "Listed" : "Sold"}
              </PillButton>
              <PillButton
                variant="danger"
                icon={Trash2}
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeletingListing}
                tooltip="Delete this listing"
              >
                {isDeletingListing ? "Deleting..." : "Delete Listing"}
              </PillButton>
            </div>
            ) : (
          <div className="flex flex-wrap gap-3">
            <PillButton
              variant="secondary"
              active={isWishlisted}
              icon={Heart}
              onClick={handleToggleWishlist}
              disabled={isTogglingWishlist || !currentUser}
              tooltip={!currentUser ? "Log in to save items" : isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
            >
              {isWishlisted ? "Saved" : "Add to Wishlist"}
            </PillButton>

            <PillButton
              variant="primary"
              icon={Phone}
              onClick={() => setShowContact((s) => !s)}
              disabled={!contactAvailable}
              tooltip={contactAvailable ? "Reveal seller's contact info" : "Seller hasn't made their contact info public"}
            >
              Contact Seller
            </PillButton>

            <PillButton
              variant="secondary"
              icon={MessageCircle}
              disabled
              tooltip="Chat isn't built yet — coming soon"
            >
              Chat with Seller
            </PillButton>
          </div>
        )}

        {showContact && contactAvailable && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm text-slate-700 dark:text-slate-200 shadow-sm -mt-2">
            {listing.seller.contactInfo}
          </div>
        )}

        {/* --- Comments --- */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm mt-2">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">
            Comments {listing.comments?.length > 0 && `(${listing.comments.length})`}
          </h2>

          {currentUser ? (
            <form onSubmit={handleSubmitComment} className="flex gap-2 mb-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                maxLength={500}
                className="flex-1 bg-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 border-none rounded-full py-2.5 px-4 text-sm focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 outline-none"
              />
              <PillButton variant="primary" disabled={isSubmittingComment || !commentText.trim()}>
                {isSubmittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
              </PillButton>
            </form>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-2">Log in to leave a comment.</p>
          )}
          {commentError && <p className="text-xs text-rose-500 dark:text-rose-400 mb-2">{commentError}</p>}

          <div className="mt-2">
            {listing.comments?.length > 0 ? (
              listing.comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  currentUserId={currentUser?.id}
                  onDelete={handleDeleteComment}
                  onGoToProfile={(id) => navigate(`/user/${id}`)}
                />
              ))
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500 py-4">No comments yet — be the first to ask something.</p>
            )}
          </div>
        </div>

      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete this listing?"
        message="This can't be undone — the listing and its images will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeletingListing}
        onConfirm={handleConfirmDeleteListing}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showSaveEditConfirm}
        title="Save and resubmit for review?"
        message="This listing will go back to Pending until it's re-approved."
        confirmLabel="Save & Resubmit"
        isLoading={isSavingEdit}
        onConfirm={handleConfirmSaveEdit}
        onCancel={() => setShowSaveEditConfirm(false)}
      />
    </div>
  );
};

export default ListingDetailPage;