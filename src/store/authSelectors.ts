import { store } from './store';

export const getAccessToken = () => store.getState().auth.token;
