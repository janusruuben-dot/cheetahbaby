document.addEventListener('DOMContentLoaded', () => {

    // Get ID from URL
    const params = new URLSearchParams(window.location.search);
    const matchId = params.get('id');

    if (matchId && typeof matchesData !== 'undefined') {
        const match = getMatchById(matchId);
        
        if (match) {
            // Update Hero Background if provided
            const heroSection = document.getElementById('dynHeroSection');
            const heroMock = document.getElementById('dynHeroMock');
            
            if (match.heroBg) {
                const heroImg = document.getElementById('dynHeroImage');
                if (heroImg) {
                    heroImg.src = match.heroBg;
                    heroImg.style.display = 'block';
                }
                if (heroMock) heroMock.style.display = 'none';
                heroSection.style.background = 'transparent';
            } else {
                // Fallback to dynamic logos
                const team1Logo = document.getElementById('dynTeam1Logo');
                const team2Logo = document.getElementById('dynTeam2Logo');
                team1Logo.innerHTML = `<img src="${match.team1.logo}" alt="${match.team1.short}" class="hero-logo-img">`;
                team1Logo.className = `hero-logo-circle ${match.team1.cssClass}`;
                team2Logo.innerHTML = `<img src="${match.team2.logo}" alt="${match.team2.short}" class="hero-logo-img">`;
                team2Logo.className = `hero-logo-circle ${match.team2.cssClass}`;
            }

            // Update Title and Date
            document.getElementById('dynMatchTitle').innerText = `TATA IPL 2026: ${match.matchNumber} | ${match.team1.name} vs ${match.team2.name}`;
            document.getElementById('dynMatchDateTime').innerText = `${match.date.dayStr}, ${match.date.dayNum} ${match.date.month}, ${match.time}`;
            
            // Update Venue
            document.getElementById('dynVenue').innerText = match.venue;
            document.getElementById('dynDistance').innerText = match.distance;

            // Highlights
            document.getElementById('dynStandoutText').innerText = `High-octane clash: ${match.team1.name} vs ${match.team2.name}`;
            document.getElementById('dynJerseyOffer').innerText = `${match.team1.short} fan jersey 2026`;
            
            // About
            document.getElementById('dynAboutText').innerText = `Get set for an electrifying clash as ${match.team1.name} take on ${match.team2.name} in a battle packed with power-hitting and high-intensity action. Playing at their home ground, ${match.team1.short} will look to capitalize on familiar conditions.`;

            // Price
            document.getElementById('dynBasePrice').innerHTML = `${formatCurrency(match.basePrice)} <span class="onwards">onwards</span>`;

            // Update Book Button URL
            document.getElementById('btnBookTickets').href = `seats.html?id=${match.id}`;
        }
    }

    // Smooth Parallax Effect
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroSection = document.getElementById('dynHeroSection');
        const heroContent = document.getElementById('dynHeroPlaceholder');
        const heroImage = document.getElementById('dynHeroImage');
        
        if (scrolled < 450) { // Only animate when in view
            if (heroSection) {
                heroSection.style.transform = `translateY(${scrolled * 0.3}px)`;
            }
            if (heroContent) {
                heroContent.style.opacity = 1 - (scrolled / 300);
                heroContent.style.transform = `translateY(${scrolled * 0.1}px)`;
            }
            if (heroImage) {
                heroImage.style.transform = `scale(${1 + scrolled * 0.0005})`;
            }
        }
    });
});
