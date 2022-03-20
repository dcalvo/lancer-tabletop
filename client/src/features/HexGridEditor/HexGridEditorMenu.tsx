import { useRef } from "react"
import { useAppDispatch, useAppSelector } from "src/store/hooks"
import { Checkbox, Radio, RadioGroup, Slider, FormControlLabel, Stack } from "@mui/material"
import HexIcon from "@mui/icons-material/Hexagon"
import {
  changeBrushSize,
  changeEditMode,
  changeShowCoordinates,
  selectBrush,
  selectEditMode,
  selectShowCoordinates,
} from "./hexGridEditorSlice"

export default function HexGridEditorMenu() {
  const dispatch = useAppDispatch()
  const currentEditMode = useAppSelector(selectEditMode)
  const currentShowCoordinates = useAppSelector(selectShowCoordinates)
  const currentBrush = useAppSelector(selectBrush)
  const defaultBrushSize = useRef(currentBrush.size)

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
      <Stack spacing={2} direction="row" alignItems="center" sx={{ marginTop: 1 }}>
        <HexIcon />
        <Slider
          defaultValue={defaultBrushSize.current}
          step={1}
          min={currentBrush.minSize}
          max={currentBrush.maxSize}
          onChangeCommitted={(_, value) => dispatch(changeBrushSize(value as number))}
        />
      </Stack>
    </>
  )
}
