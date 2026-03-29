import css from './Filters.module.css'
import Icon from '../Icon'
import { useEffect, useState } from 'react'

export default function Filters({
	keyName,
	filterName,
	category,
	open,
	setActiveFilters,
	checkedFilters,
	products,
	isCatalog
}) {
	console.log("checkedFilters",checkedFilters)
	// const [hideCategory, setHideCategory] = useState(false)

	// useEffect(() => {
	// 	const passCategories = category.map(({id}) => {
	// 		return passCategory(id)
	// 	})

	// 	setHideCategory(passCategories.every(pass => pass === false))
	// }, [])

	const passCategory = (id) => {
		const keyNameLowerCase = keyName.toLowerCase()
		let pass

		if (keyNameLowerCase === 'productgroups') {
			pass = products.some((product) => product.group_id === id)
		}
		if (keyNameLowerCase === 'categories') {
			pass = products.some((product) => product.category_id === id)
		}
		if (keyNameLowerCase === 'brands') {
			pass = products.some((product) => product.brand_id === id)
		}
		if (keyNameLowerCase === 'colorfamilies') {
			pass = products.some((product) =>
				(!isCatalog ? product.choosed_colors : product.colors)?.some(
					(color) => color.parent_color_id === id
				)
			)
		}
		return pass
	}

	const filterCheckboxHandle = (event) => {
		const { value, checked } = event.currentTarget

		setActiveFilters((prev) => {
			const newFilters = prev[keyName] ? [...prev[keyName]] : []

			if (checked) {
				newFilters.push(value)
			} else {
				newFilters.splice(newFilters.indexOf(value), 1)
			}
			return { ...prev, [keyName]: newFilters }
		})
	}
	const handleCategoryClick = (id) => {
		if (!checkedFilters) return

		if (checkedFilters.includes(String(id))) {
			filterCheckboxHandle({
				currentTarget: { value: String(id), checked: false }
			})
		} else {
			filterCheckboxHandle({
				currentTarget: { value: String(id), checked: true }
			})
		}
	}
	// if(!hideCategory) return (
	return (
		<details className={css['products_filter-group']} open={open} key={keyName}>
			<summary>
				{filterName.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()} <Icon name="ChevronUp" />
				{/* {filterName === 'colorFamilies' ? 'Colors' : filterName} <Icon name="ChevronUp" /> */}
			</summary>

			{/*<ul className={css.filters__list}>
				{category.map(({ category, id, name, product_color_name,product_color }) => {
					let isPass = passCategory(id)

					return (
						// <li key={id} className={!isPass ? 'visually-hidden' : ''}>
						<li key={id} className={isPass ? '' : 'visually-hidden'}>
							<label className={css.category__label}>
								<span className={css.checkbox__emulator}>
									<Icon name="Checked" />
								</span>

								{keyName.toLowerCase()==='colorfamilies' && <span className={css.color} style={{ backgroundColor: product_color }}></span> }


								{keyName.toLowerCase()!=='colorfamilies' && <span className={css.category__name}>{category || name || product_color_name}</span> }


								<span className={css.category__name}>{category || name || product_color_name}</span>

								<input
									onChange={filterCheckboxHandle}
									className="visually-hidden"
									type="checkbox"
									value={id}
									checked={checkedFilters ? checkedFilters.includes(String(id)) : false}
									// checked={checkedFilters.includes(String(id)) || false}
								/>
							</label>
						</li>
					)
				})}
			</ul>*/}

			<ul className={`${css.filters__list} ${
				keyName.toLowerCase() === 'colorfamilies' ? css.row : ''
			}`}>
				{category.map(({ category, id, name, product_color_name, product_color }) => {
					let isPass = passCategory(id)
					const isActive = checkedFilters?.includes(String(id))

					return (
						<li key={id} className={isPass ? '' : 'visually-hidden'}>
							<label
								className={`${css.category__label} ${
									isActive ? css.active : ''
								}`}
								onClick={() => {
									if (keyName.toLowerCase() === 'colorfamilies') {
										handleCategoryClick(id)
									}
								}}
							>
								{/* 👉 COLORFAMILIES */}
								{keyName.toLowerCase() === 'colorfamilies' && (
									<>
							<span
								className={css.color}
								style={{ backgroundColor: product_color }}
							/>
									</>
								)}

								{/* 👉 ВСІ ІНШІ */}
								{keyName.toLowerCase() !== 'colorfamilies' && (
									<>
							<span className={css.checkbox__emulator}>
								<Icon name="Checked" />
							</span>

										<span className={css.category__name}>
								{category || name || product_color_name}
							</span>

										<input
											onChange={filterCheckboxHandle}
											className="visually-hidden"
											type="checkbox"
											value={id}
											checked={checkedFilters ? checkedFilters.includes(String(id)) : false}
										/>
									</>
								)}
							</label>
						</li>
					)
				})}
			</ul>
		</details>
	)
}
