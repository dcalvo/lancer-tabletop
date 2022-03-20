import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "src/store/store"

// State
interface ViewportContolState {
  controlsEnabled: boolean
}

const initialState: ViewportContolState = {
  controlsEnabled: false,
}

// Reducers
export const viewportControlSlice = createSlice({
  name: "viewportControl",
  initialState,
  reducers: {
    changeControlsEnabled: (state, action: PayloadAction<boolean>) => {
      state.controlsEnabled = action.payload
    },
  },
})

// Selectors
const selectControlsEnabled = (state: RootState) => state.viewportControl.controlsEnabled

// Exports
export { selectControlsEnabled }

export const { changeControlsEnabled } = viewportControlSlice.actions

export default viewportControlSlice.reducer
