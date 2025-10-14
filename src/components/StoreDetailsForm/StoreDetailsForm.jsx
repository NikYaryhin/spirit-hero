import ColorCheckbox from '../ColorCheckbox/ColorCheckbox'
import css from './StoreDetailsForm.module.css'

const COLORS = [
	{ color: '#41FB8B', name: 'Green', id: 1 },
	{ color: '#373239', name: 'Black', id: 2 },
	{ color: '#FCFCFC', name: 'White', id: 3 },
	{ color: '#71CAF4', name: 'Light Blue', id: 4 },
	{ color: '#877A7A', name: 'Grey', id: 5 },
	{ color: '#F830E0', name: 'Rose', id: 6 },
	{ color: '#3639F7', name: 'Deep Blue', id: 7 },
	{ color: '#FB4741', name: 'Red', id: 8 },
	{ color: '#FBF841', name: 'Yellow', id: 9 },
	{ color: '#9747FF', name: 'Purple', id: 10 },
]

export default function StoreDetailsForm() {
	return (
		<section className={css['store--details__section']}>
			<form action="submit" className={css['store--details__form']}>
				<fieldset>
					<legend>1. Store details</legend>

					<label className={css['text--label']}>
						<span className={css['input--label']}>Add Name</span>
						<input type="text" placeholder="Enter name of your store" required />
					</label>

					<label className={css['text--label']}>
						<span className={css['input--label']}>Add Website URL</span>
						<input type="text" placeholder="ex.spirithero.com/abc-spirit-wear-store" required />
					</label>

					<div className={css['social--media__inputs--box']}>
						<label className={css['text--label']}>
							<span className={css['input--label']}>
								Add Social Media <em>(optional)</em>
							</span>
							<input type="text" placeholder="https://tiktok.com" />
						</label>

						<label className={css['text--label']}>
							<span className={css['input--label']}>
								Add Social Media <em>(optional)</em>
							</span>
							<input type="text" placeholder="https://x.com" />
						</label>
					</div>
				</fieldset>
			</form>

			<form action="submit" className={css['store--details__form']}>
				<fieldset>
					<legend>2. Choose primary colors (multiple choice is available)</legend>

					<p className={css.paragraph}>
						<span>
							Choose colors for the products you will sell in your store. Be sure to select colors
							that will look good with your logo on them.
						</span>
						<span>
							Our system automatically selects products & colorizes design templates based on your
							store colors.
						</span>
					</p>

					<ul className={css['color--picker__list']}>
						{COLORS.map(({ color, name, id }) => (
							<li key={id}>
								<ColorCheckbox color={color} name={name} />
							</li>
						))}
					</ul>
				</fieldset>
			</form>
		</section>
	)
}
