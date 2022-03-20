import "./App.css"
import Viewport, { app, viewport } from "./features/Viewport/Viewport"
import HexGrid from "./hex/HexGrid"
import { innerRadius, outerRadius } from "./hex/HexMetrics"
import { useEffect } from "react"
import Sidebar from "./features/Sidebar/Sidebar"

// Create a HexGrid containing HexCells
const numHorizontalCells = Math.floor(800 / innerRadius)
const numVerticalCells = Math.floor(600 / outerRadius)
const hexGrid = new HexGrid(numHorizontalCells, numVerticalCells)
// Center the HexGrid in the viewport
hexGrid.gridContainer.x = (viewport.worldWidth - hexGrid.gridContainer.width) / 2
hexGrid.gridContainer.y = (viewport.worldHeight - hexGrid.gridContainer.height) / 2
viewport.addChild(hexGrid.gridContainer)

export default function App() {
  useEffect(() => {
    const viewportDiv = document.getElementById("Viewport")
    if (viewportDiv) app.resizeTo = viewportDiv
  })

  return (
    <div className="App">
      <div id="Viewport" className="column left">
        <Viewport />
      </div>
      <div className="column right">
        <Sidebar />
      </div>
    </div>
  )
}
