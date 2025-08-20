import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Settings,
  Bot,
  MessageCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ConfigModal({
  isOpen,
  onClose,
  onSave,
  existingConfig,
  isDarkMode,
}) {
  const [botToken, setBotToken] = useState(existingConfig?.bot_token || "");
  const [chatId, setChatId] = useState(existingConfig?.chat_id || "");
  const [isLoading, setIsLoading] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Check if configuration exists (has both bot_token and chat_id)
  const hasExistingConfig =
    existingConfig?.bot_token && existingConfig?.chat_id;

  const getBotInfo = async (botToken) => {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/getMe`
      );
      const data = await response.json();
      if (data.ok && data.result) {
        return data.result.username || null;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  };

  const handleSave = async () => {
    if (!botToken.trim() || !chatId.trim() || !disclaimerAccepted) return;

    setIsLoading(true);

    // Get bot username
    const username = await getBotInfo(botToken.trim());

    const configData = {
      bot_token: botToken.trim(),
      chat_id: chatId.trim(),
      username: username,
      is_active: true,
    };

    await onSave(configData);
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`sm:max-w-md ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <DialogHeader>
          <DialogTitle
            className={`flex items-center gap-2 text-xl ${
              isDarkMode ? "text-gray-100" : "text-gray-900"
            }`}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            Telegram Configuration
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card
            className={`border-red-100 ${
              isDarkMode ? "bg-red-900/20 border-red-800" : "bg-red-50/50"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle
                  className={`w-5 h-5 mt-0.5 ${
                    isDarkMode ? "text-red-400" : "text-red-600"
                  }`}
                />
                <div
                  className={`text-sm ${
                    isDarkMode ? "text-red-300" : "text-red-700"
                  }`}
                >
                  <p className="font-medium mb-2">Disclaimer:</p>
                  <div className="space-y-2 text-xs leading-relaxed">
                    <p>
                      This tool is provided solely for educational and research
                      objectives. It aims to assist cybersecurity experts
                      analyze and comprehend Telegram bot interactions,
                      especially those that could involve security risks.
                    </p>
                    <p>
                      Any use of this tool for unlawful purposes or unauthorized
                      access is strictly prohibited. You bear full
                      responsibility for all activities conducted using this
                      tool. The authors and contributors disclaim any liability
                      for misuse, damages, or legal repercussions resulting from
                      its use.
                    </p>
                  </div>

                  <div className="flex items-start gap-2 mt-3 pt-2 border-t border-red-200 dark:border-red-800">
                    <input
                      type="checkbox"
                      id="disclaimerAccept"
                      checked={disclaimerAccepted}
                      onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-red-600 bg-transparent border-2 border-red-400 rounded focus:ring-red-500 focus:ring-2"
                    />
                    <label
                      htmlFor="disclaimerAccept"
                      className="text-xs font-medium cursor-pointer"
                    >
                      I acknowledge and accept the disclaimer above
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div>
              <Label
                htmlFor="botToken"
                className={`flex items-center gap-2 mb-2 ${
                  isDarkMode ? "text-gray-300" : ""
                }`}
              >
                <Bot className="w-4 h-4" />
                Bot Token
              </Label>
              <Input
                id="botToken"
                type="password"
                placeholder="1234567890:AAAA..."
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className={`font-mono ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200 placeholder:text-gray-400"
                    : ""
                }`}
              />
            </div>

            <div>
              <Label
                htmlFor="chatId"
                className={`flex items-center gap-2 mb-2 ${
                  isDarkMode ? "text-gray-300" : ""
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                Chat ID
              </Label>
              <Input
                id="chatId"
                placeholder="-1001234567890"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                className={`font-mono ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200 placeholder:text-gray-400"
                    : ""
                }`}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {hasExistingConfig && (
              <Button
                onClick={onClose}
                className="text-white hover:opacity-80 transition-opacity flex-1"
                style={{ backgroundColor: "#B84557" }}
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={
                !botToken.trim() ||
                !chatId.trim() ||
                !disclaimerAccepted ||
                isLoading
              }
              className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 ${
                hasExistingConfig ? "flex-1" : "w-full"
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Save Configuration
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
