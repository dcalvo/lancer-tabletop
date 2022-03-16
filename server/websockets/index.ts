import { Server } from "http"
import { WebSocket, WebSocketServer } from "ws"

const clients = new Map<string, WebSocket>()
let lastMessage = "Type here!" // information shared by all websockets

// Generate a unique userid for everyuser.
const getUniqueID = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
  return `${s4() + s4()}-${s4()}`
}

// Set up a WebSocket connection
function setupWebSocket(ws: WebSocket) {
  // Add the client to the tracker
  const userID = getUniqueID()
  clients.set(userID, ws)
  console.log(`User ${userID} connected`)

  // Do client setup, like updating their initial textbox value
  ws.send(JSON.stringify({ valueChange: lastMessage }))

  // Handle messaging from the client
  ws.on("message", (data) => {
    console.log("received a message")
    const message = JSON.parse(data.toString())
    // If the textbox changed, echo its value to all other clients
    if (message.valueChange) {
      console.log("broadcasting a message")
      lastMessage = message.valueChange
      clients.forEach((websocket) => websocket.send(JSON.stringify(message)))
    }
  })

  // remove clients from the tracker
  ws.on("close", () => clients.delete(userID))
}

// Instantiate a WebSocketServer
export default (server: Server) => {
  const wsServer = new WebSocketServer({ server })

  // per websocket configuration
  wsServer.on("connection", (ws) => setupWebSocket(ws))

  return wsServer
}
