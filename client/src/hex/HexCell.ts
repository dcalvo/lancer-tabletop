import { Graphics, Point, Polygon, Sprite, Text } from "pixi.js"
import HexCoordinate from "./HexCoordinate"
import { innerRadius, outerRadius, lineWidth, lineColor, lineAlpha } from "./HexMetrics"
import HexDirection from "./HexDirection"
import { observeStore } from "src/store/store"
import { selectShowCoordinates } from "src/features/HexGridEditor/hexGridEditorSlice"
import { app } from "src/features/Viewport/Viewport"
import HexUnit from "./HexUnit"

const highlightGraphic = new Graphics()
const highlightCorners = getCorners(new Point(0, 0), 0.8)
highlightGraphic.lineStyle(5, 0xffffff, 1).drawPolygon(highlightCorners)
const highlightTexture = app.renderer.generateTexture(highlightGraphic)

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
  cellGraphic = new Graphics()
  containedUnits: HexUnit[] = []
  private _color: number | undefined = undefined
  private coordinateLabel: Text
  private cellCorners: Point[] = []

  // Pathfinding & Terrain properties
  impassable = false // TODO calculate impassable from "contains" array during occupy/unoccupy
  movementCost = 1 // TODO calculate movecost from "contains" array during occupy/unoccupy
  distance = Infinity
  pathFrom: HexCell = this
  searchHeuristic = 0
  searchPhase = 0
  nextWithSamePriority: HexCell | null = null
  private neighbors: HexCell[] = []
  private cellLabel: Text
  private highlightSprite = new Sprite()

  // Constructor
  constructor(position: Point, coordinate: HexCoordinate) {
    this.position = position
    this.coordinate = coordinate
    this.cellCorners = getCorners(this.position)
    this.cellGraphic.lineStyle(lineWidth, lineColor, lineAlpha).drawPolygon(this.cellCorners)
    this.cellGraphic.hitArea = new Polygon(this.cellCorners)

    // Set up Graphics children (but defer adding them)
    this.highlightSprite = Sprite.from(highlightTexture)
    this.highlightSprite.anchor.set(0.5, 0.5)
    this.highlightSprite.position.copyFrom(this.position)

    this.cellLabel = new Text("", {
      fontSize: 32,
      align: "center",
    })
    this.cellLabel.anchor.set(0.5, 0.5)
    this.cellLabel.position.copyFrom(this.position)

    this.coordinateLabel = new Text(this.coordinate.toStringOnSeparateLines(), {
      fontSize: 16,
      align: "center",
    })
    this.coordinateLabel.cacheAsBitmap = true
    this.coordinateLabel.anchor.set(0.5, 0.5)
    this.coordinateLabel.position.copyFrom(this.position)

    // Subscribe to stage changes
    observeStore(selectShowCoordinates, (displayCoordinates) =>
      displayCoordinates ? this.enableCoordText() : this.disableCoordText(),
    )
  }

  get color() {
    return this._color
  }

  set color(value: number | undefined) {
    this._color = value
    this.fill()
  }

  get searchPriority() {
    return Math.round(this.distance + this.searchHeuristic)
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
      this.cellGraphic.addChild(this.cellLabel)
    } else {
      this.cellGraphic.removeChild(this.cellLabel)
    }
  }

  enableHighlight(color: number) {
    this.highlightSprite.tint = color
    this.cellGraphic.addChild(this.highlightSprite)
  }

  disableHighlight() {
    this.cellGraphic.removeChild(this.highlightSprite)
  }

  enableCoordText() {
    this.cellGraphic.addChild(this.coordinateLabel)
  }

  disableCoordText() {
    this.cellGraphic.removeChild(this.coordinateLabel)
  }

  fill() {
    // Clean up old graphics
    this.cellGraphic.clear()

    // Draw the cell
    if (this.color) this.cellGraphic.beginFill(this.color)
    this.cellGraphic.lineStyle(lineWidth, lineColor, lineAlpha).drawPolygon(this.cellCorners)
    return this.cellGraphic
  }
}
