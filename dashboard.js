// ===== API CONFIGURATION - USING LOCAL SQL SERVER =====
const API_URL = 'http://10.250.108.184:3000';

const PROVIDERS = [
  { id:1,  fullname:"Thabo",    surname:"Mokoena",  servicetype:"Tutoring",       category:"tutoring",     rating:4.9, reviews:47, experience:"3 years",  campus:"APB",           price:120, about:"Final-year BSc Mathematics student with a passion for breaking down complex concepts. I've helped over 40 students pass their exams with personalised study plans.", tags:["Maths","Statistics","Calculus"],         available:true,  avatar:"TM" },
  { id:2,  fullname:"Lerato",   surname:"Dlamini",  servicetype:"Tutoring",       category:"tutoring",     rating:4.8, reviews:32, experience:"2 years",  campus:"Kingsway",      price:100, about:"English and Communications tutor who helps students craft compelling essays, improve academic writing, and prepare for oral presentations.", tags:["English","Writing","Communications"],    available:true,  avatar:"LD" },
  { id:3,  fullname:"Sipho",    surname:"Nkosi",    servicetype:"Photography",    category:"photography",  rating:4.7, reviews:28, experience:"4 years",  campus:"Doornfontein",  price:350, about:"Professional-grade photography for graduations, events, headshots, and content creation. I bring studio lighting to your location. Delivery within 48 hours.", tags:["Portraits","Events","Editing"],          available:true,  avatar:"SN" },
  { id:4,  fullname:"Aisha",    surname:"Patel",    servicetype:"Graphic Design", category:"design",       rating:5.0, reviews:19, experience:"2 years",  campus:"APB",           price:250, about:"Creative designer specialising in brand identity, social media graphics, and event flyers. I use Figma and Adobe Suite to deliver stunning, print-ready designs.", tags:["Logos","Flyers","Branding"],             available:true,  avatar:"AP" },
  { id:5,  fullname:"Zanele",   surname:"Khumalo",  servicetype:"Hair & Beauty",  category:"beauty",       rating:4.9, reviews:61, experience:"5 years",  campus:"Soweto",        price:180, about:"Certified hair stylist offering braids, weaves, natural hair care, and makeup for events. I come to you or we can meet at my campus studio. Book in advance!", tags:["Braids","Natural Hair","Makeup"],        available:true,  avatar:"ZK" },
  { id:6,  fullname:"Kagiso",   surname:"Sithole",  servicetype:"Web Development",category:"webdev",       rating:4.6, reviews:14, experience:"2 years",  campus:"Kingsway",      price:500, about:"Full-stack developer who builds clean, modern websites for student projects, small businesses, and portfolios. React, Node.js, and MongoDB specialist.", tags:["React","Node.js","Websites"],            available:true,  avatar:"KS" },
  { id:7,  fullname:"Nomsa",    surname:"Mahlangu", servicetype:"Fitness Training",category:"fitness",     rating:4.8, reviews:23, experience:"3 years",  campus:"APB",           price:150, about:"Certified personal trainer and nutrition coach. I offer 1-on-1 sessions at campus gym or outdoor training. Specialising in weight loss and muscle building.", tags:["Gym","Nutrition","Cardio"],              available:true,  avatar:"NM" },
  { id:8,  fullname:"Riyaad",   surname:"Adams",    servicetype:"IT Support",     category:"it",           rating:4.7, reviews:39, experience:"2 years",  campus:"Doornfontein",  price:80,  about:"Quick and reliable tech support: laptop repairs, virus removal, software installation, WiFi issues, and data recovery. Most problems solved same day.", tags:["Repairs","Software","Data Recovery"],   available:true,  avatar:"RA" },
  { id:9,  fullname:"Precious", surname:"Moyo",     servicetype:"Music Lessons",  category:"music",        rating:4.9, reviews:17, experience:"6 years",  campus:"Kingsway",      price:200, about:"Music graduate offering piano and guitar lessons for beginners to intermediate students. I also teach music theory, sight-reading, and exam preparation.", tags:["Piano","Guitar","Theory"],               available:true,  avatar:"PM" },
  { id:10, fullname:"Bongani",  surname:"Zulu",     servicetype:"Photography",    category:"photography",  rating:4.5, reviews:11, experience:"1 year",   campus:"Soweto",        price:200, about:"Student photographer passionate about documentary-style photography and video content. Great for campus events, student union coverage, and social media reels.", tags:["Video","Events","Social Media"],        available:false, avatar:"BZ" },
  { id:11, fullname:"Fatima",   surname:"Osman",    servicetype:"Tutoring",       category:"tutoring",     rating:4.7, reviews:26, experience:"2 years",  campus:"APB",           price:110, about:"Accounting and Finance tutor helping students understand financial statements, cost accounting, and exam technique. Clear explanations, real exam examples.", tags:["Accounting","Finance","Tax"],            available:true,  avatar:"FO" },
  { id:12, fullname:"Thandeka", surname:"Ntuli",    servicetype:"Graphic Design", category:"design",       rating:4.6, reviews:8,  experience:"1 year",   campus:"Doornfontein",  price:180, about:"Motion graphics and illustration specialist. I create animated social media content, infographics, and presentation templates that stand out from the crowd.", tags:["Motion","Illustration","Presentations"],available:true,  avatar:"TN" }
];
//  COOKIE MANAGER

const CookieManager = {
  hasConsented() { return localStorage.getItem('cc_consent') === 'accepted'; },
  acceptCookies() {
    localStorage.setItem('cc_consent', 'accepted');
    document.getElementById('cookie-banner').classList.add('hidden');
  },
  declineCookies() {
    localStorage.setItem('cc_consent', 'declined');
    document.getElementById('cookie-banner').classList.add('hidden');
  },
  trackView(category) {
    if (!this.hasConsented() || !category) return;
    const h = this.getHistory();
    h[category] = (h[category] || 0) + 1;
    localStorage.setItem('cc_history', JSON.stringify(h));
  },
  trackProvider(id) {
    if (!this.hasConsented()) return;
    const viewed = this.getViewed();
    if (!viewed.includes(id)) { viewed.unshift(id); }
    localStorage.setItem('cc_viewed', JSON.stringify(viewed.slice(0, 30)));
    const p = PROVIDERS.find(x => x.id === id);
    if (p) this.trackView(p.category);
    updateActivityStats();
  },
  getHistory() { try { return JSON.parse(localStorage.getItem('cc_history') || '{}'); } catch { return {}; } },
  getViewed()  { try { return JSON.parse(localStorage.getItem('cc_viewed')  || '[]'); } catch { return []; } },
  getTopCats(n = 3) {
    return Object.entries(this.getHistory())
      .sort((a,b) => b[1] - a[1]).slice(0, n).map(([c]) => c);
  },
  getRecommended(limit = 4) {
    const topCats = this.getTopCats(3);
    const viewed  = this.getViewed();
    let recs = [];
    topCats.forEach(cat => {
      PROVIDERS.forEach(p => {
        if ((p.category === cat) && !viewed.includes(p.id) && !recs.find(r => r.id === p.id))
          recs.push(p);
      });
    });
    if (recs.length < limit) {
      PROVIDERS
        .filter(p => !viewed.includes(p.id) && !recs.find(r => r.id === p.id))
        .sort((a,b) => b.rating - a.rating)
        .forEach(p => recs.push(p));
    }
    return recs.slice(0, limit);
  }
};


//  STATE

let currentFilter  = null;
let currentQuery   = '';
let favourites     = [];
let dropdownItems  = [];
let dropdownIndex  = -1;

//  INIT
document.addEventListener('DOMContentLoaded', () => {
  // Cookie banner
  if (CookieManager.hasConsented() || localStorage.getItem('cc_consent') === 'declined') {
    document.getElementById('cookie-banner').classList.add('hidden');
  }
  // Load favourites
  try { favourites = JSON.parse(localStorage.getItem('cc_favs') || '[]'); } catch {}
  // Display
  displayProviders(PROVIDERS);
  renderRecommended();
  updateActivityStats();

  // Close dropdown on outside click
  document.addEventListener('click', e => {
    if (!document.getElementById('searchWrapper').contains(e.target))
      closeDropdown();
  });
});


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

//  LIVE SEARCH

function onLiveSearch(val) {
  currentQuery = val.trim().toLowerCase();
  const dd = document.getElementById('searchDropdown');

  if (!currentQuery) { closeDropdown(); renderProviders(); return; }

  dropdownItems = PROVIDERS.filter(p =>
    `${p.fullname} ${p.surname} ${p.servicetype} ${p.campus} ${p.tags.join(' ')}`.toLowerCase().includes(currentQuery)
  ).slice(0, 6);

  dropdownIndex = -1;

  if (dropdownItems.length === 0) {
    dd.innerHTML = `<div class="dropdown-no-results"><i class="fas fa-search" style="display:block;margin-bottom:6px;opacity:.4"></i>No results for "<strong>${esc(val)}</strong>"</div>`;
  } else {
    dd.innerHTML = dropdownItems.map((p, i) => `
      <div class="dropdown-item" id="dd-${i}" onclick="pickDropdown(${i})">
        <div class="dropdown-avatar">${p.avatar}</div>
        <div class="dropdown-info">
          <h5>${esc(p.fullname)} ${esc(p.surname)}</h5>
          <span>${esc(p.servicetype)} · ${esc(p.campus)}</span>
        </div>
        <span class="dropdown-badge">⭐ ${p.rating}</span>
      </div>
    `).join('');
  }

  dd.classList.add('open');
  // Also filter main grid live
  renderProviders();
}

function pickDropdown(i) {
  const p = dropdownItems[i];
  if (!p) return;
  closeDropdown();
  openProviderModal(p.id);
}

function closeDropdown() {
  document.getElementById('searchDropdown').classList.remove('open');
  dropdownIndex = -1;
}

function handleKey(e) {
  const dd = document.getElementById('searchDropdown');
  if (!dd.classList.contains('open')) return;
  if (e.key === 'ArrowDown') {
    dropdownIndex = Math.min(dropdownIndex + 1, dropdownItems.length - 1);
    highlightDropdown();
  } else if (e.key === 'ArrowUp') {
    dropdownIndex = Math.max(dropdownIndex - 1, -1);
    highlightDropdown();
  } else if (e.key === 'Enter') {
    if (dropdownIndex >= 0) pickDropdown(dropdownIndex);
    else { commitSearch(); closeDropdown(); }
  } else if (e.key === 'Escape') {
    closeDropdown();
  }
}

function highlightDropdown() {
  document.querySelectorAll('.dropdown-item').forEach((el, i) => {
    el.style.background = i === dropdownIndex ? 'var(--card2)' : '';
  });
}



function commitSearch() {
  closeDropdown();
  renderProviders();
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  currentQuery = '';
  currentFilter = null;
  document.getElementById('activeFilter').style.display = 'none';
  closeDropdown();
  displayProviders(PROVIDERS);
  document.querySelector('.providers-section h3').innerHTML = '<i class="fas fa-star"></i> Top Rated Providers';
}


//  FILTER BY CATEGORY

const CATEGORY_LABELS = {
  tutoring:'Tutoring', photography:'Photography', design:'Graphic Design',
  beauty:'Hair & Beauty', webdev:'Web Development', fitness:'Fitness Training',
  it:'IT Support', music:'Music Lessons'
};

function filterByCategory(cat) {
  currentFilter = cat;
  currentQuery  = '';
  document.getElementById('searchInput').value = '';
  closeDropdown();
  CookieManager.trackView(cat);
  renderProviders();
  renderRecommended();
  document.querySelector('.providers-section')?.scrollIntoView({ behavior: 'smooth' });
}

//  RENDER PROVIDERS

function renderProviders() {
  let results = [...PROVIDERS];

  if (currentFilter) {
    results = results.filter(p => p.category === currentFilter);
    const label = CATEGORY_LABELS[currentFilter] || currentFilter;
    document.querySelector('.providers-section h3').innerHTML =
      `<i class="fas fa-filter"></i> ${label}`;
    document.getElementById('activeFilter').style.display = 'inline-flex';
    document.getElementById('activeFilter').innerHTML =
      `<i class="fas fa-tag"></i> Filtering: <strong>${label}</strong>
       <button onclick="clearSearch()">✕</button>`;
  } else {
    document.querySelector('.providers-section h3').innerHTML =
      '<i class="fas fa-star"></i> Top Rated Providers';
    document.getElementById('activeFilter').style.display = 'none';
  }

  if (currentQuery) {
    results = results.filter(p =>
      `${p.fullname} ${p.surname} ${p.servicetype} ${p.campus} ${p.tags.join(' ')}`.toLowerCase().includes(currentQuery)
    );
  }

  displayProviders(results);
}

function displayProviders(list) {
  const container = document.getElementById('providers-list');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search-minus"></i>
        <h3>No providers found</h3>
        <p style="font-size:.82rem">Try a different search or category</p>
        <button onclick="clearSearch()">Browse All Services</button>
      </div>`;
    return;
  }

    const sorted = [...list].sort((a,b) => b.rating - a.rating);
  container.innerHTML = sorted.map(p => `
    <div class="provider-card" onclick="openProviderModal(${p.id})">
      <span class="${p.available ? 'available-badge' : 'unavailable-badge'}">
        ${p.available ? 'Available' : 'Busy'}
      </span>
      <div class="provider-avatar">${p.avatar}</div>
      <h4>${esc(p.fullname)} ${esc(p.surname)}</h4>
      <span class="provider-service">${esc(p.servicetype)}</span>
      <div class="provider-rating">
        <i class="fas fa-star"></i>
        <strong>${p.rating}</strong>
        <span>(${p.reviews} reviews)</span>
      </div>
      <button class="btn-view-profile" onclick="event.stopPropagation(); openProviderModal(${p.id})">
        View Profile
      </button>
    </div>
  `).join('');
}

function showAllProviders() {
  currentFilter = null;
  currentQuery  = '';
  document.getElementById('searchInput').value = '';
  displayProviders(PROVIDERS);
  document.querySelector('.providers-section h3').innerHTML = '<i class="fas fa-th"></i> All Providers';
  document.getElementById('activeFilter').style.display = 'none';
  document.querySelector('.providers-section')?.scrollIntoView({ behavior: 'smooth' });
}

//  PROVIDER DETAIL MODAL
function openProviderModal(id) {
  const p = PROVIDERS.find(x => x.id === id);
  if (!p) return;

  CookieManager.trackProvider(id);
  renderRecommended();

  const stars = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? '½' : '');
  const isFav = favourites.includes(id);

  document.getElementById('modalBody').innerHTML = `
    <div class="modal-avatar">${p.avatar}</div>
    <h2 class="modal-name">${esc(p.fullname)} ${esc(p.surname)}</h2>
    <span class="modal-service-badge">${esc(p.servicetype)}</span>
    <div class="modal-campus"><i class="fas fa-map-marker-alt"></i> ${esc(p.campus)} Campus</div>

    <div class="modal-grid">
      <div class="modal-info-box">
        <label>RATING</label>
        <span class="stars">${stars}</span>
        <span>${p.rating} / 5 · ${p.reviews} reviews</span>
      </div>
      <div class="modal-info-box">
        <label>EXPERIENCE</label>
        <span>${esc(p.experience)}</span>
      </div>
      <div class="modal-info-box">
        <label>STARTING PRICE</label>
        <span>R${p.price} / session</span>
      </div>
      <div class="modal-info-box">
        <label>AVAILABILITY</label>
        <span style="color:${p.available ? 'var(--brand)' : 'var(--danger)'}">
          ${p.available ? '● Available Now' : '● Currently Busy'}
        </span>
      </div>
    </div>

    <div class="modal-about">
      <label>ABOUT</label>
      <p>${esc(p.about)}</p>
    </div>

    <div class="modal-tags">
      ${p.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}
    </div>

    <div class="modal-actions">
      <button class="btn-book" onclick="bookProvider(${p.id})">
        <i class="fas fa-calendar-plus"></i> Book Session
      </button>
      <button class="btn-fav ${isFav ? 'active' : ''}" id="fav-btn-${p.id}" onclick="toggleFav(${p.id})">
        <i class="fas fa-heart"></i>  Favourite
      </button>
    </div>
  `;
    document.getElementById('providerModal').classList.add('open');
}

function closeModal() {
  document.getElementById('providerModal').classList.remove('open');
}
function onModalBackdrop(e) {
  if (e.target === document.getElementById('providerModal')) closeModal();
}
  
function bookProvider(id) {
  const p = PROVIDERS.find(x => x.id === id);
  if (!p) return;
  if (!p.available) {
    showToast(`${p.fullname} is currently busy. Try again later.`, 'warning');
    return;
  }
  const booked = parseInt(document.getElementById('stat-booked').textContent) + 1;
  document.getElementById('stat-booked').textContent = booked;
  localStorage.setItem('cc_stat_booked', booked);
  showToast(`Booking request sent to ${p.fullname}! ✅`);
  closeModal();
}

function toggleFav(id) {
  const idx = favourites.indexOf(id);
  if (idx === -1) favourites.push(id);
  else favourites.splice(idx, 1);
  localStorage.setItem('cc_favs', JSON.stringify(favourites));
  const btn = document.getElementById(`fav-btn-${id}`);
  if (btn) btn.classList.toggle('active', favourites.includes(id));
  updateActivityStats();
}

//  ACTIVITY STATS

function updateActivityStats() {
  try {
    document.getElementById('stat-booked').textContent  = localStorage.getItem('cc_stat_booked') || 0;
    document.getElementById('stat-favs').textContent    = favourites.length;
    document.getElementById('stat-viewed').textContent  = CookieManager.getViewed().length;
  } catch {}
}

//  TOAST

function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.style.cssText = `
    position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);
    background:${type === 'warning' ? '#f59e0b' : 'var(--brand)'};
    color:#fff;padding:12px 24px;border-radius:10px;
    font-size:.88rem;z-index:9999;
    box-shadow:0 8px 24px rgba(0,0,0,.4);
    transition:all .3s;opacity:0;white-space:nowrap;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
}

//  UTILS

function esc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}





