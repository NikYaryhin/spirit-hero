import css from './ProductDetails.module.css'
import { useMemo } from 'react'
import ProductCard from '../ProductCard/ProductCard'
import Icon from '../Icon'

export default function ProductDetailsNew({
																				 products, // Це вже відфільтровані товари саме для цієї групи
																				 minimalGroup,
																				 isFlashSale,
																				 cardClickHandle,
																				 onGroupCheckHandle,
																				 activeColors,
																						isCatalog,
																						sendColorsToBackend
																			 }) {

	// Визначаємо, чи всі товари в цій групі вибрані
	// Використовуємо useMemo, щоб не перераховувати при кожному дрібному рендері
	const isGroupChecked = useMemo(() => {
		return products.length > 0 && products.every((product) => Boolean(product.selected))
	}, [products])

	// Якщо після фільтрації в групі немає товарів, нічого не рендеримо
	if (products.length === 0) return null

	return (
		<details className={css.products__group} name={minimalGroup.name} open>
			<summary className={css.products__group__summary}>
				<Icon name={'ChevronUp'} />

				<label className={css.label}>
     <span className={css.checkbox__emulator}>
      {/* Припускаю, що Icon 'InputChecked' — це іконка галочки */}
			 <Icon name={'InputChecked'} />
     </span>

					<input
						type="checkbox"
						className="visually-hidden"
						checked={isGroupChecked}
						onChange={(event) =>
							onGroupCheckHandle?.(event.target.checked, products)
						}
						value={minimalGroup.name}
					/>
				</label>

				<div className={css.minimal_group_info}>
					<span className={css.minimal_group_name}>{minimalGroup.name}</span>
					<span className={css.minimal_group_items}>
      {products.length} item{products.length !== 1 ? 's' : ''}
     </span>
				</div>
			</summary>

			<div className={css.products__list_container}>
				<ul className={css.products__list}>
					{products.map((product) => (
						<ProductCard
							key={product.id}
							inputHandle={cardClickHandle}
							product={product}
							isFlashSale={isFlashSale}
							activeColors={activeColors}
							isCatalog={isCatalog}
							minimalGroup={minimalGroup}
							sendColorsToBackend={sendColorsToBackend}
							// Якщо ProductCard очікує selected окремим пропсом, можна додати:
							// isSelected={product.selected}
						/>
					))}
				</ul>
			</div>
		</details>
	)
}
