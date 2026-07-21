import React from "react";

const MessagesPage = () => (
  <div className="flex-1 flex h-[calc(100vh-73px)] max-w-7xl mx-auto w-full p-6">
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex overflow-hidden">
      {/* Chat List */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-800">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 font-semibold text-gray-900 dark:text-gray-100">Inbox</div>
        <div className="p-4 border-b border-gray-50 dark:border-gray-800/50 bg-blue-50/50 dark:bg-blue-950/30 cursor-pointer">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">John Doe</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Regarding: Prescott's Microbiology</p>
        </div>
      </div>
      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 font-semibold text-gray-900 dark:text-gray-100">Chat with John</div>
        <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-4 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
          [ Chat history goes here ]
        </div>
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-full w-full"></div>
        </div>
      </div>
    </div>
  </div>
);

export default MessagesPage;