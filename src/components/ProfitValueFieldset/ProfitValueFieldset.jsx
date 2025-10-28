import { useState } from 'react'
import Icon from '../Icon'
import css from './ProfitValueFieldset.module.css'

export default function ProfitValueFieldset({
	title,
	valuesArray,
	disabled,
	setProfitValue,
	isPercent = false,
}) {
	const [isOwnValue, setIsOwnValue] = useState(false)
	const [ownValue, setOwnValue] = useState(1)

	const [presetValue, setPresetValue] = useState(valuesArray[0])

	const onRadioChange = (e) => {
		const { value } = e.target

		setIsOwnValue(false)
		setPresetValue(value)

		setProfitValue(+value)
	}

	const onCheckboxChange = (e) => {
		const { checked } = e.target

		setIsOwnValue(checked)
		checked && setProfitValue(ownValue || 1)
	}

	const onNumberChange = (e) => {
		const { value, max, min } = e.target
		let newValue = value

		if (+newValue > +max) {
			e.target.value = max
			newValue = max
		}
		if (+newValue < +min) {
			e.target.value = min
			newValue = min
		}
		setOwnValue(+newValue)
		setProfitValue(+newValue)
	}

	return (
		<fieldset className={css.profit__value}>
			<span className={css.handle__title}>{title}</span>

			<div className={css.label__container}>
				{valuesArray.map((value) => (
					<label className={css.profit__label} key={value}>
						{!isPercent ? '$' : '%'}
						{value}
						<input
							onChange={onRadioChange}
							type="radio"
							name={`profit--value${isPercent ? '--percent' : ''}`}
							value={value}
							className="visually-hidden"
							checked={+value === +presetValue}
							disabled={isOwnValue || disabled}
						/>
					</label>
				))}
			</div>

			<div className={css.profit__custom__input}>
				<label className={css.label}>
					<span className={css.checkbox__emulator}>
						<Icon name={'InputChecked'} />
					</span>
					Add by my own
					<input
						onChange={onCheckboxChange}
						type="checkbox"
						className="visually-hidden"
						disabled={disabled}
					/>
				</label>
				<input
					onChange={(e) => onNumberChange(e)}
					className={css['profit__custom__input--number']}
					type="number"
					min={0.5}
					max={100}
					placeholder={`${!isPercent ? '$' : '%'}_ _`}
					disabled={!isOwnValue}
				/>
			</div>
		</fieldset>
	)
}
