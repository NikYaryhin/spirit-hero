import { configureStore } from '@reduxjs/toolkit'
import flashSaleReducer from '../features/flashSale/flashSaleSlice'
import navigationReducer from '../features/navigation/navigationSlice'
import productsReducer from '../features/products/productsSlice'

export const store = configureStore({
	reducer: {
		flashSale: flashSaleReducer,
		navigation: navigationReducer,
		products: productsReducer,
		// другие редьюсеры можно добавить здесь
	},
})
