import css from './DesignStep.module.css'
import { useEffect, useMemo, useState, useRef, useImperativeHandle, forwardRef } from 'react'
import ProductCustomizerCard from '../ProductCustomizerCard/ProductCustomizerCard'
import ImageUploader from '../ImageUploader/ImageUploader'
import Icon from '../Icon'
import Loader from '../Loader/Loader'
import spiritHeroApi from '@/api/spiritHeroApi'
import TextHandle from '../TextHandle/TextHandle'
import { v4 as uuidv4 } from 'uuid'
import { useDispatch, useSelector } from 'react-redux'
import domtoimage from 'dom-to-image-more'
import { Canvas, FabricImage, Control, util, Textbox, Line, Rect } from 'fabric'
import Modal from '@/components/Modal/Modal'
import FundraisingTypeModal from '../FundraisingTypeModal/FundraisingTypeModal'
import NewDesignModal from '../NewDesignModal/NewDesignModal'
import { setMinimalGroups } from '@/features/products/productsSlice'
import { setActiveStep } from '@/features/navigation/navigationSlice'

const DesignStepNew = forwardRef((props, ref) => {
	const dispatch = useDispatch()
	const params = new URLSearchParams(window.location.search)
	const storeIdFromQuery = params.get('store_id')
	const storeId = useSelector((state) => state.flashSale.storeId) || storeIdFromQuery
	/*
		const minimalGroupsFromStore = useSelector((state) => state.products.minimalGroups)
	*/
	const [minimalGroupsFromStore, setMinimalGroupsFromStore] = useState([]);
	const [activeSide, setActiveSide] = useState('front')
	const [activeTypeId, setActiveTypeId] = useState(1)

	const [customizerType, setCustomizerType] = useState(null)
	const [popup, setPopup] = useState(false)

	const [isLoading, setIsLoading] = useState(true)
	const [productsByCategory, setProductsByCategory] = useState(null)
	const [activeCardId, setActiveCardId] = useState(null)
	const [activeGroupId, setActiveGroupId] = useState(null)
	const [baseDesign, setBaseDesign] = useState([])
	const [customerLogos, setCustomerLogos] = useState({
		elementsPositionImage: '',
		customerLogos: [],
		labels: [],
	})

	const [image, setImage] = useState(null)
	const [imageBack, setImageBack] = useState(null)
	const [imageLeft, setImageLeft] = useState(null)
	const [imageRight, setImageRight] = useState(null)

	const [area, setArea] = useState(null)

	const [uploaderFiles, setUploaderFiles] = useState([])
	const [serverLabels, setServerLabels] = useState([])
	const [uploaderDragOver, setUploaderDragOver] = useState(false)

	const [selectedTextObject, setSelectedTextObject] = useState(null)

	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isNewDesignModalOpen, setIsNewDesignModalOpen] = useState(false)
	const [isFundraisingModalOpen, setIsFundraisingModalOpen] = useState(false)

	const containerRef = useRef(null)
	const imageBoxRef = useRef(null)
	const canvasRef = useRef(null)
	const fabricCanvasRef = useRef(null)
	const currentAreaRef = useRef(null)
	const currentAreaRef2 = useRef(null)

	const verticalGuideRef = useRef(null);
	const horizontalGuideRef = useRef(null);
	const minimalGroups = useMemo(
		() => (Array.isArray(minimalGroupsFromStore) ? minimalGroupsFromStore : []),
		[minimalGroupsFromStore],
	)

	const minimalGroupNameById = useMemo(() => {
		return minimalGroups.reduce((acc, group) => {
			acc[String(group.id)] = group.name
			return acc
		}, {})
	}, [minimalGroups])

	const getGroupLabel = (groupKey) => minimalGroupNameById[groupKey] || `Group ${groupKey}`
	const getProductsFromActiveGroup = () => {
		if (!activeGroupId) return []
		const groupProducts = productsByCategory?.[activeGroupId]
		return Array.isArray(groupProducts) ? groupProducts : []
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
					return next
				}
				return prev
			})
		}

		// Удаляем текст
		if (target.customData?.type === 'text') {
			canvas.remove(target)
			canvas.renderAll()
		}

		return true
	}

	// Инициализация fabric canvas
	/*useEffect(() => {
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

		// Создаём направляющие линии для выравнивания по центру
		const verticalGuideLine = new Line(
			[fabricCanvas.width / 2, 0, fabricCanvas.width / 2, fabricCanvas.height],
			{
				stroke: '#4E008E',
				strokeWidth: 1,
				strokeDashArray: [5, 5],
				selectable: false,
				evented: false,
				visible: false, // Скрыта по умолчанию
				opacity: 0.7,
			},
		)

		const horizontalGuideLine = new Line(
			[0, fabricCanvas.height / 2, fabricCanvas.width, fabricCanvas.height / 2],
			{
				stroke: '#4E008E',
				strokeWidth: 1,
				strokeDashArray: [5, 5],
				selectable: false,
				evented: false,
				visible: false, // Скрыта по умолчанию
				opacity: 0.7,
			},
		)

		// Добавляем кастомные данные для идентификации
		verticalGuideLine.customData = { type: 'guide-line' }
		horizontalGuideLine.customData = { type: 'guide-line' }

		fabricCanvas.add(verticalGuideLine, horizontalGuideLine)

		// Обработчик масштабирования текста для пропорционального изменения размера шрифта
		const handleTextScaling = (e) => {
			const obj = e.target
			if (!obj || obj.customData?.type !== 'text') return

			const scaleX = obj.scaleX
			const newWidth = obj.width * scaleX
			const newHeight = obj.height * scaleX
			const newFontSize = Math.round(obj.fontSize * scaleX)

			obj.customData.originalFontSize = newFontSize
			obj.customData.originalWidth = newWidth
			obj.customData.originalHeight = newHeight
		}


		const handleObjectModified = (e) => {
			const obj = e.target

			if (obj.customData?.type === 'uploaded-image') {
				const url = obj.customData.url

				const width = obj.getScaledWidth()
				const height = obj.getScaledHeight()
				const x = obj.left
				const y = obj.top
				const rotation = obj.angle

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
					}),
				)
			}

			// Синхронизируем данные с customerLogos
			syncCanvasToCustomerLogos()
		}

		// Обработчик выбора объекта
		const handleSelection = (e) => {
			const selected = e.selected?.[0] || e.target
			if (selected && selected.customData?.type === 'text') {
				setCustomizerType('text')
				setSelectedTextObject(selected)
			} else {
				setCustomizerType('image')
				setSelectedTextObject(null)
			}
		}

		// Обработчик снятия выделения
		const handleSelectionCleared = () => {
			setSelectedTextObject(null)
		}

		// Обработчик вращения с магнитным snap'ом к углам кратным 15°
		const handleRotating = (e) => {
			const obj = e.target
			if (!obj) return

			const snapAngle = 15 // Кратность углов (15°, 30°, 45° и т.д.)
			const snapThreshold = 3 // Магнитная зона ±2°

			// Получаем текущий угол и нормализуем его в диапазон 0-360
			let currentAngle = obj.angle % 360
			if (currentAngle < 0) currentAngle += 360

			// Находим ближайший угол кратный 15°
			const nearestSnap = Math.round(currentAngle / snapAngle) * snapAngle

			// Вычисляем расстояние до ближайшего snap-угла
			const distance = Math.abs(currentAngle - nearestSnap)

			// Если в пределах магнитной зоны - применяем snap
			if (distance <= snapThreshold) {
				obj.set('angle', nearestSnap)
			}
		}

		// Обработчик перемещения с магнитным выравниванием по центру канваса
		const handleMoving = (e) => {
			const obj = e.target
			if (!obj || obj.customData?.type === 'center-marker' || obj.customData?.type === 'guide-line')
				return

			const snapThreshold = 10 // Магнитная зона ±10px

			// Вычисляем центр канваса
			const canvasCenterX = fabricCanvas.width / 2
			const canvasCenterY = fabricCanvas.height / 2

			// Получаем центр объекта
			const objCenter = obj.getCenterPoint()

			// Проверяем расстояние по горизонтали
			const distanceX = Math.abs(objCenter.x - canvasCenterX)
			const distanceY = Math.abs(objCenter.y - canvasCenterY)

			// Snap по горизонтали (вертикальная линия)
			if (distanceX <= snapThreshold) {
				// Вычисляем новую позицию left с учётом originX
				// obj.center()
				// const newLeft = canvasCenterX - obj.width* obj.scaleX / 2
				// obj.set({ left: newLeft })
				verticalGuideLine.set({ visible: true })
			} else {
				verticalGuideLine.set({ visible: false })
			}

			// Snap по вертикали (горизонтальная линия)
			if (distanceY <= snapThreshold) {
				// Вычисляем новую позицию top с учётом originY
				// obj.center()
				// const newTop = canvasCenterY - obj.height* obj.scaleY / 2
				// obj.set({ top: newTop })
				horizontalGuideLine.set({ visible: true })
			} else {
				horizontalGuideLine.set({ visible: false })
			}

			obj.setCoords() // Обновляем координаты объекта
		}

		// Обработчик окончания перемещения - скрываем направляющие
		const handleMovingEnd = () => {
			verticalGuideLine.set({ visible: false })
			horizontalGuideLine.set({ visible: false })
			fabricCanvas.renderAll()
		}

		// Подписываемся на события
		fabricCanvas.on('object:scaling', handleTextScaling)
		fabricCanvas.on('object:rotating', handleRotating)
		fabricCanvas.on('object:moving', handleMoving)
		fabricCanvas.on('object:modified', handleObjectModified)
		fabricCanvas.on('mouse:up', handleMovingEnd)
		fabricCanvas.on('selection:created', handleSelection)
		// fabricCanvas.on('selection:updated', handleSelection)
		fabricCanvas.on('selection:cleared', handleSelectionCleared)

		// Cleanup при размонтировании
		return () => {
			fabricCanvas.off('object:scaling', handleTextScaling)
			fabricCanvas.off('object:rotating', handleRotating)
			fabricCanvas.off('object:moving', handleMoving)
			fabricCanvas.off('object:modified', handleObjectModified)
			fabricCanvas.off('mouse:up', handleMovingEnd)
			fabricCanvas.off('selection:created', handleSelection)
			// fabricCanvas.off('selection:updated', handleSelection)
			fabricCanvas.off('selection:cleared', handleSelectionCleared)
			fabricCanvas.dispose()
			fabricCanvasRef.current = null
		}
	}, [isLoading])*/
	/*useEffect( () => {
		console.log('canvasRef.current',canvasRef.current)
		if (isLoading) return
		if (!canvasRef.current) return


		// =========================
		// 🎯 CANVAS (600x600)
		// =========================
		const fabricCanvas = new Canvas(canvasRef.current, {
			width: 600,
			height: 600,
			backgroundColor: 'transparent',
			selection: true,
			preserveObjectStacking: true,
		})

		fabricCanvasRef.current = fabricCanvas

		// =========================
		// 🖼 BACKGROUND IMAGE
		// =========================
		console.log('image', image);
		const fixedImage = image.startsWith('//')
			? `https:${image}`
			: image
		console.log('fixedImage', fixedImage);
		const loadImage = async () => {
			try {
				const res = await fetch(fixedImage)
				const blob = await res.blob()
				const url = URL.createObjectURL(blob)

				const img = new Image()
				img.onload = () => {
					const fabricImg = new FabricImage(img)


					const scale = Math.min(600 / img.width, 600 / img.height)

					const scaledWidth = img.width * scale
					const scaledHeight = img.height * scale

					fabricImg.set({
						scaleX: scale,
						scaleY: scale,
						left: (600 - scaledWidth) / 2,
						top: (600 - scaledHeight) / 2,
						originX: 'left',
						originY: 'top',
						selectable: false,
						evented: false,
					})


					fabricCanvas.backgroundImage = fabricImg
					fabricCanvas.requestRenderAll()
				}

				img.src = url
			} catch (e) {
				console.error('FAILED LOAD', e)
			}
		}

		loadImage()

		// =========================
		// 📦 AREA (з бекенду)
		// =========================
		let areaRect = null
		const currentArea = area ?? {
			x: (600-200) / 2,
			y: (600-200) / 2,
			w: 200,
			h: 200,
		}
		currentAreaRef.current = currentArea
		if (currentArea) {
			areaRect = new Rect({
				left: currentArea.x,
				top: currentArea.y,
				width: currentArea.w,
				height: currentArea.h,
				fill: 'rgba(78, 0, 142, 0.05)',
				stroke: '#4E008E',
				strokeWidth: 2,
				selectable: false,
				evented: false,
			})

			areaRect.customData = { type: 'area' }
			fabricCanvas.add(areaRect)
		}


		// =========================
		// 📏 GUIDE LINES (центр area)
		// =========================
		const areaCenterX = currentArea.x + currentArea.w / 2
		const areaCenterY = currentArea.y + currentArea.h / 2

		const verticalGuideLine = new Line(
			[areaCenterX, currentArea.y, areaCenterX, currentArea.y + currentArea.h],
			{
				stroke: '#4E008E',
				strokeWidth: 1,
				strokeDashArray: [5, 5],
				selectable: false,
				evented: false,
				visible: false,
				opacity: 0.7,
			},
		)

		const horizontalGuideLine = new Line(
			[currentArea.x, areaCenterY, currentArea.x + currentArea.w, areaCenterY],
			{
				stroke: '#4E008E',
				strokeWidth: 1,
				strokeDashArray: [5, 5],
				selectable: false,
				evented: false,
				visible: false,
				opacity: 0.7,
			},
		)

		verticalGuideLine.customData = { type: 'guide-line' }
		horizontalGuideLine.customData = { type: 'guide-line' }

		fabricCanvas.add(verticalGuideLine, horizontalGuideLine)

		// =========================
		// 🎯 HANDLERS
		// =========================

		const handleTextScaling = (e) => {
			const obj = e.target
			if (!obj || obj.customData?.type !== 'text') return

			const scaleX = obj.scaleX
			obj.customData.originalFontSize = Math.round(obj.fontSize * scaleX)
			obj.customData.originalWidth = obj.width * scaleX
			obj.customData.originalHeight = obj.height * scaleX
		}

		const handleObjectModified = (e) => {
			const obj = e.target

			if (obj.customData?.type === 'uploaded-image') {
				const url = obj.customData.url

				setUploaderFiles((prev) =>
					prev.map((file) =>
						file.url === url
							? {
								...file,
								x: obj.left,
								y: obj.top,
								width: obj.getScaledWidth(),
								height: obj.getScaledHeight(),
								rotation: obj.angle,
							}
							: file
					)
				)
			}

			syncCanvasToCustomerLogos()
		}

		const handleSelection = (e) => {
			const selected = e.selected?.[0] || e.target

			if (selected?.customData?.type === 'text') {
				setCustomizerType('text')
				setSelectedTextObject(selected)
			} else {
				setCustomizerType('image')
				setSelectedTextObject(null)
			}
		}

		const handleSelectionCleared = () => {
			setSelectedTextObject(null)
		}

		const handleRotating = (e) => {
			const obj = e.target
			if (!obj) return

			const snapAngle = 15
			const snapThreshold = 3

			let angle = obj.angle % 360
			if (angle < 0) angle += 360

			const snap = Math.round(angle / snapAngle) * snapAngle

			if (Math.abs(angle - snap) <= snapThreshold) {
				obj.set('angle', snap)
			}
		}

		const handleMoving = (e) => {
			const obj = e.target
			if (!obj || obj.customData?.type === 'guide-line') return


			const snapThreshold = 10
			const objCenter = obj.getCenterPoint()

			const centerX = 300
			const centerY = 300
			const areaCenterX = currentArea.x + currentArea.w / 2
			const areaCenterY = currentArea.y + currentArea.h / 2
			const distanceX = Math.abs(objCenter.x - areaCenterX)
			const distanceY = Math.abs(objCenter.y - areaCenterY)

			verticalGuideLine.set({ visible: distanceX <= snapThreshold })
			horizontalGuideLine.set({ visible: distanceY <= snapThreshold })

			obj.setCoords()
		}

		const handleMovingEnd = () => {
			verticalGuideLine.set({ visible: false })
			horizontalGuideLine.set({ visible: false })
			fabricCanvas.renderAll()
		}

		// =========================
		// 📡 EVENTS
		// =========================
		fabricCanvas.on('object:scaling', handleTextScaling)
		fabricCanvas.on('object:rotating', handleRotating)
		fabricCanvas.on('object:moving', handleMoving)
		fabricCanvas.on('object:modified', handleObjectModified)
		fabricCanvas.on('mouse:up', handleMovingEnd)
		fabricCanvas.on('selection:created', handleSelection)
		fabricCanvas.on('selection:cleared', handleSelectionCleared)

		// =========================
		// 🧹 CLEANUP
		// =========================
		return () => {
			fabricCanvas.off('object:scaling', handleTextScaling)
			fabricCanvas.off('object:rotating', handleRotating)
			fabricCanvas.off('object:moving', handleMoving)
			fabricCanvas.off('object:modified', handleObjectModified)
			fabricCanvas.off('mouse:up', handleMovingEnd)
			fabricCanvas.off('selection:created', handleSelection)
			fabricCanvas.off('selection:cleared', handleSelectionCleared)

			fabricCanvas.dispose()
			fabricCanvasRef.current = null
		}
	}, [isLoading, image, area])*/

	useEffect( () => {
		console.log('canvasRef.current',canvasRef.current)
		if (isLoading) return
		if (!canvasRef.current) return


		// =========================
		// 🎯 CANVAS (600x600)
		// =========================
		const fabricCanvas = new Canvas(canvasRef.current, {
			width: 600,
			height: 600,
			backgroundColor: 'transparent',
			selection:  false,
			preserveObjectStacking: true,
		})


		fabricCanvasRef.current = fabricCanvas
		console.log(fabricCanvasRef)

		// =========================
		// 🎯 HANDLERS
		// =========================

	/*	const handleTextScaling = (e) => {
			const obj = e.target
			if (!obj || obj.customData?.type !== 'text') return


			const scaleX = obj.scaleX
			obj.customData.originalFontSize = Math.round(obj.fontSize * scaleX)
			obj.customData.originalWidth = obj.width * scaleX
			obj.customData.originalHeight = obj.height * scaleX

		}*/
		/*const handleTextScaling = (e) => {
			const obj = e.target;
			const area = currentAreaRef2.current;

			if (!obj || obj.customData?.type !== 'text') return;

			obj.setCoords();
			area.setCoords();

			const scaleX = obj.scaleX;
			const scaleY = obj.scaleY;

			// 🔥 1. нормалізуємо scale → в fontSize
			const newFontSize = Math.round(obj.fontSize * scaleX);

			obj.set({
				fontSize: newFontSize,
				scaleX: 1,
				scaleY: 1,
			});

			// 🔥 2. для textbox оновлюємо ширину
			if (obj.type === 'textbox') {
				obj.set({
					width: obj.width * scaleX,
				});
			}

			// 🔥 3. після зміни — беремо нові bounds
			obj.setCoords();

			const areaBounds = area.getBoundingRect(true);

			const objWidth = obj.getScaledWidth();
			const objHeight = obj.getScaledHeight();

			let newLeft = obj.left;
			let newTop = obj.top;

			const minX = areaBounds.left + objWidth / 2;
			const maxX = areaBounds.left + areaBounds.width - objWidth / 2;

			const minY = areaBounds.top + objHeight / 2;
			const maxY = areaBounds.top + areaBounds.height - objHeight / 2;

			// 🔒 обмеження як у moving
			if (newLeft < minX) newLeft = minX;
			if (newLeft > maxX) newLeft = maxX;

			if (newTop < minY) newTop = minY;
			if (newTop > maxY) newTop = maxY;

			obj.set({
				left: newLeft,
				top: newTop
			});

			// 🔥 4. збереження
			obj.customData = {
				...obj.customData,
				originalFontSize: obj.fontSize,
				originalWidth: obj.width,
				originalHeight: obj.height,
			};

			obj.setCoords();
		};*/
		const handleTextScaling = (e) => {
			const obj = e.target;
			const area = currentAreaRef2.current;

			if (!obj || obj.customData?.type !== 'text') return;

			obj.setCoords();
			area.setCoords();

			const areaBounds = area.getBoundingRect(true);

			const scaleX = obj.scaleX;

			// 🔥 центр об'єкта
			const center = obj.getCenterPoint();

			// 🔥 максимально доступна ширина/висота від центру
			const maxWidth =
				2 * Math.min(
				center.x - areaBounds.left,
				areaBounds.left + areaBounds.width - center.x
				);

			const maxHeight =
				2 * Math.min(
				center.y - areaBounds.top,
				areaBounds.top + areaBounds.height - center.y
				);

			// 🔥 обмежуємо scale
			let allowedScaleX = scaleX;
			let allowedScaleY = obj.scaleY;

			if (obj.width * scaleX > maxWidth) {
				allowedScaleX = maxWidth / obj.width;
			}

			if (obj.height * obj.scaleY > maxHeight) {
				allowedScaleY = maxHeight / obj.height;
			}

			// 🔥 застосовуємо scale → fontSize
			const newFontSize = Math.round(obj.fontSize * allowedScaleX);

			obj.set({
				fontSize: newFontSize,
				scaleX: 1,
				scaleY: 1,
			});

			// 🔥 textbox width
			if (obj.type === 'textbox') {
				obj.set({
					width: obj.width * allowedScaleX,
				});
			}

			obj.setCoords();

			// 🔥 обмеження позиції (як у moving)
			const objWidth = obj.getScaledWidth();
			const objHeight = obj.getScaledHeight();

			let newLeft = obj.left;
			let newTop = obj.top;

			const minX = areaBounds.left + objWidth / 2;
			const maxX = areaBounds.left + areaBounds.width - objWidth / 2;

			const minY = areaBounds.top + objHeight / 2;
			const maxY = areaBounds.top + areaBounds.height - objHeight / 2;

			if (newLeft < minX) newLeft = minX;
			if (newLeft > maxX) newLeft = maxX;

			if (newTop < minY) newTop = minY;
			if (newTop > maxY) newTop = maxY;
			const isClamped =
				newLeft < minX || newLeft > maxX || newTop < minY || newTop > maxY;

			// 🔥 якщо позиція вперлась — теж блокуємо scaling

			if(!isClamped){
				obj.set({
					left: newLeft,
					top: newTop
				});
			}


			// 🔥 збереження
			obj.customData = {
				...obj.customData,
				originalFontSize: obj.fontSize,
				originalWidth: obj.width,
				originalHeight: obj.height,
			};

			obj.setCoords();
		};


		const handleSelection = (e) => {
			console.log('selected',e)
			const selected = e.selected?.[0] || e.target


			if (selected?.customData?.type === 'text') {
				setCustomizerType('text')
				setSelectedTextObject(selected)
			} else {
				setCustomizerType('image')
				setSelectedTextObject(null)
			}
		}

		const handleSelectionCleared = () => {
			console.log('handleSelectionCleared')
			setSelectedTextObject(null)
		}

		const handleRotating = (e) => {
			const obj = e.target
			if (!obj) return

			const snapAngle = 15
			const snapThreshold = 3

			let angle = obj.angle % 360
			if (angle < 0) angle += 360

			const snap = Math.round(angle / snapAngle) * snapAngle

			if (Math.abs(angle - snap) <= snapThreshold) {
				obj.set('angle', snap)
			}
		}

		const handleMoving = (e) => {
			const obj = e.target
			const vLine = verticalGuideRef.current;
			const hLine = horizontalGuideRef.current;
			const currentArea = currentAreaRef.current;

			const area = currentAreaRef2.current;


			if (!obj || obj.customData?.type === 'guide-line') return
			obj.setCoords();
			area.setCoords();

			const areaBounds = area.getBoundingRect(true);

			const objWidth = obj.getScaledWidth();
			const objHeight = obj.getScaledHeight();

			let newLeft = obj.left;
			let newTop = obj.top;

			const minX = areaBounds.left + objWidth / 2;
			const maxX = areaBounds.left + areaBounds.width - objWidth / 2;

			const minY = areaBounds.top + objHeight / 2;
			const maxY = areaBounds.top + areaBounds.height - objHeight / 2;

			if (newLeft < minX) newLeft = minX;
			if (newLeft > maxX) newLeft = maxX;

			if (newTop < minY) newTop = minY;
			if (newTop > maxY) newTop = maxY;

			obj.set({
				left: newLeft,
				top: newTop
			});

			const snapThreshold = 10
			const objCenter = obj.getCenterPoint()

			const areaCenterX = currentArea.x + currentArea.w / 2
			const areaCenterY = currentArea.y + currentArea.h / 2
			/*const distanceX = Math.abs(objCenter.x - areaCenterX)
			const distanceY = Math.abs(objCenter.y - areaCenterY)*/
			const distanceX = Math.abs(objCenter.x - currentArea.x); // Порівнюємо з 300
			const distanceY = Math.abs(objCenter.y - currentArea.y);
			vLine.set({ visible: distanceX <= snapThreshold })
			hLine.set({ visible: distanceY <= snapThreshold })

			obj.setCoords()
		}

		const handleMovingEnd = () => {
			if (verticalGuideRef.current) verticalGuideRef.current.set({ visible: false });
			if (horizontalGuideRef.current) horizontalGuideRef.current.set({ visible: false });
			fabricCanvasRef.current?.renderAll();
			fabricCanvas.renderAll()
		}

		const handleImageScaling = (e) => {
			const obj = e.target;
			const area = currentAreaRef2.current;

			if (!obj || obj.customData?.type !== 'uploaded-image') return;

			obj.setCoords();
			area.setCoords();

			const areaBounds = area.getBoundingRect(true);

			const scaleX = obj.scaleX;
			const scaleY = obj.scaleY;

			// 🔥 центр об'єкта
			const center = obj.getCenterPoint();

			// 🔥 максимально доступна ширина/висота від центру
			const maxWidth =
				2 * Math.min(
				center.x - areaBounds.left,
				areaBounds.left + areaBounds.width - center.x
				);

			const maxHeight =
				2 * Math.min(
				center.y - areaBounds.top,
				areaBounds.top + areaBounds.height - center.y
				);

			// 🔥 обмежуємо scale
			let allowedScaleX = scaleX;
			let allowedScaleY = scaleY;

			if (obj.width * scaleX > maxWidth) {
				allowedScaleX = maxWidth / obj.width;
			}

			if (obj.height * scaleY > maxHeight) {
				allowedScaleY = maxHeight / obj.height;
			}

			// 🔥 застосовуємо scale (як у тебе fontSize)
			obj.set({
				scaleX: allowedScaleX,
			});

			obj.setCoords();

			// 🔥 обмеження позиції (як у moving)
			const objBounds = obj.getBoundingRect(true);

			let newLeft = obj.left;
			let newTop = obj.top;

			const minX = areaBounds.left + objBounds.width / 2;
			const maxX = areaBounds.left + areaBounds.width - objBounds.width / 2;

			const minY = areaBounds.top + objBounds.height / 2;
			const maxY = areaBounds.top + areaBounds.height - objBounds.height / 2;

			if (newLeft < minX) newLeft = minX;
			if (newLeft > maxX) newLeft = maxX;

			if (newTop < minY) newTop = minY;
			if (newTop > maxY) newTop = maxY;

			obj.set({
				left: newLeft,
				top: newTop
			});

			obj.customData = {
				...obj.customData,
				originalWidth: obj.getScaledWidth(),
				originalHeight: obj.getScaledHeight(),
			};

			obj.setCoords();
		};

		// =========================
		// 📡 EVENTS
		// =========================
		fabricCanvas.on('object:scaling', handleTextScaling)
		fabricCanvas.on('object:scaling', handleImageScaling)

		fabricCanvas.on('object:rotating', handleRotating)
		fabricCanvas.on('object:moving', handleMoving)
		fabricCanvas.on('mouse:up', handleMovingEnd)
		fabricCanvas.on('selection:created', handleSelection)
		fabricCanvas.on('selection:updated', handleSelection)

		fabricCanvas.on('selection:cleared', handleSelectionCleared)

		// =========================
		// 🧹 CLEANUP
		// =========================
		return () => {
			fabricCanvas.off('object:scaling', handleTextScaling)
			fabricCanvas.off('object:scaling', handleImageScaling)
			fabricCanvas.off('object:rotating', handleRotating)
			fabricCanvas.off('object:moving', handleMoving)
			fabricCanvas.off('mouse:up', handleMovingEnd)
			fabricCanvas.off('selection:created', handleSelection)
			fabricCanvas.off('selection:updated', handleSelection)
			fabricCanvas.off('selection:cleared', handleSelectionCleared)

			fabricCanvas.dispose()
			fabricCanvasRef.current = null
		}
	}, [isLoading])

	useEffect(() => {
		const canvas = fabricCanvasRef.current;



		let im;
		if(activeSide==='back'){
			im=imageBack || image
		}	else if(activeSide==='left'){
			im=imageLeft || image
		} else if(activeSide==='right'){
			im=imageRight || image
		}else {
			im=image
		}
		if (!canvas || !im) return;

		const updateBackground = async () => {
			const fixedImage = im.startsWith('//') ? `https:${im}` : im;

			try {
				let url=fixedImage;
				/*if(activeSide==='back'){
					url=fixedImage
				}else {
					try {
		/!*				const res = await fetch(fixedImage);
						const blob = await res.blob();*!/
						url = fixedImage
					}catch (e) {
						url=fixedImage
					}
				}*/


				const img = new Image();

				img.onload = () => {
					const fabricImg = new FabricImage(img);

					const scale = Math.min(600 / img.width, 600 / img.height)

					const scaledWidth = img.width * scale
					const scaledHeight = img.height * scale

					fabricImg.set({
						scaleX: scale,
						scaleY: scale,
						left: (600 - scaledWidth) / 2,
						top: (600 - scaledHeight) / 2,
						originX: 'left',
						originY: 'top',
						selectable: false,
						evented: false,
					})


					canvas.backgroundImage = fabricImg
					canvas.requestRenderAll()
				};
				img.src = url;
			} catch (e) {
				console.error('FAILED LOAD BG', e);
			}
		};

		updateBackground();
	}, [image,activeSide]);

	useEffect(() => {
		console.log('canvas area')
		const canvas = fabricCanvasRef.current;
		if (!canvas) return;

		console.log('canvas area',canvas)
		// Видаляємо стару рамку та гайди перед малюванням нових
		const existingObjects = canvas.getObjects().filter(obj =>
			obj.customData?.type === 'area' || obj.customData?.type === 'guide-line'
		);
		canvas.remove(...existingObjects);

		const currentArea = area

		currentAreaRef.current = currentArea;
		const areaRect = new Rect({
			left: Math.round(currentArea.x),
			top: Math.round(currentArea.y),
			width: Math.round(currentArea.w),
			height: Math.round(currentArea.h),
			fill: 'rgba(255,255,255,0.05)',
			strokeWidth: 2,
			stroke: '#4E008E',
			strokeDashArray: [5, 5],
			selectable: true,
			evented: false,
			customData: { type: 'area' },
		});
		currentAreaRef2.current = areaRect;


		console.log(areaRect)
		// =========================
		// 📏 GUIDE LINES (центр area)
		// =========================
		const centerX = currentArea.x;
		const centerY = currentArea.y;

		const left = centerX - (currentArea.w / 2);   // 300 - 100 = 200
		const right = centerX + (currentArea.w / 2);  // 300 + 100 = 400
		const top = centerY - (currentArea.h / 2);    // 300 - 100 = 200
		const bottom = centerY + (currentArea.h / 2);

		const verticalGuideLine = new Line(
			[centerX, top, centerX, bottom], 			{
				stroke: '#4E008E',
				strokeWidth: 1,
				strokeDashArray: [5, 5],
				selectable: false,
				evented: false,
				visible: false,
				opacity: 1,
			},
		)

		const horizontalGuideLine = new Line(
			[left, centerY, right, centerY],
			{
				stroke: '#4E008E',
				strokeWidth: 1,
				strokeDashArray: [5, 5],
				selectable: false,
				evented: false,
				visible: false,
				opacity: 1,
			},
		)
		verticalGuideRef.current = verticalGuideLine;
		horizontalGuideRef.current = horizontalGuideLine;
		verticalGuideLine.customData = { type: 'guide-line' }
		horizontalGuideLine.customData = { type: 'guide-line' }

		canvas.add( verticalGuideLine);
		canvas.add( horizontalGuideLine);
		canvas.add( areaRect);
		// Важливо: перемістити системні елементи назад, щоб вони не перекривали текст
		canvas.requestRenderAll();

	}, [area]);

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
								return next
							}
							return prev
						})
					}

					// Удаление текста
					if (activeObject.customData?.type === 'text') {
						e.preventDefault()
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
		const area = currentAreaRef.current
		if (!area) return

		const areaBox = {
			left: area.x,
			top: area.y,
			width: area.w,
			height: area.h,
		}

		// Получаем текущие URL изображений на canvas
		const currentObjects = canvas.getObjects()
		const currentUrls = currentObjects
			.filter((obj) => obj.customData?.type === 'uploaded-image')
			.map((obj) => obj.customData.url)

		// Удаляем изображения, которых больше нет в uploaderFiles
		const uploaderUrls = uploaderFiles.map((f) => f.url)
		currentObjects.forEach((obj) => {
			if (obj.customData?.type === 'uploaded-image' && !uploaderUrls.includes(obj.customData.url)) {
				canvas.remove(obj)
			}
		})

		// Добавляем новые изображения
		uploaderFiles.forEach(async (fileData) => {
			console.log("fileData",fileData)
			if (currentUrls.includes(fileData.url)) return

			try {
				const imgElement = document.createElement('img')
				imgElement.src = fileData.url

				imgElement.onload = () => {
					const scale = Math.min(
						areaBox.width / imgElement.width,
						areaBox.height / imgElement.height
					)


					const left = fileData.x !== undefined ? fileData.x : areaBox.left
					const top = fileData.y !== undefined ? fileData.y : areaBox.top

					const finalWidth = imgElement.width * scale
					const finalHeight = imgElement.height * scale

					const fabricImg = new FabricImage(imgElement, {
						left,
						top,
						scaleX: scale,
						scaleY: scale,
						angle: fileData.rotation || 0,
						cornerStyle: 'circle',
						cornerColor: '#4E008E',
						cornerStrokeColor: '#ffffff',
						borderColor: '#4E008E',
						borderScaleFactor: 2,
						transparentCorners: false,
						lockRotation: false,
						lockUniScaling: false,
						lockScalingFlip: true
					})

					fabricImg.set({
						clipPath: new Rect({
							left: areaBox.left,
							top: areaBox.top,
							width: areaBox.width,
							height: areaBox.height,
							absolutePositioned: true,
						}),
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
					let id
					if(!fileData.id){
						id=uuidv4()
					}
					else {
						id=fileData.id
					}

					// Добавляем кастомные данные для идентификации
					fabricImg.customData = {
						type: 'uploaded-image',
						url: fileData.url,
						fileData: fileData,

						orgObj:{
							id:id,
							w:imgElement.width,
							h:imgElement.height
						}

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

	// useEffect для загрузки текста с сервера на canvas
	useEffect(() => {
		if (isLoading) return
		const canvas = fabricCanvasRef.current

		if (!canvas || serverLabels.length === 0) return

		const area = currentAreaRef.current
		if (!area) return

		const areaBox = {
			left: area.x,
			top: area.y,
			width: area.w,
			height: area.h,
		}

		const currentObjects = canvas.getObjects()
		// Получаем текущие тексты на canvas (по уникальному признаку)
		const currentTexts = currentObjects
			.filter((obj) => obj.customData?.type === 'text')
			.map((obj) => obj.customData.serverId)

		// Добавляем новые тексты
		serverLabels.forEach((labelData, index) => {
			const serverId = `server-label-${index}`

			// Проверяем, не загружен ли уже этот текст
			if (currentTexts.includes(serverId)) return

			try {
				// Используем координаты с сервера, если они есть, иначе значения по умолчанию
				const left = labelData.x !== undefined ? labelData.x : 50
				const top = labelData.y !== undefined ? labelData.y : 50
				const fontSize = labelData.fontSize || 54
				const width = labelData.width !== undefined ? labelData.width : canvas.width

				const textbox = new Textbox(labelData.text, {
					left,
					top,
					fontSize,
					fontFamily: labelData.fontFamily || 'Montserrat',
					fill: labelData.color || '#000000',
					fontWeight: labelData.bold ? 700 : 400,
					fontStyle: labelData.italic ? 'italic' : 'normal',
					width,
					angle: labelData.rotation || 0,
					textAlign: 'center',
					cornerStyle: 'circle',
					cornerColor: '#4E008E',
					cornerStrokeColor: '#ffffff',
					borderColor: '#4E008E',
					borderScaleFactor: 2,
					transparentCorners: false,
					lockScalingFlip: true,
					lockUniScaling: false,

				})

				// Скрываем ненужные контролы
				textbox.setControlsVisibility({
					ml: false,
					mr: false,
					mt: false,
					mb: false,
				})
				textbox.set({
					clipPath: new Rect({
						left: areaBox.left,
						top: areaBox.top,
						width: areaBox.width,
						height: areaBox.height,
						absolutePositioned: true,
					}),
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
					cornerSize: 16,
				})
				let id
				if(!labelData.id){
					id=uuidv4()
				}else {
					id=labelData.id
				}
				// Добавляем кастомные данные для идентификации
				textbox.customData = {
					type: 'text',
					serverId: serverId,
				}

				canvas.add(textbox)

				textbox.customData = {
					...textbox.customData,
					originalFontSize: fontSize,
					originalWidth: width,
					originalHeight: labelData.height,
					orgObj:{
						id:id
					}
				}
			} catch (error) {
				console.error('❌ Ошибка при добавлении текста на canvas:', error)
			}
		})

		canvas.renderAll()
	}, [serverLabels, isLoading])

	useEffect(() => {
		const fetchStoreData = async () => {
			try {
				const res = await spiritHeroApi.getStore(storeId)
/*
				const storeMinimalGroups = Array.isArray(res?.minimum_groups) ? res.minimum_groups : [];
*/
				const defaultLogoArea = {
					logo_area: {
						x: 300,
						y: 300,
						width: 200,
						height: 200,
						type_id:1
					}
				}

				const storeMinimalGroups = Array.isArray(res?.minimum_groups)
					? res.minimum_groups.map(group => ({
						...group,
						products: (group.products || []).map(product => {
							const hasValidArea =
								Array.isArray(product.logo_area) &&
								product.logo_area.length > 0 &&
								product.logo_area[0]?.logo_area


							return {
								...product,
								logo_area: hasValidArea
									? product.logo_area
									: [defaultLogoArea],
							}
						})
					}))
					: []
				/*const storeMinimalGroups = Array.isArray(res?.minimum_groups) ? res.minimum_groups : []
				dispatch(setMinimalGroups(storeMinimalGroups))*/
				setMinimalGroupsFromStore(storeMinimalGroups)
				console.debug('spiritHeroApi.getStore DESIGN', res)

				setCustomerLogos({ ...res.design })
				setBaseDesign(
					res?.design?.designList?.flatMap((group) => {
						return (group?.productDesign ?? []).map((prod) => {

							const logosWithImg = (prod?.design?.customerLogos ?? []).map((logo) => {
								const found = (group?.customerLogosImgList ?? []).find(
									(imgItem) => imgItem.id === logo.uId
								);

								return {
									...logo,
									image: found ? (found.image || found.img) : null,
								};
							});

							return {
								product_group_id: group?.minimum_group_id,
								product_id: prod?.product_id,
								type_id: prod?.type_id,
								location_id: prod?.location_id || 1,
								customerLogos: logosWithImg,
								labels: prod?.design?.labels ?? [],
							};
						});
					}) ?? []
				);
				if (res?.store?.is_fundraise_popup) {
					setPopup(true)
				}

				const loadedElements = []
				const serverImageFiles = []
				let zIndex = 1

				const sortedProducts = storeMinimalGroups.reduce((acc, group) => {
					const groupKey = String(group?.id)
					const groupProducts = Array.isArray(group?.products) ? group.products : []

					if (groupProducts.length > 0) {
						acc[groupKey] = groupProducts
					}

					return acc
				}, {})
				setProductsByCategory(sortedProducts)
				const firstGroupKey = Object.keys(sortedProducts)[0]
				const firstProduct =
					firstGroupKey && Array.isArray(sortedProducts[firstGroupKey])
						? sortedProducts[firstGroupKey][0]
						: null
				if (firstProduct) {
					setActiveCardId(firstProduct.id)
					setActiveGroupId(firstGroupKey)
					setImage(firstProduct.choosed_colors[0]?.image || product_image)
					setImageBack(firstProduct.choosed_colors[0]?.image_back)
					setImageLeft(firstProduct.choosed_colors[0]?.image_side_left)
					setImageRight(firstProduct.choosed_colors[0]?.image_side_right)

					const group = storeMinimalGroups.find(g => g.id === +firstGroupKey)

					const product = group?.products?.find(p => p.id === +firstProduct.id)

					const areaFromConfig = product?.logo_area.find(value => value.type_id===activeTypeId)?.logo_area

					if (areaFromConfig) {
						setArea({
							x: areaFromConfig.x,
							y: areaFromConfig.y,
							w: areaFromConfig.width,
							h: areaFromConfig.height,
						})
					}else {
						setArea({
							x: 300,
							y: 300,
							w: 200,
							h: 200,
						})
					}

				}
				console.log('res.design?.designList[0]::',res.design?.designList)

				const designDataG = res.design?.designList?.find((value)=>value.minimum_group_id === +firstGroupKey)
				console.log('designDataG::',designDataG)

				const designData = designDataG?.productDesign?.find((value)=>value.product_id === firstProduct.id && value.type_id===1)

				console.log('designData::',designData)
				if(designData && designDataG){
					const imgMap = new Map(
						designDataG.customerLogosImgList.map((item) => [item.id, item.image])
					);
					console.log('imgMap',imgMap)
					if (designData.design.customerLogos && Array.isArray(designData.design.customerLogos)) {
						console.log('customerLogos')
						designData.design.customerLogos.forEach((logoData, index) => {
							const imageLogo = logoData.image || imgMap.get(logoData.uId);

							if (!imageLogo) return;
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
								url: imageLogo,
								base64:imageLogo,
								file: { name: `Server image ${index + 1}` },
								isServerImage: true,
								x: logoData.x,
								y: logoData.y,
								width: logoData.width,
								height: logoData.height,
								rotation:logoData.rotation || 0,
								id
							}

							serverImageFiles.push(serverFile)
						})
					}
					setUploaderFiles(serverImageFiles)

					if (designData.design.labels && Array.isArray(designData.design.labels)) {
						console.log('labels')

						const labelsData = designData.design.labels.map((labelData) => {
							const id = uuidv4();

							return {
								id,
							text: labelData.text || '',
							x: labelData.x,
							y: labelData.y,
							width: labelData.width,
							height: labelData.height,
							fontSize:
								typeof labelData.fontSize === 'number'
									? labelData.fontSize
									: parseInt(labelData.fontSize) || 54,
							fontFamily: labelData.fontFamily || 'Montserrat',
							color: labelData.color || '#000000',
							bold: labelData.bold || false,
							italic: labelData.italic || false,
							rotation: labelData.rotation || 0,
						}})
						setServerLabels(labelsData)
					}

				}

			} catch (error) {
				console.error(`spiritHeroApi.getStore error`, error)
			} finally {
				setIsLoading(false)
			}
		}
		fetchStoreData()
	}, [dispatch, storeId,isNewDesignModalOpen])

	// Функция для синхронизации данных с canvas в customerLogos
	const syncCanvasToCustomerLogos = () => {
		const canvas = fabricCanvasRef.current
		if (!canvas) return

		const objects = canvas.getObjects()

		const customerLogosData = []
		const labelsData = []

		objects.forEach((obj) => {
			// Собираем данные о логотипах (изображениях)
			if (obj.customData?.type === 'uploaded-image') {
				customerLogosData.push({
					image: obj.customData.fileData.base64,
					x: Math.round(obj.left),
					y: Math.round(obj.top),
					width: Math.round(obj.getScaledWidth()),
					height: Math.round(obj.getScaledHeight()),
					rotation: Math.round(obj.angle),
				})
			}
			// Собираем данные о текстах
			if (obj.customData?.type === 'text') {
				labelsData.push({
					text: obj.text,
					x: Math.round(obj.left),
					y: Math.round(obj.top),
					width: Math.round(obj.customData.originalWidth),
					height: Math.round(obj.customData.originalHeight),
					fontSize: Math.round(obj.customData.originalFontSize),
					fontFamily: obj.fontFamily,
					color: obj.fill,
					bold: obj.fontWeight === 'bold' || obj.fontWeight === 700,
					italic: obj.fontStyle === 'italic',
					rotation: Math.round(obj.angle),
				})
			}
		})

		// Обновляем customerLogos
		setCustomerLogos((prev) => ({
			...prev,
			customerLogos: customerLogosData,
			labels: labelsData,
		}))

		return {
			customerLogos: customerLogosData,
			labels: labelsData,
		}
	}

	const saveDesignForCurrentProduct = async () => {
		setIsLoading(true)
		const syncData = syncCanvasToCustomerLogos()

		const base64 = await domtoimage.toJpeg(imageBoxRef.current, {
			quality: 0.95,
		})

		const design = {
			elementsPositionImage: base64,
			customerLogos: syncData.customerLogos,
			labels: syncData.labels,
		}

		const payload = {
			store_id: storeId,
			designs: [
				{
					product_id: +activeCardId,
					...design,
				},
			],
		}

		setProductsByCategory((prev) => {
			if (!prev || !activeGroupId) return prev
			const currentGroupProducts = Array.isArray(prev[activeGroupId]) ? prev[activeGroupId] : []
			return {
				...prev,
				[activeGroupId]: currentGroupProducts.map((product) =>
					product.id === activeCardId ? { ...product, design } : product,
				),
			}
		})

		console.debug('saveDesignForCurrentProduct payload', payload)

		try {
			const response = await spiritHeroApi.saveDesignForCurrentProduct(payload)
			console.debug('saveDesignForCurrentProduct response', response)
			setCustomerLogos(design)
			setIsModalOpen(true)
		} catch (error) {
			console.error('Error saveDesignForCurrentProduct:', error)
		}
		finally {
			setIsLoading(false)
		}
	}

	const saveDesignForEachProducts = async () => {
		setIsLoading(true)
		const syncData = syncCanvasToCustomerLogos()

		const base64 = await domtoimage.toJpeg(imageBoxRef.current, {
			quality: 0.95,
		})

		const design = {
			elementsPositionImage: base64,
			customerLogos: syncData.customerLogos,
			labels: syncData.labels,
		}
		const activeGroupProducts = getProductsFromActiveGroup()

		const payload = {
			store_id: storeId,
			designs: activeGroupProducts.map((product) => ({
				product_id: product.id,
				...design,
			})),
		}

		setProductsByCategory((prev) => {
			if (!prev || !activeGroupId) return prev
			const currentGroupProducts = Array.isArray(prev[activeGroupId]) ? prev[activeGroupId] : []
			return {
				...prev,
				[activeGroupId]: currentGroupProducts.map((product) => ({ ...product, design })),
			}
		})

		try {
			const response = await spiritHeroApi.saveDesignForCurrentProduct(payload)
			console.debug('saveDesignForEachProducts response', response)
			setIsModalOpen(true)
			setCustomerLogos(design)
		} catch (error) {
			console.error('Error saveDesignForEachProducts:', error)
		} finally {
			setIsLoading(false)
		}
	}


	/*const mapLogosForProduct = (objects, productId,groupId) => {
		let area

		const group = minimalGroups.find(g => g.id === +groupId)

		const product = group?.products?.find(p => p.id === +productId)

		const areaFromConfig = product?.logo_area?.[0]?.logo_area

		if (areaFromConfig) {
			area = {
				x: areaFromConfig.x,
				y: areaFromConfig.y,
				w: areaFromConfig.width,
				h: areaFromConfig.height,
			}
		}

		return objects
			.filter(obj => obj.customData?.type === 'uploaded-image')
			.map(obj => ({
				image: obj.customData.fileData.base64,
				x: Math.round(area.x),
				y: Math.round(area.y),
				width: undefined,
				height: undefined,
				rotation: 0,
				uId:obj.customData.orgObj.id,
			}))
	}*/

	const mapLogosForProduct = (objects, productId,groupId, type,typeId) => {
		let area

		const group = minimalGroups.find(g => g.id === +groupId)

		const product = group?.products?.find(p => p.id === +productId)

		const areaFromConfig = product?.logo_area?.find(value => value.type_id===typeId)?.logo_area

		if (areaFromConfig) {
			area = {
				x: areaFromConfig.x,
				y: areaFromConfig.y,
				w: areaFromConfig.width,
				h: areaFromConfig.height,
			}
		}else {
			area = 	{
				x: 300,
				y: 300,
				w:200,
				h: 200,
			}
		}
		// helper: перевірка чи обʼєкт в межах area
		const isExceedingArea = (obj, area) => {
			const rect = obj.getBoundingRect();

			const objLeft = rect.left;
			const objTop = rect.top;
			const objRight = rect.left + rect.width;
			const objBottom = rect.top + rect.height;

			const areaLeft = area.x - area.w / 2;
			const areaTop = area.y - area.h / 2;
			const areaRight = area.x + area.w / 2;
			const areaBottom = area.y + area.h / 2;

			// Повертає true, якщо ХОЧА Б ОДИН край об'єкта вийшов за межі квадрата
			return (
				objLeft < areaLeft ||    // Виліз зліва
				objTop < areaTop ||      // Виліз зверху
				objRight > areaRight ||  // Виліз справа
				objBottom > areaBottom   // Виліз знизу
			);
		};

		return objects
			.filter(obj => obj.customData?.type === 'uploaded-image')
			.map(obj => {
				const base = {
					image: obj.customData.fileData.base64,
					uId: obj.customData.orgObj.id,
				}

				console.log(isExceedingArea(obj,area))
				// 🔥 APPLY ALL логіка
				if (type === 'Apply All' && !isExceedingArea(obj,area)) {
					return {
						...base,
						x: Math.round(obj.left),
						y: Math.round(obj.top),
						width: Math.round(obj.getScaledWidth()),
						height: Math.round(obj.getScaledHeight()),
						rotation: Math.round(obj.angle),
					}
				}

				// ❌ fallback (центр)
				return {
					...base,
					x: Math.round(area.x),
					y: Math.round(area.y),
					width: undefined,
					height: undefined,
					rotation: 0,
				}
			})
	}

	const calculateOptimalFontSize = (
		text,
		targetWidth,
		initialFontSize,
		fontFamily,
		fontWeight,
		fontStyle,
		canvas
	) => {
		const ctx = canvas.getContext()

		ctx.font = `${fontStyle} ${fontWeight} ${initialFontSize}px ${fontFamily}`

		const actualWidth = ctx.measureText(text).width
		const safeWidth = targetWidth * 0.95

		let size = initialFontSize * (safeWidth / actualWidth)

		return Math.max(16, Math.min(size, 200))
	}

	const mapLabelsForProduct = (labelsData, productId, canvas,groupId,type,typeId) => {
		let area

		const group = minimalGroups.find(g => g.id === +groupId)

		const product = group?.products?.find(p => p.id === +productId)

		const areaFromConfig = product?.logo_area?.find(value => value.type_id===typeId)?.logo_area


		if (areaFromConfig) {
			area = {
				x: areaFromConfig.x,
				y: areaFromConfig.y,
				w: areaFromConfig.width,
				h: areaFromConfig.height,
			}
		}else {
			area = 	{
				x: 300,
				y: 300,
				w:200,
				h: 200,
			}
		}
		const isExceedingArea = (obj, area) => {
			const rect = obj.getBoundingRect();

			const objLeft = rect.left;
			const objTop = rect.top;
			const objRight = rect.left + rect.width;
			const objBottom = rect.top + rect.height;

			const areaLeft = area.x - area.w / 2;
			const areaTop = area.y - area.h / 2;
			const areaRight = area.x + area.w / 2;
			const areaBottom = area.y + area.h / 2;

			// Повертає true, якщо ХОЧА Б ОДИН край об'єкта вийшов за межі квадрата
			return (
				objLeft < areaLeft ||    // Виліз зліва
				objTop < areaTop ||      // Виліз зверху
				objRight > areaRight ||  // Виліз справа
				objBottom > areaBottom   // Виліз знизу
			);
		};

		return labelsData.filter(obj => obj.customData?.type === 'text').map(label => {
			const base = {
				uId: label.customData.orgObj.id,
			}

			// 🔥 APPLY ALL логіка
			if (type === 'Apply All' && !isExceedingArea(label,area)) {
				return {
					...base,
					text: label.text,
					x: Math.round(label.left),
					y: Math.round(label.top),
					width: Math.round(label.customData.originalWidth),
					height: Math.round(label.customData.originalHeight),
					fontSize: Math.round(label.customData.originalFontSize),
					fontFamily: label.fontFamily,
					color: label.fill,
					bold: label.fontWeight === 'bold' || label.fontWeight === 700,
					italic: label.fontStyle === 'italic',
					rotation: Math.round(label.angle),
				}
			}
			const optimalFontSize = calculateOptimalFontSize(
				label.text,
				area.w,
				40,
				label.fontFamily,
				label.bold ? 'bold' : 'normal',
				label.italic ? 'italic' : 'normal',
				canvas
			)

			return {
				text: label.text,
				x: Math.round(area.x),
				y: Math.round(area.y),
				width: area.w,
				height: area.h,
				fontSize: Math.round(optimalFontSize),
				fontFamily: label.fontFamily,
				color: label.color,
				bold: label.bold,
				italic: label.italic,
				rotation: 0,
				uId:label.customData.orgObj.id,
			}
		})
	}

	const syncCanvasToGroupId = (groupId,productId,type='d',typeId) => {
		console.log('type',type)
		console.log('typeId',typeId)

		const canvas = fabricCanvasRef.current
		if (!canvas) return

		const objects = canvas.getObjects()

		const customerLogosData = []
		const labelsData = []

		objects.forEach((obj) => {
			// Собираем данные о логотипах (изображениях)
			console.log(obj.customData)
			if (obj.customData?.type === 'uploaded-image') {
				customerLogosData.push({
					image: obj.customData.fileData.base64,
					x: Math.round(obj.left),
					y: Math.round(obj.top),
					width: Math.round(obj.getScaledWidth()),
					height: Math.round(obj.getScaledHeight()),
					rotation: Math.round(obj.angle),
					uId:obj.customData.orgObj.id,

				})
			}
			// Собираем данные о текстах
			if (obj.customData?.type === 'text') {
				labelsData.push({
					uId:obj.customData.orgObj.id,
					text: obj.text,
					x: Math.round(obj.left),
					y: Math.round(obj.top),
					width: Math.round(obj.customData.originalWidth),
					height: Math.round(obj.customData.originalHeight),
					fontSize: Math.round(obj.customData.originalFontSize),
					fontFamily: obj.fontFamily,
					color: obj.fill,
					bold: obj.fontWeight === 'bold' || obj.fontWeight === 700,
					italic: obj.fontStyle === 'italic',
					rotation: Math.round(obj.angle),
				})
			}
		})

		const newState = (() => {
			let found = false;

			const updated = baseDesign.map((item) => {
				if (item.product_group_id === +groupId && item.product_id === +productId && item.type_id === +typeId) {
					found = true;

					return {
						...item,
						customerLogos: customerLogosData,
						labels: labelsData,
					};
				}
				return item;
			});

			// 🔥 якщо не знайшли — додаємо новий
			if (!found) {
				updated.push({
					product_group_id: +groupId,
					product_id: +productId,
					type_id:+typeId,
					customerLogos: customerLogosData,
					labels: labelsData,
				});
			}

			return updated;
		})();

		const allLogoIds = customerLogosData.map(l => l.uId)
		const allLabelIds = labelsData.map(l => l.uId)

		const minimalGroup = minimalGroups.find(g => g.id === +groupId)

		if (minimalGroup && (typeId === 1 || type === 'Apply All')) {
			minimalGroup.products.forEach((product) => {

				let item = newState.find(
					i =>
						i.product_group_id === +groupId &&
						i.product_id === product.id &&
					  i.type_id === +typeId
				)

				const newCustomerLogos = mapLogosForProduct(objects, product.id,groupId,type,typeId)
				const newLabels = mapLabelsForProduct(objects, product.id, canvas,groupId,type,typeId)

				const newLogosById = Object.fromEntries(
					newCustomerLogos.map(l => [l.uId, l])
				)

				const newLabelsById = Object.fromEntries(
					newLabels.map(l => [l.uId, l])
				)

				if (!item) {
					newState.push({
						product_group_id: +groupId,
						product_id: product.id,
						type_id:+typeId,
						customerLogos: newCustomerLogos,
						labels: newLabels,
					})
					return
				}

				// --- LOGOS SYNC ---
				const existingLogosById = Object.fromEntries(
					(item.customerLogos || []).map(l => [l.uId, l])
				)


				Object.keys(existingLogosById).forEach((uId) => {
					if (!allLogoIds.includes(uId)) {
						delete existingLogosById[uId]
					}
				})

				allLogoIds.forEach((uId) => {
					if (type === 'Apply All' || !existingLogosById[uId]) {{
						existingLogosById[uId] = newLogosById[uId]
					}
					}
				})

				item.customerLogos = Object.values(existingLogosById)

				// --- LABELS SYNC ---
				const existingLabelsById = Object.fromEntries(
					(item.labels || []).map(l => [l.uId, l])
				)

				Object.keys(existingLabelsById).forEach((uId) => {
					if (!allLabelIds.includes(uId)) {
						delete existingLabelsById[uId]
					}
				})

				allLabelIds.forEach((uId) => {
					if (type === 'Apply All' || !existingLabelsById[uId]) {
						existingLabelsById[uId] = newLabelsById[uId]
					}
				})

				item.labels = Object.values(existingLabelsById)
			})
		}
		console.log('newState', newState);

		setBaseDesign(newState);

		return newState;

	}

	const onCardClick = (id, groupId) => {
		const nextActiveGroupId = String(groupId ?? '')
		const nextActiveProductId = String(id ?? '')

		setActiveGroupId(nextActiveGroupId)
		setActiveCardId(nextActiveProductId)
		setActiveSide('front');
		setActiveTypeId(1)

		if(nextActiveProductId===activeCardId && nextActiveGroupId === activeGroupId){
      return 0;
		}
		else {
			const baseDesignNew = syncCanvasToGroupId(activeGroupId,activeCardId,'d',activeTypeId)
			const designData = baseDesignNew.find((value)=>value.product_group_id === +nextActiveGroupId && value.product_id === +nextActiveProductId && value.type_id === 1)

			if (designData) {
				setCustomerLogos(designData)

				const canvas = fabricCanvasRef.current
				if (canvas) {
					const objectsToRemove = canvas
						.getObjects()
					objectsToRemove.forEach((obj) => canvas.remove(obj))
					canvas.renderAll()
				}
				const group = minimalGroups.find(g => g.id === +nextActiveGroupId)
				const product = group?.products?.find(p => p.id === +nextActiveProductId)

				const areaFromConfig = product?.logo_area.find(value => value.type_id===1)?.logo_area

				if (areaFromConfig) {
					setArea({
						x: areaFromConfig.x,
						y: areaFromConfig.y,
						w: areaFromConfig.width,
						h: areaFromConfig.height,
					})
				}else {
					setArea({
						x: 300,
						y: 300,
						w:200,
						h: 200,
					})
				}

				setUploaderFiles([])
				setServerLabels([])

				const loadedElements = []
				const serverImageFiles = []
				let zIndex = 1

				if (designData.customerLogos && Array.isArray(designData.customerLogos)) {
					designData.customerLogos.forEach((logoData, index) => {
						loadedElements.push({
							id:logoData?.uId,
							type: 'image',
							x: logoData.x || 30,
							y: logoData.y || 30,
							width: logoData.width || 100,
							height: logoData.height || 100,
							rotation:logoData.rotation || 0,
							zIndex: zIndex++,
							content: { src: logoData.image },
							isServerImage: true,
						})

						const serverFile = {
							id:logoData.uId,
							url: logoData.image,
							base64: logoData.image,
							file: { name: `Server image ${index + 1}` },
							isServerImage: true,
							x: logoData.x,
							y: logoData.y,
							width: logoData.width,
							height: logoData.height,
							rotation:logoData.rotation || 0,

						}

						serverImageFiles.push(serverFile)
					})
				}
				setUploaderFiles(serverImageFiles)

				if (designData.labels && Array.isArray(designData.labels)) {
					const labelsData = designData.labels.map((labelData) => ({
						id:labelData?.uId,
						text: labelData.text || '',
						x: labelData.x,
						y: labelData.y,
						width: labelData.width,
						height: labelData.height,
						fontSize:
							typeof labelData.fontSize === 'number'
								? labelData.fontSize
								: parseInt(labelData.fontSize) || 54,
						fontFamily: labelData.fontFamily || 'Montserrat',
						color: labelData.color || '#000000',
						bold: labelData.bold || false,
						italic: labelData.italic || false,
						rotation: labelData.rotation || 0,
					}))
					setServerLabels(labelsData)
				}
			}
			else {
				const canvas = fabricCanvasRef.current
				if (canvas) {
					const objectsToRemove = canvas
						.getObjects()
					objectsToRemove.forEach((obj) => canvas.remove(obj))
					canvas.renderAll()
				}

				const group = minimalGroups.find(g => g.id === +nextActiveGroupId)

				const product = group?.products?.find(p => p.id === +nextActiveProductId)

				const areaFromConfig = product?.logo_area.find(value => value.type_id===1)?.logo_area

				if (areaFromConfig) {
					setArea({
						x: areaFromConfig.x,
						y: areaFromConfig.y,
						w: areaFromConfig.width,
						h: areaFromConfig.height,
					})
				}else {
					setArea({
						x: 300,
						y: 300,
						w:200,
						h: 200,
					})
				}
			}
		}

	}

	const onSideClick = (type, id) => {
		const nextActiveSideId = id
		setActiveSide(type);
		setActiveTypeId(nextActiveSideId)
		const baseDesignNew = syncCanvasToGroupId(activeGroupId,activeCardId,'d',activeTypeId)

		const designData = baseDesignNew.find((value)=>value.product_group_id === +activeGroupId && value.product_id === +activeCardId && value.type_id === nextActiveSideId)

		console.log("designData",designData)
		if(designData){

			const canvas = fabricCanvasRef.current
			if (canvas) {
				const objectsToRemove = canvas
					.getObjects()
				objectsToRemove.forEach((obj) => canvas.remove(obj))
				canvas.renderAll()
			}
			const group = minimalGroups.find(g => g.id === +activeGroupId)
			const product = group?.products?.find(p => p.id === +activeCardId)

			const areaFromConfig = product?.logo_area.find(value => value.type_id===nextActiveSideId)?.logo_area

			if (areaFromConfig) {
				setArea({
					x: areaFromConfig.x,
					y: areaFromConfig.y,
					w: areaFromConfig.width,
					h: areaFromConfig.height,
				})
			}else {
				setArea({
					x: 300,
					y: 300,
					w:200,
					h: 200,
				})
			}

			setUploaderFiles([])
			setServerLabels([])

			const loadedElements = []
			const serverImageFiles = []
			let zIndex = 1

			if (designData.customerLogos && Array.isArray(designData.customerLogos)) {
				designData.customerLogos.forEach((logoData, index) => {
					loadedElements.push({
						id:logoData?.uId,
						type: 'image',
						x: logoData.x || 30,
						y: logoData.y || 30,
						width: logoData.width || 100,
						height: logoData.height || 100,
						rotation:logoData.rotation || 0,
						zIndex: zIndex++,
						content: { src: logoData.image },
						isServerImage: true,
					})

					const serverFile = {
						id:logoData.uId,
						url: logoData.image,
						base64: logoData.image,
						file: { name: `Server image ${index + 1}` },
						isServerImage: true,
						x: logoData.x,
						y: logoData.y,
						width: logoData.width,
						height: logoData.height,
						rotation:logoData.rotation || 0,

					}

					serverImageFiles.push(serverFile)
				})
			}
			setUploaderFiles(serverImageFiles)

			if (designData.labels && Array.isArray(designData.labels)) {
				const labelsData = designData.labels.map((labelData) => ({
					id:labelData?.uId,
					text: labelData.text || '',
					x: labelData.x,
					y: labelData.y,
					width: labelData.width,
					height: labelData.height,
					fontSize:
						typeof labelData.fontSize === 'number'
							? labelData.fontSize
							: parseInt(labelData.fontSize) || 54,
					fontFamily: labelData.fontFamily || 'Montserrat',
					color: labelData.color || '#000000',
					bold: labelData.bold || false,
					italic: labelData.italic || false,
					rotation: labelData.rotation || 0,
				}))
				setServerLabels(labelsData)
			}
		}else
		{
			const canvas = fabricCanvasRef.current
			if (canvas) {
				const objectsToRemove = canvas
					.getObjects()
				objectsToRemove.forEach((obj) => canvas.remove(obj))
				canvas.renderAll()
			}

			const group = minimalGroups.find(g => g.id === +activeGroupId)

			const product = group?.products?.find(p => p.id === +activeCardId)

			const areaFromConfig = product?.logo_area.find(value => value.type_id===nextActiveSideId)?.logo_area

			if (areaFromConfig) {
				setArea({
					x: areaFromConfig.x,
					y: areaFromConfig.y,
					w: areaFromConfig.width,
					h: areaFromConfig.height,
				})
			}else {
				setArea({
					x: 300,
					y: 300,
					w:200,
					h: 200,
				})
			}
		}
		/*if(nextActiveProductId===activeCardId && nextActiveGroupId === activeGroupId){
			return 0;
		}*/


	}
	const  a = {
		design: [
				{
					minimum_group_id: 1,
					customerLogosImgList: [],
					designList:[
						{
							productDesign: [
								{
									product_id: 1,
									location_id: 1,
									type_id: 1,
									design: {
										customerLogos: [],
										labels: []
									}
								}
							]
						}
					]
				}
		]
	}

	// Функция для получения параметров логотипа
	const getLogoParameters = async () => {
		try {
			setIsLoading(true)
			const  syncData = syncCanvasToGroupId(activeGroupId,activeCardId,'d',activeTypeId)
			console.log('syncData',syncData)
			const designList = Object.values(syncData.reduce((acc, item) => {
				const groupId = item.product_group_id;

				if (!acc[groupId]) {
					acc[groupId] = {
						minimum_group_id: groupId,
						customerLogosImgList: [],
						productDesign: []
					};
				}

				// Збираємо унікальні картинки для кореня групи
				item.customerLogos.forEach(logo => {
					if (!acc[groupId].customerLogosImgList.find(l => l.id === logo.uId)) {
						acc[groupId].customerLogosImgList.push({
							id: logo.uId,
							image: logo.image
						});
					}
				});

				acc[groupId].productDesign.push({
					product_id: item.product_id,
					location_id: 1,
					type_id: item.type_id,
					design: {
						// Видаляємо image, залишаємо все інше
						customerLogos: item.customerLogos.map(({ image, ...rest }) => rest),
						// Видаляємо uId, залишаємо все інше
						labels: item.labels.map(({ uId, ...rest }) => rest)
					}
				});

				return acc;
			}, {}));
			console.log('designList',designList)
			const payload = {
				store_id: storeId,
				designList,
			}
			const saveDesignForGroupsResponse = await spiritHeroApi.saveDesignForGroups(payload)
			console.debug('saveDesignForGroupsResponse response', saveDesignForGroupsResponse)

     /*			const designList = syncData.map((item) => ({
				minimum_groups: [item.product_group_id],
				design: {
					customerLogos: item.customerLogos,
					labels: item.labels,
				},
			}))

			const payload = {
				store_id: storeId,
				designList,
			}

			console.debug('saveDesignForGroupsPayload', payload)

			const saveDesignForGroupsResponse = await spiritHeroApi.saveDesignForGroups(payload)
			console.debug('saveDesignForGroupsResponse response', saveDesignForGroupsResponse)

			setIsModalOpen(true)*/
			/*setCustomerLogos(design)*/
			setIsModalOpen(true)
		} catch (error) {
			console.error('Error spiritHeroApi.saveDesignForGroups:', error)
			return null
		} finally {
			setIsLoading(false)
			setIsModalOpen(true)
		}
	}

	// Экспозиция функции getLogoParameters через ref
	useImperativeHandle(ref, () => ({
		getLogoParameters
	}))

	function downloadCanvas() {
		const canvas = fabricCanvasRef.current
		if (!canvas) return
		const dataUrl = canvas.toDataURL({
			format: 'png',
			multiplier: 2
		})

		const link = document.createElement('a')
		link.href = dataUrl
		link.download = 'image.png'

		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	const handleSelectOnCanvas = (fileData) => {
		console.log('fileData',fileData)
		const canvas = fabricCanvasRef.current;
		if (!canvas) return;

		const targetObj = canvas.getObjects().find(obj =>
			obj.customData?.orgObj?.id === fileData.id || obj.customData?.uId === fileData.id
		);


		if (targetObj) {
			canvas.setActiveObject(targetObj);
			canvas.requestRenderAll();

		} else {
			console.warn("Об'єкт не знайдено на канвасі");
		}
	};
	const toggleSide = () => {
		setActiveSide(prev => prev === 'front' ? 'back' : 'front')
	}
	return (
		<>
			{isLoading && <Loader />}
			<div className={css.design_section}>
				<div className={css.image__box}>
					<canvas ref={canvasRef} />
					<button className={css.applyAllBtn} onClick={() => {
						console.debug('Apply All')
						syncCanvasToGroupId(activeGroupId,activeCardId,'Apply All',activeTypeId)
					}}>
						Apply All
					</button>

					{/* Новий блок з квадратиками всередині image__box */}
					<div className={css.sideControls}>
						{[
							{ id: 'front', label: 'Front', img: image ,id2:1},
							{ id: 'back', label: 'Back', img: imageBack ,id2:2},
							{ id: 'left', label: 'Left', img: imageLeft ,id2:3},
							{ id: 'right', label: 'Right', img: imageRight ,id2:4},
						].map((side) => (
							// Рендеримо тільки якщо картинка для цієї сторони існує (опціонально)
							// Якщо хочете бачити всі 4 завжди, приберіть "side.img &&"
							side.img && (
								<div
									key={side.id}
									className={`${css.sideSquare} ${activeSide === side.id ? css.activeSquare : ''}`}
									onClick={(e) => {
										e.stopPropagation();
										onSideClick(side.id,side.id2)
									}}
								>
									<div className={css.squarePreview}>
										<img src={side.img} alt={side.label} />
									</div>
									<span className={css.squareLabel}>{side.label}</span>
								</div>
							)
						))}
					</div>
					{/*{imageBack && (
						<button
							className={css.applyBackSide}
							onClick={(e) => {
								e.stopPropagation()
								toggleSide()
							}}
						>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<g clip-path="url(#clip0_6765_117954)">
									<path d="M8.25 14.25H2.25V8.25" stroke="#4E008E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
									<path d="M21 17.2496C20.9999 15.4696 20.472 13.7296 19.4831 12.2497C18.4942 10.7697 17.0886 9.61622 15.4441 8.93506C13.7996 8.25391 11.9901 8.07568 10.2443 8.42291C8.49853 8.77015 6.89492 9.62724 5.63625 10.8858L2.25 14.2496" stroke="#4E008E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
								</g>
								<defs>
									<clipPath id="clip0_6765_117954">
										<rect width="24" height="24" fill="white"/>
									</clipPath>
								</defs>
							</svg>
							{activeSide === 'front' ? 'Back Side' : 'Front Side'}
						</button>
					)}*/}

				</div>


				<div className={css.settings__box}>
					<button
						onClick={() => {
							downloadCanvas()
							console.debug('CLICK')
						}}
						className={`${css.button} contrast_button_1`}

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
									onChange={(event) => setCustomizerType(event.currentTarget.value)}
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
									onChange={(event) => setCustomizerType(event.currentTarget.value)}
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
									onChange={(event) => setCustomizerType(event.currentTarget.value)}
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
									dragOver={uploaderDragOver}
									setDragOver={setUploaderDragOver}
									handleSelectOnCanvas={handleSelectOnCanvas}
								/>
							)}

							{customizerType === 'text' && (
								<TextHandle
									selectedText={
										selectedTextObject
											? {
												text: selectedTextObject.text,
												font: selectedTextObject.fontFamily,
												size: Math.round(selectedTextObject.fontSize),
												bold:
													selectedTextObject.fontWeight === 'bold' ||
													selectedTextObject.fontWeight === 700,
												italic: selectedTextObject.fontStyle === 'italic',
												color: selectedTextObject.fill,
											}
											: null
									}

									onUpdate={(text, options) => {
										if (!selectedTextObject) return

										const canvas = fabricCanvasRef.current
										if (!canvas) return

										selectedTextObject.set({
											text,
											fontFamily: options.font,
											fontWeight: options.bold ? 'bold' : 'normal',
											fontStyle: options.italic ? 'italic' : 'normal',
											fill: options.color,
											textAlign: 'center',
											fontSize: options.size,
										})

										canvas.renderAll()
									}}

									onAdd={(text, options) => {
										const canvas = fabricCanvasRef.current
										if (!canvas) return

										const area = currentAreaRef.current
										if (!area) return

										const areaBox = {
											left: area.x,
											top: area.y,
											width: area.w,
											height: area.h,
										}

										// =========================
										// 🎯 FONT SIZE FIT TO AREA
										// =========================
										const calculateOptimalFontSize = (
											text,
											targetWidth,
											initialFontSize,
											fontFamily,
											fontWeight,
											fontStyle,
										) => {
											const ctx = canvas.getContext()

											ctx.font = `${fontStyle} ${fontWeight} ${initialFontSize}px ${fontFamily}`

											const actualWidth = ctx.measureText(text).width
											const safeWidth = targetWidth * 0.95

											let size = initialFontSize * (safeWidth / actualWidth)
											console.log('SIZE',size)

											return Math.max(16, Math.min(size, 200))
										}

										const optimalFontSize = calculateOptimalFontSize(
											text,
											areaBox.width,
											options.size,
											options.font,
											options.bold ? 'bold' : 'normal',
											options.italic ? 'italic' : 'normal',
										)

										// =========================
										// 🧱 CREATE TEXTBOX
										// =========================
										const textbox = new Textbox(text, {
											left: areaBox.left ,
											top: areaBox.top,

											originX: 'center',
											originY: 'center',

											width: areaBox.width,

											fontFamily: options.font,
											fontSize: optimalFontSize,
											fontWeight: options.bold ? 'bold' : 'normal',
											fontStyle: options.italic ? 'italic' : 'normal',
											fill: options.color,
											textAlign: 'center',

											lockScalingFlip: true,
											lockUniScaling: false,

											cornerStyle: 'circle',
											cornerColor: '#4E008E',
											cornerStrokeColor: '#ffffff',
											borderColor: '#4E008E',
											borderScaleFactor: 2,
											transparentCorners: false,
										})

										// =========================
										// 🚫 CLIP TO AREA (VERY IMPORTANT)
										// =========================
										textbox.set({
											clipPath: new Rect({
												left: areaBox.left,
												top: areaBox.top,
												width: areaBox.width,
												height: areaBox.height,
												absolutePositioned: true,
											}),
										})

										// =========================
										// 🔧 CONTROLS
										// =========================
										textbox.setControlsVisibility({
											mt: false,
											mb: false,
											ml: false,
											mr: false,
										})

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

										// =========================
										// 📦 META
										// =========================

										textbox.customData = {
											type: 'text',
											originalFontSize: optimalFontSize,
											originalWidth: areaBox.width,
											orgObj:{
												id:uuidv4(),
											},
										}

										// =========================
										// ➕ ADD
										// =========================
										canvas.add(textbox)
										canvas.setActiveObject(textbox)
										canvas.renderAll()
									}}
								/>
							)}
						</div>
					</div>

					<div className={css['products--list__by--category']}>
						{minimalGroups
							.filter((group) => Array.isArray(group?.products) && group.products.length > 0)
							.map((group) => {
								const key = String(group.id)
								const groupProducts = Array.isArray(productsByCategory?.[key])
									? productsByCategory[key]
									: group.products

								if (!Array.isArray(groupProducts) || groupProducts.length < 1) return null
								return (
									<details key={key} open>
										<summary>
											<Icon name={'ChevronUp'} />
											<strong>{getGroupLabel(key)}</strong>
										</summary>

										<ul className={css.products__list}>
											{groupProducts.map((product) => (
												<ProductCustomizerCard
													key={product.id}
													groupKey={key}
													image={image}
													setImage={setImage}
													activeCardId={activeCardId}
													setActiveCardId={setActiveCardId}
													activeGroupId={activeGroupId}
													product={product}
													group={group}
													storeId={storeId}
													setProductsByCategory={setProductsByCategory}
													saveDesignForCurrentProduct={saveDesignForCurrentProduct}
													saveDesignForEachProduct={saveDesignForEachProducts}
													onCardClick={onCardClick}
													activeSide={activeSide}
													setImageBack={setImageBack}
													setImageLeft={setImageLeft}
													setImageRight={setImageRight}

												/>
											))}
										</ul>
									</details>
								)})}
					</div>
				</div>

				<Modal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					className={`${css.modal} validation--modal`}
				>
					<div className={css.modal__content}>
						<Icon name={'Download'} className={css.modal__icon} />
						<h2 className={css.modal__title}>
							Your logo is saved!
							<br />
							Do you want to create another?
						</h2>

						<button className={css.modal__button__continue}
										onClick={() => {
											setIsModalOpen(false)
											setIsNewDesignModalOpen(true)
										}}>
							Yes, create another logo
						</button>
						<button
							className={css.modal__button__next}
							onClick={() => {
								setIsModalOpen(false)
								if(popup){
									dispatch(setActiveStep(4))
								}else {
									setIsFundraisingModalOpen(true)

								}
							}}
						>
							No, move to the next step
						</button>
					</div>
				</Modal>

				<Modal
					isOpen={isFundraisingModalOpen}
					onClose={() => setIsFundraisingModalOpen(false)}
					className={`${css.fundraising__modal} validation--modal`}
				>
					<FundraisingTypeModal setIsFundraisingModalOpen={setIsFundraisingModalOpen} />
				</Modal>

				<Modal
					isOpen={isNewDesignModalOpen}
					onClose={() => setIsNewDesignModalOpen(false)}
					className={`${css.design__modal} validation--modal`}
				>
					<NewDesignModal setIsNewDesignModalOpen={setIsNewDesignModalOpen} />
				</Modal>
			</div>
		</>
	)
})

DesignStepNew.displayName = 'DesignStepNew'

export default DesignStepNew
