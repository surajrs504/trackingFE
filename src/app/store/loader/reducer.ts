// store/reducer.ts
import { createReducer, on } from '@ngrx/store';
import { showLoading, hideLoading, changeUserDetails } from './action';

// Define the initial state for loading spinner
export interface UiState {
  loading: boolean;
  userDetails: any;
}

export const initialState: UiState = {
  loading: false, // Initially, loading is false (spinner is hidden)
  userDetails: {},
};

// Create the reducer to manage the loading state
export const uiReducer = createReducer(
  initialState,
  on(showLoading, (state) => ({ ...state, loading: true })),
  on(hideLoading, (state) => ({ ...state, loading: false })),
  on(changeUserDetails, (state: any, { userDetails }) => {
    return { ...state, userDetails: userDetails };
  })
);
