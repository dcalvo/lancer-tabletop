import HexCell from "./HexCell"

export default class HexCellPriorityQueue {
  list: (HexCell | null)[] = []
  private _count = 0
  private minimum = Infinity

  get count() {
    return this._count
  }

  enqueue(cell: HexCell) {
    this._count += 1
    const priority = cell.searchPriority
    if (priority < this.minimum) this.minimum = priority
    while (priority >= this.list.length) this.list.push(null)
    cell.nextWithSamePriority = this.list[priority]
    this.list[priority] = cell
  }

  dequeue() {
    this._count -= 1
    for (; this.minimum < this.list.length; this.minimum++) {
      const cell = this.list[this.minimum]
      if (cell) {
        this.list[this.minimum] = cell.nextWithSamePriority
        return cell
      }
    }
    throw new Error("Attempt to dequeue an empty queue")
  }

  change(cell: HexCell, oldPriority: number) {
    let current = this.list[oldPriority]
    if (!current) throw new Error("No HexCell at this Priority")
    let next = current.nextWithSamePriority
    if (current === cell) this.list[oldPriority] = next
    else {
      // We're guaranteed to never access null if we've already captured if current === cell
      while (next !== cell) {
        current = next
        next = (current as HexCell).nextWithSamePriority
      }
      ;(current as HexCell).nextWithSamePriority = cell.nextWithSamePriority
    }
    this.enqueue(cell)
    this._count -= 1
  }

  clear() {
    this.list = []
    this._count = 0
  }
}
