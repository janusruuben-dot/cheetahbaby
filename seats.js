document.addEventListener('DOMContentLoaded', () => {

    // --- Dynamic Hydration ---
    const params = new URLSearchParams(window.location.search);
    const matchId = params.get('id');
    let currentMatch = null;

    if (matchId && typeof matchesData !== 'undefined') {
        currentMatch = getMatchById(matchId);
        if (currentMatch) {
            document.getElementById('dynSeatTitle').innerText = `TATA IPL 2026: ${currentMatch.matchNumber} | ${currentMatch.team1.short} vs ${currentMatch.team2.short}`;
            
            const city = currentMatch.venue.split(',').pop().trim();
            document.getElementById('dynSeatSubtitle').innerText = `${currentMatch.date.dayStr}, ${currentMatch.date.dayNum} ${currentMatch.date.month}, ${currentMatch.time} | ${city}`;
            
            document.getElementById('btnBackToMatch').href = `match.html?id=${matchId}`;
        }
    }



    // --- 2. Live Viewer Count ---
    const liveViewersEl = document.getElementById('liveViewers');
    let viewerCount = 2400 + Math.floor(Math.random() * 800);
    liveViewersEl.innerText = viewerCount.toLocaleString();
    
    setInterval(() => {
        viewerCount += Math.floor(Math.random() * 18) - 5;
        viewerCount = Math.max(1800, viewerCount);
        liveViewersEl.innerText = viewerCount.toLocaleString();
    }, 4000);


    // --- 3. Stadium Map Interaction ---
    const sectionToast = document.getElementById('sectionToast');
    const toastName = document.getElementById('toastName');
    const toastPrice = document.getElementById('toastPrice');
    const toastSeats = document.getElementById('toastSeats');
    const toastPickBtn = document.getElementById('toastPickBtn');
    const availableSections = document.querySelectorAll('.std-section.avail');
    
    let currentSectionPrice = 0;
    let currentSectionName = '';
    let selectedSeatsCount = 0;
    let fomoTriggered = false;
    let activeSection = null;

    // Section click handler
    availableSections.forEach(section => {
        section.addEventListener('click', (e) => {
            e.stopPropagation();
            const name = section.dataset.section;
            const price = parseInt(section.dataset.price);
            
            // Highlight active section
            if (activeSection) activeSection.classList.remove('active-section');
            section.classList.add('active-section');
            activeSection = section;
            
            // Random seats left based on price
            let seatsLeft;
            if (price >= 6999) seatsLeft = 3 + Math.floor(Math.random() * 5);
            else if (price >= 4999) seatsLeft = 8 + Math.floor(Math.random() * 10);
            else if (price >= 1599) seatsLeft = 15 + Math.floor(Math.random() * 15);
            else seatsLeft = 25 + Math.floor(Math.random() * 20);
            
            // Populate toast
            toastName.innerText = name;
            toastPrice.innerText = `₹${price.toLocaleString()}`;
            toastSeats.innerText = `· ${seatsLeft} seats left`;
            currentSectionPrice = price;
            currentSectionName = name;
            
            // Show toast
            sectionToast.classList.add('visible');
        });
    });

    // Clicking outside hides toast
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.std-section.avail') && !e.target.closest('.section-toast')) {
            sectionToast.classList.remove('visible');
            if (activeSection) {
                activeSection.classList.remove('active-section');
                activeSection = null;
            }
        }
    });

    // Toast "PICK SEATS" button opens overlay
    toastPickBtn.addEventListener('click', () => {
        openSeatOverlay(currentSectionName, currentSectionPrice);
        sectionToast.classList.remove('visible');
    });


    // --- 4. Seat Overlay ---
    const overlay = document.getElementById('seatOverlay');
    const closeOverlayBtn = document.getElementById('closeOverlay');
    const overlaySectionName = document.getElementById('overlaySectionName');
    const overlaySectionPrice = document.getElementById('overlaySectionPrice');
    const demandBadge = document.getElementById('demandBadge');

    function openSeatOverlay(name, price) {
        overlaySectionName.innerText = name;
        overlaySectionPrice.innerText = `₹${price.toLocaleString()} per seat`;
        currentSectionPrice = price;
        fomoTriggered = false;
        
        // Demand badge
        if (price >= 6999) {
            demandBadge.innerText = '🔥 High demand';
            demandBadge.style.display = 'block';
        } else if (price >= 4999) {
            demandBadge.innerText = '⚡ Filling fast';
            demandBadge.style.display = 'block';
        } else {
            demandBadge.style.display = 'none';
        }
        
        selectedSeatsCount = 0;
        updateTotal();
        generateSeatGrid(price);
        
        overlay.classList.add('active');
    }

    closeOverlayBtn.addEventListener('click', () => {
        overlay.classList.remove('active');
        if (activeSection) {
            activeSection.classList.remove('active-section');
            activeSection = null;
        }
    });


    // --- 5. Seat Grid Logic ---
    const seatGrid = document.getElementById('seatGrid');
    const rowLabels = document.getElementById('rowLabels');
    const totalAmountEl = document.getElementById('totalAmount');
    const totalSavingsEl = document.getElementById('totalSavings');
    const btnProceed = document.getElementById('btnProceed');

    function generateSeatGrid(price) {
        seatGrid.innerHTML = '';
        rowLabels.innerHTML = '';
        
        // Increased total seats and availability
        const rows = 12; 
        const cols = 12;
        // Scarcity mode: Only 20% seats available
        const availPct = 0.20;
        
        const totalSeats = rows * cols;
        const availableCount = Math.floor(totalSeats * availPct);
        
        let seats = Array(totalSeats).fill('booked');
        
        // --- Grouped Availability Logic ---
        let filled = 0;
        while (filled < availableCount) {
            let start = Math.floor(Math.random() * totalSeats);
            let clusterSize = 6 + Math.floor(Math.random() * 10); 
            for (let i = 0; i < clusterSize && filled < availableCount; i++) {
                let idx = (start + i) % totalSeats;
                if (seats[idx] === 'booked') {
                    seats[idx] = 'available';
                    filled++;
                }
            }
        }

        const rowLetters = 'ABCDEFGHIJKL';
        for (let r = 0; r < rows; r++) {
            const label = document.createElement('div');
            label.classList.add('row-label');
            label.innerText = rowLetters[r];
            rowLabels.appendChild(label);
        }

        seats.forEach((status, index) => {
            const seat = document.createElement('div');
            seat.classList.add('seat', status);
            seat.dataset.index = index;
            const col = (index % cols) + 1;
            if (status === 'available') seat.innerText = col;
            
            seat.style.opacity = '0';
            seat.style.transform = 'scale(0.5)';
            setTimeout(() => {
                seat.style.transition = 'opacity 0.15s, transform 0.15s, background 0.15s, border-color 0.15s';
                seat.style.opacity = '1';
                seat.style.transform = 'scale(1)';
            }, 5 + (index * 4));
            
            if (status === 'available') {
                seat.addEventListener('click', () => {
                    if (seat.classList.contains('selected')) {
                        seat.classList.remove('selected');
                        seat.classList.add('available');
                        selectedSeatsCount--;
                    } else {
                        seat.classList.remove('available');
                        seat.classList.add('selected');
                        selectedSeatsCount++;
                        if (!fomoTriggered) {
                            fomoTriggered = true;
                            triggerFOMOSellout(index);
                        }
                    }
                    updateTotal();
                });
            }
            seatGrid.appendChild(seat);
        });
    }

    function triggerFOMOSellout(userSeatIndex) {
        const allSeats = seatGrid.querySelectorAll('.seat');
        const candidates = [];
        allSeats.forEach((s, i) => {
            if (s.classList.contains('available') && !s.classList.contains('selected') && Math.abs(i - userSeatIndex) > 3) {
                candidates.push(s);
            }
        });
        candidates.sort(() => Math.random() - 0.5);
        const toSell = candidates.slice(0, 2);
        toSell.forEach((s, i) => {
            setTimeout(() => {
                s.classList.remove('available');
                s.classList.add('booked');
                s.innerText = '';
                s.style.cursor = 'not-allowed';
                const badge = document.createElement('div');
                badge.classList.add('sold-out-badge');
                badge.innerText = 'SOLD';
                s.appendChild(badge);
                setTimeout(() => badge.remove(), 3000);
            }, 1000 + (i * 1500));
        });
    }

    function updateTotal() {
        const total = selectedSeatsCount * currentSectionPrice;
        totalAmountEl.innerText = `₹${Math.round(total).toLocaleString('en-IN')}`;
        if (selectedSeatsCount >= 2) {
            totalSavingsEl.style.display = 'block';
            totalSavingsEl.innerText = '🎽 Free jersey included!';
        } else {
            totalSavingsEl.style.display = 'none';
        }
        if (selectedSeatsCount > 0) {
            btnProceed.disabled = false;
            btnProceed.innerText = `Proceed · ${selectedSeatsCount} seat${selectedSeatsCount > 1 ? 's' : ''}`;
        } else {
            btnProceed.disabled = true;
            btnProceed.innerText = 'Proceed';
        }
    }
    
    // --- 6. Flow Control (Reserving -> Bottom Sheet -> Processing -> Review) ---
    const reservingOverlay = document.getElementById('reservingOverlay');
    const detailsSheet = document.getElementById('detailsSheet');
    const detailsBackdrop = document.getElementById('detailsBackdrop');
    const processingOverlay = document.getElementById('processingOverlay');
    const btnContinueFinal = document.getElementById('btnContinueFinal');

    btnProceed.addEventListener('click', () => {
        // Show reserving spinner first
        reservingOverlay.classList.add('active');
        
        setTimeout(() => {
            reservingOverlay.classList.remove('active');
            
            // Populate order summary in the sheet
            document.getElementById('sheetSection').innerText = overlaySectionName.innerText;
            document.getElementById('sheetSeats').innerText = `${selectedSeatsCount} seat${selectedSeatsCount > 1 ? 's' : ''}`;
            document.getElementById('sheetTotal').innerText = `₹${Math.round(selectedSeatsCount * currentSectionPrice).toLocaleString('en-IN')}`;
            
            // Slide up bottom sheet
            detailsBackdrop.classList.add('active');
            detailsSheet.classList.add('active');
        }, 2000);
    });

    // Close sheet on backdrop tap
    detailsBackdrop.addEventListener('click', () => {
        detailsSheet.classList.remove('active');
        detailsBackdrop.classList.remove('active');
    });

    btnContinueFinal.addEventListener('click', () => {
        const name = document.getElementById('userName').value.trim();
        const phone = document.getElementById('userPhone').value.trim();
        const email = document.getElementById('userEmail').value.trim();

        if (!name) { document.getElementById('userName').focus(); alert("Please enter your name."); return; }
        if (!phone || phone.length < 10) { document.getElementById('userPhone').focus(); alert("Please enter a valid 10-digit mobile number."); return; }
        if (!email || !email.includes('@')) { document.getElementById('userEmail').focus(); alert("Please enter a valid email address."); return; }

        // Hide sheet, show processing
        detailsSheet.classList.remove('active');
        detailsBackdrop.classList.remove('active');
        processingOverlay.classList.add('active');

        const bookingData = {
            matchId: currentMatch ? currentMatch.id : (matchId || 'unknown'),
            sectionName: overlaySectionName.innerText,
            sectionPrice: currentSectionPrice,
            seatsCount: selectedSeatsCount,
            totalAmount: selectedSeatsCount * currentSectionPrice,
            userData: {
                name: name,
                phone: `+91 ${phone}`,
                email: email
            }
        };
        localStorage.setItem('bookingData', JSON.stringify(bookingData));

        // 3 second loading then redirect
        setTimeout(() => {
            window.location.href = "review.html";
        }, 3000);
    });

});
