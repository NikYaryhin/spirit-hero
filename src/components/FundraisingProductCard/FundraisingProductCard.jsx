import css from './FundraisingProductCard.module.css'
import Icon from '../Icon'
import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
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
	setIsFundraise,
	pricesEnd,
}) {
	const url_params = new URLSearchParams(window.location.search)
	const storeIdFromQuery = url_params.get('store_id')

	// const colorPrice = useSelector((state) => state.flashSale.pricePerColor)
	const colorPrice = 0
	const isFlashSale = useSelector((state) => state.flashSale.isFlashSale)
	const storeId =
		useSelector((state) => state.flashSale.storeId) || storeIdFromQuery
	const { id, product_title, product_image, params } = product

	const [isChecked, setIsChecked] = useState(checked)
	const [profit, setProfit] = useState(profitValue)

	const basePrice = useMemo(() => {
		return isFlashSale
			? +params.flash_sale_price + colorPrice
			: +params.on_demand_price + colorPrice
	}, [isFlashSale, params.flash_sale_price, params.on_demand_price, colorPrice])

	const sellingPrice = useMemo(() => {
		const computed = amountProfit
			? +(basePrice + profit).toFixed(2)
			: +(((basePrice * profit) / 100 + basePrice).toFixed(2))
		const formatted = computed.toFixed(2)

		return pricesEnd ? formatted.replace(/\.[^.]+$/, `${pricesEnd}`) : formatted
	}, [amountProfit, basePrice, profit, pricesEnd])

	useEffect(() => {
		setProfit(profitValue)
	}, [profitValue])

	useEffect(() => {
		setIsChecked(checked)
	}, [checked])

	const updateFundraisingStatus = async (is_fundraising) => {
		try {
			const payload = {
				store_id: storeId,
				products_info: [
					{
						id,
						is_fundraising,
					},
				],
			}
			const response = await spiritHeroApi.updateFundraisingStatus(payload)
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
			newSellAtCost[categoryKey] = [product, ...newSellAtCost[categoryKey]]

			return newSellAtCost
		})
		setIsFundraise(!isFundraise)

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
			dataToReturn[categoryKey] = [product, ...dataToReturn[categoryKey]]

			return dataToReturn
		})

		setIsFundraise(!isFundraise)

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

	const debounceTimeoutRef = useRef(null)

	useEffect(() => {
		return () => {
			if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)
		}
	}, [])

	const onPriceInputChange = useCallback(
		(event) => {
			let { value } = event.target
			value = value.replace(',', '.')

			// Allow only non-negative numbers with up to 2 decimal places.
			if (!/^\d*\.?\d{0,2}$/.test(value)) return

			if (value.length > 1 && value.startsWith('0') && value[1] !== '.') {
				event.target.value = value.replace(/^0+/, '')
			}

			setProfit(+value)

			// Clear previous timeout
			if (debounceTimeoutRef.current) {
				clearTimeout(debounceTimeoutRef.current)
			}

			// Set new timeout
			debounceTimeoutRef.current = setTimeout(async () => {
				try {
					const payload = {
						store_id: storeId,
						products_info: [
							{
								id,
								percent: +value,
							},
						],
					}

					const response = await spiritHeroApi.updateFundraisingStatus(payload)

					console.debug('updateFundraisingStatus response', response)
				} catch (error) {
					console.error('updateFundraisingStatus error', error)
				}
			}, 1500)
		},
		[storeId, id],
	)

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
					<span className={css.price}>${basePrice.toFixed(2)}</span>

					<div className={css.input__wrapper}>
						<input
							type="number"
							value={profit}
							onChange={onPriceInputChange}
							min="0"
							step="0.01"
							inputMode="decimal"
							name="profit--input"
						/>
						<span className={css.input__unit}>{amountProfit ? '$' : '%'}</span>
					</div>

					<span className={css.selliing__price}>${sellingPrice}</span>
					<button onClick={onSellAtCost} className={css.sell__at__cost}>
						{' '}
						Sell at cost
					</button>
				</>
			) : (
				<>
					<span className={css.price}>${basePrice.toFixed(2)}</span>

					<button onClick={onFundraiseClick} className={css.sell__at__cost}>
						{' '}
						Fundraise
					</button>
				</>
			)}

			{/* <button className={css.options__button}>
				<Icon name={'Dots'} />
			</button> */}
		</li>
	)
}
