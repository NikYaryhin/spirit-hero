import { useState } from 'react'
import Icon from '../Icon'
import css from './FundraisingNextStepModal.module.css'
import { useDispatch } from 'react-redux'
import { setActiveStep } from '@/features/navigation/navigationSlice'

export default function FundraisingNextStepModal() {
	const dispatch = useDispatch()

	const [isCheck, setIsCheck] = useState(false)
	const [checkData, setCheckData] = useState({
		payeeName: '',
		firstName: '',
		lastName: '',
		organization: '',
		address1: '',
		address2: '',
		city: '',
		state: '',
		zip: '',
	})
	const [achData, setAchData] = useState({
		bankName: '',
		routingNumber: '',
		accountNumber: '',
	})

	const onRadioChange = () => {
		setIsCheck(!isCheck)
	}

	const onFormSubmit = () => {
		console.log({ checkData, achData })

		dispatch(setActiveStep(5))
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
											return { ...prev, payeeName: e.target.value }
										})
									}}
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
											return { ...prev, firstName: e.target.value }
										})
									}}
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
											return { ...prev, lastName: e.target.value }
										})
									}}
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
											return { ...prev, organization: e.target.value }
										})
									}}
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
											return { ...prev, address1: e.target.value }
										})
									}}
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
											return { ...prev, address2: e.target.value }
										})
									}}
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
											return { ...prev, zip: e.target.value }
										})
									}}
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
											return { ...prev, bankName: e.target.value }
										})
									}}
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
											return { ...prev, routingNumber: e.target.value }
										})
									}}
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
											return { ...prev, accountNumber: e.target.value }
										})
									}}
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
