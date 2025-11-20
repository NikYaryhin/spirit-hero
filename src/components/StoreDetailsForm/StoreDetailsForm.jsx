import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { nextStep } from '@/features/navigation/navigationSlice'
import ColorCheckbox from '../ColorCheckbox/ColorCheckbox'
import css from './StoreDetailsForm.module.css'
import spiritHeroApi from '@/api/spiritHeroApi'
import { COLORS } from '@/helpers/const'

export default function StoreDetailsForm({ setStoreId }) {
  const dispatch = useDispatch()
	const [storeName, setStoreName] = useState('')
	const [storeURL, setStoreURL] = useState('')
	const [firstSocial, setFirstSocial] = useState('')
	const [secondSocial, setSecondSocial] = useState('')
	const [color, setColor] = useState([])

	const onFormSubmit = async (event) => {
		event.preventDefault()

		const payload = {
			start_type: 1,
			store_type: 1,
			store_name: storeName,
			website_url: storeURL,
			social_media_1: firstSocial || '',
			social_media_2: secondSocial || '',
			color,
		}

		try {
			const res = await spiritHeroApi.saveStore(payload)
			console.log('spiritHeroApi.saveStore()', res)

			setStoreId(res.store.id)
			localStorage.setItem('storeId', res.store.id)

			dispatch(nextStep())
		} catch (error) {
			console.error('spiritHeroApi.saveStore() error', error)
		}
	}

	const colorInputHandle = (checked, value) => {
		setColor((prev) => {
			const nextColors = checked
				? [...prev, value]
				: prev.filter((color) => color !== value)
			return nextColors
		})
	}

	return (
		<section className={css['store--details__section']}>
			<form
				action="submit"
				onSubmit={onFormSubmit}
				className={css['store--details__form']}
			>
				<fieldset>
					<h3>1. Store details</h3>

					<label className={css['text--label']}>
						<span className={css['input--label']}>Add Name</span>
						<input
							onChange={(event) => {
								setStoreName(event.currentTarget.value)
							}}
							type="text"
							placeholder="Enter name of your store"
							required
						/>
					</label>

					<label className={css['text--label']}>
						<span className={css['input--label']}>Add Website URL</span>
						<input
							onChange={(event) => {
								setStoreURL('ex.spirithero.com/' + event.currentTarget.value)
							}}
							type="text"
							placeholder="abc-spirit-wear-store"
							required
						/>
					</label>

					<div className={css['social--media__inputs--box']}>
						<label className={css['text--label']}>
							<span className={css['input--label']}>
								Add Social Media <em>(optional)</em>
							</span>
							<input
								onChange={(event) => {
									setFirstSocial(event.currentTarget.value)
								}}
								type="url"
								placeholder="https://tiktok.com"
							/>
						</label>

						<label className={css['text--label']}>
							<span className={css['input--label']}>
								Add Social Media <em>(optional)</em>
							</span>
							<input
								onChange={(event) => {
									setSecondSocial(event.currentTarget.value)
								}}
								type="url"
								placeholder="https://x.com"
							/>
						</label>
					</div>
				</fieldset>

				<fieldset>
					<h3>2. Choose primary colors</h3>

					<p className={css.paragraph}>
						<span>
							Choose colors for the products you will sell in your store. Be
							sure to select colors that will look good with your logo on them.
						</span>
						<span>
							Our system automatically selects products & colorizes design
							templates based on your store colors.
						</span>
					</p>

					<ul className={css['color--picker__list']}>
						{COLORS.map(({ color, name, id }) => (
							<li key={id}>
								<ColorCheckbox
									onInputHandle={colorInputHandle}
									color={color}
									name={name}
									inputName="color--input"
								/>
							</li>
						))}
					</ul>
				</fieldset>

				<div className={css['next__button--box']}>
					<button type="submit" className={css.next__button}>
						Next
					</button>

					<span className={css['next__button--label']}>
						It will take about 10 min.
					</span>
				</div>
			</form>
		</section>
	)
}
