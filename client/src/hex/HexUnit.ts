import EventEmitter from "eventemitter3"
import { Graphics, Point, Sprite } from "pixi.js"
import { app, viewport } from "src/features/Viewport/Viewport"
import HexCell from "./HexCell"
import HexCoordinate from "./HexCoordinate"
import HexDirection from "./HexDirection"
import HexGrid from "./HexGrid"

// TODO accept texture at Unit creation
const placeholder = new Graphics()
placeholder.lineStyle(5, 0xff00ff, 1).beginFill(0x00ff00).drawCircle(0, 0, 15)
const texture = app.renderer.generateTexture(placeholder)

export default class HexUnit {
  emitter: EventEmitter = new EventEmitter()
  hexGrid: HexGrid
  sprite: Sprite = new Sprite()
  size: number
  ignoreCollision: boolean = false
  occupiedCells: HexCell[] = []
  dragging: Point | null = null
  fromCell: HexCell | null = null
  toCell: HexCell | null = null

  constructor(hexGrid: HexGrid, size: number) {
    if (size <= 0) throw new Error("HexUnit size must be positive")
    this.hexGrid = hexGrid
    this.size = size
    this.sprite = Sprite.from(texture)
    this.sprite.anchor.set(0.5, 0.5)
    this.sprite.interactive = true
    this.sprite.buttonMode = true

    this.sprite.on("pointerdown", this.pickup, this)
  }

  // Public methods
  // Tries to move into a (group of) cell(s). Returns true if successful, false otherwise.
  occupy(cell: HexCell) {
    const { cells, requiresCollision } = this.tryOccupy(cell)
    if (requiresCollision && !this.ignoreCollision) return false
    this.unoccupy()
    this.sprite.position.copyFrom(cell.position)
    this.occupiedCells = cells
    cells.forEach((cell) => cell.containedUnits.push(this))
    // TODO remove
    // cells.forEach((cell) => (cell.color = 0x00ff00))
    return true
  }

  unoccupy() {
    this.occupiedCells.forEach((cell) => {
      const index = cell.containedUnits.indexOf(this)
      if (index > -1) cell.containedUnits.splice(index, 1)
    })
    this.occupiedCells = []
  }

  // Private methods
  private hexRing(centerCoord: HexCoordinate, radius: number) {
    const cells: HexCell[] = []
    // Start west of center then move around it
    let ringCoord = centerCoord.add(HexCoordinate.direction(HexDirection.W).scale(radius))
    for (let d = HexDirection.NE; d <= HexDirection.NW; d++) {
      for (let i = 0; i < radius; i++) {
        const ringCell = this.hexGrid.coordinateToCell(ringCoord)
        if (ringCell) cells.push(ringCell)
        ringCoord = ringCoord.add(HexCoordinate.direction(d))
      }
    }
    return cells
  }

  /**
   * Find the cells to be occupied by spiraling around a (group of) center cell(s).
   * Returns the cells that would be occupied and whether the occupation requires a collision.
   * A collision occurs if a cell is impassable (due to another colliding unit) or lies outside the grid.
   */
  private tryOccupy(cell: HexCell) {
    let cells: HexCell[] = [cell]
    let requiresCollision = false

    if (this.size % 2 === 1) {
      const radius = Math.floor(this.size / 2)
      for (let i = 1; i <= radius; i++) {
        cells = cells.concat(this.hexRing(cell.coordinate, i))
      }
      const expectedCells = 1 + 3 * radius * (radius + 1)
      if (cells.length !== expectedCells) requiresCollision = true
    } else {
      // size 2, 4, 6... is essentially 3 spirals focused on 3 center cells
      const topCenter = cell.coordinate
      const leftCenter = topCenter.add(HexCoordinate.direction(HexDirection.SW))
      const rightCenter = topCenter.add(HexCoordinate.direction(HexDirection.SE))
      const radius = this.size / 2 - 1
      for (let i = 1; i <= radius; i++) {
        const topCells = this.hexRing(topCenter, i)
        const leftCells = this.hexRing(leftCenter, i)
        const rightCells = this.hexRing(rightCenter, i)
        cells = cells.concat(topCells, leftCells, rightCells)
      }
      // remove duplicates
      cells = [...new Set(cells)]
      const expectedCells = 3 + 3 * radius + 3 * radius * (radius + 1)
      if (cells.length !== expectedCells) requiresCollision = true
    }

    // Check for collisions
    for (const cell of cells) {
      const occupants = cell.containedUnits
      for (const unit of occupants) {
        // Another cell which has collision already occupies this cell
        if (!unit.ignoreCollision && unit !== this) requiresCollision = true
      }
    }
    return { cells, requiresCollision }
  }

  private pickup(e: any) {
    this.fromCell = this.hexGrid.positionToCell(this.sprite.position)
    this.dragging = e.data.getLocalPosition(this.hexGrid.container) as Point
    this.sprite.position.copyFrom(this.dragging)
    this.hexGrid.units.forEach((hexUnit) => (hexUnit.sprite.interactive = false))
    this.sprite.interactive = true

    this.hexGrid.container.on("pointermove", this.drag, this)
    this.sprite.on("pointerup", this.drop, this)
    viewport.on("pointerout", this.drop, this)
    this.emitter.emit("pickup", e)
  }

  private drag(e: any) {
    if (this.dragging) {
      const newPosition = e.data.getLocalPosition(this.hexGrid.container) as Point
      this.sprite.position.x += newPosition.x - this.dragging.x
      this.sprite.position.y += newPosition.y - this.dragging.y
      this.dragging = newPosition
      this.emitter.emit("drag", e)
    }
  }

  private drop(e: any) {
    this.dragging = null
    this.sprite.removeListener("pointermove", this.drag, this)
    this.sprite.removeListener("pointerup", this.drop, this)
    viewport.removeListener("pointerout", this.drop, this)
    this.hexGrid.units.forEach((hexUnit) => (hexUnit.sprite.interactive = true))

    const mousePosition = e.data.getLocalPosition(this.hexGrid.container) as Point
    const toCell = this.hexGrid.positionToCell(mousePosition)
    if (e.type === "pointerout" || !toCell || !this.occupy(toCell)) {
      if (!this.fromCell) throw new Error("Orphan HexUnit, unable to find fromCell at end of drop")
      this.sprite.position.copyFrom(this.fromCell.position)
    }
    this.emitter.emit("drop", e)
  }
}

// Just a type declaration to represent the constructor of a given class, this is the Typescript magic
type Constructor<I> = new (...args: any[]) => I

// Add a function with access on Base property
function Moves<T extends Constructor<HexUnit>>(Base: T) {
  return class Moves extends Base {
    speed: number = 1

    constructor(...args: any[]) {
      super(...args)
      this.emitter.on("drag", this.findPathOnDrag, this)
      this.emitter.on("drop", this.clearPathOnDrop, this)
    }

    private findPathOnDrag(e: any) {
      const newPosition = e.data.getLocalPosition(this.hexGrid.container) as Point
      this.toCell = this.hexGrid.positionToCell(newPosition)
      if (this.fromCell && this.toCell)
        this.hexGrid.findPath(this.fromCell, this.toCell, this.speed, this.ignoreCollision)
    }

    private clearPathOnDrop(e: any) {
      this.hexGrid.clearPath()
    }
  }
}

export { Moves }
