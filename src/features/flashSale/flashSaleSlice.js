import { createSlice } from '@reduxjs/toolkit'

// Начальное состояние
const initialState = {
	isFlashSale: false,
	storeId: null,
	storeInfo: null,
	pricePerColor: 0,
}

const flashSaleSlice = createSlice({
	name: 'flashSale',
	initialState,
	reducers: {
		toggleFlashSale: (state) => {
			state.isFlashSale = !state.isFlashSale
		},
		setFlashSale: (state, action) => {
			state.isFlashSale = action.payload
		},
		setStoreId: (state, action) => {
			state.storeId = action.payload
		},
		clearStoreId: (state) => {
			state.storeId = null
		},
		setStoreInfo: (state, action) => {
			state.storeInfo = action.payload
		},
		clearStoreInfo: (state) => {
			state.storeInfo = null
		},
		setPricePerColor: (state, action) => {
			state.pricePerColor = action.payload
		},
		clearPricePerColor: (state) => {
			state.pricePerColor = 0
		},
	},
})

export const {
	toggleFlashSale,
	setFlashSale,
	setStoreId,
	clearStoreId,
	setStoreInfo,
	clearStoreInfo,
	setPricePerColor,
	clearPricePerColor,
} = flashSaleSlice.actions
export default flashSaleSlice.reducer
