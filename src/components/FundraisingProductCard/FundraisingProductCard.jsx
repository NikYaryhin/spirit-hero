import css from './FundraisingProductCard.module.css'
import Icon from '../Icon'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import spiritHeroApi from '@/api/spiritHeroApi'

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
	const url_params = new URLSearchParams(window.location.search)
	const storeIdFromQuery = url_params.get('store_id')

	const storeId =
		useSelector((state) => state.flashSale.storeId) || storeIdFromQuery
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
	}, [profit, amountProfit])

	const updateFundraisingStatus = async (is_fundraising) => {
		try {
			const response = await spiritHeroApi.updateFundraisingStatus({
				store_id: storeId,
				products_info: [
					{
						id,
						is_fundraising,
					},
				],
			})
			console.debug('spiritHeroApi.updateFundraisingStatus response:', response)
		} catch (error) {
			console.error('spiritHeroApi.updateFundraisingStatus error:', error)
		}
	}

	const onSellAtCost = async () => {
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

		await updateFundraisingStatus(false)
	}

	const onFundraiseClick = async () => {
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

		await updateFundraisingStatus(true)
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
