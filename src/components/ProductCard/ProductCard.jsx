import css from './ProductCard.module.css'
import previewImage from '@/assets/SpiritHero__Banner.jpg'

export default function ProductCard({
	name = 'name',
	price,
	image = previewImage,
	id,
	inputHandle,
	isSelected = false,
}) {
	return (
		<li className={`${css.product__item} ${isSelected ? css.selected : ''}`} key={id} id={id}>
			<span className={css.name}>{name}</span>
			<div className={css.image}>
				<img src={image} alt={name} />
			</div>
			{price && <span className={css.price}>{price}</span>}

			<label className={css.label}>
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
				<input type="checkbox" className="visually-hidden" value={id} onChange={inputHandle} />
			</label>
		</li>
	)
}
