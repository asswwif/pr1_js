import { createSlice, createAsyncThunk, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { fetchParticipants as apiFetchParticipants, importExternalUsers } from '../utils/api';

const participantsAdapter = createEntityAdapter();

export const fetchParticipantsThunk = createAsyncThunk(
  'participants/fetchByEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      return await apiFetchParticipants(eventId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Новий Thunk для ЛР №3
export const importUsersThunk = createAsyncThunk(
    'participants/importExternal',
    async (_, { rejectWithValue }) => {
        try {
            return await importExternalUsers();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const participantsSlice = createSlice({
  name: 'participants',
  initialState: participantsAdapter.getInitialState({
    status: 'idle',
    error: null,
    searchQuery: ''
  }),
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchParticipantsThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchParticipantsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        participantsAdapter.setAll(state, action.payload);
      })
      .addCase(importUsersThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Додаємо нових користувачів до існуючих
        participantsAdapter.addMany(state, action.payload);
      });
  }
});

export const { setSearchQuery } = participantsSlice.actions;
export const { selectAll: selectAllParticipants } = participantsAdapter.getSelectors(state => state.participants);

export const selectFilteredParticipants = createSelector(
  [selectAllParticipants, (state) => state.participants.searchQuery],
  (participants, query) => {
    const q = query.toLowerCase();
    return participants.filter(p => 
      p.fullName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
    );
  }
);

export default participantsSlice.reducer;