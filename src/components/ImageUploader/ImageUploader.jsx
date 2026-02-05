import { useCallback, useRef, useState } from 'react'
import css from './ImageUploader.module.css'
import Icon from '../Icon'

export default function ImageUploader({
	multiple = true,
	onChange,
	files = [],
	setFiles,
	dragOver = false,
	setDragOver,
}) {
	const inputRef = useRef(null)

	// const [agreed, setAgreed] = useState(true)

	const handleFiles = useCallback(
		async (newFiles) => {
			const imageFiles = Array.from(newFiles).filter((f) =>
				f.type.startsWith('image/'),
			)
			if (imageFiles.length === 0) return

			const mapped = await Promise.all(
				imageFiles.map(async (file) => ({
					file,
					url: URL.createObjectURL(file),
					base64: await new Promise((resolve) => {
						const reader = new FileReader()
						reader.onload = () => resolve(reader.result)
						reader.readAsDataURL(file)
					}),
				})),
			)
			// update parent-controlled files
			if (typeof setFiles === 'function') {
				setFiles((prev) => (multiple ? [...prev, ...mapped] : mapped))
				if (typeof onChange === 'function')
					onChange(
						(multiple ? [...files, ...mapped] : mapped).map((p) => p.file),
					)
			}
		},
		[multiple, onChange, files, setFiles],
	)

	const onInputChange = async (e) => {
		await handleFiles(e.target.files)
		e.target.value = ''
	}

	const onDrop = async (e) => {
		e.preventDefault()
		setDragOver(false)
		// if (!agreed) return
		await handleFiles(e.dataTransfer.files)
	}

	const onDragOver = (e) => {
		e.preventDefault()
		// if (!agreed) return
		if (typeof setDragOver === 'function') setDragOver(true)
	}

	const onDragLeave = () =>
		typeof setDragOver === 'function' && setDragOver(false)

	const removeAt = (index) => {
		if (typeof setFiles !== 'function') return
		setFiles((prev) => {
			const next = prev.slice()
			const [removed] = next.splice(index, 1)
			// Освобождаем URL только для загруженных файлов, не для серверных
			if (removed && removed.url && !removed.isServerImage) {
				URL.revokeObjectURL(removed.url)
			}
			if (typeof onChange === 'function') onChange(next.map((p) => p.file))
			return next
		})
	}

	const onSellAtCoastClick = () => {}

	return (
		<div className={css.image__tool}>
			<h3 className={css['image__tool--title']}>File guidelines</h3>

			<ul className={css['image__tool--guideline']}>
				<li>1500px by 1500px transparent artwork is preferred</li>
				<li>Original vector artwork work best, if you have it</li>
				<li>We support EPS, PDF, PNG and JPG files no more than 5 Mb</li>
			</ul>

			<div className={css.uploader}>
				<label
					className={`${css.dropzone} ${dragOver ? css.dragover : ''}`}
					onDrop={onDrop}
					onDragOver={onDragOver}
					onDragEnter={onDragOver}
					onDragLeave={onDragLeave}
				>
					<input
						rel="noreferrer"
						ref={inputRef}
						className={css.inputHidden}
						type="file"
						accept="image/*"
						multiple={multiple}
						onChange={onInputChange}
					/>
					<div className={css.label__container}>
						<Icon name={'UploadCloud'} />
						<span>
							Drag & drop file here or
							<strong>choose file</strong>
						</span>
					</div>
				</label>
				{/* {files.length === 0 && (
				)} */}

				{/* {files.length > 0 && (
					<>
						<div className={css.previews}>
							{files.map((p, i) => {
						const fileName = p.file?.name || p.isServerImage ? `Image ${i + 1}` : 'Unknown'
						return (
							<div
								className={css.preview}
								key={p.url + i}
								title={fileName}
							>
								<button
									className={css.removeBtn}
									type="button"
									onClick={() => removeAt(i)}
									aria-label={`Remove ${fileName}`}
									title={`Remove ${fileName}`}
								>
									<Icon name={'Cancel'} />
									<span>{fileName}</span>
								</button>

								<div className={css.preview__image}>
									<img src={p.url} alt={fileName} loading="lazy" />
								</div>
							</div>
						)
					})}

							<label
								className={`${css.smallUpload} ${!agreed ? css.disabled : ''}`}
								title="Add another one file"
							>
								<input
									type="file"
									accept="image/*"
									multiple={multiple}
									onChange={onInputChange}
								/>
								<Icon name="Plus" />
							</label>
						</div>
					</>
				)} */}
			</div>

			<label className={css.agree}>
				{/* <input
					type="checkbox"
					checked={agreed}
					onChange={(e) => {
						setAgreed(e.target.checked)
					}}
				/> */}
				<span>
					By uploading the image, I agree that I have the legal right to
					reproduce and sell the design, and that I am in full compliance with
					SPIRIT HERO’s&nbsp;Terms of Use.
				</span>
			</label>
		</div>
	)
}
