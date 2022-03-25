import { Container } from "pixi.js"
import HexCell from "./HexCell"

export default class HexGridChunk {
  cells: HexCell[] = []
  container = new Container()

  addCell(index: number, cell: HexCell) {
    this.cells[index] = cell
    this.container.addChild(cell.cellGraphic)
  }
}
