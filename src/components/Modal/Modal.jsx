import { useEffect } from 'react'
import Portal from '../Portal/Portal'
import css from './Modal.module.css'
import Icon from '../Icon'

export default function Modal({ isOpen, onClose, className, children }) {
	useEffect(() => {
		if (!isOpen) return
		const onKey = (e) => {
			if (e.key === 'Escape') onClose()
		}
		document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [isOpen, onClose])

	if (!isOpen) return null

	return (
		<Portal>
			<div className={`${css.overlay} ${css[className]}`} onMouseDown={onClose}>
				<div className={css.dialog} onMouseDown={(e) => e.stopPropagation()}>
					<button className={css.close} onClick={onClose} aria-label="Close">
						<Icon name="Cancel" />
					</button>
					{children}
				</div>
			</div>
		</Portal>
	)
}
