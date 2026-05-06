// ===== API CONFIGURATION =====
const API_URL = 'http://10.250.108.184:3000';

// ===== FAQ Accordion Functionality =====
function toggleFAQ(element) {
    const faqItem = element.closest('.faq-item');
    faqItem.classList.toggle('active');
}

// ===== Global Show Alert Function =====
function showAlert(pageName) {
    alert(`✨ Campus Connect • ${pageName} page\n\nThis is a demo navigation. The full experience will be available soon! 🎓`);
}

// ===== CHAT FUNCTIONS =====
function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.classList.toggle('active');
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message === '') return;
    
    // Add user message
    addChatMessage(message, 'user');
    input.value = '';
    
    // Get bot response
    setTimeout(() => {
        const response = getBotResponse(message);
        addChatMessage(response, 'bot');
    }, 500);
}

function quickReply(message) {
    addChatMessage(message, 'user');
    setTimeout(() => {
        const response = getBotResponse(message);
        addChatMessage(response, 'bot');
    }, 500);
}

function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    if (sender === 'bot') {
        messageDiv.innerHTML = `
            <div class="message-content">
                <i class="fas fa-robot"></i>
                <p>${escapeHtml(message)}</p>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${escapeHtml(message)}</p>
            </div>
        `;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function getBotResponse(message) {
    const msg = message.toLowerCase();
    
    const responses = {
        'sign up': "📝 To sign up, click the 'Sign Up' button on the homepage. You'll need your student email and student ID number. It's free!",
        'register': "📝 To sign up, click the 'Sign Up' button on the homepage. You'll need your student email and student ID number. It's free!",
        'list': "💼 To list a service, click 'Start Your Hustle' on the homepage. Fill in your service details, price, and availability, then publish!",
        'service': "💼 To list a service, click 'Start Your Hustle' on the homepage. Fill in your service details, price, and availability, then publish!",
        'hustle': "💼 To list a service, click 'Start Your Hustle' on the homepage. Fill in your service details, price, and availability, then publish!",
        'payment': "💰 We accept Mobile Money, Credit/Debit cards, Bank Transfer, and Cash on pickup. All payments are secure and encrypted.",
        'pay': "💰 We accept Mobile Money, Credit/Debit cards, Bank Transfer, and Cash on pickup. All payments are secure and encrypted.",
        'cancel': "❌ You can cancel an order within 24 hours from your 'My Orders' page. A full refund will be processed within 3-5 business days.",
        'order': "❌ You can cancel an order within 24 hours from your 'My Orders' page. A full refund will be processed within 3-5 business days.",
        'password': "🔑 If you forgot your password, click 'Forgot Password' on the login page. You'll receive a reset link in your email.",
        'forgot': "🔑 If you forgot your password, click 'Forgot Password' on the login page. You'll receive a reset link in your email.",
        'profile': "👤 Go to your Dashboard, click on your profile picture, and select 'Edit Profile' to update your information.",
        'update': "👤 Go to your Dashboard, click on your profile picture, and select 'Edit Profile' to update your information.",
        'rating': "⭐ After a service is completed, you can rate the provider from 1-5 stars. Ratings help build trust in our community!",
        'review': "⭐ After a service is completed, you can rate the provider from 1-5 stars. Ratings help build trust in our community!",
        'how it works': "📚 Campus Connect connects students! Sign up → Complete profile → Find or offer services → Connect and earn!",
        'hello': "👋 Hello! Welcome to Campus Connect! How can I help you today?",
        'hi': "👋 Hi there! Welcome to Campus Connect! Ask me anything about the platform."
    };
    
    for (const [key, response] of Object.entries(responses)) {
        if (msg.includes(key)) {
            return response;
        }
    }
    
    return "Thanks for your question! 🙏 Please check our FAQ section below or ask about: signup, services, payments, cancellations, or ratings. You can also click 'Contact' to reach our support team!";
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ===== Initialize Page =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('Help page loaded - Chat widget ready!');
    console.log('API URL:', API_URL);
});