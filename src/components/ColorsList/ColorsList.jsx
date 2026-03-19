import css from './ColorsList.module.css'
import ColorCheckbox from '@/components/ColorCheckbox/ColorCheckbox'
import { COLORS } from '@/helpers/const'
import { useEffect,useState } from 'react'
import spiritHeroApi from '@/api/spiritHeroApi'

export default function ColorsList({ colorInputHandle, colors }) {
	console.log('colors',colors)
	const [colorsApi, setColorsApi] = useState([])
	useEffect(()=>{
		const fetchColors = async () => {
			const colorsData = await spiritHeroApi.getColors()
			setColorsApi(colorsData.colors)

		}
		fetchColors()
	},[])
	return (
		<ul className={css['color--picker__list']}>
			{colorsApi.map(({ ink_color:color, ink_color_name:name, id }) => {
				return (
					<li key={id}>
						<ColorCheckbox
							onInputHandle={colorInputHandle}
							color={color}
							colors={colors}
							name={name}
							id={id}
							checkedColor={colors.includes(color)}
							inputName="color--input"
						/>
					</li>
				)
			})}
		</ul>
	)
}
