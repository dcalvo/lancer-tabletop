import "./App.css"
import Viewport, { app, viewport } from "./features/Viewport/Viewport"
import HexGrid from "./hex/HexGrid"
import { chunkSizeX, chunkSizeZ, innerRadius, outerRadius } from "./hex/HexMetrics"
import { useEffect } from "react"
import Sidebar from "./features/Sidebar/Sidebar"

// Create a HexGrid containing HexCells
const numHorizontalCells = Math.floor(800 / innerRadius / chunkSizeX)
const numVerticalCells = Math.floor(600 / outerRadius / chunkSizeZ)
const hexGrid = new HexGrid(numHorizontalCells, numVerticalCells)
// Center the HexGrid in the viewport
hexGrid.container.x = (viewport.worldWidth - hexGrid.container.width) / 2
hexGrid.container.y = (viewport.worldHeight - hexGrid.container.height) / 2
viewport.addChild(hexGrid.container)

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
