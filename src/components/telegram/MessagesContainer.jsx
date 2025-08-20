import React, { forwardRef } from "react";
import { AnimatePresence } from "framer-motion";
import MessageBubble from "./MessageBubble";
import EmptyMessagePlaceholder from "./EmptyMessagePlaceholder";

const MessagesContainer = forwardRef(
  ({ messages, onReply, isDarkMode, messagesEndRef }, ref) => {
    return (
      <div ref={ref} className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-1">
        <AnimatePresence>
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              index={index}
              onReply={onReply}
              isDarkMode={isDarkMode}
            />
          ))}
        </AnimatePresence>

        {messages.length === 0 && <EmptyMessagePlaceholder />}

        <div ref={messagesEndRef} />
      </div>
    );
  }
);

MessagesContainer.displayName = "MessagesContainer";

export default MessagesContainer;
