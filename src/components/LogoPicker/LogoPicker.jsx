import { useState } from 'react'
import css from './LogoPicker.module.css'
import placeholderImage from '@/assets/SpiritHero__Image--Picker--Banner.jpg'
import Upload from '../Icons/Upload'

export default function LogoPicker() {
	const [image, setImage] = useState(placeholderImage)

	const onInputChange = (e) => {
		const file = e.target.files[0]
		console.log('file', file)

		if (file) {
			const reader = new FileReader()
			reader.onload = () => {
				setImage(reader.result)
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
