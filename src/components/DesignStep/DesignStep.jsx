import css from './DesignStep.module.css'
import {
	useEffect,
	useState,
	useRef,
	useImperativeHandle,
	forwardRef,
} from 'react'
import ProductCustomizerCard from '../ProductCustomizerCard/ProductCustomizerCard'
import ImageUploader from '../ImageUploader/ImageUploader'
import Icon from '../Icon'
import Loader from '../Loader/Loader'
import spiritHeroApi from '@/api/spiritHeroApi'
import TextHandle from '../TextHandle/TextHandle'
import { v4 as uuidv4 } from 'uuid'
import { useSelector } from 'react-redux'
import domtoimage from 'dom-to-image-more'

const DesignStep = forwardRef((props, ref) => {
	const params = new URLSearchParams(window.location.search)
	const storeIdFromQuery = params.get('store_id')
	const storeId =
		useSelector((state) => state.flashSale.storeId) || storeIdFromQuery

	const [customizerType, setCustomizerType] = useState(null)

	const [isLoading, setIsLoading] = useState(true)
	const [productsByCategory, setProductsByCategory] = useState(null)
	const [activeCardId, setActiveCardId] = useState(null)
	const [customerLogos, setCustomerLogos] = useState({
		elementsPositionImage: '',
		customerLogos: [],
		labels: [],
	})

	const [image, setImage] = useState(null)

	const [uploaderFiles, setUploaderFiles] = useState([])
	const [uploaderAgreed, setUploaderAgreed] = useState(false)
	const [uploaderDragOver, setUploaderDragOver] = useState(false)

	const [customElements, setCustomElements] = useState([])
	const [hideBorders, setHideBorders] = useState(false)
	const containerRef = useRef(null)
	const imageBoxRef = useRef(null)

	// Функция для конвертации URL в base64
	const urlToBase64 = async (url) => {
		try {
			// Преобразуем protocol-relative URL (//cdn.com/...) в полный URL
			let fullUrl = url
			if (url.startsWith('//')) {
				fullUrl = 'https:' + url
			}

			const response = await fetch(fullUrl, {
				mode: 'cors',
				credentials: 'omit',
			})
			const blob = await response.blob()
			return new Promise((resolve) => {
				const reader = new FileReader()
				reader.onloadend = () => resolve(reader.result)
				reader.readAsDataURL(blob)
			})
		} catch (error) {
			console.error('Error converting image to base64:', error)
			return url
		}
	}

	// Функция для проверки, является ли строка base64
	const isBase64 = (str) => {
		if (!str || typeof str !== 'string') return false
		return str.startsWith('data:image/')
	}

	useEffect(() => {
		const fetchStoreData = async () => {
			try {
				const res = await spiritHeroApi.getStore(storeId)

				console.debug('spiritHeroApi.getStore', res)

				setCustomerLogos({ ...res.design })

				const loadedElements = []
				const serverImageFiles = []
				let zIndex = 1

				if (
					res.design.customerLogos &&
					Array.isArray(res.design.customerLogos)
				) {
					res.design.customerLogos.forEach((logoData, index) => {
						const id = uuidv4()
						loadedElements.push({
							id,
							type: 'image',
							x: logoData.x || 30,
							y: logoData.y || 30,
							width: logoData.width || 100,
							height: logoData.height || 100,
							rotation: 0,
							zIndex: zIndex++,
							content: { src: logoData.image },
							isServerImage: true,
						})

						serverImageFiles.push({
							url: logoData.image,
							base64: logoData.image,
							file: { name: `Server image ${index + 1}` },
							isServerImage: true,
						})
					})
				}
				console.debug('Server image files:', serverImageFiles)
				setUploaderFiles(serverImageFiles)

				if (res.design.labels && Array.isArray(res.design.labels)) {
					res.design.labels.forEach((labelData) => {
						const id = uuidv4()
						loadedElements.push({
							id,
							type: 'text',
							x: labelData.x || 20,
							y: labelData.y || 20,
							width: 'fit-content',
							maxWidth: 300,
							height: 'fit-content',
							rotation: 0,
							zIndex: zIndex++,
							content: labelData.text || '',
							style: {
								fontFamily: labelData.fontFamily || 'Montserrat',
								fontSize:
									typeof labelData.fontSize === 'number'
										? `${labelData.fontSize}px`
										: labelData.fontSize || '54px',
								color: labelData.color || '#000000',
								fontWeight: labelData.bold ? 700 : 400,
								fontStyle: labelData.italic ? 'italic' : 'normal',
							},
						})
					})
				}

				console.debug('Loaded elements from server:', loadedElements)
				setCustomElements(loadedElements)

				const sortedProducts = res.products.reduce((acc, product, idx) => {
					acc[product.category_id] = [
						...(acc[product.category_id] || []),
						product,
					]
					if (idx === 0) {
						setActiveCardId(product.id)
						setImage(product.product_image)
					}
					return acc
				}, {})

				setProductsByCategory(sortedProducts)
			} catch (error) {
				console.error(`spiritHeroApi.getStore error`, error)
			} finally {
				setIsLoading(false)
			}
		}
		fetchStoreData()
	}, [])

	// Автоматически конвертируем image в base64 при изменении
	useEffect(() => {
		if (image && !isBase64(image)) {
			urlToBase64(image).then((base64) => {
				setImage(base64)
			})
		}
	}, [image])

	useEffect(() => {
		setCustomElements((prev) => {
			const currentUrls = uploaderFiles.map((f) => f.url)
			const updatedElements = prev.filter((el) => {
				if (el.type === 'image' && el.content?.src) {
					return currentUrls.includes(el.content.src)
				}

				return true
			})

			uploaderFiles.forEach((f) => {
				const exists = updatedElements.some(
					(el) => el.type === 'image' && el.content?.src === f.url,
				)
				if (!exists) {
					const id = uuidv4()
					const el = {
						id,
						type: 'image',
						x: 30,
						y: 30,
						width: 100,
						height: 100,
						rotation: 0,
						zIndex: (updatedElements.length || 0) + 1,
						content: { src: f.url },
						isServerImage: false,
					}
					updatedElements.push(el)
				}
			})

			return updatedElements
		})
	}, [uploaderFiles])

	const updateCustomerLogos = async () => {
		const labels = []
		const customerLogos = []

		for (const element of customElements) {
			if (element.type === 'text') {
				labels.push({
					text: element.content,
					fontFamily: element.style.fontFamily || 'Montserrat',
					fontSize: element.style.fontSize || '54px',
					color: element.style.color || '#000000',
					bold: element.style.fontWeight === '700',
					italic: element.style.fontStyle === 'italic',
					x: element.x,
					y: element.y,
					width: element.width,
					height: element.height,
				})
			} else if (element.type === 'image') {
				if (element.isServerImage) {
					customerLogos.push({
						image: element.content.src,
						x: element.x,
						y: element.y,
						width: element.width,
						height: element.height,
					})
				} else {
					const fileData = uploaderFiles.find(
						(f) => f.url === element.content.src,
					)
					if (fileData && fileData.base64) {
						customerLogos.push({
							image: fileData.base64,
							x: element.x,
							y: element.y,
							width: element.width,
							height: element.height,
						})
					}
				}
			}
		}

		setCustomerLogos((prev) => ({
			...prev,
			customerLogos: customerLogos,
			labels: labels,
		}))
	}

	// Обновляем customerLogos при изменении uploaderFiles (добавление/удаление изображений)
	useEffect(() => {
		updateCustomerLogos()
	}, [uploaderFiles])

	// Функция для создания скриншота контейнера custom__elements
	const getLogoParameters = async () => {
		try {
			setHideBorders(true)
			const base64 = await domtoimage.toJpeg(imageBoxRef.current, {
				quality: 0.95,
			})

			// const link = document.createElement('a')
			// link.download = 'my-component-image.png'
			// link.href = base64
			// link.click()

			setCustomerLogos((prev) => ({
				...prev,
				elementsPositionImage: base64,
			}))

			const payload = {
				...customerLogos,
				elementsPositionImage: base64,
				store_id: storeId,
				product_id: +activeCardId,
			}

			console.log({ payload })

			const response = await spiritHeroApi.createDesign(storeId, payload)
			console.debug('spiritHeroApi.createDesign response', response)
		} catch (error) {
			console.error('Error creating screenshot:', error)
			return null
		}
	}

	// Экспозиция функции getLogoParameters через ref
	useImperativeHandle(ref, () => ({
		getLogoParameters,
	}))

	if (isLoading) return <Loader />
	else
		return (
			<div className={css.design_section}>
				<div className={css.image__box} ref={imageBoxRef}>
					<img src={image} alt="Customizer image" />

					{/* Canvas area for custom elements */}
					<div
						ref={containerRef}
						className={`${css.custom__elements}`}
					>
						
					</div>
				</div>

				<div className={css.settings__box}>
					<button
						onClick={() => setHideBorders(false)}
						className={`${css.button} contrast_button_1`}
						disabled
					>
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
									disabled
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

							{customizerType === 'text' && (
								<TextHandle
									onAdd={(text, options) => {
										const id = uuidv4()
										const el = {
											id,
											type: 'text',
											x: 20,
											y: 20,
											width: 'fit-content',
											maxWidth: 300,
											height: 'fit-content',
											rotation: 0,
											zIndex: (customElements.length || 0) + 1,
											content: text,
											style: {
												fontFamily: options.font,
												fontSize: options.size,
												fontWeight: options.bold ? 700 : 400,
												fontStyle: options.italic ? 'italic' : 'normal',
												color: options.color,
											},
										}
										setCustomElements((p) => [...p, el])
									}}
								/>
							)}
						</div>
					</div>

					<div className={css['products--list__by--category']}>
						{productsByCategory &&
							Object.keys(productsByCategory).map((key) => (
								<details key={key} open>
									<summary>
										<Icon name={'ChevronUp'} />
										<strong>{key}</strong>
									</summary>

									<ul className={css.products__list}>
										{productsByCategory[key].map((product) => (
											<ProductCustomizerCard
												key={product.id}
												setImage={setImage}
												activeCardId={activeCardId}
												setActiveCardId={setActiveCardId}
												product={product}
												storeId={storeId}
												setProductsByCategory={setProductsByCategory}
											/>
										))}
									</ul>
								</details>
							))}
					</div>
				</div>
			</div>
		)
})

DesignStep.displayName = 'DesignStep'

export default DesignStep
