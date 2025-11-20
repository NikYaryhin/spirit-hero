import css from './FundraisingProductCard.module.css'
import Icon from '../Icon'
import { useEffect, useState } from 'react'

export default function FundraisingProductCard({
	product,
	amountProfit,
	profitValue,
	checked,
	categoryKey,
	setSellAtCostProducts,
	setProductsByCategory,
	setSelectedProducts,
	isFundraise,
	pricesEnd,
}) {
	const { id, product_title, product_image, params } = product

	const [isChecked, setIsChecked] = useState(checked)
	const [profit, setProfit] = useState(profitValue)
	const [sellingPrice, setSellingPrice] = useState(
		+params.on_demand_price + profit,
	)

	useEffect(() => {
		setProfit(profitValue)
	}, [profitValue])

	useEffect(() => {
		setSellingPrice(
			(prev) =>
				pricesEnd && prev.toString().replace(/\.[^.]+$/, `${pricesEnd}`),
		)
	}, [pricesEnd])

	useEffect(() => {
		setIsChecked(checked)
	}, [checked])

	useEffect(() => {
		if (amountProfit) setSellingPrice(+params.on_demand_price + profit)
		else {
			const countedPrice = (
				(+params.on_demand_price * profit) / 100 +
				+params.on_demand_price
			).toFixed(2)

			setSellingPrice(
				pricesEnd
					? countedPrice.replace(/\.[^.]+$/, `${pricesEnd}`)
					: countedPrice,
			)
		}
		// setSellingPrice(
		// 	amountProfit
		// 		? +params.on_demand_price + profit
		// 		: ((+params.on_demand_price * profit) / 100 + +params.on_demand_price)
		// 				.toFixed(2)
		// 				.toString()
		// 				.replace(/\.[^.]+$/, `${pricesEnd}`),
		// )

		console.log({
			percent: (
				(+params.on_demand_price * profit) / 100 +
				+params.on_demand_price
			).toFixed(2),
			on_demand_price: +params.on_demand_price,
			profit,
			pricesEnd,
		})
	}, [profit, amountProfit])

	const onSellAtCost = () => {
		setProductsByCategory((prev) => {
			const newProductsByCategory = { ...prev }

			newProductsByCategory[categoryKey] = prev[categoryKey].filter(
				(prod) => prod.id !== id,
			)

			return newProductsByCategory
		})

		setSellAtCostProducts((prev) => {
			const newSellAtCost = { ...prev }

			newSellAtCost[categoryKey] = [...newSellAtCost[categoryKey], product]

			return newSellAtCost
		})
	}

	const onFundraiseClick = () => {
		setSellAtCostProducts((prev) => {
			const dataToReturn = { ...prev }
			dataToReturn[categoryKey] = prev[categoryKey].filter(
				(prod) => prod.id !== id,
			)

			return dataToReturn
		})

		setProductsByCategory((prev) => {
			const dataToReturn = { ...prev }
			dataToReturn[categoryKey] = [...dataToReturn[categoryKey], product]

			return dataToReturn
		})
	}

	const onCheckboxChange = (e) => {
		const { checked } = e.target

		setIsChecked(checked)

		setSelectedProducts((prev) => {
			return checked
				? [...prev, product]
				: prev.filter((prod) => prod.id !== id)
		})
	}

	const onNumberInputChange = (e) => {
		const { value } = e.target
	}

	return (
		<li key={id} className={css.product__card}>
			<label className={`${css.label}`}>
				<span className={css.checkbox__emulator}>
					<Icon name={'InputChecked'} />
				</span>

				<input
					onChange={(e) => onCheckboxChange(e)}
					type="checkbox"
					className="visually-hidden"
					value={id}
					checked={isChecked}
				/>
			</label>

			<div className={css.image__box}>
				<img src={product_image} alt="product_title" loading="lazy" />
			</div>

			<div
				className={`${css.product__info} ${!isFundraise ? css.fullwidth : ''}`}
			>
				<span className={css.product__title}>{product_title}</span>
			</div>

			{isFundraise ? (
				<>
					<span className={css.price}>${params.on_demand_price}</span>

					<div className={css.input__wrapper}>
						<span className={css.input__unit}>{amountProfit ? '$' : '%'}</span>
						<input
							type="number"
							value={profit}
							onChange={(e) => setProfit(+e.target.value)}
						/>
					</div>

					<span className={css.selliing__price}>${sellingPrice}</span>
					<button onClick={onSellAtCost} className={css.sell__at__cost}>
						{' '}
						Sell at cost
					</button>
				</>
			) : (
				<>
					<span className={css.price}>${params.on_demand_price}</span>

					<button onClick={onFundraiseClick} className={css.sell__at__cost}>
						{' '}
						Fundraise
					</button>
				</>
			)}

			<button className={css.options__button}>
				<Icon name={'Dots'} />
			</button>
		</li>
	)
}
