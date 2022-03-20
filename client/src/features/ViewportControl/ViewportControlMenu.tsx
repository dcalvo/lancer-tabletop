import { Checkbox, FormControlLabel } from "@mui/material"
import { useAppDispatch, useAppSelector } from "src/store/hooks"
import { changeControlsEnabled, selectControlsEnabled } from "./viewportControlSlice"

export default function ViewportControlMenu() {
  const dispatch = useAppDispatch()
  const currentViewportControls = useAppSelector(selectControlsEnabled)

  return (
    <>
      <h3>Viewport</h3>
      <FormControlLabel
        label="Viewport Controls"
        control={<Checkbox />}
        checked={currentViewportControls}
        onChange={() => dispatch(changeControlsEnabled(!currentViewportControls))}
      />
    </>
  )
}
