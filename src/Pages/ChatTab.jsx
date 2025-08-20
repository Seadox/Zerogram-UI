import React, { useState, useEffect, useRef } from "react";
import { TelegramConfig, TelegramMessage } from "@/entities/all";
import { motion, AnimatePresence } from "framer-motion";

import ChatHeader from "../components/telegram/ChatHeader";
import MessageInput from "../components/telegram/MessageInput";
import DragOverlay from "../components/telegram/DragOverlay";
import ErrorAlert from "../components/telegram/ErrorAlert";
import MessagesContainer from "../components/telegram/MessagesContainer";
import { useChatConnection } from "../hooks/useChatConnection";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { MessageService } from "../services/MessageService";

export default function ChatTab({
  config,
  onOpenConfig,
  isDarkMode = true,
  onExportChat,
  isExporting,
}) {
  const [error, setError] = useState(null);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Use custom hooks
  const {
    messages,
    isConnected,
    botInfo,
    chatInfo,
    memberCount,
    administrators,
    loadMessages,
  } = useChatConnection(config);

  const {
    isDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  } = useDragAndDrop(config, isConnected, setError, handleSendMessage);

  async function handleSendMessage(messageData) {
    try {
      await MessageService.sendMessage(messageData, config);
      await loadMessages();
    } catch (error) {
      setError(error.message);
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }

    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  const handleReply = (message) => {
    setReplyToMessage(message);
  };

  const handleClearReply = () => {
    setReplyToMessage(null);
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <DragOverlay isDragOver={isDragOver} isDarkMode={isDarkMode} />

      <ChatHeader
        config={config}
        isConnected={isConnected}
        messageCount={messages.length}
        botInfo={botInfo}
        chatInfo={chatInfo}
        memberCount={memberCount}
        administrators={administrators}
        isDarkMode={isDarkMode}
        onOpenConfig={onOpenConfig}
        onExportChat={onExportChat}
        isExporting={isExporting}
      />

      <ErrorAlert error={error} onClearError={() => setError(null)} />

      <div className="flex-1 flex flex-col min-h-0">
        <MessagesContainer
          ref={messagesContainerRef}
          messages={messages}
          onReply={handleReply}
          isDarkMode={isDarkMode}
          messagesEndRef={messagesEndRef}
        />

        <div className="flex-shrink-0">
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={!isConnected}
            replyToMessage={replyToMessage}
            onClearReply={handleClearReply}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
}
