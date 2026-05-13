document.addEventListener('DOMContentLoaded', () => {

    // Bottom Navigation Logic
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Render dynamically
    const partnerLogosContainer = document.getElementById('partnerLogosContainer');
    const teamsListContainer = document.getElementById('teamsListContainer');
    
    if (typeof TEAMS_INFO !== 'undefined' && typeof TEAM_LOGOS !== 'undefined') {
        // Just take the first 5 teams for the partner logos
        const partnerTeams = ["CSK", "DC", "PBKS", "SRH", "RR"];
        if (partnerLogosContainer) {
            partnerLogosContainer.innerHTML = partnerTeams.map(t => 
                `<div class="team-logo-small ${TEAMS_INFO[t].cssClass}"><img src="${TEAM_LOGOS[t]}" alt="${t}" class="partner-logo-img"></div>`
            ).join('');
        }

        if (teamsListContainer) {
            const allTeams = Object.keys(TEAMS_INFO);
            teamsListContainer.innerHTML = allTeams.map(t => `
                <div class="team-row">
                    <div class="team-logo-tiny ${TEAMS_INFO[t].cssClass}"><img src="${TEAM_LOGOS[t]}" alt="${t}" class="tiny-logo-img"></div>
                    <span class="team-full-name">${t} - ${TEAMS_INFO[t].name}</span>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#666" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
            `).join('');
        }
    }

    // Render Matches dynamically
    const matchListContainer = document.getElementById('matchListContainer');
    if (matchListContainer && typeof matchesData !== 'undefined') {
        const now = new Date(); // Current local time
        
        matchesData.forEach(match => {
            // Filter out matches that have already passed
            if (new Date(match.datetime) <= now) {
                return; // Skip rendering this match
            }
            
            // Build the team logos row, adding background color if specified (like KKR)
            let kkrStyle = match.team2.short === 'KKR' ? 'style="background:#3A225D"' : '';
            if (match.team1.short === 'KKR') {
                // Adjust if team 1 is KKR, though data doesn't currently have it
            }

            let buttonHtml = '';
            if (match.status === 'live') {
                buttonHtml = `
                    <div class="sale-status">
                        <span class="dot green"></span> Sale is live
                    </div>
                    <a href="match.html?id=${match.id}" class="btn-book" style="text-decoration:none; text-align:center; display:inline-block;">Book tickets</a>
                `;
            } else {
                buttonHtml = `<button class="btn-coming-soon">Coming soon</button>`;
            }

            const matchHtml = `
                <div class="match-item">
                    <div class="date-tab">
                        <span class="day-name">${match.date.dayStr}</span>
                        <span class="date-num">${match.date.dayNum}</span>
                        <span class="month-name">${match.date.month}</span>
                    </div>
                    <div class="match-card">
                        <div class="match-teams-row">
                            <div class="team-logo ${match.team1.cssClass}"><img src="${match.team1.logo}" alt="${match.team1.short}" class="team-logo-img"></div>
                            <div class="team-names">
                                <span>${match.team1.name}</span>
                                <span class="vs">vs</span>
                                <span>${match.team2.name}</span>
                            </div>
                            <div class="team-logo ${match.team2.cssClass}" ${kkrStyle}><img src="${match.team2.logo}" alt="${match.team2.short}" class="team-logo-img"></div>
                        </div>
                        <div class="match-venue">${match.venue}</div>
                        <div class="match-time">${match.time} Onwards</div>
                        <div class="match-footer">
                            ${buttonHtml}
                        </div>
                    </div>
                </div>
            `;
            matchListContainer.innerHTML += matchHtml;
        });
    }

});
