// startHustle.js

// Toggle mobile navigation menu
function toggleMenu() {
    const nav = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');
    if (nav) nav.classList.toggle('active');
    if (authButtons) authButtons.classList.toggle('active');
}

// Show alert for navigation/auth buttons
function showAlert(section) {
    alert(`You clicked on: ${section}`);
}

// Get the logged-in user's email
function getProviderEmail() {
    return localStorage.getItem('userEmail');
}

// Handle Cover Image upload
const uploadBox = document.querySelector('.upload-box');
if (uploadBox) {
    uploadBox.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                uploadBox.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Cover Image" style="max-width:100%; border-radius:8px;">`;
            }
        };
        fileInput.click();
    });
}

// Handle Portfolio Gallery uploads
const portfolioGallery = document.querySelector('.portfolio-gallery');
if (portfolioGallery) {
    portfolioGallery.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.multiple = true;
        fileInput.onchange = (event) => {
            const files = event.target.files;
            portfolioGallery.innerHTML = '';
            Array.from(files).forEach(file => {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.style.width = '80px';
                img.style.height = '80px';
                img.style.objectFit = 'cover';
                img.style.margin = '5px';
                img.style.borderRadius = '8px';
                portfolioGallery.appendChild(img);
            });
        };
        fileInput.click();
    });
}

// Handle Tags addition
const tagsInput = document.getElementById('tags');
const tagsButton = document.querySelector('.tags-container button');
if (tagsButton && tagsInput) {
    tagsButton.addEventListener('click', () => {
        const value = tagsInput.value.trim();
        if (value) {
            const tag = document.createElement('span');
            tag.textContent = value;
            tag.style.background = '#3498db';
            tag.style.color = '#fff';
            tag.style.padding = '5px 10px';
            tag.style.borderRadius = '4px';
            tag.style.marginRight = '5px';
            tag.style.marginBottom = '5px';
            tag.style.display = 'inline-block';
            tagsInput.parentNode.insertBefore(tag, tagsButton);
            tagsInput.value = '';
        }
    });
}

// Handle form submission for adding service
const addServiceForm = document.getElementById('addServiceForm');
if (addServiceForm) {
    addServiceForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const providerEmail = getProviderEmail();
        
        if (!providerEmail) {
            alert('Please login first');
            window.location.href = 'index.html';
            return;
        }
        
        const serviceData = {
            providerEmail: providerEmail,
            title: document.getElementById('serviceTitle').value,
            category: document.getElementById('serviceCategory').value,
            description: document.getElementById('serviceDescription').value,
            price: parseFloat(document.getElementById('servicePrice').value),
            priceType: document.getElementById('priceType').value,
            campus: document.getElementById('campus').value,
            availability: document.getElementById('availability').value
        };
        
        const messageBox = document.getElementById('messageBox');
        if (messageBox) {
            messageBox.style.display = 'block';
            messageBox.innerHTML = '<div class="loading">Publishing your service...</div>';
            messageBox.className = 'message-box info';
        }
        
        try {
            const response = await fetch('http://localhost:3000/add-service', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(serviceData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                if (messageBox) {
                    messageBox.innerHTML = '<div class="success">✅ Service published successfully! It will now appear for service seekers.</div>';
                    messageBox.className = 'message-box success';
                }
                document.getElementById('addServiceForm').reset();
                
                if (portfolioGallery) portfolioGallery.innerHTML = '<span>+ Add images</span>';
                const tagsContainer = document.querySelector('.tags-container');
                if (tagsContainer) {
                    const tags = tagsContainer.querySelectorAll('span');
                    tags.forEach(tag => {
                        if (tag.style.background === 'rgb(52, 152, 219)') tag.remove();
                    });
                }
                if (uploadBox) uploadBox.innerHTML = '<span>Click to upload cover image</span>';
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            } else {
                if (messageBox) {
                    messageBox.innerHTML = `<div class="error">❌ Error: ${result.message}</div>`;
                    messageBox.className = 'message-box error';
                }
            }
        } catch (error) {
            console.error('Error:', error);
            if (messageBox) {
                messageBox.innerHTML = '<div class="error">❌ Error connecting to server. Make sure backend is running on port 3000.</div>';
                messageBox.className = 'message-box error';
            }
        }
    });
}