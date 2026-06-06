// Common JavaScript for Book Slides - Vertical scroll deck

let currentSlide = 0;
let totalSlides = 1;
let chapterStarts = [];
let slideElements = [];

// Initialize slides on page load
function initSlides() {
    slideElements = Array.from(document.querySelectorAll('.slide'));
    totalSlides = slideElements.length;

    chapterStarts = [];
    slideElements.forEach((slide, i) => {
        if (slide.classList.contains('chapter-divider')) {
            chapterStarts.push(i);
        }
    });

    // Restore slide from URL hash if available
    const hashMatch = location.hash.match(/slide-(\d+)/);
    if (hashMatch) {
        const idx = parseInt(hashMatch[1], 10);
        if (idx >= 0 && idx < totalSlides) {
            currentSlide = idx;
        }
    }

    // Scroll to starting slide on load
    if (currentSlide > 0) {
        slideElements[currentSlide].scrollIntoView({ behavior: 'auto', block: 'start' });
    }

    // Set initial active state + counter
    setActive(currentSlide);

    // Watch which slide is currently in view (>50% visible) to keep counter / hash in sync
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    const idx = slideElements.indexOf(entry.target);
                    if (idx !== -1 && idx !== currentSlide) {
                        currentSlide = idx;
                        setActive(idx);
                        syncHash(idx);
                    }
                }
            });
        }, { threshold: [0.5] });
        slideElements.forEach((s) => io.observe(s));
    }
}

function setActive(index) {
    slideElements.forEach((slide, i) => {
        const isActive = i === index;
        slide.classList.toggle('active', isActive);
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
    updateProgress();
    updateButtons();
    announceSlideChange();
}

function syncHash(index) {
    if (history.replaceState) {
        history.replaceState(null, '', `#slide-${index}`);
    }
}

// Update progress bar
function updateProgress() {
    const progress = totalSlides > 1 ? (currentSlide / (totalSlides - 1)) * 100 : 0;
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = progress + '%';
    }
}

// Update navigation buttons state
function updateButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) {
        prevBtn.disabled = currentSlide === 0;
        prevBtn.setAttribute('aria-disabled', currentSlide === 0);
    }
    if (nextBtn) {
        nextBtn.disabled = currentSlide === totalSlides - 1;
        nextBtn.setAttribute('aria-disabled', currentSlide === totalSlides - 1);
    }

    const counter = document.getElementById('counter');
    if (counter) {
        counter.textContent = `${currentSlide + 1} / ${totalSlides}`;
        counter.setAttribute('aria-label', `Slide ${currentSlide + 1} of ${totalSlides}`);
    }
}

// Show specific slide by scrolling to it
function showSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    currentSlide = index;
    if (slideElements[index]) {
        slideElements[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setActive(index);
    syncHash(index);
}

// Announce slide change for accessibility
function announceSlideChange() {
    const slide = document.querySelectorAll('.slide')[currentSlide];
    if (slide) {
        const heading = slide.querySelector('h1, h2');
        if (heading) {
            const announcement = `Slide ${currentSlide + 1} of ${totalSlides}: ${heading.textContent}`;
            announceToScreenReader(announcement);
        }
    }
}

// Announce message to screen readers
function announceToScreenReader(message) {
    const liveRegion = document.getElementById('liveRegion') || createLiveRegion();
    liveRegion.textContent = message;

    // Clear after announcement
    setTimeout(() => {
        liveRegion.textContent = '';
    }, 1000);
}

// Create live region for screen reader announcements
function createLiveRegion() {
    const region = document.createElement('div');
    region.id = 'liveRegion';
    region.className = 'sr-only';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    document.body.appendChild(region);
    return region;
}

// Navigation functions
function nextSlide() {
    showSlide(currentSlide + 1);
}

function prevSlide() {
    showSlide(currentSlide - 1);
}

function goTo(index) {
    showSlide(index);
}

// Jump to the Nth chapter divider (1-based). Falls back to raw slide index
// if there are no chapter dividers in the deck.
function goToChapter(chapterNum) {
    const i = chapterNum - 1;
    if (chapterStarts.length > 0) {
        if (i >= 0 && i < chapterStarts.length) {
            showSlide(chapterStarts[i]);
        }
    } else if (i >= 0 && i < totalSlides) {
        showSlide(i);
    }
}

// Build the chapter menu (table of contents) from the chapter-divider slides.
// Expects markup: a #chapterMenuBtn button and an empty #chapterMenuPanel list.
function initChapterMenu() {
    const panel = document.getElementById('chapterMenuPanel');
    const btn = document.getElementById('chapterMenuBtn');
    if (!panel || !btn) return;

    const slides = document.querySelectorAll('.slide');
    panel.innerHTML = '';

    chapterStarts.forEach((slideIndex, n) => {
        const divider = slides[slideIndex];
        const titleEl = divider ? divider.querySelector('h2') : null;
        const numEl = divider ? divider.querySelector('.chapter-number') : null;
        const label = titleEl ? titleEl.textContent.trim() : `Chapter ${n + 1}`;
        const prefix = numEl ? numEl.textContent.trim() : `Chapter ${n + 1}`;

        const item = document.createElement('button');
        item.className = 'chapter-menu-item';
        item.setAttribute('role', 'menuitem');
        item.textContent = `${prefix} — ${label}`;
        item.addEventListener('click', () => {
            showSlide(slideIndex);
            closeChapterMenu();
        });
        panel.appendChild(item);
    });

    // Hide the menu entirely if there are no chapters to list
    const wrapper = document.querySelector('.chapter-menu');
    if (wrapper) {
        wrapper.style.display = chapterStarts.length > 0 ? '' : 'none';
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
        const wrap = document.querySelector('.chapter-menu');
        if (wrap && !wrap.contains(e.target)) {
            closeChapterMenu();
        }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeChapterMenu();
    });
}

function toggleChapterMenu() {
    const panel = document.getElementById('chapterMenuPanel');
    const btn = document.getElementById('chapterMenuBtn');
    if (!panel) return;
    const isOpen = panel.classList.toggle('open');
    if (btn) btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

function closeChapterMenu() {
    const panel = document.getElementById('chapterMenuPanel');
    const btn = document.getElementById('chapterMenuBtn');
    if (panel) panel.classList.remove('open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    // Don't interfere with form inputs
    if (e.target.matches('input, textarea, select')) {
        return;
    }

    switch (e.key) {
        case 'ArrowLeft':
        case 'PageUp':
            e.preventDefault();
            prevSlide();
            break;

        case 'ArrowRight':
        case 'PageDown':
        case ' ':
            e.preventDefault();
            nextSlide();
            break;

        case 'Home':
            e.preventDefault();
            showSlide(0);
            break;

        case 'End':
            e.preventDefault();
            showSlide(totalSlides - 1);
            break;

        case 'f':
        case 'F':
            e.preventDefault();
            toggleFullscreen();
            break;
    }
});

// Toggle fullscreen mode
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Touch gestures for mobile
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Vertical swipe dominant — moves between slides
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 60) {
        if (deltaY < 0) {
            // Swipe up — next slide
            nextSlide();
        } else {
            // Swipe down — previous slide
            prevSlide();
        }
    }
}

// Initialize Mermaid if available
function initMermaid() {
    if (typeof mermaid === 'undefined') return;
    mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'default',
        themeVariables: {
            primaryColor: '#EFEEFF',
            primaryTextColor: '#111111',
            primaryBorderColor: '#635BFF',
            lineColor: '#55524C',
            secondaryColor: '#F4F4F1',
            tertiaryColor: '#FAFAF8',
            background: '#FFFFFF',
            mainBkg: '#FFFFFF',
            secondBkg: '#F4F4F1',
            border1: '#E6E4DE',
            border2: '#D4D0C7'
        },
        flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
            curve: 'basis'
        },
        sequence: {
            useMaxWidth: false
        },
        gantt: {
            useMaxWidth: false
        }
    });

    // Mermaid is whitespace-sensitive: strip the shared leading indentation
    // that HTML formatting adds, otherwise the diagram fails to parse and the
    // raw source is shown instead.
    document.querySelectorAll('.mermaid').forEach((el) => {
        if (el.dataset.processed) return;
        const raw = el.textContent.replace(/\t/g, '    ');
        const lines = raw.split('\n');
        // drop leading/trailing blank lines
        while (lines.length && lines[0].trim() === '') lines.shift();
        while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
        const indent = Math.min(
            ...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length)
        );
        el.textContent = lines.map(l => l.slice(indent)).join('\n');
    });

    // Render. startOnLoad can miss its window when initialize() is called
    // after DOMContentLoaded (this script is loaded at the end of body).
    // Always attach zoom/pan after, even if mermaid.run() throws on a single
    // malformed source — one bad diagram shouldn't disable zoom on the rest.
    const finalizeDiagrams = () => {
        document.querySelectorAll('.mermaid').forEach((container) => {
            const svg = container.querySelector('svg');
            if (!svg) return;

            // Mermaid hardcodes width/height — strip so SVG fills container
            if (!svg.getAttribute('viewBox') && svg.getAttribute('width') && svg.getAttribute('height')) {
                svg.setAttribute('viewBox', `0 0 ${svg.getAttribute('width')} ${svg.getAttribute('height')}`);
            }
            svg.removeAttribute('width');
            svg.removeAttribute('height');
            svg.style.width = '100%';
            svg.style.height = '100%';
            svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

            attachMermaidZoom(container, svg);
        });
    };

    try {
        Promise.resolve(mermaid.run({ querySelector: '.mermaid' }))
            .catch((err) => console.log('Mermaid render error:', err && err.message))
            .finally(finalizeDiagrams);
    } catch (err) {
        console.log('Mermaid render error:', err && err.message);
        finalizeDiagrams();
    }
}

// ─── Zoom + pan controls for Mermaid diagrams ───────────────────────────
// Powered by @panzoom/panzoom. Drag to pan, wheel or buttons to zoom, dblclick resets.
function attachMermaidZoom(container, svg) {
    if (container.dataset.zoomReady) return;
    container.dataset.zoomReady = '1';

    if (typeof Panzoom === 'undefined') {
        console.warn('Panzoom library not loaded. Zoom/pan will be disabled.');
        return;
    }

    // Initialize Panzoom on the SVG element
    const panzoom = Panzoom(svg, {
        maxScale: 6,
        minScale: 0.5,
        canvas: true
    });

    // Toolbar overlay
    const toolbar = document.createElement('div');
    toolbar.className = 'mermaid-zoom';
    toolbar.innerHTML = `
        <button type="button" data-action="zoom-out" aria-label="Zoom out">−</button>
        <button type="button" data-action="reset" aria-label="Reset zoom">⟲</button>
        <button type="button" data-action="zoom-in" aria-label="Zoom in">+</button>
    `;
    container.appendChild(toolbar);

    toolbar.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;
        const action = button.dataset.action;
        if (action === 'zoom-in') {
            panzoom.zoomIn();
        } else if (action === 'zoom-out') {
            panzoom.zoomOut();
        } else if (action === 'reset') {
            panzoom.reset();
        }
    });

    // Wheel zoom — uses Panzoom's zoomWithWheel helper
    container.addEventListener('wheel', (e) => {
        panzoom.zoomWithWheel(e);
    }, { passive: false });

    // Double click to reset
    container.addEventListener('dblclick', () => {
        panzoom.reset();
    });

    // Update cursor on grab/grabbing states
    container.style.cursor = 'grab';
    container.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.mermaid-zoom')) return;
        container.style.cursor = 'grabbing';
    });
    container.addEventListener('pointerup', () => {
        container.style.cursor = 'grab';
    });
    container.addEventListener('pointercancel', () => {
        container.style.cursor = 'grab';
    });
}

// Handle window resize for responsive behavior
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Re-snap to current slide on resize (vh changes can shift positions)
        if (slideElements[currentSlide]) {
            slideElements[currentSlide].scrollIntoView({ behavior: 'auto', block: 'start' });
        }
    }, 100);
});

// Apply ?clean=1 mode (hide nav + progress for screenshots / PDF print)
function applyCleanMode() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('clean') === '1') {
        document.body.classList.add('clean');
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        applyCleanMode();
        initSlides();
        initChapterMenu();
        initMermaid();
    });
} else {
    applyCleanMode();
    initSlides();
    initChapterMenu();
    initMermaid();
}

// Export functions for global access
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.goTo = goTo;
window.goToChapter = goToChapter;
window.toggleChapterMenu = toggleChapterMenu;
