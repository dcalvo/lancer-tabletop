import { Application } from "pixi.js"
import Pixi from "./components/Pixi"
import "./App.css"
import HexGrid from "./hex/HexGrid"
import { innerRadius, outerRadius } from "./hex/HexMetrics"

// Create Pixi.js application
const appWidth = 800
const appHeight = 600
const app = new Application({
  width: appWidth,
  height: appHeight,
  backgroundColor: 0x1099bb,
})

// Create a HexGrid containing HexCells
const numHorizontalCells = Math.floor(appWidth / innerRadius)
const numVerticalCells = Math.floor(appHeight / outerRadius)
const hexGrid = new HexGrid(numHorizontalCells, numVerticalCells)

// Draw it and add to canvas
app.stage.addChild(hexGrid.draw())

function App() {
  return (
    <div className="App">
      <Pixi app={app} />
    </div>
  )
}

export default App
