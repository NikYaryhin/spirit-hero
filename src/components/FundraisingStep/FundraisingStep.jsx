import { useEffect, useState } from 'react'
import css from './FundraisingStep.module.css'
import Loader from '../Loader/Loader'
import spiritHeroApi from '@/api/spiritHeroApi'
import FundraisingCategoryDetails from '../FundraisingCategoryDetails/FundraisingCategoryDetails'

export default function FundraisingStep() {
	const [isLoading, setIsLoading] = useState(true)
	const [productsByCategory, setProductsByCategory] = useState(null)

	useEffect(() => {
		const fetchStoreData = async () => {
			try {
				const res = await spiritHeroApi.getStore(
					+localStorage.getItem('storeId'),
				)

				const sortedProducts = res.products.reduce((acc, product, idx) => {
					acc[product.category_id] = [
						...(acc[product.category_id] || []),
						product,
					]
					return acc
				}, {})

				console.log({ sortedProducts })

				setProductsByCategory(sortedProducts)
				setIsLoading(false)
			} catch (error) {
				console.error(`spiritHeroApi.getStore error`, error)
			}
		}
		fetchStoreData()
	}, [])

	if (isLoading) return <Loader />
	else
		return (
			<section className={css.fundraising__section}>
				<div className={css.products__handle}>
					<div className={css.products__container}>
						<div className={css.products__categories}>
							{productsByCategory &&
								Object.keys(productsByCategory).map((key, keyIdx) => (
									<FundraisingCategoryDetails
										key={key}
										keyIdx={keyIdx}
										categoryKey={key}
										productsByCategory={productsByCategory}
									/>
								))}
						</div>
					</div>
				</div>

				<aside className={css.handles}></aside>
			</section>
		)
}
