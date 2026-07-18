import React from "react";

const MessagesPage = () => (
  <div className="flex-1 flex h-[calc(100vh-73px)] max-w-7xl mx-auto w-full p-6">
    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm flex overflow-hidden">
      {/* Chat List */}
      <div className="w-1/3 border-r border-gray-200">
        <div className="p-4 border-b border-gray-100 font-semibold">Inbox</div>
        <div className="p-4 border-b border-gray-50 bg-blue-50/50 cursor-pointer">
          <h4 className="font-semibold text-sm">John Doe</h4>
          <p className="text-xs text-gray-500 mt-1">Regarding: Prescott's Microbiology</p>
        </div>
      </div>
      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-100 font-semibold">Chat with John</div>
        <div className="flex-1 bg-gray-50 p-4 flex items-center justify-center text-gray-400 text-sm">
          [ Chat history goes here ]
        </div>
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="h-10 bg-gray-100 rounded-full w-full"></div>
        </div>
      </div>
    </div>
  </div>
);

export default MessagesPage;