// scripts/app.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Document loaded');

    // Category filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    const personaCards = document.querySelectorAll('.persona-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active state from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active state to current button
            button.classList.add('active');
            
            // Filter cards by category
            const filter = button.textContent.trim();
            
            personaCards.forEach(card => {
                if (filter === 'All') {
                    card.style.display = 'flex';
                    return;
                }
                
                if (filter === 'Favorites') {
                    // Favorites logic will be added in the future
                    card.style.display = 'flex';
                    return;
                }
                
                const role = card.querySelector('.persona-role')?.textContent || '';
                
                if (role.includes(filter)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Simulation type buttons
    const simulationTypeButtons = document.querySelectorAll('.simulation-type-card .start-btn');
    console.log('Found simulation buttons:', simulationTypeButtons.length);
    
    simulationTypeButtons.forEach((button, index) => {
        console.log(`Adding click listener to button ${index}`);
        button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log(`Button ${index} clicked`);
            
            const card = button.closest('.simulation-type-card');
            console.log('Found card:', card);
            
            const simulationType = card.querySelector('h3').textContent.trim();
            console.log('Starting simulation:', simulationType);
            
            // Add loading state to button
            button.textContent = 'Loading...';
            button.disabled = true;
            
            // Redirect with small delay to show loading state
            setTimeout(() => {
                const url = `simulation.html?type=${encodeURIComponent(simulationType)}`;
                console.log('Redirecting to:', url);
                window.location.href = url;
            }, 500);
        });
    });

    // New simulation button
    const newSimulationBtn = document.querySelector('.new-simulation-btn');
    console.log('Found new simulation button:', newSimulationBtn);
    
    if (newSimulationBtn) {
        newSimulationBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Starting new custom simulation');
            window.location.href = 'simulation.html?type=Custom';
        });
    }

    // Stats update
    function updateStats() {
        // Get stats elements
        const activeSimulations = document.querySelector('.stat-card:nth-child(1) .stat-value');
        const runningNow = document.querySelector('.stat-card:nth-child(2) .stat-value');
        const successRate = document.querySelector('.stat-card:nth-child(3) .stat-value');
        
        // Update with mock data for now
        if (activeSimulations) activeSimulations.textContent = '3';
        if (runningNow) runningNow.textContent = '1';
        if (successRate) successRate.textContent = '94%';
    }

    // Call stats update on load
    updateStats();

    // Update recent runs table
    function updateRecentRuns() {
        const tbody = document.querySelector('.recent-runs tbody');
        if (!tbody) return;

        const mockData = [
            { name: 'Market Research - Product A', status: 'Completed', started: '2 hours ago', duration: '45 min' },
            { name: 'Customer Behavior Analysis', status: 'Running', started: '1 hour ago', duration: '30 min' },
            { name: 'Economic Forecast Q2', status: 'Scheduled', started: 'In 1 hour', duration: '-' }
        ];

        tbody.innerHTML = mockData.map(run => `
            <tr>
                <td>${run.name}</td>
                <td><span class="status ${run.status.toLowerCase()}">${run.status}</span></td>
                <td>${run.started}</td>
                <td>${run.duration}</td>
            </tr>
        `).join('');
    }

    // Call recent runs update on load
    updateRecentRuns();
    
    // Add new persona
    const addNewCard = document.querySelector('.add-new');
    if (addNewCard) {
        addNewCard.addEventListener('click', () => {
            alert('Creating new persona. This functionality will be available soon!');
        });
    }
    
    // Search personas (future functionality)
    const searchInput = document.querySelector('.search-box input');
    const searchButton = document.querySelector('.search-btn');
    
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                alert(`Searching personas with: ${searchTerm}. This functionality will be available soon!`);
            }
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchButton.click();
            }
        });
    }
}); 
}); 