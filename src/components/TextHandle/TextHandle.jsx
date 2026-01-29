import React, { useState, useEffect, useRef } from 'react'
import styles from './TextHandle.module.css'
import FontPicker from '@/components/FontPicker/FontPicker'
import { googleFontApiKey } from '@/helpers/const'

export default function TextHandle({ onAdd, onUpdate, selectedText }) {
	const [text, setText] = useState('')
	const [font, setFont] = useState('Cookie')
	const [bold, setBold] = useState(false)
	const [italic, setItalic] = useState(false)
	const [color, setColor] = useState('#000')
	const [size, setSize] = useState(54)
	const [fonts, setFonts] = useState([])
	const [openFonts, setOpenFonts] = useState(false)
	const [search, setSearch] = useState('')
	const loadedFontsRef = useRef(new Set())

	// Синхронизация с выбранным текстом
	useEffect(() => {
		if (selectedText) {
			setText(selectedText.text || '')
			setFont(selectedText.font || 'Montserrat')
			setBold(selectedText.bold || false)
			setItalic(selectedText.italic || false)
			setColor(selectedText.color || '#000')
			setSize(selectedText.size || 54)
		}
	}, [selectedText])

	// Автоматическое применение изменений к выбранному тексту
	useEffect(() => {
		if (selectedText && onUpdate) {
			onUpdate(text, { font, bold, italic, color, size })
		}
	}, [text, font, bold, italic, color, size])

	function handleAdd() {
		if (!text.trim()) return
		if (onAdd) {
			onAdd(text, { font, bold, italic, color, size })
		}
	}

	// Load fonts list from Google Webfonts API
	// useEffect(() => {
	// 	let cancelled = false
	// 	async function fetchFonts() {
	// 		if (!googleFontApiKey) {
	// 			// fallback small list
	// 			setFonts([
	// 				{ family: 'Montserrat' },
	// 				{ family: 'Roboto' },
	// 				{ family: 'Audiowide' },
	// 				{ family: 'Lora' },
	// 			])
	// 			return
	// 		}
	// 		try {
	// 			const res = await fetch(
	// 				`https://www.googleapis.com/webfonts/v1/webfonts?key=${googleFontApiKey}&sort=popularity`,
	// 			)
	// 			if (!res.ok) throw new Error('Failed to fetch fonts')
	// 			const data = await res.json()
	// 			if (!cancelled) setFonts(data.items || [])
	// 		} catch (err) {
	// 			console.warn('Could not load Google Fonts list, using fallback', err)
	// 			if (!cancelled)
	// 				setFonts([
	// 					{ family: 'Montserrat' },
	// 					{ family: 'Roboto' },
	// 					{ family: 'Audiowide' },
	// 					{ family: 'Lora' },
	// 				])
	// 		}
	// 	}
	// 	fetchFonts()
	// 	return () => {
	// 		cancelled = true
	// 	}
	// }, [])

	// function loadGoogleFontVariant(
	// 	family,
	// 	{ bold: wantBold = false, italic: wantItalic = false } = {},
	// ) {
	// 	if (!family) return
	// 	const key = `${family}::b${wantBold ? 1 : 0}i${wantItalic ? 1 : 0}`
	// 	if (loadedFontsRef.current.has(key)) return
	// 	const familyForUrl = family.split(' ').join('+')
	// 	let href = ''
	// 	// Build Google Fonts CSS2 query depending on requested variants
	// 	if (wantItalic && wantBold) {
	// 		href = `https://fonts.googleapis.com/css2?family=${familyForUrl}:ital,wght@0,400;0,700;1,400;1,700&display=swap`
	// 	} else if (wantItalic) {
	// 		href = `https://fonts.googleapis.com/css2?family=${familyForUrl}:ital,wght@0,400;1,400&display=swap`
	// 	} else if (wantBold) {
	// 		href = `https://fonts.googleapis.com/css2?family=${familyForUrl}:wght@400;700&display=swap`
	// 	} else {
	// 		href = `https://fonts.googleapis.com/css2?family=${familyForUrl}:wght@400&display=swap`
	// 	}
	// 	const link = document.createElement('link')
	// 	link.rel = 'stylesheet'
	// 	link.href = href
	// 	document.head.appendChild(link)
	// 	loadedFontsRef.current.add(key)
	// }

	// useEffect(() => {
	// 	if (font) loadGoogleFontVariant(font, { bold, italic })
	// }, [font, bold, italic])

	return (
		<div className={styles.texthandle}>
			<span>Add text:</span>

			<textarea
				className={`${styles.textarea} light_button_1`}
				placeholder="Add text"
				value={text}
				onChange={(e) => setText(e.target.value)}
			/>

			<button
				className={styles.addBtn}
				type="button"
				onClick={handleAdd}
				disabled={!!selectedText}
				style={{
					opacity: selectedText ? 0.5 : 1,
					cursor: selectedText ? 'not-allowed' : 'pointer',
				}}
			>
				{selectedText ? 'Editing selected text' : 'Add text'}
			</button>

			<div className={styles.row}>
				<div className={styles.column}>
					<span className={styles.input__label}>Font</span>

					<div className={styles.fontpicker__box}>
						<button
							type="button"
							className={styles.fontpicker__button}
							onClick={() => setOpenFonts((v) => !v)}
						>
							<span
								style={{
									fontFamily: font,
									fontWeight: bold ? 700 : 400,
									fontStyle: italic ? 'italic' : 'normal',
								}}
							>
								{font}
							</span>
							<span className={styles.caret}></span>
						</button>

						<FontPicker
							showFontPicker={openFonts}
							setShowFontPicker={setOpenFonts}
							initialFont={font}
							setFont={setFont}
						/>

						{/* {openFonts && (
							<div className={styles.fontpicker__dropdown} role="listbox">
								<input
									className={styles.fontpicker__search}
									placeholder="Search fonts"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
								<ul className={styles.fontpicker__list}>
									{fonts
										.filter((f) =>
											f.family.toLowerCase().includes(search.toLowerCase()),
										)
										.slice(0, 200)
										.map((f) => (
											<li
												key={f.family}
												className={styles.fontpicker__item}
												style={{ fontFamily: `'${f.family}', sans-serif` }}
												onClick={() => {
													setFont(f.family)
													loadGoogleFontVariant(f.family, { bold, italic })
													setOpenFonts(false)
												}}
											>
												{f.family}
											</li>
										))}
								</ul>
							</div>
						)} */}
					</div>
				</div>

				<div className={styles.toggles}>
					<button
						type="button"
						className={styles.toggleBtn}
						aria-pressed={bold}
						onClick={() => setBold((v) => !v)}
					>
						B
					</button>

					<button
						type="button"
						className={styles.toggleBtn}
						aria-pressed={italic}
						onClick={() => setItalic((v) => !v)}
					>
						I
					</button>

					<div className={`${styles.column}`}>
						<span className={`${styles.input__label} ${styles.bold}`}>
							Colour
						</span>

						<label className={styles.color__picker}>
							<span
								className={styles.input__emulator}
								style={{ backgroundColor: color }}
							></span>
							<input
								type="color"
								value={color}
								onChange={(e) => setColor(e.target.value)}
								className={'visually-hidden'}
							/>
						</label>
					</div>
				</div>

				<div className={styles.column}>
					<span className={`${styles.input__label} ${styles.bold}`}>Size</span>

					<input
						className={styles.sizeInput}
						type="number"
						min={6}
						max={100}
						value={size}
						onChange={(e) => setSize(Number(e.target.value) || 0)}
					/>
				</div>
			</div>

			{/* <label className={styles.agreeRow}>
				<input
					type="checkbox"
					checked={agreed}
					onChange={(e) => setAgreed(e.target.checked)}
				/>
				<span>
					By uploading the image, I agree that I have the legal right to
					reproduce and sell the design, and that I am in full compliance with
					SPIRIT HERO's Terms of Use.
				</span>
			</label> */}
		</div>
	)
}
