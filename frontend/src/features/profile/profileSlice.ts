import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProfilePicture } from '../../types';
import { profileService } from './profileService';

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

// Async thunks
export const fetchProfilePicture = createAsyncThunk(
  'profile/fetchProfilePicture',
  async (_, { rejectWithValue }) => {
    try {
      const profilePicture = await profileService.getProfilePicture();
      return profilePicture;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch profile picture');
    }
  }
);

export const uploadProfilePicture = createAsyncThunk(
  'profile/uploadProfilePicture',
  async (file: File, { rejectWithValue }) => {
    try {
      const profilePicture = await profileService.uploadProfilePicture(file);
      return profilePicture;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to upload profile picture');
    }
  }
);

export const deleteProfilePicture = createAsyncThunk(
  'profile/deleteProfilePicture',
  async (_, { rejectWithValue }) => {
    try {
      await profileService.deleteProfilePicture();
      return null;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete profile picture');
    }
  }
);

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
  extraReducers: (builder) => {
    builder
      // Fetch profile picture
      .addCase(fetchProfilePicture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfilePicture.fulfilled, (state, action) => {
        state.profilePicture = action.payload;
        state.loading = false;
      })
      .addCase(fetchProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Upload profile picture
      .addCase(uploadProfilePicture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.profilePicture = action.payload;
        state.loading = false;
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete profile picture
      .addCase(deleteProfilePicture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProfilePicture.fulfilled, (state) => {
        state.profilePicture = null;
        state.loading = false;
      })
      .addCase(deleteProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setProfileLoading,
  setProfileError,
  setProfilePicture,
  clearProfileError,
} = profileSlice.actions;

export default profileSlice.reducer; 