import React from "react"
import logo from "./logo.svg"
import "./App.css"

// Determine where to forward requests to
const serverLocation =
  process.env.NODE_ENV === "production"
    ? window.location.origin
    : `${window.location.protocol}//${window.location.hostname}:5000`

// Create a websocket
const ws = new WebSocket(serverLocation.replace(/^http/, "ws"))

// Update textbox based on received server updates
ws.onmessage = (event) => {
  console.log("received a message")
  const message = JSON.parse(event.data)
  if (message.valueChange) {
    const textBox = document.getElementById("textBox")
    if (textBox) (textBox as HTMLInputElement).value = message.valueChange
  }
}

// Transmit textbox updates to server
function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
  console.log("sending a message")
  ws.send(JSON.stringify({ valueChange: event.target.value }))
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <input id="textBox" type="text" onChange={(event) => handleChange(event)} />
      </header>
    </div>
  )
}

export default App
