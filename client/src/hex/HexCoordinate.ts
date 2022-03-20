import { Point } from "pixi.js"
import { innerRadius, outerRadius } from "./HexMetrics"

export default class HexCoordinate {
  X: number
  Y: number
  Z: number

  constructor(x: number, z: number) {
    this.X = x
    this.Z = z
    // all coordinates sum to 0, derive y from x and z
    this.Y = -x - z
  }

  distanceTo(other: HexCoordinate) {
    return (
      (Math.abs(this.X - other.X) + Math.abs(this.Y - other.Y) + Math.abs(this.Z - other.Z)) / 2
    )
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
    return `(${this.X}, ${this.Y}, ${this.Z})`
  }

  toStringOnSeparateLines() {
    return `${this.X}\n${this.Y}\n${this.Z}`
  }
}
