import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { prevStep } from '@/features/navigation/navigationSlice'
import css from './BuilderHeader.module.css'
import logoImage from '@/assets/SpiritHero__Logo.png'
import Chevron from '../Icons/Chevron'
import Account from '../Icons/Account'
import { steps } from '@/helpers/const'

export default function BuilderHeader({ onNextStep }) {
	const dispatch = useDispatch()
	const activeStep = useSelector((state) => state.navigation.activeStep)

	const saveAndExitHandle = async () => {
		try {
			await onNextStep()
			window.location.href = '/'
		} catch (error) {
			console.error('Save and axit error', error)
		}
	}
	return (
		<div className={css.header}>
			<div className={css.logo}>
				<img src={logoImage} alt="SpiritHero Logo" loading="lazy" />
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
				<button className={css.save__button} onClick={saveAndExitHandle}>
					Save and Exit
				</button>

				<div className={css.buttons__box}>
					<button
						className={`${css.step__button} ${css.prev}`}
						disabled={activeStep === 1}
						onClick={() => dispatch(prevStep())}
					>
						<Chevron rotated={true} />
						Back
					</button>

					<button
						className={`${css.step__button}`}
						onClick={onNextStep}
						disabled={activeStep === 5}
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
