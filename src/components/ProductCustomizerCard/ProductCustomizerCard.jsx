import { useState } from 'react'
import Icon from '../Icon'
import css from './ProductCustomizerCard.module.css'
import spiritHeroApi from '@/api/spiritHeroApi'
import { showToast } from '@/helpers/toastCall'
import Modal from '../Modal/Modal'
import ColorCheckbox from '../ColorCheckbox/ColorCheckbox'

export default function ProductCustomiserCard({
	setImage,
	setActiveCardId,
	setProductsByCategory,
	activeCardId,
	product,
	storeId,
}) {
	const {
		id,
		product_title,
		product_image,
		choosed_colors,
		colors,
		active,
		category_id,
	} = product

	const [isModalOpen, setIsModalOpen] = useState(false)
	const [colorsArray, setColorsArray] = useState(
		choosed_colors.length > 0 ? choosed_colors : [...colors].slice(0, 3),
	)

	const onCardClick = () => {
		if (active) return

		setActiveCardId(id)
		setImage(product_image)
	}

	const closeButtonHandle = async () => {
		const payload = {
			store_id: +storeId || +localStorage.getItem('storeId'),
			ids: [id],
		}

		try {
			const res = await spiritHeroApi.deleteFromMyStoreProducts(
				payload.store_id,
				payload.ids,
			)

			console.debug('spiritHeroApi.deleteFromMyStoreProducts res', res)
			showToast(`${product_title} was delete from your store`)

			setProductsByCategory((prev) => {
				const objectToReturn = {
					...prev,
				}

				objectToReturn[category_id] = prev[category_id].filter(
					(p) => p.id !== id,
				)

				return objectToReturn
			})
		} catch (error) {
			console.error('spiritHeroApi.deleteFromMyStoreProducts() error', error)
			showToast(
				`${product_title} wasn't delete from your store. Please, try again`,
				'error',
			)
		}
	}

	const colorInputHandle = (checked, value) => {
		setColorsArray((prev) => {
			let nextColors

			if (checked) {
				let selectedColor = colors.find(({ color }) => color === value)
				nextColors = [...prev, selectedColor]
			} else {
				nextColors = prev.filter(({ color }) => color !== value)
			}

			return nextColors
		})
	}

	const onModalClose = async () => {
		try {
			const payload = {
				product_id: id,
				choose_colors_ids: [...colorsArray].map((p) => p.id),
			}

			const response = await spiritHeroApi.setColorsOfProduct(payload)
			console.debug('setColorsOfProduct response', response)

			setIsModalOpen(false)
		} catch (error) {
			console.error('setColorsOfProduct error', error)
		}
	}

	return (
		<li
			onClick={() => onCardClick()}
			className={`${css.customizer__card} ${activeCardId === id ? css.active : ''}`}
			key={id}
			id={id}
		>
			<div className={css.image__box}>
				<img src={product_image} alt={product_title} loading="lazy" />
			</div>

			<div className={css.info}>
				<span className={css.product_title}>{product_title}</span>

				<fieldset className={css.color__swatchers}>
					{colorsArray.map(({ color, color_image }) => (
						<label key={color}>
							<span
								className={css.checkbox_emulator}
								style={{ backgroundColor: color }}
							></span>
							<input
								onChange={(e) => setImage(e.target.value)}
								type="radio"
								name={id}
								className="visually-hidden"
								value={color_image}
							/>
						</label>
					))}
				</fieldset>
			</div>

			<button onClick={closeButtonHandle} className={css.close__button}>
				<Icon name={'Cancel'} />
			</button>

			<button
				onClick={() => setIsModalOpen(!isModalOpen)}
				className={css.colors__button}
			>
				<Icon name={'Plus'} className={css.plus__icon} />
				<Icon name={'Colors'} />
			</button>

			<Modal isOpen={isModalOpen} onClose={onModalClose} className="side">
				<h3 className={css.modal__title}>Select Colours</h3>
				<span className={css.modal__subtitle}>
					{colorsArray.length} of {colors.length} color
					{colorsArray.length !== 1 ? 's' : ''} selected
				</span>
				<ul className={css['modal__color--pickers']}>
					{colors &&
						colors.map((item) => {
							return (
								<li key={item.color} className={css.color__item}>
									<ColorCheckbox
										onInputHandle={colorInputHandle}
										color={item.color}
										name={item.name}
										checkedColor={
											colorsArray.find((c) => c.color === item.color)
												? true
												: false
										}
										className={'horisontal'}
									/>
								</li>
							)
						})}
				</ul>
			</Modal>
		</li>
	)
}
