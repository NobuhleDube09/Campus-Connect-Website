// Open modal
function openModal() {
    document.getElementById("signupModal").style.display = "block";
}

// Close modal
function closeModal() {
    document.getElementById("signupModal").style.display = "none";
    document.getElementById("popupSignupForm").reset();
    document.getElementById("responseMessage").innerText = "";
}

// Handle form submission
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

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById("signupModal");
    if (event.target == modal) {
        closeModal();
    }
}

// Keep your existing functions (if any)
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');
    navLinks.classList.toggle('show');
    authButtons.classList.toggle('show');
}

function showAlert(message) {
    alert(message + " feature coming soon!");
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

// Handle Service Provider Sign Up
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
                alert("Welcome to Campus Connect! You can now start offering your services.");
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
function toggleChat() {
  const chat = document.getElementById("chatbot");
  chat.style.display = chat.style.display === "block" ? "none" : "block";
}

function handleKey(e) {
  if (e.key === "Enter") {
    let input = document.getElementById("chat-input");
    let message = input.value;

    let chatBody = document.getElementById("chat-body");
    chatBody.innerHTML += "<p><b>You:</b> " + message + "</p>";

    // Simple response logic
    if (message.toLowerCase().includes("how")) {
      chatBody.innerHTML += "<p><b>Bot:</b> We connect students to services easily.</p>";
    } else {
      chatBody.innerHTML += "<p><b>Bot:</b> I’m still learning 😅</p>";
    }

    input.value = "";
  }
}
