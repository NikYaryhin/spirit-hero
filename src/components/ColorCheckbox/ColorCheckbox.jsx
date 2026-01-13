import { useState } from 'react'
import css from './ColorCheckbox.module.css'

export default function ColorCheckbox({
	onInputHandle,
	color,
	name,
	required,
	inputName,
	checkedColor,
	className,
}) {
	// const [isChecked, setIsChecked] = useState(checkedColor)

	const onInputChange = (e) => {
		const { checked, value } = e.currentTarget

		onInputHandle(checked, value)
	}
	return (
		<label className={`${css.label} ${css[className]}`}>
			<span className={css.checkbox__emulator}>
				<svg
					width="18"
					height="13"
					viewBox="0 0 18 13"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M1 7.1875L5.86957 12L17 1"
						stroke="#4E008E"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</span>
			<span className={css.color} style={{ backgroundColor: color }}></span>
			<span className={css.name}>{name}</span>

			<input
				checked={checkedColor}
				onChange={onInputChange}
				type="checkbox"
				className="visually-hidden"
				name={inputName}
				value={color}
				required={required}
			/>
		</label>
	)
}
