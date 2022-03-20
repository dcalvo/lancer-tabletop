enum HexDirection {
  NE,
  E,
  SE,
  SW,
  W,
  NW,
}

namespace HexDirection {
  export function opposite(direction: HexDirection) {
    return direction < 3 ? direction + 3 : direction - 3
  }
}

export default HexDirection
