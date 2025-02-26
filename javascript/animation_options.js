// Description: Animation options for the parallax effect
// return animation opacity based applying proper transformation
// options: { persistent: true, stopAnimation: 'up', animationDirection: 'up', easing: 'linear' }
function calculateOpacity(fadeStart, fadeEnd, offset, options = {}) {
    const {
        persistent = true,
        stopAnimation = null, // Options: 'up', 'down', or 'both' to stop animation in specific directions
        animationDirection = null // Options: 'up', 'down', or 'both' to animate in specific directions
    } = options;
    let fadeOpacity = 0;
    if (persistent) {
        fadeOpacity = applyPersistent(persistent);
    }
    if (stopAnimation) {
        fadeOpacity = applyStopAnimation(fadeStart, fadeEnd, offset, options);
    }
    if (animationDirection) {
        fadeOpacity = applyAnimationDirection(fadeStart, fadeEnd, offset, options);
    }
    return fadeOpacity;
}

// Apply fade starting from a start point,
// reach maximum opacity at the midpoint,
// and fade out at the end point
// offset is the current position of the target
// relative to the container (the viewport)
// fadeStart is the point where the fade starts (in px starting from the top of the container)
// fadeEnd is the point where the fade ends (in px starting from the top of the container)
// offset is the current position of the target relative to the container
function normalizedOffsetMidpoint(fadeStart, fadeEnd, offset) {
    const fadeLength = fadeStart - fadeEnd;
    const midpoint = fadeEnd + (fadeLength / 2);
    let normalizedOffset = 2 * ((offset - fadeEnd) / fadeLength);
    // Fade from middle to top (decreasing opacity) Fade out as it scrolls up
    if (offset > midpoint) { // Fade in as it scrolls up
        normalizedOffset = 2 * (1 - (offset - fadeEnd) / fadeLength);
    }
    return normalizedOffset;
}

// Utility function to calculate easing
function applyEasing(normalizedOffset, options = {}) {
    const {
        easing = 'linear' // Animation easing type: 'ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out', 'cubic-bezier(n,n,n,n)'
    } = options;
    switch (easing) {
        case 'ease':
            return 0.5 * (1 - Math.cos(Math.PI * normalizedOffset));
        case 'linear':
            return normalizedOffset;
        case 'ease-in':
            return Math.pow(normalizedOffset, 3);
        case 'ease-out':
            return 1 - Math.pow(1 - normalizedOffset, 3);
        case 'ease-in-out':
            return normalizedOffset < 0.5
                ? 4 * Math.pow(normalizedOffset, 3)
                : 1 - Math.pow(-2 * normalizedOffset + 2, 3) / 2;
        default:
            // Handle cubic-bezier(n,n,n,n)
            if (easing.startsWith('cubic-bezier')) {
                const bezierMatch = easing.match(/cubic-bezier\(([^)]+)\)/);
                if (bezierMatch) {
                    const [p0, p1, p2, p3] = bezierMatch[1].split(',').map(Number);
                    return cubicBezier(normalizedOffset, p0, p1, p2, p3);
                }
            }
            return normalizedOffset; // Default to linear if invalid easing type
    }
}

// Apply fading based on animation direction
function applyAnimationDirection(fadeStart, fadeEnd, offset, options = {}) {
    const {
        animationDirection = null // Options: 'up', 'down', or 'both' to animate in specific directions
    } = options;
    let opacity = 0;
    switch (animationDirection) {
        case 'up': // Animate only on top
            opacity = 1; // Fully visible
            if (offset <= fadeStart) { // Fade in as it surpases the fadeStart
                const normalizedOffset = (offset - fadeEnd) / (fadeStart - fadeEnd);
                opacity = applyEasing(normalizedOffset, options);
            }
            break;
        case 'down': // Animate only on bottom
            opacity = 1; // Fully visible
            if (offset >= fadeEnd) {
                const normalizedOffset = (fadeStart - offset) / (fadeStart - fadeEnd);
                opacity = applyEasing(normalizedOffset, options);
            }
            break;
        default: // Animate in both directions
            if ((offset <= fadeStart) && (offset >= fadeEnd)) {
                const normalizedOffset = normalizedOffsetMidpoint(fadeStart, fadeEnd, offset);
                opacity = applyEasing(normalizedOffset, options);
            }
            break;
    }
    return opacity;
}

function applyStopAnimation(fadeStart, fadeEnd, offset, options = {}) {
    const {
        stopAnimation = null // Options: 'up', 'down', or 'both' to stop animation in specific directions
    } = options;
    const fadeLength = fadeStart - fadeEnd;
    const midpoint = fadeEnd + (fadeLength / 2);
    let opacity = 0;
    switch (stopAnimation) {
        case 'up':
            if (offset < midpoint) {
                opacity = 1; // Fully opaque
            }
            break;
        case 'down':
            if (offset > midpoint) {
                opacity = 1; // Fully opaque
            }
            break;
        case 'both':
            if (offset < midpoint || offset > midpoint) {
                opacity = 1; // Fully opaque
            }
            break;
        default:
            break;
    }
    return opacity;
}

function applyPersistent(options = {}) {
    const {
        persistent = true
    } = options;
    let opacity = 0;
    if (persistent) {
        opacity = 1;
    }
    return opacity;
}


// For me t distance => normalizedOffset
// The others are the speed of the animation
// For me p0, p1, p2, p3 => 0, 0.5, 0.5, 1
// linear                /* linear(0, 1) */
// /* Custom linear easing functions */
// linear(0, 0.25, 1)
// linear(0, 0.25 75%, 1)
//
// /* Keyword cubic Bézier easing functions */
// ease                  /* cubic-bezier(0.25, 0.1, 0.25, 1) */
// ease-in               /* cubic-bezier(0.42, 0, 1, 1) */
// ease-out              /* cubic-bezier(0, 0, 0.58, 1) */
// ease-in-out           /* cubic-bezier(0.42, 0, 0.58, 1) */
function real_bezier(t, initial, p1, p2, final) {
    return (
        (1 - t) * (1 - t) * (1 - t) * initial +
        3 * (1 - t) * (1 - t) * t * p1 +
        3 * (1 - t) * t * t * p2 +
        t * t * t * final
    );
}
// Example usage:
// bezier(
//     currentTime, // currentTime of the animation
//     0, // initial Value
// // first anchor's x axis coordinate point as shown in the css bezier curve function above, multiplied with <br> final value of get the original value out of normalized form
//     1 * 500,
//     // second anchor's x axis coordinate point  as shown in the css bezier curve function above, multiplied <br>  with final value of get the original value out of normalized form
//     0 * 500,
//     500 // final value
// );


// easing: 'cubic-bezier(2, -2, 0.3, 0.5)',
// Cubic Bezier implementation
function cubicBezier(t, p0, p1, p2, p3) {
    const cX = 3 * p0; // 3
    const bX = 3 * (p2 - p0) - cX;  // 9
    const aX = 1 - cX - bX;  // 7
    const cY = 3 * p1; // -3
    const bY = 3 * (p3 - p1) - cY; // 7.5
    const aY = 1 - cY - bY; // -3.5

    function bezierCoord(a, b, c, t) {
        return ((a * t + b) * t + c) * t;
    }

    function bezierCoordDerivative(a, b, c, t) {
        return (3 * a * t + 2 * b) * t + c;
    }

    // Newton's method to solve for t given x
    function solveForT(x, epsilon = 0.00001) {
        let t = x; // Initial guess
        for (let i = 0; i < 10; i++) { // Limit iterations for performance
            const xEstimate = bezierCoord(aX, bX, cX, t);
            const derivative = bezierCoordDerivative(aX, bX, cX, t);

            if (Math.abs(xEstimate - x) < epsilon) break; // Convergence check
            if (derivative === 0) break; // Avoid division by zero
            t -= (xEstimate - x) / derivative;
        }
        return t;
    }

    // Calculate the corresponding y-value for a given t
    const resolvedT = solveForT(t);
    return bezierCoord(aY, bY, cY, resolvedT);
}
