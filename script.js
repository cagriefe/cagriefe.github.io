// Modern JavaScript for Portfolio Website
// Using ES6+ features, YAGNI, KISS, and DRY principles

(function() {
    'use strict';

    // DOM Elements
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    // Configuration
    const config = {
        scrollOffset: 100, // Offset for active section detection
        smoothScrollDuration: 800, // Duration for smooth scroll animation
        throttleDelay: 16 // ~60fps for scroll event throttling
    };

    // Utility Functions
    const throttle = (func, delay) => {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    };

    const getElementOffset = (element) => {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return rect.top + scrollTop;
    };

    // Smooth Scrolling Implementation
    const smoothScrollTo = (targetPosition, duration = config.smoothScrollDuration) => {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const startTime = performance.now();

        const easeInOutCubic = (t) => {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        };

        const animateScroll = (currentTime) => {
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = easeInOutCubic(progress);
            
            window.scrollTo(0, startPosition + distance * ease);
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
    };

    // Navigation Link Click Handler
    const handleNavLinkClick = (e) => {
        e.preventDefault();
        
        const targetId = e.target.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const targetPosition = getElementOffset(targetSection) - config.scrollOffset;
            smoothScrollTo(targetPosition);
            
            // Update active state immediately for better UX
            updateActiveNavLink(targetId.substring(1));
        }
    };

    // Active Navigation Link Management
    const updateActiveNavLink = (activeId) => {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeId}`) {
                link.classList.add('active');
            }
        });
    };

    // Scroll Position Detection
    const getCurrentSection = () => {
        const scrollPosition = window.pageYOffset + config.scrollOffset;
        let currentSection = null;
        
        sections.forEach(section => {
            const sectionTop = getElementOffset(section);
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });
        
        // If no section is found, default to the first section
        if (!currentSection && sections.length > 0) {
            currentSection = sections[0].id;
        }
        
        return currentSection;
    };

    // Scroll Event Handler
    const handleScroll = throttle(() => {
        const currentSection = getCurrentSection();
        if (currentSection) {
            updateActiveNavLink(currentSection);
        }
    }, config.throttleDelay);

    // Intersection Observer for Performance (Alternative approach)
    const createIntersectionObserver = () => {
        const observerOptions = {
            rootMargin: `-${config.scrollOffset}px 0px -66% 0px`,
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateActiveNavLink(entry.target.id);
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });

        return observer;
    };

    // Keyboard Navigation Support
    const handleKeyboardNavigation = (e) => {
        if (e.key === 'Tab') {
            // Ensure focus is visible for keyboard users
            document.body.classList.add('keyboard-navigation');
        }
    };

    // Mouse Navigation Support
    const handleMouseNavigation = () => {
        document.body.classList.remove('keyboard-navigation');
    };

    // Initialize Smooth Scrolling
    const initSmoothScrolling = () => {
        // Add click event listeners to navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavLinkClick);
        });

        // Use Intersection Observer if supported, fallback to scroll event
        if ('IntersectionObserver' in window) {
            createIntersectionObserver();
        } else {
            window.addEventListener('scroll', handleScroll, { passive: true });
        }

        // Set initial active state
        const initialSection = getCurrentSection();
        if (initialSection) {
            updateActiveNavLink(initialSection);
        }
    };

    // Initialize Accessibility Features
    const initAccessibility = () => {
        // Keyboard navigation support
        document.addEventListener('keydown', handleKeyboardNavigation);
        document.addEventListener('mousedown', handleMouseNavigation);

        // Enhanced focus management
        navLinks.forEach(link => {
            link.addEventListener('focus', () => {
                document.body.classList.add('keyboard-navigation');
            });
        });

        // Scroll to top functionality (optional)
        const scrollToTop = () => {
            smoothScrollTo(0);
        };

        // Add scroll to top on logo click (if needed)
        const logo = document.querySelector('.name');
        if (logo) {
            logo.addEventListener('click', scrollToTop);
            logo.style.cursor = 'pointer';
        }
    };

    // Handle Hash Changes (for direct URL navigation)
    const handleHashChange = () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            const targetSection = document.querySelector(`#${hash}`);
            if (targetSection) {
                setTimeout(() => {
                    const targetPosition = getElementOffset(targetSection) - config.scrollOffset;
                    smoothScrollTo(targetPosition);
                    updateActiveNavLink(hash);
                }, 100);
            }
        }
    };

    // Initialize Hash Navigation
    const initHashNavigation = () => {
        window.addEventListener('hashchange', handleHashChange);
        
        // Handle initial hash on page load
        if (window.location.hash) {
            handleHashChange();
        }
    };

    // Enhanced Mobile Support
    const initMobileSupport = () => {
        // Touch scroll support
        let touchStartY = 0;
        let touchEndY = 0;

        const handleTouchStart = (e) => {
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchEnd = (e) => {
            touchEndY = e.changedTouches[0].clientY;
            
            // Optional: Add swipe gestures for section navigation
            const swipeThreshold = 50;
            const swipeDistance = touchStartY - touchEndY;
            
            if (Math.abs(swipeDistance) > swipeThreshold) {
                // Swipe up/down detected - could implement section switching
                // This is optional and can be enabled if needed
            }
        };

        if ('ontouchstart' in window) {
            document.addEventListener('touchstart', handleTouchStart, { passive: true });
            document.addEventListener('touchend', handleTouchEnd, { passive: true });
        }
    };

    // Performance Optimization
    const optimizePerformance = () => {
        // Reduce motion for users who prefer it
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            config.smoothScrollDuration = 0;
        }

        // Optimize scroll performance
        const optimizeScroll = () => {
            document.body.style.scrollBehavior = 'auto';
        };

        // Re-enable smooth scrolling after initial load
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.body.style.scrollBehavior = 'smooth';
            }, 1000);
        });
    };

    // Error Handling
    const handleErrors = (error, context) => {
        console.warn(`Portfolio Navigation Error (${context}):`, error);
        // Fallback to default browser behavior
        return false;
    };

    // Main Initialization
    const init = () => {
        try {
            // Core functionality
            initSmoothScrolling();
            initAccessibility();
            initHashNavigation();
            initMobileSupport();
            optimizePerformance();

            // Add loaded class for CSS animations
            document.body.classList.add('loaded');

            console.log('Portfolio navigation initialized successfully');
        } catch (error) {
            handleErrors(error, 'initialization');
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose limited API for potential external use
    window.PortfolioNavigation = {
        scrollToSection: (sectionId) => {
            const section = document.querySelector(`#${sectionId}`);
            if (section) {
                const targetPosition = getElementOffset(section) - config.scrollOffset;
                smoothScrollTo(targetPosition);
                updateActiveNavLink(sectionId);
            }
        },
        
        updateConfig: (newConfig) => {
            Object.assign(config, newConfig);
        }
    };

})(); 