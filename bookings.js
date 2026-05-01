// Service Provider View: sees ALL bookings made by clients.
    // Uses localStorage with key "serviohub_user_bookings" (shared with client-side booking engine).
    // Provider can also update status, delete bookings, filter & track metrics.
  

    const STORAGE_KEY = "serviohub_user_bookings";

    // Initial client bookings see data as if clients have already booked
    let clientBookings = [];

    // Load from localStorage (shared across the application - clients and provider)
    function loadProviderBookings() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            clientBookings = JSON.parse(stored);
        } else {
            // Seed realistic bookings from different clients
            clientBookings = [
                {
                    id: "b1001",
                    serviceName: "Deep Tissue Massage",
                    date: "Apr 25, 2026",
                    time: "3:00 PM",
                    location: "Serenity Spa",
                    status: "confirmed",
                    clientName: "Alex Morgan",
                    clientEmail: "alex.m@example.com",
                    createdAt: "2026-04-18T10:30:00Z"
                },
                {
                    id: "b1002",
                    serviceName: "Weekly Yoga Flow",
                    date: "Apr 20, 2026",
                    time: "09:00 AM",
                    location: "Studio A",
                    status: "confirmed",
                    clientName: "Jamie Lin",
                    clientEmail: "jamie.lin@example.com",
                    createdAt: "2026-04-17T14:20:00Z"
                },
                {
                    id: "b1003",
                    serviceName: "Vocal Coaching Session",
                    date: "Apr 22, 2026",
                    time: "5:30 PM",
                    location: "Virtual",
                    status: "pending",
                    clientName: "Taylor Reed",
                    clientEmail: "taylor.r@example.com",
                    createdAt: "2026-04-19T09:15:00Z"
                },
                {
                    id: "b1004",
                    serviceName: "Personal Training (HIIT)",
                    date: "Apr 19, 2026",
                    time: "8:00 AM",
                    location: "Fitness Hub",
                    status: "completed",
                    clientName: "Jordan Smith",
                    clientEmail: "jordan.s@example.com",
                    createdAt: "2026-04-10T11:00:00Z"
                },
                {
                    id: "b1005",
                    serviceName: "Aromatherapy Massage",
                    date: "Apr 27, 2026",
                    time: "11:00 AM",
                    location: "Zen Spa",
                    status: "confirmed",
                    clientName: "Casey Wong",
                    clientEmail: "casey.w@example.com",
                    createdAt: "2026-04-19T16:45:00Z"
                }
            ];
            saveProviderBookings();
        }
        renderAllBookingsAndStats();
    }

    function saveProviderBookings() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clientBookings));
    }

    // Helper to update stats
    function updateStats(bookingsData) {
        const total = bookingsData.length;
        const confirmed = bookingsData.filter(b => b.status === 'confirmed').length;
        const completed = bookingsData.filter(b => b.status === 'completed').length;
        const uniqueClients = new Set(bookingsData.map(b => b.clientEmail?.toLowerCase() || b.clientName?.toLowerCase())).size;
        document.getElementById('totalBookingsCount').innerText = total;
        document.getElementById('confirmedCount').innerText = confirmed;
        document.getElementById('completedCount').innerText = completed;
        document.getElementById('uniqueClientsCount').innerText = uniqueClients;
    }

    // Render bookings table based on active filter
    let currentFilter = "all";

    function renderBookingsTable() {
        let filteredBookings = [...clientBookings];
        if (currentFilter !== "all") {
            filteredBookings = clientBookings.filter(b => b.status === currentFilter);
        }
        // sort by date (newest first approx by createdAt)
        filteredBookings.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

        const container = document.getElementById('bookingsTableContainer');
        if (!filteredBookings.length) {
            container.innerHTML = `<div class="empty-bookings">
                🧾 No client bookings found for filter "${currentFilter}".<br>
                Use "Simulate new booking" or wait for clients to book.
            </div>`;
            updateStats(clientBookings);
            return;
        }

        let tableHtml = `
            <table class="bookings-table">
                <thead>
                    <tr><th>Client</th><th>Service</th><th>Date & Time</th><th>Location</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
        `;
        filteredBookings.forEach(booking => {
            let statusClass = "";
            if (booking.status === 'confirmed') statusClass = "status-confirmed";
            else if (booking.status === 'pending') statusClass = "status-pending";
            else if (booking.status === 'completed') statusClass = "status-completed";
            else if (booking.status === 'cancelled') statusClass = "status-cancelled";
            
            tableHtml += `
                <tr data-booking-id="${booking.id}">
                    <td><strong>${escapeHtml(booking.clientName || "Anonymous")}</strong><br><span style="font-size:11px; color:#6f8f9c;">${escapeHtml(booking.clientEmail || "—")}</span></td>
                    <td>${escapeHtml(booking.serviceName)}</td>
                    <td>${escapeHtml(booking.date)} at ${escapeHtml(booking.time)}</td>
                    <td>${escapeHtml(booking.location)}</td>
                    <td><span class="booking-status ${statusClass}">${booking.status.toUpperCase()}</span></td>
                    <td>
                        <select class="action-status-dropdown" data-id="${booking.id}" style="padding:6px 8px; border-radius:30px; border:1px solid #cbdde6; font-size:12px;">
                            <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>✓ Confirm</option>
                            <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>⏳ Pending</option>
                            <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>🏁 Completed</option>
                            <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>❌ Cancel</option>
                        </select>
                        <button class="action-btn delete-booking" data-id="${booking.id}">🗑️ Delete</button>
                    </td>
                </tr>
            `;
        });
        tableHtml += `</tbody></table>`;
        container.innerHTML = tableHtml;

        // attach event listeners for status change
        document.querySelectorAll('.action-status-dropdown').forEach(dropdown => {
            dropdown.addEventListener('change', (e) => {
                const bookingId = dropdown.getAttribute('data-id');
                const newStatus = dropdown.value;
                updateBookingStatus(bookingId, newStatus);
            });
        });

        document.querySelectorAll('.delete-booking').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookingId = btn.getAttribute('data-id');
                if (confirm("Delete this client booking? This action cannot be undone.")) {
                    deleteBookingById(bookingId);
                }
            });
        });
        updateStats(clientBookings);
    }

    function updateBookingStatus(bookingId, newStatus) {
        const bookingIndex = clientBookings.findIndex(b => b.id === bookingId);
        if (bookingIndex !== -1) {
            clientBookings[bookingIndex].status = newStatus;
            saveProviderBookings();
            renderAllBookingsAndStats();
            showToast(`Booking status updated to ${newStatus} for client: ${clientBookings[bookingIndex].clientName}`);
        }
    }

    function deleteBookingById(bookingId) {
        clientBookings = clientBookings.filter(b => b.id !== bookingId);
        saveProviderBookings();
        renderAllBookingsAndStats();
        showToast("Booking removed from system.");
    }

    // Simulate a new client booking (as if a client booked from external page)
    function addSimulatedClientBooking() {
        const demoClientNames = ["Emma Watson", "Liam Chen", "Sophia Rodriguez", "Oliver Kim", "Ava Martinez"];
        const randomClient = demoClientNames[Math.floor(Math.random() * demoClientNames.length)];
        const servicesList = ["Hot Stone Massage", "Reiki Healing", "Pilates Reformer", "Meditation Circle", "Thai Yoga Massage"];
        const randomService = servicesList[Math.floor(Math.random() * servicesList.length)];
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 14) + 1);
        const dateStr = futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        const newBooking = {
            id: "sim_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
            serviceName: randomService,
            date: dateStr,
            time: `${Math.floor(Math.random() * 12) + 9}:00 ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
            location: "Wellness Hub",
            status: "pending",
            clientName: randomClient,
            clientEmail: `${randomClient.toLowerCase().replace(' ', '.')}@client.com`,
            createdAt: new Date().toISOString()
        };
        clientBookings.unshift(newBooking);
        saveProviderBookings();
        renderAllBookingsAndStats();
        showToast(`📢 New client booking from ${randomClient}: ${randomService} on ${dateStr}`);
    }

    function renderAllBookingsAndStats() {
        renderBookingsTable();
        updateStats(clientBookings);
    }

    function setActiveFilterButton(filterValue) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            const btnFilter = btn.getAttribute('data-filter');
            if (btnFilter === filterValue) {
                btn.classList.add('active-filter');
            } else {
                btn.classList.remove('active-filter');
            }
        });
    }

    function showToast(msg) {
        let existingToast = document.querySelector('.toast-provider');
        if (existingToast) existingToast.remove();
        const toast = document.createElement('div');
        toast.className = 'toast-provider';
        toast.innerText = msg;
        document.body.appendChild(toast);
        setTimeout(() => { if(toast) toast.remove(); }, 2800);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // Setup filter listeners
    function bindFilterEvents() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterValue = btn.getAttribute('data-filter');
                currentFilter = filterValue;
                setActiveFilterButton(filterValue);
                renderBookingsTable();
            });
        });
    }

    // Listen to storage changes (if multiple tabs/pages update bookings, provider updates automatically)
    window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY) {
            // Reload from storage when another tab updates bookings (client booking from other page)
            const updated = localStorage.getItem(STORAGE_KEY);
            if (updated) {
                clientBookings = JSON.parse(updated);
                renderAllBookingsAndStats();
                showToast("🔄 Bookings updated: new client booking detected from another page.");
            }
        }
    });

    function initProviderDashboard() {
        loadProviderBookings();
        bindFilterEvents();
        const simulateBtn = document.getElementById('simulateBookingBtn');
        if (simulateBtn) {
            simulateBtn.addEventListener('click', () => {
                addSimulatedClientBooking();
            });
        }
    }

    initProviderDashboard();