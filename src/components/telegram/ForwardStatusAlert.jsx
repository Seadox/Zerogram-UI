import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForwardStatusAlert({
  forwardStatus,
  isRateLimited,
  countdownSeconds,
  isDarkMode,
  formatCountdown,
}) {
  if (!forwardStatus) return null;

  return (
    <Alert
      className={`${
        isRateLimited
          ? isDarkMode
            ? "bg-yellow-900/20 border-yellow-700 text-yellow-300"
            : "bg-yellow-50 border-yellow-200 text-yellow-800"
          : isDarkMode
          ? "bg-green-900/20 border-green-700 text-green-300"
          : "bg-green-50 border-green-200 text-green-800"
      }`}
    >
      <AlertDescription className="flex items-center justify-between">
        <span className="text-lg font-medium">{forwardStatus}</span>
        {isRateLimited && countdownSeconds > 0 && (
          <div className="flex items-center space-x-2">
            <div
              className={`text-2xl font-mono font-bold ${
                isDarkMode ? "text-yellow-200" : "text-yellow-900"
              }`}
            >
              {formatCountdown(countdownSeconds)}
            </div>
            <div
              className={`w-12 h-12 rounded-full border-4 ${
                isDarkMode
                  ? "border-yellow-600 border-t-yellow-300"
                  : "border-yellow-300 border-t-yellow-600"
              } animate-spin`}
            ></div>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
