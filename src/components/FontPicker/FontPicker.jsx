import React, { useState } from 'react'
import css from './FontPicker.module.css'

const fontCategories = [
	{
		id: 1,
		name: 'All fonts',
		fonts: [
			'Cookie',
			'Courgette',
			'Dancing Script',
			'Devonshire',
			'Engagement',
			'Farsan',
			'Grand Hotel',
			'Great Vibes',
			'Kaushan Script',
			'Leckerli One',
			'Lily Script One',
			'Lobster',
			'Meddon',
			'Mr Bedfort',
			'Norican',
			'Oleo Script Swash Caps',
			'Pacifico',
			'Parisienne',
			'Pinyon Script',
			'Princess Sofia',
			'Rouge Script',
			'Sacramento',
			'Sail',
			'Sarina',
			'Tangerine',
			'Yesteryear',
		],
	},
	{
		id: 2,
		name: 'Minimalist',
		fonts: ['Courgette', 'Engagement', 'Sail'],
	},
	{
		id: 3,
		name: 'Bold',
		fonts: ['Lobster', 'Pacifico', 'Kaushan Script'],
	},
	{
		id: 4,
		name: 'Serif',
		fonts: ['Meddon', 'Pinyon Script', 'Devonshire'],
	},
	{
		id: 5,
		name: 'Script',
		fonts: [
			'Dancing Script',
			'Great Vibes',
			'Parisienne',
			'Rouge Script',
			'Sacramento',
			'Tangerine',
			'Yesteryear',
		],
	},
	{
		id: 6,
		name: 'Decorative',
		fonts: ['Cookie', 'Grand Hotel', 'Princess Sofia', 'Sarina'],
	},
	{
		id: 7,
		name: 'Handwriting',
		fonts: ['Leckerli One', 'Mr Bedfort', 'Norican'],
	},
	{
		id: 8,
		name: 'Vintage',
		fonts: ['Farsan', 'Lily Script One', 'Oleo Script Swash Caps'],
	},
]

const FontPicker = ({
	setFont,
	initialFont,
	showFontPicker,
	setShowFontPicker,
}) => {
	const [activeFont, setActiveFont] = useState(initialFont)
	const [selectedCategory, setSelectedCategory] = useState(fontCategories[0])

	const toggleFontPicker = () => {
		setShowFontPicker(!showFontPicker)
	}

	const handleCategoryChange = (e) => {
		const category = fontCategories.find(
			(cat) => cat.id === parseInt(e.target.value),
		)
		setSelectedCategory(category)
	}

	const updateFont = (fontName) => {
		setActiveFont(fontName)
		if (setFont) {
			setFont(fontName)
		}
		console.log('Selected font:', fontName)
	}

	const getFontStyle = (fontName) => {
		return {
			fontFamily: fontName,
		}
	}

	if (!showFontPicker) return null

	return (
		<div>
			<button className={css['font--picker__wrapper']}></button>
			<div
				id="font-picker"
				className={`${css['desg-PopPick']} ${css['desg-PopPick-sidefix']}`}
			>
				<a className={css['sw-BtnClose']} onClick={toggleFontPicker}>
					×
				</a>

				<div>
					<select
						className={css['sw-Form_Select']}
						onChange={handleCategoryChange}
						value={selectedCategory.id}
					>
						{fontCategories.map((category) => (
							<option key={category.id} value={category.id}>
								{category.name}
							</option>
						))}
					</select>

					<div className={css['desg-FontPicker']}>
						{selectedCategory.fonts.map((font) => (
							<a
								key={font}
								className={`${css['dt-FontFace']} ${activeFont === font ? css['dt-FontFace-active'] : ''}`}
								onClick={() => updateFont(font)}
								style={getFontStyle(font)}
							>
								<span className={css['dt-FontFace_Inner']}>
									<span>{font}</span>
								</span>
							</a>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

export default FontPicker
