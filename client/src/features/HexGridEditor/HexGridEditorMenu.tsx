import { useAppDispatch, useAppSelector } from "src/store/hooks"
import { changeEditMode } from "./hexGridEditorSlice"

export default function HexGridEditorMenu() {
  const dispatch = useAppDispatch()
  const currentEditMode = useAppSelector((state) => state.hexGridEditor.editMode)

  return (
    <>
      <div>
        <h3>Hex Grid</h3>
        <input
          type="radio"
          id="terrain"
          name="editMode"
          value={"terrain"}
          checked={currentEditMode === "terrain"}
          onChange={(e) => dispatch(changeEditMode(e.target.value))}
        />
        <label htmlFor="terrain">Terrain</label>
        <input
          type="radio"
          id="distance"
          name="editMode"
          value={"distance"}
          checked={currentEditMode === "distance"}
          onChange={(e) => dispatch(changeEditMode(e.target.value))}
        />
        <label htmlFor="distance">Distance</label>
        <input
          type="radio"
          id="dummy"
          name="editMode"
          value={"dummy"}
          checked={currentEditMode === "dummy"}
          onChange={(e) => dispatch(changeEditMode(e.target.value))}
        />
        <label htmlFor="dummy">Dummy</label>
      </div>
    </>
  )
}
