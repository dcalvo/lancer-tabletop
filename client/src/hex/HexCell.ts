import { Graphics, Point, Polygon, Text } from "pixi.js"
import HexCoordinate from "./HexCoordinate"
import { innerRadius, outerRadius, lineWidth, lineColor, lineAlpha } from "./HexMetrics"
import HexDirection from "./HexDirection"

export default class HexCell {
  // Public properties
  position: Point
  coordinate: HexCoordinate
  neighbors: HexCell[] = []
  distance = Infinity
  color: number | undefined = undefined
  impassable = false

  // Private properties
  private corners: Point[] = []
  private cellGraphic: Graphics

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
  }

  // Public methods
  draw() {
    // Clean up old graphics
    this.cellGraphic.clear()
    this.cellGraphic.removeChildren(0, this.cellGraphic.children.length)

    if (this.color) this.cellGraphic.beginFill(this.color)
    // Draw the cell coordinates
    // const coord = new Text("this.coordinate.toStringOnSeparateLines()", {
    //   fontSize: 16,
    //   align: "center",
    // })
    if (this.distance !== Infinity) {
      const coord = new Text(this.distance.toString(), {
        fontSize: 32,
        align: "center",
      })
      coord.anchor.set(0.5, 0.5)
      coord.position.copyFrom(this.position)
      this.cellGraphic.addChild(coord)
    }
    // Draw the cell borders
    this.cellGraphic.lineStyle(lineWidth, lineColor, lineAlpha).drawPolygon(this.corners)
    return this.cellGraphic
  }

  getNeighbor(direction: HexDirection) {
    return this.neighbors[direction]
  }

  setNeighbor(direction: HexDirection, cell: HexCell) {
    this.neighbors[direction] = cell
    cell.neighbors[HexDirection.opposite(direction)] = this
  }
  // Private methods
}
