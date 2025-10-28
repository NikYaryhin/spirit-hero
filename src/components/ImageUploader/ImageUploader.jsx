import { useCallback, useRef } from 'react'
import css from './ImageUploader.module.css'
import Icon from '../Icon'

export default function ImageUploader({
	multiple = true,
	onChange,
	files = [],
	setFiles,
	agreed = false,
	setAgreed,
	dragOver = false,
	setDragOver,
}) {
	const inputRef = useRef(null)

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
		if (!agreed) return
		await handleFiles(e.dataTransfer.files)
	}

	const onDragOver = (e) => {
		e.preventDefault()
		if (!agreed) return
		if (typeof setDragOver === 'function') setDragOver(true)
	}

	const onDragLeave = () =>
		typeof setDragOver === 'function' && setDragOver(false)

	const removeAt = (index) => {
		if (typeof setFiles !== 'function') return
		setFiles((prev) => {
			const next = prev.slice()
			const [removed] = next.splice(index, 1)
			if (removed && removed.url) URL.revokeObjectURL(removed.url)
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
				{files.length === 0 && (
					<label
						className={`${css.dropzone} ${dragOver ? css.dragover : ''} ${!agreed ? css.disabled : ''}`}
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
				)}

				{files.length > 0 && (
					<>
						<div className={css.previews}>
							{files.map((p, i) => (
								<div
									className={css.preview}
									key={p.url + i}
									title={`${p.file.name}`}
								>
									<button
										className={css.removeBtn}
										type="button"
										onClick={() => removeAt(i)}
										aria-label={`Remove ${p.file.name}`}
										title={`Remove ${p.file.name}`}
									>
										<Icon name={'Cancel'} />
										<span>{p.file.name}</span>
									</button>

									<div className={css.preview__image}>
										<img src={p.url} alt={p.file.name} loading="lazy" />
									</div>
								</div>
							))}

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
				)}
			</div>

			<label className={css.agree}>
				<input
					type="checkbox"
					checked={agreed || files.length > 0}
					onChange={(e) => {
						if (files.length > 0) return
						setAgreed(e.target.checked)
					}}
				/>
				<span>
					By uploading the image, I agree that I have the legal right to
					reproduce and sell the design, and that I am in full compliance with
					SPIRIT HERO’s&nbsp;Terms of Use.
				</span>
			</label>
		</div>
	)
}
