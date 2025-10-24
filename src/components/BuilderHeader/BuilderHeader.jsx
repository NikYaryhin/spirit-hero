import { useState } from 'react'
import { Link } from 'react-router-dom'
import css from './BuilderHeader.module.css'
import logoImage from '@/assets/SpiritHero__Logo.png'
import Chevron from '../Icons/Chevron'
import Account from '../Icons/Account'

const stepsArr = [
	{ name: 'Details', id: 1 },
	{ name: 'Products', id: 2 },
	{ name: 'Design', id: 3 },
	{ name: 'Fundraising', id: 4 },
]

export default function BuilderHeader({ activeStep, setActiveStep, onNextStep }) {
	const [steps, setSteps] = useState(stepsArr)

	return (
		<div className={css.header}>
			<div className={css.logo}>
				<img src={logoImage} alt="SpiritHero Logo" />
			</div>

			<ul className={css.steps}>
				{steps.map((step) => (
					<li
						key={step.id}
						className={
							step.id > activeStep
								? css.inactive
								: step.id === activeStep
									? css.active
									: css.complete
						}
					>
						<span>{step.id}</span>
						{step.name}
					</li>
				))}
			</ul>

			<div className={css.actions}>
				<Link to="/" className={css.save__button}>
					Save and Exit
				</Link>

				<div className={css.buttons__box}>
					<button
						className={`${css.step__button} ${css.prev}`}
						disabled={activeStep === 1}
						onClick={() => setActiveStep((prev) => Math.max(prev - 1, 1))}
					>
						<Chevron rotated={true} />
						Back
					</button>

					<button
						className={`${css.step__button}`}
						onClick={onNextStep || (() => setActiveStep((prev) => Math.min(prev + 1, steps.length)))}
					>
						Next
						<Chevron rotated={false} />
					</button>

					<Link to="/" className={css.account__button}>
						<Account />
					</Link>
				</div>
			</div>
		</div>
	)
}
