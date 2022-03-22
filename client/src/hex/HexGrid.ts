import { Container, Point } from "pixi.js"
import { selectBrush, selectEditMode } from "src/features/HexGridEditor/hexGridEditorSlice"
import { observeStore } from "src/store/store"
import HexCell from "./HexCell"
import HexCellPriorityQueue from "./HexCellPriorityQueue"
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
  private editMode = false
  private brushSize = 1
  private brushType = ""
  private searchFrontier = new HexCellPriorityQueue()
  private isDragging = false
  private searchFromCell: HexCell | null = null
  private searchToCell: HexCell | null = null

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
    this.gridContainer.on("pointerdown", this.handleInput, this)
    this.gridContainer.on("pointermove", this.handleInput, this)
    this.gridContainer.on("pointerup", this.handleInput, this)
    this.gridContainer.on("pointerout", this.handleInput, this)

    // Subscribe to state changes
    observeStore(selectEditMode, (currentEditMode) => (this.editMode = currentEditMode))
    observeStore(selectBrush, (currentBrush) => (this.brushSize = currentBrush.size))
    observeStore(selectBrush, (currentBrush) => (this.brushType = currentBrush.type))
  }

  // Public methods
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
  private handleInput(e: any) {
    const currentCell = this.positionToCell(e.data.getLocalPosition(this.gridContainer))
    switch (e.type) {
      case "pointerdown":
        this.isDragging = true
        this.searchFromCell = currentCell
        if (!this.editMode) this.searchFromCell.enableHighlight(0x0000ff)
        break
      case "pointermove":
        if (!this.isDragging) return
        if (!this.editMode) {
          this.searchToCell?.disableHighlight()
          if (currentCell !== this.searchFromCell) {
            this.searchToCell = currentCell
            this.searchToCell.enableHighlight(0xff0000)
          }
        }
        break
      case "pointerup":
        this.isDragging = false
        if (!this.editMode) {
          if (this.searchFromCell && this.searchToCell)
            this.findPath(this.searchFromCell, this.searchToCell)
        }
        return
      case "pointerout":
        this.isDragging = false
        // this.searchFromCell?.disableHighlight()
        // this.searchToCell?.disableHighlight()
        this.searchFromCell = null
        this.searchToCell = null
        return
      default:
        return
    }

    if (this.editMode) {
      this.editCells(currentCell)
      return
    }
  }

  private findPath(fromCell: HexCell, toCell: HexCell) {
    this.searchFrontier.clear()
    this.cells.forEach((cell) => {
      cell.distance = Infinity
    })
    fromCell.distance = 0
    this.searchFrontier.enqueue(fromCell)
    while (this.searchFrontier.count > 0) {
      let current = this.searchFrontier.dequeue()
      if (current === toCell) {
        current = current.pathFrom
        while (current !== fromCell) {
          current.enableHighlight(0xffffff)
          current = current.pathFrom
        }
        break
      }
      for (let d = HexDirection.NE; d <= HexDirection.NW; d++) {
        const neighbor = current.getNeighbor(d)
        if (!neighbor) continue
        if (neighbor.impassable) continue
        let distance = current.distance
        if (current.hasRoad()) {
          // base distance increase
          distance += 1
        } else {
          // other terrain movement effects, difficult terrain, etc.
          distance += 10
        }
        if (neighbor.distance === Infinity) {
          neighbor.distance = distance
          neighbor.pathFrom = current
          neighbor.searchHeuristic = neighbor.coordinate.distanceTo(toCell.coordinate)
          this.searchFrontier.enqueue(neighbor)
        } else if (distance < neighbor.distance) {
          const oldPriority = neighbor.searchPriority
          neighbor.distance = distance
          neighbor.pathFrom = current
          this.searchFrontier.change(neighbor, oldPriority)
        }
      }
    }
  }

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
      switch (this.brushType) {
        case "terrain":
          cell.impassable = true
          cell.color = 0x00ff00
          cell.disableHighlight()
          cell.enableHighlight(0xff0000)
          break
        default:
          cell.color = 0xff0000
          cell.enableHighlight(0x0000ff)
      }
    }
  }
}
