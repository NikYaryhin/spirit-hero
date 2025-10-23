import { toast } from 'react-toastify'

export const showToast = (text, type = 'success') => {
	if (type === 'success')
		toast.success(text, {
			position: 'bottom-right',
			autoClose: 4000,
			hideProgressBar: false,
			closeOnClick: false,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: 'light',
		})
	else
		toast.error(text, {
			position: 'bottom-right',
			autoClose: 4000,
			hideProgressBar: false,
			closeOnClick: false,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: 'light',
		})
}
