import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Icon from '../Icon'
import css from './FlashSale.module.css'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import 'react-day-picker/dist/style.css'
import { useSelector } from 'react-redux'
import spiritHeroApi from '@/api/spiritHeroApi'

export default function FlashSale() {
	const params = new URLSearchParams(window.location.search)
	const storeIdFromQuery = params.get('store_id')
	const storeId =
		useSelector((state) => state.flashSale.storeId) || storeIdFromQuery

	const [ordersFiles, setOrdersFiles] = useState([])
	const [range, setRange] = useState({ from: '', to: '' })
	const [shippingValue, setShippingValue] = useState('free_shipping')
	const [shippingData, setShippingData] = useState({
		first_name: '',
		last_name: '',
		organization_name: '',
		address_1: '',
		address_2: '',
		city: '',
		state: '',
		zip_code: '',
		fundraising_goal_amount: '',
	})
	const [isOnDemandChecked, setIsOnDemandChecked] = useState(false)
	const [isFundaraisingChecked, setIsFundaraisingChecked] = useState(false)

	useEffect(() => {
		async function fetchFlashSaleSettings() {
			try {
				console.debug({ storeId: storeId })

				const response = await spiritHeroApi.getFlashSaleSettings(storeId)

				console.debug('spiritHeroApi.getFlashSaleSettings response', response)

				const {
					first_name,
					last_name,
					organization_name,
					address_1,
					address_2,
					city,
					state,
					zip_code,
					fundraising_goal_amount,
					flash_sale_start_date,
					flash_sale_end_date,
					on_demand_ordering,
					location_type,
				} = response.item

				if (response.item) {
					setShippingData((prev) => ({
						...prev,
						first_name,
						last_name,
						organization_name,
						address_1,
						address_2,
						city,
						state,
						zip_code,
						fundraising_goal_amount,
					}))
					setRange((prev) => ({
						...prev,
						from: flash_sale_start_date || '',
						to: flash_sale_end_date,
					}))
					setShippingValue(location_type || 'free_shipping')
					if (typeof fundraising_goal_amount === 'number')
						setIsFundaraisingChecked(true)
					if (on_demand_ordering) setIsOnDemandChecked(true)
				}
			} catch (error) {
				console.error('Error fetching flash sale settings:', error)
			}
		}

		fetchFlashSaleSettings()
	}, [])

	const handleFilesChange = (e) => {
		const files = Array.from(e.target.files || [])
		const withIds = files.map((file) => ({
			id: `${uuidv4()}`,
			file,
		}))
		setOrdersFiles((prev) => [...prev, ...withIds])
		console.log({ ordersFiles })
	}

	const onDeleteFileClick = (e) => {
		e.preventDefault()
		const { id } = e.currentTarget
		setOrdersFiles((prev) => prev.filter((file) => file.id != id))
	}

	const onSaveClick = async () => {
		const payload = {
			store_id: storeId,
			type_id: 1,
			first_name: shippingData.first_name || '',
			last_name: shippingData.last_name || '',
			organization_name: shippingData.organization_name || '',
			address_1: shippingData.address_1 || '',
			address_2: shippingData.address_2 || '',
			city: shippingData.city || '',
			state: shippingData.state || '',
			zip_code: shippingData.zip_code || '',

			flash_sale_start_date: range.from || '',
			flash_sale_end_date: range.to || '',
			on_demand_ordering: isOnDemandChecked,
			fundraising_progress_bar: isFundaraisingChecked,
			fundraising_goal_amount: 12.99,
		}

		const formData = new FormData()
		if (ordersFiles.length) {
			ordersFiles.forEach((file) => {
				formData.append('orders_files[]', file.file)
			})
		}

		try {
			const response = await spiritHeroApi.saveFlashSaleSetting(payload)
			console.debug('spiritHeroApi.saveFlashSaleSetting response', response)
		} catch (error) {
			console.error('Error saving flash sale settings:', error)
		}
	}

	return (
		<section className={css['flash--sale__section']}>
			<div className={css['flash--sale__head']}>
				<div className={css['flash--sale__text']}>
					<h1 className={css['flash--sale__title']}>
						Organize, Schedule & Personalize Your Flash Sale
					</h1>

					<p className={css['flash--sale__sign']}>
						Configure how your orders will be grouped, shipped, and fulfilled
						after the flash sale ends. You can also set your fundraising goal
						and schedule when the sale should close.
					</p>
				</div>

				<button className={css['flash--sale__head--button']}>
					Preview store
				</button>
			</div>

			<details
				className={css['flash--sale__details--form']}
				name="flash--sale--details"
				open
			>
				<summary>
					<span className={css['details--form__number']}>1</span>
					How do you want your orders shipped?
					<Icon name={'ChevronUp'} />
				</summary>

				<form className={css.form}>
					<fieldset className={css.form__pickers}>
						<label className={css.form__picker}>
							<Icon name={'Build'} />

							<div className={css['form__picker--signs']}>
								<h3 className={css['form__picker--label']}>1 Location</h3>

								<span className={css['form__picker--sublabel']}>
									labeled/sorted/bagged Free Shipping
								</span>
							</div>

							<input
								id="shipment-option-location"
								value="free_shipping"
								type="radio"
								name="shipment--option"
								className="visually-hidden"
								checked={shippingValue === 'free_shipping'}
								onChange={(e) => setShippingValue(e.currentTarget.value)}
							/>
						</label>

						<label className={css.form__picker}>
							<Icon name={'People'} />

							<div className={css['form__picker--signs']}>
								<h3 className={css['form__picker--label']}>Ship - to - Home</h3>

								<span className={css['form__picker--sublabel']}>
									$8.95 shipping
								</span>
							</div>

							<input
								id="shipment-option-home"
								onChange={(e) => setShippingValue(e.currentTarget.value)}
								value="ship_home"
								type="radio"
								name="shipment--option"
								className="visually-hidden"
								checked={shippingValue === 'ship_home'}
							/>
						</label>

						<label className={css.form__picker}>
							<Icon name={'Crown'} />

							<div className={css['form__picker--signs']}>
								<h3 className={css['form__picker--label']}>Buyer’s choice</h3>

								<span className={css['form__picker--sublabel']}>
									Give both options
								</span>
							</div>

							<input
								id="shipment-option-buyers-choice"
								onChange={(e) => setShippingValue(e.currentTarget.value)}
								value="buyer_choice"
								type="radio"
								name="shipment--option"
								className="visually-hidden"
								checked={shippingValue === 'buyer_choice'}
							/>
						</label>
					</fieldset>

					<fieldset className={css.form__inputs}>
						<label className={`${css['text--label']} width-50`}>
							<span className={css['input--label']}>First name</span>
							<input
								id="first-name"
								value={shippingData.first_name}
								onChange={(e) => {
									setShippingData((prev) => ({
										...prev,
										first_name: e.target.value,
									}))
								}}
								type="text"
								placeholder="Name"
								required
							/>
						</label>

						<label className={`${css['text--label']} width-50`}>
							<span className={css['input--label']}>Last name</span>
							<input
								id="last-name"
								value={shippingData.last_name}
								onChange={(e) => {
									setShippingData((prev) => ({
										...prev,
										last_name: e.target.value,
									}))
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
								value={shippingData.organization_name}
								onChange={(e) => {
									setShippingData((prev) => ({
										...prev,
										organization_name: e.target.value,
									}))
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
								value={shippingData.address_1}
								onChange={(e) => {
									setShippingData((prev) => ({
										...prev,
										address_1: e.target.value,
									}))
								}}
								type="text"
								placeholder="123 Example Street"
								required
							/>
						</label>

						<label className={`${css['text--label']} width-50`}>
							<span className={css['input--label']}>Address 2 (optional)</span>
							<input
								id="address-2"
								value={shippingData.address_2}
								onChange={(e) => {
									setShippingData((prev) => ({
										...prev,
										address_2: e.target.value,
									}))
								}}
								type="text"
								placeholder="123 Example Street"
							/>
						</label>

						<label className={`${css['text--label']} width-33`}>
							<span className={css['input--label']}>City</span>
							<input
								id="city"
								value={shippingData.city}
								onChange={(e) => {
									setShippingData((prev) => ({ ...prev, city: e.target.value }))
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
								value={shippingData.state}
								onChange={(e) => {
									setShippingData((prev) => ({
										...prev,
										state: e.target.value,
									}))
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
								value={shippingData.zip_code}
								onChange={(e) => {
									setShippingData((prev) => ({
										...prev,
										zip_code: e.target.value,
									}))
								}}
								type="text"
								placeholder="Zip Code"
								required
							/>
						</label>
					</fieldset>

					<label className={css.checkbox}>
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
						Organize my orders! Examples: Sort by grade level, teacher name,
						coach name, team name, etc)
						<input
							id="organize-orders-checkbox"
							type="checkbox"
							className="visually-hidden"
							required
						/>
					</label>
				</form>
			</details>

			<details
				className={css['flash--sale__details--form']}
				name="flash--sale--details"
			>
				<summary>
					<span className={css['details--form__number']}>2</span>
					How should we sort your orders?
					<Icon name={'ChevronUp'} />
				</summary>

				<form className={css.form}>
					<fieldset className={css.form__uploaders}>
						<legend>
							We will sort, labeled and bag your orders accordingly
						</legend>

						<div className={css.uploaders__box}>
							<label className={css.uploader}>
								Choose file and Upload
								<input
									id="orders-file-upload"
									type="file"
									className="visually-hidden"
									onChange={handleFilesChange}
									multiple
								/>
							</label>
							<label className={css.uploader}>
								Download Sample CSV
								<input
									id="download-sample-csv"
									type="file"
									className="visually-hidden"
									onChange={handleFilesChange}
									multiple
								/>
							</label>
						</div>

						{ordersFiles && (
							<ul className={css.files__list}>
								{ordersFiles.map((item) => (
									<li key={item.id} className={css.file__item}>
										<Icon name={'Burger'} />
										{item.file.name}
										<button onClick={(e) => onDeleteFileClick(e)} id={item.id}>
											<Icon name={'Minus'} />
										</button>
									</li>
								))}
							</ul>
						)}
					</fieldset>
				</form>
			</details>

			<details
				className={css['flash--sale__details--form']}
				name="flash--sale--details"
			>
				<summary>
					<span className={css['details--form__number']}>3</span>
					How should we sort your orders?
					<Icon name={'ChevronUp'} />
				</summary>

				<div className={css.calendar__wrap}>
					<div className={css.calendar}>
						<DayPicker
							mode="range"
							navLayout="around"
							selected={range}
							onSelect={setRange}
							numberOfMonths={1}
							formatters={{
								formatWeekdayName: (day, options) =>
									format(day, 'EEE', { locale: options?.locale }).toUpperCase(),
							}}
						/>
					</div>

					<div className={css.schedule__info}>
						<p className={css.schedule__text}>
							<Icon name={'Clock'} />
							First batch will end on May 28th
						</p>
						<p className={css.schedule__text}>
							<Icon name={'Van'} />
							Orders arrive between June 6th and June 17th
						</p>
					</div>
				</div>
			</details>

			<details
				className={css['flash--sale__details--form']}
				name="flash--sale--details"
			>
				<summary>
					<span className={css['details--form__number']}>4</span>
					Switch to On Demand Ordering After Flash Sale
					<Icon name={'ChevronUp'} />
				</summary>
				<div className={css.details__content}>
					<div className={css.checkbox__wrap}>
						No
						<label className={css.checkbox__label}>
							<span className={css.checkbox__emulator}></span>
							<input
								type="checkbox"
								className="visually-hidden"
								checked={isOnDemandChecked}
								onChange={() => setIsOnDemandChecked(!isOnDemandChecked)}
							/>
						</label>
						Yes
					</div>

					<span className={css['on--demand__label']}>On Demand is:</span>
					<ul className={css['on--demand__list']}>
						<li> Traditional e-commerce order </li>
						<li> No minimums </li>
						<li> Shipped directly to each home </li>
						<li> Higher pricing </li>
						<li> Free shipping for orders of $75 or more </li>
						<li> $8.95 shipping for orders below $75 </li>
					</ul>
				</div>
			</details>

			<details
				className={css['flash--sale__details--form']}
				name="flash--sale--details"
			>
				<summary>
					<span className={css['details--form__number']}>5</span>
					Do you want to add a fundraising progress bar to you store?
					<Icon name={'ChevronUp'} />
				</summary>

				<div className={`${css.details__content} ${css.form__inputs}`}>
					<div className={css.checkbox__wrap}>
						No
						<label className={css.checkbox__label}>
							<span className={css.checkbox__emulator}></span>
							<input
								type="checkbox"
								className="visually-hidden"
								checked={isFundaraisingChecked}
								onChange={() =>
									setIsFundaraisingChecked(!isFundaraisingChecked)
								}
							/>
						</label>
						Yes
					</div>

					<label className={`${css['text--label']} width-33`}>
						<span className={css['input--label']}>Fundraising goal amount</span>
						<input
							id="goal-amount"
							value={shippingData.fundraising_goal_amount}
							onChange={(e) => {
								setShippingData((prev) => ({
									...prev,
									fundraising_goal_amount: e.target.value,
								}))
							}}
							min={0}
							type="number"
							placeholder="Enter the dollar amount "
							disabled={!isFundaraisingChecked}
							required={!isFundaraisingChecked}
						/>
						<span className={css['input--label']}>
							This amount will be displayed on you store
						</span>
					</label>
				</div>
			</details>

			<button
				className={css['flash--sale__head--button']}
				onClick={onSaveClick}
			>
				Save
			</button>
		</section>
	)
}
