document.addEventListener('DOMContentLoaded', () => {

    // --- Dynamic Hydration from Local Storage ---
    const bookingStr = localStorage.getItem('bookingData');
    let grandTotal = 0;

    if (bookingStr) {
        const booking = JSON.parse(bookingStr);
        
        // Update price info immediately from booking data
        document.getElementById('dynReviewSeatInfo').innerText = `${booking.seatsCount} x ${booking.sectionName}`;
        document.getElementById('dynReviewSeatPrice').innerText = formatCurrency(booking.totalAmount);
        document.getElementById('dynReviewOrderAmount').innerText = formatCurrency(booking.totalAmount);

        // Update Invoice Details with User Data
        if (booking.userData) {
            const invContainer = document.querySelector('.inv-details');
            if (invContainer) {
                invContainer.innerHTML = `
                    <div class="inv-name">${booking.userData.name}</div>
                    <div class="inv-contact">${booking.userData.email}</div>
                    <div class="inv-contact">${booking.userData.phone}</div>
                `;
            }
        }
        
        // Calculate fees dynamically (3% booking fee)
        const baseFee = booking.totalAmount * 0.03;
        const convenienceFee = Math.round(baseFee * 0.82); // ~82% goes to convenience
        const gst = Math.round(baseFee * 0.18); // ~18% GST on the fee
        const totalFee = convenienceFee + gst;

        document.getElementById('dynReviewFees').innerText = formatCurrency(totalFee);
        document.getElementById('fbConvenience').innerText = formatCurrency(convenienceFee);
        document.getElementById('fbGst').innerText = formatCurrency(gst);
        
        grandTotal = booking.totalAmount + totalFee;
        const formattedTotal = formatCurrency(grandTotal);
        document.getElementById('dynReviewGrandTotal').innerText = formattedTotal;
        document.getElementById('dynReviewBtnTotal').innerText = formattedTotal;

        // #5: Show discount banner if 2+ tickets
        if (booking.seatsCount >= 2) {
            const banner = document.getElementById('discountBanner');
            if (banner) banner.classList.add('visible');
        }

        // Try to fetch match details
        if (typeof matchesData !== 'undefined') {
            let match = getMatchById(booking.matchId);
            // Fallback: if matchId not found, use first match so page never shows ---
            if (!match && matchesData.length > 0) match = matchesData[0];

            if (match) {
                // Hero card title
                document.getElementById('dynReviewMatchTitle').innerText = `TATA IPL 2026 · ${match.matchNumber}`;
                
                // Team logos & short names
                document.getElementById('heroTeam1Logo').src = match.team1.logo || '';
                document.getElementById('heroTeam1Short').innerText = match.team1.short;
                document.getElementById('heroTeam2Logo').src = match.team2.logo || '';
                document.getElementById('heroTeam2Short').innerText = match.team2.short;

                // Date & venue
                document.getElementById('dynReviewDatetime').innerText = `${match.date.full} · ${match.time}`;
                document.getElementById('dynReviewMatchVenue').innerText = match.venue;

                // Set hero banner background image if available
                if (match.heroBg) {
                    document.getElementById('matchHeroBanner').style.backgroundImage = `url(${match.heroBg})`;
                }
            }
        }
    }

    // --- #6: Fee Breakdown Accordion ---
    const feeToggle = document.getElementById('feeToggle');
    const feeBreakdown = document.getElementById('feeBreakdown');
    if (feeToggle && feeBreakdown) {
        feeToggle.addEventListener('click', () => {
            feeBreakdown.classList.toggle('open');
            const arrow = feeToggle.querySelector('svg');
            if (arrow) {
                arrow.style.transition = 'transform 0.3s ease';
                arrow.style.transform = feeBreakdown.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        });
    }

    // --- #10: Pay Button with Spinner ---
    const btnPay = document.getElementById('btnPayNow');
    const payBtnText = document.getElementById('payBtnText');
    if (btnPay) {
        btnPay.addEventListener('click', () => {
            // Show spinner inside button
            payBtnText.innerHTML = '<div class="btn-spinner"></div>';
            btnPay.style.pointerEvents = 'none';
            
            setTimeout(() => {
                window.location.href = "payment.html";
            }, 1200);
        });
    }

    // --- Payment Overlay Logic ---
    const btnSelectPayment = document.getElementById('btnSelectPayment');
    const paymentOverlay = document.getElementById('paymentOverlay');
    const closePaymentOverlay = document.getElementById('closePaymentOverlay');
    const selectedPayLogo = document.getElementById('selectedPayLogo');
    const selectedPayMethod = document.getElementById('selectedPayMethod');
    const payListItems = document.querySelectorAll('.pay-list-item');

    if (btnSelectPayment && paymentOverlay) {
        btnSelectPayment.addEventListener('click', () => {
            paymentOverlay.classList.add('active');
        });

        closePaymentOverlay.addEventListener('click', () => {
            paymentOverlay.classList.remove('active');
        });

        payListItems.forEach(item => {
            item.addEventListener('click', () => {
                const method = item.getAttribute('data-method');
                const logoUrl = item.getAttribute('data-logo');
                
                selectedPayMethod.innerText = method;
                
                // Swap logo in bottom bar
                if (logoUrl) {
                    selectedPayLogo.src = logoUrl;
                    selectedPayLogo.style.display = '';
                } else {
                    // For "Other UPI Apps" — hide the logo
                    selectedPayLogo.style.display = 'none';
                }

                paymentOverlay.classList.remove('active');
            });
        });
    }

});
