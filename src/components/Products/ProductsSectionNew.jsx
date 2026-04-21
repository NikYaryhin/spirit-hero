import { useEffect, useMemo, useState, useCallback } from 'react'
import spiritHeroApi from '@/api/spiritHeroApi'
import css from './ProductsSection.module.css'
import Check from '../Icons/Check'
import Lightning from '../Icons/Lightning'
import Filters from '../Filters/Filters'
import Loader from '../Loader/Loader'
import { showToast } from '@/helpers/toastCall'
import ProductDetailsNew from '@components/ProductDetails/ProductDetailsNew'
import { useDispatch } from 'react-redux'
import { setMinimalGroups } from '@/features/products/productsSlice'
import Modal from '@components/Modal/Modal'
import ProductStepValidationModal from '@components/ProductStepValidationModal/ProductStepValidationModal'
import FundraisingNextStepModal from '@components/FundraisingNextStepModal/FundraisingNextStepModal'
import cssModal from '../ProductStepValidationModal/ProductStepValidationModal.module.css'
import Icon from '@components/Icon'

export default function ProductsSectionNew({ isFlashSale, storeIdFromQuery }) {
	const dispatch = useDispatch()
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isProcessingDesign, setIsProcessingDesign] = useState(false);
	const [successMessage, setSuccessMessage] = useState(false);

	// --- States ---
	const [catalogGroups, setCatalogGroups] = useState([])
	const [myStoreGroups, setMyStoreGroups] = useState([])
	const [filtersData, setFiltersData] = useState(null)
	const [selectedDuplicates, setSelectedDuplicates] = useState({})
	// Структура тепер така: { "groupId": [productId1, productId2] }
	const [selectedData, setSelectedData] = useState({})
	const [selectedCollections, setSelectedCollections] = useState({})
	const handleCheckboxChange = (groupId, collectionId) => {
		setSelectedCollections((prev) => {
			const current = prev[groupId] || []

			if (current.includes(collectionId)) {
				return {
					...prev,
					[groupId]: current.filter((id) => id !== collectionId)
				}
			}

			return {
				...prev,
				[groupId]: [...current, collectionId]
			}
		})
	}
	const [isLoading, setIsLoading] = useState(true)
	const [fetchLoader, setFetchLoader] = useState(false)
	const [isCatalog, setIsCatalog] = useState(true)
	const [sortingBy, setSortingBy] = useState('')
	const [activeFilters, setActiveFilters] = useState({
		brands: [],
		categories: [],
		colorFamilies: [],
	})

	// --- Initial Data Fetch ---
	useEffect(() => {
		async function loadData() {
			try {
				setIsLoading(true)
				const [productsRes, storeRes] = await Promise.all([
					spiritHeroApi.getProducts(storeIdFromQuery),
					spiritHeroApi.getStore(storeIdFromQuery)
				])

				setCatalogGroups(productsRes.minimum_groups || [])
				setFiltersData(productsRes.filters)
				setMyStoreGroups(storeRes?.minimum_groups || [])
				dispatch(setMinimalGroups(storeRes?.minimum_groups || []))
				setIsCatalog(!storeRes.minimum_groups.length>0)
				// Авто-фільтрація по кольорах магазину
				if (storeRes.store?.color && productsRes.filters?.colorFamilies) {
					const storeColors = storeRes.store.color.map(c => c.toUpperCase())
					const matchingIds = productsRes.filters.colorFamilies
						.filter(f => storeColors.includes(f.product_color.toUpperCase()))
						.map(f => String(f.id))

					if (matchingIds.length > 0) {
						setActiveFilters(prev => ({ ...prev, colorFamilies: matchingIds }))
					}
				}
			} catch (e) {
				showToast('Failed to load data', 'error')
			} finally {
				setIsLoading(false)
			}
		}
		loadData()
	}, [storeIdFromQuery])


	useEffect(() => {
		let interval;
		let reloadTimeout;
		let successTimeout;
		let firstRequest = true;
		let wasProcessingBefore = false;

		const checkProcessing = async () => {
			try {
				const response = await spiritHeroApi.getCheckStoreImageProcessing(storeIdFromQuery);
				const isDone = response?.process?.status === 'done';

				// якщо перший запит і вже done -> просто завершити без повідомлень
				if (firstRequest && isDone) {
					setIsProcessingDesign(true);
					clearInterval(interval);
					firstRequest = false;
					return;
				}

				// якщо раніше був процесинг і тепер done
				if (!firstRequest && wasProcessingBefore && isDone) {
					setIsProcessingDesign(true);
					clearInterval(interval);
					setSuccessMessage(true);
					reloadTimeout = setTimeout(() => {
						window.location.reload();
					}, 2000);

					return;
				}

				// ще обробляється
				if (!isDone) {
					setIsProcessingDesign(false);
					wasProcessingBefore = true;
				}

				firstRequest = false;
			} catch (error) {
				clearInterval(interval);
				console.error(error);
			}
		};

		checkProcessing();

		interval = setInterval(checkProcessing, 15000);

		return () => {
			clearInterval(interval);
			clearTimeout(successTimeout);
			clearTimeout(reloadTimeout);
		};
	}, []);

	// --- Logic: Filtering & Sorting ---
	const currentGroups = isCatalog ? catalogGroups : myStoreGroups

	const processedGroups = useMemo(() => {
		const myStoreRegistry = new Set()
		if (isCatalog) {
			myStoreGroups.forEach(group => {
				group.products?.forEach(product => {
					myStoreRegistry.add(`${group.id}-${product.id}`)
				})
			})
		}
		return currentGroups
			.map(group => {
				console.log(`Group ID[${group.id}] Product`,group.products)
				console.log("colorFamilies",activeFilters.colorFamilies)

				let filteredProducts = (group.products || []).filter(product => {

					if (isCatalog && myStoreRegistry.has(`${group.id}-${product.id}`)) {
						return false
					}
					if (isFlashSale && !product.is_flash_sale_type) return false
					if (activeFilters.brands.length > 0 && !activeFilters.brands.includes(String(product.brand_id))) return false
					if (activeFilters.categories.length > 0 && !activeFilters.categories.includes(String(product.category_id))) return false
					if (activeFilters.colorFamilies.length > 0) {
						const productColors = product.colors?.map(c => String(c.parent_color_id)) || []
						console.log("productColors",productColors);
						if (!productColors.some(id => activeFilters.colorFamilies.includes(String(id)))) return false
					}
					return true
				})
				console.log(`Group ID[${group.id}] Filtered Product`,filteredProducts)

				if (sortingBy === 'expensive') filteredProducts.sort((a, b) => b.params.on_demand_price - a.params.on_demand_price)
				else if (sortingBy === 'cheap') filteredProducts.sort((a, b) => a.params.on_demand_price - b.params.on_demand_price)
				else if (sortingBy === 'name') filteredProducts.sort((a, b) => a.product_title.localeCompare(b.product_title))

				return { ...group, products: filteredProducts }
			})
			.filter(group => group.products.length > 0)
			.filter(group => isCatalog ? group.is_duplicate === 0 : true)
	}, [currentGroups, isFlashSale, activeFilters, sortingBy, isCatalog])

	// --- Counts ---
	/*const totalCatalogCount = useMemo(() =>
			catalogGroups.filter(g => g.is_duplicate === 0).reduce((acc, g) => acc + (g.products_count || 0), 0),
		[catalogGroups])*/
	const totalCatalogCount = useMemo(() => {
		const myStoreRegistry = new Set();


			myStoreGroups.forEach(group => {
				group.products?.forEach(product => {
					myStoreRegistry.add(`${group.id}-${product.id}`);
				});
			});

		return catalogGroups
			.filter(g => g.is_duplicate === 0)
			.flatMap(group =>
				group.products?.filter(product => {
					if (isFlashSale && !product.is_flash_sale_type) return false;

					return !(
						myStoreRegistry.has(`${group.id}-${product.id}`));
				}) || []
			)
			.length;
	}, [catalogGroups, myStoreGroups,isFlashSale]);
/*	const totalCatalogCount = useMemo(() => {
		// Якщо хочемо бачити кількість тільки тих, що залишилися в каталозі:
		return processedGroups.reduce((acc, g) => acc + g.products.length, 0)
	}, [processedGroups])*/
	const totalMyStoreCount = useMemo(() =>
			myStoreGroups.reduce((acc, g) => acc + (g.products_count || 0), 0),
		[myStoreGroups])

	const totalSelectedCount = useMemo(() =>
			Object.values(selectedData).reduce((acc, ids) => acc + ids.length, 0),
		[selectedData])

	// --- Handlers ---
	const toggleSelect = useCallback((productId, groupId) => {
		setSelectedData(prev => {
			const next = { ...prev }
			const gId = String(groupId)
			const pId = Number(productId)

			if (!next[gId]) {
				next[gId] = [pId]
			} else {
				next[gId] = next[gId].includes(pId)
					? next[gId].filter(id => id !== pId)
					: [...next[gId], pId]
				if (next[gId].length === 0) delete next[gId]
			}
			return next
		})
	}, [])

	const handleSelectAll = () => {
		const allVisibleProductsCount = processedGroups.reduce((acc, g) => acc + g.products.length, 0)

		if (totalSelectedCount === allVisibleProductsCount && allVisibleProductsCount > 0) {
			setSelectedData({})
		} else {
			const nextSelection = {}
			processedGroups.forEach(group => {
				nextSelection[String(group.id)] = group.products.map(p => p.id)
			})
			setSelectedData(nextSelection)
		}
	}

	const sendColorsToBackend = async (data) => {

		await spiritHeroApi.setColorsOfProductV2({
			store_id: Number(storeIdFromQuery),
			products: [data]
		})

		const updated = myStoreGroups.map((item) => {
			if (item.id === +data.group_id) {
				return {
					...item,
					products: item.products.map((product) => {
						if (product.id === +data.product_id) {
							const arr = [];

							for (const arrElement of product.colors) {
								if (data.color_id.includes(+arrElement.color_id)) {
									arr.push(arrElement);
								}
							}

							return {
								...product,
								choosed_colors: arr,
							};
						}

						return product;
					}),
				};
			}

			return item;
		});

		setMyStoreGroups(updated);

	}


	const addToStoreAction = async () => {

		const duplicatedGroups = {}

		Object.entries(selectedData).forEach(([groupId, productIds]) => {
			const existingGroup = catalogGroups?.find(
				(g) => Number(g.id) === Number(groupId)
			)

			if (!existingGroup) return

			const normalize = (str) =>
				str?.toLowerCase().replace(/\s+/g, ' ').trim()

			const normalizedExisting = normalize(existingGroup.name)

			// 🔥 беремо ВСІ includes (включаючи exact)
			const matches = myStoreGroups.filter((value) =>
				normalize(value.name).includes(normalizedExisting)
			)

			// 🔥 якщо тільки 1 і він exact → скіпаємо
			if (
				matches.length === 1 &&
				normalize(matches[0].name) === normalizedExisting
			) {
				return
			}

			// 🔥 якщо є хоч щось (2+ або 1 але не exact)
			if (matches.length > 0) {
				duplicatedGroups[groupId] = {
					groupName: existingGroup.name,
					productIds,
					matches: matches.map((item) => ({
						id: item.id,
						name: item.name
					}))
				}
			}
		})

		console.log("duplicatedGroups", duplicatedGroups)

		if (Object.keys(duplicatedGroups).length > 0) {
			setSelectedDuplicates(duplicatedGroups)
			setIsModalOpen(true)
			return
		}
		setFetchLoader(true)
		const groupsPayload = Object.entries(selectedData).map(([groupId, ids]) => ({
			group_id: Number(groupId),
			ids: ids
		}))
		const productsPayload = []

		console.log('activeFilters?.colorFamilies',activeFilters?.colorFamilies)
		Object.entries(selectedData).forEach(([groupId, productIds]) => {
			const group = currentGroups?.find(
				(g) => Number(g.id) === Number(groupId)
			)

			if (!group) return

			productIds.forEach((productId) => {
				const product = group.products?.find(
					(p) => Number(p.id) === Number(productId)
				)

				if (!product) return

				const colors = product.colors || []


				const filteredColorIds = colors
					.filter((color) => {
						const families = activeFilters?.colorFamilies

						if (!families || families.length === 0) {
							return true
						}

						return families.includes(	String(color.parent_color_id))
					})
					.map((color) => Number(color.color_id))

				productsPayload.push({
					product_id: Number(productId),
					group_id: Number(groupId),
					color_id: filteredColorIds
				})
			})
		})
		console.log('productsPayload',productsPayload)

		try {
			await spiritHeroApi.addToMyStoreProductsList({
				store_id: Number(storeIdFromQuery),
				groups: groupsPayload
			})
			await spiritHeroApi.setColorsOfProductV2({
				store_id: Number(storeIdFromQuery),
				products: productsPayload
			})
			const storeRes = await spiritHeroApi.getStore(storeIdFromQuery)
			setMyStoreGroups(storeRes?.minimum_groups || [])
			dispatch(setMinimalGroups(storeRes?.minimum_groups || []))

			setSelectedData({})
			setIsCatalog(false)
			showToast(`Items added to your store`)
		} catch (e) {
			showToast('Error adding products', 'error')
		} finally {
			setFetchLoader(false)
		}
	}
	const buildUpdatedSelectedData = (selectedData, selectedCollections) => {
		const result = {}

		Object.entries(selectedData).forEach(([groupId, productIds]) => {
			const targetGroupIds = selectedCollections[groupId]

			// якщо юзер нічого не вибрав → залишаємо як є
			if (!targetGroupIds || targetGroupIds.length === 0) {
				result[groupId] = productIds
				return
			}

			// 🔥 розкидаємо продукти по вибраних групах
			targetGroupIds.forEach((targetGroupId) => {
				if (!result[targetGroupId]) {
					result[targetGroupId] = []
				}

				result[targetGroupId].push(...productIds)
			})
		})

		return result
	}

	const deleteFromStoreAction = async () => {
		setFetchLoader(true)
		// Для видалення зазвичай бекенд приймає просто плоский масив ID або таку ж структуру
		const groupsPayload = Object.entries(selectedData).map(([groupId, ids]) => ({
			group_id: Number(groupId),
			ids: ids
		}))
		try {
			await spiritHeroApi.deleteFromMyStoreProducts({
				store_id: Number(storeIdFromQuery),
				groups: groupsPayload
			})
			const storeRes = await spiritHeroApi.getStore(storeIdFromQuery)
			setMyStoreGroups(storeRes?.minimum_groups || [])
			dispatch(setMinimalGroups(storeRes?.minimum_groups || []))

			const countNew = storeRes?.minimum_groups.reduce((acc, g) => acc + (g.products_count || 0), 0)

			setSelectedData({})
			console.log('COUNT',countNew)
			if(countNew === 0){
				setIsCatalog(true)
			}
			showToast(`Items removed`)
		} catch (e) {
			showToast('Error removing products', 'error')
		} finally {
			setFetchLoader(false)
		}
	}

	if (isLoading) return <Loader />

	return (
		<div className={css['products__section']}>
			<div className={css['products__catalog--pickers']}>
				<button
					className={isCatalog ? css['products__catalog--picker__active'] : css['products__catalog--picker']}
					onClick={() => { setIsCatalog(true); setSelectedData({});setActiveFilters({brands: [],
						categories: [],
						colorFamilies: [],}) }}
				>
					<span className={css.icon}><Check /></span>
					Product catalog <span className={css.count}>{totalCatalogCount}</span>
				</button>
				<button
					className={!isCatalog ? css['products__catalog--picker__active'] : css['products__catalog--picker']}
					onClick={() => { setIsCatalog(false); setSelectedData({});setActiveFilters({brands: [],
						categories: [],
						colorFamilies: [],}) }}
				>
					<span className={css.icon}><Check /></span>
					My Store <span className={css.count}>{totalMyStoreCount}</span>
				</button>
			</div>

			<div className={css['products__catalog--top']}>
				<div className={css.sorting__wrap}>
					<select onChange={(e) => setSortingBy(e.target.value)} className={css.sorting__select} value={sortingBy}>
						<option value="">Recommended</option>
						<option value="expensive">From expensive to cheap</option>
						<option value="cheap">From cheap to expensive</option>
						<option value="name">Name</option>
					</select>
				</div>

				{totalSelectedCount > 0 && <h3 className={css['products__catalog--top__label']}>Selected {totalSelectedCount} products</h3>}

				<div className={css['buttons__box']}>
					{!isProcessingDesign && (
						<div className={css['processing_text']}>
							Please wait a moment. The logos are being applied.
							<span className={css['spinner']}></span>
						</div>
					)}

					{successMessage && (
						<div className={css['processing_text']}>
							The logos have been successfully applied.
						</div>
					)}
					<button className="light_button_1" onClick={handleSelectAll}>Select All</button>
					{isCatalog ? (
						<button className="contrast_button_1" onClick={addToStoreAction} disabled={totalSelectedCount === 0}>
							<Lightning /> Add to my store
						</button>
					) : (
						<button className="light_button_2" onClick={deleteFromStoreAction} disabled={totalSelectedCount === 0}>
							Delete
						</button>
					)}
				</div>
			</div>

			<div className={css.products__handle}>
				{fetchLoader && <div className={css.local_loader}></div>}

				<div className={css.products_filters}>
					{filtersData && Object.keys(filtersData).map(key => (
						key !== 'sizes' && (
							<Filters
								key={key}
								keyName={key}
								filterName={key}
								category={filtersData[key]}
								setActiveFilters={setActiveFilters}
								checkedFilters={activeFilters[key]}
								products={currentGroups.flatMap(g => g.products || [])}
								open={key === 'colorFamilies'}
								isCatalog={isCatalog}
							/>
						)
					))}
				</div>

				<div className={css.products__groups__list}>
					{processedGroups.map(group => {
						const groupIdStr = String(group.id);
						return (
							<ProductDetailsNew
								key={groupIdStr}
								minimalGroup={group}
								products={group.products.map(p => ({
									...p,
									selected: (selectedData[groupIdStr] || []).includes(p.id)
								}))}
								isFlashSale={isFlashSale}
								cardClickHandle={(e) => toggleSelect(e.currentTarget.value, group.id)}
								onGroupCheckHandle={(checked) => {
									setSelectedData(prev => {
										const next = { ...prev }
										if (checked) {
											next[groupIdStr] = group.products.map(p => p.id)
										} else {
											delete next[groupIdStr]
										}
										return next
									})
								}}
								activeColors={activeFilters.colorFamilies}
								isCatalog={isCatalog}
								sendColorsToBackend={sendColorsToBackend}
							/>
						)
					})}
					{processedGroups.length === 0 && <p className={css.no_products}>No products found.</p>}
				</div>
			</div>
			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				className={'validation--modal'}
			>
				<div className={cssModal.modal__content}>
					<h3 className={cssModal.title}>
						Which collections should we add products to?
					</h3>

					{Object.entries(selectedDuplicates).map(([groupId, groupData]) => (
						<div key={groupId} className={cssModal.group__block}>
							<p className={cssModal.group__title}>
								{groupData.productIds
									.map((productId) => {
										const product = catalogGroups
											.flatMap((g) => g.products || [])
											.find((p) => Number(p.id) === Number(productId))

										return product?.product_title
									})
									.filter(Boolean)
									.join(', ')
								}
							</p>

							<fieldset className={cssModal.fieldset}>
								{groupData.matches.map((item) => (
									<label className={cssModal.label} key={item.id}>
							<span className={cssModal.checkbox__emulator}>
								<Icon name={'InputChecked'} />
							</span>

										{item.name}

										<input
											type="checkbox"
											name="modal-select"
											className="visually-hidden"
											checked={
												selectedCollections[groupId]?.includes(item.id) || false
											}
											onChange={() =>
												handleCheckboxChange(groupId, item.id)
											}
										/>
									</label>
								))}
							</fieldset>
						</div>
					))}

					<div className={cssModal.button__box}>
						<button
							onClick={() => setIsModalOpen(false)}
							className="light_button_1"
						>
							Cancel
						</button>

						<button
							onClick={async () => {
								const updatedSelectedData = buildUpdatedSelectedData(
									selectedData,
									selectedCollections
								)

								console.log('updatedSelectedData', updatedSelectedData)

								// 🔥 ДАЛІ ВСТАВЛЯЄШ СВІЙ КОД
								//setFetchLoader(true)

								const groupsPayload = Object.entries(updatedSelectedData).map(
									([groupId, ids]) => ({
										group_id: Number(groupId),
										ids: ids
									})
								)
								console.log('groupsPayload', groupsPayload)


								const productsPayload = []

								Object.entries(updatedSelectedData).forEach(([groupId, productIds]) => {
									const group = currentGroups?.find(
										(g) => Number(g.id) === Number(groupId)
									)
									if (!group) return
									productIds.forEach((productId) => {
										const product = group.products?.find(
											(p) => Number(p.id) === Number(productId)
										)

										if (!product) return

										const colors = product.colors || []

										const filteredColorIds = colors
											.filter((color) => {
												const families = activeFilters?.colorFamilies

												if (!families || families.length === 0) {
													return true
												}

												return families.includes(String(color.parent_color_id))
											})
											.map((color) => Number(color.color_id))

										productsPayload.push({
											product_id: Number(productId),
											group_id: Number(groupId),
											color_id: filteredColorIds
										})
									})
								})

								console.log('productsPayload', productsPayload)

								try {
									await spiritHeroApi.addToMyStoreProductsList({
										store_id: Number(storeIdFromQuery),
										groups: groupsPayload
									})

									if(productsPayload.length > 0){
										await spiritHeroApi.setColorsOfProductV2({
											store_id: Number(storeIdFromQuery),
											products: productsPayload
										})
									}

									const storeRes = await spiritHeroApi.getStore(storeIdFromQuery)

									setMyStoreGroups(storeRes?.minimum_groups || [])
									dispatch(setMinimalGroups(storeRes?.minimum_groups || []))

									setSelectedData({})
									setIsCatalog(false)
									setIsModalOpen(false)

									showToast(`Items added to your store`)
								} catch (e) {
									showToast('Error adding products', 'error')
								} finally {
									setFetchLoader(false)
								}
							}}
							disabled={
								Object.keys(selectedDuplicates).some(
									(groupId) =>
										!selectedCollections[groupId] ||
										selectedCollections[groupId].length === 0
								)
							}
							className="contrast_button_1"
						>
							Apply
						</button>
					</div>
				</div>
			</Modal>
		</div>
	)
}
