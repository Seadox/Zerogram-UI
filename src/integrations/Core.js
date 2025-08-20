// Core integration functions for Telegram Bot API

const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

export async function UploadFile(data) {
  const { file } = data;
  try {
    // For now, return a mock response since file upload requires a proper backend
    return {
      file_url: URL.createObjectURL(file),
      success: true,
    };
  } catch (error) {
    // File upload failed
    throw error;
  }
}

export async function sendMessage(text, config, replyToMessageId = null) {
  try {
    const requestBody = {
      chat_id: config.chat_id,
      text: text,
      parse_mode: "HTML",
    };

    if (replyToMessageId) {
      requestBody.reply_to_message_id = parseInt(replyToMessageId);
    }

    const response = await fetch(
      `${TELEGRAM_API_BASE}${config.bot_token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Send message failed
    throw error;
  }
}

export async function getUpdates(config, offset = 0, existingMessages = []) {
  try {
    const response = await fetch(
      `${TELEGRAM_API_BASE}${config.bot_token}/getUpdates?offset=${offset}&limit=100`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    const data = await response.json();
    const updates = data.result || [];

    // Filter out updates that contain messages we already have
    const filteredUpdates = updates.filter((update) => {
      if (update.message) {
        const messageId = update.message.message_id.toString();
        // Check if this message_id already exists in our existing messages
        const messageExists = existingMessages.some(
          (msg) => msg.message_id === messageId
        );
        return !messageExists;
      }
      return true; // Keep non-message updates
    });

    return filteredUpdates;
  } catch (error) {
    // Get updates failed
    throw error;
  }
}

export async function getFile(config, fileId) {
  try {
    const response = await fetch(
      `${TELEGRAM_API_BASE}${config.bot_token}/getFile?file_id=${fileId}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.ok && data.result.file_path) {
      // Return the full URL to the file
      const fileUrl = `https://api.telegram.org/file/bot${config.bot_token}/${data.result.file_path}`;
      return fileUrl;
    }
    return null;
  } catch (error) {
    // Get file failed
    return null;
  }
}

export async function sendContact(
  contactData,
  config,
  replyToMessageId = null
) {
  try {
    const requestBody = {
      chat_id: config.chat_id,
      phone_number: contactData.phone_number,
      first_name: contactData.first_name,
      last_name: contactData.last_name || "",
    };

    if (replyToMessageId) {
      requestBody.reply_to_message_id = parseInt(replyToMessageId);
    }

    const response = await fetch(
      `${TELEGRAM_API_BASE}${config.bot_token}/sendContact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function sendDocument(
  file,
  config,
  caption = "",
  replyToMessageId = null
) {
  try {
    const formData = new FormData();
    formData.append("document", file);
    formData.append("chat_id", config.chat_id);
    if (caption) {
      formData.append("caption", caption);
    }
    if (replyToMessageId) {
      formData.append("reply_to_message_id", parseInt(replyToMessageId));
    }

    const response = await fetch(
      `${TELEGRAM_API_BASE}${config.bot_token}/sendDocument`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function sendPhoto(
  file,
  config,
  caption = "",
  replyToMessageId = null
) {
  try {
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("chat_id", config.chat_id);
    if (caption) {
      formData.append("caption", caption);
    }
    if (replyToMessageId) {
      formData.append("reply_to_message_id", parseInt(replyToMessageId));
    }

    const response = await fetch(
      `${TELEGRAM_API_BASE}${config.bot_token}/sendPhoto`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function sendAnimation(
  file,
  config,
  caption = "",
  replyToMessageId = null
) {
  try {
    const formData = new FormData();
    formData.append("animation", file);
    formData.append("chat_id", config.chat_id);
    if (caption) {
      formData.append("caption", caption);
    }
    if (replyToMessageId) {
      formData.append("reply_to_message_id", parseInt(replyToMessageId));
    }

    const response = await fetch(
      `${TELEGRAM_API_BASE}${config.bot_token}/sendAnimation`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function sendVideo(
  file,
  config,
  caption = "",
  replyToMessageId = null
) {
  try {
    const formData = new FormData();
    formData.append("video", file);
    formData.append("chat_id", config.chat_id);
    if (caption) {
      formData.append("caption", caption);
    }
    if (replyToMessageId) {
      formData.append("reply_to_message_id", parseInt(replyToMessageId));
    }

    const response = await fetch(
      `${TELEGRAM_API_BASE}${config.bot_token}/sendVideo`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

// Get bot information
export async function getMe(config) {
  try {
    const response = await fetch(
      `${TELEGRAM_API_BASE}${config.bot_token}/getMe`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

// Get chat information
export async function getChat(botToken, chatId) {
  try {
    const response = await fetch(`${TELEGRAM_API_BASE}${botToken}/getChat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

// Get chat member count
export async function getChatMemberCount(config) {
  try {
    const response = await fetch(
      `${TELEGRAM_API_BASE}${config.bot_token}/getChatMemberCount`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: config.chat_id,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

// Get chat administrators
export async function getChatAdministrators(config) {
  try {
    const response = await fetch(
      `${TELEGRAM_API_BASE}${config.bot_token}/getChatAdministrators?chat_id=${config.chat_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    // Handle specific case for private chats
    if (!response.ok) {
      if (
        response.status === 400 &&
        data.description?.includes("no administrators in the private chat")
      ) {
        // Return a successful response with empty administrators array for private chats
        return {
          ok: true,
          result: [],
        };
      }
      throw new Error(
        `Telegram API error: ${response.status} - ${
          data.description || "Unknown error"
        }`
      );
    }

    return data;
  } catch (error) {
    // For private chat errors, return empty administrators instead of throwing
    if (
      error.message &&
      error.message.includes("no administrators in the private chat")
    ) {
      return {
        ok: true,
        result: [],
      };
    }
    throw error;
  }
}

// Forward a message from one chat to another
export async function forwardMessage(
  botToken,
  fromChatId,
  toChatId,
  messageId
) {
  try {
    const response = await fetch(
      `${TELEGRAM_API_BASE}${botToken}/forwardMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: toChatId,
          from_chat_id: fromChatId,
          message_id: messageId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Return error data instead of throwing to prevent browser console logs
      return {
        ok: false,
        error_code: response.status,
        description:
          data.description || `Telegram API error: ${response.status}`,
        parameters: data.parameters || {},
      };
    }

    return data;
  } catch (error) {
    // Return error object instead of throwing
    return {
      ok: false,
      error_code: 0,
      description: error.message || "Network error",
      parameters: {},
    };
  }
}

// Send a simple text message and return the message data
export async function sendSimpleMessage(botToken, chatId, text) {
  try {
    const response = await fetch(
      `${TELEGRAM_API_BASE}${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

// Delete a message from a chat
export async function deleteMessage(botToken, chatId, messageId) {
  try {
    const response = await fetch(
      `${TELEGRAM_API_BASE}${botToken}/deleteMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}
