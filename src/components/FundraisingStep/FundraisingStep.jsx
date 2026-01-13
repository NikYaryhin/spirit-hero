import { useEffect, useState } from 'react'
import css from './FundraisingStep.module.css'
import Loader from '../Loader/Loader'
import spiritHeroApi from '@/api/spiritHeroApi'
import FundraisingCategoryDetails from '../FundraisingCategoryDetails/FundraisingCategoryDetails'
import Icon from '../Icon'
import Check from '../Icons/Check'
import ProfitValueFieldset from '../ProfitValueFieldset/ProfitValueFieldset'
import {
	fundraisingFixedAmounValues,
	fundraisingPercentageValues,
	fundraisingPriceEndsValues,
} from '@/helpers/const'
import { useSelector } from 'react-redux'

export default function FundraisingStep() {
	const params = new URLSearchParams(window.location.search)
	const storeIdFromQuery = params.get('store_id')

	const storeId =
		useSelector((state) => state.flashSale.storeId) || storeIdFromQuery

	const [isLoading, setIsLoading] = useState(true)
	const [isFundraise, setIsFundraise] = useState(true)

	const [productsByCategory, setProductsByCategory] = useState(null)
	const [sellAtCostProducts, setSellAtCostProducts] = useState(null)

	const [selectedProducts, setSelectedProducts] = useState([])

	const [amountProfit, setAmountProfit] = useState(true)
	const [profitValue, setProfitValue] = useState(1)
	const [pricesEnd, setPricesEnd] = useState(null)

	const [fundraisingCount, setFundraisingCount] = useState(0)
	const [sellOutCount, setSellOutCount] = useState(0)

	useEffect(() => {
		const fetchStoreData = async () => {
			try {
				const res = await spiritHeroApi.getStore(storeId)

				console.debug('spiritHeroApi.getStore res', res)

				const sortedProducts =
					res.products.reduce((acc, product) => {
						acc[product.category_id] = [
							...(acc[product.category_id] || []),
							product,
						]
						return acc
					}, {}) || {}

				const isFundraisingProducts = {}
				const isSellAtCostProducts = {}

				Object.keys(sortedProducts).forEach((key) => {
					isFundraisingProducts[key] = [...sortedProducts[key]].filter(
						(product) => {
							return product.is_fundraise
						},
					)

					isSellAtCostProducts[key] = [...sortedProducts[key]].filter(
						(product) => !product.is_fundraise,
					)
				})

				setProductsByCategory(isFundraisingProducts)
				setSellAtCostProducts(isSellAtCostProducts)
				// setProductsByCategory(sortedProducts)
				// setSellAtCostProducts(() => {
				// 	const sellAtCostSorted = { ...sortedProducts }

				// 	for (const key in sellAtCostSorted) {
				// 		sellAtCostSorted[key] = []
				// 	}

				// 	return sellAtCostSorted
				// })
				setIsLoading(false)
			} catch (error) {
				console.error(`spiritHeroApi.getStore error`, error)
			}
		}
		fetchStoreData()
	}, [])

	useEffect(() => {
		const fundraisingProductsCount =
			productsByCategory &&
			Object.keys(productsByCategory).reduce((acc, key) => {
				return productsByCategory[key].length + acc
			}, 0)

		setFundraisingCount(fundraisingProductsCount)
	}, [productsByCategory])

	useEffect(() => {
		const sellOutProductsCount =
			sellAtCostProducts &&
			Object.keys(sellAtCostProducts).reduce((acc, key) => {
				return sellAtCostProducts[key].length + acc
			}, 0)

		setSellOutCount(sellOutProductsCount)
	}, [sellAtCostProducts])

	const updateFundraisingStatus = async (status) => {
		const selectedProductIds = selectedProducts.map((p) => {
			return { id: p.id, is_fundraising: status }
		})

		try {
			const response = await spiritHeroApi.updateFundraisingStatus({
				store_id: storeId,
				products_info: selectedProductIds,
			})

			console.debug('spiritHeroApi.updateFundraisingStatus response', response)
		} catch (error) {
			console.error('spiritHeroApi.updateProducts error:', error)
		}
	}

	const onMoveToSellAtCoast = () => {
		if (selectedProducts.length < 1) return

		const idsByCategory = selectedProducts.reduce((acc, prod) => {
			const cat = prod.category_id
			acc[cat] = acc[cat] ? acc[cat].add(prod.id) : new Set([prod.id])
			return acc
		}, {})

		updateFundraisingStatus(false)

		setProductsByCategory((prev) => {
			const next = { ...prev }
			Object.keys(idsByCategory).forEach((cat) => {
				if (!next[cat]) return
				const removeIds = idsByCategory[cat]
				next[cat] = next[cat].filter((p) => !removeIds.has(p.id))
			})
			return next
		})

		setSellAtCostProducts((prev) => {
			if (!prev) return prev
			const next = { ...prev }
			Object.keys(idsByCategory).forEach((cat) => {
				const itemsToAdd = selectedProducts.filter(
					(p) => p.category_id === +cat,
				)
				next[cat] = [...(next[cat] || []), ...itemsToAdd]
			})

			return next
		})

		setSelectedProducts([])
	}

	const onMoveToFundraise = () => {
		const idsByCategory = selectedProducts.reduce((acc, prod) => {
			const cat = prod.category_id
			acc[cat] = acc[cat] ? acc[cat].add(prod.id) : new Set([prod.id])
			return acc
		}, {})

		updateFundraisingStatus(true)

		setSellAtCostProducts((prev) => {
			const next = { ...prev }
			Object.keys(idsByCategory).forEach((cat) => {
				const removeIds = idsByCategory[cat]
				next[cat] = next[cat].filter((p) => !removeIds.has(p.id))
			})
			return next
		})

		setProductsByCategory((prev) => {
			if (!prev) return prev
			const next = { ...prev }
			Object.keys(idsByCategory).forEach((cat) => {
				const itemsToAdd = selectedProducts.filter(
					(p) => p.category_id === +cat,
				)
				next[cat] = [...(next[cat] || []), ...itemsToAdd]
			})
			return next
		})

		setSelectedProducts([])
	}

	const onSortChange = (e) => {
		const { value } = e.target

		console.log(value)
	}

	if (isLoading) return <Loader />
	else
		return (
			<section className={css.fundraising__section}>
				<div className={css.products__handle}>
					<div className={css.fundraising__head}>
						{/* <form action="submit" className={css['fundraising__search--form']}>
							<input type="text" placeholder="Search stores" />
							<button type="submit">
								<Icon name={'Search'} />
							</button>
						</form> */}

						<div className={css['fundraising__head--buttons__box']}>
							<button className={`${css.delete__button} light_button_2`}>
								Delete
							</button>

							{isFundraise ? (
								<button
									onClick={onMoveToSellAtCoast}
									className={`${css.change__category__button} contrast_button_1`}
								>
									<Icon name={'Coins'} />
									Move to Sell at cost
								</button>
							) : (
								<button
									onClick={onMoveToFundraise}
									className={`${css.change__category__button} contrast_button_1`}
								>
									<Icon name={'Coins'} />
									Move to Fundraise
								</button>
							)}
						</div>
					</div>

					<div className={css.products__container}>
						<div className={css.warning}>
							<Icon name={'Danger'} />
							<p>
								Heads up! Your base price includes 1 ink color—want more? It’s
								just $1 extra per color. Don’t worry, we’ve got your back—our
								team will review your store once submitted to make sure
								everything looks great!
							</p>
						</div>

						<div className={css.categories__container}>
							<div className={css['products__categories--switchers']}>
								<button
									onClick={() => setIsFundraise(true)}
									className={`${isFundraise ? css['category--picker__active'] : css['category--picker']}`}
								>
									<span className={css.icon}>
										<Check />
									</span>
									Fundraise
									<span className={css.count}>{fundraisingCount}</span>
								</button>

								<button
									onClick={() => setIsFundraise(false)}
									className={`${!isFundraise ? css['category--picker__active'] : css['category--picker']}`}
								>
									<span className={css.icon}>
										<Check />
									</span>
									Sell at cost
									<span className={css.count}>{sellOutCount}</span>
								</button>
							</div>

							<div className={css.category__group}>
								<span className={css['category__group--label']}>
									Product Group
								</span>

								<select
									name="select"
									value={'all'}
									onChange={(e) => onSortChange(e)}
								>
									<option value="all">All</option>

									{Object.keys(productsByCategory).map((key) => (
										<option key={key} value={key}>
											{key}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className={css.products__categories}>
							{isFundraise &&
								productsByCategory &&
								Object.keys(productsByCategory).map((key, keyIdx) => (
									<FundraisingCategoryDetails
										key={key}
										keyIdx={keyIdx}
										categoryKey={key}
										productsByCategory={productsByCategory}
										profitValue={profitValue}
										amountProfit={amountProfit}
										setSellAtCostProducts={setSellAtCostProducts}
										setProductsByCategory={setProductsByCategory}
										setSelectedProducts={setSelectedProducts}
										isFundraise={isFundraise}
										pricesEnd={pricesEnd}
									/>
								))}

							{!isFundraise &&
								sellOutCount > 0 &&
								Object.keys(productsByCategory).map((key, keyIdx) => (
									<FundraisingCategoryDetails
										key={key}
										keyIdx={keyIdx}
										categoryKey={key}
										productsByCategory={sellAtCostProducts}
										profitValue={profitValue}
										amountProfit={amountProfit}
										setSellAtCostProducts={setSellAtCostProducts}
										setProductsByCategory={setProductsByCategory}
										setSelectedProducts={setSelectedProducts}
										isFundraise={isFundraise}
										pricesEnd={pricesEnd}
									/>
								))}
						</div>
					</div>
				</div>

				<aside className={css.handles}>
					<ul className={css.handles__container}>
						<li className={css.handle__item}>
							<fieldset>
								<span className={css.handle__title}>
									Set your profit for each item:
								</span>

								<label className={css.radio__label}>
									<span className={css.input__emulator}></span>
									In Fixed Amount, USD
									<input
										onChange={() => setAmountProfit(true)}
										type="radio"
										name="profit__type"
										checked={amountProfit}
										className={'visually-hidden'}
									/>
								</label>
								<label className={css.radio__label}>
									<span className={css.input__emulator}></span>
									Percentage Based
									<input
										onChange={() => setAmountProfit(false)}
										type="radio"
										name="profit__type"
										checked={!amountProfit}
										className={'visually-hidden'}
									/>
								</label>
							</fieldset>
						</li>

						<li className={css.handle__item}>
							<ProfitValueFieldset
								title={'Add profit for all items in USD'}
								valuesArray={fundraisingFixedAmounValues}
								setProfitValue={setProfitValue}
								disabled={!amountProfit}
							/>
						</li>

						<li className={css.handle__item}>
							<ProfitValueFieldset
								title={'Add profit for all items in Percentage'}
								valuesArray={fundraisingPercentageValues}
								setProfitValue={setProfitValue}
								isPercent={true}
								disabled={amountProfit}
							/>
						</li>

						<li className={css.handle__item}>
							<span className={css.handle__title}>
								Make the selling price ends at round number
							</span>

							<fieldset className={css.row}>
								{fundraisingPriceEndsValues.map((value) => (
									<label className={css.profit__label} key={value}>
										{value}
										<input
											onChange={(e) => setPricesEnd(e.target.value)}
											type="radio"
											name="price--end"
											value={value}
											className="visually-hidden"
											checked={pricesEnd === value}
										/>
									</label>
								))}
							</fieldset>
						</li>
					</ul>
				</aside>
			</section>
		)
}
