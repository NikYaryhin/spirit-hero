import { useEffect, useState, useRef } from 'react'
import css from './DesignStep.module.css'
import ProductCustomizerCard from '../ProductCustomizerCard/ProductCustomizerCard'
import Icon from '../Icon'
import ImageUploader from '../ImageUploader/ImageUploader'
import TextHandle from '../TextHandle/TextHandle'
import Moveable from 'react-moveable'
import { v4 as uuidv4 } from 'uuid'

export default function DesignStep({ myShopProducts }) {
	const [customizerType, setCustomizerType] = useState(null)

	const [products] = useState(
		myShopProducts && myShopProducts.length > 0
			? myShopProducts
			: JSON.parse(localStorage.getItem('myShopArr')),
	)
	const [uploaderFiles, setUploaderFiles] = useState([])
	const [uploaderAgreed, setUploaderAgreed] = useState(false)
	const [uploaderDragOver, setUploaderDragOver] = useState(false)

	// custom elements on the canvas
	const [customElements, setCustomElements] = useState([])
	const [selectedId, setSelectedId] = useState(null)
	const containerRef = useRef(null)
	const scaleRef = useRef({})

	// When uploaderFiles change, sync image elements with canvas
	useEffect(() => {
		setCustomElements((prev) => {
			const currentUrls = uploaderFiles.map((f) => f.url)
			const updatedElements = prev.filter((el) => {
				// Удаляем image элементы, которые больше не присутствуют в uploaderFiles
				if (el.type === 'image' && el.content?.src) {
					return currentUrls.includes(el.content.src)
				}
				// Оставляем все не-image элементы (например, текстовые)
				return true
			})

			// Проверяем, был ли удален выбранный элемент
			const selectedElementExists = updatedElements.some(
				(el) => el.id === selectedId,
			)
			if (selectedId && !selectedElementExists) {
				setSelectedId(null)
			}

			// Добавляем новые элементы для файлов, которых еще нет на канвасе
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
						width: 240,
						height: 240,
						rotation: 0,
						zIndex: (updatedElements.length || 0) + 1,
						content: { src: f.url },
					}
					updatedElements.push(el)
					// Устанавливаем последний добавленный элемент как выбранный
					setTimeout(() => setSelectedId(id), 0)
				}
			})

			return updatedElements
		})
	}, [uploaderFiles, selectedId])

	// useEffect(() => {
	// 	spiritHeroApi
	// 		.getTemplates()
	// 		.then((res) => console.log(res))
	// 		.catch((error) => console.error(error))

	// 	console.log('myShopProducts', myShopProducts)
	// }, [myShopProducts])

	return (
		<div className={css.design_section}>
			{products && products.length > 0 ? (
				<>
					<div className={css.image__box}>
						{/* Canvas area for custom elements */}
						<div ref={containerRef} className={css.custom__elements}>
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
										zIndex: el.zIndex,
										border:
											el.id === selectedId ? '1px dashed #4E008E' : 'none',
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
										<div style={{ width: '100%', height: '100%', ...el.style }}>
											{el.content}
										</div>
									)}
								</div>
							))}

							{selectedId &&
								document.querySelector(`[data-id="${selectedId}"]`) && (
									<Moveable
										target={document.querySelector(`[data-id="${selectedId}"]`)}
										container={containerRef.current}
										draggable={true}
										resizable={true}
										scalable={true}
										rotatable={true}
										throttleDrag={0}
										throttleResize={0}
										handleRotate={true}
										renderDirections={[
											'nw',
											'n',
											'ne',
											'w',
											'e',
											'sw',
											's',
											'se',
										]}
										edge={false}
										onDrag={({ target, left, top }) => {
											const id = target.getAttribute('data-id')
											const container = containerRef.current
											if (!container) return
											setCustomElements((prev) =>
												prev.map((el) => {
													if (el.id !== id) return el
													// allow partial exit: at least 1px of element must remain visible
													const minLeft = -((el.width || 0) - 50)
													const maxLeft = container.clientWidth - 50
													const minTop = -((el.height || 0) - 50)
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
										onRotate={({ target, dist }) => {
											const id = target.getAttribute('data-id')
											setCustomElements((prev) =>
												prev.map((el) =>
													el.id === id ? { ...el, rotation: dist } : el,
												),
											)
										}}
									/>
								)}
						</div>

						<img
							src={products[0].product_image}
							alt={products[0].product_title}
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

								{customizerType === 'text' && (
									<TextHandle
										onAdd={(text, options) => {
											const id = uuidv4()
											const el = {
												id,
												type: 'text',
												x: 20,
												y: 20,
												width: 240,
												height: 60,
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

						<ul>
							{products &&
								products.length > 0 &&
								products.map((product) => (
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
