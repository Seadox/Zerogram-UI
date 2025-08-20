import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  MessageCircle,
  Wifi,
  WifiOff,
  Download,
  Loader2,
  Bot,
  Hash,
  Clock,
  Users,
  Crown,
  User,
  Shield,
  Copy,
  Check,
  FileText,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ChatHeader({
  config,
  isConnected,
  messageCount,
  botInfo,
  chatInfo,
  memberCount,
  administrators,
  isDarkMode,
  onOpenConfig,
  onExportChat,
  isExporting,
}) {
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedChatId, setCopiedChatId] = useState(false);

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "token") {
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2000);
      } else if (type === "chatId") {
        setCopiedChatId(true);
        setTimeout(() => setCopiedChatId(false), 2000);
      }
    } catch (err) {
      // Copy failed, fallback not needed
    }
  };
  const formatBotToken = (token) => {
    if (!token) return "No token";
    // Show first 6 characters and last 4 characters with dots in between
    return `${token.substring(0, 6)}...${token.substring(token.length - 4)}`;
  };

  const formatPollingInterval = (interval) => {
    if (!interval) return "3s"; // default
    return `${interval / 1000}s`;
  };

  const getChatTypeDisplay = (chatInfo) => {
    if (!chatInfo) return "Private Chat";
    switch (chatInfo.type) {
      case "private":
        return "Private Chat";
      case "group":
        return "Group";
      case "supergroup":
        return "Supergroup";
      case "channel":
        return "Channel";
      default:
        return "Chat";
    }
  };

  const getOwnerAdmin = (administrators) => {
    return administrators.find((admin) => admin.status === "creator");
  };

  return (
    <div
      className={`${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
      } border-b px-3 sm:px-6 py-4`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1
                className={`text-lg sm:text-xl font-bold truncate ${
                  isDarkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {chatInfo?.title ||
                  (botInfo?.first_name
                    ? `Chat with ${botInfo.first_name}`
                    : "Telegram Chat")}
              </h1>
              {chatInfo && (
                <span
                  className={`text-xs sm:text-sm px-2 py-1 rounded-md flex-shrink-0 ${
                    isDarkMode
                      ? "text-gray-400 bg-gray-700"
                      : "text-gray-500 bg-gray-100"
                  }`}
                >
                  {getChatTypeDisplay(chatInfo)}
                </span>
              )}
            </div>

            {/* Bot Information */}
            {botInfo && (
              <div className="flex items-center gap-1 sm:gap-2 mb-2 text-xs sm:text-sm">
                <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                <span
                  className={`font-medium truncate ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Bot: {botInfo.first_name}
                  {botInfo.username && ` (@${botInfo.username})`}
                </span>

                {/* Connection Status */}
                <motion.div
                  animate={{
                    scale: isConnected ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 2,
                    repeat: isConnected ? Infinity : 0,
                    repeatType: "loop",
                  }}
                  className="flex-shrink-0"
                >
                  {isConnected ? (
                    <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  )}
                </motion.div>
                <span
                  className={`text-xs sm:text-sm font-medium flex-shrink-0 ${
                    isConnected
                      ? "text-green-600"
                      : isDarkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  {isConnected ? "Connected" : "Not connected"}
                </span>

                {botInfo.is_bot && (
                  <span
                    className={`px-2 py-0.5 rounded text-xs flex-shrink-0 ${
                      isDarkMode
                        ? "bg-blue-900 text-blue-300"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    Verified Bot
                  </span>
                )}
              </div>
            )}

            {/* Chat Details - All in one row with horizontal scroll on mobile */}
            {config && (
              <div className="flex items-center gap-1 sm:gap-2 text-xs overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer transition-colors ${
                    isDarkMode
                      ? "bg-blue-900/50 text-blue-300 hover:bg-blue-900/70"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                  onClick={() => copyToClipboard(config.bot_token, "token")}
                  title="Click to copy bot token"
                >
                  <Bot className="w-3 h-3" />
                  <span className="font-mono">
                    {formatBotToken(config.bot_token)}
                  </span>
                  {copiedToken ? (
                    <Check className="w-3 h-3 text-green-600" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-60" />
                  )}
                </div>

                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer transition-colors ${
                    isDarkMode
                      ? "bg-green-900/50 text-green-300 hover:bg-green-900/70"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                  onClick={() => copyToClipboard(config.chat_id, "chatId")}
                  title="Click to copy chat ID"
                >
                  <Hash className="w-3 h-3" />
                  <span className="font-mono">{config.chat_id}</span>
                  {copiedChatId ? (
                    <Check className="w-3 h-3 text-green-600" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-60" />
                  )}
                </div>

                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                    isDarkMode
                      ? "bg-purple-900/50 text-purple-300"
                      : "bg-purple-50 text-purple-700"
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>{formatPollingInterval(config.pollingInterval)}</span>
                </div>

                {messageCount > 0 && (
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                      isDarkMode
                        ? "bg-orange-900/50 text-orange-300"
                        : "bg-orange-50 text-orange-700"
                    }`}
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>{messageCount} messages</span>
                  </div>
                )}

                {memberCount && (
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                      isDarkMode
                        ? "bg-indigo-900/50 text-indigo-300"
                        : "bg-indigo-50 text-indigo-700"
                    }`}
                  >
                    <Users className="w-3 h-3" />
                    <span>{memberCount} members</span>
                  </div>
                )}

                {administrators.length > 0 && (
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                      isDarkMode
                        ? "bg-yellow-900/50 text-yellow-300"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    <span>{administrators.length} admins</span>
                  </div>
                )}

                {/* Show owner/creator info */}
                {administrators.length > 0 &&
                  (() => {
                    const owner = getOwnerAdmin(administrators);
                    if (owner) {
                      return (
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                            isDarkMode
                              ? "bg-red-900/50 text-red-300"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          <Crown className="w-3 h-3" />
                          <span>
                            Owner: {owner.user.first_name}
                            {owner.user.last_name && ` ${owner.user.last_name}`}
                            {owner.user.username && (
                              <>
                                {" ("}
                                <a
                                  href={`https://t.me/${owner.user.username}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`underline font-medium hover:opacity-80 ${
                                    isDarkMode
                                      ? "text-red-200"
                                      : "text-red-800 hover:text-red-900"
                                  }`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  @{owner.user.username}
                                </a>
                                {")"}
                              </>
                            )}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}

                {/* Chat description preview */}
                {chatInfo?.description && (
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-md max-w-md ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    <User className="w-3 h-3" />
                    <span className="truncate">{chatInfo.description}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Button
            size="sm"
            disabled={isExporting || messageCount === 0}
            onClick={() => onExportChat("csv")}
            className={`gap-1 sm:gap-2 px-2 sm:px-3 ${
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            {isExporting ? (
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
            ) : (
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
