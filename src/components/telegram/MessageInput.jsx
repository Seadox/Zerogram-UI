import React, { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Send,
  Paperclip,
  Image,
  Mic,
  MicOff,
  FileText,
  Loader2,
  Phone,
  User,
  X,
  Reply,
  Video,
  Smile,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function MessageInput({
  onSendMessage,
  disabled,
  replyToMessage,
  onClearReply,
  isDarkMode,
}) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showCaptionDialog, setShowCaptionDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [contactForm, setContactForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const emojiPickerRef = useRef(null);

  // Auto-focus the input when component mounts or when not disabled
  useEffect(() => {
    if (!disabled && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [disabled]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Handle emoji selection
  const onEmojiClick = (emojiData) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const emoji = emojiData.emoji;
      const newMessage = message.slice(0, start) + emoji + message.slice(end);
      setMessage(newMessage);

      // Set cursor position after emoji
      setTimeout(() => {
        input.setSelectionRange(start + emoji.length, start + emoji.length);
        input.focus();
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  // Re-focus after sending a message
  useEffect(() => {
    if (!isSending && !disabled && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSending, disabled]);

  const handleSendText = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    await onSendMessage({
      type: "text",
      content: message.trim(),
      replyToMessage: replyToMessage,
    });
    setMessage("");
    if (onClearReply) onClearReply();
    setIsSending(false);

    // Re-focus after sending
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if it's a GIF
    if (file.type === "image/gif") {
      setSelectedFile({ file, type: "animation" });
      setCaption("");
      setShowCaptionDialog(true);
      event.target.value = ""; // Reset input
      return;
    }

    // Check if it's a video
    if (file.type.startsWith("video/")) {
      setSelectedFile({ file, type: "video" });
      setCaption("");
      setShowCaptionDialog(true);
      event.target.value = ""; // Reset input
      return;
    }

    // If it's an image, show caption dialog
    if (type === "photo") {
      setSelectedFile({ file, type });
      setCaption("");
      setShowCaptionDialog(true);
      event.target.value = ""; // Reset input
      return;
    }

    // For other files, send directly
    setIsSending(true);
    await onSendMessage({
      type: type,
      file: file,
    });
    event.target.value = "";
    setIsSending(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const audioFile = new File([audioBlob], `voice-${Date.now()}.wav`, {
          type: "audio/wav",
        });

        setIsSending(true);
        await onSendMessage({
          type: "voice",
          file: audioFile,
        });
        setIsSending(false);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      // Error accessing microphone
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendContact = async () => {
    if (!contactForm.first_name.trim() || !contactForm.phone_number.trim()) {
      return;
    }

    setIsSending(true);
    await onSendMessage({
      type: "contact",
      contact_data: {
        first_name: contactForm.first_name.trim(),
        last_name: contactForm.last_name.trim(),
        phone_number: contactForm.phone_number.trim(),
      },
      replyToMessage: replyToMessage,
    });

    // Reset form
    setContactForm({
      first_name: "",
      last_name: "",
      phone_number: "",
    });
    setShowContactDialog(false);
    if (onClearReply) onClearReply();
    setIsSending(false);

    // Re-focus input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSendFileWithCaption = async () => {
    if (!selectedFile) return;

    setIsSending(true);
    await onSendMessage({
      type: selectedFile.type,
      file: selectedFile.file,
      caption: caption.trim(),
      replyToMessage: replyToMessage,
    });

    // Reset state
    setSelectedFile(null);
    setCaption("");
    setShowCaptionDialog(false);
    if (onClearReply) onClearReply();
    setIsSending(false);

    // Re-focus input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <Card
      className={`border-t rounded-none backdrop-blur-sm ${
        isDarkMode
          ? "border-gray-700 bg-gray-800/80"
          : "border-gray-100 bg-white/80"
      }`}
    >
      <div className="p-3 sm:p-4">
        {/* Reply Preview */}
        {replyToMessage && (
          <div
            className={`mb-3 p-3 border-l-4 border-blue-500 rounded-r-lg ${
              isDarkMode ? "bg-blue-900/50" : "bg-blue-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Reply size={14} className="text-blue-500" />
                <span
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-blue-400" : "text-blue-700"
                  }`}
                >
                  Replying to {replyToMessage.sender_name || "Unknown"}
                </span>
              </div>
              <button
                onClick={onClearReply}
                className={`transition-colors ${
                  isDarkMode
                    ? "text-gray-500 hover:text-gray-300"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="Cancel reply"
              >
                <X size={16} />
              </button>
            </div>
            <p
              className={`text-sm mt-1 truncate ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {replyToMessage.message_type === "text"
                ? replyToMessage.content
                : `${
                    replyToMessage.message_type.charAt(0).toUpperCase() +
                    replyToMessage.message_type.slice(1)
                  }`}
            </p>
          </div>
        )}

        <div className="flex items-end gap-2 sm:gap-3">
          <div className="flex-1">
            <div
              className={`flex items-center gap-2 rounded-2xl px-3 sm:px-4 py-2 ${
                isDarkMode ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              <Input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className={`border-none bg-transparent focus-visible:ring-0 p-0 text-sm ${
                  isDarkMode ? "text-gray-200 placeholder:text-gray-500" : ""
                }`}
                disabled={disabled || isSending || isRecording}
              />

              {/* Emoji Picker Button */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0 ${
                    isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                  }`}
                  disabled={disabled || isSending || isRecording}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile
                    className={`w-3 h-3 sm:w-4 sm:h-4 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                </Button>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute bottom-full right-0 mb-2 z-50"
                    style={{ right: "50%", transform: "translateX(50%)" }}
                  >
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      theme={isDarkMode ? "dark" : "light"}
                      width={300}
                      height={400}
                      previewConfig={{ showPreview: false }}
                      searchDisabled={false}
                      skinTonesDisabled={false}
                      autoFocusSearch={false}
                    />
                  </div>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0 ${
                      isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                    }`}
                    disabled={disabled || isSending || isRecording}
                  >
                    <Paperclip
                      className={`w-3 h-3 sm:w-4 sm:h-4 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Photo
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Video
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Document
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowContactDialog(true)}>
                    <Phone className="w-4 h-4 mr-2" />
                    Contact
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div
                key="recording"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Button
                  onClick={stopRecording}
                  className="rounded-full w-10 h-10 sm:w-12 sm:h-12 p-0 bg-red-500 hover:bg-red-600"
                >
                  <MicOff className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </Button>
              </motion.div>
            ) : message.trim() ? (
              <motion.div
                key="send"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Button
                  onClick={handleSendText}
                  disabled={disabled || isSending}
                  className="rounded-full w-10 h-10 sm:w-12 sm:h-12 p-0 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="mic"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Button
                  onClick={startRecording}
                  disabled={disabled || isSending}
                  className="rounded-full w-10 h-10 sm:w-12 sm:h-12 p-0 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.zip,.rar"
          onChange={(e) => handleFileUpload(e, "document")}
          className="hidden"
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileUpload(e, "photo")}
          className="hidden"
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => handleFileUpload(e, "video")}
          className="hidden"
        />
      </div>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Send Contact
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                First Name *
              </label>
              <Input
                value={contactForm.first_name}
                onChange={(e) =>
                  setContactForm({ ...contactForm, first_name: e.target.value })
                }
                placeholder="Enter first name"
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Last Name
              </label>
              <Input
                value={contactForm.last_name}
                onChange={(e) =>
                  setContactForm({ ...contactForm, last_name: e.target.value })
                }
                placeholder="Enter last name (optional)"
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Phone Number *
              </label>
              <Input
                value={contactForm.phone_number}
                onChange={(e) =>
                  setContactForm({
                    ...contactForm,
                    phone_number: e.target.value,
                  })
                }
                placeholder="+1234567890"
                className="w-full"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowContactDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-500 hover:bg-blue-600"
                onClick={handleSendContact}
                disabled={
                  !contactForm.first_name.trim() ||
                  !contactForm.phone_number.trim() ||
                  isSending
                }
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Contact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Caption Dialog for Images */}
      <Dialog open={showCaptionDialog} onOpenChange={setShowCaptionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              {selectedFile?.type === "animation"
                ? "Add Caption to GIF"
                : "Add Caption to Photo"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedFile && (
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={URL.createObjectURL(selectedFile.file)}
                  alt="Preview"
                  className="w-full h-32 object-cover"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Caption (optional)
              </label>
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption to your image..."
                className="w-full"
                maxLength={1024}
              />
              <p className="text-xs text-gray-500 mt-1">
                {caption.length}/1024 characters
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowCaptionDialog(false);
                  setSelectedFile(null);
                  setCaption("");
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-500 hover:bg-blue-600"
                onClick={handleSendFileWithCaption}
                disabled={isSending}
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {selectedFile?.type === "animation" ? "Send GIF" : "Send Photo"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
