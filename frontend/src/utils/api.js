// Thin fetch wrapper. No axios needed for this — the app only talks to one
// backend and every call needs the same two things: the JWT cookie sent
// along, and JSON handled consistently.

// Empty string works with the Vite dev proxy (requests to /api/* forward to
// your backend). Set VITE_API_URL in .env for production builds.
const API_BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_BASE}${path}`, {
    // Sends the httpOnly JWT cookie set by your auth routes.
    // Required for isLoggedIn-protected routes (create/update/delete/status/comments).
    credentials: "include",
    ...options,
    headers: isFormData
      ? options.headers // let the browser set the multipart boundary itself
      : { "Content-Type": "application/json", ...(options.headers || {}) },
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // some responses (e.g. 204, or a network-level failure) have no JSON body
  }

  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export const listingsApi = {
  // params can include: category, status, search, limit, after
  getListings: (params = {}) => {
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    );
    const query = new URLSearchParams(cleaned).toString();
    return request(`/api/listings${query ? `?${query}` : ""}`);
  },

  getSuggested: () => request(`/api/listings/suggested`),

  getListingById: (id) => request(`/api/listings/${id}`),

  // formData must be a FormData instance with an "images" field (up to 10 files)
  // matching upload.array('images', 10) on the backend.
  createListing: (formData) =>
    request(`/api/listings`, { method: "POST", body: formData }),

  updateListing: (id, payload) =>
    request(`/api/listings/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  deleteListing: (id) => request(`/api/listings/${id}`, { method: "DELETE" }),

  updateStatus: (id, status) =>
    request(`/api/listings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  addComment: (id, text) =>
    request(`/api/listings/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  deleteComment: (id, commentId) =>
    request(`/api/listings/${id}/comments/${commentId}`, { method: "DELETE" }),
};

export const authApi = {
  // payload: { name, username, email, password, department?, year?, semester?, stream? }
  register: (payload) =>
    request(`/api/auth/register`, { method: "POST", body: JSON.stringify(payload) }),

  // payload: { email, password }
  login: (payload) =>
    request(`/api/auth/login`, { method: "POST", body: JSON.stringify(payload) }),

  // Reads the httpOnly cookie server-side; throws (401) if not logged in.
  getMe: () => request(`/api/auth/me`),

  // NOTE: requires a /api/auth/logout route + controller — see chat for the
  // exact lines to add, since httpOnly cookies can't be cleared from JS.
  logout: () => request(`/api/auth/logout`, { method: "POST" }),
};

export const userApi = {
  getProfile: () => request(`/api/users/profile`),

  // payload can include: name, department, year, semester, stream,
  // contactInfo (set-once — locked server-side once non-empty), isContactDisplayable
  updateProfile: (payload) =>
    request(`/api/users/profile`, { method: "PUT", body: JSON.stringify(payload) }),

  getUserById: (id) => request(`/api/users/${id}`),

  addToWishlist: (listingId) =>
    request(`/api/users/wishlist/${listingId}`, { method: "POST" }),

  removeFromWishlist: (listingId) =>
    request(`/api/users/wishlist/${listingId}`, { method: "DELETE" }),
};

export { API_BASE };