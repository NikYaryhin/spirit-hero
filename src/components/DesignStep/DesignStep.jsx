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
import { Canvas, FabricImage, Control, util, Textbox, Line } from 'fabric'
import Modal from '@/components/Modal/Modal'
import FundraisingTypeModal from '../FundraisingTypeModal/FundraisingTypeModal'
import NewDesignModal from '../NewDesignModal/NewDesignModal'
import { setMinimalGroups } from '@/features/products/productsSlice'
import { setActiveStep } from '@/features/navigation/navigationSlice'

const DesignStep = forwardRef((props, ref) => {
	const dispatch = useDispatch()
	const params = new URLSearchParams(window.location.search)
	const storeIdFromQuery = params.get('store_id')
	const storeId = useSelector((state) => state.flashSale.storeId) || storeIdFromQuery
/*
	const minimalGroupsFromStore = useSelector((state) => state.products.minimalGroups)
*/
	const [minimalGroupsFromStore, setMinimalGroupsFromStore] = useState([]);

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

	const renderDeleteIcon = (ctx, left, top, styleOverride, fabricObject) => {
		const size = 16
		ctx.save()
		ctx.translate(left, top)
		ctx.rotate(util.degreesToRadians(fabricObject.angle))

		ctx.beginPath()
		ctx.arc(0, 0, size / 2, 0, 2 * Math.PI)
		ctx.fillStyle = '#ff4444'
		ctx.fill()
		ctx.strokeStyle = '#ffffff'
		ctx.lineWidth = 2
		ctx.stroke()

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

	const deleteObject = (eventData, transform) => {
		const canvas = transform.target.canvas
		const target = transform.target

		if (target.customData?.type === 'uploaded-image') {
			const urlToRemove = target.customData.url

			canvas.remove(target)
			canvas.renderAll()

			setUploaderFiles((prev) => {
				const index = prev.findIndex((f) => f.url === urlToRemove)
				if (index !== -1) {
					const next = prev.slice()
					const [removed] = next.splice(index, 1)
					if (removed && removed.url && !removed.isServerImage) {
						URL.revokeObjectURL(removed.url)
					}
					return next
				}
				return prev
			})
		}

		if (target.customData?.type === 'text') {
			canvas.remove(target)
			canvas.renderAll()
		}

		return true
	}

	useEffect(() => {
		if (isLoading) return
		if (!canvasRef.current || !containerRef.current) return

		const fabricCanvas = new Canvas(canvasRef.current, {
			width: containerRef.current.clientWidth,
			height: containerRef.current.clientHeight,
			backgroundColor: 'transparent',
			selection: true,
			preserveObjectStacking: true,
		})

		fabricCanvasRef.current = fabricCanvas

		const verticalGuideLine = new Line(
			[fabricCanvas.width / 2, 0, fabricCanvas.width / 2, fabricCanvas.height],
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
			[0, fabricCanvas.height / 2, fabricCanvas.width, fabricCanvas.height / 2],
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

			syncCanvasToCustomerLogos()
		}

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

		const handleSelectionCleared = () => {
			setSelectedTextObject(null)
		}

		const handleRotating = (e) => {
			const obj = e.target
			if (!obj) return

			const snapAngle = 15
			const snapThreshold = 3

			let currentAngle = obj.angle % 360
			if (currentAngle < 0) currentAngle += 360

			const nearestSnap = Math.round(currentAngle / snapAngle) * snapAngle

			const distance = Math.abs(currentAngle - nearestSnap)

			if (distance <= snapThreshold) {
				obj.set('angle', nearestSnap)
			}
		}

		const handleMoving = (e) => {
			const obj = e.target
			if (!obj || obj.customData?.type === 'center-marker' || obj.customData?.type === 'guide-line')
				return

			const snapThreshold = 10

			const canvasCenterX = fabricCanvas.width / 2
			const canvasCenterY = fabricCanvas.height / 2

			const objCenter = obj.getCenterPoint()

			const distanceX = Math.abs(objCenter.x - canvasCenterX)
			const distanceY = Math.abs(objCenter.y - canvasCenterY)

			if (distanceX <= snapThreshold) {
				// obj.center()
				// const newLeft = canvasCenterX - obj.width* obj.scaleX / 2
				// obj.set({ left: newLeft })
				verticalGuideLine.set({ visible: true })
			} else {
				verticalGuideLine.set({ visible: false })
			}

			if (distanceY <= snapThreshold) {
				// obj.center()
				// const newTop = canvasCenterY - obj.height* obj.scaleY / 2
				// obj.set({ top: newTop })
				horizontalGuideLine.set({ visible: true })
			} else {
				horizontalGuideLine.set({ visible: false })
			}

			obj.setCoords()
		}

		const handleMovingEnd = () => {
			verticalGuideLine.set({ visible: false })
			horizontalGuideLine.set({ visible: false })
			fabricCanvas.renderAll()
		}

		fabricCanvas.on('object:scaling', handleTextScaling)
		fabricCanvas.on('object:rotating', handleRotating)
		fabricCanvas.on('object:moving', handleMoving)
		fabricCanvas.on('object:modified', handleObjectModified)
		fabricCanvas.on('mouse:up', handleMovingEnd)
		fabricCanvas.on('selection:created', handleSelection)
		// fabricCanvas.on('selection:updated', handleSelection)
		fabricCanvas.on('selection:cleared', handleSelectionCleared)

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
	}, [isLoading])

	useEffect(() => {
		const canvas = fabricCanvasRef.current
		if (!canvas) {
			return
		}

		const handleKeyDown = (e) => {
			const activeElement = document.activeElement
			if (
				activeElement &&
				(activeElement.tagName === 'INPUT' ||
					activeElement.tagName === 'TEXTAREA' ||
					activeElement.isContentEditable)
			) {
				return
			}

			if (e.key === 'Delete' || e.key === 'Backspace') {
				const activeObject = canvas.getActiveObject()

				if (activeObject) {
					if (activeObject.customData?.type === 'uploaded-image') {
						e.preventDefault()

						const urlToRemove = activeObject.customData.url

						canvas.remove(activeObject)
						canvas.renderAll()

						setUploaderFiles((prev) => {
							const index = prev.findIndex((f) => f.url === urlToRemove)
							if (index !== -1) {
								const next = prev.slice()
								const [removed] = next.splice(index, 1)
								if (removed && removed.url && !removed.isServerImage) {
									URL.revokeObjectURL(removed.url)
								}
								return next
							}
							return prev
						})
					}

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

	useEffect(() => {
		const canvas = fabricCanvasRef.current
		if (!canvas) return

		const currentObjects = canvas.getObjects()
		const currentUrls = currentObjects
			.filter((obj) => obj.customData?.type === 'uploaded-image')
			.map((obj) => obj.customData.url)

		const uploaderUrls = uploaderFiles.map((f) => f.url)
		currentObjects.forEach((obj) => {
			if (obj.customData?.type === 'uploaded-image' && !uploaderUrls.includes(obj.customData.url)) {
				canvas.remove(obj)
			}
		})
		console.log('currentObjects',currentObjects)

		console.log('currentUrls',currentUrls)

		uploaderFiles.forEach(async (fileData) => {
			if (currentUrls.includes(fileData.url)) return

			try {
				const imgElement = document.createElement('img')
				imgElement.src = fileData.url

				imgElement.onload = () => {
					let scaleX, scaleY
					if (fileData.width !== undefined && fileData.height !== undefined) {
						scaleX = fileData.width / imgElement.width
						scaleY = fileData.height / imgElement.height
					} else {
						scaleX = 100 / imgElement.width
						scaleY = 100 / imgElement.height
					}


					const left = fileData.x !== undefined ? fileData.x : canvas.width / 2
					const top = fileData.y !== undefined ? fileData.y : canvas.height / 2

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
		if (isLoading) return
		const canvas = fabricCanvasRef.current

		if (!canvas || serverLabels.length === 0) return

		const currentObjects = canvas.getObjects()
		const currentTexts = currentObjects
			.filter((obj) => obj.customData?.type === 'text')
			.map((obj) => obj.customData.serverId)

		serverLabels.forEach((labelData, index) => {
			const serverId = `server-label-${index}`

			if (currentTexts.includes(serverId)) return

			try {
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

				textbox.setControlsVisibility({
					ml: false,
					mr: false,
					mt: false,
					mb: false,
				})

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
				}
			} catch (error) {
				console.error('❌ Error canvas:', error)
			}
		})

		canvas.renderAll()
	}, [serverLabels, isLoading])

	useEffect(() => {
		const fetchStoreData = async () => {
			try {
				const res = await spiritHeroApi.getStore(storeId)
				const storeMinimalGroups = Array.isArray(res?.minimum_groups) ? res.minimum_groups : [];
				/*const storeMinimalGroups = Array.isArray(res?.minimum_groups) ? res.minimum_groups : []
				dispatch(setMinimalGroups(storeMinimalGroups))*/
				setMinimalGroupsFromStore(storeMinimalGroups)
				console.debug('spiritHeroApi.getStore DESIGN', res)

				setCustomerLogos({ ...res.design })
				setBaseDesign(res.design.map((value)=>{
					return{
						customerLogos:value.customerLogos,
						labels:value.labels,
						product_group_id:value.product_group_id
					}
				}))
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
					setImage(firstProduct.choosed_colors[0]?.color_image || product_image)

				}
				console.log('DASIGN GROUP::',res.design.find((value)=>value.product_group_id === +firstGroupKey))

				// const designData =  res.design
				const activeProduct = firstProduct
				const designData = res.design.find((value)=>value.product_group_id === +firstGroupKey)
				console.log('designData::',designData)

				if (designData.customerLogos && Array.isArray(designData.customerLogos)) {
					console.log('customerLogos')
					designData.customerLogos.forEach((logoData, index) => {
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
							rotation:logoData.rotation || 0,
						}

						serverImageFiles.push(serverFile)
					})
				}
				setUploaderFiles(serverImageFiles)

				if (designData.labels && Array.isArray(designData.labels)) {
					console.log('labels')

					const labelsData = designData.labels.map((labelData) => ({
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
			} catch (error) {
				console.error(`spiritHeroApi.getStore error`, error)
			} finally {
				setIsLoading(false)
			}
		}
		fetchStoreData()
	}, [dispatch, storeId,isNewDesignModalOpen])

	const syncCanvasToCustomerLogos = () => {
		const canvas = fabricCanvasRef.current
		if (!canvas) return

		const objects = canvas.getObjects()

		const customerLogosData = []
		const labelsData = []

		objects.forEach((obj) => {
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

	const syncCanvasToGroupId = (groupId) => {
		const canvas = fabricCanvasRef.current
		if (!canvas) return

		const objects = canvas.getObjects()

		const customerLogosData = []
		const labelsData = []

		objects.forEach((obj) => {
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

		const newState = (() => {
			let found = false;

			const updated = baseDesign.map((item) => {
				if (item.product_group_id === +groupId) {
					found = true;

					return {
						...item,
						customerLogos: customerLogosData,
						labels: labelsData,
					};
				}
				return item;
			});

			if (!found) {
				updated.push({
					product_group_id: +groupId,
					customerLogos: customerLogosData,
					labels: labelsData,
				});
			}

			return updated;
		})();

		console.log('newState', newState);
		setBaseDesign(newState);

		return newState;

	}

	const onCardClick = (id, groupId) => {
		const nextActiveGroupId = String(groupId ?? '')
		setActiveGroupId(nextActiveGroupId)


		if(nextActiveGroupId!==activeGroupId){
			syncCanvasToGroupId(activeGroupId)
			const designData = baseDesign.find((value)=>value.product_group_id === +nextActiveGroupId)

			if (designData) {
				setCustomerLogos(designData)

				const canvas = fabricCanvasRef.current
				if (canvas) {
					const objectsToRemove = canvas
						.getObjects()
						.filter((obj) => obj.customData?.type !== 'guide-line')
					objectsToRemove.forEach((obj) => canvas.remove(obj))
					canvas.renderAll()
				}

				setUploaderFiles([])
				setServerLabels([])

				const loadedElements = []
				const serverImageFiles = []
				let zIndex = 1

				if (designData.customerLogos && Array.isArray(designData.customerLogos)) {
					designData.customerLogos.forEach((logoData, index) => {
						const id = uuidv4()
						loadedElements.push({
							id,
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
			}else {
				const canvas = fabricCanvasRef.current
				if (canvas) {
					const objectsToRemove = canvas
						.getObjects()
						.filter((obj) => obj.customData?.type !== 'guide-line')
					objectsToRemove.forEach((obj) => canvas.remove(obj))
					canvas.renderAll()
				}
			}
		}

	}

	const getLogoParameters = async () => {
		try {
			setIsLoading(true)
			const  syncData = syncCanvasToGroupId(activeGroupId)
			const designList = syncData.map((item) => ({
				minimum_groups: [item.product_group_id],
				design: {
					customerLogos: item.customerLogos,
					labels: item.labels,
					designGroup:"test"
				},
			}))

			const payload = {
				store_id: storeId,
				designList,
			}
			console.debug('saveDesignForGroupsPayload', payload)

			const saveDesignForGroupsResponse = await spiritHeroApi.saveDesignForGroups(payload)
			console.debug('saveDesignForGroupsResponse response', saveDesignForGroupsResponse)

			setIsModalOpen(true)
			/*setCustomerLogos(design)*/
		} catch (error) {
			console.error('Error spiritHeroApi.saveDesignForGroups:', error)
			return null
		} finally {
			setIsLoading(false)
		}
	}

	useImperativeHandle(ref, () => ({
		getLogoParameters
	}))


		return (
			<>
				{isLoading && <Loader />}
				<div className={css.design_section}>
					<div className={css.image__box} ref={imageBoxRef}>
						<img src={image} alt="Customizer image" />

						<div ref={containerRef} className={`${css.custom__elements}`}>
							<canvas ref={canvasRef} />
						</div>
					</div>

					<div className={css.settings__box}>
						<button
							onClick={() => {
								console.debug('CLICK')
							}}
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
												text: text,
												fontFamily: options.font,
												fontWeight: options.bold ? 'bold' : 'normal',
												fontStyle: options.italic ? 'italic' : 'normal',
												fill: options.color,
												textAlign: 'center',
											})

											canvas.renderAll()
										}}
										onAdd={(text, options) => {
											const canvas = fabricCanvasRef.current
											if (!canvas) {
												console.error('Canvas не готов для добавления текста')
												return
											}

											const calculateOptimalFontSize = (
												text,
												targetWidth,
												initialFontSize,
												fontFamily,
												fontWeight,
												fontStyle,
											) => {
												const ctx = canvas.getContext()

												const fontStyle2 = `${fontStyle} ${fontWeight} ${initialFontSize}px ${fontFamily}`
												ctx.font = fontStyle2

												const metrics = ctx.measureText(text)
												const actualWidth = metrics.width

												const safeTargetWidth = targetWidth * 0.95

												const widthRatio = safeTargetWidth / actualWidth
												let fontSize = initialFontSize * widthRatio

												fontSize = Math.max(fontSize, 16)
												fontSize = Math.min(fontSize, 200)

												return fontSize
											}

											const optimalFontSize = calculateOptimalFontSize(
												text,
												canvas.width,
												options.size,
												options.font,
												options.bold ? 'bold' : 'normal',
												options.italic ? 'italic' : 'normal',
											)

											const textbox = new Textbox(text, {
												left: 0,
												top: 0,
												width: canvas.width,
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

											textbox.set({
												left: canvas.width / 2,
												top: canvas.height / 2,
											})


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

											textbox.customData = {
												type: 'text',
												originalFontSize: optimalFontSize,
												originalWidth: canvas.width,
											}

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

DesignStep.displayName = 'DesignStep'

export default DesignStep
