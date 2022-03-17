import { Container } from "pixi.js"
import HexCell from "./HexCell"
import { innerRadius, outerRadius } from "./HexMetrics"

export default class HexGrid {
  // Public properties

  // Private properties
  width: number
  height: number
  private cells: HexCell[] = []

  // Constructor
  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.createCell(x, y)
      }
    }
  }

  // Public methods
  draw() {
    const cellContainer = new Container()
    this.cells.forEach((hexCell) => cellContainer.addChild(hexCell.draw()))
    return cellContainer
  }

  // Private methods
  private createCell(x: number, y: number) {
    x = (x + y * 0.5 - Math.floor(y / 2)) * (innerRadius * 2)
    y = y * (outerRadius * 1.5)
    this.cells.push(new HexCell(x, y))
  }
}
