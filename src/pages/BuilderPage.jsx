import BuilderHeader from '@/components/BuilderHeader/BuilderHeader'
import Details from '@/components/Steps/Details'
import ProductsStep from '@/components/Steps/ProductsStep'

import { useState } from 'react'

export default function Builder() {
	const [activeStep, setActiveStep] = useState(2)

	return (
		<>
			<BuilderHeader activeStep={activeStep} setActiveStep={setActiveStep} />

			{activeStep === 1 && <Details />}
			{activeStep === 2 && <ProductsStep />}
		</>
	)
}
