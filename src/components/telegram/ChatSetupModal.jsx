import React from "react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, History } from "lucide-react";

export default function ChatSetupModal({
  showChatSetup,
  isDarkMode,
  configLoadedFromStorage,
  error,
  sourceChatId,
  targetChatId,
  startMessageId,
  deleteOriginalMessages,
  config,
  handleNumericInput,
  handlePositiveNumericInput,
  handleDeleteOriginalMessagesChange,
  handleSetupComplete,
  handleCancel,
  setSourceChatId,
  setTargetChatId,
  setStartMessageId,
}) {
  if (!showChatSetup) return null;
  console.log(config);

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } rounded-2xl p-6 w-full max-w-md border shadow-2xl`}
      >
        <div className="text-center mb-6">
          <div
            className={`w-16 h-16 rounded-full ${
              isDarkMode ? "bg-blue-600" : "bg-blue-500"
            } flex items-center justify-center mx-auto mb-4`}
          >
            <History className="w-8 h-8 text-white" />
          </div>
          <h2
            className={`text-xl font-bold mb-2 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Bot History Setup
          </h2>
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {configLoadedFromStorage
              ? "Configuration loaded from previous session"
              : "Enter the chat IDs to start forwarding messages"}
          </p>
          {configLoadedFromStorage && (
            <p
              className={`text-xs mt-1 ${
                isDarkMode ? "text-blue-400" : "text-blue-500"
              }`}
            >
              ✓ Your settings have been restored
            </p>
          )}
        </div>

        {/* Instructions */}
        <div
          className={`mb-4 p-4 rounded-lg border ${
            isDarkMode
              ? "bg-blue-900/20 border-blue-800"
              : "bg-blue-50/50 border-blue-100"
          }`}
        >
          <h3
            className={`text-sm font-semibold mb-2 ${
              isDarkMode ? "text-blue-300" : "text-blue-700"
            }`}
          >
            How to get Chat IDs:
          </h3>
          <div
            className={`text-xs space-y-1 ${
              isDarkMode ? "text-blue-300/80" : "text-blue-600"
            }`}
          >
            <p>
              1. Get your chat ID from:{" "}
              <a
                href="https://telegram.me/rawdatabot"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                https://telegram.me/rawdatabot
              </a>
            </p>
            {config?.bot_token && config?.username && (
              <p>
                2. Start chat with{" "}
                <a
                  href={`https://t.me/${config.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  @{config.username}
                </a>
              </p>
            )}
            {config?.bot_token && !config?.username && (
              <p>2. Configure your bot in settings to get the bot link</p>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert className="mb-4 border-red-500 bg-red-50 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Source Chat ID (where to get messages from):
            </label>
            <input
              type="text"
              placeholder="e.g., -1001234567890"
              value={sourceChatId}
              onChange={(e) =>
                handleNumericInput(e.target.value, setSourceChatId)
              }
              className={`w-full px-4 py-3 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Target Chat ID (where to forward messages to):
            </label>
            <input
              type="text"
              placeholder="e.g., -1001234567890"
              value={targetChatId}
              onChange={(e) =>
                handleNumericInput(e.target.value, setTargetChatId)
              }
              className={`w-full px-4 py-3 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Start Message ID (0 for all messages):
            </label>
            <input
              type="number"
              placeholder="0"
              value={startMessageId}
              onChange={(e) =>
                handlePositiveNumericInput(e.target.value, setStartMessageId)
              }
              className={`w-full px-4 py-3 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          {/* Delete Original Messages Checkbox */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="deleteOriginalMessages"
              checked={deleteOriginalMessages}
              onChange={(e) =>
                handleDeleteOriginalMessagesChange(e.target.checked)
              }
              className={`w-4 h-4 rounded border-2 ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  : "border-gray-300 bg-white text-blue-600 focus:ring-blue-500"
              } focus:ring-2`}
            />
            <label
              htmlFor="deleteOriginalMessages"
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Delete original messages after forwarding
            </label>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button
            onClick={handleCancel}
            className="text-white hover:opacity-80 transition-opacity flex-1"
            style={{ backgroundColor: "#B84557" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSetupComplete}
            disabled={!targetChatId.trim() || !sourceChatId.trim()}
            className={`flex-1 ${
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            Complete Setup
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
