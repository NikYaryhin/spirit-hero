import css from './FundraisingTypeModal.module.css'
import Icon from '../Icon'
import { useDispatch } from 'react-redux'
import { setIsFundraisingGroup } from '@/features/products/productsSlice'
import { setActiveStep } from '@/features/navigation/navigationSlice'
import { setIsLoading } from '@/features/products/productsSlice'

export default function FundraisingTypeModal({ setIsFundraisingModalOpen }) {
	const dispatch = useDispatch()

	const handleFundrise = () => {
		dispatch(setIsFundraisingGroup(true))
		setIsFundraisingModalOpen(false)
		dispatch(setActiveStep(4))
		dispatch(setIsLoading(true))
	}

	const handleSellAtCost = () => {
		dispatch(setIsFundraisingGroup(false))
		setIsFundraisingModalOpen(false)
		dispatch(setActiveStep(4))
		dispatch(setIsLoading(true))
	}

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
