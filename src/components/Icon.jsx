export default function Icon({ name, className }) {
	switch (name) {
		case 'ChevronUp':
			return (
				<svg
					className={className}
					width="14"
					height="8"
					viewBox="0 0 14 8"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M2 6L7 1L12 6"
						stroke="#4E008E"
						strokeWidth="1.5"
						strokeLinecap="square"
						strokeLinejoin="round"
					/>
				</svg>
			)

		default:
			return (
				<svg
					className={className}
					width="14"
					height="8"
					viewBox="0 0 14 8"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M2 6L7 1L12 6"
						stroke="#4E008E"
						strokeWidth="1.5"
						strokeLinecap="square"
						strokeLinejoin="round"
					/>
				</svg>
			)
	}
}
