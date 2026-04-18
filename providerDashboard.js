// ========== JAVASCRIPT CODE (SEPARATE) ==========
  (function() {
    // ---------- STATE ----------
    let bookingsCount = 3;          // upcoming bookings
    let servicesCount = 2;          // active services
    let progressPercent = 65;       // completion percentage
    let notificationsUnread = 5;    // unread notifications count

    // DOM elements
    const bookingsEl = document.getElementById('bookingsCount');
    const servicesEl = document.getElementById('servicesCount');
    const progressPercentSpan = document.getElementById('progressPercent');
    const progressFillDiv = document.getElementById('progressFill');
    const progressMsgSpan = document.getElementById('progressMessage');
    const notifBadgeSpan = document.getElementById('notifBadge');
    const notifContainer = document.getElementById('notificationsList');

    // Helper: show toast message
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

    // Recalculate progress based on services and bookings (dynamic)
    function recalcProgress() {
      let newProgress = 30 + (servicesCount * 10) + (bookingsCount * 5);
      if (newProgress > 100) newProgress = 100;
      if (newProgress < 0) newProgress = 0;
      progressPercent = newProgress;
      updateUI();
      showToast(`📊 Progress updated to ${progressPercent}%`, 1500);
    }

    // Update all UI elements according to current state
    function updateUI() {
      // update stats numbers
      bookingsEl.innerText = bookingsCount;
      servicesEl.innerText = servicesCount;
      // progress bar & percentage
      progressPercentSpan.innerText = progressPercent + '%';
      progressFillDiv.style.width = progressPercent + '%';
      // progress message based on threshold
      if (progressPercent >= 65) {
        progressMsgSpan.innerHTML = '🎯 You’re on track with your goals!';
      } else if (progressPercent >= 40) {
        progressMsgSpan.innerHTML = '📚 Keep going! You’re making steady progress.';
      } else {
        progressMsgSpan.innerHTML = '🌱 Start posting services to boost progress.';
      }
      // notification badge
      notifBadgeSpan.innerText = notificationsUnread + ' new';
    }

    // Mark all notifications as read (visual + badge)
    function markNotificationsRead() {
      if (notificationsUnread === 0) return false;
      notificationsUnread = 0;
      updateUI();
      // style change for notification items: mark them as read (soften)
      const notifItems = document.querySelectorAll('#notificationsList .notif-item');
      notifItems.forEach(item => {
        item.style.opacity = '0.75';
        item.style.backgroundColor = '#f4f7fb';
        item.style.borderLeftColor = '#a0c4e2';
      });
      return true;
    }

    // Reset unread notifications and restore fresh look (for logout simulation)
    function resetNotificationsToUnread() {
      notificationsUnread = 5;
      updateUI();
      const notifItems = document.querySelectorAll('#notificationsList .notif-item');
      notifItems.forEach(item => {
        item.style.opacity = '1';
        item.style.backgroundColor = '#fef9e6';
        item.style.borderLeftColor = '#f4b942';
      });
    }

    // ------ ACTION HANDLERS ------
    function handleAddService() {
      servicesCount += 1;
      recalcProgress();   // recalc + toast + UI update
      showToast(`✅ New service added! Active services: ${servicesCount}`);
    }

    function handleViewBookings() {
      showToast(`📅 You have ${bookingsCount} upcoming booking${bookingsCount !== 1 ? 's' : ''}. Check calendar for details.`);
    }

    function handleCheckNotifications() {
      if (notificationsUnread > 0) {
        markNotificationsRead();
        showToast(`🔕 All notifications marked as read. No new alerts.`);
      } else {
        showToast(`📭 You already checked all notifications.`);
      }
    }

    function handleLogout() {
      showToast(`👋 Logged out from Campus Connect. See you soon!`, 1800);
      // Reset to initial dashboard state as shown in the picture after short delay
      setTimeout(() => {
        // restore default picture values: bookings=3, services=2, progress recalc based on these
        bookingsCount = 3;
        servicesCount = 2;
        // recalc progress ensures correct 65%
        let freshProgress = 30 + (servicesCount * 10) + (bookingsCount * 5);
        if (freshProgress > 100) freshProgress = 100;
        progressPercent = freshProgress;
        notificationsUnread = 5;
        updateUI();
        // reset notification items style to original (unread style)
        const notifItems = document.querySelectorAll('#notificationsList .notif-item');
        notifItems.forEach(item => {
          item.style.opacity = '1';
          item.style.backgroundColor = '#fef9e6';
          item.style.borderLeftColor = '#f4b942';
        });
        showToast(`🔄 Session restarted. Welcome back to Campus Connect!`, 1800);
      }, 700);
    }

    // Bind all event listeners
    function bindEvents() {
      // main column buttons
      document.getElementById('addServiceBtn').addEventListener('click', handleAddService);
      document.getElementById('viewBookingsBtn').addEventListener('click', handleViewBookings);
      document.getElementById('checkNotifBtn').addEventListener('click', handleCheckNotifications);
      // sidebar buttons
      document.getElementById('sidebarAddService').addEventListener('click', handleAddService);
      document.getElementById('sidebarViewBookings').addEventListener('click', handleViewBookings);
      document.getElementById('sidebarCheckNotif').addEventListener('click', handleCheckNotifications);
      // logout button
      document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    }

    // Initialize dashboard
    function init() {
      updateUI();
      bindEvents();
      // ensure progress bar animation is consistent
      progressFillDiv.style.transition = 'width 0.5s ease';
    }

    init();
  })();



  (function() {
        // DOM elements
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const drawerOverlay = document.getElementById('drawerOverlay');
        const drawer = document.getElementById('drawer');
        const profileCircle = document.getElementById('profileCircleBtn');
        const profileModal = document.getElementById('profileModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const cancelModalBtn = document.getElementById('cancelModalBtn');
        const saveAllBtn = document.getElementById('saveAllBtn');
        const fullNameInput = document.getElementById('fullNameInput');
        const emailInput = document.getElementById('emailInput');
        const editNameIcon = document.getElementById('editNameIcon');
        const editEmailIcon = document.getElementById('editEmailIcon');
        const changePwBtn = document.getElementById('changePwBtn');
        const passwordModal = document.getElementById('passwordModal');
        const closePwModalBtn = document.getElementById('closePwModalBtn');
        const cancelPwBtn = document.getElementById('cancelPwBtn');
        const submitPwBtn = document.getElementById('submitPwBtn');
        const currentPasswordInput = document.getElementById('currentPassword');
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        
        // Profile picture elements
        const profilePicInput = document.getElementById('profilePicInput');
        const uploadPicBtn = document.getElementById('uploadPicBtn');
        const avatarLargeContainer = document.getElementById('avatarLargeContainer');
        const largeAvatarPlaceholder = document.getElementById('largeAvatarPlaceholder');
        const largeAvatarImg = document.getElementById('largeAvatarImg');
        const avatarImage = document.getElementById('avatarImage');
        const avatarPreviewText = document.getElementById('avatarPreviewText');

        let currentProfileImageData = null; // null = default avatar

        // Toast helper
        function showToast(message, duration = 2200) {
            let existing = document.querySelector('.toast-message');
            if(existing) existing.remove();
            const toast = document.createElement('div');
            toast.className = 'toast-message';
            toast.innerText = message;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }

        // Update UI for avatar (top circle + modal preview)
        function updateProfilePictureUI(imageDataUrl) {
            if (imageDataUrl) {
                avatarImage.src = imageDataUrl;
                avatarImage.style.display = 'block';
                avatarPreviewText.style.display = 'none';
                largeAvatarImg.src = imageDataUrl;
                largeAvatarImg.style.display = 'block';
                largeAvatarPlaceholder.style.display = 'none';
            } else {
                avatarImage.style.display = 'none';
                avatarPreviewText.style.display = 'flex';
                avatarPreviewText.innerText = '👤';
                largeAvatarImg.style.display = 'none';
                largeAvatarPlaceholder.style.display = 'flex';
                largeAvatarPlaceholder.innerText = '👤';
            }
        }

        // Handle image upload from file
        function handleImageUpload(file) {
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                currentProfileImageData = e.target.result;
                updateProfilePictureUI(currentProfileImageData);
                showToast('Profile picture updated!');
            };
            reader.readAsDataURL(file);
        }

        uploadPicBtn.addEventListener('click', () => profilePicInput.click());
        avatarLargeContainer.addEventListener('click', () => profilePicInput.click());
        profilePicInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleImageUpload(e.target.files[0]);
            }
        });

        // Save name & email logic
        function saveProfileInfo(showMsg = true) {
            const newName = fullNameInput.value.trim();
            const newEmail = emailInput.value.trim();
            if (newName === "") {
                showToast("Name cannot be empty");
                return false;
            }
            if (!newEmail.includes("@") || !newEmail.includes(".")) {
                showToast("Please enter a valid email address");
                return false;
            }
            if (showMsg) showToast(`Profile info updated: ${newName} · ${newEmail}`);
            return true;
        }

        editNameIcon.addEventListener('click', () => saveProfileInfo(true));
        editEmailIcon.addEventListener('click', () => saveProfileInfo(true));
        
        saveAllBtn.addEventListener('click', () => {
            if (saveProfileInfo(true)) {
                // image is already saved in state
                showToast('All changes saved successfully!');
                profileModal.classList.remove('open');
            }
        });

        // Password modal handlers
        function openPasswordModal() {
            currentPasswordInput.value = '';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
            passwordModal.classList.add('open');
        }
        function closePasswordModal() {
            passwordModal.classList.remove('open');
        }
        changePwBtn.addEventListener('click', openPasswordModal);
        closePwModalBtn.addEventListener('click', closePasswordModal);
        cancelPwBtn.addEventListener('click', closePasswordModal);
        
        submitPwBtn.addEventListener('click', () => {
            const current = currentPasswordInput.value;
            const newPw = newPasswordInput.value;
            const confirmPw = confirmPasswordInput.value;
            if (!current) {
                showToast("Please enter current password");
                return;
            }
            if (newPw.length < 6) {
                showToast("New password must be at least 6 characters");
                return;
            }
            if (newPw !== confirmPw) {
                showToast("New passwords do not match");
                return;
            }
            showToast("✅ Password changed successfully (demo)");
            closePasswordModal();
        });

        // Profile modal open/close
        function openProfileModal() {
            profileModal.classList.add('open');
        }
        function closeProfileModal() {
            profileModal.classList.remove('open');
        }
        profileCircle.addEventListener('click', openProfileModal);
        closeModalBtn.addEventListener('click', closeProfileModal);
        cancelModalBtn.addEventListener('click', closeProfileModal);
        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal) closeProfileModal();
        });
        passwordModal.addEventListener('click', (e) => {
            if (e.target === passwordModal) closePasswordModal();
        });

        // Hamburger drawer logic (three-line symbol toggles navigation menu, saves screen space)
        function openDrawer() {
            drawer.classList.add('open');
            drawerOverlay.classList.add('open');
        }
        function closeDrawer() {
            drawer.classList.remove('open');
            drawerOverlay.classList.remove('open');
        }
        hamburgerBtn.addEventListener('click', openDrawer);
        drawerOverlay.addEventListener('click', closeDrawer);
        drawer.addEventListener('click', (e) => e.stopPropagation());

        // Initial setup
        updateProfilePictureUI(null);
        
        // Additional: show subtle instruction on load
        setTimeout(() => {
            showToast("☰ Click the three-line icon → opens navigation menu", 2500);
        }, 500);
    })();


 
    function navigateToAddServicePage() {
      // Option 1: Simple redirect to a new HTML file (uncomment the one you need)
      
      // Example: Redirect to "add-service.html" in the same directory
      window.location.href = "startHustle.html";
    };