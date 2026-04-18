// main.js

// Toggle mobile navigation menu
function toggleMenu() {
    const nav = document.querySelector('.nav-links');
    nav.style.display = (nav.style.display === 'flex') ? 'none' : 'flex';
}

// Show alert for navigation/auth buttons
function showAlert(section) {
    alert(`You clicked on: ${section}`);
}

// Handle Cover Image upload
const uploadBox = document.querySelector('.upload-box');
uploadBox.addEventListener('click', () => {
    // Create hidden file input dynamically
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

// Handle Portfolio Gallery uploads
const portfolioGallery = document.querySelector('.portfolio-gallery');
portfolioGallery.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    fileInput.onchange = (event) => {
        const files = event.target.files;
        portfolioGallery.innerHTML = ''; // Clear placeholder text
        Array.from(files).forEach(file => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            portfolioGallery.appendChild(img);
        });
    };
    fileInput.click();
});

// Handle Tags addition
const tagsInput = document.getElementById('tags');
const tagsButton = document.querySelector('.tags-container button');
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
        tag.style.display = 'inline-block';
        tagsInput.parentNode.insertBefore(tag, tagsButton);
        tagsInput.value = '';
    }
});
 