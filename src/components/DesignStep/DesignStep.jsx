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
import { Canvas, FabricImage, Control, util, Textbox } from 'fabric'

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
	const [selectedTextObject, setSelectedTextObject] = useState(null)
	const containerRef = useRef(null)
	const imageBoxRef = useRef(null)
	const canvasRef = useRef(null)
	const fabricCanvasRef = useRef(null)

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

	// Функция для отрисовки иконки удаления
	const renderDeleteIcon = (ctx, left, top, styleOverride, fabricObject) => {
		const size = 16
		ctx.save()
		ctx.translate(left, top)
		ctx.rotate(util.degreesToRadians(fabricObject.angle))
		
		// Рисуем круг
		ctx.beginPath()
		ctx.arc(0, 0, size / 2, 0, 2 * Math.PI)
		ctx.fillStyle = '#ff4444'
		ctx.fill()
		ctx.strokeStyle = '#ffffff'
		ctx.lineWidth = 2
		ctx.stroke()
		
		// Рисуем крестик
		ctx.strokeStyle = '#ffffff'
		ctx.lineWidth = 2
		ctx.beginPath()
		const offset = size / 4
		ctx.moveTo(-offset, -offset)
		ctx.lineTo(offset, offset)
		ctx.moveTo(offset, -offset)
		ctx.lineTo(-offset, offset)
		ctx.stroke()
		
		ctx.restore()
	}

	// Функция обработчик удаления объекта
	const deleteObject = (eventData, transform) => {
		const canvas = transform.target.canvas
		const target = transform.target
		
		// Удаляем изображения
		if (target.customData?.type === 'uploaded-image') {
			const urlToRemove = target.customData.url
			
			// Удаляем с canvas
			canvas.remove(target)
			canvas.renderAll()
			
			// Удаляем из uploaderFiles
			setUploaderFiles((prev) => {
				const index = prev.findIndex((f) => f.url === urlToRemove)
				if (index !== -1) {
					const next = prev.slice()
					const [removed] = next.splice(index, 1)
					// Освобождаем URL только для загруженных файлов
					if (removed && removed.url && !removed.isServerImage) {
						URL.revokeObjectURL(removed.url)
					}
					console.log('🗑️ Изображение удалено кнопкой:', urlToRemove)
					return next
				}
				return prev
			})
		}
		
		// Удаляем текст
		if (target.customData?.type === 'text') {
			console.log('🗑️ Текст удалён кнопкой:', target.text)
			canvas.remove(target)
			canvas.renderAll()
		}
		
		return true
	}

	// Инициализация fabric canvas
	useEffect(() => {
		// Ждём, пока данные загрузятся и компонент отрендерится
		if (isLoading) return
		if (!canvasRef.current || !containerRef.current) return

		// Создаём fabric canvas
		const fabricCanvas = new Canvas(canvasRef.current, {
			width: containerRef.current.clientWidth,
			height: containerRef.current.clientHeight,
			backgroundColor: 'transparent',
			selection: true,
			preserveObjectStacking: true,
		})

		fabricCanvasRef.current = fabricCanvas

		console.log('Fabric canvas инициализирован', fabricCanvas)

		// Обработчик масштабирования текста для пропорционального изменения размера шрифта
		const handleTextScaling = (e) => {
			const obj = e.target
			if (!obj || obj.customData?.type !== 'text') return

			const originalFontSize = obj.customData.originalFontSize || obj.fontSize
			const originalWidth = obj.customData.originalWidth || obj.width
			
			// Вычисляем новую ширину с учётом масштаба
			const scaleX = obj.scaleX || 1
			const newWidth = originalWidth * scaleX
			
			// Вычисляем новый размер шрифта пропорционально изменению ширины
			const widthRatio = newWidth / originalWidth
			const newFontSize = originalFontSize * widthRatio
			
			console.log('📏 Масштабирование текста:', {
				originalWidth,
				newWidth,
				widthRatio,
				originalFontSize,
				newFontSize: Math.round(newFontSize)
			})
			
			// Применяем новый размер шрифта и ширину
			obj.set({
				fontSize: newFontSize,
				width: newWidth,
				scaleX: 1,
				scaleY: 1,
			})
			
			// Обновляем оригинальные значения для следующего масштабирования
			obj.customData.originalFontSize = newFontSize
			obj.customData.originalWidth = newWidth
		}

		// Обработчик изменения объектов (перемещение, масштабирование, вращение)
		const handleObjectModified = (e) => {
			const obj = e.target
			
			// Обрабатываем изменение изображений
			if (obj.customData?.type === 'uploaded-image') {
				const url = obj.customData.url
				
				// Получаем текущие параметры объекта
				const width = obj.getScaledWidth()
				const height = obj.getScaledHeight()
				const x = obj.left
				const y = obj.top
				const rotation = obj.angle

				console.log('🔄 Изображение изменено:', { url, x, y, width, height, rotation })

				// Обновляем данные в uploaderFiles
				setUploaderFiles((prev) =>
					prev.map((file) => {
						if (file.url === url) {
							return {
								...file,
								x,
								y,
								width,
								height,
								rotation,
							}
						}
						return file
					})
				)
			}
			
			// Обрабатываем изменение текста
			if (obj.customData?.type === 'text') {
				console.log('📝 Текст изменён:', {
					left: obj.left,
					top: obj.top,
					fontSize: obj.fontSize,
					width: obj.width,
					angle: obj.angle,
				})
			}
		}

		// Обработчик выбора объекта
		const handleSelection = (e) => {
			const selected = e.selected?.[0] || e.target
			if (selected && selected.customData?.type === 'text') {
				console.log('📝 Текст выбран для редактирования:', selected.text)
				setSelectedTextObject(selected)
			} else {
				setSelectedTextObject(null)
			}
		}

		// Обработчик снятия выделения
		const handleSelectionCleared = () => {
			console.log('❌ Выделение снято')
			setSelectedTextObject(null)
		}

		// Подписываемся на события
		fabricCanvas.on('object:scaling', handleTextScaling)
		fabricCanvas.on('object:modified', handleObjectModified)
		fabricCanvas.on('selection:created', handleSelection)
		fabricCanvas.on('selection:updated', handleSelection)
		fabricCanvas.on('selection:cleared', handleSelectionCleared)

		// Cleanup при размонтировании
		return () => {
			fabricCanvas.off('object:scaling', handleTextScaling)
			fabricCanvas.off('object:modified', handleObjectModified)
			fabricCanvas.off('selection:created', handleSelection)
			fabricCanvas.off('selection:updated', handleSelection)
			fabricCanvas.off('selection:cleared', handleSelectionCleared)
			fabricCanvas.dispose()
			fabricCanvasRef.current = null
		}
	}, [isLoading])

	// Удаление выделенного элемента при нажатии Delete или Backspace
	useEffect(() => {
		const canvas = fabricCanvasRef.current
		if (!canvas) {
			return
		}

		const handleKeyDown = (e) => {

			// Проверяем, что фокус не на input/textarea
			const activeElement = document.activeElement
			if (
				activeElement &&
				(activeElement.tagName === 'INPUT' ||
					activeElement.tagName === 'TEXTAREA' ||
					activeElement.isContentEditable)
			) {
				return
			}

			// Проверяем нажатие Delete или Backspace
			if (e.key === 'Delete' || e.key === 'Backspace') {
				const activeObject = canvas.getActiveObject()

				if (activeObject) {
					// Удаление изображения
					if (activeObject.customData?.type === 'uploaded-image') {
						e.preventDefault()

						const urlToRemove = activeObject.customData.url

						// Удаляем с canvas
						canvas.remove(activeObject)
						canvas.renderAll()

						// Удаляем из uploaderFiles
						setUploaderFiles((prev) => {
							const index = prev.findIndex((f) => f.url === urlToRemove)
							if (index !== -1) {
								const next = prev.slice()
								const [removed] = next.splice(index, 1)
								// Освобождаем URL только для загруженных файлов
								if (removed && removed.url && !removed.isServerImage) {
									URL.revokeObjectURL(removed.url)
								}
								console.log('⌨️ Изображение удалено клавишей:', urlToRemove)
								return next
							}
							return prev
						})
					}
					
					// Удаление текста
					if (activeObject.customData?.type === 'text') {
						e.preventDefault()
						console.log('⌨️ Текст удалён клавишей:', activeObject.text)
						canvas.remove(activeObject)
						canvas.renderAll()
					}
				}
			}
		}

		window.addEventListener('keydown', handleKeyDown)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isLoading])

	// Добавление загруженных изображений на canvas
	useEffect(() => {
		const canvas = fabricCanvasRef.current
		if (!canvas) return

		// Получаем текущие URL изображений на canvas
		const currentObjects = canvas.getObjects()
		const currentUrls = currentObjects
			.filter((obj) => obj.customData?.type === 'uploaded-image')
			.map((obj) => obj.customData.url)

		// Удаляем изображения, которых больше нет в uploaderFiles
		const uploaderUrls = uploaderFiles.map((f) => f.url)
		currentObjects.forEach((obj) => {
			if (
				obj.customData?.type === 'uploaded-image' &&
				!uploaderUrls.includes(obj.customData.url)
			) {
				canvas.remove(obj)
			}
		})

		// Добавляем новые изображения
		uploaderFiles.forEach(async (fileData) => {
			if (currentUrls.includes(fileData.url)) return

			try {
				const imgElement = document.createElement('img')
				imgElement.src = fileData.url

				imgElement.onload = () => {
					
					// Используем координаты с сервера, если они есть, иначе значения по умолчанию
					// Важно: используем !== undefined, чтобы 0 не считалось falsy
					const left = fileData.x !== undefined ? fileData.x : 50
					const top = fileData.y !== undefined ? fileData.y : 50
					
					// Используем размеры с сервера для расчёта scale, если они есть
					let scaleX, scaleY
					if (fileData.width !== undefined && fileData.height !== undefined) {
						scaleX = fileData.width / imgElement.width
						scaleY = fileData.height / imgElement.height
					} else {
						scaleX = 100 / imgElement.width
						scaleY = 100 / imgElement.height
					}
					
					
					const fabricImg = new FabricImage(imgElement, {
						left,
						top,
						scaleX,
						scaleY,
						angle: fileData.rotation || 0,
						cornerStyle: 'circle',
						cornerColor: '#4E008E',
						cornerStrokeColor: '#ffffff',
						borderColor: '#4E008E',
						borderScaleFactor: 2,
						transparentCorners: false,
						lockRotation: false,
						lockUniScaling: true,
					})

					fabricImg.setControlsVisibility({
						ml: false,
						mr: false,
						mt: false,
						mb: false,
					})

					// Добавляем кнопку удаления
					fabricImg.controls.deleteControl = new Control({
						x: 0.5,
						y: -0.5,
						offsetY: -16,
						offsetX: 16,
						cursorStyle: 'pointer',
						mouseUpHandler: deleteObject,
						render: renderDeleteIcon,
						cornerSize: 16,
					})

					// Добавляем кастомные данные для идентификации
					fabricImg.customData = {
						type: 'uploaded-image',
						url: fileData.url,
						fileData: fileData,
					}

					canvas.add(fabricImg)
					canvas.renderAll()

				}

				imgElement.onerror = (error) => {
					console.error('Ошибка загрузки изображения:', error)
				}
			} catch (error) {
				console.error('Ошибка при добавлении изображения на canvas:', error)
			}
		})
	}, [uploaderFiles])

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

						const serverFile = {
							url: logoData.image,
							base64: logoData.image,
							file: { name: `Server image ${index + 1}` },
							isServerImage: true,
							x: logoData.x,
							y: logoData.y,
							width: logoData.width,
							height: logoData.height,
							rotation: logoData.rotation || 0,
						}
						
						serverImageFiles.push(serverFile)
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

					<div
						ref={containerRef}
						className={`${css.custom__elements} ${hideBorders ? 'hide--borders' : ''}`}
					>
						<canvas ref={canvasRef} />
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
									selectedText={selectedTextObject ? {
										text: selectedTextObject.text,
										font: selectedTextObject.fontFamily,
										size: Math.round(selectedTextObject.fontSize),
										bold: selectedTextObject.fontWeight === 'bold' || selectedTextObject.fontWeight === 700,
										italic: selectedTextObject.fontStyle === 'italic',
										color: selectedTextObject.fill,
									} : null}
									onUpdate={(text, options) => {
										if (!selectedTextObject) return
										
										const canvas = fabricCanvasRef.current
										if (!canvas) return
										
										console.log('✏️ Обновление текста:', { text, options })
										
										// Обновляем текст
										selectedTextObject.set({
											text: text,
											fontFamily: options.font,
											fontWeight: options.bold ? 'bold' : 'normal',
											fontStyle: options.italic ? 'italic' : 'normal',
											fill: options.color,
										})
										
										// Пересчитываем размер шрифта для новой ширины
										const ctx = canvas.getContext()
										const fontStyleStr = `${options.italic ? 'italic' : 'normal'} ${options.bold ? 'bold' : 'normal'} ${options.size}px ${options.font}`
										ctx.font = fontStyleStr
										const metrics = ctx.measureText(text)
										const actualWidth = metrics.width
										const safeTargetWidth = canvas.width * 0.95
										const widthRatio = safeTargetWidth / actualWidth
										let fontSize = options.size * widthRatio
										fontSize = Math.max(fontSize, 16)
										fontSize = Math.min(fontSize, 200)
										
										selectedTextObject.set({ fontSize: fontSize })
										selectedTextObject.customData.originalFontSize = fontSize
										
										canvas.renderAll()
									}}
									onAdd={(text, options) => {
										const canvas = fabricCanvasRef.current
										if (!canvas) {
											console.error('Canvas не готов для добавления текста')
											return
										}

										console.log('📝 Добавление текста на canvas:', { text, options })

										// Функция для подбора оптимального размера шрифта
										const calculateOptimalFontSize = (text, targetWidth, initialFontSize, fontFamily, fontWeight, fontStyle) => {
											// Создаём canvas context для измерения текста
											const ctx = canvas.getContext()
											
											// Устанавливаем стиль шрифта
											const fontStyle2 = `${fontStyle} ${fontWeight} ${initialFontSize}px ${fontFamily}`
											ctx.font = fontStyle2
											
											// Измеряем реальную ширину текста
											const metrics = ctx.measureText(text)
											const actualWidth = metrics.width
											
											// Добавляем небольшой отступ (5%) для безопасности
											const safeTargetWidth = targetWidth * 0.95
											
											// Вычисляем коэффициент масштабирования
											const widthRatio = safeTargetWidth / actualWidth
											let fontSize = initialFontSize * widthRatio
											
											// Ограничиваем размер шрифта разумными пределами
											fontSize = Math.max(fontSize, 16) // Минимум 16px
											fontSize = Math.min(fontSize, 200) // Максимум 200px
											
											console.log('📏 Подбор размера шрифта:', {
												text: text.length > 30 ? text.substring(0, 30) + '...' : text,
												textLength: text.length,
												actualWidth: Math.round(actualWidth),
												targetWidth: Math.round(targetWidth),
												safeTargetWidth: Math.round(safeTargetWidth),
												widthRatio: widthRatio.toFixed(3),
												initialFontSize,
												calculatedFontSize: Math.round(fontSize)
											})
											
											return fontSize
										}

										// Вычисляем оптимальный размер шрифта
										const optimalFontSize = calculateOptimalFontSize(
											text,
											canvas.width,
											options.size,
											options.font,
											options.bold ? 'bold' : 'normal',
											options.italic ? 'italic' : 'normal'
										)

										// Создаём текстовый объект с оптимальным размером шрифта
										const textbox = new Textbox(text, {
											left: 0,
											top: 50,
											width: canvas.width, // Ширина равна ширине canvas
											fontFamily: options.font,
											fontSize: optimalFontSize,
											fontWeight: options.bold ? 'bold' : 'normal',
											fontStyle: options.italic ? 'italic' : 'normal',
											fill: options.color,
											textAlign: 'center',
											// Настройки для пропорционального изменения
											lockScalingFlip: true,
											// Разрешаем изменение только по ширине для пропорционального масштабирования
											lockUniScaling: false,
											// Стили контролов
											cornerStyle: 'circle',
											cornerColor: '#4E008E',
											cornerStrokeColor: '#ffffff',
											borderColor: '#4E008E',
											borderScaleFactor: 2,
											transparentCorners: false,
										})

										// Скрываем контролы масштабирования по вертикали и горизонтали
										// Оставляем только угловые для пропорционального изменения
										textbox.setControlsVisibility({
											mt: false,
											mb: false,
											ml: false,
											mr: false,
										})

										// Добавляем кнопку удаления
										textbox.controls.deleteControl = new Control({
											x: 0.5,
											y: -0.5,
											offsetY: -16,
											offsetX: 16,
											cursorStyle: 'pointer',
											mouseUpHandler: deleteObject,
											render: renderDeleteIcon,
											cornerSize: 24,
										})

										// Добавляем кастомные данные
										textbox.customData = {
											type: 'text',
											originalFontSize: optimalFontSize,
											originalWidth: canvas.width,
										}

										// Добавляем на canvas
										canvas.add(textbox)
										canvas.setActiveObject(textbox)
										canvas.renderAll()

										console.log('✅ Текст добавлен на canvas')
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
