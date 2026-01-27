import type { SwipeAction } from '@/types/matching.types';
import type { AppDispatch } from '@/store/store';
import { applySwipe, setSwipeDirection } from '../slices/matchingSlice';

export const handleSwipe = (direction: SwipeAction, matchId: string) => (dispatch: AppDispatch) => {
  dispatch(applySwipe({ direction, matchId }));
  setTimeout(() => {
    dispatch(setSwipeDirection(null));
  }, 300);
};
