import { configureStore } from '@reduxjs/toolkit';
import searchReducer from '@/store/features/searchSlice';

export const store = configureStore({
  reducer: {
    search: searchReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['search/setDestination'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.destination'],
        // Ignore these paths in the state
        ignoredPaths: ['search.destination'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
