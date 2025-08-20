import { TelegramMessage } from "@/entities/all";
import {
  sendMessage,
  sendDocument,
  sendPhoto,
  sendAnimation,
  sendVideo,
  sendContact,
  getFile,
} from "@/integrations/Core";

export class MessageService {
  static async sendMessage(messageData, config) {
    if (!config) return null;

    try {
      let response;
      let fileUrl = null;
      let fileName = null;

      const replyToMessageId = messageData.replyToMessage?.message_id || null;

      if (messageData.file) {
        if (messageData.type === "photo") {
          response = await sendPhoto(
            messageData.file,
            config,
            messageData.caption || "",
            replyToMessageId
          );
          if (response.ok) {
            const photos = response.result.photo;
            const largestPhoto = photos[photos.length - 1];
            fileUrl = await getFile(config, largestPhoto.file_id);
            fileName = messageData.file.name;
          }
        } else if (messageData.type === "animation") {
          response = await sendAnimation(
            messageData.file,
            config,
            messageData.caption || "",
            replyToMessageId
          );
          if (response.ok) {
            fileUrl = await getFile(config, response.result.animation.file_id);
            fileName = messageData.file.name;
          }
        } else if (messageData.type === "video") {
          response = await sendVideo(
            messageData.file,
            config,
            messageData.caption || "",
            replyToMessageId
          );
          if (response.ok) {
            fileUrl = await getFile(config, response.result.video.file_id);
            fileName = messageData.file.name;
          }
        } else if (messageData.type === "document") {
          response = await sendDocument(
            messageData.file,
            config,
            messageData.caption || "",
            replyToMessageId
          );
          if (response.ok) {
            fileUrl = await getFile(config, response.result.document.file_id);
            fileName = messageData.file.name;
          }
        } else {
          response = await sendDocument(
            messageData.file,
            config,
            messageData.caption || "",
            replyToMessageId
          );
          if (response.ok) {
            fileUrl = await getFile(config, response.result.document.file_id);
            fileName = messageData.file.name;
          }
        }
      } else if (messageData.type === "contact") {
        response = await sendContact(
          messageData.contact_data,
          config,
          replyToMessageId
        );
      } else if (messageData.content) {
        response = await sendMessage(
          messageData.content,
          config,
          replyToMessageId
        );
      }

      if (response && response.ok) {
        const sentMessage = {
          message_id: response.result.message_id.toString(),
          chat_id: config.chat_id,
          message_type: messageData.type,
          content: messageData.content || messageData.caption || "",
          file_url: fileUrl,
          file_name: fileName,
          contact_data: messageData.contact_data || null,
          reply_to_message: messageData.replyToMessage || null,
          sender_name: "You",
          is_outgoing: true,
          timestamp: new Date(response.result.date * 1000).toISOString(),
        };

        await TelegramMessage.create(sentMessage);
        return sentMessage;
      } else {
        throw new Error("Telegram API returned an error");
      }
    } catch (error) {
      throw new Error("Failed to send message");
    }
  }
}
