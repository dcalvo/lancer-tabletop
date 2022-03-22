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
  distance = Infinity
  pathFrom: HexCell = this
  searchHeuristic = 0
  searchPhase = 0
  nextWithSamePriority: HexCell | null = null

  private neighbors: HexCell[] = []
  private _color: number | undefined = undefined
  private cellLabel: Text
  private coordinateGraphic: Text
  private cellGraphic = new Graphics()
  private cellCorners: Point[] = []
  private highlightGraphic = new Graphics()
  private highlightCorners: Point[] = []

  // Constructor
  constructor(position: Point, coordinate: HexCoordinate) {
    this.position = position
    this.coordinate = coordinate
    this.cellCorners = getCorners(this.position)
    this.cellGraphic.hitArea = new Polygon(this.cellCorners)

    // Set up Graphics children
    this.highlightCorners = getCorners(this.position, 0.8)
    this.cellGraphic.addChild(this.highlightGraphic)

    this.cellLabel = new Text("", {
      fontSize: 32,
      align: "center",
    })
    this.cellLabel.anchor.set(0.5, 0.5)
    this.cellLabel.position.copyFrom(this.position)
    this.cellLabel.renderable = false
    this.cellGraphic.addChild(this.cellLabel)

    this.coordinateGraphic = new Text(this.coordinate.toStringOnSeparateLines(), {
      fontSize: 16,
      align: "center",
    })
    this.coordinateGraphic.anchor.set(0.5, 0.5)
    this.coordinateGraphic.position.copyFrom(this.position)
    this.cellGraphic.addChild(this.coordinateGraphic)

    // Subscribe to stage changes
    observeStore(
      selectShowCoordinates,
      (displayCoordinates) => (this.coordinateGraphic.renderable = displayCoordinates),
    )
  }

  get color() {
    return this._color
  }

  set color(value: number | undefined) {
    this._color = value
    this.draw()
  }

  get searchPriority() {
    return this.distance + this.searchHeuristic
  }

  getNeighbor(direction: HexDirection) {
    return this.neighbors[direction]
  }

  setNeighbor(direction: HexDirection, cell: HexCell) {
    this.neighbors[direction] = cell
    cell.neighbors[HexDirection.opposite(direction)] = this
  }

  setLabel(label: string | null) {
    if (label) {
      this.cellLabel.text = label
      this.cellLabel.renderable = true
    } else {
      this.cellLabel.renderable = false
    }
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

    // Draw the cell
    if (this.color) this.cellGraphic.beginFill(this.color)
    this.cellGraphic.lineStyle(lineWidth, lineColor, lineAlpha).drawPolygon(this.cellCorners)
    return this.cellGraphic
  }
}
