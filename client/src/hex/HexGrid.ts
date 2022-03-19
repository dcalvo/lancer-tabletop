import { Container, InteractionEvent, Point } from "pixi.js"
import HexCell from "./HexCell"
import HexCoordinate from "./HexCoordinate"
import HexDirection from "./HexDirection"
import { innerRadius, outerRadius } from "./HexMetrics"

export default class HexGrid {
  // Public properties
  width: number
  height: number
  gridContainer: Container

  // Private properties
  private cells: HexCell[] = []

  // Constructor
  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    for (let z = 0, i = 0; z < this.height; z++) {
      for (let x = 0; x < this.width; x++) {
        this.createCell(x, z, i++)
      }
    }
    this.gridContainer = new Container()
  }

  // Public methods
  draw() {
    // Destroy the container if it exists
    if (this.gridContainer.children.length) {
      this.gridContainer.destroy()
      this.gridContainer = new Container()
    }
    // Populate the container with each cell's graphic
    this.cells.forEach((hexCell) => this.gridContainer.addChild(hexCell.draw()))
    // Enable interaction
    this.gridContainer.interactive = true
    this.gridContainer.on("pointerdown", this.editCell, this)
    return this.gridContainer
  }

  // TODO: this function can be called multiple times and overlap. No idea how this affects performance on big grids
  // There is no C# stopAllCoroutines equivalent.
  async findDistanceTo(cell: HexCell) {
    const sleep = (milliseconds: number) => {
      return new Promise((resolve) => setTimeout(resolve, milliseconds))
    }
    this.cells.forEach((cell) => {
      cell.distance = Infinity
      cell.draw()
    })
    const frontier: HexCell[] = [cell]
    cell.distance = 0
    cell.draw()
    while (frontier.length > 0) {
      const current = frontier.shift()! // frontier is guaranteed to be nonempty
      for (let d = HexDirection.NE; d <= HexDirection.NW; d++) {
        await sleep(1 / 60)
        const neighbor = current.getNeighbor(d)
        if (neighbor && neighbor.distance === Infinity) {
          neighbor.distance = current.distance + 1
          neighbor.draw()
          frontier.push(neighbor)
        }
      }
    }
  }

  // Private methods
  private createCell(x: number, z: number, i: number) {
    // Screen position in (x,y) space
    const position = new Point(
      (x + z * 0.5 - Math.floor(z / 2)) * (innerRadius * 2),
      z * (outerRadius * 1.5),
    )

    // Hex coordinate in (x,y,z) space (y is calculated from the others)
    const coordinate = HexCoordinate.fromOffsetCoordinates(x, z)

    // Create cell and set it up
    const cell = new HexCell(position, coordinate)
    if (x > 0) cell.setNeighbor(HexDirection.W, this.cells[i - 1])
    if (z > 0) {
      if (z % 2 === 0) {
        cell.setNeighbor(HexDirection.SE, this.cells[i - this.width])
        if (x > 0) cell.setNeighbor(HexDirection.SW, this.cells[i - this.width - 1])
      } else {
        cell.setNeighbor(HexDirection.SW, this.cells[i - this.width])
        if (x < this.width - 1) cell.setNeighbor(HexDirection.SE, this.cells[i - this.width + 1])
      }
    }

    // Add it to the hexGrid
    this.cells.push(cell)
  }

  private editCell(e: InteractionEvent) {
    const coord = HexCoordinate.fromPosition(e.data.getLocalPosition(this.gridContainer))
    const index = coord.x + coord.z * this.width + Math.floor(coord.z / 2)
    // this.cells[index].draw(0xff0000)
    this.findDistanceTo(this.cells[index])
  }
}
