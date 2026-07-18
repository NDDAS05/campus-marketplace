import React from 'react';
import { ChevronRight, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const categories = ["All Items", "Textbooks", "Electronics", "Lab Equipments", "Furniture", "Stationery", "Others"];
  
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
        fixed inset-y-0 left-0 z-[70] w-72 h-full bg-white shadow-2xl p-6 overflow-y-auto transition-transform duration-300 ease-in-out transform rounded-r-3xl
         lg:translate-x-0 lg:block lg:h-[calc(100vh-73px)] lg:sticky lg:top-[73px] lg:z-10 lg:rounded-none lg:shadow-none lg:border-r lg:border-gray-100
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile Header with Close Button */}
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <h2 className="font-bold text-lg">Filters</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Categories</h3>
        <ul className="space-y-2">
          {categories.map((cat, idx) => (
            <li key={idx}>
              <button className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${idx === 0 ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`}>
                {cat}
                {idx !== 0 && <ChevronRight className="w-4 h-4 opacity-50" />}
              </button>
            </li>
          ))}
        </ul>

        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mt-8 mb-4">Price Range</h3>
        <div className="flex gap-2 items-center">
          <input type="number" placeholder="Min" className="w-full bg-gray-50 border border-gray-200 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:border-black" />
          <span className="text-gray-400">-</span>
          <input type="number" placeholder="Max" className="w-full bg-gray-50 border border-gray-200 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:border-black" />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;