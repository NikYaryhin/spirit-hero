import BuilderHeader from '@/components/BuilderHeader/BuilderHeader'
import Details from '@/components/Steps/Details'
import ProductsStep from '@/components/Steps/ProductsStep'
import DesignStep from '@/components/DesignStep/DesignStep'
import FundraisingStep from '@/components/FundraisingStep/FundraisingStep'
import Modal from '@/components/Modal/Modal'
import { useState, useRef } from 'react'

export default function Builder() {
	const [myShopProducts, setMyShopProducts] = useState([])
	const [activeStep, setActiveStep] = useState(4)
	const [storeId, setStoreId] = useState(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const designStepRef = useRef(null)

	// Функция для обработки перехода на следующий шаг
	const handleNextStep = async () => {
		// Если мы на шаге 3 (Design), вызываем getLogoParameters перед переходом
		if (activeStep === 3 && designStepRef.current) {
			try {
				await designStepRef.current.getLogoParameters()
			} catch (error) {
				console.error('Error calling getLogoParameters:', error)
			}
		}
		// Переходим на следующий шаг
		setActiveStep((prev) => Math.min(prev + 1, 4))
	}

	return (
		<>
			<BuilderHeader
				activeStep={activeStep}
				setActiveStep={setActiveStep}
				onNextStep={handleNextStep}
			/>

			{activeStep === 1 && <Details setStoreId={setStoreId} />}
			{activeStep === 2 && (
				<ProductsStep
					myShopProducts={myShopProducts}
					setMyShopProducts={setMyShopProducts}
					storeId={storeId}
					setActiveStep={setActiveStep}
				/>
			)}
			{activeStep === 3 && <DesignStep ref={designStepRef} storeId={storeId} />}

			{activeStep === 4 && <FundraisingStep />}

			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
				{activeStep === 2 && <h1>Products modal</h1>}
			</Modal>
		</>
	)
}
