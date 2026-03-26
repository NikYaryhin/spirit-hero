import css from './FundraisingTypeModal.module.css'
import Icon from '../Icon'
import { useDispatch, useSelector } from 'react-redux'
import { setIsFundraisingGroup, setMinimalGroups } from '@/features/products/productsSlice'
import { setActiveStep } from '@/features/navigation/navigationSlice'
import { setIsLoading } from '@/features/products/productsSlice'
import { useEffect } from 'react'
import spiritHeroApi from '@api/spiritHeroApi'
import { showToast } from '@/helpers/toastCall'

export default function FundraisingTypeModal({ setIsFundraisingModalOpen }) {
	const dispatch = useDispatch()
	const storeId = useSelector((state) => state.flashSale.storeId)

	const setQueryParam = (key, value) => {
		const url = new URL(window.location.href)
		url.searchParams.set(key, value)

		window.history.replaceState({}, '', url)
	}
	const handleFundrise = async () => {
		dispatch(setIsFundraisingGroup(true))
		setQueryParam('fundraising', 'true')
		await spiritHeroApi.setIsFundraisePopup(+storeId)
		setIsFundraisingModalOpen(false)
		dispatch(setActiveStep(4))
		/*	dispatch(setIsLoading(true))*/
	}

	const handleSellAtCost = async () => {
		dispatch(setIsFundraisingGroup(false))
		setQueryParam('fundraising', 'false')
		await spiritHeroApi.setIsFundraisePopup(+storeId)
		setIsFundraisingModalOpen(false)
		dispatch(setActiveStep(4))
		/*
				dispatch(setIsLoading(true))
		*/
	}
	/*useEffect(() => {
		async function loadData() {
			try {
				setIsLoading(true)
				const [ storeRes] = await Promise.all([
					spiritHeroApi.getStore(+storeId)
				])
				if (storeRes?.store?.is_fundraise_popup) {
					setIsFundraisingModalOpen(false)
					dispatch(setActiveStep(4))
				}

			} catch (e) {
				showToast('Failed to load data', 'error')
			} finally {
				setIsLoading(false)
			}
		}
		loadData()
	}, [])*/

	return (
		<>
			<div className={css.fundraising__modal__content}>
				<div className={css.point}>
					<Icon name={'RateUp'} className={css.point__icon} />
					<h3 className={css.fundraising__modal__title}>Make money</h3>
					<span className={css.fundraising__modal__subtitle}>Add a markup and make money</span>

					<button className={css.fundraising__modal__button} onClick={handleFundrise}>Fundrise</button>
				</div>

				<div className={css.point}>
					<Icon name={'DarkCoins'} className={css.point__icon} />
					<h3 className={css.fundraising__modal__title}>Sell item at cost</h3>
					<span className={css.fundraising__modal__subtitle}>Sell item for as low as possible</span>

					<button className={css.fundraising__modal__button} onClick={handleSellAtCost}>Sell item at cost</button>
				</div>
			</div>

			<button className={css.fundraising__modal__button__cancel} onClick={() => setIsFundraisingModalOpen(false)}>Cancel and Edit design</button>
		</>
	)
}
