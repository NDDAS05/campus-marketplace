import React, { useState, useEffect } from 'react';
import { Pencil, MapPin, Trash2, Loader2, Heart, X, LogOut } from 'lucide-react';
import { userApi, listingsApi } from '../utils/api';
import { getAcademicYear, getValidSemesters } from '../utils/academicYear';
import { getStatusStyles } from '../utils/ListingStatus';
import ConfirmDialog from '../components/common/ConfirmDialog';
const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Graduated"];
const STREAM_OPTIONS = ["B.Tech", "B.Arch", "M.Tech", "PHD"];
const DEPARTMENT_OPTIONS = ["CST", "IT", "EE", "ME", "CE", "AE", "MME", "MIN", "Architecture"];
const SEMESTER_OPTIONS = ["1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem", "7th Sem", "8th Sem"];

// // The Listing model has 5 possible statuses, not just Sold/Listed —
// // each needs its own badge color/label so a Pending or Under Review
// // listing doesn't get mislabeled as "Listed".
// const STATUS_BADGES = {
//   Listed: { label: "Listed", className: "bg-green-500/90" },
//   Sold: { label: "Sold", className: "bg-red-500/90" },
//   Pending: { label: "Pending Review", className: "bg-amber-500/90" },
//   "Under Review": { label: "Under Review", className: "bg-amber-500/90" },
//   Rejected: { label: "Rejected", className: "bg-gray-500/90" },
// };

// --- Small owned-listing card: management view, not the browsing view from Home ---
const OwnedListingCard = ({ listing, onToggleStatus, onDelete, navigate }) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggleStatus = async (e) => {
    e.stopPropagation(); // Prevents navigating when clicking the button
    setIsUpdatingStatus(true);
    try {
      await onToggleStatus(listing._id, listing.status === "Sold" ? "Listed" : "Sold");
    } catch (err) {
      alert(err.message || "Couldn't update this listing's status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(listing._id);
      setShowDeleteConfirm(false);
    } catch (err) {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      alert(err.message || "Couldn't delete this listing.");
    }
  };

  const canToggleSoldListed = listing.status === "Listed" || listing.status === "Sold";
  const badge = getStatusStyles(listing.status);
  const canEdit = listing.status === "Listed" || listing.status === "Rejected";
  return (
    <div 
      onClick={() => navigate(`/listing/${listing._id}`)}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col cursor-pointer hover:shadow-md dark:hover:shadow-black/40 transition-all duration-300"
    >
      <div className="relative h-40 w-full bg-gray-100 dark:bg-gray-800">
        <img
          src={listing.images?.[0]}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        <div className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm ${badge.solidBadge}`}>
          {badge.label}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 mb-1" title={listing.title}>
          {listing.title}
        </h3>
        <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">₹{listing.price}</div>

        {listing.status === "Rejected" && listing.moderationReason && (
          <p className="text-xs text-red-500 dark:text-red-400 mb-3 line-clamp-2" title={listing.moderationReason}>
            {listing.moderationReason}
          </p>
        )}

        <div className="flex gap-2 mt-auto">
          {canToggleSoldListed ? (
            <button
              onClick={handleToggleStatus}
              disabled={isUpdatingStatus}
              className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
            >
              {isUpdatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Mark as {listing.status === "Sold" ? "Listed" : "Sold"}
            </button>
          ) : (
            <div className="flex-1 py-2 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 text-sm text-gray-400 dark:text-gray-500 flex items-center justify-center">
              {listing.status === "Rejected" ? "Edit & resubmit to relist" : "Awaiting review"}
            </div>
          )}
          {canEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/listing/${listing._id}/edit`); }}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                title="Edit listing"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          <button
            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
            disabled={isDeleting}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 transition-colors"
            title="Delete listing"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete this listing?"
          message="This can't be undone — the listing and its images will be permanently removed."
          confirmLabel="Delete"
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    </div>
  );
};

// --- Wishlist item card ---
const WishlistCard = ({ listing, onRemove, navigate }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async (e) => {
    e.stopPropagation(); // Prevents navigating when clicking the button
    setIsRemoving(true);
    try {
      await onRemove(listing._id);
    } catch (err) {
      setIsRemoving(false);
      alert(err.message || "Couldn't remove this item.");
    }
  };

  return (
    <div 
      onClick={() => navigate(`/listing/${listing._id}`)}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col cursor-pointer hover:shadow-md dark:hover:shadow-black/40 transition-all duration-300"
    >
      <div className="relative h-40 w-full bg-gray-100 dark:bg-gray-800">
        <img src={listing.images?.[0]} alt={listing.title} className="w-full h-full object-cover" />
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 dark:bg-gray-900/90 hover:bg-red-500 hover:text-white rounded-full text-gray-700 dark:text-gray-200 shadow-sm disabled:opacity-50 transition-colors"
          title="Remove from wishlist"
        >
          {isRemoving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 mb-1" title={listing.title}>
          {listing.title}
        </h3>
        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">₹{listing.price}</div>
      </div>
    </div>
  );
};

const ProfilePage = ({ onLogout, navigate }) => { // <-- navigate is securely added here
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveNotice, setSaveNotice] = useState(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await userApi.getProfile();
        setProfile(data);
      } catch (err) {
        setError(err.message || "Couldn't load your profile.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const openEditForm = () => {
    setEditForm({
      name: profile.name || "",
      department: profile.department || "",
      year: profile.year || getAcademicYear(profile.email, profile.stream),
      semester: profile.semester || "",
      stream: profile.stream || "",
      contactInfo: profile.contactInfo || "",
      isContactDisplayable: !!profile.isContactDisplayable,
    });
    setSaveError(null);
    setSaveNotice(null);
    setIsEditing(true);
  };

  const handleEditChange = (field) => (e) => {
    const value = field === "isContactDisplayable" ? e.target.checked : e.target.value;
    setEditForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "year") {
        const validSemesters = getValidSemesters(value);
        if (validSemesters && !validSemesters.includes(prev.semester)) {
          next.semester = "";
        }
      }
      return next;
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = { ...editForm };
      if (profile.contactInfo && profile.contactInfo.trim() !== "") {
        delete payload.contactInfo;
      }

      const data = await userApi.updateProfile(payload);
      
      // Fixes the blank cards issue by preserving the populated arrays
      setProfile((prev) => ({ 
        ...prev, 
        ...data.user,
        myListings: prev.myListings,
        wishlist: prev.wishlist 
      }));

      if (data.skippedFields?.length > 0) {
        setSaveNotice(data.message);
      } else {
        setIsEditing(false);
      }
    } catch (err) {
      setSaveError(err.message || "Couldn't save your changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleListingStatus = async (id, newStatus) => {
    await listingsApi.updateStatus(id, newStatus);
    setProfile((prev) => ({
      ...prev,
      myListings: prev.myListings.map((l) => (l._id === id ? { ...l, status: newStatus } : l)),
    }));
  };

  const handleDeleteListing = async (id) => {
    await listingsApi.deleteListing(id);
    setProfile((prev) => ({
      ...prev,
      myListings: prev.myListings.filter((l) => l._id !== id),
    }));
  };

  const handleRemoveFromWishlist = async (listingId) => {
    await userApi.removeFromWishlist(listingId);
    setProfile((prev) => ({
      ...prev,
      wishlist: prev.wishlist.filter((l) => l._id !== listingId),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-red-500 dark:text-red-400 text-sm gap-3">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="flex-1 p-4 sm:p-8 bg-gray-50 dark:bg-gray-950 w-full min-h-screen">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">

        {/* --- Header --- */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-600 dark:text-gray-200 flex-shrink-0">
              {profile.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{profile.name}</h1>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 hover:border-red-100 dark:hover:border-red-900 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.department && (
                  <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full">{profile.department}</span>
                )}
                {profile.year && (
                  <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full">{profile.year}</span>
                )}
                {profile.stream && (
                  <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full">{profile.stream}</span>
                )}
                {memberSince && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 px-1 py-1">Member since {memberSince}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- Personal details --- */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Personal Details</h2>
            {!isEditing && (
              <button onClick={openEditForm} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400" title="Edit details">
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><span className="text-gray-400 dark:text-gray-500">Email</span><p className="text-gray-900 dark:text-gray-100">{profile.email}</p></div>
              <div><span className="text-gray-400 dark:text-gray-500">Semester</span><p className="text-gray-900 dark:text-gray-100">{profile.semester || "—"}</p></div>
              <div><span className="text-gray-400 dark:text-gray-500">Contact Info</span><p className="text-gray-900 dark:text-gray-100">{profile.contactInfo || "Not set"}</p></div>
              <div><span className="text-gray-400 dark:text-gray-500">Visible to buyers</span><p className="text-gray-900 dark:text-gray-100">{profile.isContactDisplayable ? "Yes" : "No"}</p></div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
              {saveError && (
                <div className="px-4 py-2.5 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 text-sm rounded-lg">{saveError}</div>
              )}
              {saveNotice && (
                <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 text-amber-700 dark:text-amber-400 text-sm rounded-lg">{saveNotice}</div>
              )}

              <input
                type="text"
                value={editForm.name}
                onChange={handleEditChange("name")}
                placeholder="Full name"
                className="w-full bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
              />

              <div className="grid grid-cols-2 gap-3">
                <select value={editForm.department} onChange={handleEditChange("department")} className="bg-gray-100 dark:bg-gray-800 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-gray-700 dark:text-gray-200">
                  <option value="">Department</option>
                  {DEPARTMENT_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={editForm.year} onChange={handleEditChange("year")} className="bg-gray-100 dark:bg-gray-800 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-gray-700 dark:text-gray-200">
                  <option value="">Year</option>
                  {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={editForm.semester} onChange={handleEditChange("semester")} className="bg-gray-100 dark:bg-gray-800 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-gray-700 dark:text-gray-200">
                  <option value="">Semester</option>
                  {(getValidSemesters(editForm.year) || SEMESTER_OPTIONS).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={editForm.stream} onChange={handleEditChange("stream")} className="bg-gray-100 dark:bg-gray-800 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-gray-700 dark:text-gray-200">
                  <option value="">Stream</option>
                  {STREAM_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <input
                type="text"
                value={editForm.contactInfo}
                onChange={handleEditChange("contactInfo")}
                placeholder="Contact info (phone/email — can only be set once)"
                disabled={!!(profile.contactInfo && profile.contactInfo.trim() !== "")}
                className="w-full bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none disabled:opacity-60"
              />
              {profile.contactInfo && (
                <p className="text-xs text-gray-400 dark:text-gray-500 -mt-2">Contact info is locked once set and can't be changed here.</p>
              )}

              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={editForm.isContactDisplayable}
                  onChange={handleEditChange("isContactDisplayable")}
                  className="w-4 h-4"
                />
                Show my contact info to buyers on my listings
              </label>

              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg font-medium text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* --- My Listings --- */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">My Listings</h2>
          {profile.myListings?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {profile.myListings.map((listing) => (
                <OwnedListingCard
                  key={listing._id}
                  listing={listing}
                  onToggleStatus={handleToggleListingStatus}
                  onDelete={handleDeleteListing}
                  navigate={navigate}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-10 text-center text-sm text-gray-400 dark:text-gray-500">
              You haven't posted anything yet.
            </div>
          )}
        </div>

        {/* --- Wishlist --- */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4" /> Wishlist
          </h2>
          {profile.wishlist?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {profile.wishlist.map((listing) => (
                <WishlistCard 
                  key={listing._id} 
                  listing={listing} 
                  onRemove={handleRemoveFromWishlist} 
                  navigate={navigate} 
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-10 text-center text-sm text-gray-400 dark:text-gray-500">
              Nothing saved yet.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;