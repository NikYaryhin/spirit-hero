import { useEffect, useMemo, useState } from 'react'
import Icon from '../Icon'
import css from './ProductCard.module.css'
import previewImage from '@/assets/SpiritHero__Preloader.png'
import { useSelector } from 'react-redux'

export default function sendColorsToBackendProductCard({ product, isFlashSale, inputHandle, activeColors,isCatalog,minimalGroup,sendColorsToBackend }) {
	const colorPrice = useSelector((state) => state.flashSale.pricePerColor)
	let { id, product_title, product_image, selected, params, colors,choosed_colors } = product


	const [image, setImage] = useState(!isCatalog ? choosed_colors[0]?.color_image_logo || choosed_colors[0]?.color_image || product_image  : product_image)
	const [selectedColors, setSelectedColors] = useState(choosed_colors || [])
	const [showAllColors, setShowAllColors] = useState(false)
	const sortedColors = useMemo(() => {
		if (!Array.isArray(colors)) return []

		const selectedSet = new Set(
			(selectedColors || []).map((c) => String(c.id))
		)

		return [...colors].sort((a, b) => {
			const aSelected = selectedSet.has(String(a.id))
			const bSelected = selectedSet.has(String(b.id))

			if (aSelected === bSelected) return 0
			return aSelected ? -1 : 1
		})
	}, [colors, selectedColors])

	const visibleColors = useMemo(() => {
		if (showAllColors) return sortedColors
		return sortedColors.slice(0, 5)
	}, [sortedColors, showAllColors])

	const hiddenColorsCount = (sortedColors?.length || 0) - 5
	useEffect(() => {
		if (choosed_colors) {
			setSelectedColors(choosed_colors)
		}
	}, [choosed_colors])
	const colorSwatchHandle = (event) => {
		const { value } = event.currentTarget

		setImage(value)
	}
	const filteredColors = useMemo(() => {
		if (!Array.isArray(colors)) return []
		if (!Array.isArray(activeColors) || activeColors.length === 0) {

			if(isCatalog ){
				setImage(colors[0]?.color_image_logo || colors[0]?.color_image || product_image)
			}
			return colors
		}

		const activeSet = new Set(activeColors.map((id) => String(id)))

		const filtered = colors.filter((color) =>
			activeSet.has(String(color.parent_color_id))
		)


		if(filtered.length > 0 && isCatalog ){
			setImage(filtered[0]?.color_image_logo || filtered[0]?.color_image || product_image)
		}


		return filtered
		// return colors
	}, [colors,activeColors])

	const isColorActive = (colorId) => {
		return selectedColors?.some((c) => String(c.id) === String(colorId))
	}
	const toggleColor = (color) => {
		const isActive = selectedColors?.some((c) => String(c.id) === String(color.id))

		let updated

		if (isActive) {
			updated = selectedColors.filter(
				(c) => String(c.id) !== String(color.id)
			)
		} else {
			updated = [...(selectedColors || []), color]
		}

		// 🔥 ОЦЕ ГОЛОВНЕ — одразу UI update
		setSelectedColors(updated)

		// payload
		const groupIdStr = String(minimalGroup.id)

		sendColorsToBackend({
			product_id: +id,
			group_id: +groupIdStr,
			color_id: updated.map((v) => +v.color_id),
		})
	}

	const handleColorHover = (color) => {
		setImage(color.color_image_logo || color.color_image || product_image)
	}
	function handleColorHoverLeave (){
		setImage(selectedColors[0].color_image_logo || selectedColors[0].color_image || product_image)
	}


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
				{isCatalog && filteredColors  &&
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
			{/*{!isCatalog && <div className={css.colors__bottom}>
				{colors?.map((color) => {
					const isActive = isColorActive(color.id)

					return (
						<div
							key={color.id}
							className={`${css.color__item} ${
								isActive ? css.active : ''
							}`}
							onClick={() => toggleColor(color)}
							onMouseEnter={() => handleColorHover(color)}
							onMouseLeave={handleColorHoverLeave}


						>
				<span
					className={css.color__circle}
					style={{ backgroundColor: color.color }}
				/>

							{isActive && <span className={css.remove}>✕</span>}
						</div>
					)
				})}
			</div>}*/}
			{!isCatalog && (
				<div className={css.colors__bottom}>
					{visibleColors.map((color) => {
						const isActive = isColorActive(color.id)

						return (
							<div
								key={color.id}
								className={`${css.color__item} ${
									isActive ? css.active : ''
								}`}
								onClick={() => toggleColor(color)}
								onMouseEnter={() => handleColorHover(color)}
								onMouseLeave={handleColorHoverLeave}
							>
					<span
						className={css.color__circle}
						style={{ backgroundColor: color.color }}
					/>

								{isActive && <span className={css.remove}>✓</span>}
							</div>
						)
					})}

					{/* 👉 +N кружок */}
					{!showAllColors && hiddenColorsCount > 0 && (
						<div
							className={`${css.color__item} ${css.more}`}
							onClick={() => setShowAllColors(true)}
						>
				<span className={css.color__circle}>
					+{hiddenColorsCount}
				</span>
						</div>
					)}
				</div>
			)}

		</li>
	)
}
