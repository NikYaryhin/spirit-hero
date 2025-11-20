import { createSlice } from '@reduxjs/toolkit'

// Начальное состояние
const initialState = {
	isFlashSale: false,
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
	},
})

export const { toggleFlashSale, setFlashSale } = flashSaleSlice.actions
export default flashSaleSlice.reducer
