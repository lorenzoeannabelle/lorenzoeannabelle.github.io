
// Handle scroll with animation frame
function handleScroll(container, target, options) {
    // Throttle updates with requestAnimationFrame for smoothness
    if (!target._scrolling) {
        target._scrolling = true;
        requestAnimationFrame(() => {
            applyFadeEffect(container, target, options);
            target._scrolling = false;
        });
    }
};

function applyFadeEffect(container, target, options = {}) {
    fadeOnScroll(container, target, options);
}

function fadeOnScroll(container, target, options = {}) {
    const { fadeStartRatio = 0.8, fadeEndRatio = 0.2 } = options;
    // Calculate fade boundaries
    const containerHeight = container.offsetHeight;
    let fadeStart = containerHeight * fadeStartRatio;
    let fadeEnd = containerHeight * fadeEndRatio;

    const containerRect = container.getBoundingClientRect();
    const layerRect = target.getBoundingClientRect();
    const offset = layerRect.top - containerRect.top;

    setFadeTo(target, calculateOpacity(fadeStart, fadeEnd, offset, options));
}

function setFadeTo(target, opacity) {
    target.style.opacity = opacity;
}
