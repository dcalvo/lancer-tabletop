import { Graphics, Point, Polygon, Text } from "pixi.js"
import HexCoordinate from "./HexCoordinate"
import { innerRadius, outerRadius, lineWidth, lineColor, lineAlpha } from "./HexMetrics"
import HexDirection from "./HexDirection"
import { observeStore } from "src/store/store"
import { selectShowCoordinates } from "src/features/HexGridEditor/hexGridEditorSlice"

function getCorners(position: Point, scale = 1) {
  const { x, y } = position
  const corners: Point[] = []
  const scaledOuterRadius = outerRadius * scale
  const scaledInnerRadius = innerRadius * scale
  corners.push(new Point(x, y + scaledOuterRadius))
  corners.push(new Point(x + scaledInnerRadius, y + 0.5 * scaledOuterRadius))
  corners.push(new Point(x + scaledInnerRadius, y - 0.5 * scaledOuterRadius))
  corners.push(new Point(x, y - scaledOuterRadius))
  corners.push(new Point(x - scaledInnerRadius, y - 0.5 * scaledOuterRadius))
  corners.push(new Point(x - scaledInnerRadius, y + 0.5 * scaledOuterRadius))
  return corners
}

export default class HexCell {
  position: Point
  coordinate: HexCoordinate
  impassable = false
  pathFrom: HexCell = this
  searchHeuristic = 0
  nextWithSamePriority: HexCell | null = null

  private neighbors: HexCell[] = []
  private _color: number | undefined = undefined
  private _displayCoordinates = false
  private cellGraphic = new Graphics()
  private cellCorners: Point[] = []
  private highlightGraphic = new Graphics()
  private highlightCorners: Point[] = []
  private distanceGraphic: Text
  private _distance = Infinity

  // Constructor
  constructor(position: Point, coordinate: HexCoordinate) {
    this.position = position
    this.coordinate = coordinate
    this.cellCorners = getCorners(this.position)
    this.cellGraphic.hitArea = new Polygon(this.cellCorners)

    this.highlightCorners = getCorners(this.position, 0.8)
    this.cellGraphic.addChild(this.highlightGraphic)

    this.distanceGraphic = new Text(this.distance.toString(), {
      fontSize: 32,
      align: "center",
    })
    this.distanceGraphic.anchor.set(0.5, 0.5)
    this.distanceGraphic.position.copyFrom(this.position)
    this.distanceGraphic.renderable = false
    this.cellGraphic.addChild(this.distanceGraphic)

    // Subscribe to stage changes
    observeStore(
      selectShowCoordinates,
      (displayCoordinates) => (this.displayCoordinates = displayCoordinates),
    )
  }
  //TODO: remove
  hasRoad() {
    return this.color === 0xff0000
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
    if (this._distance === Infinity) {
      this.distanceGraphic.renderable = false
    } else {
      this.distanceGraphic.text = value.toString()
      this.distanceGraphic.renderable = true
    }
  }

  get searchPriority() {
    return this.distance + this.searchHeuristic
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

  enableHighlight(color: number) {
    this.highlightGraphic.lineStyle(5, color, 1).drawPolygon(this.highlightCorners)
    this.highlightGraphic.renderable = true
  }

  disableHighlight() {
    this.highlightGraphic.renderable = false
  }

  draw() {
    // Clean up old graphics
    this.cellGraphic.clear()
    // this.cellGraphic.removeChildren(0, this.cellGraphic.children.length)

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

    // Draw the cell
    if (this.color) this.cellGraphic.beginFill(this.color)
    this.cellGraphic.lineStyle(lineWidth, lineColor, lineAlpha).drawPolygon(this.cellCorners)
    return this.cellGraphic
  }
}
