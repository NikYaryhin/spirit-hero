import { useEffect, useState } from 'react'
import Icon from '../Icon'
import css from './FundraisingNextStepModal.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { setActiveStep } from '@/features/navigation/navigationSlice'
import spiritHeroApi from '@/api/spiritHeroApi'
import Loader from '@components/Loader/Loader'

export default function FundraisingNextStepModal({ closeModal }) {
	const dispatch = useDispatch()

	const storeInfo = useSelector((state) => state.flashSale.storeInfo)
	const storeId = useSelector((state) => state.flashSale.storeId)
	const [isLoading, setisLoading] = useState(false)
	const [isLoadingFetchStore, setIsLoadingFetchStore] = useState(false)
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

	const US_STATES = [
		"Alabama", "Alaska", "Arizona", "Arkansas", "California",
		"Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
		"Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas",
		"Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
		"Michigan", "Minnesota", "Mississippi", "Missouri", "Montana",
		"Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
		"New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma",
		"Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
		"South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
		"Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
	];

	useEffect(() => {
		const fetchStore = async () => {
			try {
				setIsLoadingFetchStore(true);

				const res = await spiritHeroApi.getStore(storeId);
				const store = res?.store;

				const receiveType = store?.receive_type;

				// ACH
				if (receiveType === 'ach') {
					if (store?.receiveFundsAch) {
						const {
							account_number,
							routing_number,
							bank_name,
						} = store.receiveFundsAch;

						setAchData({
							account_number,
							routing_number,
							bank_name,
						});
						setIsCheck(false)
					}
				}
				// FUNDS або старі записи без receive_type
				else {
					if (store?.receiveFunds) {
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
						} = store.receiveFunds;

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
						});
						setIsCheck(true)

					}
					// fallback якщо receive_type=funds, але дані лежать в receiveFundsAch
					else if (store?.receiveFundsAch) {
						const {
							account_number,
							routing_number,
							bank_name,
						} = store.receiveFundsAch;

						setAchData({
							account_number,
							routing_number,
							bank_name,
						});
						setIsCheck(false)

					}
				}
			} catch (e) {
				console.error('getStore error', e);
			} finally {
				setIsLoadingFetchStore(false);
			}
		};

		if (storeId) {
			fetchStore();
		}
	}, [storeId]);

	const onRadioChange = () => {
		setIsCheck(!isCheck)
	}

	const onFormSubmit = async (e) => {
		e.preventDefault()
		setisLoading(true)

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
		} finally {
			setisLoading(false)
		}
	}
	if (isLoadingFetchStore) return <Loader />

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

							{/*<label className={`${css['text--label']} width-33`}>
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
							</label>*/}
							<label className={`${css['text--label']} width-33`}>
								<span className={css['input--label']}>State</span>

								<select
									id="state"
									value={checkData.state}
									onChange={(e) => {
										setCheckData((prev) => ({
											...prev,
											state: e.target.value,
										}));
									}}
									required
								>
									<option value="">Select state</option>

									{US_STATES.map((state) => (
										<option key={state} value={state}>
											{state}
										</option>
									))}
								</select>
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
										const value = e.target.value.replace(/\D/g, '');

										setAchData((prev) => ({
											...prev,
											routing_number: value,
										}));
									}}
									value={achData.routing_number}
									type="text"
									inputMode="numeric"
									pattern="[0-9]*"
									placeholder="Enter routing number"
									required
								/>
							</label>

							<label className={`${css['text--label']} width-100`}>
								<span className={css['input--label']}>Account number</span>
								<input

									onChange={(e) => {
										const value = e.target.value.replace(/\D/g, '');

										setAchData((prev) => ({
											...prev,
											account_number: value,
										}));
									}}
									value={achData.account_number}
									type="text"
									placeholder="Enter account number"
									inputMode="numeric"
									pattern="[0-9]*"
									required
								/>
							</label>
						</>
					)}
				</fieldset>

				<button
					type="submit"
					className="contrast_button_1"
					disabled={isLoading}
				>
					{isLoading ? 'Saving...' : 'Confirm'}
				</button>
			</form>
		</div>
	)
}
