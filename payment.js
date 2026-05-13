document.addEventListener('DOMContentLoaded', async () => {

    // --- Fetch UPI ID from upi.txt ---
    let upiId = 'demo@upi';
    try {
        // Use cache-busting timestamp and no-store to ensure fresh fetch every time
        const res = await fetch('upi.txt?_=' + new Date().getTime(), { cache: 'no-store' });
        if (res.ok) {
            const txt = await res.text();
            upiId = txt.trim();
        }
    } catch (e) { /* fallback to default */ }

    document.getElementById('upiIdDisplay').innerText = upiId;

    // --- Dynamic Hydration from Local Storage ---
    const bookingStr = localStorage.getItem('bookingData');
    let grandTotal = 0;
    let merchantName = 'Pavilion IPL 2026';

    if (bookingStr) {
        const booking = JSON.parse(bookingStr);
        
        const baseFee = booking.totalAmount * 0.03;
        const convenienceFee = Math.round(baseFee * 0.82);
        const gst = Math.round(baseFee * 0.18);
        const totalFee = convenienceFee + gst;
        grandTotal = booking.totalAmount + totalFee;
        const formattedTotal = formatCurrency(grandTotal);

        document.getElementById('dynPayAmount').innerText = formattedTotal;
        document.getElementById('dynPaySeats').innerText = `${booking.seatsCount} x ${booking.sectionName}`;
    }

    // --- Generate real UPI QR Code ---
    generateUpiQR(upiId, grandTotal, merchantName);

    // --- Timer Logic (5 min) ---
    let timeLeft = 5 * 60;
    const countdownEl = document.getElementById('countdown');

    const timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            countdownEl.innerText = "00:00";
            alert("Payment session expired. Please restart your booking.");
            window.location.href = "index.html";
            return;
        }
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        countdownEl.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        timeLeft--;
    }, 1000);

    // --- Copy UPI Logic ---
    const btnCopy = document.getElementById('btnCopy');
    if (btnCopy) {
        btnCopy.addEventListener('click', () => {
            navigator.clipboard.writeText(upiId).then(() => {
                btnCopy.classList.add('copied');
                btnCopy.querySelector('span').innerText = 'Copied!';
                setTimeout(() => {
                    btnCopy.classList.remove('copied');
                    btnCopy.querySelector('span').innerText = 'Copy';
                }, 2000);
            });
        });
    }

    // --- Confirm Payment → go to success page ---
    const btnCompleted = document.getElementById('btnCompleted');
    if (btnCompleted) {
        btnCompleted.addEventListener('click', () => {
            window.location.href = "success.html";
        });
    }

});

// --- QR Code Generator ---
function generateUpiQR(upiId, amount, merchantName) {
    const qrImage = document.getElementById('qrImage');
    const qrLoading = document.getElementById('qrLoading');
    const qrSub = document.getElementById('qrSub');

    // Build UPI payment URL
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('IPL 2026 Ticket Booking')}`;

    // Use QR Server API to generate QR from UPI URL
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(upiUrl)}`;

    qrImage.onload = () => {
        // QR loaded — hide spinner, show image
        qrLoading.style.display = 'none';
        qrImage.style.display = 'block';
        if (amount > 0) {
            qrSub.innerText = `Scan to pay ₹${amount.toLocaleString('en-IN')}`;
        }
    };

    qrImage.onerror = () => {
        // Fallback: show UPI ID text instead
        qrLoading.innerHTML = '<span style="color:#999;">QR unavailable — use UPI ID below</span>';
    };

    qrImage.src = qrApiUrl;
}
