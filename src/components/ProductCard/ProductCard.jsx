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
	const colorPrice = useSelector(
		(state) => state.flashSale.pricePerColor
	)

	const {
		id,
		product_title,
		product_image,
		selected,
		params,
		colors,
		choosed_colors,
	} = product

	// only for non-catalog
	const [selectedColors, setSelectedColors] = useState(
		choosed_colors || []
	)

	const [showAllColors, setShowAllColors] = useState(false)

	// ACTIVE COLORS SOURCE
	const currentSelectedColors = isCatalog
		? selectedCatalogColors || []
		: selectedColors || []

	const sortedColors = useMemo(() => {
		if (!Array.isArray(colors)) return []

		return [...colors]
	}, [colors])

	const [image, setImage] = useState(
		!isCatalog
			? sortedColors?.[0]?.logo?.find(
			(value) => value.type_id === 1
			)?.image ||
			sortedColors?.[0]?.image ||
			product_image
			: selectedCatalogColors?.[0]?.image  ||  product_image
	)

	const visibleColors = useMemo(() => {
		if (showAllColors) return sortedColors

		return sortedColors.slice(0, 5)
	}, [sortedColors, showAllColors])

	const hiddenColorsCount =
		(sortedColors?.length || 0) - 5

	useEffect(() => {
		if (!isCatalog && choosed_colors) {
			setSelectedColors(choosed_colors)
		}
	}, [choosed_colors, isCatalog])

	const filteredColors = useMemo(() => {
		if (!Array.isArray(colors)) return []

		if (
			!Array.isArray(activeColors) ||
			activeColors.length === 0
		) {
			return colors
		}

		const activeSet = new Set(
			activeColors.map((id) => String(id))
		)

		return colors.filter((color) =>
			activeSet.has(
				String(color.parent_color_id)
			)
		)
	}, [colors, activeColors])

	// set first image
	useEffect(() => {

		if (
			isCatalog &&
			filteredColors.length > 0
		) {
			setImage(
				selectedCatalogColors?.[0]?.image || filteredColors?.[0]?.image ||
				product_image
			)
		}
	}, [filteredColors, isCatalog, product_image,selectedCatalogColors])

	useEffect(() => {
		if (!isCatalog) return

		// якщо продукт НЕ selected
		if (!selected) {

			return
		}

		// якщо нема кольорів
		if (!filteredColors?.length) return

		// якщо вже є вибрані кольори — нічого не робимо
		if (
			selectedCatalogColors &&
			selectedCatalogColors.length > 0
		) {
			return
		}

		// перший колір
		const firstColor = filteredColors[0]

		setCatalogSelectedColors((prev) => ({
			...prev,
			[id]: [firstColor],
		}))
	}, [
		selected,
		isCatalog,
		filteredColors,
		selectedCatalogColors,
		id,
		setCatalogSelectedColors,
	])
	const isColorActive = (colorId) => {
		return currentSelectedColors?.some(
			(c) => String(c.id) === String(colorId)
		)
	}

	const toggleColor = (color) => {
		// =========================
		// CATALOG MODE
		// =========================

		if (isCatalog) {
			const current =
				selectedCatalogColors || []

			const isActive = current.some(
				(c) =>
					String(c.id) ===
					String(color.id)
			)

			let updated

			if (isActive) {
				updated = current.filter(
					(c) =>
						String(c.id) !==
						String(color.id)
				)
			} else {
				updated = [...current, color]
			}

		/*	if (updated.length === 0) {
				showToast(
					'You cannot delete the last remaining color',
					'error'
				)

				return
			}*/

			if (!selected && updated.length===1 && current.length===0){
				cardClickHandleV2(+id);
			}
			setCatalogSelectedColors((prev) => ({
				...prev,
				[id]: updated,
			}))


			return
		}

		// =========================
		// NORMAL MODE
		// =========================

		const isActive = selectedColors?.some(
			(c) =>
				String(c.id) ===
				String(color.id)
		)

		let updated

		if (isActive) {
			updated = selectedColors.filter(
				(c) =>
					String(c.id) !==
					String(color.id)
			)
		} else {
			updated = [
				...(selectedColors || []),
				color,
			]
		}

		if (updated.length === 0) {
			showToast(
				'You cannot delete the last remaining color',
				'error'
			)

			return
		}

		setSelectedColors(updated)

		sendColorsToBackend({
			product_id: +id,
			group_id: +minimalGroup.id,
			color_id: updated.map(
				(v) => +v.color_id
			),
		})
	}

	const handleColorHover = (color) => {
		setImage(
			color.logo?.find(
				(value) => value.type_id === 1
			)?.image ||
			color.image ||
			product_image
		)
	}

	const handleColorHoverLeave = () => {
		setImage(
			sortedColors?.[0]?.logo?.find(
				(value) => value.type_id === 1
			)?.image ||
			sortedColors?.[0]?.image ||
			product_image
		)
	}

	return (
		<li
			className={css.product__item}
			key={id}
			id={id}
		>
			<div className={css.image}>
				<img
					src={`${image}?${new Date().getTime()}`}
					alt={product_title}
					loading="lazy"
				/>
			</div>

			<span className={css.name}>
				{product_title}
			</span>

			<div className={css.price}>
				{isFlashSale ? (
					<>
						<span
							className={
								css.flash__price
							}
						>
							$
							{(
								+params.flash_sale_price +
								colorPrice
							).toFixed(2)}
						</span>

						<span
							className={
								css.old__price
							}
						>
							$
							{(
								+params.on_demand_price +
								colorPrice
							).toFixed(2)}
						</span>
					</>
				) : (
					<span className={css.price}>
						$
						{(
							+params.on_demand_price +
							colorPrice
						).toFixed(2)}
					</span>
				)}
			</div>

			<div className={css.sizes_box}>
				<span className={css.sizes1}>
					Sizes:
				</span>

				<span className={css.sizes2}>
					XS - 3XL
				</span>
			</div>

			<div className={css.best_seller}>
				Best Seller
			</div>

			<label
				className={css.label}
				title={product_title}
			>
				<span
					className={
						css.checkbox__emulator
					}
				>
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

			{/* ========================= */}
			{/* CATALOG */}
			{/* ========================= */}

			{isCatalog && (
				<div className={css.colors__bottom}>
					{(
						showAllColors
							? filteredColors
							: filteredColors.slice(
							0,
							5
							)
					).map((color) => {
						const preview =
							color.image ||
							product_image

						const isActive =
							isColorActive(
								color.id
							)

						return (
							<div
								key={color.id}
								className={`${
									css.color__item
								} ${
									isActive
										? css.active
										: ''
								}`}
								onClick={() => {
									setImage(
										preview
									)

									toggleColor(
										color
									)
								}}
								onMouseEnter={() =>
									setImage(
										preview
									)
								}
								onMouseLeave={() =>
									setImage(
										filteredColors?.[0]
											?.image ||
										product_image
									)
								}
							>
								<span
									className={
										css.color__circle
									}
									style={{
										backgroundColor:
										color.color,
									}}
								/>

								{isActive && (
									<span
										className={
											css.remove
										}
									>
										✓
									</span>
								)}
							</div>
						)
					})}

					{!showAllColors &&
					filteredColors.length >
					5 && (
						<div
							className={`${css.color__item} ${css.more}`}
							onClick={() =>
								setShowAllColors(
									true
								)
							}
						>
								<span
									className={
										css.color__circle
									}
								>
									+
									{filteredColors.length -
									5}
								</span>
						</div>
					)}
				</div>
			)}

			{/* ========================= */}
			{/* NORMAL */}
			{/* ========================= */}

			{!isCatalog && (
				<div className={css.colors__bottom}>
					{visibleColors.map(
						(color) => {
							const isActive =
								isColorActive(
									color.id
								)

							return (
								<div
									key={
										color.id
									}
									className={`${
										css.color__item
									} ${
										isActive
											? css.active
											: ''
									}`}
									onClick={() =>
										toggleColor(
											color
										)
									}
									onMouseEnter={() =>
										handleColorHover(
											color
										)
									}
									onMouseLeave={
										handleColorHoverLeave
									}
								>
									<span
										className={
											css.color__circle
										}
										style={{
											backgroundColor:
											color.color,
										}}
									/>

									{isActive && (
										<span
											className={
												css.remove
											}
										>
											✓
										</span>
									)}
								</div>
							)
						}
					)}

					{!showAllColors &&
					hiddenColorsCount >
					0 && (
						<div
							className={`${css.color__item} ${css.more}`}
							onClick={() =>
								setShowAllColors(
									true
								)
							}
						>
								<span
									className={
										css.color__circle
									}
								>
									+
									{
										hiddenColorsCount
									}
								</span>
						</div>
					)}
				</div>
			)}
		</li>
	)
}
