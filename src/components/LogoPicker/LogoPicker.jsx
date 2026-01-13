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
			<div className={css['logo--picker__image']}>
				<img src={image} alt="" loading="lazy" />

				<span className={css['logo--picker__label']}>
					Add your own custom background
				</span>
			</div>

			<label className={css['logo--picker__button']}>
				<span>Your logo</span>
				<Upload />
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
