// Single source of truth for status → color mapping, so every page
// (listing detail, profile's "My Listings", home feed) shows identical
// colors for the same status. Keep this as the ONLY place that maps
// Listing.status to a color — don't inline status-color logic elsewhere.
export function getStatusStyles(status) {
  switch (status) {
    case "Listed":
      return {
        label: "Listed",
        solidBadge: "bg-green-500/90 text-white",
        pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
      };
    case "Rejected":
      return {
        label: "Rejected",
        solidBadge: "bg-red-500/90 text-white",
        pill: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
      };
    case "Pending":
    case "Under Review":
      return {
        label: status,
        solidBadge: "bg-amber-500/90 text-white",
        pill: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
      };
    case "Sold":
      return {
        label: "Sold",
        solidBadge: "bg-slate-500/90 text-white",
        pill: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      };
    default:
      return {
        label: status,
        solidBadge: "bg-gray-500/90 text-white",
        pill: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}