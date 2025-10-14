import { Routes, Route, Link, NavLink, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import Builder from './pages/BuilderPage.jsx'

export default function App() {
	return (
		<>
			<main>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/builder" element={<Builder />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</main>
		</>
	)
}
