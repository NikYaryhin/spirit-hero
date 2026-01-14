import { useEffect, useState } from 'react'
import Icon from '../Icon'
import css from './FundraisingNextStepModal.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { setActiveStep } from '@/features/navigation/navigationSlice'
import spiritHeroApi from '@/api/spiritHeroApi'

export default function FundraisingNextStepModal({ closeModal }) {
	const dispatch = useDispatch()

	const storeInfo = useSelector((state) => state.flashSale.storeInfo)
	const storeId = useSelector((state) => state.flashSale.storeId)
	const [isCheck, setIsCheck] = useState(false)
	const [checkData, setCheckData] = useState({
		type_id: 1,
		payment_name: '',
		first_name: '',
		last_name: '',
		organization_name: '',
		address_1: '',
		address_2: '',
		city: '',
		state: '',
		zip_code: '',
	})
	const [achData, setAchData] = useState({
		bank_name: '',
		routing_number: '',
		account_number: '',
	})

	useEffect(() => {
		if (storeInfo.store?.receiveFunds) {
			const {
				type_id,
				payment_name,
				first_name,
				last_name,
				organization_name,
				address_1,
				address_2,
				city,
				state,
				zip_code,
			} = storeInfo.store.receiveFunds

			setCheckData({
				type_id,
				payment_name,
				first_name,
				last_name,
				organization_name,
				address_1,
				address_2,
				city,
				state,
				zip_code,
			})
		}
		if (storeInfo.store?.receiveFundsAch) {
			const { account_number, routing_number, bank_name } =
				storeInfo.store.receiveFundsAch
			setAchData({ account_number, routing_number, bank_name })
		}
	}, [])

	const onRadioChange = () => {
		setIsCheck(!isCheck)
	}

	const onFormSubmit = async (e) => {
		e.preventDefault()

		try {
			let response
			if (isCheck) {
				const payload = { ...checkData, store_id: storeId }
				console.log({ payload })
				response = await spiritHeroApi.receiveFunds(payload)
			} else {
				const payload = { ...achData, store_id: storeId }
				console.log({ payload })

				response = await spiritHeroApi.receiveFundsACH(payload)
			}

			console.debug('Receive data fetching response', response)
			dispatch(setActiveStep(5))
			closeModal()
		} catch (error) {
			console.error('Receive data fetching error', error)
		}
	}

	return (
		<div className={css.modal__content}>
			<Icon name={'Frandise'} />

			<h3 className={css.modal__title}>
				How would you like to receive your funds?
			</h3>

			<form className={css.form} onSubmit={onFormSubmit}>
				<fieldset className={css.radio__fieldset}>
					<label>
						<span className={css.checkbox__emulator}></span>
						<input
							type="radio"
							name="fundraising--receive"
							checked={!isCheck}
							onChange={onRadioChange}
							className="visually-hidden"
							value="ach"
						/>
						ACH
					</label>

					<label>
						<span className={css.checkbox__emulator}></span>
						<input
							type="radio"
							name="fundraising--receive"
							checked={isCheck}
							onChange={onRadioChange}
							className="visually-hidden"
							value="Check"
						/>
						Check
					</label>
				</fieldset>

				<fieldset className={css.info__fieldset}>
					{isCheck ? (
						<>
							<label className={`${css['text--label']} width-100`}>
								<span className={css['input--label']}>Check payable to</span>
								<input
									id="payee--name"
									onChange={(e) => {
										setCheckData((prev) => {
											return { ...prev, payment_name: e.target.value }
										})
									}}
									value={checkData.payment_name}
									type="text"
									placeholder="Payee name"
									required
								/>
							</label>

							<label className={`${css['text--label']} width-50`}>
								<span className={css['input--label']}>First name</span>
								<input
									id="first--name"
									onChange={(e) => {
										setCheckData((prev) => {
											return { ...prev, first_name: e.target.value }
										})
									}}
									value={checkData.first_name}
									type="text"
									placeholder="Name"
									required
								/>
							</label>

							<label className={`${css['text--label']} width-50`}>
								<span className={css['input--label']}>Last name</span>
								<input
									id="last--name"
									onChange={(e) => {
										setCheckData((prev) => {
											return { ...prev, last_name: e.target.value }
										})
									}}
									value={checkData.last_name}
									type="text"
									placeholder="Last Name"
									required
								/>
							</label>

							<label className={`${css['text--label']} width-100`}>
								<span className={css['input--label']}>
									School/Organization Name
								</span>
								<input
									id="school-organization-name"
									onChange={(e) => {
										setCheckData((prev) => {
											return { ...prev, organization_name: e.target.value }
										})
									}}
									value={checkData.organization_name}
									type="text"
									placeholder="School or Organization Name"
									required
								/>
							</label>

							<label className={`${css['text--label']} width-50`}>
								<span className={css['input--label']}>Address 1</span>
								<input
									id="address-1"
									onChange={(e) => {
										setCheckData((prev) => {
											return { ...prev, address_1: e.target.value }
										})
									}}
									value={checkData.address_1}
									type="text"
									placeholder="123 Example Street"
									required
								/>
							</label>

							<label className={`${css['text--label']} width-50`}>
								<span className={css['input--label']}>
									Address 2 (optional)
								</span>
								<input
									id="address-2"
									onChange={(e) => {
										setCheckData((prev) => {
											return { ...prev, address_2: e.target.value }
										})
									}}
									value={checkData.address_2}
									type="text"
									placeholder="123 Example Street"
								/>
							</label>

							<label className={`${css['text--label']} width-33`}>
								<span className={css['input--label']}>City</span>
								<input
									id="city"
									onChange={(e) => {
										setCheckData((prev) => {
											return { ...prev, city: e.target.value }
										})
									}}
									value={checkData.city}
									type="text"
									placeholder="City"
									required
								/>
							</label>

							<label className={`${css['text--label']} width-33`}>
								<span className={css['input--label']}>State</span>
								<input
									id="state"
									onChange={(e) => {
										setCheckData((prev) => {
											return { ...prev, state: e.target.value }
										})
									}}
									value={checkData.state}
									type="text"
									placeholder="State"
									required
								/>
							</label>

							<label className={`${css['text--label']} width-33`}>
								<span className={css['input--label']}>Zip Code</span>
								<input
									id="zip-code"
									onChange={(e) => {
										setCheckData((prev) => {
											return { ...prev, zip_code: e.target.value }
										})
									}}
									value={checkData.zip_code}
									type="text"
									placeholder="Zip Code"
									required
								/>
							</label>
						</>
					) : (
						<>
							<label className={`${css['text--label']} width-50`}>
								<span className={css['input--label']}>Bank name</span>
								<input
									onChange={(e) => {
										setAchData((prev) => {
											return { ...prev, bank_name: e.target.value }
										})
									}}
									value={achData.bank_name}
									type="text"
									placeholder="Enter bank name"
									required
								/>
							</label>

							<label className={`${css['text--label']} width-50`}>
								<span className={css['input--label']}>Routing number</span>
								<input
									onChange={(e) => {
										setAchData((prev) => {
											return { ...prev, routing_number: e.target.value }
										})
									}}
									value={achData.routing_number}
									type="text"
									placeholder="Enter routing number"
									required
								/>
							</label>

							<label className={`${css['text--label']} width-100`}>
								<span className={css['input--label']}>Account number</span>
								<input
									onChange={(e) => {
										setAchData((prev) => {
											return { ...prev, account_number: e.target.value }
										})
									}}
									value={achData.account_number}
									type="text"
									placeholder="Enter account number"
									required
								/>
							</label>
						</>
					)}
				</fieldset>

				<button type="submit" className="contrast_button_1">
					Confirm
				</button>
			</form>
		</div>
	)
}
