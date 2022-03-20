import { useAppDispatch, useAppSelector } from "src/store/hooks"
import {
  changeEditMode,
  changeShowCoordinates,
  selectEditMode,
  selectShowCoordinates,
} from "./hexGridEditorSlice"

import { Checkbox, Radio, RadioGroup, FormControlLabel } from "@mui/material"

export default function HexGridEditorMenu() {
  const dispatch = useAppDispatch()
  const currentEditMode = useAppSelector(selectEditMode)
  const currentShowCoordinates = useAppSelector(selectShowCoordinates)

  return (
    <>
      <h3>Hex Grid</h3>
      <RadioGroup
        value={currentEditMode}
        onChange={(e) => dispatch(changeEditMode(e.target.value))}
      >
        <FormControlLabel label="Terrain" control={<Radio />} value="terrain" />
        <FormControlLabel label="Distance" control={<Radio />} value="distance" />
        <FormControlLabel label="Dummy" control={<Radio />} value="dummy" />
      </RadioGroup>
      <FormControlLabel
        label="Show Coordinates"
        control={<Checkbox />}
        checked={currentShowCoordinates}
        onChange={() => dispatch(changeShowCoordinates(!currentShowCoordinates))}
      />
    </>
  )
}
