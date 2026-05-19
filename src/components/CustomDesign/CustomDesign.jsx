import css from './CustomDesign.module.css'
import { useEffect, useState, useRef } from 'react'
import spiritHeroApi from '@/api/spiritHeroApi'
import ColorCheckbox from '../ColorCheckbox/ColorCheckbox'
import Icon from '@components/Icon'
import ColorCheckboxCustomDesign from '@components/ColorCheckboxCustomDesign/ColorCheckboxCustomDesign'

const DESIGN_STYLES = [
	{
		id: 'mascot',
		label: 'Mascot Aggressive look.',
		sublabel: '',
		img: 'https://cdn.shopify.com/s/files/1/0742/2400/9389/files/3446cda1b0f9ef33a7feeeead8694bd3e2a3088d.png?v=1779196592',
	},
	{
		id: 'classic',
		label: 'Classic',
		sublabel: null,
		img: 'https://cdn.shopify.com/s/files/1/0742/2400/9389/files/6e96993e0ede68a1051c8cce8d6af2ff00b8e4ad.png?v=1779196634',
	},
	{
		id: 'text',
		label: 'Text Only',
		sublabel: null,
		img: 'https://cdn.shopify.com/s/files/1/0742/2400/9389/files/d99ea4995319524bd47cfec20eb5f1bb0516cb12.png?v=1779196600',
	},
	{
		id: 'cartoon',
		label: 'Cartoon Mascot',
		sublabel: 'Cute',
		img: 'https://cdn.shopify.com/s/files/1/0742/2400/9389/files/da26095cce41c0a6b860f2056383cfcc317c209b.png?v=1779196602',
	},
	{
		id: 'vintage',
		label: 'Vintage',
		sublabel: null,
		img: 'https://cdn.shopify.com/s/files/1/0742/2400/9389/files/2ee4d6cdb0ec7a9a1ef6b5f274b8ad5a6f96d6ae.png?v=1779196604',
	},
]

export default function CustomDesign({ onClose }) {
	const [colors, setColors] = useState([])
	const [colorsData, setColorsData] = useState([])
	const [selectedStyle, setSelectedStyle] = useState('mascot')
	const [frontText, setFrontText] = useState('')
	const [backText, setBackText] = useState('')
	const [message, setMessage] = useState('')
	const [file, setFile] = useState(null)
	const [agreed, setAgreed] = useState(false)
	const fileRef = useRef()

	useEffect(() => {
		const fetchColors = async () => {
			const colorsData = await spiritHeroApi.getColors()
			setColorsData(colorsData.colors)

		}
		fetchColors()
	}, [])

	const colorInputHandle = (e) => {
		const { value, checked } = e.target
		const { id } = e.target.dataset

		setColors((prev) => {
			const nextColors = checked
				? [...prev, value]
				: prev.filter((color) => color !== value)
			return nextColors
		})
	}

	const onButtonClick = async () => {
		if (!agreed) return

		try {
			// submit logic here
			onClose()
		} catch (error) {
			console.error('CustomDesign submit error', error)
		}
	}
	console.log(agreed)

	return (
		<>
			<div className={css.modal__head}>
				<h3 className={css.title}>
					Work with a Designer to Bring Your Vision into Life
				</h3>

				<span className={css.subtitle}>
					You can submit a design request below. A spirit wear specialist will
					reach out to you if we have any additional questions. Your first two
					designs are free which include unlimited edits until you are 100%
					satisfied with your design. Additional custom designs are $50 per logo.
				</span>
			</div>

			<div className={css.modal__content}>

				{/* ── Section 1: Design Style ── */}
				<div className={css.section}>
					<span className={css.section__title}>
						1. Help our art dept by choosing a design style below
					</span>

					<div className={css.styles__list}>
						{DESIGN_STYLES.map(({ id, label, sublabel, img }) => (
							<div
								key={id}
								className={`${css.style__card} ${selectedStyle === id ? css['selected'] : ''}`}
								onClick={() => setSelectedStyle(id)}
							>
								<span
									className={`${css.style__check} ${selectedStyle === id ? css['checked'] : ''}`}
								>
									{selectedStyle === id && (
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
									)}
								</span>
								<div className={css.style__label}>
									<span>{label}</span>
								</div>

								<img
									src={img}
									alt={label}
									className={css.style__img}
								/>

							</div>
						))}
					</div>
				</div>

				{/* ── Sections 2 & 3 ── */}
				<div className={css.body}>

					{/* Section 2: Colors */}
					<div className={css.colors__col}>
						<span className={css.section__title}>
							2. Select Your Ink Color(s)
						</span>

						<div className={css.colors__list}>
							{colorsData.map(({ ink_color, ink_color_name, id }) => (
								<ColorCheckboxCustomDesign
									key={id}
									onInputHandle={colorInputHandle}
									color={ink_color}
									colors={colors}
									name={ink_color_name}
									id={id}
									checkedColor={colors.includes(ink_color)}
									className={'horisontal'}
								/>
							))}
						</div>
					</div>

					{/* Section 3: Text & Photos */}
					<div className={css.fields__col}>
						<span className={css.section__title}>
							3. Add Text and Photos
						</span>

						<label className={css.field__label} htmlFor="front-text">
							Front Design Text (optional)
						</label>
						<textarea
							id="front-text"
							className={css.textarea}
							value={frontText}
							onChange={(e) => setFrontText(e.target.value)}
							rows={3}
						/>

						<label className={css.field__label} htmlFor="back-text">
							Back Design Text (optional)
						</label>
						<textarea
							id="back-text"
							className={css.textarea}
							value={backText}
							onChange={(e) => setBackText(e.target.value)}
							rows={3}
						/>

						<label className={css.field__label} htmlFor="designer-msg">
							Message for designer (optional)
						</label>
						<textarea
							id="designer-msg"
							className={css.textarea}
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							rows={4}
						/>

						<label className={css.field__label}>
							Upload photo(s) (optional)
						</label>
						<div className={css.upload__row}>
							<button
								type="button"
								className={css.upload__btn}
								onClick={() => fileRef.current?.click()}
							>
								Upload file
							</button>
							<span className={css.upload__name}>
								{file ? file.name : 'No file is chosen'}
							</span>
							<input
								ref={fileRef}
								type="file"
								multiple
								accept="image/*"
								style={{ display: 'none' }}
								onChange={(e) => setFile(e.target.files[0] || null)}
							/>
						</div>
						<span className={css.upload__hint}>
							Upload as many images as you want to help us give you a great
							design ( Each image must be &lt; 2MB in size )
						</span>

						<label className={css.terms}>
							<span
								className={`${css.terms__check} ${agreed ? css['checked'] : ''}`}
								onClick={() => setAgreed(!agreed)}
							>
								{agreed && (
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
								)}
							</span>

							<span>
								By reaching out to us, you agree to our{' '}
								<a href="#" className={css.terms__link}>
									Terms and Conditions
								</a>
							</span>
						</label>

						<button
							type="button"
							onClick={onButtonClick}
							className={`${css.modal__button} ${!agreed ? css['modal__button--disabled'] : ''} contrast_button_1`}
							disabled={!agreed}
						>
							Sent Request and Book a Call
						</button>
					</div>
				</div>
			</div>
		</>
	)
}
