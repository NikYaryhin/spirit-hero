import css from './ColorCheckbox.module.css'

export default function ColorCheckbox({ color, name }) {
	return (
		<label className={css.label}>
			<span className={css.color} style={{ backgroundColor: color }}></span>
			<span className={css.name}>{name}</span>
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
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</span>
			<input type="checkbox" className="visually-hidden" value={color} />
		</label>
	)
}
