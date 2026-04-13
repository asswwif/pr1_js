import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchEvents as apiFetchEvents } from '../utils/api';

export const getEvents = createAsyncThunk(
    'events/fetchAll',
    async ({ page = 1, search = '' } = {}, { rejectWithValue }) => {
        try {
            return await apiFetchEvents(page, 10, 'date', 'asc', search);
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const eventsSlice = createSlice({
    name: 'events',
    initialState: {
        items: [],
        status: 'idle',
        error: null,
        total: 0,
        totalPages: 1
    },
    reducers: {
        resetStatus(state) {
            state.status = 'idle';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getEvents.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getEvents.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload.items || action.payload;
                state.total = action.payload.total || state.items.length;
                state.totalPages = action.payload.totalPages || 1;
            })
            .addCase(getEvents.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export const { resetStatus } = eventsSlice.actions;
export default eventsSlice.reducer;
