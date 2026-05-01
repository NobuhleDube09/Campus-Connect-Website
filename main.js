// ===== API CONFIGURATION =====
// Use your local backend
const API_URL = 'http://172.16.16.77:3000';

function openModal() {
    document.getElementById("signupModal").style.display = "block";
}

function closeModal() {
    document.getElementById("signupModal").style.display = "none";
    document.getElementById("popupSignupForm").reset();
    document.getElementById("responseMessage").innerText = "";
}

function openProviderModal() {
    document.getElementById("providerModal").style.display = "block";
}

function closeProviderModal() {
    document.getElementById("providerModal").style.display = "none";
    document.getElementById("popupProviderForm").reset();
    document.getElementById("providerResponseMessage").innerText = "";
}

// ===== HANDLE SERVICE SEEKER SIGN UP (with auto-login) =====
const signupForm = document.getElementById("popupSignupForm");
if (signupForm) {
    signupForm.addEventListener("submit", async function(e) {
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
        
        if (password.length < 6) {
            responseMsg.style.color = "red";
            responseMsg.innerText = "Password must be at least 6 characters!";
            return;
        }
        
        responseMsg.innerText = "Signing up...";
        responseMsg.style.color = "blue";
        
        try {
            // Step 1: Sign up
            const signupResponse = await fetch(`${API_URL}/signup`, {
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
            
            const signupData = await signupResponse.json();
            
            if (!signupData.success) {
                responseMsg.style.color = "red";
                responseMsg.innerText = signupData.message || "Signup failed";
                return;
            }
            
            responseMsg.innerText = "Signup successful! Logging you in...";
            
            // Step 2: Automatically login
            const loginResponse = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            
            const loginData = await loginResponse.json();
            
            if (loginData.success) {
                responseMsg.style.color = "green";
                responseMsg.innerText = "✅ Login successful! Redirecting to dashboard...";
                
                // Store user info
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userName', loginData.user.fullName);
                localStorage.setItem('userId', loginData.user.id);
                
                setTimeout(() => {
                    closeModal();
                    window.location.href = "dashboard.html";
                }, 1500);
            } else {
                // Signup worked but auto-login failed
                responseMsg.style.color = "orange";
                responseMsg.innerText = "Account created! Please login manually.";
                setTimeout(() => {
                    closeModal();
                    window.location.href = "login.html";
                }, 1500);
            }
        } catch (error) {
            console.error("Error:", error);
            responseMsg.style.color = "red";
            responseMsg.innerText = "❌ Cannot connect to server. Make sure your backend is running on localhost:3000";
        }
    });
}

// ===== HANDLE SERVICE PROVIDER SIGN UP (with auto-login) =====
const providerFormElement = document.getElementById("popupProviderForm");
if (providerFormElement) {
    providerFormElement.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById("providerFullName").value;
        const surname = document.getElementById("providerSurname").value;
        const email = document.getElementById("providerEmail").value;
        const studentNumber = document.getElementById("providerStudentNumber").value;
        const password = document.getElementById("providerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const serviceType = document.getElementById("serviceType").value;
        const bio = document.getElementById("bio").value;
        const hourlyRate = document.getElementById("hourlyRate").value;
        const campus = document.getElementById("providerCampus").value;
        const availability = document.getElementById("providerAvailability").value;
        
        const responseMsg = document.getElementById("providerResponseMessage");
        
        if (password !== confirmPassword) {
            responseMsg.style.color = "red";
            responseMsg.innerText = "Passwords do not match!";
            return;
        }
        
        if (password.length < 6) {
            responseMsg.style.color = "red";
            responseMsg.innerText = "Password must be at least 6 characters!";
            return;
        }
        
        responseMsg.innerText = "Signing up...";
        responseMsg.style.color = "blue";
        
        try {
            // Step 1: Sign up as provider
            const signupResponse = await fetch(`${API_URL}/provider/signup`, {
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
                    hourlyRate: parseFloat(hourlyRate), 
                    campus, 
                    availability
                })
            });
            
            const signupData = await signupResponse.json();
            
            if (!signupData.success) {
                responseMsg.style.color = "red";
                responseMsg.innerText = signupData.message || "Signup failed";
                return;
            }
            
            responseMsg.innerText = "Provider account created! Logging you in...";
            
            // Step 2: Auto-login as provider
            const loginResponse = await fetch(`${API_URL}/provider/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            
            const loginData = await loginResponse.json();
            
            if (loginData.success) {
                responseMsg.style.color = "green";
                responseMsg.innerText = "✅ Welcome! Redirecting to provider dashboard...";
                
                localStorage.setItem('providerEmail', email);
                localStorage.setItem('providerName', loginData.provider.fullName);
                
                setTimeout(() => {
                    closeProviderModal();
                    window.location.href = "providerDashboard.html";
                }, 1500);
            } else {
                responseMsg.style.color = "orange";
                responseMsg.innerText = "Account created! Please login manually.";
                setTimeout(() => {
                    closeProviderModal();
                    window.location.href = "login.html";
                }, 1500);
            }
        } catch (error) {
            console.error("Error:", error);
            responseMsg.style.color = "red";
            responseMsg.innerText = "❌ Cannot connect to server. Make sure backend is running.";
        }
    });
}

// ===== UI FUNCTIONS =====
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.toggle('show');
    }
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
function toggleChat() {
    const chatbot = document.getElementById('chatbot');
    if (!chatbot) return;
    chatbot.classList.toggle('minimized');
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
        return "📝 To sign up, click the 'Sign Up' button on the homepage. You'll need your email and password. It's free!";
    } else if (msg.includes('list') || msg.includes('service') || msg.includes('hustle')) {
        return "💼 To list a service, click 'Start Your Hustle'. Fill in your service details, set your price, and publish!";
    } else if (msg.includes('payment') || msg.includes('pay')) {
        return "💰 Payment options will be available soon. For now, arrange payment directly with the service provider.";
    } else if (msg.includes('cancel') || msg.includes('order')) {
        return "❌ Contact the service provider directly to cancel or modify your booking.";
    } else if (msg.includes('password') || msg.includes('forgot')) {
        return "🔑 If you forgot your password, please contact support to reset it.";
    } else {
        return "Thanks for your question! 🙏 Please check our FAQ or ask something specific about signup, services, or providers.";
    }
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