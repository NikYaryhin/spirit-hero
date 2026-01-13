import css from './InkModal.module.css'
import Icon from '../Icon'
import CustomSelect from '../CustomSelect/CustomSelect'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import spiritHeroApi from '@/api/spiritHeroApi'

const COLOR_SELECT_VALUES = [
	{ value: '0 Colors', id: 0, quantity: 0 },
	{ value: '1 Color', id: 1, quantity: 1 },
	{ value: '2 Colors', id: 2, quantity: 2 },
	{ value: '3 Colors', id: 3, quantity: 3 },
	{ value: '4 Colors', id: 4, quantity: 4 },
	{ value: '5 Colors', id: 5, quantity: 5 },
]

export default function InkModal() {
	const storeId = useSelector((state) => state.flashSale.storeId)

	const [price, setPrice] = useState(0)
	const [frontColorsCount, setFrontColorsCount] = useState(0)
	const [backColorsCount, setBackColorsCount] = useState(0)

	useEffect(() => {
		const backColorPrice = backColorsCount === 0 ? 0 : backColorsCount + 4
		setPrice(frontColorsCount + backColorPrice)
	}, [frontColorsCount, backColorsCount])

	const onButtonClick = async () => {
		const store_id = storeId || localStorage.getItem('storeId')
		const front_side = frontColorsCount
		const back_side = backColorsCount

		try {
			const res = spiritHeroApi.editInkColor(store_id, front_side, back_side)
			console.debug('editInkColor res', res)
		} catch (error) {
			console.error('spiritHeroApi.editInkColor()', error)
		}
	}

	return (
		<>
			<div className={css.modal__head}>
				<Icon name="Inks" className={css.icon} />

				<h3 className={css.title}>How many ink colors are in your design?</h3>

				<span className={css.subtitle}>
					The more ink colors you add, the higher price will be.
				</span>
			</div>

			<div className={css.modal__content}>
				<div className={css.selects__wrapper}>
					<div className={css.select__box}>
						<span className={css.select__label}>Front Side:</span>

						<CustomSelect
							name={'ink--modal--select'}
							info="+1 ink color = +$1.00 added to price"
							values={COLOR_SELECT_VALUES}
							setColorCount={setFrontColorsCount}
						/>
					</div>

					<div className={css.select__box}>
						<span className={css.select__label}>Back Side:</span>

						<CustomSelect
							name={'ink--modal--select'}
							info="+$5.00 for the first ink color, +$1.00 for each extra"
							values={COLOR_SELECT_VALUES}
							setColorCount={setBackColorsCount}
						/>
					</div>
				</div>

				{price > 0 && (
					<span className={css.cost__label}>
						Additional cost fot {frontColorsCount + backColorsCount} ink kolors:
						+${price}.00
					</span>
				)}

				<button
					onClick={onButtonClick}
					className={`${css.modal__button} contrast_button_1`}
				>
					Preview Pricing
				</button>
			</div>
		</>
	)
}
