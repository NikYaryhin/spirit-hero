import { useEffect, useState } from 'react'
import css from './DesignStep.module.css'
import spiritHeroApi from '@/api/spiritHeroApi'
import ProductCustomizerCard from '../ProductCustomizerCard/ProductCustomizerCard'
import Icon from '../Icon'
import ImageUploader from '../ImageUploader/ImageUploader'
import TextHandle from '../TextHandle/TextHandle'

export default function DesignStep({ myShopProducts }) {
	const [customizerType, setCustomizerType] = useState(null)

	// image uploader states (moved from ImageUploader)
	const [uploaderFiles, setUploaderFiles] = useState([])
	const [uploaderAgreed, setUploaderAgreed] = useState(false)
	const [uploaderDragOver, setUploaderDragOver] = useState(false)

	useEffect(() => {
		spiritHeroApi
			.getTemplates()
			.then((res) => console.log(res))
			.catch((error) => console.error(error))

		console.log('myShopProducts', myShopProducts)
	}, [myShopProducts])

	return (
		<div className={css.design_section}>
			{myShopProducts.length > 0 ? (
				<>
					<div className={css.image__box}>
						<img
							src={myShopProducts[0].product_image}
							alt={myShopProducts[0].product_title}
						/>
					</div>

					<div className={css.settings__box}>
						<button className={`${css.button} contrast_button_1`}>
							<Icon name={'Palette'} />
							Request a custom design
						</button>

						<h1 className={css.title}>Create your design</h1>

						<span className={css.subtitle}>
							Choose options from ready solutions to the custom ones
						</span>

						<div className={css.customizer}>
							<fieldset className={css.customizer__pickers}>
								<label>
									<Icon name={'Frame'} />
									Add Image
									<input
										onChange={(event) =>
											setCustomizerType(event.currentTarget.value)
										}
										value="image"
										type="radio"
										name="customizer--option"
										className="visually-hidden"
									/>
								</label>

								<label>
									<Icon name={'Letters'} />
									Add Text
									<input
										onChange={(event) =>
											setCustomizerType(event.currentTarget.value)
										}
										value="text"
										type="radio"
										name="customizer--option"
										className="visually-hidden"
									/>
								</label>

								<label>
									<Icon name={'Edits'} />
									Templates
									<input
										onChange={(event) =>
											setCustomizerType(event.currentTarget.value)
										}
										value="template"
										type="radio"
										name="customizer--option"
										className="visually-hidden"
									/>
								</label>
							</fieldset>

							<div className={css.customizer__tools}>
								{customizerType === 'image' && (
									<ImageUploader
										files={uploaderFiles}
										setFiles={setUploaderFiles}
										agreed={uploaderAgreed}
										setAgreed={setUploaderAgreed}
										dragOver={uploaderDragOver}
										setDragOver={setUploaderDragOver}
									/>
								)}

								{customizerType === 'text' && <TextHandle />}
							</div>
						</div>

						<ul>
							{myShopProducts.length > 0 &&
								myShopProducts.map((product) => (
									<ProductCustomizerCard
										onProductClick={() => {
											console.log('click')
										}}
										product={product}
									/>
								))}
						</ul>
					</div>
				</>
			) : (
				<h2>There is no products in your shop</h2>
			)}
		</div>
	)
}
