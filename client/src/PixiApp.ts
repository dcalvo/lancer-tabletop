import { Cull } from "@pixi-essentials/cull"
import { Viewport } from "pixi-viewport"
import { Application, DisplayObject } from "pixi.js"

function createApp(width: number, height: number) {
  // Create Pixi.js application
  const app = new Application({
    width: width,
    height: height,
    backgroundColor: 0x1099bb,
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

  // Create a hook to add children to culling automatically
  viewport.on("childAdded", (child: DisplayObject) => cull.add(child))
  viewport
    .drag()
    .pinch()
    .wheel()
    .clamp({ direction: "all", underflow: "center" })
    .clampZoom({ minScale: 0.5, maxScale: 1 })
  viewport.moveCenter(viewport.worldWidth / 2, viewport.worldHeight / 2)

  // Add it to the stage
  app.stage.addChild(viewport)

  return { app, viewport }
}

export default createApp
