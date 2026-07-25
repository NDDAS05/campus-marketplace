import React, { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose, activeCategory, onCategorySelect, onPriceApply }) => {
  // Must match the Listing schema's category enum exactly (see Listing.js /
  // listing.validator.js / CreateListingPage's CATEGORY_OPTIONS) — filtering
  // by a category that doesn't exist in the enum always returns zero results.
  const categories = ["All Items", "Books", "Electronics", "Cycles", "Hostel Essentials", "Stationery", "Clothing", "Sports", "Other"];
  
  // Local state for price inputs
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleApplyPrice = () => {
    onPriceApply(minPrice, maxPrice);
  };

  return (
    <>
      {/* Mobile Overlay Background with Smooth Fade */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[60] lg:hidden transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>

      {/* Sidebar Content with Smooth Slide */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-72 h-full bg-white dark:bg-gray-900 shadow-2xl p-6 overflow-y-auto transition-all duration-300 ease-in-out transform rounded-r-3xl
         lg:translate-x-0 lg:block lg:h-[calc(100vh-73px)] lg:sticky lg:top-[73px] lg:z-10 lg:rounded-none lg:shadow-none lg:border-r lg:border-gray-100 dark:lg:border-gray-800
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile Header with Close Button */}
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">Filters</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Categories</h3>
        <ul className="space-y-2">
          {categories.map((cat, idx) => {
            // Check if this category is the currently active one
            const isActive = activeCategory === cat;
            
            return (
              <li key={idx}>
                <button 
                  onClick={() => onCategorySelect(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-black dark:bg-white text-white dark:text-black' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {cat}
                  {!isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                </button>
              </li>
            );
          })}
        </ul>

        <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-8 mb-4">Price Range</h3>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 items-center">
            <input 
              type="number" 
              placeholder="Min" 
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors" 
            />
            <span className="text-gray-400 dark:text-gray-500">-</span>
            <input 
              type="number" 
              placeholder="Max" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors" 
            />
          </div>
          <button 
            onClick={handleApplyPrice}
            className="w-full py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Apply Price
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;