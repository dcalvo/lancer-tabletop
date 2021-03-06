import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import App from "./App"
import { store } from "./store/store"
import { Provider } from "react-redux"
import reportWebVitals from "./reportWebVitals"
import "./hex/HexUnit"

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root"),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()

// Determine where to forward requests to
export const serverLocation =
  process.env.NODE_ENV === "production"
    ? window.location.origin
    : `${window.location.protocol}//${window.location.hostname}:5000`
