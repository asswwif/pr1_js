import { createSlice, createAsyncThunk, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { fetchParticipants as apiFetchParticipants } from '../utils/api';

// Використання Entity Adapter для просунутого рівня
const participantsAdapter = createEntityAdapter();

export const fetchParticipantsThunk = createAsyncThunk(
  'participants/fetchByEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      const data = await apiFetchParticipants(eventId);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Не вдалося завантажити учасників');
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
      .addCase(fetchParticipantsThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchParticipantsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        participantsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchParticipantsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { setSearchQuery } = participantsSlice.actions;

// Селектори
export const { selectAll: selectAllParticipants } = participantsAdapter.getSelectors(state => state.participants);

// Динамічна фільтрація на рівні селектора (вимога завдання)
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