import { Container, Point } from "pixi.js"
import { selectBrush, selectEditMode } from "src/features/HexGridEditor/hexGridEditorSlice"
import { observeStore } from "src/store/store"
import HexCell from "./HexCell"
import HexCoordinate from "./HexCoordinate"
import HexDirection from "./HexDirection"
import { innerRadius, outerRadius } from "./HexMetrics"

export default class HexGrid {
  // Public properties
  gridContainer: Container

  // Private properties
  private cellCountX: number
  private cellCountZ: number
  private cells: HexCell[] = []
  private pointerDown = false
  private editMode = ""
  private brushSize = 1

  // Constructor
  constructor(width: number, height: number) {
    this.cellCountX = width
    this.cellCountZ = height
    // Create the grid
    for (let z = 0, i = 0; z < this.cellCountZ; z++) {
      for (let x = 0; x < this.cellCountX; x++) {
        this.createCell(x, z, i++)
      }
    }

    // Create a container with each cell's graphic
    this.gridContainer = new Container()
    this.cells.forEach((hexCell) => this.gridContainer.addChild(hexCell.draw()))

    // Enable interaction
    this.gridContainer.interactive = true
    this.gridContainer.on("pointerdown", (e) => {
      this.pointerDown = true
      const centerCell = this.positionToCell(e.data.getLocalPosition(this.gridContainer))
      this.editCells(centerCell)
    })
    this.gridContainer.on("pointermove", (e) => {
      if (this.pointerDown) {
        const centerCell = this.positionToCell(e.data.getLocalPosition(this.gridContainer))
        this.editCells(centerCell)
      }
    })
    this.gridContainer.on("pointerup", () => (this.pointerDown = false))
    this.gridContainer.on("pointerout", () => (this.pointerDown = false))

    // Subscribe to state changes
    observeStore(selectEditMode, (currentEditMode) => (this.editMode = currentEditMode))
    observeStore(selectBrush, (currentBrush) => (this.brushSize = currentBrush.size))
  }

  // Public methods
  // TODO: this function can be called multiple times and overlap. No idea how this affects performance on big grids
  // There is no C# stopAllCoroutines equivalent.
  async findDistanceTo(cell: HexCell) {
    const sleep = (milliseconds: number) => {
      return new Promise((resolve) => setTimeout(resolve, milliseconds))
    }
    this.cells.forEach((cell) => {
      cell.distance = Infinity
    })
    const frontier: HexCell[] = [cell]
    cell.distance = 0
    while (frontier.length > 0) {
      const current = frontier.shift()! // frontier is guaranteed to be nonempty
      for (let d = HexDirection.NE; d <= HexDirection.NW; d++) {
        await sleep(1 / 60)
        const neighbor = current.getNeighbor(d)
        if (!neighbor || neighbor.distance !== Infinity || neighbor.impassable) {
          continue
        }
        neighbor.distance = current.distance + 1
        frontier.push(neighbor)
      }
    }
  }

  positionToCell(position: Point) {
    // position SHOULD be a Point local to this.gridContainer
    const coord = HexCoordinate.fromPosition(position)
    const index = coord.X + coord.Z * this.cellCountX + Math.floor(coord.Z / 2)
    return this.cells[index]
  }

  coordinateToCell(coordinate: HexCoordinate) {
    const z = coordinate.Z
    if (z < 0 || z >= this.cellCountZ) return null
    const x = coordinate.X + Math.floor(z / 2)
    if (x < 0 || x >= this.cellCountX) return null
    return this.cells[x + z * this.cellCountX]
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
        cell.setNeighbor(HexDirection.NE, this.cells[i - this.cellCountX])
        if (x > 0) cell.setNeighbor(HexDirection.NW, this.cells[i - this.cellCountX - 1])
      } else {
        cell.setNeighbor(HexDirection.NW, this.cells[i - this.cellCountX])
        if (x < this.cellCountX - 1)
          cell.setNeighbor(HexDirection.NE, this.cells[i - this.cellCountX + 1])
      }
    }

    // Add it to the hexGrid
    this.cells.push(cell)
  }

  private editCells(center: HexCell) {
    const centerX = center.coordinate.X
    const centerZ = center.coordinate.Z

    // Top half + middle
    for (let r = 0, z = centerZ - this.brushSize; z <= centerZ; z++, r++) {
      for (let x = centerX - r; x <= centerX + this.brushSize; x++) {
        this.editCell(this.coordinateToCell(new HexCoordinate(x, z)))
      }
    }

    // Bottom half
    for (let r = this.brushSize, z = centerZ + 1; z <= centerZ + this.brushSize; z++, r--) {
      for (let x = centerX - this.brushSize; x < centerX + r; x++) {
        this.editCell(this.coordinateToCell(new HexCoordinate(x, z)))
      }
    }
  }

  private editCell(cell: HexCell | null) {
    if (cell) {
      switch (this.editMode) {
        case "terrain":
          cell.impassable = true
          cell.color = 0x00ff00
          break
        case "distance":
          if (this.brushSize === 0) this.findDistanceTo(cell)
          break
        default:
          cell.color = 0xff0000
      }
    }
  }
}
