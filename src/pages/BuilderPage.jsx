import BuilderHeader from '@/components/BuilderHeader/BuilderHeader'
import Details from '@/components/Steps/Details'
import ProductsStep from '@/components/Steps/ProductsStep'
import DesignStep from '@/components/DesignStep/DesignStep'
import Modal from '@/components/Modal/Modal'

import { useState } from 'react'

export default function Builder() {
	const [myShopProducts, setMyShopProducts] = useState([])
	const [activeStep, setActiveStep] = useState(3)
	const [storeId, setStoreId] = useState(null)
	const [isModalOpen, setIsModalOpen] = useState(false)

	return (
		<>
			<BuilderHeader activeStep={activeStep} setActiveStep={setActiveStep} />

			{activeStep === 1 && <Details setStoreId={setStoreId} />}
			{activeStep === 2 && (
				<ProductsStep
					myShopProducts={myShopProducts}
					setMyShopProducts={setMyShopProducts}
					storeId={storeId}
					setActiveStep={setActiveStep}
				/>
			)}
			{activeStep === 3 && (
				<DesignStep
					myShopProducts={myShopProducts}
					storeId={storeId}
					setActiveStep={setActiveStep}
				/>
			)}

			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
				{activeStep === 2 && <h1>Products modal</h1>}
			</Modal>
		</>
	)
}
