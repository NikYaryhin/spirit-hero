import css from './InkModal.module.css'
import Icon from '../Icon'
import CustomSelect from '../CustomSelect/CustomSelect'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setPricePerColor } from '@/features/flashSale/flashSaleSlice'
import spiritHeroApi from '@/api/spiritHeroApi'

const COLOR_SELECT_VALUES = [
	{ value: '0 Colors', id: 0, quantity: 0 },
	{ value: '1 Color', id: 1, quantity: 1 },
	{ value: '2 Colors', id: 2, quantity: 2 },
	{ value: '3 Colors', id: 3, quantity: 3 },
	{ value: '4 Colors', id: 4, quantity: 4 },
	{ value: '5 Colors', id: 5, quantity: 5 },
]

export default function InkModal({ onClose }) {
	const dispatch = useDispatch()
	const storeInfo = useSelector((state) => state.flashSale.storeInfo)
	const storeId = useSelector((state) => state.flashSale.storeId)

	const [price, setPrice] = useState(0)
	const [frontColorsCount, setFrontColorsCount] = useState(0)
	const [backColorsCount, setBackColorsCount] = useState(0)

	useEffect(() => {
		if (storeInfo.store.inkColorDetail) {
			const { front_side_colors, back_side_colors, cost } =
				storeInfo.store.inkColorDetail

			setFrontColorsCount(+front_side_colors)
			setBackColorsCount(+back_side_colors)
			setPrice(+cost)
		}
	}, [])

	useEffect(() => {
		dispatch(setPricePerColor(price))
	}, [price])

	useEffect(() => {
		const backColorPrice = backColorsCount === 0 ? 0 : backColorsCount + 4
		setPrice(frontColorsCount + backColorPrice)
	}, [frontColorsCount, backColorsCount])

	const onButtonClick = async () => {
		try {
			const payload = {
				store_id: storeId,
				front_side_colors: frontColorsCount,
				back_side_colors: backColorsCount,
				cost: price,
			}

			const res = await spiritHeroApi.editInkColor(payload)
			console.debug('editInkColor res', res)
			onClose()
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
							initialValue={frontColorsCount}
						/>
					</div>

					<div className={css.select__box}>
						<span className={css.select__label}>Back Side:</span>

						<CustomSelect
							name={'ink--modal--select'}
							info="+$5.00 for the first ink color, +$1.00 for each extra"
							values={COLOR_SELECT_VALUES}
							setColorCount={setBackColorsCount}
							initialValue={backColorsCount}
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
