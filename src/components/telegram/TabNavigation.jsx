import React from "react";
import { MessageCircle, History, Settings } from "lucide-react";

export default function TabNavigation({
  activeTab,
  setActiveTab,
  onOpenSettings,
  isDarkMode,
}) {
  return (
    <div
      className={`${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } border-b`}
    >
      <div className="flex">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "chat"
              ? isDarkMode
                ? "border-blue-500 text-blue-400 bg-gray-700/50"
                : "border-blue-500 text-blue-600 bg-blue-50"
              : isDarkMode
              ? "border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-700/30"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Live Chat</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "history"
              ? isDarkMode
                ? "border-blue-500 text-blue-400 bg-gray-700/50"
                : "border-blue-500 text-blue-600 bg-blue-50"
              : isDarkMode
              ? "border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-700/30"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Bot History</span>
        </button>

        <div className="flex-1"></div>

        <button
          onClick={onOpenSettings}
          className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
            isDarkMode
              ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700/30"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}
