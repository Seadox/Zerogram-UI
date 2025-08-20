import React from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function EmptyMessagePlaceholder() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500">No messages yet. Start a conversation!</p>
    </motion.div>
  );
}
