import { useState } from 'react'
import Icon from '../Icon'
import css from './ProductCustomizerCard.module.css'
import spiritHeroApi from '@/api/spiritHeroApi'
import { showToast } from '@/helpers/toastCall'
import Modal from '../Modal/Modal'
import ColorCheckbox from '../ColorCheckbox/ColorCheckbox'

export default function ProductCustomiserCard({
	groupKey,
	image,
	setImage,
	setActiveCardId,
	setProductsByCategory,
	activeCardId,
	product,
	storeId,
	group,
	onCardClick,
	activeGroupId


}) {
	const {
		id,
		product_title,
		product_image,
		choosed_colors,
		colors,
		active,
	} = product
	const {
		id:groupId,
	} = group



	const [isModalOpen, setIsModalOpen] = useState(false)
	const [colorsArray, setColorsArray] = useState(
		choosed_colors.length > 0 ? choosed_colors : [],
	)
	const [localImage, setLocalImage] = useState(
		choosed_colors[0]?.color_image || product_image
	)
	const cardClickHandle = (event) => {
		if (active) return

		const groupIdFromDataset = event?.currentTarget?.dataset?.groupId
		onCardClick(id, groupIdFromDataset)
		setActiveCardId(id)
		setImage(colorsArray[0]?.color_image || product_image)
		setLocalImage(colorsArray[0]?.color_image || product_image)
	}

	const closeButtonHandle = async () => {
		const payload = {
			store_id: +storeId,
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
				const targetGroupKey = String(groupKey ?? product?.group_id ?? 'no_group')

				objectToReturn[targetGroupKey] = (prev[targetGroupKey] || []).filter(
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

	const colorInputHandle = (e) => {
		const { value, checked } = e.target

		setColorsArray((prev) => {
			let nextColors

			if (checked) {
				let selectedColor = colors.find(({ color }) => color === value)
				setLocalImage(selectedColor?.color_image)
				setImage(selectedColor?.color_image)

				nextColors = [...prev, selectedColor]
			} else {
				nextColors = prev.filter(({ color }) => color !== value)
				setLocalImage(colorsArray[0]?.color_image || product_image)
				setImage(colorsArray[0]?.color_image || product_image)
			}

			return nextColors
		})
	}

	const onModalClose = async () => {
		if (colorsArray.length === 0) {
			setIsModalOpen(false)
			return
		}

		try {
			/*const payload = {
				product_id: id,
				choose_colors_ids: [...colorsArray].map((p) => p.id),
			}

			const response = await spiritHeroApi.setColorsOfProduct(payload)*/
			const response = await spiritHeroApi.setColorsOfProductV2({
				store_id: +storeId,
				products: [{
					product_id: Number(id),
					group_id: Number(groupId),
					color_id: [...colorsArray].map((p) => p.color_id)
				}]
			})
			console.debug('setColorsOfProduct response', response)

			setIsModalOpen(false)
		} catch (error) {
			console.error('setColorsOfProduct error', error)
		}
	}

	return (
		<li
			onClick={cardClickHandle}
			className={`${css.customizer__card} ${activeCardId === id && String(groupId)===activeGroupId ? css.active : ''}`}
			key={id}
			id={id}
			data-group-id={groupKey ?? null}
		>
			<div className={css.image__box}>
				<img src={localImage} alt={product_title} loading="lazy" />
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
								onChange={(e) => {
									setImage(e.target.value)
									setLocalImage(e.target.value)
								}}
								type="radio"
								name={id}
								className="visually-hidden"
								value={color_image}
							/>
						</label>
					))}
				</fieldset>
			</div>

			{/* {
				id === activeCardId && (
					<div className={css['save-design-buttons']}>
						<button className={css['save-design-button']} onClick={(e) => {
							e.stopPropagation()
							saveDesignForEachProduct(product)
						}}>
							Save design for each product</button>
						<button className={css['save-design-button']} onClick={(e) => {
							e.stopPropagation()
							saveDesignForCurrentProduct(id)
						}}>
							Save design for current product</button>
					</div>
				)
			} */}

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

			<Modal
				isOpen={isModalOpen}
				onClose={onModalClose}
				className="side"
				closeLabel={'Save'}
			>
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
