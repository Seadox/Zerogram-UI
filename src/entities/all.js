// Entity definitions for Telegram Chat

// Mock storage for demonstration - in a real app, this would be a database
const messageStorage = [];
const configStorage = [];

export class TelegramConfig {
  constructor(
    botToken = "",
    chatId = "",
    pollingInterval = 2000,
    username = ""
  ) {
    this.id = Date.now().toString();
    this.bot_token = botToken;
    this.chat_id = chatId;
    this.username = username;
    this.pollingInterval = pollingInterval;
    this.created_date = new Date().toISOString();
  }

  isValid() {
    return this.bot_token && this.chat_id;
  }

  toJSON() {
    return {
      id: this.id,
      bot_token: this.bot_token,
      chat_id: this.chat_id,
      username: this.username,
      pollingInterval: this.pollingInterval,
      created_date: this.created_date,
    };
  }

  static fromJSON(data) {
    const config = new TelegramConfig(
      data.bot_token,
      data.chat_id,
      data.pollingInterval,
      data.username
    );
    config.id = data.id;
    config.created_date = data.created_date;
    return config;
  }

  static async list(orderBy = "-created_date", limit = 10) {
    // Mock implementation - returns stored configs
    let configs = [...configStorage];

    if (orderBy === "-created_date") {
      configs.sort(
        (a, b) => new Date(b.created_date) - new Date(a.created_date)
      );
    }

    return configs.slice(0, limit);
  }

  static async create(data) {
    const config = new TelegramConfig(
      data.bot_token,
      data.chat_id,
      data.pollingInterval,
      data.username
    );
    configStorage.push(config);
    return config;
  }

  static async update(id, data) {
    const index = configStorage.findIndex((c) => c.id === id);
    if (index !== -1) {
      Object.assign(configStorage[index], data);
      return configStorage[index];
    }
    throw new Error("Config not found");
  }
}

export class TelegramMessage {
  constructor(id, text, sender, timestamp, type = "text") {
    this.id = id || Date.now().toString();
    this.message_id = id;
    this.content = text;
    this.sender_name = sender;
    this.timestamp = timestamp || new Date().toISOString();
    this.message_type = type;
    this.chat_id = "";
    this.file_url = "";
    this.file_name = "";
    this.sender_username = null;
    this.sender_photo = null;
    this.user_id = null;
    this.contact_data = null;
    this.is_outgoing = false;
  }

  isFromBot() {
    return this.sender_name === "bot";
  }

  isFromUser() {
    return this.sender_name === "user";
  }

  static fromTelegramAPI(apiMessage) {
    return new TelegramMessage(
      apiMessage.message_id,
      apiMessage.text || "",
      apiMessage.from.is_bot ? "bot" : "user",
      apiMessage.date * 1000, // Convert to milliseconds
      "text"
    );
  }

  static async list(orderBy = "-timestamp", limit = 100) {
    // Mock implementation - returns stored messages
    let messages = [...messageStorage];

    if (orderBy === "-timestamp") {
      // Sort messages chronologically (oldest first, newest at bottom)
      messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    return messages.slice(0, limit);
  }

  static async create(data) {
    // Check if message with this ID already exists
    const existingMessage = messageStorage.find(
      (m) => m.message_id === data.message_id
    );
    if (existingMessage) {
      return existingMessage;
    }

    const message = new TelegramMessage(
      data.message_id,
      data.content,
      data.sender_name,
      data.timestamp,
      data.message_type
    );

    // Copy additional properties
    Object.assign(message, data);

    messageStorage.push(message);
    return message;
  }
}
