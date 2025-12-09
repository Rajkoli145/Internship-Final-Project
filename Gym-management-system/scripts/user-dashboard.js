document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');
    const pageTitle = document.getElementById('page-title');
    const searchForm = document.getElementById('searchForm');
    const searchResults = document.getElementById('searchResults');

    const sectionTitles = {
        'search': 'Search Records',
        'details': 'Gym Details'
    };

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();

            const targetSection = this.getAttribute('data-section');

            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            sections.forEach(section => section.classList.remove('active'));
            const activeSection = document.getElementById(`${targetSection}-section`);
            if (activeSection) {
                activeSection.classList.add('active');
            }

            if (sectionTitles[targetSection]) {
                pageTitle.textContent = sectionTitles[targetSection];
            }
        });
    });

    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const searchType = document.getElementById('searchType').value;
            const searchQuery = document.getElementById('searchQuery').value;

            if (searchQuery.trim() === '') {
                alert('Please enter a search query');
                return;
            }

            console.log('Searching for:', searchType, searchQuery);

            if (searchResults) {
                searchResults.style.display = 'block';
            }

            alert(`Searching for ${searchType}: ${searchQuery}\n\nResults displayed below.`);
        });
    }
});

function quickSearch(type) {
    const searchResults = document.getElementById('searchResults');

    console.log('Quick search:', type);
    alert(`Quick search for: ${type}\n\nResults will be displayed.`);

    if (searchResults) {
        searchResults.style.display = 'block';
    }
}