import { Application } from "pixi.js"
import Pixi from "./components/Pixi"
import "./App.css"
import HexGrid from "./hex/HexGrid"
import { innerRadius, outerRadius } from "./hex/HexMetrics"
import { useState } from "react"
import { Viewport } from "pixi-viewport"

// Create Pixi.js application
const appWidth = window.innerWidth
const appHeight = window.innerHeight
const app = new Application({
  width: appWidth,
  height: appHeight,
  backgroundColor: 0x1099bb,
})

// Create a viewport and add it to the stage
const viewport = new Viewport({
  worldWidth: 2 * appWidth,
  worldHeight: 2 * appHeight,
  interaction: app.renderer.plugins.interaction,
})
app.stage.addChild(viewport)

// Draw it and add to canvas
viewport
  .drag()
  .pinch()
  .wheel()
  .clamp({ direction: "all" })
  .clampZoom({ minScale: 0.5, maxScale: 1 })
viewport.moveCenter(viewport.worldWidth / 2, viewport.worldHeight / 2)

// Create a HexGrid containing HexCells
const numHorizontalCells = Math.floor(800 / innerRadius)
const numVerticalCells = Math.floor(600 / outerRadius)
const hexGrid = new HexGrid(numHorizontalCells, numVerticalCells)
hexGrid.draw()
// Center the HexGrid in the viewport
hexGrid.gridContainer.x = (viewport.worldWidth - hexGrid.gridContainer.width) / 2
hexGrid.gridContainer.y = (viewport.worldHeight - hexGrid.gridContainer.height) / 2
viewport.addChild(hexGrid.gridContainer)

function App() {
  const [checked, setChecked] = useState(true)

  function togglePaintMode() {
    // !checked is what the checkbox is about to be
    !checked ? (viewport.pause = false) : (viewport.pause = true)
    setChecked(!checked)
  }
  return (
    <div className="App">
      <Pixi app={app} />
      <input
        type="checkbox"
        id="viewportControl"
        name="viewportControl"
        checked={checked}
        onChange={togglePaintMode}
      />
      <label htmlFor="viewportControl">Viewport Controls</label>
    </div>
  )
}

export default App
