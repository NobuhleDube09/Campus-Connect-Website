// ===== API CONFIGURATION =====
const API_URL = 'http://172.16.16.77:3000';

// ===== OPEN LOGIN MODAL =====
function openLoginModal(type) {
    if (type === 'seeker') {
        document.getElementById('seekerModal').style.display = 'flex';
    } else if (type === 'provider') {
        document.getElementById('providerModal').style.display = 'flex';
    }
}

// ===== CLOSE MODAL =====
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    if (modalId === 'seekerModal') {
        const form = document.getElementById('seekerLoginForm');
        if (form) form.reset();
        const msgEl = document.getElementById('seekerLoginMessage');
        if (msgEl) msgEl.innerText = '';
    } else if (modalId === 'providerModal') {
        const form = document.getElementById('providerLoginForm');
        if (form) form.reset();
        const msgEl = document.getElementById('providerLoginMessage');
        if (msgEl) msgEl.innerText = '';
    }
}

// ===== CLOSE MODAL WHEN CLICKING OUTSIDE =====
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// ===== SERVICE SEEKER LOGIN =====
const seekerForm = document.getElementById('seekerLoginForm');
if (seekerForm) {
    seekerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('seekerEmail').value;
        const password = document.getElementById('seekerPassword').value;
        const messageEl = document.getElementById('seekerLoginMessage');
        
        messageEl.innerText = 'Logging in...';
        messageEl.style.color = 'blue';
        
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                messageEl.innerText = '✅ Login successful! Redirecting...';
                messageEl.style.color = 'green';
                
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userName', data.user.fullName);
                
                setTimeout(() => {
                    closeModal('seekerModal');
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                messageEl.innerText = data.message || '❌ Login failed. Please check your credentials.';
                messageEl.style.color = 'red';
            }
        } catch (error) {
            console.error('Login error:', error);
            messageEl.innerText = '❌ Cannot connect to server. Make sure backend is running on port 3000';
            messageEl.style.color = 'red';
        }
    });
}

// ===== SERVICE PROVIDER LOGIN =====
const providerFormElement = document.getElementById('providerLoginForm');
if (providerFormElement) {
    providerFormElement.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('providerEmail').value;
        const password = document.getElementById('providerPassword').value;
        const messageEl = document.getElementById('providerLoginMessage');
        
        messageEl.innerText = 'Logging in...';
        messageEl.style.color = 'blue';
        
        try {
            const response = await fetch(`${API_URL}/provider/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                messageEl.innerText = '✅ Login successful! Redirecting...';
                messageEl.style.color = 'green';
                
                localStorage.setItem('providerEmail', email);
                localStorage.setItem('providerName', data.provider.fullName);
                
                setTimeout(() => {
                    closeModal('providerModal');
                    window.location.href = 'providerDashboard.html';
                }, 1500);
            } else {
                messageEl.innerText = data.message || '❌ Login failed. Please check your credentials.';
                messageEl.style.color = 'red';
            }
        } catch (error) {
            console.error('Login error:', error);
            messageEl.innerText = '❌ Cannot connect to server. Make sure backend is running on port 3000';
            messageEl.style.color = 'red';
        }
    });
}