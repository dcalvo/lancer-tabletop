import "./App.css"
import Pixi from "./components/Pixi"
import HexGrid from "./hex/HexGrid"
import { innerRadius, outerRadius } from "./hex/HexMetrics"
import { useState } from "react"
import PixiApp from "./PixiApp"

// Create Pixi app
const { app, viewport } = PixiApp(window.innerWidth, window.innerHeight)

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
