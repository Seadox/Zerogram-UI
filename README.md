[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18%2B-61dafb.svg)](https://reactjs.org/)
[![GitHub stars](https://img.shields.io/github/stars/seadox/zerogram-ui)](https://github.com/Seadox/Zerogram-UI/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/seadox/zerogram-ui)](https://github.com/Seadox/Zerogram-UI/network/members)

# Zerogram UI

React-based web application for interacting with Telegram bots, featuring real-time messaging, file sharing, and comprehensive chat management capabilities.

This project is based on the original [Zerogram](https://github.com/Seadox/Zerogram) repository by [Seadox](https://github.com/Seadox). This UI version provides a modern React-based interface with enhanced features and improved user experience.

> **Note**: Looking for the CLI version? Check out the original command-line interface at [https://github.com/Seadox/Zerogram](https://github.com/Seadox/Zerogram)

## Disclaimer

This tool is provided solely for educational and research objectives. It aims to assist cybersecurity experts in analyzing and understanding Telegram bot interactions. Any use for unlawful purposes or unauthorized access is strictly prohibited.

**If you do not accept these conditions, please refrain from using this tool.**

## Features

### Core Functionality

- **Real-time Chat Interface**: Interactive messaging with Telegram bots
- **Multi-media Support**: Send and receive photos, videos, documents, voice messages, GIFs, and contacts
- **Message Threading**: Reply to messages with visual reply indicators
- **File Management**: Upload and download files with preview capabilities
- **Contact Sharing**: Send contact information directly through the chat
- **Message Forwarding**: Forward messages between chats with detailed statistics

## Getting Started

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Seadox/Zerogram-UI.git
cd Zerogram-UI
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Usage

### Basic Chat Operations

1. **Send Messages**: Type in the message input and press Enter or click Send
2. **Reply to Messages**: Click the reply button on any message
3. **Send Files**: Use the attachment button or drag files into the chat area
4. **Voice Messages**: Hold the microphone button to record voice messages

### File Sharing

- **Images/Photos**: Direct upload with optional captions
- **Videos**: Upload with preview and caption support
- **Documents**: PDF, DOC, TXT, ZIP files
- **Voice Messages**: Real-time audio recording

### Advanced Features

- **Message Forwarding**: Set up source and target chats for automated forwarding
- **Rate Limit Handling**: Automatic pause and resume on API limits
- **Bulk Operations**: Export multiple messages and manage large conversations

## API Integration

The application integrates with the Telegram Bot API, providing:

- Message sending/receiving
- File upload/download
- Chat information retrieval
- Bot management
- Error handling and rate limiting

## License

This project is open source under the MIT License.
