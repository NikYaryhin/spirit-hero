import { useEffect } from 'react'
import Portal from '../Portal/Portal'
import css from './Modal.module.css'

export default function Modal({ isOpen, onClose, children }) {
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
			<div className={css.overlay} onMouseDown={onClose}>
				<div className={css.dialog} onMouseDown={(e) => e.stopPropagation()}>
					<button className={css.close} onClick={onClose} aria-label="Close">
						×
					</button>
					{children}
				</div>
			</div>
		</Portal>
	)
}
