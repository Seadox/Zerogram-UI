import { useState, useEffect, useRef } from "react";
import { TelegramMessage } from "@/entities/all";
import {
  getUpdates,
  getFile,
  getMe,
  getChat,
  getChatMemberCount,
  getChatAdministrators,
} from "@/integrations/Core";

export function useChatConnection(config) {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdateId, setLastUpdateId] = useState(0);
  const [botInfo, setBotInfo] = useState(null);
  const [chatInfo, setChatInfo] = useState(null);
  const [memberCount, setMemberCount] = useState(null);
  const [administrators, setAdministrators] = useState([]);
  const pollingIntervalRef = useRef(null);

  const loadMessages = async () => {
    try {
      const fetchedMessages = await TelegramMessage.list("-timestamp", 100);
      setMessages(fetchedMessages);
    } catch (error) {
      // Error loading messages
    }
  };

  const loadChatDetails = async (config) => {
    try {
      const botResponse = await getMe(config);
      if (botResponse.ok) {
        setBotInfo(botResponse.result);
      }

      let currentChatInfo = null;
      try {
        const chatResponse = await getChat(config.bot_token, config.chat_id);
        if (chatResponse.ok) {
          currentChatInfo = chatResponse.result;
          setChatInfo(chatResponse.result);
        }
      } catch (chatError) {
        // Chat info not available (might be a private chat)
      }

      try {
        const memberCountResponse = await getChatMemberCount(config);
        if (memberCountResponse.ok) {
          setMemberCount(memberCountResponse.result);
        }
      } catch (memberError) {
        // Member count not available (might be a private chat)
      }

      // Only get administrators if chat is not private
      if (currentChatInfo && currentChatInfo.type !== "private") {
        try {
          const adminsResponse = await getChatAdministrators(config);
          if (adminsResponse.ok) {
            setAdministrators(adminsResponse.result);
          }
        } catch (adminError) {
          // Administrators not available
        }
      } else {
        // Clear administrators for private chats
        setAdministrators([]);
      }
    } catch (error) {
      // Error loading chat details
    }
  };

  const fetchNewMessages = async () => {
    try {
      const updates = await getUpdates(config, lastUpdateId + 1, messages);

      if (updates.length > 0) {
        let newMessagesAdded = false;

        for (const update of updates) {
          if (update.message) {
            const msg = update.message;
            const messageId = msg.message_id.toString();

            const existing = messages.find((m) => m.message_id === messageId);
            if (existing) {
              continue;
            }

            let fileUrl = "";
            let fileName = "";
            let contactData = null;

            if (msg.photo) {
              const largestPhoto = msg.photo[msg.photo.length - 1];
              fileUrl = await getFile(config, largestPhoto.file_id);
            } else if (msg.animation) {
              fileUrl = await getFile(config, msg.animation.file_id);
              fileName = msg.animation.file_name || "";
            } else if (msg.video) {
              fileUrl = await getFile(config, msg.video.file_id);
              fileName = msg.video.file_name || "";
            } else if (msg.document) {
              fileUrl = await getFile(config, msg.document.file_id);
              fileName = msg.document.file_name || "";
            } else if (msg.voice) {
              fileUrl = await getFile(config, msg.voice.file_id);
            } else if (msg.audio) {
              fileUrl = await getFile(config, msg.audio.file_id);
            } else if (msg.contact) {
              contactData = {
                phone_number: msg.contact.phone_number,
                first_name: msg.contact.first_name,
                last_name: msg.contact.last_name || "",
                user_id: msg.contact.user_id || null,
              };
            }

            const newMessage = {
              message_id: messageId,
              chat_id: msg.chat.id.toString(),
              message_type: msg.photo
                ? "photo"
                : msg.animation
                ? "animation"
                : msg.video
                ? "video"
                : msg.document
                ? "document"
                : msg.voice
                ? "voice"
                : msg.audio
                ? "audio"
                : msg.contact
                ? "contact"
                : "text",
              content: msg.text || msg.caption || "",
              file_url: fileUrl || "",
              file_name: fileName,
              contact_data: contactData,
              reply_to_message: msg.reply_to_message
                ? {
                    message_id: msg.reply_to_message.message_id.toString(),
                    content:
                      msg.reply_to_message.text ||
                      msg.reply_to_message.caption ||
                      "",
                    sender_name:
                      msg.reply_to_message.from.first_name +
                      (msg.reply_to_message.from.last_name
                        ? " " + msg.reply_to_message.from.last_name
                        : ""),
                    message_type: msg.reply_to_message.photo
                      ? "photo"
                      : msg.reply_to_message.animation
                      ? "animation"
                      : msg.reply_to_message.video
                      ? "video"
                      : msg.reply_to_message.document
                      ? "document"
                      : msg.reply_to_message.voice
                      ? "voice"
                      : msg.reply_to_message.audio
                      ? "audio"
                      : msg.reply_to_message.contact
                      ? "contact"
                      : "text",
                  }
                : null,
              sender_name:
                msg.from.first_name +
                (msg.from.last_name ? " " + msg.from.last_name : ""),
              sender_username: msg.from.username || null,
              sender_photo: null,
              user_id: msg.from.id.toString(),
              is_outgoing: false,
              timestamp: new Date(msg.date * 1000).toISOString(),
            };

            await TelegramMessage.create(newMessage);
            newMessagesAdded = true;
          }

          setLastUpdateId(Math.max(lastUpdateId, update.update_id));
        }

        if (newMessagesAdded) {
          await loadMessages();
        }
      }
    } catch (error) {
      // Error fetching new messages
    }
  };

  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      if (config) {
        await fetchNewMessages();
      }
    }, 3000);
  };

  useEffect(() => {
    if (config) {
      loadMessages();
      loadChatDetails(config);
      startPolling();
      setIsConnected(true);
    } else {
      setIsConnected(false);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [config]);

  return {
    messages,
    isConnected,
    botInfo,
    chatInfo,
    memberCount,
    administrators,
    loadMessages,
  };
}
