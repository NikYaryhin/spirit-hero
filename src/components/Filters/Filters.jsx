import css from './Filters.module.css'
import Icon from '../Icon'

export default function Filters({
	keyName,
	filterName,
	category,
	open,
	setActiveFilters,
}) {
	const filterCheckboxHandle = (event) => {
		const { value, checked } = event.currentTarget

		setActiveFilters((prev) => {
			const newFilters = [...prev[keyName]]
			if (checked) {
				newFilters.push(value)
			} else {
				newFilters.splice(newFilters.indexOf(value), 1)
			}
			return { ...prev, [keyName]: newFilters }
		})
	}

	return (
		<details className={css['products_filter-group']} open={open} key={keyName}>
			<summary>
				{filterName === 'colorFamilies' ? 'Colors' : filterName}{' '}
				<Icon name="ChevronUp" />
			</summary>

			<ul className={css.filters__list}>
				{category.map(({ category, id, name, product_color_name }) => (
					<li key={id}>
						<label className={css.category__label}>
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
							/>
						</label>
					</li>
				))}
			</ul>
		</details>
	)
}
