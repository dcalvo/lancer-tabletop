// Size of the hex cell
// Outer radius is analogous to height, inner radius is analogous to width
const outerRadius = 50 // pixels
const innerRadius = outerRadius * (Math.sqrt(3) / 2) // pixels
// Outline of the hex cell
const lineWidth = 2 // pixels
const lineColor = 0xc0c0c0 // RGB
const lineAlpha = 1 // 0 is transparent, 1 is opaque

export { outerRadius, innerRadius, lineWidth, lineColor, lineAlpha }
