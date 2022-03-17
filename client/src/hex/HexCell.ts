import { Graphics, Point, Polygon } from "pixi.js"
import { innerRadius, outerRadius, lineWidth, lineColor, lineAlpha } from "./HexMetrics"

export default class HexCell {
  // Public properties
  position: Point

  // Private properties
  corners: Point[] = []

  // Constructor
  constructor(x: number, y: number) {
    this.position = new Point(x, y)
    // Find corners relative to this cell's (x,y) position
    this.corners.push(new Point(x, y + outerRadius))
    this.corners.push(new Point(x + innerRadius, y + 0.5 * outerRadius))
    this.corners.push(new Point(x + innerRadius, y - 0.5 * outerRadius))
    this.corners.push(new Point(x, y - outerRadius))
    this.corners.push(new Point(x - innerRadius, y - 0.5 * outerRadius))
    this.corners.push(new Point(x - innerRadius, y + 0.5 * outerRadius))
  }

  // Public methods
  draw() {
    const cell: Graphics = new Graphics()

    // Draw the cell borders
    cell.lineStyle(lineWidth, lineColor, lineAlpha)
    cell.drawPolygon(this.corners)
    // Set the cell hitbox
    cell.hitArea = new Polygon(this.corners)

    return cell
  }
  // Private methods
}
