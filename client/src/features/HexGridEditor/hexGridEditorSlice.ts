import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface HexGridEditorState {
  editMode: string
}

const initialState: HexGridEditorState = {
  editMode: "dummy",
}

export const hexGridEditorSlice = createSlice({
  name: "hexGridEditor",
  initialState,
  reducers: {
    changeEditMode: (state, action: PayloadAction<string>) => {
      state.editMode = action.payload
    },
  },
})

export const { changeEditMode } = hexGridEditorSlice.actions

export default hexGridEditorSlice.reducer
