// ===== API CONFIGURATION - USING LOCAL SQL SERVER =====
const API_URL = 'http://172.16.16.77:3000';

// ===== SIDEBAR FUNCTIONS =====
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
    if (overlay) {
        overlay.classList.toggle('active');
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) {
        sidebar.classList.remove('active');
    }
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// ===== LOGOUT FUNCTION =====
function logout() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('providerEmail');
    window.location.href = 'index.html';
}

// ===== LOAD USER DATA =====
async function loadUserData(email) {
    try {
        const response = await fetch(`${API_URL}/user/${encodeURIComponent(email)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.success) {
            const user = data.user;

            const fullNameElem = document.getElementById('full-name');
            const studentIdElem = document.getElementById('student-id');
            const userEmailElem = document.getElementById('user-email');
            const serviceNeededElem = document.getElementById('service-needed');
            const profileImageElem = document.getElementById('profileImage');
            
            if (fullNameElem) fullNameElem.innerText = `${user.fullname} ${user.surname}`;
            if (studentIdElem) studentIdElem.innerText = user.studentnumber || 'Not provided';
            if (userEmailElem) userEmailElem.innerText = user.email;
            if (serviceNeededElem) serviceNeededElem.innerText = user.serviceneeded || 'Not specified';

            if (profileImageElem) {
                const initials = `${user.fullname.charAt(0)}${user.surname.charAt(0)}`;
                profileImageElem.src = `https://ui-avatars.com/api/?background=2563eb&color=fff&size=120&name=${initials}`;
            }
        } else {
            console.error('Failed to load user data:', data.message);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        const fullNameElem = document.getElementById('full-name');
        if (fullNameElem) fullNameElem.innerText = 'Error loading data';
    }
}

// ===== LOAD PROVIDERS =====
async function loadProviders() {
    try {
        const response = await fetch(`${API_URL}/providers`);
        
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
        if (container) container.innerHTML = '<div class="error">Error connecting to server. Make sure the backend is running on port 3000</div>';
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
        <div class="provider-card" onclick="viewProvider(${provider.id})">
            <div class="provider-icon">
                <i class="fas fa-user-circle"></i>
            </div>
            <h4>${escapeHtml(provider.fullname)} ${escapeHtml(provider.surname)}</h4>
            <p><i class="fas fa-tag"></i> ${escapeHtml(provider.servicetype)}</p>
            <div class="rating">
                <i class="fas fa-star"></i> ${provider.rating || 'New'}
            </div>
            <button class="btn-view" onclick="event.stopPropagation(); viewProvider(${provider.id})">
                View Profile
            </button>
        </div>
    `).join('');
}

// ===== HELPER: ESCAPE HTML =====
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
}

// ===== SEARCH SERVICES =====
async function searchServices() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim().toLowerCase();
    
    if (!query) {
        await loadProviders();
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/providers`);
        const data = await response.json();
        
        if (data.success && data.providers) {
            const filteredProviders = data.providers.filter(provider => {
                return (
                    (provider.fullname && provider.fullname.toLowerCase().includes(query)) ||
                    (provider.surname && provider.surname.toLowerCase().includes(query)) ||
                    (provider.servicetype && provider.servicetype.toLowerCase().includes(query)) ||
                    (provider.bio && provider.bio.toLowerCase().includes(query)) ||
                    (provider.campus && provider.campus.toLowerCase().includes(query))
                );
            });
            
            displayProviders(filteredProviders);
            
            const container = document.getElementById('providers-list');
            if (filteredProviders.length === 0) {
                container.innerHTML = `
                    <div class="no-results-message">
                        <i class="fas fa-frown" style="font-size: 48px; margin-bottom: 15px;"></i>
                        <h3>Sorry, we don't offer "${query}" yet</h3>
                        <p>We're constantly adding new services! Here are some suggestions:</p>
                        <ul style="list-style: none; margin-top: 15px;">
                            <li>🔍 Try a different keyword</li>
                            <li>📚 Check out our popular categories above</li>
                            <li>💡 Be the first to request this service</li>
                        </ul>
                        <button onclick="resetToAllProviders()" class="btn-reset" style="margin-top: 20px; padding: 10px 20px; background: #2eb997; color: white; border: none; border-radius: 8px; cursor: pointer;">
                            Browse All Services
                        </button>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error searching providers:', error);
        const container = document.getElementById('providers-list');
        if (container) {
            container.innerHTML = '<div class="error">Error searching. Please try again.</div>';
        }
    }
}

// ===== FILTER BY CATEGORY =====
async function filterByCategory(category) {
    try {
        const response = await fetch(`${API_URL}/providers`);
        const data = await response.json();
        
        if (data.success && data.providers) {
            const filteredProviders = data.providers.filter(provider => 
                provider.servicetype && provider.servicetype.toLowerCase() === category.toLowerCase()
            );
            
            displayProviders(filteredProviders);
            
            const container = document.getElementById('providers-list');
            if (filteredProviders.length === 0) {
                const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
                container.innerHTML = `
                    <div class="no-results-message">
                        <i class="fas fa-tools" style="font-size: 48px; margin-bottom: 15px;"></i>
                        <h3>No ${categoryName} providers available yet</h3>
                        <p>We're growing our community! Check back soon or explore other categories:</p>
                        <div style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
                            <button onclick="filterByCategory('tutoring')" class="suggestion-btn">📚 Tutoring</button>
                            <button onclick="filterByCategory('photography')" class="suggestion-btn">📸 Photography</button>
                            <button onclick="filterByCategory('design')" class="suggestion-btn">🎨 Graphic Design</button>
                            <button onclick="filterByCategory('beauty')" class="suggestion-btn">💇 Hair & Beauty</button>
                        </div>
                        <button onclick="resetToAllProviders()" class="btn-reset" style="margin-top: 20px; padding: 10px 20px; background: #2eb997; color: white; border: none; border-radius: 8px; cursor: pointer;">
                            View All Services
                        </button>
                    </div>
                `;
            } else {
                document.querySelector('.providers-section')?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    } catch (error) {
        console.error('Error filtering providers:', error);
    }
}

// ===== RESET TO ALL PROVIDERS =====
async function resetToAllProviders() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    await loadProviders();
}

// ===== HANDLE ENTER KEY =====
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        searchServices();
    }
}

// ===== BROWSE ALL PROVIDERS (MODAL) =====
function browseAllProviders() {
    const modal = document.getElementById('providersModal');
    if (modal) {
        modal.style.display = 'block';
        loadAllProvidersForModal();
    }
}

async function loadAllProvidersForModal() {
    try {
        const response = await fetch(`${API_URL}/providers`);
        const data = await response.json();
        
        const container = document.getElementById('modalProvidersList');
        if (container && data.success && data.providers) {
            container.innerHTML = data.providers.map(provider => `
                <div class="provider-modal-card" onclick="viewProvider(${provider.id})">
                    <strong>${escapeHtml(provider.fullname)} ${escapeHtml(provider.surname)}</strong>
                    <br><small>⭐ ${provider.rating || 'New'} | ${escapeHtml(provider.servicetype)}</small>
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
function editProfile() { alert('Edit Profile feature coming soon'); }
function viewFavorites() { alert('Favorites feature coming soon'); }
function viewBookings() { alert('Bookings feature coming soon'); }
function viewAllRecommended() { alert('View all recommendations coming soon'); }
function openMessages() { alert('Messages feature coming soon'); }
function openSaved() { alert('Saved listings feature coming soon'); }
function openSettings() { alert('Settings feature coming soon'); }

// ===== CLOSE MODAL WHEN CLICKING OUTSIDE =====
window.onclick = function(event) {
    const modal = document.getElementById('providersModal');
    if (event.target == modal) {
        closeProvidersModal();
    }
}

// ===== DOM CONTENT LOADED - MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const userEmail = urlParams.get('email');

    if (userEmail) {
        await loadUserData(userEmail);
        await loadProviders();
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
});