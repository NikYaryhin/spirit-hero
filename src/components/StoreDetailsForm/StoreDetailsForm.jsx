import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { nextStep } from '@/features/navigation/navigationSlice'

import css from './StoreDetailsForm.module.css'
import spiritHeroApi from '@/api/spiritHeroApi'

import {
	setStoreId as setStoreIdAction,
	setStoreInfo,
	setFlashSale,
} from '@/features/flashSale/flashSaleSlice'
import ColorsList from '../ColorsList/ColorsList'

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

	const [isLoading, setIsLoading] = useState(false)
	const [storeName, setStoreName] = useState(storeInfo?.store?.name || '')
	const [storeURL, setStoreURL] = useState(storeInfo?.store?.website_url || '')
	const [firstSocial, setFirstSocial] = useState(
		storeInfo?.store?.social_media_1 || '',
	)
	const [secondSocial, setSecondSocial] = useState(
		storeInfo?.store?.social_media_2 || '',
	)
	const [colors, setColors] = useState([])
	const [colorsIds, setColorsIds] = useState([])

	useEffect(() => {
		if (storeInfo?.store) {
			const { name, website_url, social_media_1, social_media_2, color } =
				storeInfo.store

			setStoreName(name || '')
			setStoreURL(website_url || '')
			setFirstSocial(social_media_1 || '')
			setSecondSocial(social_media_2 || '')
			setColors(color)
		}
	}, [storeInfo])

	// const saveColors = async (e) => {
	// 	e.preventDefault()
	// 	const payload = {
	// 		store_id: storeId,
	// 		color_id: colorsIds,
	// 	}

	// 	try {
	// 		setIsLoading(true)
	// 		const response = await spiritHeroApi.saveColorsDetails(payload)
	// 		console.log('saveColorsDetails response', response)
	// 	} catch (error) {
	// 		console.error('saveColorsDetails error', error)
	// 	} finally {
	// 		setIsLoading(false)
	// 	}
	// }

	const onFormSubmit = async (event) => {
		event.preventDefault()
		setIsLoading(true)

		const payload = {
			start_type: 1,
			store_type: 1,
			store_name: storeName,
			website_url: storeURL,
			social_media_1: firstSocial || '',
			social_media_2: secondSocial || '',
			color: colors,
		}

		if (image) payload.background_image = image

		try {
			let res
			if (storeId && storeInfo) {
				res = await spiritHeroApi.updateStore({
					...payload,
					store_id: storeId,
				})
				console.debug('spiritHeroApi.updateStore()', res)

				dispatch(setFlashSale(res?.store?.is_flash_sale || false))
			} else {
				res = await spiritHeroApi.saveStore({
					...payload,
					current_page: 2,
				})
				console.debug('spiritHeroApi.saveStore()', res)

				dispatch(setStoreIdAction(res.store.id))
				// localStorage.setItem('storeId', res.store.id)
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
		} finally {
			setIsLoading(false)
		}
	}

	const colorInputHandle = (e) => {
		const { value, checked } = e.target
		const { id } = e.target.dataset

		setColors((prev) => {
			const nextColors = checked
				? [...prev, value]
				: prev.filter((color) => color !== value)
			return nextColors
		})
		setColorsIds((prev) => {
			const nextColors = checked
				? [...prev, id]
				: prev.filter((color) => color !== id)
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

					<ColorsList colorInputHandle={colorInputHandle} colors={colors} />

					{/* {storeId && (
						<button
							type="button"
							onClick={saveColors}
							className={css.next__button}
							disabled={isLoading}
						>
							{isLoading ? 'Saving' : 'Save colors'}
						</button>
					)} */}
				</fieldset>

				<div className={css['next__button--box']}>
					<button
						type="submit"
						className={css.next__button}
						disabled={isLoading}
					>
						{isLoading ? 'Saving' : 'Next'}
					</button>

					<span className={css['next__button--label']}>
						It will take about 10 min.
					</span>
				</div>
			</form>
		</section>
	)
}
