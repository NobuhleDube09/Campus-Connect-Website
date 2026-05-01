// Global showAlert function for header navigation items (as requested)
  function showAlert(pageName) {
    alert(`✨ Campus Connect • ${pageName} page\n\nThis is a demo navigation. The full experience will be available soon! 🎓`);
  }

  // Also handle the "How It Works" active link to show a friendly message? Not required but we can add consistency
  document.querySelectorAll('.nav-links a').forEach(link => {
    // Only add for non-active? but keep the onclick for about/contact already defined. For Home and How It Works we can add alert demo effect
    if(link.getAttribute('onclick')) return; // skip already defined
    link.addEventListener('click', function(e) {
      if(this.getAttribute('href') === 'index.html') {
        e.preventDefault();
        showAlert('Home');
      } else if(this.classList.contains('active') && this.innerText.trim() === 'How It Works') {
        e.preventDefault();
        showAlert('How It Works');
      } else if(this.innerText.trim() === 'Home') {
        e.preventDefault();
        showAlert('Home');
      }
    });
  });

  // --- FORM HANDLING (same enhanced logic with confirmation) ---
  (function() {
    const form = document.getElementById('campusContactForm');
    const confirmDiv = document.getElementById('formConfirmation');
    const confirmTextSpan = document.getElementById('confirmText');
    
    function showConfirmation(userName) {
      const nameTrim = userName.trim();
      let thanksMsg = '';
      if (nameTrim !== '') {
        thanksMsg = `🎉 Thanks ${nameTrim}! We’ll get back to you soon (usually within 24h). 🎓`;
      } else {
        thanksMsg = `✅ Thanks for reaching out! We’ll respond within 24 hours. 📚`;
      }
      confirmTextSpan.innerText = thanksMsg;
      confirmDiv.classList.add('show');
      setTimeout(() => {
        if (confirmDiv.classList.contains('show')) {
          confirmDiv.style.transition = "opacity 0.3s";
          confirmDiv.style.opacity = "0";
          setTimeout(() => {
            confirmDiv.classList.remove('show');
            confirmDiv.style.opacity = "";
          }, 300);
        }
      }, 5500);
    }

    function resetConfirmation() {
      confirmDiv.classList.remove('show');
      confirmDiv.style.opacity = "";
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const fullName = document.getElementById('fullName').value;
      const studentEmail = document.getElementById('studentEmail').value;
      const subject = document.getElementById('subjectSelect').value;
      const message = document.getElementById('messageBox').value;
      
      if (!fullName || !studentEmail) {
        const tempErr = document.createElement('div');
        tempErr.innerText = "⚠️ Please fill in your name and student email.";
        tempErr.style.background = "#fff0f0";
        tempErr.style.color = "#b00020";
        tempErr.style.padding = "0.7rem";
        tempErr.style.borderRadius = "1rem";
        tempErr.style.marginTop = "0.5rem";
        tempErr.style.fontSize = "0.85rem";
        tempErr.style.borderLeft = "3px solid #b00020";
        const formContainer = form;
        const existingErr = document.querySelector('.temp-error-msg');
        if(existingErr) existingErr.remove();
        tempErr.classList.add('temp-error-msg');
        formContainer.appendChild(tempErr);
        setTimeout(() => {
          if(tempErr) tempErr.remove();
        }, 3000);
        resetConfirmation();
        return;
      }
      
      const errDiv = document.querySelector('.temp-error-msg');
      if(errDiv) errDiv.remove();
      
      console.log(`✅ Form sent: ${fullName}, ${studentEmail}, ${subject}, message length: ${message.length}`);
      showConfirmation(fullName);
      document.getElementById('messageBox').value = '';
      
      const btn = form.querySelector('.btn-submit');
      const originalText = btn.innerHTML;
      btn.innerHTML = '✓ Sent!';
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 2000);
    });
  })();