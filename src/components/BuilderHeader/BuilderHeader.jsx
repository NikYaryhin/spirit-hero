import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { prevStep } from '@/features/navigation/navigationSlice'
import css from './BuilderHeader.module.css'
import logoImage from '@/assets/SpiritHero__Logo.png'
import Chevron from '../Icons/Chevron'
import Account from '../Icons/Account'
import { STEPS_LIST } from '@/helpers/const'
import { useEffect, useState } from 'react'

export default function BuilderHeader({ onNextStep, onFlashSaleSave }) {
	const dispatch = useDispatch()
	const [steps, setSteps] = useState(STEPS_LIST)
	const activeStep = useSelector((state) => state.navigation.activeStep)
	// const customerApproveFlashSale = useSelector((state) => state.flashSale.customerApproveFlashSale)
	const isFlashSale = useSelector((state) => state.flashSale.isFlashSale)

	useEffect(()=>{
		setSteps(
			activeStep > 2 && isFlashSale
				? [...STEPS_LIST, { name: 'Flash sale Settings', id: 5 }]
				: STEPS_LIST
		)
	},[activeStep, isFlashSale])


	const saveAndExitHandle = async () => {
		try {
			if (activeStep === 5 && onFlashSaleSave) {
				await onFlashSaleSave()
			} else {
				await onNextStep()
			}
			window.location.href = 'https://spirit-hero.splitdev.org/store/dashboard'
		} catch (error) {
			console.error('Save and exit error', error)
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

				{/* {isFlashSale && activeStep > 2 && (
					<li
					key={5}
					className={
						5 > activeStep
							? css.inactive
							: 5 === activeStep
								? css.active
								: css.complete
					}
				>
					<span>5</span>
					Flash sale Settings
				</li>
				)} */}
			</ul>

			<div className={css.actions}>
				{activeStep !== 5 && (
					<button className={css.save__button} onClick={saveAndExitHandle}>
						Save and Exit
					</button>
				)}

				<div className={css.buttons__box}>
					<button
						className={`${css.step__button} ${css.prev}`}
						disabled={activeStep === 1}
						onClick={() => dispatch(prevStep())}
					>
						<Chevron rotated={true} />
						Back
					</button>

					{activeStep !== steps.length ? (
						<button
							className={`${css.step__button}`}
							onClick={onNextStep}
							disabled={activeStep === 5}
						>
							Next
							<Chevron rotated={false} />
						</button>
					) : (
						<button className={css.save__button} onClick={saveAndExitHandle}>
							Save and Submit
						</button>
					)}

					<Link to="https://spirit-hero.splitdev.org/" className={css.account__button}>
						<Account />
					</Link>
				</div>
			</div>
		</div>
	)
}
