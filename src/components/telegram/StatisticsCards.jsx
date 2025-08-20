import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, Download, Forward } from "lucide-react";
import { format } from "date-fns";

export default function StatisticsCards({
  isDarkMode,
  getForwardedStats,
  getForwardedUniqueSenders,
  showSendersList,
  setShowSendersList,
  forwardedMessages,
  handleExportForwardedMessages,
  handleForwardMessages,
  targetChatId,
  sourceChatId,
  setupCompleted,
  isForwarding,
  isPaused,
  handleResetSetup,
}) {
  const forwardedStats = getForwardedStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card
        className={`p-4 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Forwarded
            </p>
            <p
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {forwardedStats.total.toLocaleString()}
            </p>
          </div>
          <Forward
            className={`w-8 h-8 ${
              isDarkMode ? "text-blue-400" : "text-blue-500"
            }`}
          />
        </div>
      </Card>

      <Card
        className={`p-4 cursor-pointer hover:shadow-lg transition-shadow ${
          isDarkMode
            ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
            : "bg-white border-gray-200 hover:bg-gray-50"
        }`}
        onClick={() => setShowSendersList(!showSendersList)}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Forwarded Senders
            </p>
            <p
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {getForwardedUniqueSenders().length}
            </p>
          </div>
          <User
            className={`w-8 h-8 ${
              isDarkMode ? "text-green-400" : "text-green-500"
            }`}
          />
        </div>
      </Card>

      <Card
        className={`p-4 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Forwarded Range
            </p>
            <p
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {forwardedStats.dateRange.start && forwardedStats.dateRange.end
                ? `${format(
                    forwardedStats.dateRange.start,
                    "dd/MM/yy"
                  )} - ${format(forwardedStats.dateRange.end, "dd/MM/yy")}`
                : "No messages"}
            </p>
          </div>
          <Calendar
            className={`w-8 h-8 ${
              isDarkMode ? "text-purple-400" : "text-purple-500"
            }`}
          />
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="col-span-full">
        <div className="flex flex-wrap gap-3 justify-center">
          {setupCompleted && (
            <Button
              onClick={handleResetSetup}
              className="text-white hover:opacity-80 transition-opacity"
              style={{ backgroundColor: "#B84557" }}
            >
              Reset Setup
            </Button>
          )}
          {forwardedMessages.length > 0 && (
            <Button
              onClick={handleExportForwardedMessages}
              className={`${
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Forwarded ({forwardedMessages.length})
            </Button>
          )}

          <Button
            onClick={handleForwardMessages}
            disabled={
              !targetChatId.trim() || !sourceChatId.trim() || !setupCompleted
            }
            className={`${
              isDarkMode
                ? "bg-green-600 hover:bg-green-700"
                : "bg-green-500 hover:bg-green-600"
            } text-white`}
          >
            <Forward className="w-4 h-4 mr-2" />
            {isForwarding && !isPaused
              ? "Pause Forwarding"
              : isPaused
              ? "Resume Forwarding"
              : "Start Forwarding"}
          </Button>
        </div>
      </div>
    </div>
  );
}
