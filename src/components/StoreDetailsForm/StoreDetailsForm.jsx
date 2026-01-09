import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { nextStep } from '@/features/navigation/navigationSlice'
import ColorCheckbox from '../ColorCheckbox/ColorCheckbox'
import css from './StoreDetailsForm.module.css'
import spiritHeroApi from '@/api/spiritHeroApi'
import { COLORS } from '@/helpers/const'
import {
	setStoreId as setStoreIdAction,
	setStoreInfo,
	setFlashSale,
} from '@/features/flashSale/flashSaleSlice'

const slugify = (value) =>
	value
		.trim()
		.toLocaleLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')

export default function StoreDetailsForm({ image }) {
	const dispatch = useDispatch()

	const storeInfo = useSelector((state) => state.flashSale.storeInfo)
	const storeId = useSelector((state) => state.flashSale.storeId)

	const [storeName, setStoreName] = useState(storeInfo?.store?.name || '')
	const [storeURL, setStoreURL] = useState(storeInfo?.store?.website_url || '')
	const [firstSocial, setFirstSocial] = useState(
		storeInfo?.store?.social_media_1 || '',
	)
	const [secondSocial, setSecondSocial] = useState(
		storeInfo?.store?.social_media_2 || '',
	)
	const [colors, setColors] = useState([])

	useEffect(() => {
		if (storeInfo?.store) {
			setStoreName(storeInfo.store.name || '')
			setStoreURL(storeInfo.store.website_url || '')
			setFirstSocial(storeInfo.store.social_media_1 || '')
			setSecondSocial(storeInfo.store.social_media_2 || '')
			setColors(storeInfo.store.color || [])
		}
	}, [storeInfo])

	const onFormSubmit = async (event) => {
		event.preventDefault()

		const payload = {
			start_type: 1,
			store_type: 1,
			store_name: storeName,
			website_url: storeURL,
			social_media_1: firstSocial || '',
			social_media_2: secondSocial || '',
			color: colors,
			background_image: image || storeInfo?.store?.background_image || '',
		}

		try {
			let res

			console.log({ storeId, storeInfo })

			if (storeId && storeInfo) {
				res = await spiritHeroApi.updateStore({
					...payload,
					store_id: storeId,
				})
				console.log('spiritHeroApi.updateStore()', res)

				dispatch(setFlashSale(res?.store?.is_flash_sale || false))
			} else {
				res = await spiritHeroApi.saveStore({ ...payload, current_page: 2 })
				console.log('spiritHeroApi.saveStore()', res)

				dispatch(setStoreIdAction(res.store.id))
				localStorage.setItem('storeId', res.store.id)
			}

			dispatch(
				setStoreInfo({
					...(storeInfo || {}),
					store: res,
				}),
			)
			dispatch(nextStep())
		} catch (error) {
			console.error('save/update store error', error)
		}
	}

	const colorInputHandle = (checked, value) => {
		setColors((prev) => {
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
								setStoreURL(slugify(event.currentTarget.value))
							}}
							value={storeName}
							type="text"
							placeholder="Enter name of your store"
							required
						/>
					</label>

					<label className={css['text--label']}>
						<span className={css['input--label']}>Add Website URL</span>
						<input
							onChange={(event) => {
								setStoreURL(slugify(event.currentTarget.value))
							}}
							value={storeURL}
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
								value={firstSocial}
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
								value={secondSocial}
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
						{colors.length > 0 &&
							COLORS.map(({ color, name, id }) => {
								return (
									<li key={id}>
										<ColorCheckbox
											onInputHandle={colorInputHandle}
											color={color}
											colors={colors}
											name={name}
											checkedColor={colors.includes(color)}
											inputName="color--input"
										/>
									</li>
								)
							})}
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
