// Function to go back to the previous page or dashboard
function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "dashboard.html"; // Redirect to dashboard if history is not available
  }
}

// Function to send a message
function sendMessage() {
  const messageText = document.getElementById('message-input').value;
  const mediaFile = document.getElementById('media-file').files[0];

  // Get receiverId from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const receiverId = urlParams.get('receiverId'); // Get receiverId from URL

  // Construct the chatId
  const chatId = `${firebase.auth().currentUser.uid}_${receiverId}`;

  if (messageText.trim() === "" && !mediaFile) {
    alert("Please enter a message or select a media file!");
    return;
  }

  // Send message with optional media
  storeMessage(receiverId, messageText, mediaFile);
  document.getElementById('message-input').value = ''; // Clear message input
}

// Function to store a message in localStorage
function storeMessage(receiverId, messageText, mediaFile) {
  const senderId = firebase.auth().currentUser.uid; // Get the current user ID
  const senderName = firebase.auth().currentUser.displayName || "Unknown User";
  const timestamp = new Date().toISOString();

  // Prepare message object
  const message = {
    senderId: senderId,
    senderName: senderName,
    timestamp: timestamp,
    message: messageText,
    reactions: [],
    mediaUrl: mediaFile ? URL.createObjectURL(mediaFile) : "" // Convert file to URL if present
  };

  // Construct chat ID (combining sender and receiver IDs)
  const chatId = `${senderId}_${receiverId}`;

  // Retrieve existing chats from localStorage, or initialize an empty array
  let chats = JSON.parse(localStorage.getItem("chats")) || {};

  // If the chat doesn't exist, initialize it
  if (!chats[chatId]) {
    chats[chatId] = [];
  }

  // Add the new message to the chat
  chats[chatId].push(message);

  // Save back to localStorage
  localStorage.setItem("chats", JSON.stringify(chats));

  // Refresh the chat window
  displayMessages(chatId);
}

// Function to display messages in the chat window
function displayMessages(chatId) {
  const chats = JSON.parse(localStorage.getItem("chats")) || {}; 
  const chatMessages = chats[chatId] || [];
  const messagesContainer = document.getElementById("messages-container");

  // Clear existing messages
  messagesContainer.innerHTML = '';

  // Loop through the messages and render them
  chatMessages.forEach((msg) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");

    messageElement.innerHTML = `
      <div class="message-header">
        <strong>${msg.senderName}</strong> <span>${new Date(msg.timestamp).toLocaleString()}</span>
      </div>
      <p>${msg.message}</p>
      ${msg.mediaUrl ? `<img src="${msg.mediaUrl}" class="message-media" />` : ''}
      <div class="reactions">
        ${renderReactions(msg.reactions, chatId, msg.timestamp)}
      </div>
    `;
    
    messagesContainer.appendChild(messageElement);
  });

  // Scroll to the bottom of the chat window after displaying new messages
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Function to render reaction buttons for each message
function renderReactions(reactions, chatId, messageTimestamp) {
  const reactionButtons = ['👍', '❤️', '😂', '😢', '😡']; // Example reactions
  let reactionHTML = '';

  reactionButtons.forEach(reaction => {
    const isReacted = reactions.includes(reaction);
    reactionHTML += `
      <button onclick="reactToMessage('${reaction}', '${chatId}', '${messageTimestamp}')">
        ${reaction} ${isReacted ? '✓' : ''}
      </button>
    `;
  });

  return reactionHTML;
}

// Function to react to a message
function reactToMessage(reaction, chatId, messageTimestamp) {
  const chats = JSON.parse(localStorage.getItem("chats")) || {}; 
  const chatMessages = chats[chatId] || [];

  // Find the message by timestamp
  const message = chatMessages.find(m => m.timestamp === messageTimestamp);

  if (message) {
    // Check if the user has already reacted
    if (message.reactions.includes(reaction)) {
      // If reacted, remove the reaction
      message.reactions = message.reactions.filter(r => r !== reaction);
    } else {
      // Add the new reaction
      message.reactions.push(reaction);
    }

    // Save the updated chat to localStorage
    localStorage.setItem("chats", JSON.stringify(chats));

    // Update the UI (or refresh the messages)
    displayMessages(chatId);
  }
}

// Load the messages for a given chat when the page is loaded
window.onload = function() {
  // Get receiverId from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const receiverId = urlParams.get('receiverId'); // Get receiverId from URL

  // Construct the chatId
  const chatId = `${firebase.auth().currentUser.uid}_${receiverId}`;

  displayMessages(chatId); // Display messages for the selected chat
};
