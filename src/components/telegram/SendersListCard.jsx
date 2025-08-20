import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, X } from "lucide-react";

export default function SendersListCard({
  showSendersList,
  setShowSendersList,
  isDarkMode,
  getForwardedUniqueSenders,
}) {
  if (!showSendersList) return null;

  return (
    <div className="relative">
      <Card
        className={`absolute top-2 left-0 right-0 z-10 p-4 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } shadow-lg`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3
            className={`text-lg font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Forwarded Message Senders
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSendersList(false)}
            className={
              isDarkMode
                ? "text-gray-400 hover:text-white hover:bg-gray-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {getForwardedUniqueSenders().map((sender, index) => (
            <div
              key={sender.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                isDarkMode ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isDarkMode ? "bg-blue-600" : "bg-blue-500"
                  }`}
                >
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p
                    className={`font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {sender.name}
                  </p>
                  {sender.username && (
                    <a
                      href={`https://t.me/${sender.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm hover:underline transition-colors ${
                        isDarkMode
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-blue-600 hover:text-blue-500"
                      }`}
                    >
                      @{sender.username}
                    </a>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-blue-400" : "text-blue-500"
                  }`}
                >
                  {sender.messageCount} messages
                </p>
              </div>
            </div>
          ))}
          {getForwardedUniqueSenders().length === 0 && (
            <div className="text-center py-8">
              <User
                className={`w-12 h-12 mx-auto mb-4 ${
                  isDarkMode ? "text-gray-600" : "text-gray-400"
                }`}
              />
              <p
                className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                No forwarded message senders yet
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
