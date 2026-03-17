import { useMemo, useState } from 'react'
import Icon from '../Icon'
import css from './ProductCard.module.css'
import previewImage from '@/assets/SpiritHero__Preloader.png'
import { useSelector } from 'react-redux'

export default function ProductCard({ product, isFlashSale, inputHandle, activeColors }) {
	const colorPrice = useSelector((state) => state.flashSale.pricePerColor)
	const { id, product_title, product_image, selected, params, colors } = product

	const [image, setImage] = useState(product_image || previewImage)

	const colorSwatchHandle = (event) => {
		const { value } = event.currentTarget

		setImage(value)
	}
	const filteredColors = useMemo(() => {
		if (!Array.isArray(colors)) return []
		if (!Array.isArray(activeColors) || activeColors.length === 0) {
			setImage(colors[0]?.color_image || product_image)
			return colors
		}

		const activeSet = new Set(activeColors.map((id) => String(id)))

		const filtered = colors.filter((color) =>
			activeSet.has(String(color.parent_color_id))
		)

		filtered.length > 0 && setImage(filtered[0]?.color_image || product_image)

		return filtered
		// return colors
	}, [colors,activeColors])

	return (
		<li className={`${css.product__item}`} key={id} id={id}>
			<span className={css.name}>{product_title}</span>
			<div className={css.image}>
				<img src={image} alt={product_title} loading="lazy" />
			</div>

			{/* {params && <span className={css.price}>${price}</span>} */}
			<div className={css.price}>
				{isFlashSale ? (
					<>
						<span className={css.flash__price}>
							${(+params.flash_sale_price + colorPrice).toFixed(2)}
						</span>
						<span className={css.old__price}>
							${(+params.on_demand_price + colorPrice).toFixed(2)}
						</span>
					</>
				) : (
					<span className={css.price}>${(+params.on_demand_price + colorPrice).toFixed(2)}</span>
				)}
			</div>

			<label className={css.label} title={product_title}>
				<span className={css.checkbox__emulator}>
					<Icon name="Checked" />
				</span>
				<input
					checked={Boolean(selected)}
					type="checkbox"
					className="visually-hidden"
					value={id}
					onChange={inputHandle}
				/>
			</label>

			<fieldset className={css.fieldset}>
				{filteredColors &&
					filteredColors.map((color) => {
						return (
							<label key={color.id}>
								<span className={css.checkbox__emulator}>
									<span
										className={css.checkbox__emulator__color}
										style={{ backgroundColor: `${color.color}` }}
									></span>
								</span>
								<input
									type="radio"
									name={`color-of-${id}`}
									value={color.color_image || ''}
									className="visually-hidden"
									onChange={colorSwatchHandle}
								/>
							</label>
						)
					})}
			</fieldset>
		</li>
	)
}
