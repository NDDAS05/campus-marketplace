import React, { useState, useEffect } from 'react';
import Sidebar from "../components/common/Sidebar";
import { Filter, ChevronLeft, ChevronRight, MapPin, Trash2, Loader2 } from 'lucide-react';
import { listingsApi } from "../utils/api"; // adjust path to wherever you save api.js

// --- SUBCOMPONENT: LISTING CARD ---
const ListingCard = ({ listing, onDelete, isRemoving, navigate }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    let interval;
    if (!isHovered && listing.images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % listing.images.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isHovered, listing.images.length]);

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1));
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await onDelete(listing._id);
    } catch (err) {
      // Failed on the server — don't leave the card in a "deleting" limbo state
      setIsDeleting(false);
      alert(err.message || "Couldn't delete this listing. Please try again.");
    }
  };

  const removingForAnimation = isRemoving || isDeleting;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group
        ${isMounted && !removingForAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        ${removingForAnimation ? '!opacity-0 !scale-90' : ''}
      `}
      style={{ transitionProperty: 'opacity, transform, box-shadow' }}
    >

      {/* 1. Image Section — sliding track */}
      <div
        className="relative h-56 w-full bg-gray-100 overflow-hidden cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="flex h-full w-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {listing.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${listing.title} ${idx + 1}`}
              className="w-full h-56 flex-shrink-0 object-cover"
            />
          ))}
        </div>

        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-800 shadow-sm">
          {listing.category}
        </div>

        {listing.status === "Sold" ? (
          <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm">
            SOLD OUT
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm">
            Available
          </div>
        )}

        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className={`absolute bottom-3 right-3 p-1.5 bg-white/90 hover:bg-red-500 hover:text-white rounded-full text-gray-700 shadow-md transition-all duration-200 disabled:opacity-50 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          title="Remove listing"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>

        {listing.images.length > 1 && (
          <div className={`absolute inset-0 flex items-center justify-between px-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button onClick={prevImage} className="p-1.5 bg-white/80 hover:bg-white rounded-full text-gray-800 shadow-md transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextImage} className="p-1.5 bg-white/80 hover:bg-white rounded-full text-gray-800 shadow-md transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {listing.images.length > 1 && (
          <div className="absolute bottom-3 left-0 w-full flex justify-center gap-1.5">
            {listing.images.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <h2 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1" title={listing.title}>
          {listing.title}
        </h2>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
          {listing.description}
        </p>

        <div className="flex items-end justify-between mb-4">
          <div className="flex items-center text-gray-400 text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            {listing.location}
          </div>
          <div className="text-xl font-bold text-gray-900">
            ₹{listing.price}
          </div>
        </div>

        <button
          onClick={() => navigate(`/listing/${listing._id}`)}
          className="w-full py-2.5 bg-black text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
        >
          View Item
        </button>
      </div>
    </div>
  );
};


// --- MAIN PAGE COMPONENT ---
const HomePage = ({ navigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [listings, setListings] = useState([]);
  const [removingIds, setRemovingIds] = useState(new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchListings = async (after = null) => {
    const data = await listingsApi.getListings(after ? { after } : {});
    setListings((prev) => (after ? [...prev, ...data.listings] : data.listings));
    setNextCursor(data.pagination.nextCursor);
    setHasMore(data.pagination.hasMore);
  };

  // Initial load
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        await fetchListings();
      } catch (err) {
        setError(err.message || "Couldn't load listings.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleLoadMore = async () => {
    if (!nextCursor) return;
    setIsLoadingMore(true);
    try {
      await fetchListings(nextCursor);
    } catch (err) {
      setError(err.message || "Couldn't load more listings.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Called by a card's delete button. Hits the real DELETE route first —
  // only removed from the UI (with the fade/scale-out animation) once the
  // server confirms it. Throws back to the card on failure so it can
  // reset its own "deleting" state and show an error.
  const handleDelete = async (id) => {
    await listingsApi.deleteListing(id);
    setRemovingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setListings((prev) => prev.filter((item) => item._id !== id));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300); // matches the card's exit transition duration
  };

  return (
    <div className="flex w-full relative">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 p-4 sm:p-8 bg-gray-50 w-full min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Marketplace Feed</h1>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-50 shadow-sm"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-red-500 text-sm gap-3">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm hover:bg-gray-50"
            >
              Retry
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <p className="text-sm">No listings yet. Add one to get started.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {listings.map((item) => (
                <ListingCard
                  key={item._id}
                  listing={item}
                  onDelete={handleDelete}
                  isRemoving={removingIds.has(item._id)}
                  navigate={navigate}
                />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50 shadow-sm disabled:opacity-50"
                >
                  {isLoadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;