import { Routes, Route, Link, NavLink } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import Builder from './pages/BuilderPage.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
	return (
		<>
			<header className="app--header">
				<nav>
					<ul>
						<li>
							<NavLink to="/" className={({ isActive }) => (isActive ? 'active' : undefined)}>
								Home
							</NavLink>
						</li>
					</ul>
				</nav>
			</header>

			<main>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/builder" element={<Builder />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</main>
		</>
	)
}
