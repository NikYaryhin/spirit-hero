import { useState } from 'react'
import Icon from '../Icon'
import css from './FundraisingCategoryDetails.module.css'
import FundraisingProductCard from '../FundraisingProductCard/FundraisingProductCard'

export default function FundraisingCategoryDetails({
	keyIdx,
	categoryKey,
	productsByCategory,
	profitValue,
	amountProfit,
	setSellAtCostProducts,
	setProductsByCategory,
	setSelectedProducts,
	isFundraise,
	setIsFundraise,
	pricesEnd,
	isActive,
}) {
	const [isChecked, setIsChecked] = useState(false)
	const [isChildChecked, setIsChildChecked] = useState(false)

	const onCheckboxChange = (e) => {
		const { checked } = e.target

		setIsChecked(checked)
		setIsChildChecked(checked)

		const categoryProducts = productsByCategory[categoryKey] || []

		setSelectedProducts((prev) => {
			if (checked) {
				// add all products from category, ensure uniqueness by id
				const existingIds = new Set(prev.map((p) => p.id))
				const toAdd = categoryProducts.filter((p) => !existingIds.has(p.id))
				return [...prev, ...toAdd]
			} else {
				// remove all products of this category
				const removeIds = new Set(categoryProducts.map((p) => p.id))
				return prev.filter((p) => !removeIds.has(p.id))
			}
		})
	}

	if (productsByCategory[categoryKey].length > 0)
		return (
			<details
				className={`${css.category__details} ${isActive ? css.active : 'visually-hidden'}`}
				key={categoryKey}
				open={keyIdx === 0 ? true : false}
			>
				<summary>
					<Icon name={'ChevronUp'} />
					<label className={`${css.label}`}>
						<span className={css.checkbox__emulator}>
							<Icon name={'InputChecked'} />
						</span>

						<input
							onChange={(e) => onCheckboxChange(e)}
							type="checkbox"
							className="visually-hidden"
							value={categoryKey}
							checked={isChecked}
						/>
					</label>
					{categoryKey} ({productsByCategory[categoryKey].length} items)
				</summary>

				<ul className={css.product__list}>
					{productsByCategory[categoryKey].map((product) => {
						return (
							<FundraisingProductCard
								product={product}
								key={product.id}
								profitValue={product.percent || profitValue}
								amountProfit={amountProfit}
								checked={isChildChecked}
								categoryKey={categoryKey}
								setSellAtCostProducts={setSellAtCostProducts}
								setProductsByCategory={setProductsByCategory}
								setSelectedProducts={setSelectedProducts}
								isFundraise={isFundraise}
								setIsFundraise={setIsFundraise}
								pricesEnd={pricesEnd}
							/>
						)
					})}
				</ul>
			</details>
		)
}
