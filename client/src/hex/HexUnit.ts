export default class HexUnit {
  size: number
  blocking: boolean = false

  constructor(size: number) {
    this.size = size
  }
}

// Just a type declaration to represent the constructor of a given class, this is the Typescript magic
type Constructor<I> = new (...args: any[]) => I

// Add a function with access on Base property
function Moves<T extends Constructor<HexUnit>>(Base: T) {
  type MovementMode = "walking" | "flying" | "teleporting"
  return class Moves extends Base {
    movementMode: MovementMode = "walking"
    move() {
      console.log(this.size)
    }

    setMovementMode(movementMode: MovementMode) {
      this.movementMode = movementMode
    }
  }
}

// Change a Base property just by constructing the object
function Blocks<T extends Constructor<HexUnit>>(Base: T) {
  return class Moves extends Base {
    constructor(...args: any[]) {
      super(...args)
      this.blocking = true
    }
  }
}

// Create commonly used composite classes
class BlockingUnit extends Blocks(HexUnit) {}

const movingUnit = new (Moves(HexUnit))(2)
movingUnit.move() // outputs 2
movingUnit.setMovementMode("teleporting")
console.log(movingUnit.blocking) // outputs false

const blockingUnit = new BlockingUnit(2)
console.log(blockingUnit.blocking) // outputs true

const blockingMovingUnit = new (Blocks(Moves(HexUnit)))(5)
blockingMovingUnit.move() // outputs 5
console.log(blockingMovingUnit.blocking) // outputs true

// Some other cool stuff
class MovingUnit extends Moves(HexUnit) {}

// Add a function contingent on another function being present
function Teleports<T extends Constructor<MovingUnit>>(Base: T) {
  return class Moves extends Base {
    teleport() {
      this.move() // but like really fast
    }
  }
}

class TeleportingUnit extends Teleports(Moves(HexUnit)) {}
class OtherTeleportingUnit extends Teleports(MovingUnit) {}
class BlockingMovingUnit extends Blocks(Moves(HexUnit)) {}

// Add a Base property just by constructing the object
function Foos<T extends Constructor<HexUnit>>(Base: T) {
  return class Moves extends Base {
    Foos = 1337
  }
}

// Narrow unit's capabilities
function test(unit: HexUnit | MovingUnit | BlockingUnit | BlockingMovingUnit) {
  console.log("testing...")
  if ("move" in unit) {
    console.log("moving!")
    if (unit.blocking) {
      console.log("and blocking!")
    }
  }
}
test(blockingMovingUnit)
test(movingUnit)
test(blockingUnit)
