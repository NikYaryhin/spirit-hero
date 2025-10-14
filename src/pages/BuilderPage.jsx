import BuilderHeader from '@/components/BuilderHeader/BuilderHeader'
import LogoPicker from '@/components/LogoPicker/LogoPicker'
import StoreDetailsForm from '@/components/StoreDetailsForm/StoreDetailsForm'
import { useState } from 'react'

export default function Builder() {
	const [activeStep, setActiveStep] = useState(2)

	return (
		<>
			<BuilderHeader activeStep={activeStep} setActiveStep={setActiveStep} />
			<LogoPicker />
			<StoreDetailsForm />
		</>
	)
}
