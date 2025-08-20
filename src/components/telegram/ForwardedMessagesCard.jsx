import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, Forward, User } from "lucide-react";
import { format } from "date-fns";

export default function ForwardedMessagesCard({
  isDarkMode,
  forwardedMessages,
  displayedMessagesCount,
  setDisplayedMessagesCount,
}) {
  if (forwardedMessages.length === 0) return null;

  const filteredMessages = forwardedMessages.filter(
    (msg) => msg.status === "success"
  );
  const displayedMessages = filteredMessages.slice(0, displayedMessagesCount);
  const hasMoreMessages = filteredMessages.length > displayedMessagesCount;

  return (
    <Card
      className={`${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3
            className={`text-lg font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Forwarded Messages Log
          </h3>
          <span
            className={`text-sm px-3 py-1 rounded-full ${
              isDarkMode
                ? "bg-green-900/20 text-green-400"
                : "bg-green-100 text-green-700"
            }`}
          >
            {filteredMessages.length} forwarded
          </span>
        </div>

        <div className="space-y-2 max-h-132 overflow-y-auto">
          {displayedMessages.map((msg, index) => (
            <div
              key={`${msg.messageId}-${msg.timestamp}-${index}`}
              className={`p-3 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-700/50 border-gray-600"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  {msg.status === "success" && (
                    <div className="space-y-2">
                      {/* User Info */}
                      <div className="flex items-center space-x-2">
                        <User className="w-3 h-3 text-blue-500" />
                        <span
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {msg.userDetails
                            ? `${msg.userDetails.firstName || ""} ${
                                msg.userDetails.lastName || ""
                              }`.trim() ||
                              msg.userDetails.username ||
                              "Unknown"
                            : "Unknown"}
                          {msg.userDetails?.username && (
                            <a
                              href={`https://t.me/${msg.userDetails.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`ml-2 text-xs hover:underline cursor-pointer ${
                                isDarkMode
                                  ? "text-blue-400 hover:text-blue-300"
                                  : "text-blue-600 hover:text-blue-700"
                              }`}
                            >
                              @{msg.userDetails.username}
                            </a>
                          )}
                          {msg.userDetails?.isBot && (
                            <span
                              className={`ml-1 text-xs px-1 py-0.5 rounded ${
                                isDarkMode
                                  ? "bg-blue-900/20 text-blue-400"
                                  : "bg-blue-100 text-blue-600"
                              }`}
                            >
                              BOT
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Message ID Info */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            Original ID: {msg.originalId}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            Forwarded ID: {msg.forwardedId}
                          </span>
                        </div>
                      </div>

                      {/* Chat Info */}
                      {msg.chatTitle && (
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-3 h-3 text-purple-500" />
                          <span
                            className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            From: {msg.chatTitle}
                          </span>
                        </div>
                      )}

                      {/* Message Type */}
                      {msg.messageType && msg.messageType !== "text" && (
                        <div className="flex items-center space-x-2">
                          <Forward className="w-3 h-3 text-green-500" />
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              isDarkMode
                                ? "bg-gray-700 text-gray-300"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {msg.messageType.toUpperCase()}
                            {msg.hasMedia && " (Media)"}
                          </span>
                        </div>
                      )}

                      {msg.messageDate && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3 h-3 text-orange-500" />
                          <span
                            className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {format(
                              new Date(msg.messageDate),
                              "dd/MM/yy HH:mm"
                            )}
                          </span>
                        </div>
                      )}

                      {msg.text && (
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="w-3 h-3 text-purple-500 mt-0.5" />
                          <span
                            className={`text-xs leading-relaxed ${
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {msg.text.length > 100
                              ? `${msg.text.substring(0, 100)}...`
                              : msg.text}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <span
                  className={`text-xs ${
                    isDarkMode ? "text-gray-500" : "text-gray-500"
                  } ml-4`}
                >
                  {format(new Date(msg.timestamp), "HH:mm:ss")}
                </span>
              </div>
            </div>
          ))}

          {/* Show More Button */}
          {hasMoreMessages && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => setDisplayedMessagesCount((prev) => prev + 50)}
                className={`w-full ${
                  isDarkMode
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
              >
                Show More ({filteredMessages.length - displayedMessagesCount}{" "}
                remaining)
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
