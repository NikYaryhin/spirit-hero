import css from './ColorsList.module.css'
import ColorCheckbox from '@/components/ColorCheckbox/ColorCheckbox'
import { COLORS } from '@/helpers/const'

export default function ColorsList({ colorInputHandle, colors }) {
	return (
		<ul className={css['color--picker__list']}>
			{COLORS.map(({ color, name, id }) => {
				return (
					<li key={id}>
						<ColorCheckbox
							onInputHandle={colorInputHandle}
							color={color}
							colors={colors}
							name={name}
							checkedColor={colors.includes(color)}
							inputName="color--input"
						/>
					</li>
				)
			})}
		</ul>
	)
}
