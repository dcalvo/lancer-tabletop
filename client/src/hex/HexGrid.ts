import { Container, Point } from "pixi.js"
import { selectBrush, selectEditMode } from "src/features/HexGridEditor/hexGridEditorSlice"
import { observeStore } from "src/store/store"
import HexCell from "./HexCell"
import HexCellPriorityQueue from "./HexCellPriorityQueue"
import HexCoordinate from "./HexCoordinate"
import HexDirection from "./HexDirection"
import HexGridChunk from "./HexGridChunk"
import { chunkSizeX, chunkSizeZ, innerRadius, outerRadius } from "./HexMetrics"

export default class HexGrid {
  // Public properties
  container: Container = new Container()

  // Private properties
  private chunks: HexGridChunk[] = []
  private chunkCountX: number
  private chunkCountZ: number
  private cellCountX: number
  private cellCountZ: number
  private cells: HexCell[] = []
  private editMode = false
  private brushSize = 1
  private brushType = ""
  private searchFrontier = new HexCellPriorityQueue()
  private searchFrontierPhase = 0
  private isDragging = false
  private searchFromCell: HexCell | null = null
  private searchToCell: HexCell | null = null
  private currentPathFrom: HexCell | null = null
  private currentPathTo: HexCell | null = null
  private currentPathExists = false

  // Constructor
  constructor(chunkCountX: number, chunkCountZ: number) {
    // Create the grid
    this.chunkCountX = chunkCountX
    this.chunkCountZ = chunkCountZ
    this.cellCountX = this.chunkCountX * chunkSizeX
    this.cellCountZ = this.chunkCountZ * chunkSizeZ
    for (let z = 0, i = 0; z < this.chunkCountZ; z++) {
      for (let x = 0; x < this.chunkCountX; x++) {
        const chunk = (this.chunks[i++] = new HexGridChunk())
        chunk.container.interactive = true
        this.container.addChild(chunk.container)
      }
    }
    for (let z = 0, i = 0; z < this.cellCountZ; z++) {
      for (let x = 0; x < this.cellCountX; x++) {
        this.createCell(x, z, i++)
      }
    }

    // Enable interaction
    this.container.interactive = true
    this.container.on("pointerdown", this.handleInput, this)
    this.container.on("pointermove", this.handleInput, this)
    this.container.on("pointerup", this.handleInput, this)
    this.container.on("pointerout", this.handleInput, this)

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

    // Add it to the hexGrid and hexChunks
    this.cells.push(cell)
    this.addCellToChunk(x, z, cell)
  }

  private addCellToChunk(x: number, z: number, cell: HexCell) {
    const chunkX = Math.floor(x / chunkSizeX)
    const chunkZ = Math.floor(z / chunkSizeZ)
    const chunk = this.chunks[chunkX + chunkZ * this.chunkCountX]
    const localX = x - chunkX * chunkSizeX
    const localZ = z - chunkZ * chunkSizeZ
    chunk.addCell(localX + localZ * chunkSizeX, cell)
  }

  private handleInput(e: any) {
    const currentCell = this.positionToCell(e.data.getLocalPosition(this.container))
    switch (e.type) {
      case "pointerdown":
        this.isDragging = true
        if (!this.editMode) {
          this.searchFromCell = currentCell
          this.searchFromCell.enableHighlight(0x0000ff)
        }
        break
      case "pointermove":
        if (!this.isDragging) return
        if (!this.editMode) {
          if (this.searchToCell && currentCell === this.currentPathFrom) {
            this.searchToCell.disableHighlight()
            this.searchToCell.setLabel(null)
            this.searchToCell = null
          }
          if (currentCell !== this.searchFromCell && currentCell !== this.searchToCell) {
            this.searchToCell?.disableHighlight()
            this.searchToCell = currentCell
            this.searchToCell.enableHighlight(0xff0000)
            if (this.searchFromCell && this.searchToCell)
              this.findPath(this.searchFromCell, this.searchToCell)
          }
        }
        break
      case "pointerup":
      case "pointerout":
        this.isDragging = false
        if (!this.editMode) {
          if (currentCell === this.searchFromCell) {
            this.searchFromCell.disableHighlight()
            this.clearPath()
          }
        }
        return
      default:
        return
    }

    if (this.editMode) {
      this.editCells(currentCell)
      return
    }
  }

  private findPath(fromCell: HexCell, toCell: HexCell, speed = 1) {
    this.clearPath()
    this.currentPathFrom = fromCell
    this.currentPathTo = toCell
    this.currentPathExists = this.search(fromCell, toCell)
    this.showPath(speed)
  }

  private showPath(speed: number) {
    if (this.currentPathExists) {
      let current = this.currentPathTo as HexCell
      while (current !== this.currentPathFrom) {
        const turn = current.distance / speed
        current.setLabel(turn.toString())
        current.enableHighlight(0xffffff)
        current = current.pathFrom
      }
    }
    this.currentPathFrom?.enableHighlight(0x0000ff)
    this.currentPathTo?.enableHighlight(0xff0000)
  }

  private clearPath() {
    if (this.currentPathExists) {
      let current = this.currentPathTo as HexCell
      while (current !== this.currentPathFrom) {
        current.setLabel(null)
        current.disableHighlight()
        current = current.pathFrom
      }
      current.disableHighlight()
      this.currentPathExists = false
    } else if (this.currentPathFrom) {
      this.currentPathFrom.disableHighlight()
      this.currentPathTo?.disableHighlight()
    }
    this.currentPathFrom = this.currentPathTo = null
  }

  private search(fromCell: HexCell, toCell: HexCell) {
    this.searchFrontierPhase += 2
    this.searchFrontier.clear()
    // If searchPhase % 2 == 0, cell hasn't been reached yet.
    // If == 1, cell is in the frontier. If == 2, cell has been removed from frontier.
    fromCell.searchPhase = this.searchFrontierPhase
    fromCell.distance = 0
    this.searchFrontier.enqueue(fromCell)
    while (this.searchFrontier.count > 0) {
      let current = this.searchFrontier.dequeue()
      current.searchPhase += 1
      if (current === toCell) return true
      for (let d = HexDirection.NE; d <= HexDirection.NW; d++) {
        const neighbor = current.getNeighbor(d)
        if (!neighbor || neighbor.searchPhase > this.searchFrontierPhase) continue
        if (neighbor.impassable) continue
        let distance = current.distance
        if (true) {
          distance += 1
        } else {
          // other terrain movement effects, difficult terrain, etc.
          distance += 10
        }
        if (neighbor.searchPhase < this.searchFrontierPhase) {
          neighbor.searchPhase = this.searchFrontierPhase
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
    return false
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
          break
        default:
          cell.color = 0xff0000
      }
    }
  }
}
