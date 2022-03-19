import "./App.css"
import Pixi from "./components/Pixi"
import HexGrid from "./hex/HexGrid"
import { innerRadius, outerRadius } from "./hex/HexMetrics"
import { ChangeEvent, useEffect, useState } from "react"
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
      <HexGridMenu />
    </>
  )
}

// Todo: get a UI library oh my god
// this is super scuffed, buggy, and unusable
// treat it as an outline
function HexGridMenu() {
  const [terrainChecked, setTerrainChecked] = useState(false)
  const [distanceChecked, setDistanceChecked] = useState(false)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    hexGrid.editMode = e.target.value as "terrain" | "distance"
  }

  return (
    <>
      <div>
        <h3>Hex Grid</h3>
        <input
          type="radio"
          id="terrain"
          name="editMode"
          value={"terrain"}
          checked={terrainChecked}
          onChange={(e) => {
            setTerrainChecked(!distanceChecked)
            handleChange(e)
          }}
        />
        <label htmlFor="terrain">Terrain</label>
        <input
          type="radio"
          id="distance"
          name="editMode"
          value={"distance"}
          checked={distanceChecked}
          onChange={(e) => {
            setDistanceChecked(!distanceChecked)
            handleChange(e)
          }}
        />
        <label htmlFor="distance">Distance</label>
      </div>
    </>
  )
}

// TODO: add redux and a UI library
// UI elements should be able to modify the global state in order for hexgrid (and future global objects) to be able to read from it

export default App
