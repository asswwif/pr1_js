import { configureStore } from '@reduxjs/toolkit';
import participantsReducer from './participantsSlice';
import eventsReducer from './eventsSlice'; 

export const store = configureStore({
  reducer: {
    participants: participantsReducer,
    events: eventsReducer, 
  },
});