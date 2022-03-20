import ViewportControlMenu from "../ViewportControl/ViewportControlMenu"
import HexGridEditorMenu from "../HexGridEditor/HexGridEditorMenu"

export default function Sidebar() {
  return (
    <>
      <h1 className="center">Big Sidebar Menu</h1>
      <h3 className="center mypassion">graphic design is my passion</h3>
      <ViewportControlMenu />
      <HexGridEditorMenu />
    </>
  )
}
