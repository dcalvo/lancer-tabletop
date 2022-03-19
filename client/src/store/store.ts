import { configureStore } from "@reduxjs/toolkit"
import hexGridEditorReducer from "../features/HexGridEditor/hexGridEditorSlice"

export const store = configureStore({
  reducer: {
    hexGridEditor: hexGridEditorReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch
