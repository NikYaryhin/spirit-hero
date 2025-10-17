import css from './ProductsStep.module.css'

import Lightning from '../Icons/Lightning'
import ProductsSection from '../Products/ProductsSection'

export default function ProductsStep() {
	return (
		<section>
			<div className={css.products_head}>
				<h2 className={css.products_title}>Select your products</h2>

				<div className={css.products_info}>
					<div className={css['info--checkbox__wrapper']}>
						<Lightning />

						<span>Flash SALE Price</span>

						<label className={css['info--checkbox__label']}>
							<span className={css['info--checkbox__emulator']}></span>
							<input type="checkbox" className="visually-hidden" />
						</label>
					</div>

					<ul className={css.features__list}>
						<li>Limited-time group order</li>
						<li>Lower price</li>
						<li>36 apparels minimum</li>
						<li>FREE ship for 1 place</li>
						<li>Only 1 logo</li>
						<li>2-3 weeks timeframe</li>
						<li>Arrive sorted, labeled, bagged by student name/teacher name (sort list)</li>
					</ul>
				</div>
			</div>

			<ProductsSection />
		</section>
	)
}
