import { createSlice } from '@reduxjs/toolkit'
import { STEPS_LIST } from '@/helpers/const'

const initialState = {
	activeStep: 1,
	totalSteps: STEPS_LIST.length + 1,
}

const navigationSlice = createSlice({
	name: 'navigation',
	initialState,
	reducers: {
		nextStep: (state) => {
			state.activeStep = Math.min(state.activeStep + 1, state.totalSteps)
		},
		prevStep: (state) => {
			state.activeStep = Math.max(state.activeStep - 1, 1)
		},
		setActiveStep: (state, action) => {
			const newStep = Number(action.payload)
			if (newStep >= 1 && newStep <= state.totalSteps) {
				state.activeStep = newStep
			}
		},
	},
})

export const { nextStep, prevStep, setActiveStep } = navigationSlice.actions
export default navigationSlice.reducer
