// Placeholder for chatbot logic 

// Chatbot Frontend Logic
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatMinimize = document.getElementById('chat-minimize');
const chatClose = document.getElementById('chat-close');
const chatContainer = document.getElementById('chat-container');
const sendButton = document.getElementById('send-button');
const typingIndicator = document.querySelector('.typing-indicator');

function displayMessage(html, sender) {
  // Using innerHTML is acceptable here because the bot's HTML content is trusted and generated
  // by our background script. Avoid using innerHTML with untrusted, user-provided strings
  // to prevent XSS vulnerabilities.
  const msgDiv = document.createElement('div');
  msgDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
  msgDiv.innerHTML = html;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function toggleForm(disabled) {
  userInput.disabled = disabled;
  sendButton.disabled = disabled;
}

// Handle form submission
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const messageText = userInput.value.trim();
  if (!messageText) return;
  displayMessage(messageText, 'user');
  chrome.runtime.sendMessage({ type: 'userMessage', text: messageText });
  userInput.value = '';
  toggleForm(true);
  typingIndicator.style.display = 'flex';
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Listen for bot responses
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'botMessage') {
    typingIndicator.style.display = 'none';
    displayMessage(message.html, 'bot');
    toggleForm(false);
    userInput.focus();
  }
});

// Event delegation for buttons in chat
chatMessages.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON' && e.target.dataset.value) {
    const value = e.target.dataset.value;
    displayMessage(e.target.textContent, 'user');
    chrome.runtime.sendMessage({ type: 'userMessage', text: value });
    toggleForm(true);
    typingIndicator.style.display = 'flex';
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});

// Handle dynamic pricing slider using event delegation
chatMessages.addEventListener('input', (e) => {
  if (e.target.id === 'hours-slider') {
    const slider = e.target;
    const rate = parseFloat(slider.dataset.rate);
    const hours = slider.value;

    // Find the related elements within the same component to update the UI
    const container = slider.closest('.pricing-component');
    if (container) {
      const hoursValue = container.querySelector('#hours-value');
      const priceValue = container.querySelector('#price-value');

      if (hoursValue) hoursValue.textContent = hours;
      if (priceValue) priceValue.textContent = (rate * hours).toFixed(0);
    }
  }
});

// Initial greeting
chrome.runtime.sendMessage({ type: 'requestGreeting' });
toggleForm(true);
typingIndicator.style.display = 'flex';

// Minimize/close logic
chatMinimize.addEventListener('click', () => {
  chatContainer.style.display = 'none';
  // Optionally, send a message to parent to show a minimized icon
});
chatClose.addEventListener('click', () => {
  if (window.parent !== window) {
    window.parent.document.getElementById('learning-concierge-iframe')?.remove();
  } else {
    window.close();
  }
}); 