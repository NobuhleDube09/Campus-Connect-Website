// findServices.js - Clean resolved version

// ===== API CONFIGURATION - USING LOCAL SQL SERVER =====
const API_URL = 'http://10.250.108.184:3000';

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

// ──────────────────────────────────────────────
//  PROVIDERS DATA
// ──────────────────────────────────────────────
const PROVIDERS = [
  { id:1,  fullname:"Thabo",    surname:"Mokoena",  servicetype:"Tutoring",       category:"tutoring",    rating:4.9, reviews:47, experience:"3 years", campus:"APB",           price:120, about:"Final-year BSc Mathematics student with a passion for breaking down complex concepts. I've helped over 40 students pass their exams with personalised study plans.", tags:["Maths","Statistics","Calculus"],        available:true,  avatar:"TM" },
  { id:2,  fullname:"Lerato",   surname:"Dlamini",  servicetype:"Tutoring",       category:"tutoring",    rating:4.8, reviews:32, experience:"2 years", campus:"Kingsway",      price:100, about:"English and Communications tutor who helps students craft compelling essays, improve academic writing, and prepare for oral presentations.", tags:["English","Writing","Communications"],   available:true,  avatar:"LD" },
  { id:3,  fullname:"Sipho",    surname:"Nkosi",    servicetype:"Photography",    category:"photography", rating:4.7, reviews:28, experience:"4 years", campus:"Doornfontein",  price:350, about:"Professional-grade photography for graduations, events, headshots, and content creation. Studio lighting to your location. Delivery within 48 hours.", tags:["Portraits","Events","Editing"],         available:true,  avatar:"SN" },
  { id:4,  fullname:"Aisha",    surname:"Patel",    servicetype:"Graphic Design", category:"design",      rating:5.0, reviews:19, experience:"2 years", campus:"APB",           price:250, about:"Creative designer specialising in brand identity, social media graphics, and event flyers. Uses Figma and Adobe Suite to deliver stunning, print-ready designs.", tags:["Logos","Flyers","Branding"],            available:true,  avatar:"AP" },
  { id:5,  fullname:"Zanele",   surname:"Khumalo",  servicetype:"Hair & Beauty",  category:"beauty",      rating:4.9, reviews:61, experience:"5 years", campus:"Soweto",        price:180, about:"Certified hair stylist offering braids, weaves, natural hair care, and makeup for events. I come to you or we can meet at my campus studio.", tags:["Braids","Natural Hair","Makeup"],       available:true,  avatar:"ZK" },
  { id:6,  fullname:"Kagiso",   surname:"Sithole",  servicetype:"Web Development",category:"webdev",      rating:4.6, reviews:14, experience:"2 years", campus:"Kingsway",      price:500, about:"Full-stack developer who builds clean, modern websites for student projects, small businesses, and portfolios. React, Node.js, and MongoDB specialist.", tags:["React","Node.js","Websites"],           available:true,  avatar:"KS" },
  { id:7,  fullname:"Nomsa",    surname:"Mahlangu", servicetype:"Fitness Training",category:"fitness",    rating:4.8, reviews:23, experience:"3 years", campus:"APB",           price:150, about:"Certified personal trainer and nutrition coach. I offer 1-on-1 sessions at campus gym or outdoor training. Specialising in weight loss and muscle building.", tags:["Gym","Nutrition","Cardio"],             available:true,  avatar:"NM" },
  { id:8,  fullname:"Riyaad",   surname:"Adams",    servicetype:"IT Support",     category:"it",          rating:4.7, reviews:39, experience:"2 years", campus:"Doornfontein",  price:80,  about:"Quick and reliable tech support: laptop repairs, virus removal, software installation, WiFi issues, and data recovery. Most problems solved same day.", tags:["Repairs","Software","Data Recovery"],  available:true,  avatar:"RA" },
  { id:9,  fullname:"Precious", surname:"Moyo",     servicetype:"Music Lessons",  category:"music",       rating:4.9, reviews:17, experience:"6 years", campus:"Kingsway",      price:200, about:"Music graduate offering piano and guitar lessons for beginners to intermediate students. Also teaches music theory, sight-reading, and exam preparation.", tags:["Piano","Guitar","Theory"],              available:true,  avatar:"PM" },
  { id:10, fullname:"Bongani",  surname:"Zulu",     servicetype:"Photography",    category:"photography", rating:4.5, reviews:11, experience:"1 year",  campus:"Soweto",        price:200, about:"Student photographer passionate about documentary-style photography and video content. Great for campus events and social media reels.", tags:["Video","Events","Social Media"],       available:false, avatar:"BZ" },
  { id:11, fullname:"Fatima",   surname:"Osman",    servicetype:"Tutoring",       category:"tutoring",    rating:4.7, reviews:26, experience:"2 years", campus:"APB",           price:110, about:"Accounting and Finance tutor helping students understand financial statements, cost accounting, and exam technique. Clear explanations, real exam examples.", tags:["Accounting","Finance","Tax"],           available:true,  avatar:"FO" },
  { id:12, fullname:"Thandeka", surname:"Ntuli",    servicetype:"Graphic Design", category:"design",      rating:4.6, reviews:8,  experience:"1 year",  campus:"Doornfontein",  price:180, about:"Motion graphics and illustration specialist. I create animated social media content, infographics, and presentation templates that stand out.", tags:["Motion","Illustration","Presentations"],available:true, avatar:"TN" }
];

// ──────────────────────────────────────────────
//  COOKIE MANAGER
// ──────────────────────────────────────────────
const CookieManager = {
  hasConsented() { return localStorage.getItem('cc_consent') === 'accepted'; },
  acceptCookies() { localStorage.setItem('cc_consent','accepted'); document.getElementById('cookie-banner').classList.add('hidden'); },
  declineCookies() { localStorage.setItem('cc_consent','declined'); document.getElementById('cookie-banner').classList.add('hidden'); },
  trackView(cat) {
    if (!this.hasConsented() || !cat) return;
    const h = this.getHistory();
    h[cat] = (h[cat] || 0) + 1;
    localStorage.setItem('cc_history', JSON.stringify(h));
  },
  trackProvider(id) {
    if (!this.hasConsented()) return;
    const v = this.getViewed();
    if (!v.includes(id)) v.unshift(id);
    localStorage.setItem('cc_viewed', JSON.stringify(v.slice(0,30)));
    const p = PROVIDERS.find(x => x.id === id);
    if (p) this.trackView(p.category);
  },
  getHistory() { try { return JSON.parse(localStorage.getItem('cc_history')||'{}'); } catch { return {}; } },
  getViewed()  { try { return JSON.parse(localStorage.getItem('cc_viewed') ||'[]'); } catch { return []; } }
};

// ──────────────────────────────────────────────
//  STATE
// ──────────────────────────────────────────────
let activeCat    = 'all';
let ddItems      = [];
let ddIdx        = -1;
let favourites   = [];

// ──────────────────────────────────────────────
//  INIT
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (CookieManager.hasConsented() || localStorage.getItem('cc_consent') === 'declined')
    document.getElementById('cookie-banner').classList.add('hidden');
  try { favourites = JSON.parse(localStorage.getItem('cc_favs') || '[]'); } catch {}
  applyFilters();
  document.addEventListener('click', e => {
    if (!document.getElementById('searchRow').contains(e.target)) closeDD();
  });
});

// ──────────────────────────────────────────────
//  SEARCH LIVE
// ──────────────────────────────────────────────
function onLiveSearch(val) {
  const q = val.trim().toLowerCase();
  const dd = document.getElementById('searchDropdown');
  if (!q) { closeDD(); applyFilters(); return; }

  ddItems = PROVIDERS.filter(p =>
    `${p.fullname} ${p.surname} ${p.servicetype} ${p.campus} ${p.tags.join(' ')}`.toLowerCase().includes(q)
  ).slice(0, 6);
  ddIdx = -1;

  if (ddItems.length === 0) {
    dd.innerHTML = `<div class="dd-empty"><i class="fas fa-search-minus" style="display:block;margin-bottom:6px;opacity:.4"></i>No results for "<strong>${esc(val)}</strong>"</div>`;
  } else {
    dd.innerHTML = ddItems.map((p, i) => `
      <div class="dd-item" id="dd-${i}" onclick="pickDD(${i})">
        <div class="dd-avatar">${p.avatar}</div>
        <div class="dd-info">
          <h5>${esc(p.fullname)} ${esc(p.surname)}</h5>
          <span>${esc(p.servicetype)} · ${esc(p.campus)}</span>
        </div>
        <span class="dd-rating">⭐ ${p.rating}</span>
      </div>
    `).join('');
  }
  dd.classList.add('open');
  applyFilters(); // update grid in background
}

function pickDD(i) {
  const p = ddItems[i];
  if (!p) return;
  closeDD();
  openModal(p.id);
}
function closeDD() { document.getElementById('searchDropdown').classList.remove('open'); ddIdx = -1; }

function handleKey(e) {
  const dd = document.getElementById('searchDropdown');
  if (!dd.classList.contains('open')) return;
  if (e.key === 'ArrowDown')  { ddIdx = Math.min(ddIdx+1, ddItems.length-1); highlightDD(); }
  else if (e.key === 'ArrowUp')   { ddIdx = Math.max(ddIdx-1, -1); highlightDD(); }
  else if (e.key === 'Enter')     { if (ddIdx >= 0) pickDD(ddIdx); else closeDD(); }
  else if (e.key === 'Escape')    { closeDD(); }
}
function highlightDD() {
  document.querySelectorAll('.dd-item').forEach((el,i) => { el.style.background = i===ddIdx ? 'var(--card2)':''; });
}

// ──────────────────────────────────────────────
//  CHIPS
// ──────────────────────────────────────────────
function setChip(el, cat) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  activeCat = cat;
  CookieManager.trackView(cat === 'all' ? null : cat);
  applyFilters();
}

// ──────────────────────────────────────────────
//  FILTER + SORT + RENDER
// ──────────────────────────────────────────────
function applyFilters() {
  const q      = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  const campus = document.getElementById('campusFilter')?.value || '';
  const price  = document.getElementById('priceFilter')?.value  || '';
  const sort   = document.getElementById('sortSelect')?.value   || 'rating';

  let results = [...PROVIDERS];

  if (activeCat !== 'all') results = results.filter(p => p.category === activeCat);

  if (q) results = results.filter(p =>
    `${p.fullname} ${p.surname} ${p.servicetype} ${p.campus} ${p.tags.join(' ')}`.toLowerCase().includes(q)
  );

  if (campus) results = results.filter(p => p.campus === campus);

  if (price) {
    if (price === '0-100')    results = results.filter(p => p.price < 100);
    if (price === '100-300')  results = results.filter(p => p.price >= 100 && p.price <= 300);
    if (price === '300-500')  results = results.filter(p => p.price > 300 && p.price <= 500);
    if (price === '500+')     results = results.filter(p => p.price > 500);
  }

  if (sort === 'rating')     results.sort((a,b) => b.rating - a.rating);
  if (sort === 'price-low')  results.sort((a,b) => a.price  - b.price);
  if (sort === 'price-high') results.sort((a,b) => b.price  - a.price);
  if (sort === 'name')       results.sort((a,b) => a.fullname.localeCompare(b.fullname));

  renderGrid(results);
}

function renderGrid(list) {
  const grid  = document.getElementById('servicesGrid');
  const count = document.getElementById('resultsCount');
  count.innerHTML = `Showing <strong>${list.length}</strong> service${list.length !== 1 ? 's' : ''}`;

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search-minus"></i>
        <h3>No services match your search</h3>
        <p>Try adjusting your filters or search terms</p>
        <button onclick="resetAll()">Clear All Filters</button>
      </div>`;
    return;
  }

  grid.innerHTML = list.map(p => `
    <div class="service-card" onclick="openModal(${p.id})">
      <span class="card-avail ${p.available ? 'avail-yes' : 'avail-no'}">${p.available ? 'Available' : 'Busy'}</span>
      <div class="card-top">
        <div class="card-avatar">${p.avatar}</div>
        <div class="card-header-info">
          <h4>${esc(p.fullname)} ${esc(p.surname)}</h4>
          <span class="card-service-type">${esc(p.servicetype)}</span>
        </div>
      </div>
      <div class="card-body">
        <div class="card-rating">
          <i class="fas fa-star"></i>
          <strong>${p.rating}</strong>
          <span>(${p.reviews} reviews)</span>
        </div>
        <div class="card-meta">
          <span class="meta-item"><i class="fas fa-map-marker-alt"></i>${esc(p.campus)}</span>
          <span class="meta-item"><i class="fas fa-clock"></i>${esc(p.experience)}</span>
        </div>
        <div class="card-tags">
          ${p.tags.map(t => `<span class="card-tag">${esc(t)}</span>`).join('')}
        </div>
        <div class="card-price">R${p.price} <span>/ session</span></div>
        <button class="btn-view" onclick="event.stopPropagation(); openModal(${p.id})">
          <i class="fas fa-eye"></i> View Profile
        </button>
      </div>
    </div>
  `).join('');
}

function resetAll() {
  document.getElementById('searchInput').value  = '';
  document.getElementById('campusFilter').value = '';
  document.getElementById('priceFilter').value  = '';
  document.getElementById('sortSelect').value   = 'rating';
  activeCat = 'all';
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  document.querySelector('[data-cat="all"]').classList.add('active');
  closeDD();
  applyFilters();
}

// ──────────────────────────────────────────────
//  MODAL
// ──────────────────────────────────────────────
function openModal(id) {
  const p = PROVIDERS.find(x => x.id === id);
  if (!p) return;
  CookieManager.trackProvider(id);

  const stars  = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? '½' : '');
  const isFav  = favourites.includes(id);

  document.getElementById('modalContent').innerHTML = `
    <div class="modal-avatar">${p.avatar}</div>
    <h2 class="modal-name">${esc(p.fullname)} ${esc(p.surname)}</h2>
    <span class="modal-svc">${esc(p.servicetype)}</span>
    <div class="modal-campus"><i class="fas fa-map-marker-alt"></i> ${esc(p.campus)} Campus</div>
    <div class="modal-grid">
      <div class="mib"><label>RATING</label><span class="stars">${stars}</span><span>${p.rating}/5 · ${p.reviews} reviews</span></div>
      <div class="mib"><label>EXPERIENCE</label><span>${esc(p.experience)}</span></div>
      <div class="mib"><label>STARTING PRICE</label><span>R${p.price}/session</span></div>
      <div class="mib"><label>STATUS</label><span style="color:${p.available?'var(--brand)':'var(--danger)'}">● ${p.available?'Available':'Busy'}</span></div>
    </div>
    <div class="modal-about-box">
      <label>ABOUT</label>
      <p>${esc(p.about)}</p>
    </div>
    <div class="modal-tags">${p.tags.map(t => `<span class="mtag">${esc(t)}</span>`).join('')}</div>
    <div class="modal-actions">
      <button class="btn-book" onclick="book(${p.id})"><i class="fas fa-calendar-plus"></i> Book Session</button>
      <button class="btn-fav ${isFav?'active':''}" id="fav-${p.id}" onclick="toggleFav(${p.id})"><i class="fas fa-heart"></i></button>
    </div>
  `;
  document.getElementById('serviceModal').classList.add('open');
}
function closeModal() { document.getElementById('serviceModal').classList.remove('open'); }
function onBackdrop(e) { if (e.target === document.getElementById('serviceModal')) closeModal(); }

function book(id) {
  const p = PROVIDERS.find(x => x.id === id);
  if (!p) return;
  if (!p.available) { toast(`${p.fullname} is currently busy. Try again later.`,'warning'); return; }
  toast(`Booking request sent to ${p.fullname}! ✅`);
  closeModal();
}

function toggleFav(id) {
  const i = favourites.indexOf(id);
  if (i === -1) favourites.push(id); else favourites.splice(i,1);
  localStorage.setItem('cc_favs', JSON.stringify(favourites));
  const btn = document.getElementById(`fav-${id}`);
  if (btn) btn.classList.toggle('active', favourites.includes(id));
}

// ──────────────────────────────────────────────
//  UTIL
// ──────────────────────────────────────────────
function esc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function toast(msg, type='success') {
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:30px;left:50%;transform:translateX(-50%) translateY(20px);background:${type==='warning'?'#f59e0b':'var(--brand)'};color:#fff;padding:12px 24px;border-radius:10px;font-size:.88rem;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,.4);transition:all .3s;opacity:0;white-space:nowrap;`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(0)'; });
  setTimeout(() => { t.style.opacity='0'; setTimeout(()=>t.remove(),300); }, 3000);
}
