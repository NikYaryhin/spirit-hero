import { useState } from 'react'
import Icon from '../Icon'
import css from './FundraisingCategoryDetails.module.css'
import FundraisingProductCard from '../FundraisingProductCard/FundraisingProductCard'

export default function FundraisingCategoryDetails({
	keyIdx,
	categoryKey,
	productsByCategory,
}) {
	return (
		<details
			className={css.category__details}
			key={categoryKey}
			open={keyIdx === 0 ? true : false}
		>
			<summary>
				<Icon name={'ChevronUp'} />
				<label className={`${css.label}`}>
					<span className={css.checkbox__emulator}>
						<Icon name={'InputChecked'} />
					</span>

					<input type="checkbox" className="visually-hidden" />
				</label>
				{categoryKey} ({productsByCategory[categoryKey].length} items)
			</summary>

			<ul className={css.product__list}>
				{productsByCategory[categoryKey].map((product) => (
					<FundraisingProductCard product={product} key={product.id} />
				))}
			</ul>
		</details>
	)
}
