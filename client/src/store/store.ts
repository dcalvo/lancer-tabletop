import { configureStore } from "@reduxjs/toolkit"
import hexGridEditorReducer from "../features/HexGridEditor/hexGridEditorSlice"

export const store = configureStore({
  reducer: {
    hexGridEditor: hexGridEditorReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export function observeStore<T>(
  select: (state: RootState) => T,
  onChange: (currentState: T) => void,
) {
  let currentState: T

  const handleChange = () => {
    const nextState = select(store.getState())
    if (nextState !== currentState) {
      currentState = nextState
      onChange(currentState)
    }
  }

  let unsubscribe = store.subscribe(handleChange)
  handleChange()
  return unsubscribe
}
