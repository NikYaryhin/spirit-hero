import css from './ProductCustomizerCard.module.css'

export default function ProductCustomiserCard({ onProductClick, product }) {
	const { id, product_title } = product

	return <li key={id}>{product_title}</li>
}
