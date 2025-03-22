import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProfilePicture } from '../../types';

interface ProfileState {
  profilePicture: ProfilePicture | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profilePicture: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfileLoading: (state: ProfileState) => {
      state.loading = true;
      state.error = null;
    },
    setProfileError: (state: ProfileState, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setProfilePicture: (state: ProfileState, action: PayloadAction<ProfilePicture | null>) => {
      state.profilePicture = action.payload;
      state.loading = false;
      state.error = null;
    },
    clearProfileError: (state: ProfileState) => {
      state.error = null;
    },
  },
});

export const {
  setProfileLoading,
  setProfileError,
  setProfilePicture,
  clearProfileError,
} = profileSlice.actions;

export default profileSlice.reducer; 