import { useEffect, useState } from 'react'
import Icon from '../Icon'
import css from './ProductCustomizerCard.module.css'
import spiritHeroApi from '@/api/spiritHeroApi'
import { showToast } from '@/helpers/toastCall'
import Modal from '../Modal/Modal'
import ColorCheckbox from '../ColorCheckbox/ColorCheckbox'

export default function ProductCustomiserCard({
	setImage,
	setProducts,
	product,
	storeId,
}) {
	const { id, product_title, product_image, colors, active } = product

	const [isModalOpen, setIsModalOpen] = useState(false)
	const [colorsArray, setColorsArray] = useState([...colors].splice(0, 3))

	const onCardClick = () => {
		if (active) return

		setProducts((prev) => {
			const nextProducts = prev.map((p) => {
				return { ...p, active: p.id === id ? true : false }
			})

			return nextProducts
		})

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

			console.log('spiritHeroApi.deleteFromMyStoreProducts res', res)
			showToast(`${product_title} was delete from your store`)

			setProducts((prev) => {
				return prev.filter((prod) => prod.id !== id)
			})
		} catch (error) {
			console.error('spiritHeroApi.deleteFromMyStoreProducts() error', error)
			showToast(`${product_title} wasn't delete from your store`, 'error')
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

	return (
		<li
			onClick={() => onCardClick()}
			className={`${css.customizer__card} ${active ? css.active : ''}`}
			key={id}
			id={id}
		>
			<div className={css.image__box}>
				<img src={product_image} alt={product_title} />
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

			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
				<ul>
					{colors &&
						colors.map((item) => (
							<li key={item.color}>
								<ColorCheckbox
									onInputHandle={colorInputHandle}
									color={item.color}
									name={item.name}
									checked={colorsArray.includes(item)}
								/>
							</li>
						))}
				</ul>
			</Modal>
		</li>
	)
}
