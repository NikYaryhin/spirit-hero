import LogoPicker from '@/components/LogoPicker/LogoPicker'
import StoreDetailsForm from '@/components/StoreDetailsForm/StoreDetailsForm'
import { useState } from 'react'

export default function Details() {
	const [image, setImage] = useState(null)

	return (
		<>
			<LogoPicker setCustomerImage={setImage} />
			<StoreDetailsForm image={image} />
		</>
	)
}
