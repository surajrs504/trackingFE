// store/actions.ts
import { createAction, props } from '@ngrx/store';

// Action to show the loading spinner
export const showLoading = createAction('[UI] Show Loading');

// Action to hide the loading spinner
export const hideLoading = createAction('[UI] Hide Loading');

export const changeUserDetails= createAction('change user details',props<{userDetails:any}>());
