import BuilderHeader from '@/components/BuilderHeader/BuilderHeader'
import Details from '@/components/Steps/Details'
import ProductsStep from '@/components/Steps/ProductsStep'
import DesignStep from '@/components/DesignStep/DesignStep'
import FundraisingStep from '@/components/FundraisingStep/FundraisingStep'
import Modal from '@/components/Modal/Modal'
import { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { nextStep } from '@/features/navigation/navigationSlice'
import FlashSale from '@/components/FlashSale/FlashSale'
import ProductStepValidationModal from '@/components/ProductStepValidationModal/ProductStepValidationModal'
import FundraisingNextStepModal from '@/components/FundraisingNextStepModal/FundraisingNextStepModal'

export default function Builder() {
	const [myShopProducts, setMyShopProducts] = useState([])
	const dispatch = useDispatch()
	const activeStep = useSelector((state) => state.navigation.activeStep)
	const [storeId, setStoreId] = useState(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const designStepRef = useRef(null)

	// Функция для обработки перехода на следующий шаг
	const handleNextStep = async () => {
		if (activeStep === 3 && designStepRef.current) {
			try {
				await designStepRef.current.getLogoParameters()
			} catch (error) {
				console.error('Error calling getLogoParameters:', error)
			}
		}

		if (activeStep === 2 || activeStep === 4) {
			setIsModalOpen(true)
		} else dispatch(nextStep())
	}

	return (
		<>
			<BuilderHeader onNextStep={handleNextStep} />

			{activeStep === 1 && <Details setStoreId={setStoreId} />}
			{activeStep === 2 && (
				<ProductsStep
					myShopProducts={myShopProducts}
					setMyShopProducts={setMyShopProducts}
					storeId={storeId}
				/>
			)}
			{activeStep === 3 && <DesignStep ref={designStepRef} storeId={storeId} />}

			{activeStep === 4 && <FundraisingStep />}
			{activeStep === 5 && <FlashSale />}

			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				className={'validation--modal'}
			>
				{activeStep === 2 && (
					<ProductStepValidationModal setIsModalOpen={setIsModalOpen} />
				)}
				{activeStep === 4 && (
					<FundraisingNextStepModal setIsModalOpen={setIsModalOpen} />
				)}
			</Modal>
		</>
	)
}
