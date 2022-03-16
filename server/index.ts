import express from "express"
import path from "path"
// import cluster from "cluster"
// import os from "os"
import webSocket from "./websockets"

// const numCPUs = os.cpus().length

const isDev = process.env.NODE_ENV !== "production"
const PORT = process.env.PORT || 5000

// // Multi-process to utilize all CPU cores.
// if (!isDev && cluster.isPrimary) {
//   console.error(`Node cluster master ${process.pid} is running`)

//   // Fork workers.
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork()
//   }

//   cluster.on("exit", (worker, code, signal) => {
//     console.error(
//       `Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`,
//     )
//   })
// } else {
const app = express()

// Priority serve any static files (during production).
app.use(express.static(path.resolve(__dirname, "../../client/build")))

// Answer API requests.
app.get("/api", (req, res) => {
  res.set("Content-Type", "application/json")
  res.send('{"message":"Hello from the custom server!"}')
})

// All remaining requests return the React app, so it can handle routing.
app.get("*", (request, response) => {
  response.sendFile(path.resolve(__dirname, "../../client/build", "index.html"))
})

const server = app.listen(PORT, () => {
  console.error(
    `Node ${
      isDev ? "dev server" : `cluster worker ${process.pid}`
    }: listening on http://localhost:${PORT}`,
  )
})

webSocket(server)
// }
