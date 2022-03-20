import { Graphics, Point, Polygon, Text } from "pixi.js"
import HexCoordinate from "./HexCoordinate"
import { innerRadius, outerRadius, lineWidth, lineColor, lineAlpha } from "./HexMetrics"
import HexDirection from "./HexDirection"
import { observeStore } from "src/store/store"
import { selectShowCoordinates } from "src/features/HexGridEditor/hexGridEditorSlice"

export default class HexCell {
  position: Point
  coordinate: HexCoordinate
  impassable = false

  private neighbors: HexCell[] = []
  private _color: number | undefined = undefined
  private corners: Point[] = []
  private cellGraphic: Graphics
  private _distance = Infinity
  private _displayCoordinates = false

  // Constructor
  constructor(position: Point, coordinate: HexCoordinate) {
    this.position = position
    const { x, y } = this.position
    // Find corners relative to this cell's (x,y) position
    this.corners.push(new Point(x, y + outerRadius))
    this.corners.push(new Point(x + innerRadius, y + 0.5 * outerRadius))
    this.corners.push(new Point(x + innerRadius, y - 0.5 * outerRadius))
    this.corners.push(new Point(x, y - outerRadius))
    this.corners.push(new Point(x - innerRadius, y - 0.5 * outerRadius))
    this.corners.push(new Point(x - innerRadius, y + 0.5 * outerRadius))
    this.coordinate = coordinate

    // One-time graphical set-up
    this.cellGraphic = new Graphics()
    // Set the cell hitbox
    this.cellGraphic.hitArea = new Polygon(this.corners)

    // Subscribe to stage changes
    observeStore(
      selectShowCoordinates,
      (displayCoordinates) => (this.displayCoordinates = displayCoordinates),
    )
  }

  get color() {
    return this._color
  }

  set color(value: number | undefined) {
    this._color = value
    this.draw()
  }

  get distance() {
    return this._distance
  }

  set distance(value: number) {
    this._distance = value
    this.draw()
  }

  get displayCoordinates() {
    return this._displayCoordinates
  }

  set displayCoordinates(value: boolean) {
    this._displayCoordinates = value
    this.draw()
  }

  getNeighbor(direction: HexDirection) {
    return this.neighbors[direction]
  }

  setNeighbor(direction: HexDirection, cell: HexCell) {
    this.neighbors[direction] = cell
    cell.neighbors[HexDirection.opposite(direction)] = this
  }

  draw() {
    // Clean up old graphics
    this.cellGraphic.clear()
    this.cellGraphic.removeChildren(0, this.cellGraphic.children.length)

    // Draw conditionals
    if (this.displayCoordinates) {
      const coord = new Text(this.coordinate.toStringOnSeparateLines(), {
        fontSize: 16,
        align: "center",
      })
      coord.anchor.set(0.5, 0.5)
      coord.position.copyFrom(this.position)
      this.cellGraphic.addChild(coord)
    }
    if (this.distance !== Infinity) {
      const dist = new Text(this.distance.toString(), {
        fontSize: 32,
        align: "center",
      })
      dist.anchor.set(0.5, 0.5)
      dist.position.copyFrom(this.position)
      this.cellGraphic.addChild(dist)
    }

    // Draw the cell
    if (this.color) this.cellGraphic.beginFill(this.color)
    this.cellGraphic.lineStyle(lineWidth, lineColor, lineAlpha).drawPolygon(this.corners)
    return this.cellGraphic
  }
}
