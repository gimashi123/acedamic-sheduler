import { configureStore } from '@reduxjs/toolkit';
import profileReducer from '../features/profile/profileSlice';
import themeReducer from './themeSlice';

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    theme: themeReducer,
    // Add other reducers here as needed
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 