// Utility function to properly render emojis including flags
export const renderEmojis = (text) => {
  if (!text) return text;

  // Convert Unicode escape sequences to actual emojis
  let processedText = text.replace(/\\u[\dA-F]{4}/gi, (match) => {
    return String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16));
  });

  // Handle flag emojis specifically - convert country codes to flags
  processedText = processedText.replace(
    /🇮🇱|\\uD83C\\uDDEE\\uD83C\\uDDF1/g,
    "🇮🇱"
  );
  processedText = processedText.replace(
    /🇺🇸|\\uD83C\\uDDFA\\uD83C\\uDDF8/g,
    "🇺🇸"
  );
  processedText = processedText.replace(
    /🇬🇧|\\uD83C\\uDDEC\\uD83C\\uDDE7/g,
    "🇬🇧"
  );
  processedText = processedText.replace(
    /🇩🇪|\\uD83C\\uDDE9\\uD83C\\uDDEA/g,
    "🇩🇪"
  );
  processedText = processedText.replace(
    /🇫🇷|\\uD83C\\uDDEB\\uD83C\\uDDF7/g,
    "🇫🇷"
  );
  processedText = processedText.replace(
    /🇯🇵|\\uD83C\\uDDEF\\uD83C\\uDDF5/g,
    "🇯🇵"
  );
  processedText = processedText.replace(
    /🇨🇳|\\uD83C\\uDDE8\\uD83C\\uDDF3/g,
    "🇨🇳"
  );
  processedText = processedText.replace(
    /🇮🇳|\\uD83C\\uDDEE\\uD83C\\uDDF3/g,
    "🇮🇳"
  );
  processedText = processedText.replace(
    /🇷🇺|\\uD83C\\uDDF7\\uD83C\\uDDFA/g,
    "🇷🇺"
  );
  processedText = processedText.replace(
    /🇧🇷|\\uD83C\\uDDE7\\uD83C\\uDDF7/g,
    "🇧🇷"
  );
  processedText = processedText.replace(
    /🇮🇹|\\uD83C\\uDDEE\\uD83C\\uDDF9/g,
    "🇮🇹"
  );
  processedText = processedText.replace(
    /🇪🇸|\\uD83C\\uDDEA\\uD83C\\uDDF8/g,
    "🇪🇸"
  );
  processedText = processedText.replace(
    /🇰🇷|\\uD83C\\uDDF0\\uD83C\\uDDF7/g,
    "🇰🇷"
  );
  processedText = processedText.replace(
    /🇨🇦|\\uD83C\\uDDE8\\uD83C\\uDDE6/g,
    "🇨🇦"
  );
  processedText = processedText.replace(
    /🇦🇺|\\uD83C\\uDDE6\\uD83C\\uDDFA/g,
    "🇦🇺"
  );

  return processedText;
};
