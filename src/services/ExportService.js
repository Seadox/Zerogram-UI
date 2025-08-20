import { format } from "date-fns";
import { renderEmojis } from "@/lib/emojiUtils";

export class ExportService {
  static async exportToCSV(allMessages, config) {
    const headers = [
      "Timestamp",
      "Sender",
      "Type",
      "Content",
      "File URL",
      "File Name",
    ];

    // Add metadata header
    const metadata = [
      `"Bot Token: ${config.bot_token}"`,
      `"Chat ID: ${config.chat_id}"`,
      `"Bot Link: https://t.me/${
        config.bot_token?.split(":")[0] || "unknown"
      }"`,
      `"Export Date: ${format(new Date(), "dd-MM-yyyy HH:mm:ss")}"`,
      `"Total Messages: ${allMessages.length}"`,
      '""', // Empty row for spacing
    ];

    const rows = allMessages.map((msg) => [
      `"${format(new Date(msg.timestamp), "dd-MM-yyyy HH:mm:ss")}"`,
      `"${msg.sender_name || "Unknown"}"`,
      `"${msg.message_type || "text"}"`,
      `"${(msg.content || "").replace(/"/g, '""')}"`,
      `"${msg.file_url || ""}"`,
      `"${msg.file_name || ""}"`,
    ]);

    const csvContent = [
      ...metadata,
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Add BOM for UTF-8 support
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `telegram_chat_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static async exportToPDF(allMessages, config) {
    try {
      const { default: jsPDF } = await import("jspdf");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Telegram Chat Export", margin, yPosition);
      yPosition += 15;

      // Metadata
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const metadata = [
        `Bot Token: ${config.bot_token}`,
        `Chat ID: ${config.chat_id}`,
        `Bot Link: https://t.me/${
          config.bot_token?.split(":")[0] || "unknown"
        }`,
        `Export Date: ${format(new Date(), "dd-MM-yyyy HH:mm:ss")}`,
        `Total Messages: ${allMessages.length}`,
      ];

      metadata.forEach((line) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 7;
      });

      yPosition += 10; // Extra spacing after metadata

      // Messages
      doc.setFontSize(9);

      allMessages.reverse().forEach((msg, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin;
        }

        // Message header
        const timestamp = format(new Date(msg.timestamp), "dd-MM-yyyy HH:mm");
        const sender = msg.sender_name || "Unknown";
        const type = msg.message_type || "text";

        doc.setFont("helvetica", "bold");
        doc.text(`[${timestamp}] ${sender} (${type})`, margin, yPosition);
        yPosition += 8;

        // Message content
        if (msg.content) {
          doc.setFont("helvetica", "normal");
          const cleanContent = renderEmojis(msg.content)
            .replace(/[\u{1F600}-\u{1F64F}]/gu, "[emoji]")
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, "[emoji]")
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, "[emoji]")
            .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, "[flag]")
            .replace(/[\u{2600}-\u{26FF}]/gu, "[symbol]")
            .replace(/[\u{2700}-\u{27BF}]/gu, "[symbol]");

          const splitText = doc.splitTextToSize(msg.content, maxWidth - 10);
          splitText.forEach((line) => {
            if (yPosition > pageHeight - margin) {
              doc.addPage();
              yPosition = margin;
            }
            doc.text(line, margin + 5, yPosition);
            yPosition += 6;
          });
        }

        // File info
        if (msg.file_url || msg.file_name) {
          doc.setFont("helvetica", "italic");
          doc.text(
            `File: ${msg.file_name || "Unknown"} - ${msg.file_url || "No URL"}`,
            margin + 5,
            yPosition
          );
          yPosition += 6;
        }

        yPosition += 5; // Spacing between messages
      });

      const fileName = `telegram_chat_${Date.now()}.pdf`;
      doc.save(fileName);
    } catch (error) {
      throw new Error("Failed to export PDF: " + error.message);
    }
  }

  static async exportToHTML(allMessages, config) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Telegram Chat Export</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .message {
            background: white;
            margin-bottom: 10px;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .message-header {
            font-weight: bold;
            color: #0088cc;
            margin-bottom: 5px;
        }
        .message-content {
            line-height: 1.4;
            white-space: pre-wrap;
        }
        .message-file {
            margin-top: 10px;
            padding: 10px;
            background: #f0f0f0;
            border-radius: 4px;
            font-size: 0.9em;
        }
        .timestamp {
            color: #666;
            font-size: 0.85em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Telegram Chat Export</h1>
        <p><strong>Bot Token:</strong> ${config.bot_token}</p>
        <p><strong>Chat ID:</strong> ${config.chat_id}</p>
        <p><strong>Bot Link:</strong> <a href="https://t.me/${
          config.bot_token?.split(":")[0] || "unknown"
        }">https://t.me/${config.bot_token?.split(":")[0] || "unknown"}</a></p>
        <p><strong>Export Date:</strong> ${format(
          new Date(),
          "dd-MM-yyyy HH:mm:ss"
        )}</p>
        <p><strong>Total Messages:</strong> ${allMessages.length}</p>
    </div>
    
    <div class="messages">
        ${allMessages
          .reverse()
          .map(
            (msg) => `
            <div class="message">
                <div class="message-header">
                    ${msg.sender_name || "Unknown"} 
                    <span class="timestamp">${format(
                      new Date(msg.timestamp),
                      "dd-MM-yyyy HH:mm:ss"
                    )}</span>
                </div>
                ${
                  msg.content
                    ? `<div class="message-content">${renderEmojis(
                        msg.content
                      ).replace(/\n/g, "<br>")}</div>`
                    : ""
                }
                ${
                  msg.file_url || msg.file_name
                    ? `<div class="message-file">
                        <strong>File:</strong> ${msg.file_name || "Unknown"}<br>
                        <strong>URL:</strong> <a href="${
                          msg.file_url || "#"
                        }">${msg.file_url || "No URL"}</a>
                    </div>`
                    : ""
                }
            </div>
        `
          )
          .join("")}
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `telegram_chat_${Date.now()}.html`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
