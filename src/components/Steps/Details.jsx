import LogoPicker from '@/components/LogoPicker/LogoPicker'
import StoreDetailsForm from '@/components/StoreDetailsForm/StoreDetailsForm'

export default function Details({ setStoreId }) {
	return (
		<>
			<LogoPicker />
			<StoreDetailsForm setStoreId={setStoreId} />
		</>
	)
}
