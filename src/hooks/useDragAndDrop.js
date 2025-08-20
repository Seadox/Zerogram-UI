import { useState, useRef } from "react";

export function useDragAndDrop(
  config,
  isConnected,
  setError,
  handleSendMessage
) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev - 1);
    if (dragCounter <= 1) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);

    if (!config || !isConnected) {
      setError("Please configure your bot first");
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    for (const file of files) {
      try {
        let messageType = "document";
        if (file.type.startsWith("image/")) {
          if (file.type === "image/gif") {
            messageType = "animation";
          } else {
            messageType = "photo";
          }
        } else if (file.type.startsWith("video/")) {
          messageType = "video";
        } else if (file.type.startsWith("audio/")) {
          messageType = "audio";
        }

        await handleSendMessage({
          type: messageType,
          file: file,
          caption: "",
        });
      } catch (error) {
        setError(`Failed to upload ${file.name}`);
      }
    }
  };

  return {
    isDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  };
}
