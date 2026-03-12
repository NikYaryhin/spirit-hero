import css from './ProductDetails.module.css'
import { useMemo } from 'react'
import ProductCard from '../ProductCard/ProductCard'

import Icon from '../Icon'

export default function ProductDetails({
	products,
	minimalGroup,
	isFlashSale,
	cardClickHandle,
	onGroupCheckHandle,
	activeColors,
}) {
	const productsToShow = useMemo(() => {
		const minimalGroupProductsId = minimalGroup.products.map((product) => product.id)
		return products.filter((product) => minimalGroupProductsId.includes(product.id))
	}, [products, minimalGroup])
	const isGroupChecked =
		productsToShow.length > 0 && productsToShow.every((product) => Boolean(product.selected))

	if (productsToShow.length > 0)
		return (
			<details className={css.products__group} name={minimalGroup.name} open>
				<summary className={css.products__group__summary}>
					<Icon name={'ChevronUp'} />
					<label className={`${css.label}`}>
						<span className={css.checkbox__emulator}>
							<Icon name={'InputChecked'} />
						</span>

						<input
							checked={isGroupChecked}
							onChange={(event) =>
								onGroupCheckHandle?.(event.currentTarget.checked, productsToShow)
							}
							type="checkbox"
							className="visually-hidden"
							value={minimalGroup.name}
						/>
					</label>
					<p className={css.minimal_group_info}>
						<span className={css.minimal_group_name}>{minimalGroup.name}</span>
						<span className={css.minimal_group_items}>
							{productsToShow.length} item{productsToShow.length > 1 ? 's' : ''}
						</span>
					</p>
				</summary>
				<div>
					<ul className={css.products__list}>
						{productsToShow.map((product) => (
							<ProductCard
								key={product.id}
								inputHandle={cardClickHandle}
								product={product}
								isFlashSale={isFlashSale}
								activeColors={activeColors}
							/>
						))}
					</ul>
				</div>
			</details>
		)
}
