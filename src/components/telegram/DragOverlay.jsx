import React from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function DragOverlay({ isDragOver, isDarkMode }) {
  if (!isDragOver) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`absolute inset-0 ${
        isDarkMode ? "bg-gray-900/80" : "bg-blue-500/20"
      } backdrop-blur-sm z-50 flex items-center justify-center p-4`}
    >
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800/95 border-gray-600 text-white"
            : "bg-white/90 border-blue-500 text-gray-900"
        } rounded-2xl p-6 sm:p-8 text-center shadow-2xl border-2 border-dashed max-w-sm sm:max-w-md`}
      >
        <div
          className={`w-12 h-12 sm:w-16 sm:h-16 ${
            isDarkMode ? "bg-blue-600" : "bg-blue-500"
          } rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4`}
        >
          <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold mb-2">Drop files here</h3>
        <p
          className={`text-sm sm:text-base ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Release to send files to the chat
        </p>
      </div>
    </motion.div>
  );
}
