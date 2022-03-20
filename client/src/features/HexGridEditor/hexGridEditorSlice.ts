import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "src/store/store"

// State
interface HexGridEditorState {
  editMode: string
  showCoordinates: boolean
  brush: {
    minSize: number
    maxSize: number
    size: number
  }
}

const initialState: HexGridEditorState = {
  editMode: "dummy",
  showCoordinates: false,
  brush: {
    minSize: 0,
    maxSize: 5,
    size: 2,
  },
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
    changeBrushSize: (state, action: PayloadAction<number>) => {
      const brush = state.brush
      // Clamp the brushSize
      brush.size = Math.min(Math.max(action.payload, brush.minSize), brush.maxSize)
    },
  },
})

// Selectors
const selectEditMode = (state: RootState) => state.hexGridEditor.editMode
const selectShowCoordinates = (state: RootState) => state.hexGridEditor.showCoordinates
const selectBrush = (state: RootState) => state.hexGridEditor.brush

// Exports
export { selectEditMode, selectShowCoordinates, selectBrush }

export const { changeEditMode, changeShowCoordinates, changeBrushSize } = hexGridEditorSlice.actions

export default hexGridEditorSlice.reducer
