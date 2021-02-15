import { combineReducers } from 'redux';
import { operation, isReady } from './operation-reducer';
import card from './card-reducer';
import difficulty from './difficulty-reducer';

export const reducers = combineReducers({
  card,
  operation,
  isReady,
  difficulty,
});
