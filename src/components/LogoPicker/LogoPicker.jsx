import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import css from './LogoPicker.module.css'
import placeholderImage from '@/assets/SpiritHero__Image--Picker--Banner.jpg'
import Upload from '../Icons/Upload'

export default function LogoPicker({ setCustomerImage }) {
	const storeInfo = useSelector((state) => state.flashSale.storeInfo)

	const [image, setImage] = useState(
		storeInfo?.store?.background_image || placeholderImage,
	)

	useEffect(() => {
		if (storeInfo?.store?.background_image)
			setImage(storeInfo?.store?.background_image)
	}, [storeInfo])

	const onInputChange = (e) => {
		const file = e.target.files[0]

		if (file) {
			const reader = new FileReader()
			reader.onload = () => {
				setImage(reader.result)
				setCustomerImage(reader.result)
			}
			reader.readAsDataURL(file)
		}
	}

	return (
		<div className={css['logo--picker']}>
		<span className={css['logo--picker__label']}>
			Add your own logo
		</span>

			<label
				className={`${css['logo--picker__button']} ${
					image ? css['has-image'] : ''
				}`}
			>
				{image ? (
					<img
						src={image}
						alt="Preview"
						className={css['logo--picker__preview']}
					/>
				) : (
					<>
						<span>Upload</span>
						<Upload />
					</>
				)}

				{image && (
					<div className={css['logo--picker__overlay']}>
						<Upload className={css['logo--picker__upload-icon']} />
						<span>Update</span>
					</div>
				)}

				<input
					onChange={onInputChange}
					className="visually-hidden"
					type="file"
					accept="image/*"
				/>
			</label>
		</div>
	)
}
