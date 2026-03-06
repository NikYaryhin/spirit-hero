import css from './ProductDetails.module.css'
import { useState, useEffect } from 'react'
import ProductCard from '../ProductCard/ProductCard'

import Icon from '../Icon'

export default function ProductDetails({products, minimalGroup, isFlashSale, cardClickHandle}) {
	const [productsToShow, setProductsToShow] = useState([])

	useEffect(() => {
		const minimalGroupProductsId = minimalGroup.products.map(product => product.id)
		const minimalGroupProducts = products.filter(product => minimalGroupProductsId.includes(product.id))
		setProductsToShow(minimalGroupProducts)
	}, [products])

	if (productsToShow.length > 0) return (
		<details className={css.products__group} name={minimalGroup.name} open>
			<summary className={css.products__group__summary}>
				<Icon name={'ChevronUp'} />
					<label className={`${css.label}`}>
						<span className={css.checkbox__emulator}>
							<Icon name={'InputChecked'} />
						</span>

						<input
							// onChange={(e) => onCheckboxChange(e)}
							type="checkbox"
							className="visually-hidden"
							value={minimalGroup.name}
						/>
					</label>
					<p className={css.minimal_group_info}>
						<span className={css.minimal_group_name}>{minimalGroup.name}</span>
						<span className={css.minimal_group_items}>{productsToShow.length} item{productsToShow.length > 1 ? 's' : ''}</span>
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
						/>
					))}
				</ul>
			</div>
		</details>
	)
}
