import BuilderHeader from '@/components/BuilderHeader/BuilderHeader'
import Details from '@/components/Steps/Details'
import ProductsStep from '@/components/Steps/ProductsStep'
import DesignStep from '@/components/DesignStep/DesignStep'

import { useState } from 'react'

export default function Builder() {
	const [activeStep, setActiveStep] = useState(1)
	const [storeId, setStoreId] = useState(null)

	return (
		<>
			<BuilderHeader activeStep={activeStep} setActiveStep={setActiveStep} />

			{activeStep === 1 && <Details setStoreId={setStoreId} />}
			{activeStep === 2 && (
				<ProductsStep setStoreId={setStoreId} setActiveStep={setActiveStep} />
			)}
			{activeStep === 3 && <DesignStep setActiveStep={setActiveStep} />}
		</>
	)
}
