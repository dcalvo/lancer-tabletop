import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "src/store/store"

// State
interface HexGridEditorState {
  editMode: string
  showCoordinates: boolean
}

const initialState: HexGridEditorState = {
  editMode: "dummy",
  showCoordinates: false,
}

// Reducers
export const hexGridEditorSlice = createSlice({
  name: "hexGridEditor",
  initialState,
  reducers: {
    changeEditMode: (state, action: PayloadAction<string>) => {
      state.editMode = action.payload
    },
    changeShowCoordinates: (state, action: PayloadAction<boolean>) => {
      state.showCoordinates = action.payload
    },
  },
})

// Selectors
const selectEditMode = (state: RootState) => state.hexGridEditor.editMode
const selectShowCoordinates = (state: RootState) => state.hexGridEditor.showCoordinates

// Exports
export { selectEditMode, selectShowCoordinates }

export const { changeEditMode, changeShowCoordinates } = hexGridEditorSlice.actions

export default hexGridEditorSlice.reducer
