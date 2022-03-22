import { useEffect, useRef } from "react"
import { Application } from "pixi.js"
import { Viewport } from "pixi-viewport"
import { Cull } from "@pixi-essentials/cull"
import { selectControlsEnabled } from "../ViewportControl/viewportControlSlice"
import { observeStore } from "src/store/store"

let width = window.innerWidth
let height = window.innerHeight

// Create Pixi.js application
const app = new Application({
  width,
  height,
  backgroundColor: 0x1099bb,
  antialias: true,
})

// Create culling hook
const cull = new Cull()
app.renderer.on("prerender", () => cull.cull(app.renderer.screen))

// Create a viewport
const viewport = new Viewport({
  worldWidth: 2 * width,
  worldHeight: 2 * height,
  interaction: app.renderer.plugins.interaction,
})
observeStore(selectControlsEnabled, (controlsEnabled) => (viewport.pause = !controlsEnabled))
cull.add(viewport)

viewport
  .drag()
  .pinch()
  .wheel()
  .clamp({ direction: "all", underflow: "center" })
  .clampZoom({ minScale: 0.5, maxScale: 1 })
viewport.moveCenter(viewport.worldWidth / 2, viewport.worldHeight / 2)

// Add it to the stage
app.stage.addChild(viewport)

// Take in a Pixi application, return a JSX canvas element
export default function Pixi() {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // on first render, add to DOM
    if (canvasRef.current) canvasRef.current.replaceWith(app.view)
    return () => {
      // on unload, stop the app
      app.destroy(true, true)
    }
  }, [])

  return <div ref={canvasRef}></div>
}

export { app, viewport }
