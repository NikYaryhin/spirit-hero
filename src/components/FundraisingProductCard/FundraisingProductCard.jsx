import css from './FundraisingProductCard.module.css'
import Icon from '../Icon'
import { useState } from 'react'

export default function FundraisingProductCard({ product }) {
	const { id, product_title, product_image, params } = product

	const [profit, setProfit] = useState(1)

	return (
		<li key={id} className={css.product__card}>
			<label className={`${css.label}`}>
				<span className={css.checkbox__emulator}>
					<Icon name={'InputChecked'} />
				</span>

				<input type="checkbox" className="visually-hidden" />
			</label>

			<div className={css.image__box}>
				<img src={product_image} alt="" />
			</div>

			<div className={css.product__info}>
				<span className={css.product__title}>{product_title}</span>
			</div>

			<span className={css.price}>${params.on_demand_price}</span>

			<input
				type="number"
				value={profit}
				onChange={(e) => setProfit(+e.target.value)}
			/>

			<span className={css.selliing__price}>
				${params.on_demand_price + profit}
			</span>

			<button className={css.sell__at__cost}> Sell at cost</button>

			<button className={css.options__button}>
				<Icon name={'Dots'} />
			</button>
		</li>
	)
}
