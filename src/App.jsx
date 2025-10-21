import { Routes, Route, Link, NavLink, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
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

			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick={false}
				rtl={false}
				pauseOnFocusLoss
				pauseOnHover
				theme="light"
			/>
		</>
	)
}
