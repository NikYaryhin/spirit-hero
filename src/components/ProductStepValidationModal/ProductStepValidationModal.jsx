import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector,useDispatch } from 'react-redux'
import { setActiveStep } from '@/features/navigation/navigationSlice'
import { setFlashSale,setCustomerApproveFlashSale } from '@/features/flashSale/flashSaleSlice'
import Icon from '../Icon'
import css from './ProductStepValidationModal.module.css'
import spiritHeroApi from '@api/spiritHeroApi'
import { showToast } from '@/helpers/toastCall'
import Loader from '@components/Loader/Loader'

export default function ProductStepValidationModal({ setIsModalOpen }) {
	const isFlashSale = useSelector((state) => state.flashSale.isFlashSale)
	const [choosedCollection, setChoosedCollection] = useState([])
	const [isApprove, setIsApprove] = useState(false)
	const params = new URLSearchParams(window.location.search)
	const storeIdFromQuery = params.get('store_id')
	const storeId = useSelector((state) => state.flashSale.storeId) || storeIdFromQuery
	const dispatch = useDispatch()
	const [isLoadingGroups, setIsLoadingGroups] = useState(false)
	// const productsByCategory = useSelector((state) => state.products.productsByCategory)
	const minimalGroups = useSelector((state) => state.products.minimalGroups)
	const myShopProducts = useSelector((state) => state.products.myShopProducts)
	const [myStoreGroups, setMyStoreGroups] = useState([])


	const [showFlashSaleWarning, setShowFlashSaleWarning] = useState(false)
	const [storeGroupsToDelete, setStoreGroupsToDelete] = useState([])
	const [fetchLoader, setFetchLoader] = useState(false)

	useEffect(() => {
		async function loadData() {
			try {
				setIsLoadingGroups(true)
				const [storeRes] = await Promise.all([
					spiritHeroApi.getStore(storeId)
				])

				//setMyStoreGroups(storeRes?.minimum_groups || [])

			} catch (e) {
				showToast('Failed to load data', 'error')
			}finally {
				setIsLoadingGroups(false)
			}
		}
		if(!isFlashSale){
			loadData()
		}

	}, [storeId])

	const minimalGroupsInStore = useMemo(() => {
		if (!Array.isArray(minimalGroups) || minimalGroups.length < 1) return []
	/*	if (!Array.isArray(myShopProducts) || myShopProducts.length < 1) return []

		const storeProductIds = new Set(myShopProducts.map((product) => String(product?.id)))

		return minimalGroups.filter((group) =>
			Array.isArray(group?.products) &&
			group.products.some((product) => storeProductIds.has(String(product?.id))),
		)*/
		return minimalGroups
	}, [minimalGroups])


	/*const onConfitmButtonClick = () => {
		setIsModalOpen(false)
		dispatch(setCustomerApproveFlashSale(true))
		dispatch(setActiveStep(3))
	}*/

	const onConfitmButtonClick = async () => {
		if (!isFlashSale) {
			try {
				setFetchLoader(true)

				const storeRes = await spiritHeroApi.getStore(storeId)

				const flashSaleGroups =
					storeRes?.minimum_groups?.filter(
						(group) => Number(group.type_id) === 1
					) || []

				if (flashSaleGroups.length > 0) {
					setStoreGroupsToDelete(flashSaleGroups)
					setShowFlashSaleWarning(true)
					return
				}
			} catch (e) {
				showToast('Failed to validate store', 'error')
				return
			} finally {
				setFetchLoader(false)
			}
		}

		setIsModalOpen(false)
		dispatch(setCustomerApproveFlashSale(true))
		dispatch(setActiveStep(3))
	}
	const onStartFlashSaleClick = () => {
		dispatch(setFlashSale(true))
		dispatch(setCustomerApproveFlashSale(true))
		setIsModalOpen(false)
		// dispatch(setActiveStep(3))
	}

	const handleCollectionChange = (e) => {
		const { value, checked } = e.target
		console.log(value)
		console.log(checked)

		console.log(choosedCollection)

		setChoosedCollection((prev) => checked ? [...prev, value] : prev.filter((item) => item !== value))
	}
	const deleteFlashSaleProducts = async () => {
		try {
			setFetchLoader(true)

			const groupsPayload = storeGroupsToDelete.map((group) => ({
				group_id: Number(group.id),
				ids:
					group.products?.map((p) => p.id) ||
					group.product_ids ||
					[]
			}))

			await spiritHeroApi.deleteFromMyStoreProducts({
				store_id: Number(storeIdFromQuery),
				groups: groupsPayload
			})

			showToast('Flash sale products removed')

			setIsModalOpen(false)
			dispatch(setActiveStep(3))

		} catch (e) {
			console.log(e)
			showToast('Error removing products', 'error')
		} finally {
			setFetchLoader(false)
		}
	}

	if (showFlashSaleWarning) {
		return (
			<div className={css.modal__content}>
				<h3 className={css.title}>
					Your store contains Flash Sale products
				</h3>

				<p className={css.text__wrap}>
					Please enable Flash Sale or remove these products.
				</p>

				<div className={css.button__box}>
					<button
						onClick={() => {
							setShowFlashSaleWarning(false)
							setIsModalOpen(false)
						}
						}
						className="light_button_1"
					>
						Back
					</button>

					<button
						onClick={deleteFlashSaleProducts}
						disabled={fetchLoader}
						className="contrast_button_1"
					>
						{fetchLoader ? 'Removing...' : 'Remove products'}
					</button>
				</div>
			</div>
		)
	}
	return (
		<div className={css.modal__content}>
			{isFlashSale ? (
				/*<>
					<h3 className={css.title}>
						Great choice! Flash sales give you the best pricing and a simple, streamlined ordering experience.
						<br />
						To get started, please confirm your flash sale details below:
					</h3>


					<fieldset className={css.fieldset}>
						{isLoadingGroups ? (
							<Loader/>
						) : minimalGroupsInStore.length > 0 ? (
							minimalGroupsInStore.map((item) => (
								<label className={css.label} key={item.id || item.name}>
				<span className={css.checkbox__emulator}>
					<Icon name={'InputChecked'} />
				</span>
									{item.name}

									<input
										type="checkbox"
										name="modal-select"
										value={item.name}
										className="visually-hidden"
										onChange={handleCollectionChange}
										checked={choosedCollection.includes(item.name)}
									/>
								</label>
							))
						) : (
							<div className={css.empty}>No collections found</div>
						)}
					</fieldset>
					<strong className={css.link__label}>
						Minimum Requirement: 36 items (mix & match allowed)
					</strong>
					<Link to="https://spirithero.com/pages/minimums-for-group-orders" className={css.link} target="blank">
						View Minimum Guide
					</Link>

					<div className={css.text__wrap_new}>
						If minimums are not met, you have two options:
						<ul className={css.text_new}>
							<li>Extend your store to allow more time for orders</li>
							<li>Purchase the remaining quantity to reach the minimum.</li>
						</ul>
					</div>

					<div className={css.text__wrap_new}>
						<strong>Important Notes:</strong>

						<ul className={css.text_new}>
							<li>Orders are custom-made and cannot be canceled or refunded</li>
							<li>Flash sale pricing is based on the number of ink colors</li>
							<li>$1 will be added for each additional ink color</li>
						</ul>
					</div>


					<label className={css.checkbox__label}>
						<span className={css.checkbox__emulator}>
							<Icon name={'InputChecked'} />
						</span>
						I agree to the minimum order requirements for each product group
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
							disabled={!isApprove || choosedCollection.length < 1}
							className={`${css.confirm} contrast_button_1`}
						>
							Yes, confirm
						</button>
					</div>
				</>*/
				<>
					{/* Шапка модалки */}
				{/*	<div className={css.header_v2}>
						<span className={css.badge_v2}>Success</span>
						<button onClick={() => setIsModalOpen(false)} className={css.close_btn_v2} aria-label="Close">
							✕
						</button>
					</div>*/}

					<h3 className={css.title_v2}>
						Great! You have added flash sale collections to your store.
						<span className={css.subtitle_v2}>Please select the collection you want to run a flash sale for.</span>
					</h3>

					{/* Селектор колекцій */}
					<fieldset className={css.fieldset_v2}>
						{isLoadingGroups ? (
							<Loader />
						) : minimalGroupsInStore.length > 0 ? (
							minimalGroupsInStore.map((item) => (
								<label className={css.label_v2} key={item.id || item.name}>
									<input
										type="checkbox"
										name="modal-select"
										value={item.id}
										className="visually-hidden"
										onChange={handleCollectionChange}
										checked={choosedCollection.includes(String(item.id))}
									/>
									<span className={css.checkbox__emulator_v2}>
            <Icon name={'InputChecked2'} />
          </span>
									{item.name}
								</label>
							))
						) : (
							<div className={css.empty_v2}>No collections found</div>
						)}
					</fieldset>

					{/* Політика та інформаційні картки */}
					<div className={css.policy_section_v2}>
						<h4 className={css.policy_title_v2}>Minimum Requirements Policy</h4>
						<p className={css.policy_subtitle_v2}>If the minimums aren't met, you can choose one of the following options:</p>

						<ol className={css.numbered_list_v2}>
							<li>
								<span className={css.list_number_v2}>1</span>
								Extend the store duration to allow for more sales.
							</li>
							<li>
								<span className={css.list_number_v2}>2</span>
								Purchase the remaining items to meet the minimum for each group.
							</li>
						</ol>
					</div>

					{/* Дві картки поруч */}
					<div className={css.cards_container_v2}>
						{/* Ліва картка (Важливо) */}
						<div className={css.notice_card_v2}>
							<h5 className={css.card_title_v2}>
								<span className={css.info_icon_v2}>i</span> Important Notice
							</h5>
							<ul className={css.bullet_list_v2}>
								<li>Orders will not be canceled or refunded.</li>
								<li>Flash sale pricing is based on the number of ink colors.</li>
								<li>$1 will be added for each additional ink color.</li>
							</ul>
						</div>

						{/* Права картка (Мінімуми) */}
						<div className={css.minimum_card_v2}>
							<span className={css.min_label_v2}>Required Minimum</span>
							<div className={css.min_count_v2}>
								36 <span className={css.min_text_v2}>items</span>
							</div>
							<div className={css.mix_match_v2}>mix/match</div>
							<Link to="https://spirithero.com/pages/minimums-for-group-orders" className={css.link_v2} target="_blank">
								View minimum guide here
							</Link>
						</div>
					</div>

					{/* Чекбокс згоди */}
					<label className={css.checkbox__label_v2}>
						<input
							type="checkbox"
							name="modal-approve"
							className="visually-hidden"
							checked={isApprove}
							onChange={(e) => setIsApprove(e.currentTarget.checked)}
						/>
						<span className={css.checkbox__emulator_v2}>
      <Icon name={'InputChecked2'} />
    </span>
						I agree with the minimum order requirements for each product group
					</label>

					{/* Кнопки дії */}
					<div className={css.button__box_v2}>
						<button
							onClick={() => setIsModalOpen(false)}
							className={`${css.back_v2} light_button_1`}
						>
							Back
						</button>
						<button
							onClick={onConfitmButtonClick}
							disabled={!isApprove || choosedCollection.length < 1}
							className={`${css.confirm_v2} contrast_button_1`}
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
						<Link to="https://spirithero.com/pages/minimums-for-group-orders" className={css.link} target="blank">
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
							onClick={() => {
								setIsModalOpen(false)
								dispatch(setFlashSale(true))
							}}
							className={css.not__sure}
						>
							Not, sure show me the pricing
						</button>

						<button
							onClick={onConfitmButtonClick}
							// disabled={!isApprove}
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
