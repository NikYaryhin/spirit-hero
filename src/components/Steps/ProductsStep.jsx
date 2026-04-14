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
import ProductsSectionNew from '@components/Products/ProductsSectionNew'
import CheckIcon from '../../assets/information_5226555.png'

export default function ProductsStep() {
	const dispatch = useDispatch()
	const storeId = useSelector((state) => state.flashSale.storeId)
	const isFlashSale = useSelector((state) => state.flashSale.isFlashSale)
	const [isModalOpen, setIsModalOpen] = useState(false)

	const flashSaleInputHandle = (event) => {
		const { checked } = event.currentTarget
		dispatch(setFlashSale(checked))

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
						<div className={css['tooltip']}>

							<img
								src={CheckIcon}
								className={css['tooltip__icon']}
								alt="selected"
							/>
							<div className={css['tooltip__content']}>
								<ul>
									<li>Limited-time 2–3 week group order</li>
									<li>Lower prices</li>
									<li>FREE shipping to 1 location</li>
									<li>Orders arrive sorted / labeled / bagged</li>
									<li>Option to convert to on-demand once the flash sale ends</li>
									<li>Has minimums</li>
								</ul>
							</div>
						</div>

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

					{!isFlashSale  && (
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



			<ProductsSectionNew isFlashSale={isFlashSale} storeIdFromQuery={storeId} />


{/*
			<ProductsSection isFlashSale={isFlashSale}/>
*/}

			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
				<InkModal storeId={storeId} onClose={() => setIsModalOpen(false)} />
			</Modal>
		</section>
	)
}
