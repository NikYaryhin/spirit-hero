import { Link } from 'react-router-dom'
import bannerImage from '@/assets/SpiritHero__Banner.jpg'
import ChatLogo from '@/assets/SpiritHero__Chat--Icon.svg'
import ThunderLogo from '@/assets/SpiritHero__Thunder.svg'
import BoxLogo from '@/assets/SpiritHero__Box.svg'
import css from './Home.module.css'

export default function Home() {
	return (
		<section className={css.home__section}>
			<div className={css.banner}>
				<img
					loading="lazy"
					src={bannerImage}
					alt="Group of fans in red and white Chargers shirts cheering and waving pom-poms in the stands."
				/>
			</div>

			<div className={css.home__content}>
				<div className={css['home__content--info']}>
					<h1 className={css.home__title}>Welcome to Spirit Hero!</h1>

					<span className={css.home__label}>Let’s Get Started!</span>
					<span className={css.home__sublabel}>How do you want to start?</span>

					<nav className={css.home__navigation}>
						<ul>
							<li>
								<Link to="/builder">
									<img src={ThunderLogo} alt="Thunder Logo" loading="lazy" />
									Start on Line Store?
								</Link>
							</li>
							<li>
								<Link to="/builder">
									<img src={BoxLogo} alt="Box Logo" loading="lazy" />
									Place a Bulk Order
								</Link>
							</li>
						</ul>
					</nav>
				</div>

				<div className={css['home__content--bottom__wrapper']}>
					<div className={css['home__content--bottom']}>
						<div className={css['home__content--bottom__icon']}>
							<img src={ChatLogo} alt="Chat Logo" loading="lazy" />
						</div>
						<p className={css['home__content--bottom__text']}>
							<span className={css['home__content--bottom__label']}>
								Talk to an Experts{' '}
							</span>
							<span className={css['home__content--bottom__sublabel']}>
								Talk to an experts for free about your fundraising needs{' '}
							</span>
						</p>

						<a className={css['home__content--bottom__button']}>Book a Demo</a>
					</div>
				</div>
			</div>
		</section>
	)
}
