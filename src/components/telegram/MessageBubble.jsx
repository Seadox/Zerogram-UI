import React from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { renderEmojis } from "@/lib/emojiUtils";
import {
  FileText,
  Image,
  Mic,
  Download,
  Play,
  Pause,
  User,
  Phone,
  MessageCircle,
  Reply,
} from "lucide-react";

export default function MessageBubble({ message, index, onReply, isDarkMode }) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef(null);

  const handlePlayAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  const formatFileSize = (url) => {
    // Simple file size estimation - in real app you'd get this from API
    return "~1.2 MB";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex ${
        message.is_outgoing ? "justify-end" : "justify-start"
      } mb-4`}
    >
      {/* User Avatar - only for incoming messages */}
      {!message.is_outgoing && (
        <div className="flex-shrink-0 mr-3 mt-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
            {message.sender_photo ? (
              <img
                src={message.sender_photo}
                alt={message.sender_name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
        </div>
      )}

      <div
        className={`max-w-xs sm:max-w-sm lg:max-w-md ${
          message.is_outgoing ? "order-2" : "order-1"
        }`}
      >
        <Card
          className={`p-0 border-none shadow-sm ${
            message.is_outgoing
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
              : isDarkMode
              ? "bg-gray-700 border border-gray-600"
              : "bg-white border border-gray-100"
          }`}
        >
          <div className="p-3">
            {!message.is_outgoing && (
              <div className="flex items-center gap-2 mb-1">
                <p
                  className={`text-xs font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {message.sender_name || "Unknown"}
                </p>
                {message.sender_username && (
                  <a
                    href={`https://t.me/${message.sender_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-700 hover:underline"
                  >
                    @{message.sender_username}
                  </a>
                )}
              </div>
            )}

            {/* Reply to message display */}
            {message.reply_to_message && (
              <div
                className={`mb-2 p-2 rounded border-l-2 ${
                  message.is_outgoing
                    ? "bg-white/10 border-white/30"
                    : isDarkMode
                    ? "bg-gray-600 border-blue-500"
                    : "bg-gray-50 border-blue-500"
                }`}
              >
                <p
                  className={`text-xs font-medium ${
                    message.is_outgoing
                      ? "text-white/80"
                      : isDarkMode
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  {message.reply_to_message.sender_name}
                </p>
                <p
                  className={`text-xs truncate ${
                    message.is_outgoing
                      ? "text-white/70"
                      : isDarkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  {message.reply_to_message.message_type === "text"
                    ? renderEmojis(message.reply_to_message.content)
                    : `${
                        message.reply_to_message.message_type
                          .charAt(0)
                          .toUpperCase() +
                        message.reply_to_message.message_type.slice(1)
                      }`}
                </p>
              </div>
            )}

            {/* Text Message */}
            {message.message_type === "text" && (
              <p
                className={`text-sm leading-relaxed ${
                  message.is_outgoing
                    ? "text-white"
                    : isDarkMode
                    ? "text-gray-200"
                    : "text-gray-800"
                }`}
              >
                {renderEmojis(message.content)}
              </p>
            )}

            {/* Image Message */}
            {message.message_type === "photo" && (
              <div className="space-y-2">
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={message.file_url}
                    alt="Shared image"
                    className="w-full h-auto max-h-64 object-cover"
                  />
                </div>
                {message.content && (
                  <p
                    className={`text-sm ${
                      message.is_outgoing
                        ? "text-white/90"
                        : isDarkMode
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    {renderEmojis(message.content)}
                  </p>
                )}
              </div>
            )}

            {/* Animation/GIF Message */}
            {message.message_type === "animation" && (
              <div className="space-y-2">
                <div className="relative rounded-lg overflow-hidden group">
                  {message.file_url ? (
                    <>
                      <video
                        className="w-full h-auto max-h-64 object-cover"
                        controls
                        preload="metadata"
                        autoPlay
                        loop
                        muted
                        style={{
                          backgroundColor: "#000",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                        onLoadedMetadata={() => {
                          // GIF loaded successfully
                        }}
                      >
                        <source src={message.file_url} type="video/mp4" />
                        <source src={message.file_url} type="video/webm" />
                        {/* Fallback for actual GIF files */}
                        <img
                          src={message.file_url}
                          alt="Shared animation"
                          className="w-full h-auto max-h-64 object-cover"
                        />
                      </video>

                      {/* GIF label */}
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Play size={12} />
                        <span>GIF</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500 text-sm">Loading GIF...</p>
                    </div>
                  )}
                </div>
                {message.content && (
                  <p
                    className={`text-sm ${
                      message.is_outgoing
                        ? "text-white/90"
                        : isDarkMode
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    {renderEmojis(message.content)}
                  </p>
                )}
              </div>
            )}

            {/* Video Message */}
            {message.message_type === "video" && (
              <div className="space-y-2">
                <div className="relative rounded-lg overflow-hidden group">
                  {message.file_url ? (
                    <>
                      <video
                        className="w-full h-auto max-h-64 object-cover"
                        controls
                        preload="metadata"
                        style={{
                          backgroundColor: "#000",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                        onLoadedMetadata={() => {
                          // Video loaded successfully
                        }}
                      >
                        <source src={message.file_url} type="video/mp4" />
                        <source src={message.file_url} type="video/webm" />
                        <source src={message.file_url} type="video/ogg" />
                        Your browser does not support the video tag.
                      </video>

                      {/* Video label */}
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Play size={12} />
                        <span>VIDEO</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500 text-sm">Loading video...</p>
                    </div>
                  )}
                </div>
                {message.content && (
                  <p
                    className={`text-sm ${
                      message.is_outgoing
                        ? "text-white/90"
                        : isDarkMode
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    {renderEmojis(message.content)}
                  </p>
                )}
              </div>
            )}

            {/* Document Message */}
            {message.message_type === "document" && (
              <div className="space-y-2">
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    message.is_outgoing
                      ? "bg-white/10"
                      : isDarkMode
                      ? "bg-gray-600"
                      : "bg-gray-50"
                  }`}
                >
                  <FileText
                    className={`w-8 h-8 ${
                      message.is_outgoing
                        ? "text-white/80"
                        : isDarkMode
                        ? "text-blue-400"
                        : "text-blue-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        message.is_outgoing
                          ? "text-white"
                          : isDarkMode
                          ? "text-gray-200"
                          : "text-gray-800"
                      }`}
                    >
                      {message.file_name || "Document"}
                    </p>
                    <p
                      className={`text-xs ${
                        message.is_outgoing
                          ? "text-white/70"
                          : isDarkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      {formatFileSize(message.file_url)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={message.is_outgoing ? "secondary" : "outline"}
                    onClick={() => window.open(message.file_url, "_blank")}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
                {message.content && (
                  <p
                    className={`text-sm ${
                      message.is_outgoing
                        ? "text-white/90"
                        : isDarkMode
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    {renderEmojis(message.content)}
                  </p>
                )}
              </div>
            )}

            {/* Voice Message */}
            {(message.message_type === "voice" ||
              message.message_type === "audio") && (
              <div className="space-y-2">
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    message.is_outgoing
                      ? "bg-white/10"
                      : isDarkMode
                      ? "bg-gray-600"
                      : "bg-gray-50"
                  }`}
                >
                  <Button
                    size="sm"
                    variant={message.is_outgoing ? "secondary" : "outline"}
                    onClick={handlePlayAudio}
                    className="rounded-full w-10 h-10 p-0"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <div className="flex items-center gap-2">
                    <Mic
                      className={`w-4 h-4 ${
                        message.is_outgoing
                          ? "text-white/80"
                          : isDarkMode
                          ? "text-blue-400"
                          : "text-blue-500"
                      }`}
                    />
                    <div
                      className={`w-20 h-1 rounded-full ${
                        message.is_outgoing
                          ? "bg-white/20"
                          : isDarkMode
                          ? "bg-gray-500"
                          : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`h-full w-1/3 rounded-full ${
                          message.is_outgoing
                            ? "bg-white/60"
                            : isDarkMode
                            ? "bg-blue-400"
                            : "bg-blue-500"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs ${
                        message.is_outgoing
                          ? "text-white/70"
                          : isDarkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      0:15
                    </span>
                  </div>
                </div>
                <audio
                  ref={audioRef}
                  src={message.file_url}
                  onEnded={handleAudioEnd}
                  className="hidden"
                />
                {message.content && (
                  <p
                    className={`text-sm ${
                      message.is_outgoing
                        ? "text-white/90"
                        : isDarkMode
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    {renderEmojis(message.content)}
                  </p>
                )}
              </div>
            )}

            {/* Contact Message */}
            {message.message_type === "contact" && (
              <div className="space-y-2">
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    message.is_outgoing
                      ? "bg-white/10"
                      : isDarkMode
                      ? "bg-gray-600"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        message.is_outgoing
                          ? "bg-white/20"
                          : isDarkMode
                          ? "bg-blue-600"
                          : "bg-blue-500"
                      }`}
                    >
                      <Phone
                        className={`w-5 h-5 ${
                          message.is_outgoing ? "text-white" : "text-white"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium ${
                        message.is_outgoing
                          ? "text-white"
                          : isDarkMode
                          ? "text-gray-200"
                          : "text-gray-900"
                      }`}
                    >
                      {message.contact_data?.first_name}{" "}
                      {message.contact_data?.last_name || ""}
                    </p>
                    <p
                      className={`text-sm ${
                        message.is_outgoing
                          ? "text-white/70"
                          : isDarkMode
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      {message.contact_data?.phone_number}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${message.contact_data?.phone_number}`}
                      className={`p-2 rounded-full transition-colors ${
                        message.is_outgoing
                          ? "hover:bg-white/10 text-white/80 hover:text-white"
                          : isDarkMode
                          ? "hover:bg-gray-500 text-gray-400 hover:text-gray-200"
                          : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                      }`}
                      title="Call"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <a
                      href={`sms:${message.contact_data?.phone_number}`}
                      className={`p-2 rounded-full transition-colors ${
                        message.is_outgoing
                          ? "hover:bg-white/10 text-white/80 hover:text-white"
                          : isDarkMode
                          ? "hover:bg-gray-500 text-gray-400 hover:text-gray-200"
                          : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                      }`}
                      title="Send SMS"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                {message.content && (
                  <p
                    className={`text-sm ${
                      message.is_outgoing
                        ? "text-white/90"
                        : isDarkMode
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    {renderEmojis(message.content)}
                  </p>
                )}
              </div>
            )}

            {/* Timestamp and Reply button on same line */}
            <div className="flex justify-between items-center mt-2">
              <p
                className={`text-xs ${
                  message.is_outgoing
                    ? "text-white/60"
                    : isDarkMode
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                {format(new Date(message.timestamp), "HH:mm")}
              </p>
              <button
                onClick={() => onReply && onReply(message)}
                className={`p-1 rounded-full hover:bg-black/10 transition-colors ${
                  message.is_outgoing
                    ? "text-white/60 hover:text-white/80"
                    : isDarkMode
                    ? "text-gray-500 hover:text-gray-300"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="Reply to this message"
              >
                <Reply size={14} />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
