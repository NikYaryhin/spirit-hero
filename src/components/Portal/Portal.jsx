import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Portal({ children }) {
	useEffect(() => {
		let root = document.getElementById('portal-root')
		if (!root) {
			root = document.createElement('div')
			root.setAttribute('id', 'portal-root')
			document.body.appendChild(root)
		}
		return () => {
		}
	}, [])

	const root =
		typeof window !== 'undefined'
			? document.getElementById('portal-root')
			: null
	if (!root) return null
	return createPortal(children, root)
}
