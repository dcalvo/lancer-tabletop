import "./App.css"
import Pixi from "./features/Pixi"
import HexGrid from "./hex/HexGrid"
import { innerRadius, outerRadius } from "./hex/HexMetrics"
import { useEffect, useState } from "react"
import PixiApp from "./PixiApp"
import HexGridEditorMenu from "./features/HexGridEditor/HexGridEditorMenu"

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

// Todo: refactor such that app is instantiated *after* the layout to avoid weird viewport sizing issues and make it easier to center objects
function App() {
  useEffect(() => {
    const viewportDiv = document.getElementById("Viewport")
    if (viewportDiv) app.resizeTo = viewportDiv
  })

  return (
    <div className="App">
      <div id="Viewport" className="column left">
        <Pixi app={app} />
      </div>
      <div className="column right">
        <Sidebar />
      </div>
    </div>
  )
}

// TODO: move this to components/Sidebar.tsx
function Sidebar() {
  const [checked, setChecked] = useState(false)
  useEffect(() => {
    viewport.pause = !checked
  }, [checked])

  return (
    <>
      <h1 className="center">Big Sidebar Menu</h1>
      <h3 className="center mypassion">graphic design is my passion</h3>
      <input
        type="checkbox"
        id="viewportControl"
        checked={checked}
        onChange={() => setChecked(!checked)}
      />
      <label htmlFor="viewportControl">Viewport Controls</label>
      <HexGridEditorMenu />
    </>
  )
}

// TODO: add redux and a UI library
// UI elements should be able to modify the global state in order for hexgrid (and future global objects) to be able to read from it

export default App
