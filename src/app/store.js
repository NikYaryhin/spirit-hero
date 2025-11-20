import { configureStore } from '@reduxjs/toolkit';
import flashSaleReducer from '../features/flashSale/flashSaleSlice';
import navigationReducer from '../features/navigation/navigationSlice';

export const store = configureStore({
  reducer: {
    flashSale: flashSaleReducer,
    navigation: navigationReducer,
    // другие редьюсеры можно добавить здесь
  },
});
