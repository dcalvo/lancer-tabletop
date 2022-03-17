import { Application } from "pixi.js"
import { useEffect, useRef } from "react"

// Take in a Pixi application, return a JSX canvas element
function Pixi({ app }: { app: Application }) {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // on first render, add to DOM
    if (canvasRef.current) {
      canvasRef.current.replaceWith(app.view)
      app.start()
    }

    return () => {
      // on unload, stop the app
      app.destroy(true, true)
    }
  }, [canvasRef, app])

  return <div ref={canvasRef}></div>
}

export default Pixi
