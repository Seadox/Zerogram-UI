import React, { useState, useEffect } from "react";
import { TelegramMessage } from "@/entities/all";
import { ExportService } from "@/services/ExportService";
import { useConfigProvider } from "@/hooks/useConfigProvider";

import ConfigModal from "../components/telegram/ConfigModal";
import TabNavigation from "../components/telegram/TabNavigation";
import LoadingScreen from "../components/telegram/LoadingScreen";
import ChatTab from "./ChatTab";
import HistoryTab from "./HistoryTab";

export default function TelegramChat() {
  const { config, isLoading, handleSaveConfig } = useConfigProvider();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [isDarkMode] = useState(true); // Force dark mode only

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleExportChat = async (format = "csv", customMessages = null) => {
    if (!config) {
      return;
    }
    setIsExporting(true);

    try {
      // Use custom messages if provided (from history tab), otherwise fetch all
      const allMessages =
        customMessages || (await TelegramMessage.list("-timestamp", 10000));
      if (allMessages.length === 0) {
        setIsExporting(false);
        return;
      }

      if (format === "pdf") {
        await ExportService.exportToPDF(allMessages, config);
      } else if (format === "html") {
        await ExportService.exportToHTML(allMessages, config);
      } else {
        await ExportService.exportToCSV(allMessages, config);
      }
    } catch (err) {
      // Error exporting chat
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen isDarkMode={isDarkMode} />;
  }

  if (!config) {
    // Auto-open config modal if no config exists
    if (!showConfigModal) {
      setShowConfigModal(true);
    }
  }

  return (
    <div
      className={`h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-blue-50 to-indigo-100"
      } flex flex-col overflow-hidden`}
    >
      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setShowConfigModal(true)}
        isDarkMode={isDarkMode}
      />

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "chat" ? (
          <ChatTab
            config={config}
            onOpenConfig={() => setShowConfigModal(true)}
            isDarkMode={isDarkMode}
            onExportChat={handleExportChat}
            isExporting={isExporting}
          />
        ) : (
          <HistoryTab
            config={config}
            isDarkMode={isDarkMode}
            onExportChat={handleExportChat}
            isExporting={isExporting}
            onSwitchToChat={() => setActiveTab("chat")}
          />
        )}
      </div>

      <ConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSave={handleSaveConfig}
        existingConfig={config}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
