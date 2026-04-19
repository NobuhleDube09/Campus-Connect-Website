//function openSignup() {
  //document.getElementById("signupModal").style.display = "flex";
//

//function closeSignup() {
  //document.getElementById("signupModal").style.display = "none";}//

function openModal() {
    document.getElementById("signupModal").style.display = "block";
}

// Close Seeker Modal
function closeModal() {
    document.getElementById("signupModal").style.display = "none";
    document.getElementById("popupSignupForm").reset();
    document.getElementById("responseMessage").innerText = "";
}

// Open Provider Modal (Start Your Hustle)
function openProviderModal() {
    document.getElementById("providerModal").style.display = "block";
}

// Close Provider Modal
function closeProviderModal() {
    document.getElementById("providerModal").style.display = "none";
    document.getElementById("popupProviderForm").reset();
    document.getElementById("providerResponseMessage").innerText = "";
}

// ===== HANDLE SERVICE SEEKER SIGN UP =====
document.getElementById("popupSignupForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const fullName = document.getElementById("fullName").value;
    const surname = document.getElementById("surname").value;
    const email = document.getElementById("email").value;
    const studentNumber = document.getElementById("studentNumber").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const servicesNeeded = document.getElementById("servicesNeeded").value;
    
    const responseMsg = document.getElementById("responseMessage");
    
    if (password !== confirmPassword) {
        responseMsg.style.color = "red";
        responseMsg.innerText = "Passwords do not match!";
        return;
    }
    
    responseMsg.innerText = "Signing up...";
    responseMsg.style.color = "blue";
    
    try {
        const response = await fetch("http://localhost:3000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                fullName, 
                surname, 
                email, 
                password, 
                servicesNeeded,
                studentNumber 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            responseMsg.style.color = "green";
            responseMsg.innerText = "Success! Redirecting to dashboard...";
            setTimeout(() => {
                closeModal();
                window.location.href = `dashboard.html?email=${encodeURIComponent(email)}`;
            }, 1500);
        } else {
            responseMsg.style.color = "red";
            responseMsg.innerText = data.message || "Signup failed";
        }
    } catch (error) {
        console.error("Error:", error);
        responseMsg.style.color = "red";
        responseMsg.innerText = "Error signing up. Make sure server is running on port 3000";
    }
});

// ===== HANDLE SERVICE PROVIDER SIGN UP =====
document.getElementById("popupProviderForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const fullName = document.getElementById("providerFullName").value;
    const surname = document.getElementById("providerSurname").value;
    const email = document.getElementById("providerEmail").value;
    const studentNumber = document.getElementById("providerStudentNumber").value;
    const password = document.getElementById("providerPassword").value;
    const confirmPassword = document.getElementById("providerConfirmPassword").value;
    const serviceType = document.getElementById("serviceType").value;
    const bio = document.getElementById("bio").value;
    const hourlyRate = document.getElementById("hourlyRate").value;
    const campus = document.getElementById("providerCampus").value;
    const availability = document.getElementById("providerAvailability").value;
    
    const responseMsg = document.getElementById("providerResponseMessage");
    
    // Check if passwords match
    if (password !== confirmPassword) {
        responseMsg.style.color = "red";
        responseMsg.innerText = "Passwords do not match!";
        return;
    }
    
    responseMsg.innerText = "Signing up...";
    responseMsg.style.color = "blue";
    
    try {
        const response = await fetch("http://localhost:3000/provider/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                fullName, 
                surname, 
                email, 
                studentNumber, 
                password, 
                serviceType, 
                bio, 
                hourlyRate, 
                campus, 
                availability
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            responseMsg.style.color = "green";
            responseMsg.innerText = "Success! You are now a service provider!";
            setTimeout(() => {
                closeProviderModal();
                // Redirect to provider dashboard
                window.location.href = `providerDashboard.html?email=${encodeURIComponent(email)}`;
            }, 1500);
        } else {
            responseMsg.style.color = "red";
            responseMsg.innerText = data.message || "Signup failed";
        }
    } catch (error) {
        console.error("Error:", error);
        responseMsg.style.color = "red";
        responseMsg.innerText = "Error signing up. Make sure server is running on port 3000";
    }
});

// ===== UI FUNCTIONS =====

function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');
    if (navLinks) navLinks.classList.toggle('show');
    if (authButtons) authButtons.classList.toggle('show');
}

function showAlert(message) {
    alert(message + " feature coming soon!");
}

// Close modals when clicking outside
window.onclick = function(event) {
    const seekerModal = document.getElementById("signupModal");
    const providerModal = document.getElementById("providerModal");
    if (event.target == seekerModal) {
        closeModal();
    }
    if (event.target == providerModal) {
        closeProviderModal();
    }
}

// ===== CHATBOT FUNCTIONS =====

let isChatOpen = false;

function toggleChat() {
    const chatbot = document.getElementById('chatbot');
    if (!chatbot) return;
    isChatOpen = !isChatOpen;
    chatbot.classList.toggle('active');
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const message = input.value.trim();
    if (message === '') return;
    
    addMessage(message, 'user');
    input.value = '';
    
    setTimeout(() => {
        const response = getBotResponse(message);
        addMessage(response, 'bot');
    }, 500);
}

function sendQuickMessage(message) {
    addMessage(message, 'user');
    setTimeout(() => {
        const response = getBotResponse(message);
        addMessage(response, 'bot');
    }, 500);
}

function addMessage(message, sender) {
    const chatBody = document.getElementById('chat-body');
    if (!chatBody) return;
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
    
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function getBotResponse(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('sign up') || msg.includes('register')) {
        return "📝 To sign up, click the 'Sign Up' button on the homepage. You'll need your student email and student ID number. It's free!";
    } else if (msg.includes('list') || msg.includes('service') || msg.includes('hustle')) {
        return "💼 To list a service, click 'Start Your Hustle'. Fill in your service details, set your price, add photos, and publish! Students will see it immediately.";
    } else if (msg.includes('payment') || msg.includes('pay')) {
        return "💰 We accept Mobile Money, Credit/Debit cards, Bank Transfer, and Cash on pickup. All payments are secure and encrypted.";
    } else if (msg.includes('cancel') || msg.includes('order')) {
        return "❌ You can cancel an order within 24 hours from your 'My Orders' page. A full refund will be processed within 3-5 business days.";
    } else if (msg.includes('password') || msg.includes('forgot')) {
        return "🔑 If you forgot your password, click 'Forgot Password' on the login page. You'll receive a reset link in your email.";
    } else if (msg.includes('profile') || msg.includes('update')) {
        return "👤 Go to your Dashboard, click on your profile picture, and select 'Edit Profile' to update your information.";
    } else if (msg.includes('rating') || msg.includes('review')) {
        return "⭐ After a service is completed, you can rate the provider from 1-5 stars. Ratings help build trust in our community!";
    } else if (msg.includes('how it works')) {
        return "📚 Campus Connect connects students! Sign up, complete your profile, find or offer services, connect, and earn. Check the steps in our Help Center for more details!";
    } else {
        return "Thanks for your question! 🙏 Please check our FAQ section or ask something specific about signup, payments, listings, or cancellations.";
    }
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Close chat when clicking outside
document.addEventListener('click', function(event) {
    const chatbot = document.getElementById('chatbot');
    if (!chatbot) return;
    const isClickInside = chatbot.contains(event.target);
    
    if (!isClickInside && isChatOpen) {
        chatbot.classList.remove('active');
        isChatOpen = false;
    }
});