import { Point } from "pixi.js"
import { innerRadius, outerRadius } from "./HexMetrics"

export default class HexCoordinate {
  x: number
  y: number
  z: number

  constructor(x: number, z: number) {
    this.x = x
    this.z = z
    // all coordinates sum to 0, derive y from x and z
    this.y = -x - z
  }

  static fromOffsetCoordinates(x: number, z: number) {
    // undo horizontal shift
    return new HexCoordinate(x - Math.floor(z / 2), z)
  }

  static fromPosition(position: Point) {
    // Basically, figure out which cell we're in by undoing the initial translation
    let x = position.x / (innerRadius * 2)
    let y = -x
    const offset = position.y / (outerRadius * 3)
    x -= offset
    y -= offset
    let iX = Math.round(x)
    const iY = Math.round(y)
    let iZ = Math.round(-x - y)
    // Fix rounding error in coordinate calculation
    if (iX + iY + iZ !== 0) {
      const dX = Math.abs(x - iX)
      const dY = Math.abs(y - iY)
      const dZ = Math.abs(-x - y - iZ)
      // Discard coord with largest delta
      if (dX > dY && dX > dZ) iX = -iY - iZ
      else if (dZ > dY) iZ = -iX - iY
      // we can ignore iY, we don't use it anyway
    }
    return new HexCoordinate(iX, iZ)
  }

  toString() {
    return `(${this.x}, ${this.y}, ${this.z})`
  }

  toStringOnSeparateLines() {
    return `${this.x}\n${this.y}\n${this.z}`
  }
}
