import React, { useState, useEffect } from 'react'
import styles from './TextHandle.module.css'
import FontPicker from '@/components/FontPicker/FontPicker'

export default function TextHandle({ onAdd, onUpdate, selectedText }) {
	const [text, setText] = useState('')
	const [font, setFont] = useState('Cookie')
	const [bold, setBold] = useState(false)
	const [italic, setItalic] = useState(false)
	const [color, setColor] = useState('#000')
	const [size, setSize] = useState(54)
	const [openFonts, setOpenFonts] = useState(false)

	// Синхронизация с выбранным текстом
	useEffect(() => {
		if (selectedText) {
			setText(selectedText.text || '')
			setFont(selectedText.font || 'Cookie')
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
