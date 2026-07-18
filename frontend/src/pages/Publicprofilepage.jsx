import React, { useState, useEffect } from 'react';
import { Loader2, MapPin, Phone } from 'lucide-react';
import { userApi } from '../utils/api';

const ListingThumb = ({ listing, navigate }) => (
  <button
    onClick={() => navigate(`/listing/${listing._id}`)}
    className="text-left bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
  >
    <div className="h-32 w-full bg-slate-100">
      <img src={listing.images?.[0]} alt={listing.title} className="w-full h-full object-cover" />
    </div>
    <div className="p-3">
      <h3 className="text-sm font-semibold text-slate-800 line-clamp-1">{listing.title}</h3>
      <div className="text-sm font-bold text-slate-700 mt-1">₹{listing.price}</div>
    </div>
  </button>
);

// userId: from the route. navigate: the app's fake-router setter.
// Read-only — this is how you see someone ELSE's profile, never your own.
const PublicProfilePage = ({ userId, navigate }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await userApi.getUserById(userId);
        setProfile(data);
      } catch (err) {
        setError(err.message || "Couldn't load this profile.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-24 bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 bg-slate-50 text-rose-500 text-sm gap-3">
        <p>{error || "User not found."}</p>
        <button onClick={() => navigate("/")} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-700 text-sm hover:bg-slate-50">
          Back to feed
        </button>
      </div>
    );
  }

  const contactAvailable = profile.contactInfo && profile.contactInfo !== "Hidden";

  return (
    <div className="flex-1 bg-slate-50 w-full min-h-screen p-4 sm:p-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-600 flex-shrink-0">
            {profile.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{profile.name}</h1>
            <p className="text-sm text-slate-500">@{profile.username}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.department && (
                <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{profile.department}</span>
              )}
              {profile.year && (
                <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{profile.year}</span>
              )}
              {profile.stream && (
                <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{profile.stream}</span>
              )}
            </div>
          </div>
        </div>

        {contactAvailable && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-3 shadow-sm">
            <Phone className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <div>
              <div className="text-xs text-slate-400">Contact</div>
              <div className="text-sm font-medium text-slate-700">{profile.contactInfo}</div>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Active Listings</h2>
          {profile.myListings?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {profile.myListings.map((listing) => (
                <ListingThumb key={listing._id} listing={listing} navigate={navigate} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-sm text-slate-400">
              No active listings right now.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PublicProfilePage;