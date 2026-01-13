import css from './Loader.module.css'

export default function Loader({ label = 'Loading...' }) {
	return (
		<div className={css['loader__wrap']}>
			<div className={css.spinner} aria-hidden="true" />
			{label ? <span className={css['loader__label']}>{label}</span> : null}
		</div>
	)
}
