import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { setActiveStep } from '@/features/navigation/navigationSlice'
import { setFlashSale } from '@/features/flashSale/flashSaleSlice'
import Icon from '../Icon'
import css from './ProductStepValidationModal.module.css'

export default function ProductStepValidationModal({ setIsModalOpen }) {
	const isFlashSale = useSelector((state) => state.flashSale.isFlashSale)
	const [isStendart, setIsStendart] = useState(true)
	const [isApprove, setIsApprove] = useState(false)

	const dispatch = useDispatch()

	const onConfitmButtonClick = () => {
		setIsModalOpen(false)
		dispatch(setActiveStep(3))
	}

	const onStartFlashSaleClick = () => {
		dispatch(setFlashSale(true))
		setIsModalOpen(false)
		dispatch(setActiveStep(3))
	}

	return (
		<div className={css.modal__content}>
			{isFlashSale ? (
				<>
					<h3 className={css.title}>
						Great! You have added flash sale collections to your store!
						<br />
						Please select collection do you want to run a flash sale?
					</h3>

					<fieldset className={css.fieldset}>
						<label className={css.label}>
							<span className={css.checkbox__emulator}>
								<Icon name={'InputChecked'} />
							</span>
							Standard Collection (36-piece minimum)
							<input
								type="radio"
								name="modal-select"
								value={'standart'}
								className="visually-hidden"
								checked={isStendart}
								onChange={() => setIsStendart(true)}
							/>
						</label>
						<label className={css.label}>
							<span className={css.checkbox__emulator}>
								<Icon name={'InputChecked'} />
							</span>
							Pants/Bottoms (36-piece minimum)
							<input
								type="radio"
								name="modal-select"
								value={'pants/bottom'}
								className="visually-hidden"
								checked={!isStendart}
								onChange={() => setIsStendart(false)}
							/>
						</label>
					</fieldset>

					<div className={css.text__wrap}>
						If the minimums aren't met, you can either:
						<p className={css.text}>
							<span>1. Extend the store to sell more items.</span>
							<span>
								2. Purchase the remaining items to meet the minimum for each
								group.
							</span>
						</p>
						<p className={css.text}>
							<span>Orders will not be canceled or refunded.</span>
							<span>Flash sale pricing is based on the # of ink colors.</span>
							<span>$1 will be added for each additional ink color</span>
						</p>
					</div>

					<strong className={css.link__label}>
						Required Minimum: 36 items mix/match
					</strong>
					<Link to="#" className={css.link} target="blank">
						View minimum guide here
					</Link>

					<label className={css.checkbox__label}>
						<span className={css.checkbox__emulator}>
							<Icon name={'InputChecked'} />
						</span>
						I agree with the minimum order requirements for each product group
						<input
							type="checkbox"
							name="modal-approve"
							className="visually-hidden"
							checked={isApprove}
							onChange={(e) => setIsApprove(e.currentTarget.checked)}
						/>
					</label>

					<div className={css.button__box}>
						<button
							onClick={() => setIsModalOpen(false)}
							className={`${css.back} light_button_1`}
						>
							Back
						</button>
						<button
							onClick={onConfitmButtonClick}
							disabled={!isApprove}
							className={`${css.confirm} contrast_button_1`}
						>
							Yes, confirm
						</button>
					</div>
				</>
			) : (
				<>
					<h3 className={css.title}>
						Maybe you would like to start flash sale?
					</h3>
					<p className={css.text__wrap}>
						Flash Sales are a great way to promote certain items in your store.
						Just keep in mind there is a minimum requirement for each flash
						sale.
					</p>

					<div className={css.features__box}>
						<div className={css.features}>
							Flash Sale Pro
							<ul className={css.features__list}>
								<li className={css.approve}>Free shipping in 1 location</li>
								<li className={css.approve}>Lower Price</li>
							</ul>
						</div>

						<div className={css.features}>
							Flash Sale Cons
							<ul className={css.features__list}>
								<li className={css.disapprove}>Minimums</li>
								<li className={css.disapprove}>
									Could get stuck with an invoice
								</li>
								<li className={css.disapprove}>Limited Group Order</li>
							</ul>
						</div>

						<strong className={css.link__label}>
							Required Minimum: 36 items mix/match
						</strong>
						<Link to="#" className={css.link} target="blank">
							View minimum guide here
						</Link>
					</div>

					<label className={css.checkbox__label}>
						<span className={css.checkbox__emulator}>
							<Icon name={'InputChecked'} />
						</span>
						I agree with the minimum order requirements for each product group
						<input
							type="checkbox"
							name="modal-approve"
							className="visually-hidden"
							checked={isApprove}
							onChange={(e) => setIsApprove(e.currentTarget.checked)}
						/>
					</label>

					<div className={css.button__box}>
						<button
							onClick={() => setIsModalOpen(false)}
							className={css.not__sure}
						>
							Not, sure show me the pricing
						</button>

						<button
							onClick={onConfitmButtonClick}
							disabled={!isApprove}
							className={`${css.later} light_button_1`}
						>
							Maybe Later
						</button>
						<button
							onClick={onStartFlashSaleClick}
							disabled={!isApprove}
							className={`${css.confirm} contrast_button_1`}
						>
							Yes, Start Flash Sale
						</button>
					</div>
				</>
			)}
		</div>
	)
}
