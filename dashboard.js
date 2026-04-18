document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userEmail = urlParams.get('email');

    if (userEmail) {
        await loadUserData(userEmail);
        await loadProviders();
        // Save email to localStorage for future visits
        localStorage.setItem('userEmail', userEmail);
    } else {
        const savedEmail = localStorage.getItem('userEmail');
        if (savedEmail) {
            await loadUserData(savedEmail);
            await loadProviders();
        } else {
            window.location.href = 'index.html';
        }
    }

    // ===== SIDEBAR TOGGLE =====
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (menuToggle && sidebar) {
        // Toggle sidebar when hamburger is clicked
        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            sidebar.classList.toggle("active");
            if (overlay) overlay.classList.toggle("active");
        });

        // Close sidebar when overlay is clicked
        if (overlay) {
            overlay.addEventListener("click", () => {
                sidebar.classList.remove("active");
                overlay.classList.remove("active");
            });
        }

        // Close sidebar when pressing Escape key
        document.addEventListener("keydown", (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains("active")) {
                sidebar.classList.remove("active");
                if (overlay) overlay.classList.remove("active");
            }
        });
    }

    // ===== LOGOUT =====
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('userEmail');
            window.location.href = 'index.html';
        });
    }
});

// ===== LOAD USER DATA =====
async function loadUserData(email) {
    try {
        const response = await fetch(`http://localhost:3000/user/${encodeURIComponent(email)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.success) {
            const user = data.user;

            // Update sidebar elements
            const fullNameElem = document.getElementById('full-name');
            const studentIdElem = document.getElementById('student-id');
            const userEmailElem = document.getElementById('user-email');
            const serviceNeededElem = document.getElementById('service-needed');
            const profileImageElem = document.getElementById('profileImage');
            
            if (fullNameElem) fullNameElem.innerText = `${user.FullName} ${user.Surname}`;
            if (studentIdElem) studentIdElem.innerText = user.StudentNumber || 'Not provided';
            if (userEmailElem) userEmailElem.innerText = user.Email;
            if (serviceNeededElem) serviceNeededElem.innerText = user.ServiceNeeded || 'Not specified';

            // Update profile image with initials
            if (profileImageElem) {
                const initials = `${user.FullName.charAt(0)}${user.Surname.charAt(0)}`;
                profileImageElem.src = `https://ui-avatars.com/api/?background=2563eb&color=fff&size=120&name=${initials}`;
            }
        } else {
            console.error('Failed to load user data:', data.message);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        // Show error in UI
        const fullNameElem = document.getElementById('full-name');
        if (fullNameElem) fullNameElem.innerText = 'Error loading data';
    }
}

// ===== LOAD PROVIDERS =====
async function loadProviders() {
    try {
        const response = await fetch('http://localhost:3000/providers');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.success && data.providers) {
            displayProviders(data.providers);
        } else {
            console.error('Failed to load providers:', data.message);
            const container = document.getElementById('providers-list');
            if (container) container.innerHTML = '<div class="error">Failed to load providers</div>';
        }
    } catch (error) {
        console.error('Error loading providers:', error);
        const container = document.getElementById('providers-list');
        if (container) container.innerHTML = '<div class="error">Error connecting to server. Make sure backend is running on port 3000</div>';
    }
}

// ===== DISPLAY PROVIDERS =====
function displayProviders(providers) {
    const container = document.getElementById('providers-list');
    if (!container) return;

    if (providers.length === 0) {
        container.innerHTML = '<div class="no-results">No providers available yet</div>';
        return;
    }

    container.innerHTML = providers.map(provider => `
        <div class="provider-card" onclick="viewProvider(${provider.Id})">
            <div class="provider-icon">
                <i class="fas fa-user-circle"></i>
            </div>
            <h4>${escapeHtml(provider.FullName)} ${escapeHtml(provider.Surname)}</h4>
            <p><i class="fas fa-tag"></i> ${escapeHtml(provider.ServiceType)}</p>
            <div class="rating">
                <i class="fas fa-star"></i> ${provider.Rating || 'New'}
            </div>
            <button class="btn-view" onclick="event.stopPropagation(); viewProvider(${provider.Id})">
                View Profile
            </button>
        </div>
    `).join('');
}

// ===== HELPER: Escape HTML to prevent XSS =====
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ===== VIEW PROVIDER DETAILS =====
function viewProvider(providerId) {
    alert(`Viewing provider ${providerId} - Full profile coming soon`);
    // You can implement a modal or redirect to provider profile page
}

// ===== FILTER BY CATEGORY =====
function filterByCategory(category) {
    alert(`Showing ${category} services`);
    // Implement filtering logic here
}

// ===== SEARCH SERVICES =====
function searchServices() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const query = searchInput.value;
        alert(`Searching for: ${query}`);
        // Implement search logic here
    }
}

// ===== BROWSE ALL PROVIDERS =====
function browseAllProviders() {
    const modal = document.getElementById('providersModal');
    if (modal) {
        modal.style.display = 'block';
        loadAllProvidersForModal();
    }
}

async function loadAllProvidersForModal() {
    try {
        const response = await fetch('http://localhost:3000/providers');
        const data = await response.json();
        
        const container = document.getElementById('modalProvidersList');
        if (container && data.success && data.providers) {
            container.innerHTML = data.providers.map(provider => `
                <div class="provider-modal-card" onclick="viewProvider(${provider.Id})">
                    <strong>${escapeHtml(provider.FullName)} ${escapeHtml(provider.Surname)}</strong>
                    <br><small>⭐ ${provider.Rating || 'New'} | ${escapeHtml(provider.ServiceType)}</small>
                    <hr>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading providers for modal:', error);
    }
}

function closeProvidersModal() {
    const modal = document.getElementById('providersModal');
    if (modal) modal.style.display = 'none';
}

// ===== OTHER FUNCTIONS =====
function editProfile() {
    alert('Edit Profile feature coming soon');
}

function viewFavorites() {
    alert('Favorites feature coming soon');
}

function viewBookings() {
    alert('Bookings feature coming soon');
}

function viewAllRecommended() {
    alert('View all recommendations coming soon');
}

function openMessages() {
    alert('Messages feature coming soon');
}

function openSaved() {
    alert('Saved listings feature coming soon');
}

function openSettings() {
    alert('Settings feature coming soon');
}

// ===== CLOSE MODAL WHEN CLICKING OUTSIDE =====
window.onclick = function(event) {
    const modal = document.getElementById('providersModal');
    if (event.target == modal) {
        closeProvidersModal();
    }
}