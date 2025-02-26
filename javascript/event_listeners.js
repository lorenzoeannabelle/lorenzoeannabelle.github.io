
function isElementInViewport(target) {
    const rect = target.getBoundingClientRect();
    if (rect.bottom < 0) {
        return false;
    }
    return (
        rect.top <= window.innerHeight && rect.bottom >= 0 // Visible in viewport
    );
}


function applyEffectToVisibleTargets(container, targets) {
    targets.forEach(target => {
        if (isElementInViewport(target["target"])) {
            handleScroll(container, target["target"], target["options"]);
        } else {
            target["target"].style.opacity = 0;
        }
    });
}

function throttle(fn, wait = 60) {
    let lastTime = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastTime >= wait) {
            fn.apply(this, args);
            lastTime = now;
        }
    };
}

// Apply throttling to the main scroll listener
// parallaxContainer.addEventListener(
//     'scroll',
//     throttle(() => {
//         // Call the visibility and fade logic here
//     }, 100) // Fire every 100ms
// );
