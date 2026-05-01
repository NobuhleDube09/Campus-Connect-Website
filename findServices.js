// findServices.js - Clean resolved version

// ===== API CONFIGURATION - USING LOCAL SQL SERVER =====
const API_URL = 'http://172.16.16.77:3000';

//  Global Variables
let allServices = [];
let currentFilters = {
    search: '',
    campus: '',
    priceRange: '',
    category: 'all'
};

// ===== Calculate Monthly Rate from Hourly =====
function calculateMonthlyRate(hourlyRate) {
    if (!hourlyRate || hourlyRate === 'NaN' || isNaN(parseFloat(hourlyRate))) {
        return 0;
    }
    // Assuming 160 hours per month (20 days * 8 hours)
    return parseFloat(hourlyRate) * 160;
}

// ===== Format Currency =====
function formatCurrency(amount) {
    if (!amount || amount === 'NaN' || isNaN(amount)) {
        return '0';
    }
    return amount.toLocaleString('en-ZA');
}

//  Check if user is logged in 
function isUserLoggedIn() {
    const userEmail = localStorage.getItem('userEmail');
    const providerEmail = localStorage.getItem('providerEmail');
    return userEmail !== null || providerEmail !== null;
}

//  Get current user email 
function getCurrentUserEmail() {
    return localStorage.getItem('userEmail') || localStorage.getItem('providerEmail');
}

//  Test backend connection first 
async function testBackendConnection() {
    try {
        console.log('Testing connection to:', `${API_URL}/test`);
        const response = await fetch(`${API_URL}/test`);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend connected:', data);
            return true;
        }
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        return false;
    }
    return false;
}

//  Show connection error message 
function showConnectionError() {
    const grid = document.getElementById('servicesGrid');
    grid.innerHTML = `
        <div class="no-results">
            <i class="fas fa-server" style="font-size: 64px; color: #ef4444;"></i>
            <h3>Cannot Connect to Server</h3>
            <p>Unable to reach the backend server. Please make sure:</p>
            <ul style="text-align: left; display: inline-block; margin-top: 15px; color: #64748b;">
                <li>✓ The backend server is running on ${API_URL}</li>
                <li>✓ Your internet connection is active</li>
                <li>✓ The server computer is on the same network</li>
            </ul>
            <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #2eb997; color: white; border: none; border-radius: 8px; cursor: pointer;">
                <i class="fas fa-sync-alt"></i> Retry Connection
            </button>
        </div>
    `;
}

// ===== Load Services from Backend =====
async function loadServices() {
    try {
        showLoading();
        console.log('Loading services from:', `${API_URL}/providers`);
        const response = await fetch(`${API_URL}/providers`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Services data received:', data);
        
        if (data.success && data.providers) {
            allServices = data.providers;
            filterAndDisplayServices();
        } else {
            showError('Failed to load services');
        }
    } catch (error) {
        console.error('Error loading services:', error);
        showError('Error connecting to server. Make sure backend is running on port 3000');
    }
}

//  Setup Event Listeners 
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchServices();
        });
    }
    
    const campusFilter = document.getElementById('campusFilter');
    const priceFilter = document.getElementById('priceFilter');
    if (campusFilter) campusFilter.addEventListener('change', () => searchServices());
    if (priceFilter) priceFilter.addEventListener('change', () => searchServices());
}

//  Setup Category Filters 
function setupCategoryFilters() {
    const categoryChips = document.querySelectorAll('.category-chip');
    categoryChips.forEach(chip => {
        chip.addEventListener('click', () => {
            categoryChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentFilters.category = chip.getAttribute('data-category');
            filterAndDisplayServices();
        });
    });
}

// Filter and Display Services 
function filterAndDisplayServices() {
    let filtered = [...allServices];
    
    // Filter by search term
    if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        filtered = filtered.filter(service => 
            (service.FullName?.toLowerCase().includes(searchTerm)) ||
            (service.Surname?.toLowerCase().includes(searchTerm)) ||
            (service.ServiceType?.toLowerCase().includes(searchTerm)) ||
            (service.Bio?.toLowerCase().includes(searchTerm))
        );
    }
    
    // Filter by campus
    if (currentFilters.campus) {
        filtered = filtered.filter(service => 
            service.Campus?.toLowerCase() === currentFilters.campus.toLowerCase()
        );
    }
    
    // Filter by price range (monthly)
    if (currentFilters.priceRange) {
        filtered = filtered.filter(service => {
            const monthlyRate = calculateMonthlyRate(service.HourlyRate);
            switch(currentFilters.priceRange) {
                case '0-1000': return monthlyRate <= 1000;
                case '1000-3000': return monthlyRate > 1000 && monthlyRate <= 3000;
                case '3000-5000': return monthlyRate > 3000 && monthlyRate <= 5000;
                case '5000+': return monthlyRate > 5000;
                default: return true;
            }
        });
    }
    
    // Filter by category
    if (currentFilters.category !== 'all') {
        filtered = filtered.filter(service => 
            service.ServiceType?.toLowerCase() === currentFilters.category.toLowerCase()
        );
    }
    
    // Sort services
    filtered = sortServicesList(filtered);
    
    // Display results
    displayServices(filtered);
    updateResultsCount(filtered.length);
}

//  Sort Services 
function sortServicesList(services) {
    const sortBy = document.getElementById('sortSelect')?.value || 'rating';
    
    switch(sortBy) {
        case 'price-low':
            return [...services].sort((a, b) => calculateMonthlyRate(a.HourlyRate) - calculateMonthlyRate(b.HourlyRate));
        case 'price-high':
            return [...services].sort((a, b) => calculateMonthlyRate(b.HourlyRate) - calculateMonthlyRate(a.HourlyRate));
        case 'name':
            return [...services].sort((a, b) => (a.FullName || '').localeCompare(b.FullName || ''));
        case 'rating':
        default:
            return [...services].sort((a, b) => parseFloat(b.Rating || 0) - parseFloat(a.Rating || 0));
    }
}

function sortServices() {
    filterAndDisplayServices();
}

// Display Services in Grid 
function displayServices(services) {
    const grid = document.getElementById('servicesGrid');
    
    if (!grid) return;
    
    if (!services || services.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No services found</h3>
                <p>Try adjusting your search or filters to find what you're looking for.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = services.map(service => {
        const monthlyRate = calculateMonthlyRate(service.HourlyRate);
        const formattedRate = formatCurrency(monthlyRate);
        const fullName = service.FullName || 'Service';
        const surname = service.Surname || 'Provider';
        const serviceType = service.ServiceType || 'General';
        const bio = service.Bio || 'No description provided';
        const campus = service.Campus || 'Any campus';
        const rating = service.Rating || 'New';
        const hourlyRate = service.HourlyRate || 0;
        
        return `
        <div class="service-card" onclick='showServiceDetail(${JSON.stringify(service)})'>
            <div class="service-image">
                <i class="fas fa-user-circle"></i>
                <span class="service-category-badge">${escapeHtml(serviceType)}</span>
            </div>
            <div class="service-info">
                <h3 class="service-name">${escapeHtml(fullName)} ${escapeHtml(surname)}</h3>
                <div class="service-type">
                    <i class="fas fa-tag"></i> ${escapeHtml(serviceType)}
                </div>
                <p class="service-bio">${escapeHtml(bio.substring(0, 100))}${bio.length > 100 ? '...' : ''}</p>
                <div class="service-details">
                    <div class="service-price">
                        R${formattedRate} <small>/month</small>
                        <span style="font-size: 10px; display: block; color: #888;">(~R${hourlyRate}/hour)</span>
                    </div>
                    <div class="service-rating">
                        <i class="fas fa-star"></i>
                        <span>${typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
                    </div>
                </div>
                <div class="service-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${escapeHtml(campus)}</span>
                </div>
                <button class="view-profile-btn" onclick="event.stopPropagation(); showServiceDetail(${JSON.stringify(service)})">
                    View Profile
                </button>
            </div>
        </div>
    `}).join('');
}

//  Show Service Detail Modal 
function showServiceDetail(service) {
    const modal = document.getElementById('serviceModal');
    const modalContent = document.getElementById('modalContent');
    
    if (!modal || !modalContent) return;
    
    const monthlyRate = calculateMonthlyRate(service.HourlyRate);
    const formattedRate = formatCurrency(monthlyRate);
    const hourlyRate = service.HourlyRate || 0;
    
    modalContent.innerHTML = `
        <div style="text-align: center;">
            <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #2eb997, #084d43); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <i class="fas fa-user-circle" style="font-size: 50px; color: white;"></i>
            </div>
            <h2 style="color: #1e293b; margin-bottom: 5px;">${escapeHtml(service.FullName)} ${escapeHtml(service.Surname)}</h2>
            <p style="color: #2eb997; font-weight: 600; margin-bottom: 20px;">
                <i class="fas fa-tag"></i> ${escapeHtml(service.ServiceType || 'Service Provider')}
            </p>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 20px; text-align: left;">
                <h4 style="color: #1e293b; margin-bottom: 10px;"><i class="fas fa-info-circle"></i> About Me</h4>
                <p style="color: #64748b; line-height: 1.6;">${escapeHtml(service.Bio || 'No bio provided')}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="background: #f8fafc; padding: 12px; border-radius: 12px; text-align: center;">
                    <i class="fas fa-clock" style="color: #2eb997; font-size: 20px;"></i>
                    <p style="font-size: 12px; color: #64748b; margin-top: 5px;">Availability</p>
                    <p style="font-weight: 600;">${escapeHtml(service.Availability || 'Contact for schedule')}</p>
                </div>
                <div style="background: #f8fafc; padding: 12px; border-radius: 12px; text-align: center;">
                    <i class="fas fa-map-marker-alt" style="color: #2eb997; font-size: 20px;"></i>
                    <p style="font-size: 12px; color: #64748b; margin-top: 5px;">Campus</p>
                    <p style="font-weight: 600;">${escapeHtml(service.Campus || 'Any campus')}</p>
                </div>
                <div style="background: #f8fafc; padding: 12px; border-radius: 12px; text-align: center;">
                    <i class="fas fa-money-bill-wave" style="color: #2eb997; font-size: 20px;"></i>
                    <p style="font-size: 12px; color: #64748b; margin-top: 5px;">Monthly Rate</p>
                    <p style="font-weight: 600;">R${formattedRate}/month</p>
                    <small style="color: #888;">(~R${hourlyRate}/hour)</small>
                </div>
                <div style="background: #f8fafc; padding: 12px; border-radius: 12px; text-align: center;">
                    <i class="fas fa-star" style="color: #f59e0b; font-size: 20px;"></i>
                    <p style="font-size: 12px; color: #64748b; margin-top: 5px;">Rating</p>
                    <p style="font-weight: 600;">${typeof service.Rating === 'number' ? service.Rating.toFixed(1) : 'New'} / 5</p>
                </div>
            </div>
            
            <button onclick="requestBooking(${service.Id})" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #2eb997, #084d43); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; margin-bottom: 10px;">
                <i class="fas fa-calendar-check"></i> Request Booking
            </button>
            <button onclick="closeServiceModal()" style="width: 100%; padding: 12px; background: #f1f5f9; border: none; border-radius: 12px; cursor: pointer; color: #64748b;">
                Close
            </button>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function closeServiceModal() {
    const modal = document.getElementById('serviceModal');
    if (modal) modal.style.display = 'none';
}

//  Request Booking 
function requestBooking(providerId) {
    const userEmail = localStorage.getItem('userEmail');
    const providerEmail = localStorage.getItem('providerEmail');
    
    if (!userEmail && !providerEmail) {
        alert('Please login as a Service Seeker to request a booking');
        window.location.href = 'login.html';
        return;
    }
    
    if (providerEmail && !userEmail) {
        alert('You are logged in as a Service Provider. Please sign up as a Service Seeker to book services.');
        return;
    }
    
    alert(`✅ Booking request sent! The provider will contact you at ${userEmail} soon.`);
    closeServiceModal();
}

//  Search Functions 
function searchServices() {
    currentFilters.search = document.getElementById('searchInput').value;
    currentFilters.campus = document.getElementById('campusFilter').value;
    currentFilters.priceRange = document.getElementById('priceFilter').value;
    filterAndDisplayServices();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('campusFilter').value = '';
    document.getElementById('priceFilter').value = '';
    document.getElementById('sortSelect').value = 'rating';
    currentFilters = {
        search: '',
        campus: '',
        priceRange: '',
        category: 'all'
    };
    
    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.classList.remove('active');
        if (chip.getAttribute('data-category') === 'all') {
            chip.classList.add('active');
        }
    });
    
    filterAndDisplayServices();
}

//  Helper Functions 
function updateResultsCount(count) {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `Found ${count} service${count !== 1 ? 's' : ''}`;
    }
}

function showLoading() {
    const grid = document.getElementById('servicesGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading amazing services...</p>
            </div>
        `;
    }
}

function showError(message) {
    const grid = document.getElementById('servicesGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Oops! Something went wrong</h3>
                <p>${message}</p>
                <button onclick="loadServices()" style="margin-top: 15px; padding: 10px 20px; background: #2eb997; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Try Again
                </button>
            </div>
        `;
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

// Attach event listeners
document.addEventListener("DOMContentLoaded", () => {
    console.log('Find Services page loaded');
    loadServices();
    setupEventListeners();
    setupCategoryFilters();
});