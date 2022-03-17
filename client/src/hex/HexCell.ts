import { Graphics, Point, Polygon, Text } from "pixi.js"
import HexCoordinate from "./HexCoordinate"
import { innerRadius, outerRadius, lineWidth, lineColor, lineAlpha } from "./HexMetrics"

export default class HexCell {
  // Public properties
  position: Point
  coordinate: HexCoordinate

  // Private properties
  corners: Point[] = []
  cellGraphic: Graphics

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
    // Draw the cell coordinates
    const coord = new Text(this.coordinate.toStringOnSeparateLines(), {
      fontSize: 16,
      align: "center",
    })
    coord.anchor.set(0.5, 0.5)
    coord.position.copyFrom(this.position)
    this.cellGraphic.addChild(coord)
    // Set the cell hitbox
    this.cellGraphic.hitArea = new Polygon(this.corners)
  }

  // Public methods
  draw(color?: number) {
    this.cellGraphic.clear()
    if (color) this.cellGraphic.beginFill(color)
    // Draw the cell borders
    this.cellGraphic.lineStyle(lineWidth, lineColor, lineAlpha).drawPolygon(this.corners)
    return this.cellGraphic
  }
  // Private methods
}
