import BuilderHeader from '@/components/BuilderHeader/BuilderHeader'
import Details from '@/components/Steps/Details'
import ProductsStep from '@/components/Steps/ProductsStep'
import DesignStep from '@/components/DesignStep/DesignStep'
import FundraisingStep from '@/components/FundraisingStep/FundraisingStep'
import Modal from '@/components/Modal/Modal'
import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { nextStep } from '@/features/navigation/navigationSlice'
import FlashSale from '@/components/FlashSale/FlashSale'
import Loader from '@/components/Loader/Loader'
import ProductStepValidationModal from '@/components/ProductStepValidationModal/ProductStepValidationModal'
import FundraisingNextStepModal from '@/components/FundraisingNextStepModal/FundraisingNextStepModal'
import spiritHeroApi from '@/api/spiritHeroApi'
import {
	setStoreId as setStoreIdAction,
	setStoreInfo,
	setFlashSale,
} from '@/features/flashSale/flashSaleSlice'
import {
	setMyShopProducts,
	setInitialMyShopProducts,
	fetchProducts,
} from '@/features/products/productsSlice'

export default function Builder() {
	const dispatch = useDispatch()
	const isLoading = useSelector((state) => state.products.isLoading)
	const activeStep = useSelector((state) => state.navigation.activeStep)
	// const storeId = useSelector((state) => state.flashSale.storeId)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const designStepRef = useRef(null)

	useEffect(() => {
		const initBuilder = async () => {
			try {
				if (!localStorage.getItem('access_token')) {
					const res = await spiritHeroApi.login('admin@gmail.com', '12345678')
					console.log('Login res', res)
				}

				const params = new URLSearchParams(window.location.search)
				const storeIdFromQuery = params.get('store_id')

				if (!storeIdFromQuery) return

				dispatch(setStoreIdAction(storeIdFromQuery))
				try {
					const storeData = await spiritHeroApi.getStore(storeIdFromQuery)
					console.log('getStore', storeData)

					dispatch(setStoreInfo(storeData))
					if (storeData.products) {
						dispatch(setMyShopProducts(storeData.products))
						dispatch(setInitialMyShopProducts(storeData.products))
						dispatch(setFlashSale(storeData.store.is_flash_sale ? true : false))
					}

					dispatch(fetchProducts())
				} catch (error) {
					console.error('Error fetching store info:', error)
					alert(
						error?.response?.data?.message ||
							error?.message ||
							'Data fetching error. Please, try again',
					)
				}
			} catch (err) {
				console.error('Login Error', err)
			}
		}

		initBuilder()
	}, [dispatch])

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
			{isLoading && <Loader />}
			<BuilderHeader onNextStep={handleNextStep} />

			{activeStep === 1 && <Details />}
			{activeStep === 2 && <ProductsStep />}
			{activeStep === 3 && <DesignStep ref={designStepRef} />}

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
					<FundraisingNextStepModal
						setIsModalOpen={setIsModalOpen}
						closeModal={() => setIsModalOpen(false)}
					/>
				)}
			</Modal>
		</>
	)
}
