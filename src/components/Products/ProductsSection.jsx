import { useEffect, useState } from 'react'
import spiritHeroApi from '@/api/spiritHeroApi'
import css from './ProductsSection.module.css'
import Check from '../Icons/Check'
import Lightning from '../Icons/Lightning'
import ProductCard from '../ProductCard/ProductCard'
import Filters from '../Filters/Filters'
import Loader from '../Loader/Loader'
import { showToast } from '@/helpers/toastCall'

import { useDispatch, useSelector } from 'react-redux'
import {
	selectCatalogProducts,
	selectMyShopProducts,
	selectIsLoading,
	selectFilters,
	selectSortingBy,
	setSortingBy,
	toggleProductSelection,
	selectAllProducts as selectAllProductsAction,
	setMyShopProducts,
	setCatalogProducts,
	selectInitialCatalogProducts,
	selectInitialMyShopProducts,
	setInitialMyShopProducts,
	setInitialCatalogProducts,
	fetchProducts,
} from '@/features/products/productsSlice'

export default function ProductsSection({ isFlashSale }) {
	const dispatch = useDispatch()

	const storeId = useSelector((state) => state.flashSale.storeId)
	const catalogProducts = useSelector(selectCatalogProducts)
	const myShopProducts = useSelector(selectMyShopProducts)
	const isLoading = useSelector(selectIsLoading)
	const filters = useSelector(selectFilters)
	const sortingBy = useSelector(selectSortingBy)

	const initialCatalogProducts = useSelector(selectInitialCatalogProducts)
	const initialMyShopProducts = useSelector(selectInitialMyShopProducts)

	const [selectedCount, setSelectedCount] = useState(0)
	const [isCatalog, setIsCatalog] = useState(true)

	const [activeFilters, setActiveFilters] = useState({
		brands: [],
		categories: [],
		colorFamilies: [],
	})
	useEffect(() => {
		async function fetchData() {
			dispatch(fetchProducts())
		}
		if (catalogProducts.length < 1) fetchData()
	}, [])

	useEffect(() => {
		const hasAnyFilters =
			(activeFilters.brands && activeFilters.brands.length > 0) ||
			(activeFilters.categories && activeFilters.categories.length > 0) ||
			(activeFilters.colorFamilies && activeFilters.colorFamilies.length > 0)

		const matchByFilters = (product) => {
			if (activeFilters.brands && activeFilters.brands.length > 0) {
				const passBrand = activeFilters.brands.includes(String(product.brand_id))
				if (!passBrand) return false
			}

			if (activeFilters.categories && activeFilters.categories.length > 0) {
				const passCategory = activeFilters.categories.includes(String(product.category_id))
				if (!passCategory) return false
			}

			if (activeFilters.colorFamilies && activeFilters.colorFamilies.length > 0) {
				const colorIds = Array.isArray(product.colors)
					? product.colors.map((c) => String(c.color_id))
					: []
				const passColor = colorIds.some((id) => activeFilters.colorFamilies.includes(id))
				console.log({ passColor, colorIds, product, activeFilters })

				if (!passColor) return false
			}

			return true
		}

		const applySorting = (arr) => {
			if (!Array.isArray(arr)) return arr
			if (sortingBy === 'expensive') {
				return [...arr].sort((a, b) => b.params.on_demand_price - a.params.on_demand_price)
			}
			if (sortingBy === 'cheap') {
				return [...arr].sort((a, b) => a.params.on_demand_price - b.params.on_demand_price)
			}
			if (sortingBy === 'name') {
				return [...arr].sort((a, b) => a.product_title.localeCompare(b.product_title))
			}
			return arr
		}

		const nextCatalog = applySorting(
			hasAnyFilters ? initialCatalogProducts.filter(matchByFilters) : initialCatalogProducts,
		)
		const nextShop = applySorting(
			hasAnyFilters ? initialMyShopProducts.filter(matchByFilters) : initialMyShopProducts,
		)

		dispatch(setCatalogProducts(nextCatalog))
		dispatch(setMyShopProducts(nextShop))
	}, [activeFilters, sortingBy, initialCatalogProducts, initialMyShopProducts])

	useEffect(() => {
		const targetArray = isCatalog ? catalogProducts : myShopProducts
		const count = targetArray.filter((product) => product.selected).length

		setSelectedCount(count)
	}, [catalogProducts, myShopProducts, isCatalog])

	useEffect(() => {
		if (sortingBy === 'expensive') {
			dispatch(
				setCatalogProducts(
					[...catalogProducts].sort((a, b) => b.params.on_demand_price - a.params.on_demand_price),
				),
			)

			dispatch(
				setMyShopProducts(
					[...myShopProducts].sort((a, b) => b.params.on_demand_price - a.params.on_demand_price),
				),
			)
		}
		if (sortingBy === 'cheap') {
			dispatch(
				setCatalogProducts(
					[...catalogProducts].sort((a, b) => a.params.on_demand_price - b.params.on_demand_price),
				),
			)
			dispatch(
				setMyShopProducts(
					[...myShopProducts].sort((a, b) => a.params.on_demand_price - b.params.on_demand_price),
				),
			)
		}
		if (sortingBy === 'name') {
			dispatch(
				setCatalogProducts(
					[...catalogProducts].sort((a, b) => a.product_title.localeCompare(b.product_title)),
				),
			)
			dispatch(
				setMyShopProducts(
					[...myShopProducts].sort((a, b) => a.product_title.localeCompare(b.product_title)),
				),
			)
		}
	}, [sortingBy])

	const onCatalogCardClick = (event) => {
		const { value, checked } = event.currentTarget

		dispatch(
			toggleProductSelection({
				productId: value,
				isSelected: checked,
				isCatalog: true,
			}),
		)
	}

	const onMyShopCardClick = (event) => {
		const { value, checked } = event.currentTarget

		dispatch(
			toggleProductSelection({
				productId: value,
				isSelected: checked,
				isCatalog: false,
			}),
		)
	}

	const onSelectAllClick = () => {
		const targetArray = isCatalog ? catalogProducts : myShopProducts
		const hasUnselected = targetArray.some((product) => !product.selected)

		dispatch(
			selectAllProductsAction({
				isCatalog,
				select: hasUnselected,
			}),
		)
	}

	const addToStoreButtonHandle = () => {
		const selectedIds = new Set(
			(catalogProducts || []).filter((p) => p.selected).map((p) => String(p.id)),
		)
		if (selectedIds.size === 0) return

		const payload = {
			store_id: +storeId,
			ids: Array.from(selectedIds).map((p) => +p),
		}

		spiritHeroApi
			.addToMyStoreProductsList(payload.store_id, payload.ids)
			.then((res) => {
				console.debug('spiritHeroApi.addToMyStoreProductsList res', res)
				showToast(
					`${selectedCount} item${selectedCount !== 1 ? 's' : ''} ${selectedCount === 1 ? 'was' : 'were'} successfully added to your store.`,
				)
			})
			.catch((error) => {
				showToast(`Error while adding products to your store: ${error}`, 'error')
			})

		dispatch(
			setInitialCatalogProducts(
				initialCatalogProducts.filter((p) => !selectedIds.has(String(p.id))),
			),
		)

		const toAppend = initialCatalogProducts.filter((p) => selectedIds.has(String(p.id)))

		if (toAppend.length > 0) {
			const existing = new Set(initialMyShopProducts.map((p) => String(p.id)))
			const append = toAppend.filter((p) => !existing.has(String(p.id))).map((p) => ({ ...p }))

			if (append.length > 0)
				dispatch(setInitialMyShopProducts([...initialMyShopProducts, ...append]))
		}
	}

	const deleteFromTheStoreButtonHandle = () => {
		const selectedIds = new Set(
			(myShopProducts || []).filter((p) => p.selected).map((p) => String(p.id)),
		)
		if (selectedIds.size === 0) return

		const payload = {
			store_id: +storeId || +localStorage.getItem('storeId'),
			ids: Array.from(selectedIds).map((p) => +p),
		}

		spiritHeroApi
			.deleteFromMyStoreProducts(payload)
			.then((res) => {
				console.debug('spiritHeroApi.deleteFromMyStoreProducts res', res)
				showToast(
					`${selectedCount} item${selectedCount !== 1 ? 's' : ''} ${selectedCount === 1 ? 'was' : 'were'} successfully removed from your store.`,
				)
			})
			.catch((error) => {
				showToast(`Error while removing products to your store: ${error}`, 'error')
			})

		dispatch(
			setInitialMyShopProducts(initialMyShopProducts.filter((p) => !selectedIds.has(String(p.id)))),
		)

		const toAppend = (initialMyShopProducts || []).filter((p) => selectedIds.has(String(p.id)))

		if (toAppend.length > 0) {
			const existing = new Set(initialCatalogProducts.map((p) => String(p.id)))
			const append = toAppend.filter((p) => !existing.has(String(p.id))).map((p) => ({ ...p }))

			if (append.length > 0)
				dispatch(setInitialCatalogProducts([...initialCatalogProducts, ...append]))
		}
	}

	const sortingSelectHandle = (event) => {
		const { value } = event.currentTarget

		dispatch(setSortingBy(value))
	}

	return (
		<div className={css['products__section']}>
			{!isLoading ? (
				<>
					<div className={css['products__catalog--pickers']}>
						<button
							className={`${isCatalog ? css['products__catalog--picker__active'] : css['products__catalog--picker']}`}
							onClick={() => setIsCatalog(true)}
						>
							<span className={css.icon}>
								<Check />
							</span>
							Product catalog <span className={css.count}>{catalogProducts?.length || 0}</span>
						</button>

						<button
							className={`${!isCatalog ? css['products__catalog--picker__active'] : css['products__catalog--picker']}`}
							onClick={() => setIsCatalog(false)}
						>
							<span className={css.icon}>
								<Check />
							</span>
							My Store
							<span className={css.count}>{myShopProducts?.length || 0}</span>
						</button>
					</div>

					<div className={css['products__catalog--top']}>
						<div className={css.sorting__wrap}>
							<span className={css.sorting__label}>Sort by</span>

							<select
								onChange={sortingSelectHandle}
								className={css.sorting__select}
								name="sorting"
								defaultValue=""
							>
								<option value="" disabled>
									Recommended
								</option>
								<option value="expensive">From expensive to cheap</option>
								<option value="cheap">From cheap to expensive</option>
								<option value="name">Name</option>
							</select>
						</div>

						{selectedCount > 0 && (
							<h3 className={css['products__catalog--top__label']}>
								You have selected {selectedCount} product
								{myShopProducts?.length === 1 ? '' : 's'}
							</h3>
						)}

						<div className={css['buttons__box']}>
							<button className={`${css.select_all} light_button_1`} onClick={onSelectAllClick}>
								Select All
							</button>

							{!isCatalog && (
								<button
									className={`${css.delete__selected} light_button_2`}
									onClick={deleteFromTheStoreButtonHandle}
									disabled={selectedCount > 0 ? false : true}
								>
									Delete
								</button>
							)}

							{isCatalog && (
								<button
									className={`${css.add_to_store} contrast_button_1`}
									onClick={addToStoreButtonHandle}
								>
									<Lightning />
									Add to my store
								</button>
							)}
						</div>
					</div>

					<div className={css.products__handle}>
						<div className={css.products_filters}>
							{filters &&
								Object.keys(filters).map((key) => {
									if (key !== 'sizes')
										return (
											<Filters
												key={key}
												keyName={key}
												filterName={key}
												category={filters[key]}
												setActiveFilters={setActiveFilters}
											/>
										)
								})}
						</div>

						<ul className={css.products__list}>
							{isCatalog
								? catalogProducts.map((product) => (
										<ProductCard
											key={product.id}
											inputHandle={onCatalogCardClick}
											product={product}
											isFlashSale={isFlashSale}
										/>
									))
								: myShopProducts.map((product) => (
										<ProductCard
											key={product.id}
											inputHandle={onMyShopCardClick}
											product={product}
											isFlashSale={isFlashSale}
										/>
									))}
						</ul>
					</div>
				</>
			) : (
				<Loader />
			)}
		</div>
	)
}
