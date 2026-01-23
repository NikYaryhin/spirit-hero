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
import Moveable from 'react-moveable'
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
	const [selectedId, setSelectedId] = useState(null)
	const [hideBorders, setHideBorders] = useState(false)
	const containerRef = useRef(null)
	const imageBoxRef = useRef(null)
	const scaleRef = useRef({})

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

			const selectedElementExists = updatedElements.some(
				(el) => el.id === selectedId,
			)
			if (selectedId && !selectedElementExists) {
				setSelectedId(null)
			}

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

					setTimeout(() => setSelectedId(id), 0)
				}
			})

			return updatedElements
		})
	}, [uploaderFiles, selectedId])

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
						className={`${css.custom__elements} ${hideBorders ? 'hide--borders' : ''}`}
						onClick={(e) => {
							if (e.target === containerRef.current) {
								setSelectedId(null)
							}
						}}
					>
						{customElements.map((el) => (
							<div
								key={el.id}
								data-id={el.id}
								style={{
									position: 'absolute',
									left: el.x,
									top: el.y,
									width: el.width,
									height: el.height,
									transform: `rotate(${el.rotation}deg)`,
									transformOrigin: 'center center',
									zIndex: el.zIndex,
									border: el.id === selectedId ? '1px dashed #4E008E' : 'none',
									boxSizing: 'border-box',
								}}
								onMouseDown={() => setSelectedId(el.id)}
							>
								{el.type === 'image' ? (
									<img
										src={el.content.src}
										alt="uploaded"
										style={{
											width: '100%',
											height: '100%',
											objectFit: 'contain',
										}}
									/>
								) : (
									<div
										style={{
											width: el.type === 'text' ? 'fit-content' : '100%',
											height: el.type === 'text' ? 'fit-content' : '100%',
											maxWidth: el.maxWidth || 'none',
											...el.style,
										}}
									>
										{el.content}
									</div>
								)}

								{/* Кнопка удаления для текстовых элементов */}
								{el.type === 'text' && (
									<button
										className={css.deleteButton}
										onClick={(e) => {
											e.stopPropagation()
											setCustomElements((prev) =>
												prev.filter((element) => element.id !== el.id),
											)
											if (selectedId === el.id) {
												setSelectedId(null)
											}
										}}
										title="Удалить текст"
									>
										<Icon name={'Cancel'} />
									</button>
								)}
							</div>
						))}

						{selectedId &&
							document.querySelector(`[data-id="${selectedId}"]`) &&
							(() => {
								const selectedElement = customElements.find(
									(el) => el.id === selectedId,
								)
								const isTextElement = selectedElement?.type === 'text'

								return (
									<Moveable
										target={document.querySelector(`[data-id="${selectedId}"]`)}
										container={containerRef.current}
										draggable={true}
										resizable={!isTextElement}
										scalable={!isTextElement}
										rotatable={true}
										throttleDrag={0}
										throttleResize={0}
										throttleRotate={0}
										handleRotate={true}
										renderDirections={
											isTextElement
												? []
												: ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']
										}
										edge={false}
										rotationPosition={'top'}
										onDrag={({ target, left, top }) => {
											const id = target.getAttribute('data-id')
											const container = containerRef.current
											if (!container) return
											setCustomElements((prev) =>
												prev.map((el) => {
													if (el.id !== id) return el

													// Для текстовых элементов используем фиксированные размеры для расчета границ
													const elementWidth =
														el.type === 'text'
															? el.maxWidth || 300
															: el.width || 0
													const elementHeight =
														el.type === 'text' ? 60 : el.height || 0

													// allow partial exit: at least 1px of element must remain visible
													const minLeft = -(elementWidth - 50)
													const maxLeft = container.clientWidth - 50
													const minTop = -(elementHeight - 50)
													const maxTop = container.clientHeight - 50
													const newLeft = Math.max(
														minLeft,
														Math.min(left, maxLeft),
													)
													const newTop = Math.max(minTop, Math.min(top, maxTop))
													return { ...el, x: newLeft, y: newTop }
												}),
											)
										}}
										onDragEnd={() => {
											updateCustomerLogos()
										}}
										onResize={({ target, width, height }) => {
											const id = target.getAttribute('data-id')
											const container = containerRef.current
											if (!container) return
											setCustomElements((prev) =>
												prev.map((el) => {
													if (el.id !== id) return el
													// allow resize but keep minimum size of 1px; partial exit allowed
													const newW = Math.max(1, Math.round(width))
													const newH = Math.max(1, Math.round(height))
													return { ...el, width: newW, height: newH }
												}),
											)
										}}
										onResizeEnd={() => {
											updateCustomerLogos()
										}}
										onScaleStart={({ target }) => {
											const id = target.getAttribute('data-id')
											const el = customElements.find((x) => x.id === id)
											if (el)
												scaleRef.current[id] = {
													w: el.width || 0,
													h: el.height || 0,
												}
										}}
										onScale={({ target, scale }) => {
											const id = target.getAttribute('data-id')
											const initial = scaleRef.current[id]
											if (!initial) return
											let sx = 1
											let sy = 1
											if (Array.isArray(scale)) {
												sx = scale[0]
												sy = scale[1]
											} else if (typeof scale === 'number') {
												sx = sy = scale
											}
											const newW = Math.max(1, Math.round(initial.w * sx))
											const newH = Math.max(1, Math.round(initial.h * sy))
											setCustomElements((prev) =>
												prev.map((el) =>
													el.id === id
														? { ...el, width: newW, height: newH }
														: el,
												),
											)
										}}
										onScaleEnd={({ target }) => {
											const id = target.getAttribute('data-id')
											delete scaleRef.current[id]
										}}
										onRotate={({ target, rotate, dist, angle }) => {
											const id = target.getAttribute('data-id')
											const rotationValue = rotate || dist || angle || 0
											setCustomElements((prev) =>
												prev.map((el) =>
													el.id === id
														? { ...el, rotation: rotationValue }
														: el,
												),
											)
										}}
										onRotateEnd={() => {
											updateCustomerLogos()
										}}
									/>
								)
							})()}
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
										setSelectedId(id)
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
