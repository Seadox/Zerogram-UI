import React, { useState, useEffect, useRef } from "react";
import {
  getChat,
  forwardMessage,
  sendSimpleMessage,
  deleteMessage,
} from "@/integrations/Core";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

import ChatSetupModal from "../components/telegram/ChatSetupModal";
import ForwardStatusAlert from "../components/telegram/ForwardStatusAlert";
import StatisticsCards from "../components/telegram/StatisticsCards";
import SendersListCard from "../components/telegram/SendersListCard";
import HistoryErrorAlert from "../components/telegram/HistoryErrorAlert";
import ForwardedMessagesCard from "../components/telegram/ForwardedMessagesCard";

export default function HistoryTab({
  config,
  isDarkMode = true,
  onSwitchToChat,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [targetChatId, setTargetChatId] = useState("");
  const [isForwarding, setIsForwarding] = useState(false);
  const [forwardStatus, setForwardStatus] = useState(null);
  const [showChatSetup, setShowChatSetup] = useState(true);
  const [sourceChatId, setSourceChatId] = useState("");
  const [startMessageId, setStartMessageId] = useState("0");
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [currentMessageId, setCurrentMessageId] = useState(null);
  const [configLoadedFromStorage, setConfigLoadedFromStorage] = useState(false);
  const [deleteOriginalMessages, setDeleteOriginalMessages] = useState(true);
  const [showSendersList, setShowSendersList] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [forwardedMessages, setForwardedMessages] = useState([]);
  const [targetMessageId, setTargetMessageId] = useState(null);
  const [currentForwardingIndex, setCurrentForwardingIndex] = useState(0);
  const [displayedMessagesCount, setDisplayedMessagesCount] = useState(50);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const [countdownSeconds, setCountdownSeconds] = useState(0);

  // Use ref to track pause state for immediate access in async loops
  const isPausedRef = useRef(false);

  // Helper function to validate numeric input (allows negative numbers for chat IDs)
  const handleNumericInput = (value, setter) => {
    // Allow empty string, numbers, and negative sign
    if (value === "" || /^-?\d*$/.test(value)) {
      setter(value);
      // Auto-save configuration when input changes
      updateStoredConfiguration(
        setter === setSourceChatId ? "sourceChatId" : "targetChatId",
        value
      );
    }
  };

  // Helper function to validate positive numeric input (for message IDs)
  const handlePositiveNumericInput = (value, setter) => {
    // Allow empty string and positive numbers only
    if (value === "" || /^\d*$/.test(value)) {
      setter(value);
      // Auto-save configuration when input changes
      updateStoredConfiguration("startMessageId", value);
    }
  };

  // Update specific field in stored configuration
  const updateStoredConfiguration = (field, value) => {
    const savedConfig = loadConfigurationFromStorage() || {};
    savedConfig[field] = value;
    saveConfigurationToStorage(savedConfig);
  };

  // Handle checkbox change and auto-save
  const handleDeleteOriginalMessagesChange = (checked) => {
    setDeleteOriginalMessages(checked);
    updateStoredConfiguration("deleteOriginalMessages", checked);
  };

  // LocalStorage functions for configuration persistence
  const saveConfigurationToStorage = (config) => {
    try {
      localStorage.setItem("historyTabConfig", JSON.stringify(config));
    } catch (error) {
      // Failed to save history tab configuration
    }
  };

  const loadConfigurationFromStorage = () => {
    try {
      const stored = localStorage.getItem("historyTabConfig");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      // Failed to load history tab configuration
      return null;
    }
  };

  const clearConfigurationFromStorage = () => {
    try {
      localStorage.removeItem("historyTabConfig");
    } catch (error) {
      // Failed to clear history tab configuration
    }
  };

  // LocalStorage functions for forwarded messages persistence
  const saveForwardedMessagesToStorage = (messages) => {
    try {
      localStorage.setItem(
        "historyTabForwardedMessages",
        JSON.stringify(messages)
      );
    } catch (error) {
      // Failed to save forwarded messages
    }
  };

  const loadForwardedMessagesFromStorage = () => {
    try {
      const stored = localStorage.getItem("historyTabForwardedMessages");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      // Failed to load forwarded messages
      return [];
    }
  };

  const clearForwardedMessagesFromStorage = () => {
    try {
      localStorage.removeItem("historyTabForwardedMessages");
    } catch (error) {
      // Failed to clear forwarded messages
    }
  };

  // Load saved configuration on component mount
  useEffect(() => {
    // Check if this is a fresh page load (session storage helps distinguish between page reload and tab switch)
    const isPageReload = !sessionStorage.getItem("historyTabSession");

    if (isPageReload) {
      // Clear storage on page reload (fresh page load)
      clearConfigurationFromStorage();
      clearForwardedMessagesFromStorage();
      localStorage.removeItem("lastBotToken"); // Clear bot token tracking
      sessionStorage.setItem("historyTabSession", "active");

      // Reset all states to default for fresh page load
      setSourceChatId("");
      setTargetChatId("");
      setStartMessageId("0");
      setSetupCompleted(false);
      setShowChatSetup(true);
      setConfigLoadedFromStorage(false);
      setForwardedMessages([]);
    } else {
      // This is a tab switch, load saved configuration if it exists
      const savedConfig = loadConfigurationFromStorage();
      if (savedConfig) {
        setSourceChatId(savedConfig.sourceChatId || "");
        setTargetChatId(savedConfig.targetChatId || "");
        setStartMessageId(savedConfig.startMessageId || "0");
        setDeleteOriginalMessages(savedConfig.deleteOriginalMessages ?? true);
        setSetupCompleted(savedConfig.setupCompleted || false);
        setShowChatSetup(!savedConfig.setupCompleted);
        setConfigLoadedFromStorage(true);
      }

      // Load saved forwarded messages
      const savedForwardedMessages = loadForwardedMessagesFromStorage();
      setForwardedMessages(savedForwardedMessages);
    }
  }, []);

  // Auto-save forwarded messages when they change
  useEffect(() => {
    // Only save if we have forwarded messages and setup is completed
    if (forwardedMessages.length > 0 && setupCompleted) {
      saveForwardedMessagesToStorage(forwardedMessages);
    }
  }, [forwardedMessages, setupCompleted]);

  useEffect(() => {
    // Set loading to false initially if we need to show setup
    if (showChatSetup) {
      setIsLoading(false);
    }
  }, [showChatSetup]);

  // Clear bot history when bot token changes
  useEffect(() => {
    // Keep track of the previous bot token using a ref-like approach
    const currentBotToken = config?.bot_token;
    const storedBotToken = localStorage.getItem("lastBotToken");

    if (currentBotToken) {
      // If we have a current bot token and it's different from the stored one
      if (storedBotToken && storedBotToken !== currentBotToken) {
        // Bot token has changed, clear all history data

        // Clear all forwarded messages
        setForwardedMessages([]);
        clearForwardedMessagesFromStorage();

        // Clear all loaded messages

        // Reset forwarding states
        setIsForwarding(false);
        setIsPaused(false);
        isPausedRef.current = false; // Reset ref on setup reset
        setTargetMessageId(null);
        setCurrentForwardingIndex(0);
        setForwardStatus(null);
        setCurrentMessageId(null);

        // Reset setup to force re-configuration
        setSetupCompleted(false);
        setShowChatSetup(true);
        clearConfigurationFromStorage();
      }

      // Store the current bot token for future comparison
      localStorage.setItem("lastBotToken", currentBotToken);
    }
  }, [config?.bot_token]);

  // Cleanup effect: Pause forwarding when component unmounts (switching to chat tab)
  useEffect(() => {
    return () => {
      // Component is unmounting (user switching to chat tab)
      if (isForwarding && !isPaused) {
        // Pause the forwarding immediately
        isPausedRef.current = true;
        setIsPaused(true);
        setForwardStatus(
          "Forwarding paused (switched to chat tab). Return to History tab and click Resume to continue..."
        );
      }
    };
  }, [isForwarding, isPaused]);

  // Countdown effect for rate limiting
  useEffect(() => {
    let interval;
    if (isRateLimited && countdownSeconds > 0 && !isPaused) {
      interval = setInterval(() => {
        setCountdownSeconds((prev) => {
          const newCount = prev - 1;
          if (newCount <= 0) {
            setIsRateLimited(false);
            setRetryAfter(0);
            setForwardStatus(null);
            return 0;
          } else {
            // Update the forward status with live countdown
            setForwardStatus(`Rate limited! Waiting before continuing...`);
            return newCount;
          }
        });
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRateLimited, countdownSeconds, isPaused]);

  // Helper function to format countdown time
  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Helper functions for forwarded messages statistics
  const getForwardedStats = () => {
    const successfulMessages = forwardedMessages.filter(
      (msg) => msg.status === "success"
    );
    const totalForwarded = forwardedMessages.length;

    // Get date range from original message dates (not forwarding timestamps)
    let startDate = null;
    let endDate = null;

    forwardedMessages
      .filter((msg) => msg.messageDate && msg.status === "success")
      .forEach((msg) => {
        const msgDate = new Date(msg.messageDate);
        if (!startDate || msgDate < startDate) startDate = msgDate;
        if (!endDate || msgDate > endDate) endDate = msgDate;
      });

    return {
      total: totalForwarded,
      successful: successfulMessages.length,
      failed: totalForwarded - successfulMessages.length,
      dateRange: { start: startDate, end: endDate },
    };
  };

  const getForwardedUniqueSenders = () => {
    const sendersMap = new Map();

    forwardedMessages
      .filter((msg) => msg.status === "success" && msg.userDetails)
      .forEach((msg) => {
        const userDetails = msg.userDetails;
        const senderId =
          userDetails.userId || userDetails.username || "unknown";
        const senderName =
          `${userDetails.firstName || ""} ${
            userDetails.lastName || ""
          }`.trim() ||
          userDetails.username ||
          "Unknown";

        if (!sendersMap.has(senderId)) {
          sendersMap.set(senderId, {
            id: senderId,
            name: senderName,
            username: userDetails.username || null,
            messageCount: 0,
          });
        }
        sendersMap.get(senderId).messageCount++;
      });

    return Array.from(sendersMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  };

  const handleExportForwardedMessages = () => {
    if (forwardedMessages.length === 0) {
      return;
    }

    // Since we only store successful messages, export all of them
    const messagesToExport = forwardedMessages;

    if (messagesToExport.length === 0) {
      return;
    }

    // Convert forwarded messages to CSV format
    const csvData = messagesToExport.map((msg) => ({
      originalId: msg.originalId,
      status: msg.status,
      timestamp: msg.timestamp,
      messageDate: msg.messageDate || "",
      firstName: (msg.userDetails?.firstName || "").replace(/"/g, '""'),
      lastName: (msg.userDetails?.lastName || "").replace(/"/g, '""'),
      username: msg.userDetails?.username || "",
      userId: msg.userDetails?.userId || "",
      isBot: msg.userDetails?.isBot || false,
      messageType: msg.messageType || "",
      hasMedia: msg.hasMedia || false,
      text: msg.text
        ? msg.text.replace(/[\r\n]+/g, " ").replace(/"/g, '""')
        : "", // Replace newlines and escape quotes for CSV
      error: (msg.error || "").replace(/"/g, '""'),
    }));

    // Create CSV content with bot details metadata
    const metadata = [
      `"Bot Token: ${config?.bot_token || "Not configured"}"`,
      `"Source Chat ID: ${sourceChatId || "Not configured"}"`,
      `"Target Chat ID: ${targetChatId || "Not configured"}"`,
      `"Bot Link: https://t.me/${
        config?.bot_token?.split(":")[0] || "unknown"
      }"`,
      `"Export Date: ${format(new Date(), "dd-MM-yyyy HH:mm:ss")}"`,
      `"Total Forwarded Messages: ${messagesToExport.length}"`,
      `"Start Message ID: ${startMessageId || "0"}"`,
      `"Export Type: Successful Messages Only"`,
      "", // Empty line separator
    ];

    const headers = [
      "Original ID",
      "Status",
      "Forwarded Timestamp",
      "Message Date",
      "First Name",
      "Last Name",
      "Username",
      "User ID",
      "Is Bot",
      "Message Type",
      "Has Media",
      "Text",
      "Error",
    ];

    const csvContent = [
      ...metadata,
      headers.join(","),
      ...csvData.map((row) =>
        [
          row.originalId,
          row.status,
          `"${row.timestamp}"`,
          `"${row.messageDate}"`,
          `"${row.firstName}"`,
          `"${row.lastName}"`,
          `"${row.username}"`,
          row.userId,
          row.isBot,
          `"${row.messageType}"`,
          row.hasMedia,
          `"${row.text}"`,
          `"${row.error}"`,
        ].join(",")
      ),
    ].join("\n");

    // Download CSV file with BOM for proper UTF-8 encoding
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `forwarded_messages_${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleForwardMessages = async () => {
    if (!config?.bot_token || !targetChatId || !sourceChatId) {
      setError(
        "Bot token, source chat ID, and target chat ID are required for forwarding"
      );
      return;
    }

    if (isForwarding && !isPaused) {
      // Pause forwarding
      setIsPaused(true);
      isPausedRef.current = true; // Set ref immediately for async loops

      // If we're in a rate limit countdown, stop it and reset rate limit states
      if (isRateLimited) {
        setIsRateLimited(false);
        setCountdownSeconds(0);
        setRetryAfter(0);
      }

      setForwardStatus("Forwarding paused");
      return;
    }

    if (isPaused) {
      // Resume forwarding
      setIsPaused(false);
      isPausedRef.current = false; // Reset ref immediately
      resumeForwarding();
      return;
    }

    // Start new forwarding session
    setIsForwarding(true);
    setIsPaused(false);
    isPausedRef.current = false; // Reset ref for new session
    setForwardStatus(null);
    setError(null);
    setForwardedMessages([]);
    setCurrentForwardingIndex(0);

    try {
      // Step 1: Send initial message to target chat to get the target message ID
      setForwardStatus("Sending initial message to target chat...");
      const initialMessage = await sendSimpleMessage(
        config.bot_token,
        targetChatId,
        "Starting message forwarding session..."
      );

      if (!initialMessage.ok || !initialMessage.result) {
        throw new Error("Failed to send initial message to target chat");
      }

      const targetMsgId = initialMessage.result.message_id;
      setTargetMessageId(targetMsgId);

      // Step 2: Start forwarding messages from start message ID to target message ID
      // Note: We forward until the target message ID we just created
      const startMsgId = parseInt(startMessageId) || 1;
      await forwardMessagesInRange(startMsgId, targetMsgId - 1);
    } catch (error) {
      setError(
        "Failed to start forwarding. Check your bot token and chat IDs."
      );
      setForwardStatus(null);
      setIsForwarding(false);
      setIsPaused(false);
      isPausedRef.current = false; // Reset ref on error
    }
  };

  const forwardMessagesInRange = async (startMsgId, endMsgId) => {
    let successCount = 0;
    let errorCount = 0;
    const totalRange = endMsgId - startMsgId + 1;

    for (let msgId = startMsgId; msgId <= endMsgId; msgId++) {
      // Check if paused at the start of each iteration using ref for immediate access
      if (isPausedRef.current) {
        setCurrentMessageId(msgId); // Set to current message to resume from
        setCurrentForwardingIndex(msgId - startMsgId);
        setForwardStatus(
          `Forwarding paused at message ${msgId}. Click Resume to continue...`
        );
        // Don't reset isForwarding when paused - keep it true so resume can work
        return; // Exit the function immediately when paused
      }

      try {
        setCurrentMessageId(msgId);
        setCurrentForwardingIndex(msgId - startMsgId);
        setForwardStatus(
          `Forwarding message ${msgId} (${
            msgId - startMsgId + 1
          }/${totalRange})...`
        );

        const result = await forwardMessage(
          config.bot_token,
          sourceChatId,
          targetChatId,
          msgId
        );

        if (result.ok) {
          successCount++;
          // Extract message data from the forwarded message result
          const forwardedMessage = result.result;

          // Get user details from forward_origin or fallback to other sources
          let userDetails = {};
          let messageData = {};

          // Extract user details from forward_origin (preferred modern approach)
          if (forwardedMessage.forward_origin) {
            const origin = forwardedMessage.forward_origin;
            if (origin.type === "user" && origin.sender_user) {
              userDetails = {
                username: origin.sender_user.username || null,
                firstName: origin.sender_user.first_name || null,
                lastName: origin.sender_user.last_name || null,
                userId: origin.sender_user.id || null,
                isBot: origin.sender_user.is_bot || false,
                forwardDate: origin.date || null,
                originType: "user",
              };
            } else if (origin.type === "hidden_user") {
              userDetails = {
                username: null,
                firstName: origin.sender_user_name || null,
                lastName: null,
                userId: null,
                isBot: false,
                forwardDate: origin.date || null,
                originType: "hidden_user",
              };
            } else if (origin.type === "chat" && origin.sender_chat) {
              userDetails = {
                username: origin.sender_chat.username || null,
                firstName: origin.sender_chat.title || null,
                lastName: null,
                userId: origin.sender_chat.id || null,
                chatType: origin.sender_chat.type || null,
                isBot: false,
                forwardDate: origin.date || null,
                originType: "chat",
              };
            } else if (origin.type === "channel" && origin.chat) {
              userDetails = {
                username: origin.chat.username || null,
                firstName: origin.chat.title || null,
                lastName: null,
                userId: origin.chat.id || null,
                chatType: origin.chat.type || null,
                isBot: false,
                forwardDate: origin.date || null,
                originType: "channel",
              };
            }
          }
          // Fallback to legacy forward_from if forward_origin not available
          else if (forwardedMessage.forward_from) {
            userDetails = {
              username: forwardedMessage.forward_from.username || null,
              firstName: forwardedMessage.forward_from.first_name || null,
              lastName: forwardedMessage.forward_from.last_name || null,
              userId: forwardedMessage.forward_from.id || null,
              isBot: forwardedMessage.forward_from.is_bot || false,
              originType: "legacy_user",
            };
          }
          // Check if message was forwarded from a channel/group (legacy forward_from_chat)
          else if (forwardedMessage.forward_from_chat) {
            userDetails = {
              username: forwardedMessage.forward_from_chat.username || null,
              firstName: forwardedMessage.forward_from_chat.title || null,
              lastName: null,
              userId: forwardedMessage.forward_from_chat.id || null,
              chatType: forwardedMessage.forward_from_chat.type || null,
              isBot: false,
              originType: "legacy_chat",
            };
          }
          // Fallback to chat object (target chat info)
          else if (forwardedMessage.chat) {
            userDetails = {
              username: forwardedMessage.chat.username || null,
              firstName: forwardedMessage.chat.first_name || null,
              lastName: forwardedMessage.chat.last_name || null,
              userId: forwardedMessage.chat.id || null,
              isBot: false, // Chat object typically represents the target chat
              chatType: forwardedMessage.chat.type || null,
              originType: "target_chat",
            };
          }
          // Final fallback to the user who sent the message to the bot
          else {
            userDetails = {
              username: forwardedMessage.from?.username || null,
              firstName: forwardedMessage.from?.first_name || null,
              lastName: forwardedMessage.from?.last_name || null,
              userId: forwardedMessage.from?.id || null,
              isBot: forwardedMessage.from?.is_bot || false,
              originType: "message_sender",
            };
          }

          // Extract message content and metadata
          messageData = {
            text:
              forwardedMessage.text ||
              forwardedMessage.caption ||
              "Media message",
            messageDate: forwardedMessage.forward_date
              ? new Date(forwardedMessage.forward_date * 1000).toISOString()
              : forwardedMessage.date
              ? new Date(forwardedMessage.date * 1000).toISOString()
              : null,
            messageType: forwardedMessage.photo
              ? "photo"
              : forwardedMessage.video
              ? "video"
              : forwardedMessage.document
              ? "document"
              : forwardedMessage.audio
              ? "audio"
              : forwardedMessage.voice
              ? "voice"
              : forwardedMessage.sticker
              ? "sticker"
              : forwardedMessage.animation
              ? "animation"
              : "text",
            hasMedia: !!(
              forwardedMessage.photo ||
              forwardedMessage.video ||
              forwardedMessage.document ||
              forwardedMessage.audio ||
              forwardedMessage.voice ||
              forwardedMessage.sticker ||
              forwardedMessage.animation
            ),
            chatTitle: forwardedMessage.chat?.title || null,
            chatType: forwardedMessage.chat?.type || null,
          };

          // Add to forwarded messages list for display with comprehensive user details (newest first - stack behavior)
          setForwardedMessages((prev) => [
            {
              originalId: msgId,
              forwardedId: forwardedMessage.message_id,
              timestamp: new Date().toISOString(),
              messageDate: messageData.messageDate,
              text: messageData.text,
              messageType: messageData.messageType,
              hasMedia: messageData.hasMedia,
              chatTitle: messageData.chatTitle,
              chatType: messageData.chatType,
              status: "success",
              userDetails: userDetails,
            },
            ...prev,
          ]);

          // Delete original message if checkbox is checked
          if (deleteOriginalMessages) {
            try {
              const deleteResult = await deleteMessage(
                config.bot_token,
                sourceChatId,
                msgId
              );
              if (!deleteResult.ok) {
                // Failed to delete message
              }
            } catch (deleteErr) {
              // Error deleting message - don't stop forwarding process
            }
          }
        } else {
          // Handle API errors, especially 429 (Too Many Requests)
          if (result.error_code === 429) {
            const retryAfterSeconds = result.parameters?.retry_after || 30;
            setIsRateLimited(true);
            setRetryAfter(retryAfterSeconds);
            setCountdownSeconds(retryAfterSeconds);
            setCurrentMessageId(msgId); // Set current message to retry from
            setForwardStatus(`Rate limited! Waiting before continuing...`);

            // Wait for the retry_after period
            await new Promise((resolve) =>
              setTimeout(resolve, retryAfterSeconds * 1000)
            );

            // Reset rate limiting state and retry the same message
            setIsRateLimited(false);
            setRetryAfter(0);
            setCountdownSeconds(0);
            msgId--; // Decrement to retry the same message
            continue;
          } else {
            errorCount++;
            // Failed to forward message
          }
        }

        // Add delay to avoid rate limiting, but skip if we just handled a 429 error
        if (!isRateLimited) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        // Check again after delay to ensure immediate response to pause using ref
        if (isPausedRef.current) {
          setCurrentMessageId(msgId + 1); // Set to next message to resume from
          setCurrentForwardingIndex(msgId - startMsgId + 1);
          setForwardStatus(
            `Forwarding paused at message ${
              msgId + 1
            }. Click Resume to continue...`
          );
          // Don't reset isForwarding when paused - keep it true so resume can work
          return; // Exit immediately if paused during delay
        }
      } catch (err) {
        // Check if it's a 429 error in the exception
        if (err.message && err.message.includes("429")) {
          const retryAfterMatch = err.message.match(/retry_after:(\d+)/);
          const retryAfterSeconds = retryAfterMatch
            ? parseInt(retryAfterMatch[1])
            : 30;

          setIsRateLimited(true);
          setRetryAfter(retryAfterSeconds);
          setCountdownSeconds(retryAfterSeconds);
          setCurrentMessageId(msgId); // Set current message to retry from
          setForwardStatus(`Rate limited! Waiting before continuing...`);

          // Wait for the retry_after period
          await new Promise((resolve) =>
            setTimeout(resolve, retryAfterSeconds * 1000)
          );

          // Reset rate limiting state and retry the same message
          setIsRateLimited(false);
          setRetryAfter(0);
          setCountdownSeconds(0);
          msgId--; // Decrement to retry the same message
          continue;
        } else {
          errorCount++;
          // Error forwarding message
        }
      }
    }

    // Forwarding completed successfully (not paused)
    setForwardStatus(
      `Forwarding completed: ${successCount} successful, ${errorCount} failed`
    );
    setIsForwarding(false);
    setIsPaused(false);
    isPausedRef.current = false; // Reset ref when completed
    setCurrentMessageId(null);

    // Clear status after 10 seconds
    setTimeout(() => setForwardStatus(null), 10000);
  };

  const resumeForwarding = async () => {
    if (!targetMessageId) {
      setError("Cannot resume: target message ID not found");
      return;
    }

    const startMsgId = parseInt(startMessageId) || 1;
    const resumeFromMsgId = currentMessageId || startMsgId;

    setForwardStatus("Resuming forwarding...");
    await forwardMessagesInRange(resumeFromMsgId, targetMessageId - 1);
  };

  const handleSetupComplete = async () => {
    if (!sourceChatId.trim() || !targetChatId.trim()) {
      setError("Please enter both source and target chat IDs");
      return;
    }

    // Enhanced config validation
    if (!config) {
      setError(
        "Configuration not loaded. Please ensure the bot is configured first."
      );
      return;
    }

    if (!config.bot_token) {
      setError(
        "Bot token is missing from configuration. Please reconfigure the bot."
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if source chat exists
      await getChat(config.bot_token, sourceChatId.trim());

      // Check if target chat exists
      await getChat(config.bot_token, targetChatId.trim());
      const configToSave = {
        sourceChatId: sourceChatId.trim(),
        targetChatId: targetChatId.trim(),
        startMessageId: startMessageId || "0",
        deleteOriginalMessages: deleteOriginalMessages,
        setupCompleted: true,
      };

      // Save configuration to localStorage
      saveConfigurationToStorage(configToSave);

      setShowChatSetup(false);
      setSetupCompleted(true);
      setIsLoading(false); // Setup is complete, stop loading
    } catch (error) {
      // Handle specific error cases
      if (
        error.message?.includes("chat not found") ||
        error.message?.includes("Bad Request")
      ) {
        setError(
          "One or both chat IDs are invalid. Please check the chat IDs and try again."
        );
      } else if (error.message?.includes("Unauthorized")) {
        setError(
          "Bot token is invalid or the bot doesn't have access to the specified chats."
        );
      } else {
        setError(
          "Failed to validate chats. Please check your bot token and chat IDs."
        );
      }

      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form values to previous saved state or defaults
    const savedConfig = loadConfigurationFromStorage();
    if (savedConfig) {
      setSourceChatId(savedConfig.sourceChatId || "");
      setTargetChatId(savedConfig.targetChatId || "");
      setStartMessageId(savedConfig.startMessageId || "0");
    } else {
      setSourceChatId("");
      setTargetChatId("");
      setStartMessageId("0");
    }
    setError(null);
    setShowChatSetup(false);

    // Switch back to chat tab
    if (onSwitchToChat) {
      onSwitchToChat();
    }
  };

  const handleResetSetup = () => {
    // Clear saved configuration from localStorage when user explicitly resets
    clearConfigurationFromStorage();
    clearForwardedMessagesFromStorage();
    localStorage.removeItem("lastBotToken"); // Clear bot token tracking

    setShowChatSetup(true);
    setSetupCompleted(false);
    setSourceChatId("");
    setTargetChatId("");
    setStartMessageId("0");
    setConfigLoadedFromStorage(false);
    setIsLoading(false); // Set loading to false when showing setup again
    setError(null);

    // Clear forwarding states
    setIsForwarding(false);
    setIsPaused(false);
    isPausedRef.current = false; // Reset ref
    setForwardedMessages([]);
    setTargetMessageId(null);
    setCurrentForwardingIndex(0);
    setForwardStatus(null);
    setCurrentMessageId(null);
  };

  if (isLoading) {
    return (
      <div className="h-full p-6">
        <div className="space-y-4">
          <Skeleton
            className={`w-full h-10 ${isDarkMode ? "bg-gray-700" : ""}`}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Skeleton
                  key={i}
                  className={`w-full h-20 ${isDarkMode ? "bg-gray-700" : ""}`}
                />
              ))}
          </div>
          <Skeleton
            className={`w-full h-64 ${isDarkMode ? "bg-gray-700" : ""}`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ChatSetupModal
        showChatSetup={showChatSetup}
        isDarkMode={isDarkMode}
        configLoadedFromStorage={configLoadedFromStorage}
        error={error}
        sourceChatId={sourceChatId}
        targetChatId={targetChatId}
        startMessageId={startMessageId}
        deleteOriginalMessages={deleteOriginalMessages}
        config={config}
        handleNumericInput={handleNumericInput}
        handlePositiveNumericInput={handlePositiveNumericInput}
        handleDeleteOriginalMessagesChange={handleDeleteOriginalMessagesChange}
        handleSetupComplete={handleSetupComplete}
        handleCancel={handleCancel}
        setSourceChatId={setSourceChatId}
        setTargetChatId={setTargetChatId}
        setStartMessageId={setStartMessageId}
      />

      <HistoryErrorAlert error={error} onClearError={() => setError(null)} />

      {/* Statistics Cards */}
      <div className="p-4 space-y-4">
        <ForwardStatusAlert
          forwardStatus={forwardStatus}
          isRateLimited={isRateLimited}
          countdownSeconds={countdownSeconds}
          isDarkMode={isDarkMode}
          formatCountdown={formatCountdown}
        />

        <StatisticsCards
          isDarkMode={isDarkMode}
          getForwardedStats={getForwardedStats}
          getForwardedUniqueSenders={getForwardedUniqueSenders}
          showSendersList={showSendersList}
          setShowSendersList={setShowSendersList}
          forwardedMessages={forwardedMessages}
          handleExportForwardedMessages={handleExportForwardedMessages}
          handleForwardMessages={handleForwardMessages}
          targetChatId={targetChatId}
          sourceChatId={sourceChatId}
          setupCompleted={setupCompleted}
          isForwarding={isForwarding}
          isPaused={isPaused}
          handleResetSetup={handleResetSetup}
        />

        <SendersListCard
          showSendersList={showSendersList}
          setShowSendersList={setShowSendersList}
          isDarkMode={isDarkMode}
          getForwardedUniqueSenders={getForwardedUniqueSenders}
        />
      </div>

      {/* Forwarded Messages Log - Positioned at bottom of page */}
      <div className="p-4">
        <ForwardedMessagesCard
          isDarkMode={isDarkMode}
          forwardedMessages={forwardedMessages}
          displayedMessagesCount={displayedMessagesCount}
          setDisplayedMessagesCount={setDisplayedMessagesCount}
        />
      </div>
    </div>
  );
}
