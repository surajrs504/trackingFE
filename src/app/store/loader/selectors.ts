import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UiState } from './reducer';

// Select the UI state from the store
export const selectUiState = createFeatureSelector<UiState>('ui');

// Selector to get the loading state
export const selectLoading = createSelector(
  selectUiState,
  (state: UiState) => state.loading
);

export const selectUserDetailsState = createFeatureSelector ('userDetails')

export const selectUserDetails = createSelector(
  selectUiState,
  (state:UiState)=> state.userDetails
)
