import css from './ColorsList.module.css'
import ColorCheckbox from '@/components/ColorCheckbox/ColorCheckbox'
import { COLORS } from '@/helpers/const'
import { useEffect,useState } from 'react'
import spiritHeroApi from '@/api/spiritHeroApi'

export default function ColorsList({ colorInputHandle, colors }) {

	useEffect(()=>{
		const fetchColors = async () => {
			const colorsData = await spiritHeroApi.getColors()
			console.log("colorsData", colorsData);
		}
		fetchColors()
	},[])
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
