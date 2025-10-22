import Icon from '../Icon'
import css from './CustomSelect.module.css'
import { useState } from 'react'

export default function CustomSelect({ name, info, values, setColorCount }) {
	const initial = values && values.length > 0 ? values[0].value : null
	const [currentValue, setCurrentValue] = useState(initial)

	const handleSelect = (value, quantity) => {
		setCurrentValue(value)
		setColorCount(quantity)
	}

	return (
		<details className={css.custom__select} name={name}>
			<summary className={css.current__value}>
				{currentValue}

				<Icon name="ChevronUp" />
			</summary>

			<div className={css['custom__select--content']}>
				{info && (
					<span className={css.info}>
						<Icon name="Info" />
						{info}
					</span>
				)}

				{values && (
					<ul
						className={css.select__list}
						role="listbox"
						aria-activedescendant={currentValue}
						tabIndex={-1}
					>
						{values.map(({ id, value, quantity }) => (
							<li
								key={id}
								role="option"
								aria-selected={value === currentValue}
								onClick={() => handleSelect(value, quantity)}
								tabIndex={0}
							>
								{currentValue === value && <Icon name="Checked" />}
								{value}
							</li>
						))}
					</ul>
				)}
			</div>
		</details>
	)
}
