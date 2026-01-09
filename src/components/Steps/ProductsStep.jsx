import css from './ProductsStep.module.css'
import Lightning from '../Icons/Lightning'
import ProductsSection from '../Products/ProductsSection'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setFlashSale } from '../../features/flashSale/flashSaleSlice'
import Icon from '../Icon'
import Modal from '../Modal/Modal'
import InkModal from '../InkModal/InkModal'
import spiritHeroApi from '@/api/spiritHeroApi'

export default function ProductsStep() {
	const dispatch = useDispatch()
	const storeId = useSelector((state) => state.flashSale.storeId)
	const isFlashSale = useSelector((state) => state.flashSale.isFlashSale)
	const [isModalOpen, setIsModalOpen] = useState(false)

	const flashSaleInputHandle = (event) => {
		const { checked } = event.currentTarget
		dispatch(setFlashSale(checked))

		console.debug({ storeId, is_flash_sale: checked })

		if (storeId)
			spiritHeroApi.updateStore({ is_flash_sale: checked, store_id: storeId })
	}

	return (
		<section>
			<div className={css.products_head}>
				<h2 className={css.products_title}>Select your products</h2>

				{isFlashSale && (
					<div className={css.alert}>
						<Icon name="Danger" />
						<p>
							Flash Sales include 1 ink color (screen printed). Want more? Just
							$1 per color. Our team will review your store to ensure everything
							looks great!
						</p>
					</div>
				)}

				<div className={css.products_info}>
					<div className={css['info--checkbox__wrapper']}>
						<Lightning />

						<span>Flash SALE Price</span>

						<label className={css['info--checkbox__label']}>
							<span className={css['info--checkbox__emulator']}></span>
							<input
								type="checkbox"
								className="visually-hidden"
								onChange={flashSaleInputHandle}
								checked={isFlashSale}
							/>
						</label>
					</div>

					{!isFlashSale ? (
						<ul className={css.features__list}>
							<li>Limited-time group order</li>
							<li>Lower price</li>
							<li>36 apparels minimum</li>
							<li>FREE ship for 1 place</li>
							<li>Only 1 logo</li>
							<li>2-3 weeks timeframe</li>
							<li>
								Arrive sorted, labeled, bagged by student name/teacher name
								(sort list)
							</li>
						</ul>
					) : (
						<button
							onClick={() => {
								setIsModalOpen(true)
							}}
							className={css.back_to_colors}
						>
							<Icon name="Inks" /> Edit # of Ink Colors
						</button>
					)}
				</div>
			</div>

			<ProductsSection isFlashSale={isFlashSale} />

			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
				<InkModal storeId={storeId} />
			</Modal>
		</section>
	)
}
