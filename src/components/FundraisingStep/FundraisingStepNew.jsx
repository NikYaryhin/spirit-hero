import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { showToast } from '@/helpers/toastCall'
import { useSelector } from 'react-redux'

export default function FundraisingStepNew() {
	const params = new URLSearchParams(window.location.search)
	const storeId = params.get('store_id')


	// --- States ---
	const [isLoading, setIsLoading] = useState(true)
	const [isFundraiseView, setIsFundraiseView] = useState(false)
	const [minimalGroups, setMinimalGroups] = useState([])

	// Продукти, розбиті по категоріях для двох станів
	const [productsByCategory, setProductsByCategory] = useState({})
	const [sellAtCostProducts, setSellAtCostProducts] = useState({})

	const [selectedProducts, setSelectedProducts] = useState([])
	const [amountProfit, setAmountProfit] = useState(false)
	const [profitValue, setProfitValue] = useState(0)
	const [pricesEnd, setPricesEnd] = useState(null)

	const [selectedCategory, setSelectedCategory] = useState('all')

	// --- Mappings ---
	const minimalGroupNameById = useMemo(() => {
		return minimalGroups.reduce((acc, group) => {
			acc[String(group.id)] = group.name
			return acc
		}, {})
	}, [minimalGroups])

	const getGroupLabel = (groupKey) => minimalGroupNameById[groupKey] || `Group ${groupKey}`

	// --- Data Fetching ---
	const fetchStoreData = useCallback(async () => {
		setIsLoading(true)

		try {
			const res = await spiritHeroApi.getStore(storeId)
			if (!res) return

			const groups = res.minimum_groups || []
			setMinimalGroups(groups)

			// 👉 читаємо параметр з URL
			const params = new URLSearchParams(window.location.search)
			const fundraisingParam = params.get('fundraising')

			// ============================
			// 🔥 1. Якщо є fundraising в URL
			// ============================
			if (fundraisingParam !== null) {
				const isFundraisingGroup = fundraisingParam === 'true'

				setIsFundraiseView(isFundraisingGroup)

				// 👉 формуємо всі продукти
				const products = groups.flatMap(group =>
					(group.products || []).map(product => ({
						...product,
						is_fundraise: isFundraisingGroup,
					}))
				)

				// 👉 оновлюємо на бекенді
				await spiritHeroApi.updateFundraisingStatus({
					store_id: storeId,
					products_info: products.map(product => ({
						id: product.id,
						is_fundraising: isFundraisingGroup,
					})),
				})

				// 👉 після оновлення — всі продукти одного типу
				const map = {}

				groups.forEach(group => {
					const groupKey = String(group.id)
					map[groupKey] = (group.products || []).map(p => ({
						...p,
						is_fundraise: isFundraisingGroup,
					}))
				})
				console.log("map",map)


				setProductsByCategory(isFundraisingGroup ? map : {})
				setSellAtCostProducts(!isFundraisingGroup ? map : {})
				if(isFundraisingGroup){
					sessionStorage.setItem('fundraisingCount', products.length)
				}



				// 👉 видаляємо параметр з URL
				const url = new URL(window.location.href)
				url.searchParams.delete('fundraising')
				window.history.replaceState({}, '', url)
			}

				// ============================
				// ✅ 2. Якщо немає параметру — стандартна логіка
			// ============================
			else {
				console.log("test 2.")
				const fundraisingMap = {}
				const costMap = {}

				let countP = 0
				groups.forEach(group => {
					const groupKey = String(group.id)
					const products = group.products || []

					const fProducts = products.filter(p => p.is_fundraise)
					const cProducts = products.filter(p => !p.is_fundraise)
					countP+=fProducts.length

					if (fProducts.length > 0) fundraisingMap[groupKey] = fProducts
					if (cProducts.length > 0) costMap[groupKey] = cProducts
				})

				sessionStorage.setItem('fundraisingCount', countP)

				setProductsByCategory(fundraisingMap)
				setSellAtCostProducts(costMap)

				setIsFundraiseView(!Object.keys(costMap || {}).length > 0);
			}

			setAmountProfit(!res.store?.is_percent_profit)

		} catch (error) {
			console.error(`Error loading store data:`, error)
			showToast('Failed to load store data', 'error')
		} finally {
			setIsLoading(false)
		}
	}, [storeId])

	useEffect(() => {
		if (storeId) fetchStoreData()
	}, [fetchStoreData, storeId])

	// --- Counts ---
	const fundraisingCount = useMemo(() =>
			Object.values(productsByCategory).reduce((acc, list) => acc + list.length, 0),
		[productsByCategory])

	const sellOutCount = useMemo(() =>
			Object.values(sellAtCostProducts).reduce((acc, list) => acc + list.length, 0),
		[sellAtCostProducts])

	// --- Actions ---
	const updateStatusOnServer = async (productIds, isFundraising) => {
		const products_info = productIds.map(id => ({ id, is_fundraising: isFundraising }))
		try {
			await spiritHeroApi.updateFundraisingStatus({
				store_id: storeId,
				products_info
			})
		} catch (error) {
			showToast('Error updating status', 'error')
			throw error
		}
	}

	const moveProducts = async (toFundraise) => {
		if (selectedProducts.length === 0) return
		const selectedIds = selectedProducts.map(p => p.id)
		console.log('selectedIds',selectedIds)
		console.log('toFundraise',toFundraise)

		try {
			await updateStatusOnServer(selectedIds, toFundraise)
			await fetchStoreData() // Найпростіший спосіб оновити всі лічильники та списки
			setSelectedProducts([])
			showToast(`Moved to ${toFundraise ? 'Fundraise' : 'Sell at cost'}`)
		} catch (e) {
			console.error(e)
		}
	}

	const deleteProducts = async () => {
		if (selectedProducts.length === 0) return
		const ids = selectedProducts.map(p => p.id)

		try {
			await spiritHeroApi.deleteFromMyStoreProducts({ store_id: Number(storeId), ids })
			await fetchStoreData()
			setSelectedProducts([])
			showToast('Products removed from store')
		} catch (e) {
			showToast('Error deleting products', 'error')
		}
	}

	const profitTypeChangeHandle = async (e) => {
		const is_percent_profit = e.target.value === 'percent'
		setAmountProfit(!is_percent_profit)
		try {
			await spiritHeroApi.updateProfitType({ store_id: storeId, is_percent_profit })
		} catch (error) {
			console.error(error)
		}
	}

	// --- Filtering logic for display ---
	const activeDisplayMap = isFundraiseView ? productsByCategory : sellAtCostProducts
	const displayCategoryKeys = useMemo(() => {
		const keys = Object.keys(activeDisplayMap)
		if (selectedCategory === 'all') return keys
		return keys.filter(k => k === selectedCategory)
	}, [activeDisplayMap, selectedCategory])

	if (isLoading) return <Loader />

	return (
		<section className={css.fundraising__section}>
			<div className={css.products__handle}>
				<div className={css.products__container}>
					<div className={css.warning}>
						<Icon name={'Danger'} />
						<p>Your base price includes 1 ink color—want more? It’s just $1 extra per color.</p>
					</div>

					<div className={css.categories__container}>
						<div className={css['products__categories--switchers']}>
							<button
								onClick={() => { setIsFundraiseView(false); setSelectedProducts([]); }}
								className={`${!isFundraiseView ? css['category--picker__active'] : css['category--picker']}`}
							>
								<span className={css.icon}><Check /></span>
								Sell at cost <span className={css.count}>{sellOutCount}</span>
							</button>

							<button
								onClick={() => { setIsFundraiseView(true); setSelectedProducts([]); }}
								className={`${isFundraiseView ? css['category--picker__active'] : css['category--picker']}`}
							>
								<span className={css.icon}><Check /></span>
								Fundraise <span className={css.count}>{fundraisingCount}</span>
							</button>
						</div>

						<div className={css['fundraising__head--buttons__box']}>
							<button
								className={`${css.delete__button} light_button_2`}
								onClick={deleteProducts}
								disabled={selectedProducts.length === 0}
							>
								Delete
							</button>

							<button
								onClick={() => moveProducts(!isFundraiseView)}
								className={`${css.change__category__button} contrast_button_1`}
								disabled={selectedProducts.length === 0}
							>
								<Icon name={'Coins'} />
								Move to {isFundraiseView ? 'Sell at cost' : 'Fundraise'}
							</button>
						</div>

						<div className={css.category__group}>
							<span className={css['category__group--label']}>Product Group</span>
							<select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
								<option value="all">All</option>
								{minimalGroups.map((g) => (
									<option key={g.id} value={g.id}>{g.name}</option>
								))}
							</select>
						</div>
					</div>

					<div className={`${css.products__categories} ${isFundraiseView ? css.fundraise__categories : css.sell__at__cost__categories}`}>
						{displayCategoryKeys.map((key, idx) => (
							<FundraisingCategoryDetails
								key={key}
								keyIdx={idx}
								categoryKey={key}
								categoryLabel={getGroupLabel(key)}
								productsByCategory={activeDisplayMap}
								profitValue={profitValue}
								amountProfit={amountProfit}
								setProductsByCategory={setProductsByCategory}
								setSellAtCostProducts={setSellAtCostProducts}
								setSelectedProducts={setSelectedProducts}
								isFundraise={isFundraiseView}
								pricesEnd={pricesEnd}
								setIsFundraise={setIsFundraiseView}
								isActive={true}
							/>
						))}
						{displayCategoryKeys.length === 0 && <p className={css.no_products}>No products found in this section.</p>}
					</div>
				</div>
			</div>

			<aside className={css.handles}>
				<ul className={css.handles__container}>
					<li className={css.handle__item}>
						<fieldset>
							<span className={css.handle__title}>Set your profit for each item:</span>
							<label className={css.radio__label}>
								<span className={css.input__emulator}></span> In Fixed Amount, USD
								<input onChange={profitTypeChangeHandle} type="radio" name="ptype" value="fixed" checked={amountProfit} className="visually-hidden" />
							</label>
							<label className={css.radio__label}>
								<span className={css.input__emulator}></span> Percentage Based
								<input onChange={profitTypeChangeHandle} type="radio" name="ptype" value="percent" checked={!amountProfit} className="visually-hidden" />
							</label>
						</fieldset>
					</li>

					<li className={css.handle__item}>
						<ProfitValueFieldset
							title={amountProfit ? 'Add profit for all items in USD' : 'Add profit for all items in Percentage'}
							valuesArray={amountProfit ? fundraisingFixedAmounValues : fundraisingPercentageValues}
							setProfitValue={setProfitValue}
							isPercent={!amountProfit}
						/>
					</li>

					<li className={css.handle__item}>
						<span className={css.handle__title}>Make the selling price ends at round number</span>
						<fieldset className={css.row}>
							{fundraisingPriceEndsValues.map((value) => (
								<label className={css.profit__label} key={value}>
									{value}
									<input
										onChange={(e) => setPricesEnd(e.target.value)}
										type="radio"
										name="pend"
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
