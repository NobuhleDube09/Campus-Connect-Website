// ===== FAQ Accordion Functionality =====
const faqs = document.querySelectorAll(".faq");

faqs.forEach(faq => {
    faq.addEventListener("click", () => {
        // Toggle active class on clicked FAQ
        faq.classList.toggle("active");
        
        const answer = faq.querySelector(".answer");
        
        if (answer.style.display === "block") {
            answer.style.display = "none";
        } else {
            // Close other FAQs
            faqs.forEach(otherFaq => {
                if (otherFaq !== faq) {
                    otherFaq.classList.remove("active");
                    const otherAnswer = otherFaq.querySelector(".answer");
                    otherAnswer.style.display = "none";
                }
            });
            answer.style.display = "block";
        }
    });
});

// ===== Search FAQ Function =====
function searchFAQ() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const faqItems = document.querySelectorAll('.faq');
    
    faqItems.forEach(faq => {
        const question = faq.querySelector('.question').innerText.toLowerCase();
        const answer = faq.querySelector('.answer').innerText.toLowerCase();
        
        if (question.includes(searchInput) || answer.includes(searchInput)) {
            faq.style.display = 'block';
        } else {
            faq.style.display = 'none';
        }
    });
}

// ===== Filter by Category =====
function filterCategory(category) {
    const faqItems = document.querySelectorAll('.faq');
    const buttons = document.querySelectorAll('.category-btn');
    
    // Update active button
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.toLowerCase() === category || (category === 'all' && btn.innerText === 'All')) {
            btn.classList.add('active');
        }
    });
    
    faqItems.forEach(faq => {
        if (category === 'all') {
            faq.style.display = 'block';
        } else if (faq.getAttribute('data-category') === category) {
            faq.style.display = 'block';
        } else {
            faq.style.display = 'none';
        }
    });
}

// ===== Chatbot Functions =====
function toggleChatbot() {
    const modal = document.getElementById('chatbotModal');
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'flex';
    }
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message === '') return;
    
    // Add user message
    addMessage(message, 'user');
    input.value = '';
    
    // Simulate bot response
    setTimeout(() => {
        const response = getBotResponse(message);
        addMessage(response, 'bot');
    }, 500);
}

function addMessage(message, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (sender === 'bot') {
        messageDiv.innerHTML = `
            <div class="message-content">
                <i class="fas fa-robot"></i>
                <p>${message}</p>
            </div>
            <span class="message-time">${timeString}</span>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
            </div>
            <span class="message-time">${timeString}</span>
        `;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function getBotResponse(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('sign up') || msg.includes('register')) {
        return "To sign up, click the 'Sign Up' button on the homepage. You'll need your student email and student ID number.";
    } else if (msg.includes('list') || msg.includes('service') || msg.includes('hustle')) {
        return "To list a service, click 'Start Your Hustle' on the homepage. Fill in your service details, price, and availability, then publish!";
    } else if (msg.includes('payment') || msg.includes('pay')) {
        return "We accept Mobile Money, Credit/Debit cards, Bank Transfer, and Cash on pickup. All payments are secure and encrypted.";
    } else if (msg.includes('cancel') || msg.includes('order')) {
        return "You can cancel an order within 24 hours from your 'My Orders' page. A full refund will be processed within 3-5 business days.";
    } else if (msg.includes('password') || msg.includes('forgot')) {
        return "If you forgot your password, click 'Forgot Password' on the login page. You'll receive a reset link in your email.";
    } else if (msg.includes('profile') || msg.includes('update')) {
        return "Go to your Dashboard, click on your profile picture, and select 'Edit Profile' to update your information.";
    } else if (msg.includes('rating') || msg.includes('review')) {
        return "After a service is completed, you can rate the provider from 1-5 stars. Ratings help build trust in our community!";
    } else if (msg.includes('report') || msg.includes('user')) {
        return "To report a user, go to their profile and click 'Report User'. Our team will review within 24 hours.";
    } else {
        return "Thanks for your question! Please check our FAQ section or contact support for more specific help. 📚";
    }
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function quickReply(message) {
    document.getElementById('chatInput').value = message;
    sendMessage();
}

// ===== Contact Form Functions =====
function openContactForm() {
    const modal = document.getElementById('contactModal');
    modal.style.display = 'flex';
}

function closeContactForm() {
    const modal = document.getElementById('contactModal');
    modal.style.display = 'none';
}

// Handle contact form submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        const subject = document.getElementById('contactSubject').value;
        const message = document.getElementById('contactMessage').value;
        
        alert(`Thank you ${name}! Your message has been sent. We'll respond within 24 hours.`);
        closeContactForm();
        contactForm.reset();
    });
}

// Close modal when clicking outside
window.onclick = function(event) {
    const contactModal = document.getElementById('contactModal');
    const chatbotModal = document.getElementById('chatbotModal');
    
    if (event.target === contactModal) {
        closeContactForm();
    }
}
