/**
 * Interactive Image Slider
 * Features: Manual navigation, automatic slideshow, position indicators, responsive design
 */

class ImageSlider {
    constructor() {
        // Image data array - using placeholder images for demonstration
        this.images = [
            {
                src: 'https://picsum.photos/800/400?random=1',
                title: 'Beautiful Landscape',
                description: 'A stunning view of mountains and valleys'
            },
            {
                src: 'https://picsum.photos/800/400?random=2',
                title: 'Ocean Waves',
                description: 'Peaceful waves crashing on the shore'
            },
            {
                src: 'https://picsum.photos/800/400?random=3',
                title: 'City Skyline',
                description: 'Modern architecture against the sky'
            },
            {
                src: 'https://picsum.photos/800/400?random=4',
                title: 'Forest Path',
                description: 'A winding path through lush greenery'
            },
            {
                src: 'https://picsum.photos/800/400?random=5',
                title: 'Desert Sunset',
                description: 'Golden hour in the vast desert'
            },
            {
                src: 'https://picsum.photos/800/400?random=6',
                title: 'Snowy Mountains',
                description: 'Majestic peaks covered in snow'
            }
        ];

        // Current slide index
        this.currentIndex = 0;
        
        // Auto-play settings
        this.isAutoPlaying = true;
        this.autoPlayInterval = null;
        this.autoPlaySpeed = 3000; // 3 seconds default
        
        // Current effect mode
        this.currentEffect = 'auto-play';
        
        // Travel destinations data for timed cards effect
        this.travelData = [
            {
                id: 1,
                title: "Santorini",
                subtitle: "Greece",
                description: "Experience the breathtaking sunsets and iconic blue-domed churches of this volcanic island paradise.",
                image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                color: "#4A90E2"
            },
            {
                id: 2,
                title: "Kyoto",
                subtitle: "Japan",
                description: "Discover ancient temples, traditional gardens, and the timeless beauty of Japan's cultural heart.",
                image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                color: "#E74C3C"
            },
            {
                id: 3,
                title: "Banff",
                subtitle: "Canada",
                description: "Immerse yourself in pristine wilderness with stunning mountain lakes and snow-capped peaks.",
                image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                color: "#27AE60"
            },
            {
                id: 4,
                title: "Maldives",
                subtitle: "Indian Ocean",
                description: "Relax in overwater bungalows surrounded by crystal-clear turquoise waters and coral reefs.",
                image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                color: "#3498DB"
            },
            {
                id: 5,
                title: "Machu Picchu",
                subtitle: "Peru",
                description: "Explore the mysterious ancient Incan citadel perched high in the Andes Mountains.",
                image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                color: "#F39C12"
            },
            {
                id: 6,
                title: "Bali",
                subtitle: "Indonesia",
                description: "Find serenity in lush rice terraces, ancient temples, and pristine tropical beaches.",
                image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                color: "#9B59B6"
            }
        ];
        
        // Timed cards state
        this.timedCardsIndex = 0;
        this.timedCardsInterval = null;
        this.isFullscreen = false;
        
        // DOM elements
        this.imageContainer = null;
        this.indicators = null;
        this.prevBtn = null;
        this.nextBtn = null;
        this.playPauseBtn = null;
        this.speedRange = null;
        this.speedValue = null;
        this.sliderContainer = null;
        this.toggleBtn = null;
        this.effectsMenu = null;
        
        // Initialize the slider
        this.init();
    }

    /**
     * Initialize the slider
     */
    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupSlider());
        } else {
            this.setupSlider();
        }
    }

    /**
     * Setup the slider after DOM is loaded
     */
    setupSlider() {
        // Get DOM elements
        this.imageContainer = document.getElementById('imageContainer');
        this.indicators = document.getElementById('indicators');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.speedRange = document.getElementById('speedRange');
        this.speedValue = document.getElementById('speedValue');
        this.sliderContainer = document.querySelector('.slider-container');
        this.toggleBtn = document.getElementById('toggleBtn');
        this.effectsMenu = document.getElementById('effectsMenu');

        // Check if all elements exist
        if (!this.imageContainer || !this.indicators) {
            console.error('Required DOM elements not found');
            return;
        }

        // Create slides and indicators
        this.createSlides();
        this.createIndicators();
        
        // Setup event listeners
        this.setupEventListeners();
        this.setupEffectsMenu();
        
        // Display first image
        this.showSlide(0);
        
        // Start auto-play
        this.startAutoPlay();
        
        console.log('Image slider initialized successfully');
    }

    /**
     * Create slide elements
     */
    createSlides() {
        // Show loading state
        this.imageContainer.innerHTML = '<div class="loading">Loading images...</div>';
        
        // Clear container and create slides
        setTimeout(() => {
            this.imageContainer.innerHTML = '';
            
            this.images.forEach((image, index) => {
                const slide = document.createElement('div');
                slide.className = 'slide';
                slide.innerHTML = `
                    <img src="${image.src}" alt="${image.title}" loading="${index === 0 ? 'eager' : 'lazy'}">
                    <div class="slide-overlay">
                        <div class="slide-title">${image.title}</div>
                        <div class="slide-description">${image.description}</div>
                    </div>
                `;
                this.imageContainer.appendChild(slide);
            });
        }, 500);
    }

    /**
     * Create position indicators
     */
    createIndicators() {
        this.indicators.innerHTML = '';
        
        this.images.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            indicator.addEventListener('click', () => this.goToSlide(index));
            this.indicators.appendChild(indicator);
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Navigation buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.previousSlide());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Play/Pause button
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => this.toggleAutoPlay());
        }

        // Speed control
        if (this.speedRange) {
            this.speedRange.addEventListener('input', (e) => this.changeSpeed(e.target.value));
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Touch/swipe support for mobile
        this.setupTouchEvents();

        // Pause auto-play on hover
        if (this.imageContainer) {
            this.imageContainer.addEventListener('mouseenter', () => this.pauseAutoPlay());
            this.imageContainer.addEventListener('mouseleave', () => this.resumeAutoPlay());
        }
    }

    /**
     * Setup effects menu functionality
     */
    setupEffectsMenu() {
        // Toggle menu visibility
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.effectsMenu.classList.toggle('show');
            });
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.effectsMenu && !this.effectsMenu.contains(e.target) && !this.toggleBtn.contains(e.target)) {
                this.effectsMenu.classList.remove('show');
            }
        });

        // Handle effect selection
        const effectBtns = document.querySelectorAll('.effect-btn');
        effectBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const effect = btn.getAttribute('data-effect');
                this.changeEffect(effect);
                
                // Update active state
                effectBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Close menu
                this.effectsMenu.classList.remove('show');
            });
        });
    }

    /**
     * Change slider effect
     */
    changeEffect(effect) {
        // Remove all effect classes
        this.sliderContainer.classList.remove('fade-effect', 'coverflow', 'fullscreen', 'stacked-cards');
        
        // Stop any running intervals
        this.stopAutoPlay();
        this.stopStackedCardsAutoplay();
        
        // Remove click handlers for stacked cards
        this.removeStackedCardsClickHandler();
        
        // Cleanup removed - timed cards effect no longer exists
        
        // Remove fullscreen overlay if it exists
        const overlay = document.querySelector('.fullscreen-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        this.currentEffect = effect;
        this.isFullscreen = false;

        switch (effect) {
            case 'auto-play':
                this.setupAutoPlayEffect();
                break;
            case 'fade':
                this.setupFadeEffect();
                break;
            case 'stacked-cards':
                this.setupStackedCardsEffect();
                break;
            case 'fullscreen':
                this.setupFullscreenEffect();
                break;
        }

        // Reset to first slide
        this.showSlide(0);
    }

    /**
     * Setup Auto-Play effect (default)
     */
    setupAutoPlayEffect() {
        // Reset to normal sliding behavior
        this.imageContainer.style.transform = '';
        const slides = this.imageContainer.querySelectorAll('.slide');
        slides.forEach((slide, index) => {
            slide.style.position = '';
            slide.style.opacity = '';
            slide.classList.remove('active', 'prev', 'next');
        });
        this.startAutoPlay();
    }

    /**
     * Setup Fade effect
     */
    setupFadeEffect() {
        this.sliderContainer.classList.add('fade-effect');
        
        const slides = this.imageContainer.querySelectorAll('.slide');
        slides.forEach((slide, index) => {
            slide.style.opacity = index === 0 ? '1' : '0';
            slide.classList.toggle('active', index === 0);
        });
        
        // Start auto-play for fade effect
        this.startAutoPlay();
    }


    /**
     * Setup Stacked Cards effect
     */
    setupStackedCardsEffect() {
        this.sliderContainer.classList.add('stacked-cards');
        this.stopAutoPlay();
        
        // Reorder slides for stacking effect
        this.reorderStackedCards();
        
        // Add click event listener for manual card swapping
        this.setupStackedCardsClickHandler();
        
        // Start stacked cards autoplay
        this.startStackedCardsAutoplay();
    }

    /**
     * Setup Coverflow 3D effect
     */
    setupCoverflowEffect() {
        this.sliderContainer.classList.add('coverflow');
        this.stopAutoPlay();
        
        const slides = this.imageContainer.querySelectorAll('.slide');
        slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev', 'next');
            if (index === this.currentIndex) {
                slide.classList.add('active');
            } else if (index === this.currentIndex - 1) {
                slide.classList.add('prev');
            } else if (index === this.currentIndex + 1) {
                slide.classList.add('next');
            }
        });
    }

    /**
     * Setup Fullscreen effect
     */
    setupFullscreenEffect() {
        // Create fullscreen overlay
        const overlay = document.createElement('div');
        overlay.className = 'fullscreen-overlay';
        document.body.appendChild(overlay);

        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'fullscreen-close';
        closeBtn.innerHTML = '×';
        closeBtn.addEventListener('click', () => this.exitFullscreen());
        document.body.appendChild(closeBtn);

        // Clone the slider container for fullscreen
        const fullscreenSlider = this.sliderContainer.cloneNode(true);
        fullscreenSlider.classList.add('fullscreen');
        fullscreenSlider.id = 'fullscreen-slider';
        
        // Hide original slider
        this.sliderContainer.style.display = 'none';
        
        // Add fullscreen slider to body
        document.body.appendChild(fullscreenSlider);
        
        this.isFullscreen = true;
        
        // Update references to fullscreen elements
        this.fullscreenContainer = fullscreenSlider;
        this.fullscreenImageContainer = fullscreenSlider.querySelector('.image-container');
        this.fullscreenPrevBtn = fullscreenSlider.querySelector('.prev-btn');
        this.fullscreenNextBtn = fullscreenSlider.querySelector('.next-btn');
        
        // Add event listeners to fullscreen controls
        if (this.fullscreenPrevBtn) {
            this.fullscreenPrevBtn.addEventListener('click', () => this.previousSlide());
        }
        if (this.fullscreenNextBtn) {
            this.fullscreenNextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        // Show overlay
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
        
        // Start auto-play for fullscreen effect
        this.startAutoPlay();

        // Add escape key listener
        this.fullscreenEscapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.exitFullscreen();
            }
        };
        document.addEventListener('keydown', this.fullscreenEscapeHandler);

        // Update fullscreen slider position
        this.updateFullscreenSlider();
        this.startAutoPlay();
    }

    /**
     * Exit fullscreen mode
     */
    exitFullscreen() {
        const overlay = document.querySelector('.fullscreen-overlay');
        const closeBtn = document.querySelector('.fullscreen-close');
        const fullscreenSlider = document.getElementById('fullscreen-slider');
        
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
        }
        
        if (closeBtn) {
            closeBtn.remove();
        }

        if (fullscreenSlider) {
            fullscreenSlider.remove();
        }

        // Show original slider
        this.sliderContainer.style.display = '';
        this.sliderContainer.classList.remove('fullscreen');
        this.isFullscreen = false;

        // Remove escape key listener
        if (this.fullscreenEscapeHandler) {
            document.removeEventListener('keydown', this.fullscreenEscapeHandler);
        }

        // Reset to auto-play effect
        this.changeEffect('auto-play');
        
        // Update active button
        const effectBtns = document.querySelectorAll('.effect-btn');
        effectBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-effect') === 'auto-play');
        });
    }

    /**
     * Update fullscreen slider position
     */
    updateFullscreenSlider() {
        if (this.isFullscreen && this.fullscreenImageContainer) {
            const translateX = -this.currentIndex * 100;
            this.fullscreenImageContainer.style.transform = `translateX(${translateX}%)`;
        }
    }

    /**
     * Setup touch events for mobile swipe
     */
    setupTouchEvents() {
        let startX = 0;
        let endX = 0;

        this.imageContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        this.imageContainer.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            this.handleSwipe(startX, endX);
        });
    }

    /**
     * Handle swipe gestures
     */
    handleSwipe(startX, endX) {
        const threshold = 50; // Minimum swipe distance
        const diff = startX - endX;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.nextSlide(); // Swipe left - next slide
            } else {
                this.previousSlide(); // Swipe right - previous slide
            }
        }
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowLeft':
                this.previousSlide();
                break;
            case 'ArrowRight':
                this.nextSlide();
                break;
            case ' ': // Spacebar
                e.preventDefault();
                this.toggleAutoPlay();
                break;
        }
    }

    /**
     * Show specific slide
     */
    showSlide(index) {
        // Ensure index is within bounds
        if (index < 0) {
            this.currentIndex = this.images.length - 1;
        } else if (index >= this.images.length) {
            this.currentIndex = 0;
        } else {
            this.currentIndex = index;
        }

        // Handle different effects
        switch (this.currentEffect) {
            case 'fade':
                this.showFadeSlide();
                break;
            case 'coverflow':
                this.showCoverflowSlide();
                break;
            case 'stacked-cards':
                // Stacked cards don't use traditional slide navigation
                break;
            case 'fullscreen':
                if (this.isFullscreen) {
                    this.updateFullscreenSlider();
                } else {
                    const translateX = -this.currentIndex * 100;
                    this.imageContainer.style.transform = `translateX(${translateX}%)`;
                }
                break;
            default:
                // Auto-play uses default sliding
                const translateX = -this.currentIndex * 100;
                this.imageContainer.style.transform = `translateX(${translateX}%)`;
                break;
        }

        // Update indicators
        this.updateIndicators();

        // Add fade animation to current slide for auto-play mode
        if (this.currentEffect === 'auto-play' || this.currentEffect === 'fullscreen') {
            this.addSlideAnimation();
        }
    }

    /**
     * Show slide with fade effect
     */
    showFadeSlide() {
        const slides = this.imageContainer.querySelectorAll('.slide');
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentIndex);
            slide.style.opacity = index === this.currentIndex ? '1' : '0';
        });
    }

    /**
     * Show slide with coverflow effect
     */
    showCoverflowSlide() {
        const slides = this.imageContainer.querySelectorAll('.slide');
        slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev', 'next');
            
            if (index === this.currentIndex) {
                slide.classList.add('active');
            } else if (index === this.currentIndex - 1 || (this.currentIndex === 0 && index === this.images.length - 1)) {
                slide.classList.add('prev');
            } else if (index === this.currentIndex + 1 || (this.currentIndex === this.images.length - 1 && index === 0)) {
                slide.classList.add('next');
            }
        });
    }


    /**
     * Reorder slides for stacked cards effect
     */
    reorderStackedCards() {
        const slides = Array.from(this.imageContainer.querySelectorAll('.slide'));
        const reversedSlides = slides.reverse();
        
        // Clear container and re-append in reverse order
        this.imageContainer.innerHTML = '';
        reversedSlides.forEach(slide => {
            this.imageContainer.appendChild(slide);
        });
    }

    /**
     * Start stacked cards autoplay
     */
    startStackedCardsAutoplay() {
        this.stackedCardsInterval = setInterval(() => {
            this.moveStackedCard();
        }, this.autoPlaySpeed);
    }

    /**
     * Stop stacked cards autoplay
     */
    stopStackedCardsAutoplay() {
        if (this.stackedCardsInterval) {
            clearInterval(this.stackedCardsInterval);
            this.stackedCardsInterval = null;
        }
    }

    /**
     * Setup click handler for stacked cards
     */
    setupStackedCardsClickHandler() {
        // Remove any existing click handlers
        this.removeStackedCardsClickHandler();
        
        // Add click handler to the image container
        this.stackedCardsClickHandler = (e) => {
            if (e.target.closest('.slide')) {
                this.moveStackedCard();
            }
        };
        
        this.imageContainer.addEventListener('click', this.stackedCardsClickHandler);
    }

    /**
     * Remove click handler for stacked cards
     */
    removeStackedCardsClickHandler() {
        if (this.stackedCardsClickHandler) {
            this.imageContainer.removeEventListener('click', this.stackedCardsClickHandler);
            this.stackedCardsClickHandler = null;
        }
    }

    /**
     * Setup Timed Cards effect
     */
    setupTimedCardsEffect() {
        this.stopAutoPlay();
        this.stopStackedCardsAutoplay();
        
        // Hide the regular slider container
        this.sliderContainer.style.display = 'none';
        
        // Create timed cards container
        this.createTimedCardsContainer();
        
        // Start the timed cards animation
        this.startTimedCardsAnimation();
    }

    /**
     * Create the timed cards container and structure
     */
    createTimedCardsContainer() {
        // Remove existing timed cards container if it exists
        const existingContainer = document.querySelector('.timed-cards-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Create main container
        const container = document.createElement('div');
        container.className = 'timed-cards-container';

        // Create cards container
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'cards-container';
        cardsContainer.id = 'cards-container';

        // Create pagination
        const pagination = document.createElement('div');
        pagination.className = 'pagination';
        pagination.id = 'pagination';

        // Create progress indicator
        const indicator = document.createElement('div');
        indicator.className = 'indicator';

        // Create cover
        const cover = document.createElement('div');
        cover.className = 'cover';

        // Append elements
        container.appendChild(indicator);
        container.appendChild(cardsContainer);
        container.appendChild(pagination);
        container.appendChild(cover);

        // Add to body
        document.body.appendChild(container);

        // Generate cards and pagination
        this.generateTimedCards();
        this.generatePagination();
    }

    /**
     * Generate timed cards
     */
    generateTimedCards() {
        const cardsContainer = document.getElementById('cards-container');
        cardsContainer.innerHTML = '';

        this.travelData.forEach((destination, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.setProperty('--bg-url', `url(${destination.image})`);
            card.innerHTML = `
                <div class="card-content">
                    <h2>${destination.title}</h2>
                    <p>${destination.subtitle}</p>
                </div>
            `;
            cardsContainer.appendChild(card);
        });
    }

    /**
     * Generate pagination dots
     */
    generatePagination() {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        this.travelData.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = index === 0 ? 'dot active' : 'dot';
            dot.addEventListener('click', () => this.goToTimedCard(index));
            pagination.appendChild(dot);
        });
    }

    /**
     * Start timed cards animation
     */
    startTimedCardsAnimation() {
        this.timedCardsIndex = 0;
        this.updateTimedCard();
        
        // Auto-advance every 5 seconds
        this.timedCardsInterval = setInterval(() => {
            this.nextTimedCard();
        }, 5000);
    }

    /**
     * Stop timed cards animation
     */
    stopTimedCardsAnimation() {
        if (this.timedCardsInterval) {
            clearInterval(this.timedCardsInterval);
            this.timedCardsInterval = null;
        }
    }

    /**
     * Go to specific timed card
     */
    goToTimedCard(index) {
        this.timedCardsIndex = index;
        this.updateTimedCard();
    }

    /**
     * Go to next timed card
     */
    nextTimedCard() {
        this.timedCardsIndex = (this.timedCardsIndex + 1) % this.travelData.length;
        this.updateTimedCard();
    }

    /**
     * Update timed card display
     */
    updateTimedCard() {
        const cards = document.querySelectorAll('.timed-cards-container .card');
        const dots = document.querySelectorAll('.timed-cards-container .pagination .dot');
        const indicator = document.querySelector('.timed-cards-container .indicator');
        const cover = document.querySelector('.timed-cards-container .cover');

        if (!cards.length) return;

        const currentData = this.travelData[this.timedCardsIndex];

        // Update cards
        cards.forEach((card, index) => {
            card.classList.toggle('active', index === this.timedCardsIndex);
        });

        // Update pagination
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.timedCardsIndex);
        });

        // Update indicator and cover colors
        if (indicator) {
            indicator.style.background = currentData.color;
        }
        if (cover) {
            cover.style.background = currentData.color;
        }
    }

    /**
     * Cleanup timed cards effect
     */
    cleanupTimedCardsEffect() {
        this.stopTimedCardsAnimation();
        
        // Remove timed cards container
        const container = document.querySelector('.timed-cards-container');
        if (container) {
            container.remove();
        }
        
        // Show the regular slider container
        if (this.sliderContainer) {
            this.sliderContainer.style.display = '';
        }
    }

    /**
     * Move top card to bottom with animation
     */
    moveStackedCard() {
        const lastCard = this.imageContainer.lastElementChild;
        if (lastCard && lastCard.classList.contains('slide')) {
            // Add swap animation class
            lastCard.classList.add('swap');

            setTimeout(() => {
                // Remove swap class and move to front
                lastCard.classList.remove('swap');
                this.imageContainer.insertBefore(lastCard, this.imageContainer.firstElementChild);
            }, 800);
        }
    }

    /**
     * Add animation to current slide
     */
    addSlideAnimation() {
        const slides = this.imageContainer.querySelectorAll('.slide');
        const currentSlide = slides[this.currentIndex];
        
        if (currentSlide) {
            currentSlide.classList.add('fade-enter');
            setTimeout(() => {
                currentSlide.classList.add('fade-enter-active');
                currentSlide.classList.remove('fade-enter');
            }, 10);
            
            setTimeout(() => {
                currentSlide.classList.remove('fade-enter-active');
            }, 600);
        }
    }

    /**
     * Update position indicators
     */
    updateIndicators() {
        const indicatorElements = this.indicators.querySelectorAll('.indicator');
        indicatorElements.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    }

    /**
     * Go to next slide
     */
    nextSlide() {
        this.showSlide(this.currentIndex + 1);
    }

    /**
     * Go to previous slide
     */
    previousSlide() {
        this.showSlide(this.currentIndex - 1);
    }

    /**
     * Go to specific slide
     */
    goToSlide(index) {
        this.showSlide(index);
    }

    /**
     * Start automatic slideshow
     */
    startAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
        
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlaySpeed);
        
        this.isAutoPlaying = true;
        this.updatePlayPauseButton();
    }

    /**
     * Stop automatic slideshow
     */
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
        
        this.isAutoPlaying = false;
        this.updatePlayPauseButton();
    }

    /**
     * Toggle auto-play
     */
    toggleAutoPlay() {
        if (this.isAutoPlaying) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    /**
     * Pause auto-play temporarily (for hover)
     */
    pauseAutoPlay() {
        if (this.isAutoPlaying && this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
    }

    /**
     * Resume auto-play (after hover)
     */
    resumeAutoPlay() {
        if (this.isAutoPlaying && !this.autoPlayInterval) {
            this.startAutoPlay();
        }
    }

    /**
     * Change auto-play speed
     */
    changeSpeed(speed) {
        this.autoPlaySpeed = parseInt(speed);
        
        // Update speed display
        if (this.speedValue) {
            this.speedValue.textContent = `${this.autoPlaySpeed / 1000}s`;
        }
        
        // Restart auto-play with new speed
        if (this.isAutoPlaying) {
            this.startAutoPlay();
        }
    }

    /**
     * Update play/pause button text
     */
    updatePlayPauseButton() {
        if (this.playPauseBtn) {
            this.playPauseBtn.textContent = this.isAutoPlaying ? 'Pause Auto-play' : 'Start Auto-play';
        }
    }

    /**
     * Add new image to the slider
     */
    addImage(imageData) {
        this.images.push(imageData);
        this.createSlides();
        this.createIndicators();
    }

    /**
     * Remove image from the slider
     */
    removeImage(index) {
        if (index >= 0 && index < this.images.length) {
            this.images.splice(index, 1);
            
            // Adjust current index if necessary
            if (this.currentIndex >= this.images.length) {
                this.currentIndex = this.images.length - 1;
            }
            
            this.createSlides();
            this.createIndicators();
            this.showSlide(this.currentIndex);
        }
    }

    /**
     * Get current slide information
     */
    getCurrentSlide() {
        return {
            index: this.currentIndex,
            image: this.images[this.currentIndex],
            total: this.images.length
        };
    }

    /**
     * Destroy the slider and clean up
     */
    destroy() {
        // Stop auto-play
        this.stopAutoPlay();
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyPress);
        
        // Clear DOM
        if (this.imageContainer) {
            this.imageContainer.innerHTML = '';
        }
        
        if (this.indicators) {
            this.indicators.innerHTML = '';
        }
        
        console.log('Image slider destroyed');
    }
}

// Initialize the slider when the script loads
const slider = new ImageSlider();

// Expose slider to global scope for debugging
window.imageSlider = slider;
