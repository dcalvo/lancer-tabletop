import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "src/store/store"

// State
interface HexGridEditorState {
  editMode: boolean
  showCoordinates: boolean
  brush: {
    minSize: number
    maxSize: number
    size: number
    type: string
  }
}

const initialState: HexGridEditorState = {
  editMode: false,
  showCoordinates: false,
  brush: {
    minSize: 0,
    maxSize: 5,
    size: 0,
    type: "dummy",
  },
}

// Reducers
export const hexGridEditorSlice = createSlice({
  name: "hexGridEditor",
  initialState,
  reducers: {
    changeEditMode: (state, action: PayloadAction<HexGridEditorState["editMode"]>) => {
      state.editMode = action.payload
    },
    changeShowCoordinates: (
      state,
      action: PayloadAction<HexGridEditorState["showCoordinates"]>,
    ) => {
      state.showCoordinates = action.payload
    },
    changeBrushSize: (state, action: PayloadAction<HexGridEditorState["brush"]["size"]>) => {
      const brush = state.brush
      // Clamp the brushSize
      brush.size = Math.min(Math.max(action.payload, brush.minSize), brush.maxSize)
    },
    changeBrushType: (state, action: PayloadAction<HexGridEditorState["brush"]["type"]>) => {
      state.brush.type = action.payload
    },
  },
})

// Selectors
const selectEditMode = (state: RootState) => state.hexGridEditor.editMode
const selectShowCoordinates = (state: RootState) => state.hexGridEditor.showCoordinates
const selectBrush = (state: RootState) => state.hexGridEditor.brush

// Exports
export { selectEditMode, selectShowCoordinates, selectBrush }

export const { changeEditMode, changeShowCoordinates, changeBrushSize, changeBrushType } =
  hexGridEditorSlice.actions

export default hexGridEditorSlice.reducer
