import { useEffect, useState } from 'react'
import spiritHeroApi from '@/api/spiritHeroApi'
import css from './ProductsSection.module.css'
import Check from '../Icons/Check'
import Lightning from '../Icons/Lightning'
import ProductCard from '../ProductCard/ProductCard'
import Icon from '../Icon'

export default function ProductsSection() {
	const [isCatalog, setIsCatalog] = useState(true)
	const [catalogProducts, setCatalogProducts] = useState(null)
	const [selectedProducts, setSelectedProducts] = useState([])
	const [categories, setCategories] = useState(null)

	useEffect(() => {
		const getProducts = async () => {
			try {
				if (!localStorage.getItem('access_token')) {
					const loginRes = await spiritHeroApi.login('admin@gmail.com', '12345678')
					console.log('loginRes', loginRes)
				}
				const res = await spiritHeroApi.getProducts()
				console.log('res', res)

				setCatalogProducts(res.products)
				setCategories(res.categories)
			} catch (error) {
				console.error(error)
			}
		}
		getProducts()
	}, [])

	const onCatalogCardClick = (event) => {
		const { value } = event.currentTarget

		setCatalogProducts((prev) => {
			const product = prev.find((product) => String(product.id) === value)

			setSelectedProducts((selPrev) => {
				const exists = selPrev.some((product) => String(product.id) === value)
				return exists ? selPrev : [...selPrev, product]
			})

			return prev.filter((product) => String(product.id) !== value)
		})
	}

	const onSelectedCardClick = (event) => {
		const { value } = event.currentTarget

		setSelectedProducts((prev) => {
			const product = prev.find((product) => String(product.id) === value)

			setCatalogProducts((selPrev) => {
				const exists = selPrev.some((product) => String(product.id) === value)
				return exists ? selPrev : selPrev.unshift(product)
			})

			return prev.filter((product) => String(product.id) !== value)
		})
	}

	const addToStoreButtonHandle = (event) => {
		const selectedInputs = document.querySelectorAll('input[data-collection="catalog"]:checked')

		const selectedProductsIdArr = [...selectedInputs].map((input) => {
			const { value } = input

			setCatalogProducts((prev) => {
				const product = prev.find((product) => String(product.id) === value)

				setSelectedProducts((selPrev) => {
					const exists = selPrev.some((product) => String(product.id) === value)
					return exists ? selPrev : [...selPrev, product]
				})

				return prev.filter((product) => String(product.id) !== value)
			})
		})
	}

	return (
		<div className={css['products__section']}>
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
					<span className={css.count}>{selectedProducts?.length || 0}</span>
				</button>
			</div>

			<div className={css['products__catalog--top']}>
				<div>
					<span>Sort by</span>

					<select name="select" id="">
						<option value="Recommended">Recommended</option>
					</select>
				</div>

				<h3 className={css['products__catalog--top__label']}>
					You have selected {selectedProducts?.length || 0} product
					{selectedProducts?.length === 1 ? '' : 's'}
				</h3>

				<div className={css['buttons__box']}>
					<button className={`${css.select_all} light_button_1`}>Select All</button>
					<button
						className={`${css.add_to_store} contrast_button_1`}
						onClick={addToStoreButtonHandle}
					>
						<Lightning />
						Add to my store
					</button>
				</div>
			</div>

			<div className={css.products__handle}>
				<div className={css.products_filters}>
					{categories && (
						<details className={css['products_filter-group']} open>
							<summary>
								Categories <Icon name="ChevronUp" />
							</summary>

							<ul className={css.filters__list}>
								{categories.map(({ category, id }) => (
									<li key={id}>
										<label className={css.category__label}>
											<span className={css.checkbox__emulator}>
												<svg
													width="18"
													height="13"
													viewBox="0 0 18 13"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														d="M1 7.1875L5.86957 12L17 1"
														stroke="#4E008E"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
													/>
												</svg>
											</span>
											<span className={css.category__name}>{category}</span>
											<input type="checkbox" className="visually-hidden" value={id} />
										</label>
									</li>
								))}
							</ul>
						</details>
					)}
				</div>

				<ul className={css.products__list}>
					{catalogProducts &&
						isCatalog &&
						catalogProducts.map(({ id, product_title, product_image }) => (
							<ProductCard key={id} id={id} name={product_title} image={product_image} />
						))}

					{selectedProducts &&
						!isCatalog &&
						selectedProducts.map(({ id, product_title, product_image }) => (
							<ProductCard
								key={id}
								id={id}
								name={product_title}
								image={product_image}
								isSelected={true}
							/>
						))}
				</ul>
			</div>
		</div>
	)
}
