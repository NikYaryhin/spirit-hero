import { useEffect, useState } from 'react'
import spiritHeroApi from '@/api/spiritHeroApi'
import css from './ProductsSection.module.css'
import Check from '../Icons/Check'
import Lightning from '../Icons/Lightning'
import ProductCard from '../ProductCard/ProductCard'
import Filters from '../Filters/Filters'
import Loader from '../Loader/Loader'
import { showToast } from '@/helpers/toastCall'

export default function ProductsSection({
	myShopProducts,
	setMyShopProducts,
	isFlashSale,
	storeId,
}) {
	const [isLoading, setIsLoading] = useState(true)
	const [sortingBy, setSortingBy] = useState('')
	const [selectedCount, setSelectedCount] = useState(0)
	const [isCatalog, setIsCatalog] = useState(true)
	const [catalogProducts, setCatalogProducts] = useState([])
	const [filters, setFilters] = useState(null)
	const [initialCatalogProducts, setInitialCatalogProducts] = useState([])
	const [initialMyShopProducts, setInitialMyShopProducts] = useState([])
	const [activeFilters, setActiveFilters] = useState({
		brands: [],
		categories: [],
		colorFamilies: [],
	})

	useEffect(() => {
		const hasAnyFilters =
			(activeFilters.brands && activeFilters.brands.length > 0) ||
			(activeFilters.categories && activeFilters.categories.length > 0) ||
			(activeFilters.colorFamilies && activeFilters.colorFamilies.length > 0)

		const matchByFilters = (product) => {
			if (activeFilters.brands && activeFilters.brands.length > 0) {
				const passBrand = activeFilters.brands.includes(
					String(product.brand_id),
				)
				if (!passBrand) return false
			}

			if (activeFilters.categories && activeFilters.categories.length > 0) {
				const passCategory = activeFilters.categories.includes(
					String(product.category_id),
				)
				if (!passCategory) return false
			}

			if (
				activeFilters.colorFamilies &&
				activeFilters.colorFamilies.length > 0
			) {
				const colorIds = Array.isArray(product.colors)
					? product.colors.map((c) => String(c.id))
					: []
				const passColor = colorIds.some((id) =>
					activeFilters.colorFamilies.includes(id),
				)
				if (!passColor) return false
			}

			return true
		}

		const applySorting = (arr) => {
			if (!Array.isArray(arr)) return arr
			if (sortingBy === 'expensive') {
				return [...arr].sort(
					(a, b) => b.params.on_demand_price - a.params.on_demand_price,
				)
			}
			if (sortingBy === 'cheap') {
				return [...arr].sort(
					(a, b) => a.params.on_demand_price - b.params.on_demand_price,
				)
			}
			if (sortingBy === 'name') {
				return [...arr].sort((a, b) =>
					a.product_title.localeCompare(b.product_title),
				)
			}
			return arr
		}

		const nextCatalog = applySorting(
			hasAnyFilters
				? initialCatalogProducts.filter(matchByFilters)
				: initialCatalogProducts,
		)
		const nextShop = applySorting(
			hasAnyFilters
				? initialMyShopProducts.filter(matchByFilters)
				: initialMyShopProducts,
		)

		setCatalogProducts(nextCatalog)
		setMyShopProducts(nextShop)
	}, [activeFilters, sortingBy, initialCatalogProducts, initialMyShopProducts])

	useEffect(() => {
		const getProducts = async () => {
			try {
				if (!localStorage.getItem('access_token')) {
					const loginRes = await spiritHeroApi.login(
						'admin@gmail.com',
						'12345678',
					)
					console.log('loginRes', loginRes)
				}
				const res = await spiritHeroApi.getProducts()
				console.log('spiritHeroApi.getProducts() res', res)

				setCatalogProducts(res.products)
				setInitialCatalogProducts(res.products)
				setFilters(res.filters)
				setIsLoading(false)
			} catch (error) {
				console.error(error)
			}
		}
		getProducts()
	}, [])

	useEffect(() => {
		if (!catalogProducts) return

		const count = isCatalog
			? catalogProducts.filter((product) => product.selected).length
			: myShopProducts.filter((product) => product.selected).length

		setSelectedCount(count)
	}, [catalogProducts, myShopProducts, isCatalog])

	useEffect(() => {
		if (sortingBy === 'expensive') {
			setCatalogProducts((prev) => {
				return [...prev].sort(
					(a, b) => b.params.on_demand_price - a.params.on_demand_price,
				)
			})
			setMyShopProducts((prev) => {
				return [...prev].sort(
					(a, b) => b.params.on_demand_price - a.params.on_demand_price,
				)
			})
		}
		if (sortingBy === 'cheap') {
			setCatalogProducts((prev) => {
				return [...prev].sort(
					(a, b) => a.params.on_demand_price - b.params.on_demand_price,
				)
			})
			setMyShopProducts((prev) => {
				return [...prev].sort(
					(a, b) => a.params.on_demand_price - b.params.on_demand_price,
				)
			})
		}
		if (sortingBy === 'name') {
			setCatalogProducts((prev) => {
				return [...prev].sort((a, b) =>
					a.product_title.localeCompare(b.product_title),
				)
			})
			setMyShopProducts((prev) => {
				return [...prev].sort((a, b) =>
					a.product_title.localeCompare(b.product_title),
				)
			})
		}
	}, [sortingBy])

	const onCatalogCardClick = (event) => {
		const { value, checked } = event.currentTarget

		setCatalogProducts((prev) =>
			prev.map((product) =>
				String(product.id) === String(value)
					? { ...product, selected: checked }
					: product,
			),
		)
	}

	const onMyShopCardClick = (event) => {
		const { value, checked } = event.currentTarget

		setMyShopProducts((prev) =>
			prev.map((product) =>
				String(product.id) === String(value)
					? { ...product, selected: checked }
					: product,
			),
		)
	}

	const onSelectAllClick = () => {
		if (isCatalog)
			setCatalogProducts((prev) =>
				prev.map((product) => {
					return { ...product, selected: true }
				}),
			)
		else
			setMyShopProducts((prev) =>
				prev.map((product) => {
					return { ...product, selected: true }
				}),
			)
	}

	const addToStoreButtonHandle = () => {
		const selectedIds = new Set(
			(catalogProducts || [])
				.filter((p) => p.selected)
				.map((p) => String(p.id)),
		)
		if (selectedIds.size === 0) return

		const payload = {
			store_id: +storeId || +localStorage.getItem('storeId'),
			ids: Array.from(selectedIds).map((p) => +p),
		}

		console.log(payload)

		spiritHeroApi
			.addToMyStoreProductsList(payload.store_id, payload.ids)
			.then((res) => {
				console.log(res)
				showToast(
					`${selectedCount} item${selectedCount !== 1 ? 's' : ''} ${selectedCount === 1 ? 'was' : 'were'} successfully added to your store.`,
				)
			})
			.catch((error) => {
				showToast(
					`Error while adding products to your store: ${error}`,
					'error',
				)
			})

		setInitialCatalogProducts((prevInitialCatalog) => {
			if (!Array.isArray(prevInitialCatalog) || prevInitialCatalog.length === 0)
				return prevInitialCatalog

			const nextInitialCatalog = prevInitialCatalog.filter(
				(p) => !selectedIds.has(String(p.id)),
			)
			return nextInitialCatalog
		})

		setInitialMyShopProducts((prevInitialMyShop) => {
			const toAppend = (initialCatalogProducts || []).filter((p) =>
				selectedIds.has(String(p.id)),
			)
			if (!toAppend || toAppend.length === 0) return prevInitialMyShop

			const existing = new Set(prevInitialMyShop.map((p) => String(p.id)))
			const append = toAppend
				.filter((p) => !existing.has(String(p.id)))
				.map((p) => ({ ...p }))

			const arrayToReturn = append.length
				? [...prevInitialMyShop, ...append]
				: prevInitialMyShop

			// To delete
			localStorage.setItem('myShopArr', JSON.stringify(arrayToReturn))

			return arrayToReturn
		})
	}

	const deleteFromTheStoreButtonHandle = () => {
		const selectedIds = new Set(
			(myShopProducts || []).filter((p) => p.selected).map((p) => String(p.id)),
		)
		if (selectedIds.size === 0) return

		console.log(Array.from(selectedIds))
		const payload = {
			store_id: +storeId || +localStorage.getItem('storeId'),
			ids: Array.from(selectedIds).map((p) => +p),
		}

		console.log(payload)

		spiritHeroApi
			.deleteFromMyStoreProducts(payload.store_id, payload.ids)
			.then((res) => {
				console.log(res)
				showToast(
					`${selectedCount} item${selectedCount !== 1 ? 's' : ''} ${selectedCount === 1 ? 'was' : 'were'} successfully removed from your store.`,
				)
			})
			.catch((error) => {
				showToast(
					`Error while removing products to your store: ${error}`,
					'error',
				)
			})

		setInitialMyShopProducts((prevInitialMyShop) => {
			const nextInitialMyShop = prevInitialMyShop.filter(
				(p) => !selectedIds.has(String(p.id)),
			)
			return nextInitialMyShop
		})

		setInitialCatalogProducts((prevInitialCatalog) => {
			const toAppend = (initialMyShopProducts || []).filter((p) =>
				selectedIds.has(String(p.id)),
			)
			if (!toAppend || toAppend.length === 0) return prevInitialCatalog

			const existing = new Set(prevInitialCatalog.map((p) => String(p.id)))
			const append = toAppend
				.filter((p) => !existing.has(String(p.id)))
				.map((p) => ({ ...p }))
			return append.length
				? [...append, ...prevInitialCatalog]
				: prevInitialCatalog
		})
	}

	const sortingSelectHandle = (event) => {
		const { value } = event.currentTarget

		setSortingBy(value)
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
							Product catalog{' '}
							<span className={css.count}>{catalogProducts?.length || 0}</span>
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

						<h3 className={css['products__catalog--top__label']}>
							You have selected {selectedCount} product
							{myShopProducts?.length === 1 ? '' : 's'}
						</h3>

						<div className={css['buttons__box']}>
							<button
								className={`${css.select_all} light_button_1`}
								onClick={onSelectAllClick}
							>
								Select All
							</button>

							{!isCatalog && (
								<button
									className={`${css.delete__selected} light_button_2`}
									onClick={deleteFromTheStoreButtonHandle}
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
							{catalogProducts &&
								isCatalog &&
								catalogProducts.map((product) => (
									<ProductCard
										key={product.id}
										inputHandle={onCatalogCardClick}
										product={product}
										isFlashSale={isFlashSale}
									/>
								))}

							{myShopProducts &&
								!isCatalog &&
								myShopProducts.map((product) => (
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
