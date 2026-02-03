// DOM Elements
const chatButton = document.getElementById('chatButton');
const chatWindow = document.getElementById('chatWindow');
const closeWindowBtn = document.getElementById('closeWindowBtn');
const minimizeBtn = document.getElementById('minimizeBtn');
const chatBody = document.getElementById('chatBody');
const messagesContainer = document.getElementById('messagesContainer');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const welcomeMessage = document.getElementById('welcomeMessage');
const quickQuestions = document.getElementById('quickQuestions');
const notificationBadge = document.getElementById('notificationBadge');

// State
let messageCount = 0;

// Bot Avatar SVG
const botAvatarSVG = `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
</svg>
`;

// Predefined Responses
const responses = {
    "what is phishing?": "Phishing is a cybercrime where attackers pretend to be trustworthy sources to steal sensitive information like passwords, credit card numbers, or personal data.",
    "is this website safe?": "Check for HTTPS, spelling errors, SSL certificate, professional design, and valid contact info.",
    "how to create strong passwords?": "Use 12+ characters, mix symbols, avoid personal info, use unique passwords and enable 2FA.",
    "cyberbullying": "Do not respond, block the bully, save evidence, report it, and call cyber crime helpline 1930."
};

// Initialize
function init() {
    setupEventListeners();
    loadChatHistory();
}

// Event Listeners
function setupEventListeners() {
    chatButton.addEventListener('click', openChat);
    closeWindowBtn.addEventListener('click', closeChat);
    minimizeBtn.addEventListener('click', toggleMinimize);

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    document.querySelectorAll('.quick-question-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            sendUserMessage(btn.dataset.question);
        });
    });
}

// Chat controls
function openChat() {
    chatWindow.classList.add('active');
    chatButton.classList.add('hidden');
    chatInput.focus();
    resetNotificationBadge();
}

function closeChat() {
    chatWindow.classList.remove('active');
    chatButton.classList.remove('hidden');
}

function toggleMinimize() {
    chatWindow.classList.toggle('minimized');
}

// Messaging
function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
        sendUserMessage(message);
        chatInput.value = '';
    }
}

function sendUserMessage(text) {
    if (messageCount === 0) {
        welcomeMessage.style.display = 'none';
        quickQuestions.style.display = 'none';
    }

    addMessage(text, 'user');

    typingIndicator.classList.add('active');
    scrollToBottom();

    setTimeout(() => {
        typingIndicator.classList.remove('active');
        addMessage(getBotResponse(text), 'bot');

        if (!chatWindow.classList.contains('active')) {
            showNotification();
        }
    }, 1200);
}

// 🔥 UPDATED FUNCTION WITH FEEDBACK BUTTONS
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;

    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = getCurrentTime();

    if (sender === 'bot') {
        avatar.innerHTML = botAvatarSVG;

        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'feedback-actions';

        const likeBtn = document.createElement('button');
        likeBtn.type = 'button'; 
        likeBtn.className = 'feedback-btn';
        likeBtn.innerHTML = '👍';

        const dislikeBtn = document.createElement('button');
        dislikeBtn.type = 'button';  
        dislikeBtn.className = 'feedback-btn dislike';
        dislikeBtn.innerHTML = '👎';

        likeBtn.onclick = () => {
    likeBtn.style.display = 'inline-block';  // show like
    dislikeBtn.style.display = 'none';       // hide dislike
};

dislikeBtn.onclick = () => {
    dislikeBtn.style.display = 'inline-block'; // show dislike
    likeBtn.style.display = 'none';            // hide like
};


        feedbackDiv.appendChild(likeBtn);
        feedbackDiv.appendChild(dislikeBtn);

        contentDiv.appendChild(bubble);
        contentDiv.appendChild(time);
        contentDiv.appendChild(feedbackDiv);
    } else {
        avatar.textContent = 'U';
        contentDiv.appendChild(bubble);
        contentDiv.appendChild(time);
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);

    messageCount++;
    scrollToBottom();
    saveChatHistory();
}

// Bot logic
function getBotResponse(msg) {
    const text = msg.toLowerCase();
    for (let key in responses) {
        if (text.includes(key)) return responses[key];
    }
    if (text.includes('hi') || text.includes('hello')) return "Hello 👋 I'm Saanvi, your Cyber Safety Assistant.";
    if (text.includes('thank')) return "You're welcome! Stay safe online 🛡️";
    return "Ask me about phishing, password safety, cyberbullying, or website security.";
}

// Notifications
function showNotification() {
    notificationBadge.textContent = (parseInt(notificationBadge.textContent) || 0) + 1;
    notificationBadge.style.display = 'flex';
}

function resetNotificationBadge() {
    notificationBadge.textContent = '0';
    notificationBadge.style.display = 'none';
}

// Utils
function getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function scrollToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Storage
function saveChatHistory() {
    const messages = Array.from(messagesContainer.children).map(msg => ({
        sender: msg.classList.contains('user') ? 'user' : 'bot',
        text: msg.querySelector('.message-bubble').textContent,
        time: msg.querySelector('.message-time').textContent
    }));
    localStorage.setItem('chatMessages', JSON.stringify(messages));
}

function loadChatHistory() {
    const data = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    data.forEach(m => addMessageFromHistory(m.text, m.sender, m.time));
}

// History load (with feedback buttons)
function addMessageFromHistory(text, sender, time) {
    addMessage(text, sender);
}

// Init
document.addEventListener('DOMContentLoaded', init);
