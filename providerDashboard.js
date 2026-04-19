// ========== PROVIDER DASHBOARD JS ==========

// Get email from URL
const urlParams = new URLSearchParams(window.location.search);
const providerEmail = urlParams.get('email');

// DOM Elements
let bookingsCount = 0;
let servicesCount = 0;
let providerData = null;

// Load provider data when page loads
document.addEventListener('DOMContentLoaded', async () => {
    if (providerEmail) {
        await loadProviderData(providerEmail);
        await loadProviderServices(providerEmail);
        localStorage.setItem('providerEmail', providerEmail);
    } else {
        const savedEmail = localStorage.getItem('providerEmail');
        if (savedEmail) {
            await loadProviderData(savedEmail);
            await loadProviderServices(savedEmail);
        } else {
            window.location.href = 'index.html';
        }
    }
    
    setupEventListeners();
    updateUI();
});

// Load provider data from backend
async function loadProviderData(email) {
    try {
        const response = await fetch(`http://localhost:3000/provider/${encodeURIComponent(email)}`);
        const data = await response.json();
        
        if (data.success) {
            providerData = data.provider;
            
            // Update profile modal fields
            const fullNameInput = document.getElementById('fullNameInput');
            const emailInput = document.getElementById('emailInput');
            if (fullNameInput) fullNameInput.value = `${providerData.FullName} ${providerData.Surname}`;
            if (emailInput) emailInput.value = providerData.Email;
            
            // Update stats
            servicesCount = providerData.ServiceType ? 1 : 0;
            updateUI();
            
            // Update profile circle initials
            const initials = `${providerData.FullName.charAt(0)}${providerData.Surname.charAt(0)}`;
            const avatarPreview = document.getElementById('avatarPreviewText');
            if (avatarPreview) avatarPreview.innerText = initials;
        }
    } catch (error) {
        console.error('Error loading provider data:', error);
        showToast('Failed to load provider data');
    }
}

// Load provider services
async function loadProviderServices(email) {
    try {
        const response = await fetch(`http://localhost:3000/provider-services/${encodeURIComponent(email)}`);
        const data = await response.json();
        
        if (data.success && data.services) {
            servicesCount = data.services.length;
            updateUI();
        }
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

// Update UI elements
function updateUI() {
    const bookingsEl = document.getElementById('bookingsCount');
    const servicesEl = document.getElementById('servicesCount');
    const progressPercentSpan = document.getElementById('progressPercent');
    const progressFillDiv = document.getElementById('progressFill');
    const progressMsgSpan = document.getElementById('progressMessage');
    
    if (bookingsEl) bookingsEl.innerText = bookingsCount;
    if (servicesEl) servicesEl.innerText = servicesCount;
    
    // Calculate progress based on services
    let progressPercent = Math.min(30 + (servicesCount * 15), 100);
    if (progressPercentSpan) progressPercentSpan.innerText = progressPercent + '%';
    if (progressFillDiv) progressFillDiv.style.width = progressPercent + '%';
    
    // Update progress message
    if (progressMsgSpan) {
        if (progressPercent >= 65) {
            progressMsgSpan.innerHTML = '🎯 You\'re on track with your goals!';
        } else if (progressPercent >= 40) {
            progressMsgSpan.innerHTML = '📚 Keep going! You\'re making steady progress.';
        } else {
            progressMsgSpan.innerHTML = '🌱 Start posting services to boost progress.';
        }
    }
}

// Show toast message
function showToast(message, duration = 2000) {
    let existingToast = document.querySelector('.toast-msg');
    if (existingToast) existingToast.remove();
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Setup event listeners
function setupEventListeners() {
    // Add Service button
    const addServiceBtn = document.getElementById('addServiceBtn');
    if (addServiceBtn) {
        addServiceBtn.addEventListener('click', () => {
            window.location.href = 'startHustle.html';
        });
    }
    
    // Sidebar Add Service
    const sidebarAddService = document.getElementById('sidebarAddService');
    if (sidebarAddService) {
        sidebarAddService.addEventListener('click', () => {
            window.location.href = 'startHustle.html';
        });
    }
    
    // View Bookings
    const viewBookingsBtn = document.getElementById('viewBookingsBtn');
    if (viewBookingsBtn) {
        viewBookingsBtn.addEventListener('click', () => {
            showToast(`📅 You have ${bookingsCount} upcoming bookings`);
        });
    }
    
    // Sidebar View Bookings
    const sidebarViewBookings = document.getElementById('sidebarViewBookings');
    if (sidebarViewBookings) {
        sidebarViewBookings.addEventListener('click', () => {
            showToast(`📅 You have ${bookingsCount} upcoming bookings`);
        });
    }
    
    // Check Notifications
    const checkNotifBtn = document.getElementById('checkNotifBtn');
    if (checkNotifBtn) {
        checkNotifBtn.addEventListener('click', () => {
            showToast('🔔 No new notifications');
        });
    }
    
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('providerEmail');
            showToast('Logged out successfully!');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    }
}

// Save profile changes
async function saveProfileChanges() {
    const fullNameInput = document.getElementById('fullNameInput');
    
    if (!fullNameInput) return;
    
    const nameParts = fullNameInput.value.trim().split(' ');
    const fullName = nameParts[0] || '';
    const surname = nameParts.slice(1).join(' ') || '';
    
    try {
        const response = await fetch('http://localhost:3000/provider/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: providerEmail,
                fullName: fullName,
                surname: surname,
                bio: providerData?.Bio || '',
                hourlyRate: providerData?.HourlyRate || 0,
                campus: providerData?.Campus || '',
                availability: providerData?.Availability || ''
            })
        });
        
        const data = await response.json();
        if (data.success) {
            showToast('Profile updated successfully!');
            // Reload provider data
            await loadProviderData(providerEmail);
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        showToast('Error saving profile');
    }
}

// Make saveProfileChanges available globally for the save button
window.saveProfileChanges = saveProfileChanges;

// Toast styling
const style = document.createElement('style');
style.textContent = `
    .toast-msg {
        position: fixed;
        bottom: 25px;
        left: 50%;
        transform: translateX(-50%);
        background: #1f2e3a;
        color: white;
        padding: 0.7rem 1.5rem;
        border-radius: 60px;
        font-size: 0.85rem;
        z-index: 1000;
        box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        transition: opacity 0.2s;
        pointer-events: none;
        font-family: monospace;
    }
`;
document.head.appendChild(style);