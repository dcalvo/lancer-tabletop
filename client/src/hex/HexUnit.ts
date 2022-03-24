import EventEmitter from "eventemitter3"
import { Graphics, Point, Sprite } from "pixi.js"
import { app, viewport } from "src/features/Viewport/Viewport"
import HexCell from "./HexCell"
import HexGrid from "./HexGrid"

// TODO accept texture at Unit creation
const placeholder = new Graphics()
placeholder.lineStyle(5, 0xff00ff, 1).beginFill(0x00ff00).drawCircle(0, 0, 15)
const texture = app.renderer.generateTexture(placeholder)

export default class HexUnit {
  hexGrid: HexGrid
  sprite: Sprite = new Sprite()
  size: number
  occupiedCells: HexCell[] = []
  dragging: Point | null = null
  fromCell: HexCell | null = null
  toCell: HexCell | null = null
  emitter: EventEmitter = new EventEmitter()

  constructor(hexGrid: HexGrid, size: number) {
    this.hexGrid = hexGrid
    this.size = size // TODO support size 2+ units
    this.sprite = Sprite.from(texture)
    this.sprite.anchor.set(0.5, 0.5)
    this.sprite.interactive = true
    this.sprite.buttonMode = true

    this.sprite.on("pointerdown", this.pickup, this)
  }

  // Public methods
  // Tries to move into a (group of) cell(s). Returns true if successful, false otherwise.
  occupy(cell: HexCell) {
    // TODO robust check for size 2+
    if (cell.containedUnits.length) return false
    this.unoccupy()
    this.sprite.position.copyFrom(cell.position)
    this.occupiedCells.push(cell)
    cell.containedUnits.push(this)
    return true
  }

  unoccupy() {
    this.occupiedCells.forEach((cell) => {
      cell.containedUnits = cell.containedUnits.filter((hexUnit) => hexUnit !== this)
    })
    this.occupiedCells = []
  }

  // Private methods
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
    ignoreCollision: boolean = false

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
