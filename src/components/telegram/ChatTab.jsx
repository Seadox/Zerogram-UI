import React, { useState, useEffect, useRef } from "react";
import { TelegramConfig, TelegramMessage } from "@/entities/all";
import {
  UploadFile,
  sendMessage,
  getUpdates,
  sendDocument,
  sendPhoto,
  sendAnimation,
  sendVideo,
  getFile,
  sendContact,
  getMe,
  getChat,
  getChatMemberCount,
  getChatAdministrators,
} from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

export default function ChatTab({
  config,
  onOpenConfig,
  isDarkMode = true,
  onExportChat,
  isExporting,
}) {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdateId, setLastUpdateId] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [botInfo, setBotInfo] = useState(null);
  const [chatInfo, setChatInfo] = useState(null);
  const [memberCount, setMemberCount] = useState(null);
  const [administrators, setAdministrators] = useState([]);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (config && config.isValid()) {
      initializeBotInfo();
      loadMessages();
      startPolling();
    } else {
      setError("Bot configuration is invalid");
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [config]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeBotInfo = async () => {
    try {
      // Get bot information
      const botResult = await getMe(config);
      if (botResult.ok) {
        setBotInfo(botResult.result);
      }

      // Get chat information
      const chatResult = await getChat(config.bot_token, config.chat_id);
      if (chatResult.ok) {
        setChatInfo(chatResult.result);
      }

      // Get member count
      const memberResult = await getChatMemberCount(config);
      if (memberResult.ok) {
        setMemberCount(memberResult.result);
      }

      // Get administrators
      const adminResult = await getChatAdministrators(config);
      if (adminResult.ok) {
        setAdministrators(adminResult.result);
      }
    } catch (error) {
      // Failed to load chat info
    }
  };

  const loadMessages = async () => {
    try {
      const savedMessages = await TelegramMessage.list();
      setMessages(savedMessages);
      setError(null);
      setIsConnected(true);
    } catch (error) {
      setError("Failed to load messages");
    }
  };

  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const updates = await getUpdates(config, lastUpdateId + 1, messages);
        if (updates.length > 0) {
          const newMessages = [];
          let maxUpdateId = lastUpdateId;

          for (const update of updates) {
            if (update.update_id > maxUpdateId) {
              maxUpdateId = update.update_id;
            }

            if (update.message) {
              const messageData = await processMessage(update.message);
              if (messageData) {
                newMessages.push(messageData);
              }
            }
          }

          if (newMessages.length > 0) {
            setMessages((prev) => [...prev, ...newMessages]);
          }

          setLastUpdateId(maxUpdateId);
        }
        setError(null);
        setIsConnected(true);
      } catch (error) {
        setError("Connection lost. Retrying...");
        setIsConnected(false);
      }
    }, config.pollingInterval || 2000);
  };

  const processMessage = async (message) => {
    try {
      let fileUrl = "";
      let fileName = "";
      let messageType = "text";

      // Handle different message types
      if (message.photo) {
        messageType = "photo";
        const photo = message.photo[message.photo.length - 1];
        try {
          fileUrl = await getFile(config, photo.file_id);
        } catch (error) {
          // File fetch failed
        }
      } else if (message.document) {
        messageType = "document";
        fileName = message.document.file_name || "Document";
        try {
          fileUrl = await getFile(config, message.document.file_id);
        } catch (error) {
          // File fetch failed
        }
      } else if (message.video) {
        messageType = "video";
        try {
          fileUrl = await getFile(config, message.video.file_id);
        } catch (error) {
          // File fetch failed
        }
      } else if (message.animation) {
        messageType = "animation";
        try {
          fileUrl = await getFile(config, message.animation.file_id);
        } catch (error) {
          // File fetch failed
        }
      } else if (message.voice) {
        messageType = "voice";
        try {
          fileUrl = await getFile(config, message.voice.file_id);
        } catch (error) {
          // File fetch failed
        }
      } else if (message.video_note) {
        messageType = "video_note";
        try {
          fileUrl = await getFile(config, message.video_note.file_id);
        } catch (error) {
          // File fetch failed
        }
      } else if (message.contact) {
        messageType = "contact";
      } else if (message.location) {
        messageType = "location";
      } else if (message.sticker) {
        messageType = "sticker";
        try {
          fileUrl = await getFile(config, message.sticker.file_id);
        } catch (error) {
          // File fetch failed
        }
      }

      const telegramMessage = await TelegramMessage.create({
        message_id: message.message_id,
        content: message.text || message.caption || "",
        sender_name: message.from
          ? `${message.from.first_name || ""} ${
              message.from.last_name || ""
            }`.trim()
          : "Unknown",
        timestamp: new Date(message.date * 1000).toISOString(),
        message_type: messageType,
        chat_id: message.chat.id.toString(),
        file_url: fileUrl,
        file_name: fileName,
        from: message.from,
        chat: message.chat,
        reply_to_message: message.reply_to_message,
        forward_from: message.forward_from,
        forward_from_chat: message.forward_from_chat,
        forward_from_message_id: message.forward_from_message_id,
        forward_signature: message.forward_signature,
        forward_sender_name: message.forward_sender_name,
        forward_date: message.forward_date,
        contact: message.contact,
        location: message.location,
        document: message.document,
        photo: message.photo,
        video: message.video,
        animation: message.animation,
        voice: message.voice,
        video_note: message.video_note,
        sticker: message.sticker,
      });

      return telegramMessage;
    } catch (error) {
      return null;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content, type = "text", file = null) => {
    try {
      let result;
      switch (type) {
        case "text":
          result = await sendMessage(
            content,
            config,
            replyToMessage?.message_id
          );
          break;
        case "document":
          result = await sendDocument(
            file,
            config,
            content,
            replyToMessage?.message_id
          );
          break;
        case "photo":
          result = await sendPhoto(
            file,
            config,
            content,
            replyToMessage?.message_id
          );
          break;
        case "video":
          result = await sendVideo(
            file,
            config,
            content,
            replyToMessage?.message_id
          );
          break;
        case "animation":
          result = await sendAnimation(
            file,
            config,
            content,
            replyToMessage?.message_id
          );
          break;
        case "contact":
          result = await sendContact(
            content,
            config,
            replyToMessage?.message_id
          );
          break;
      }

      if (result && result.ok) {
        // Message sent successfully
        setReplyToMessage(null);
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      setError("Failed to send message");
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setDragCounter(dragCounter + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragCounter(dragCounter - 1);
    if (dragCounter === 1) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setDragCounter(0);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Handle file upload logic here
      // You can pass this to MessageInput or handle it directly
    }
  };

  const handleReply = (message) => {
    setReplyToMessage(message);
  };

  const clearReply = () => {
    setReplyToMessage(null);
  };

  if (!config || !config.isValid()) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bot configuration is required.{" "}
            <Button
              variant="link"
              onClick={onOpenConfig}
              className="p-0 h-auto"
            >
              Configure now
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            style={{ pointerEvents: "none" }}
          >
            <div
              className={`p-8 rounded-lg border-2 border-dashed ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-400 text-black"
              }`}
            >
              <UploadFile className="w-12 h-12 mx-auto mb-4" />
              <p className="text-center text-lg font-medium">
                Drop file to upload
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <ChatHeader
        botInfo={botInfo}
        chatInfo={chatInfo}
        memberCount={memberCount}
        administrators={administrators}
        isConnected={isConnected}
        isDarkMode={isDarkMode}
        onOpenConfig={onOpenConfig}
        onExportChat={onExportChat}
        isExporting={isExporting}
      />

      {/* Error Alert */}
      {error && (
        <Alert
          className={`m-4 ${
            isDarkMode
              ? "bg-red-900/20 border-red-700 text-red-300"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && !error ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.message_id}
              message={message}
              onReply={handleReply}
              isDarkMode={isDarkMode}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      <AnimatePresence>
        {replyToMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`mx-4 p-3 rounded-lg border-l-4 ${
              isDarkMode
                ? "bg-gray-800 border-blue-500 text-gray-300"
                : "bg-gray-100 border-blue-500 text-gray-700"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-blue-500 font-medium">
                  Replying to {replyToMessage.sender_name}
                </p>
                <p className="text-sm mt-1 truncate">
                  {replyToMessage.content || "Media message"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearReply}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        isDarkMode={isDarkMode}
        replyToMessage={replyToMessage}
      />
    </div>
  );
}
