import css from './Loader.module.css'

export default function Loader({ label = 'Loading...', size = 32 }) {
	const style = { '--size': `${size}px` }
	return (
		<div className={css['loader__wrap']} style={style}>
			<div
				className={css.spinner}
				aria-hidden="true"
				style={{ width: size, height: size }}
			/>
			{label ? <span className={css['loader__label']}>{label}</span> : null}
		</div>
	)
}
