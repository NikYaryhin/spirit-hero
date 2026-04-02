import { useState } from 'react'
import css from './NewDesignModal.module.css'
import { useDispatch, useSelector } from 'react-redux'
import spiritHeroApi from '@/api/spiritHeroApi'
import { setMinimalGroups } from '@/features/products/productsSlice'
import Loader from '@components/Loader/Loader'
import { setActiveStep } from '@/features/navigation/navigationSlice'

export default function NewDesignModal({ setIsNewDesignModalOpen }) {
	const dispatch = useDispatch()

	const [selectedGroupId, setSelectedGroupId] = useState(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const minimalGroups = useSelector((state) => state.products.minimalGroups)
	const params = new URLSearchParams(window.location.search)
	const storeIdFromQuery = params.get('store_id')
	const storeId = useSelector((state) => state.flashSale.storeId) || storeIdFromQuery
	const onContinueClick = async () => {
		if (!selectedGroupId || isSubmitting) return

		try {
			setIsSubmitting(true)
			const response = await spiritHeroApi.createNewMinimalGroup(selectedGroupId,storeId)
			console.debug('createNewMinimalGroup response', response)
			const createdGroups = Array.isArray(response?.minimum_groups) ? response.minimum_groups : []

			if (createdGroups.length > 0) {
				const groupsMap = new Map(minimalGroups.map((group) => [String(group.id), group]))
				createdGroups.forEach((group) => {
					groupsMap.set(String(group.id), group)
				})
				dispatch(setMinimalGroups(Array.from(groupsMap.values())))
			}

			setIsNewDesignModalOpen(false)
			dispatch(setActiveStep(2))
		} catch (error) {
			console.error('createNewMinimalGroup error', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	if (isSubmitting) return <Loader />
	return (
		<div className={css.modal__content}>
			<h3 className={css.modal__title}>Choose a collection for your second design</h3>

			<p className={css.modal__subtitle}>
				<span>
					You've already added one design to the
					<strong>&#160; Standard collection.</strong>
				</span>
				<span>Please select a collection for Your second design:</span>
			</p>

			<fieldset className={css.fieldset}>
				{minimalGroups &&
					minimalGroups.map((group) => (
						<label className={css.label} key={group.id}>
							<input
								type="radio"
								className='visually-hidden'
								name="collection"
								value={group.id}
								onChange={() => setSelectedGroupId(group.id)}
								/>
							<span className={css.checkbox__emulator}></span>
							{group.name} (36-piece minimum)
						</label>
					))}
			</fieldset>

			<button
				className={css.modal__button__continue}
				onClick={onContinueClick}
				disabled={!selectedGroupId || isSubmitting}
			>
				Continue
			</button>
			<button className={css.modal__button__cancel} onClick={() => setIsNewDesignModalOpen(false)}>
				Cancel
			</button>
		</div>
	)
}
