import React from 'react'

export default function Chevron({ rotated }) {
	return (
		<svg
			className={rotated ? 'rotated' : ''}
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g clipPath="url(#clip0_5860_118017)">
				<path
					d="M6 4L10 8L6 12"
					stroke="#4E008E"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>
			<defs>
				<clipPath id="clip0_5860_118017">
					<rect width="16" height="16" fill="white" />
				</clipPath>
			</defs>
		</svg>
	)
}
