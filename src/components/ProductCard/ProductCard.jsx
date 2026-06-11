import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import Icon from '../Icon'
import css from './ProductCard.module.css'
import { showToast } from '@/helpers/toastCall'

export default function ProductCard({
																			product,
																			isFlashSale,
																			inputHandle,
																			activeColors,
																			isCatalog,
																			minimalGroup,
																			sendColorsToBackend,

																			// catalog props
																			selectedCatalogColors,
																			setCatalogSelectedColors,
																			cardClickHandleV2
																		}) {
	const colorPrice = useSelector((state) => state.flashSale.pricePerColor)

	const {
		id,
		product_title,
		product_image,
		selected,
		params,
		colors,
		sale_price_min,
		sale_price_max,
		choosed_colors,
		product_description
	} = product

	const [selectedColors, setSelectedColors] = useState(choosed_colors || [])
	const [showAllColors, setShowAllColors] = useState(false)

	const currentSelectedColors = isCatalog
		? selectedCatalogColors || []
		: selectedColors || []

	const sortedColors = useMemo(() => {
		if (!Array.isArray(colors)) return []
		return [...colors]
	}, [colors])

/*	const [image, setImage] = useState(
		!isCatalog
			? sortedColors?.[0]?.logo?.find((value) => value.type_id === 1)?.image ||
			sortedColors?.[0]?.image ||
			product_image
			: selectedCatalogColors?.[selectedCatalogColors.length-1]?.image || product_image
	)*/
	const [image, setImage] = useState(() => {
		if (isCatalog) {
			return (
				selectedCatalogColors?.[selectedCatalogColors.length - 1]?.image ||
				product_image
			)
		}

		const lastSelectedId =
			currentSelectedColors?.[currentSelectedColors.length - 1]?.id

		const selectedColor =
			sortedColors.find((color) => color.id === lastSelectedId)

		const logo = selectedColor?.logo?.find(
			(item) => item.type_id === 1
		)

		return (
			logo?.image ||
			selectedColor?.image ||
			product_image
		)
	})

	// Статичні розміри як на макеті
	const mockSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']

	const filteredColors = useMemo(() => {
		if (!Array.isArray(colors)) return []
		if (!Array.isArray(activeColors) || activeColors.length === 0) {
			return colors
		}
		const activeSet = new Set(activeColors.map((id) => String(id)))
		return colors.filter((color) => activeSet.has(String(color.parent_color_id)))
	}, [colors, activeColors])

	const visibleColors = useMemo(() => {
		if (showAllColors) return filteredColors
		return filteredColors.slice(0, 10) // Показуємо перші 9 кольорів, як на фото
	}, [filteredColors, showAllColors])

	useEffect(() => {
		if (!isCatalog && choosed_colors) {
			setSelectedColors(choosed_colors)
		}
	}, [choosed_colors, isCatalog])

	useEffect(() => {
		if (isCatalog && filteredColors.length > 0) {
			setImage(
				selectedCatalogColors?.[selectedCatalogColors.length-1]?.image || filteredColors?.[0]?.image || product_image
			)
		}
	}, [filteredColors, isCatalog, product_image, selectedCatalogColors])

	useEffect(() => {
		if (!isCatalog || !selected || !filteredColors?.length) return
		if (selectedCatalogColors && selectedCatalogColors.length > 0) return

		const firstColor = filteredColors[0]
		setCatalogSelectedColors((prev) => ({
			...prev,
			[id]: [firstColor],
		}))
	}, [selected, isCatalog, filteredColors, selectedCatalogColors, id, setCatalogSelectedColors])

	const isColorActive = (colorId) => {
		return currentSelectedColors?.some((c) => String(c.id) === String(colorId))
	}

	const toggleColor = (color) => {
		if (isCatalog) {
			const current = selectedCatalogColors || []
			const isActive = current.some((c) => String(c.id) === String(color.id))
			let updated

			if (isActive) {
				updated = current.filter((c) => String(c.id) !== String(color.id))
			} else {
				updated = [...current, color]
			}

			if (!selected && updated.length === 1 && current.length === 0) {
				cardClickHandleV2(+id)
			}
			setCatalogSelectedColors((prev) => ({
				...prev,
				[id]: updated,
			}))
			return
		}

		const isActive = selectedColors?.some((c) => String(c.id) === String(color.id))
		let updated

		if (isActive) {
			updated = selectedColors.filter((c) => String(c.id) !== String(color.id))
		} else {
			updated = [...(selectedColors || []), color]
		}

		if (updated.length === 0) {
			showToast('You cannot delete the last remaining color', 'error')
			return
		}

		setSelectedColors(updated)
		sendColorsToBackend({
			product_id: +id,
			group_id: +minimalGroup.id,
			color_id: updated.map((v) => +v.color_id),
		})
	}


	return (
		<li className={`${css.product__item} ${selected ? css.selected : ''}`} key={id}>

			{/* Контейнер зображення з сірим фоном */}
			<div className={css.image_container}>
				<div className={css.image}>
					<img src={`${image}`} alt={product_title} loading="lazy" />
				</div>

				{/* Хіт продажів */}
				<div className={css.best_seller}>Bestseller</div>

				{/* Чекбокс у верхньому лівому кутку */}
				<label className={css.label} title={product_title}>
					<input
						checked={Boolean(selected)}
						type="checkbox"
						className="visually-hidden"
						value={id}
						onChange={inputHandle}
					/>
          <span className={css.checkbox__emulator}>
              <Icon name={'InputChecked'} />
          </span>

				</label>
			</div>

			{/* Рядок Рейтингу та Мінімалки */}
		{/*	<div className={css.meta_row}>
				<div className={css.rating}>
					<span className={css.star}>★</span>
					<span className={css.rating_val}>5.0</span>
				</div>
				<div className={css.min_items}>
					{isFlashSale ? (
						<>
							<span className={css.info_icon}>ℹ</span>
							<span>36 items (min)</span>
						</>
					) : (
						<span>
            No minimums
          </span>
					)}
				</div>
			</div>*/}

			{/* Назва та Опис */}
			<div className={css.info_block}>
				<h3 className={css.name}>{product_title}</h3>

				{product_description && (				<div className={css.tooltip}>
						<svg
							className={css.tooltip__icon}
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<g clipPath="url(#clip0)">
								<path
									d="M8 6H8.00667"
									stroke="#FBB041"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M7.33203 8H7.9987V10.6667H8.66536"
									stroke="#FBB041"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M8 2C12.8 2 14 3.2 14 8C14 12.8 12.8 14 8 14C3.2 14 2 12.8 2 8C2 3.2 3.2 2 8 2Z"
									stroke="#FBB041"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</g>
						</svg>

						<div className={css.tooltip__content}>
							{product_description}
						</div>
					</div>
				)}
			</div>

			{/* Ціна */}

			{/*<div className={css.price_row}>
				{
					+sale_price_min ===+sale_price_max  ? (<>
							<span className={css.flash__price}>
    ${(+sale_price_min+ colorPrice).toFixed(2)}
  </span>
					</>):(<>

						<span className={css.flash__price}>
    ${(+sale_price_min+ colorPrice).toFixed(2)}
  </span>
						<span className={css.old__price_wrapper}>
    <span className={css.dash}>-</span>
    <span className={css.old__price}>
      ${(+sale_price_max+ colorPrice).toFixed(2)}
    </span>
  </span>
					</>)
				}

			</div>*/}


			<div className={css.price_row}>
				{isFlashSale ? (
					<>
			<span className={css.flash__price_red}>
				${(+params.flash_sale_price + colorPrice).toFixed(2)}
			</span>

						<span className={css.old__price_wrapper}>
				<span className={css.dash}>-</span>

				<span className={css.old__price_des}>
					${(+sale_price_min + colorPrice).toFixed(2)}
				</span>
			</span>
					</>
				) : +sale_price_min === +sale_price_max ? (
					<span className={css.flash__price}>
			${(+sale_price_min + colorPrice).toFixed(2)}
		</span>
				) : (
					<>
			<span className={css.flash__price}>
				${(+sale_price_min + colorPrice).toFixed(2)}
			</span>

						<span className={css.old__price_wrapper}>
				<span className={css.dash}>-</span>

				<span className={css.old__price}>
					${(+sale_price_max + colorPrice).toFixed(2)}
				</span>
			</span>
					</>
				)}
			</div>

			{/* Плашки розмірів */}
			<div className={css.sizes_grid}>
				{mockSizes.map((size) => (
					<div key={size} className={css.size_badge}>
						{size}
					</div>
				))}
			</div>

			{/* Секція кольорів */}
			<div className={css.colors_section}>
				<div className={css.colors__bottom}>
					{visibleColors.map((color) => {
						const preview = color.image || product_image
						const isActive = isColorActive(color.id)

						return (
							<div
								key={color.id}
								className={`${css.color__item} ${isActive ? css.active : ''}`}
								onClick={() => {
									if (isCatalog) setImage(preview)
									toggleColor(color)
								}}
								onMouseEnter={() => {
									if (isCatalog) setImage(preview)
									else setImage(
										color.logo?.find((value) => value.type_id === 1)?.image ||
										color.image ||
										product_image
									)
								}}
								onMouseLeave={() => {
									if (isCatalog) {
										setImage(selectedCatalogColors?.[selectedCatalogColors.length-1]?.image || filteredColors?.[0]?.image || product_image)
									} else {
										const lastSelectedId =
											currentSelectedColors?.[currentSelectedColors.length - 1]?.id

										const selectedColor =
											sortedColors.find((color) => color.id === lastSelectedId)

										const logo = selectedColor?.logo?.find(
											(item) => item.type_id === 1
										)

										setImage(
											logo?.image ||
											selectedColor?.image ||
											product_image
										)
									}
								}}
							>
                <span
									className={css.color__circle}
									style={{ backgroundColor: color.color }}
								/>

								{/* Повернено галочку як було раніше */}
								{isActive && <span className={css.remove}>✓</span>}
							</div>
						)
					})}
				</div>

				{/* Кнопка розгортання кольорів */}
				{!showAllColors && filteredColors.length > 10 && (
					<button
						type="button"
						className={css.view_more_btn}
						onClick={() => setShowAllColors(true)}
					>
						View more colors <span className={css.arrow}>➔</span>
					</button>
				)}
			</div>

		</li>
	)
}
