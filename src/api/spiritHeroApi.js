import axios from 'axios'

const apiClient = axios.create({
	baseURL: 'https://spirit-hero.splitdev.org',
})

let bearerToken = null

const storedToken = localStorage.getItem('access_token') || null
if (storedToken) {
	bearerToken = storedToken
}

apiClient.interceptors.request.use((config) => {
	if (bearerToken) {
		config.headers = config.headers || {}
		config.headers.Authorization = `Bearer ${bearerToken}`
	}
	return config
})

export function setToken(token) {
	bearerToken = token || ''

	if (token) localStorage.setItem('access_token', token)
	else localStorage.removeItem('access_token')

	apiClient.interceptors.request.use((config) => {
		if (bearerToken) {
			config.headers = config.headers || {}
			config.headers.Authorization = `Bearer ${bearerToken}`
		}
		return config
	})

	console.debug('bearerToken', bearerToken)
}

class SpiritHeroApi {
	constructor(http) {
		this.http = http
	}

	async login(login, password) {
		if (bearerToken) return

		const { data } = await this.http.post('/api/login', null, {
			params: { login, password },
		})
		setToken(data.access_token)
		return data
	}

	async saveStore(payload) {
		const { data } = await this.http.post('/api/builder/save-store', payload)
		return data
	}

	async updateStore(payload) {
		const { data } = await this.http.put('/api/builder/update-store', payload)
		return data
	}

	async getStore(store_id) {
		const { data } = await this.http.get(
			`/api/builder/get-store?store_id=${store_id}`,
		)
		return data
	}

	async getProducts() {
		const { data } = await this.http.get('/api/builder/get-products')

		return data
	}

	async addToMyStoreProductsList(store_id, ids) {
		const body = { store_id, ids }
		const { data } = await this.http.post(
			'/api/builder/add-to-my-store-products-list',
			body,
		)
		return data
	}

	async setColorsOfProduct(payload) {
		const { data } = await this.http.post(
			'/api/builder/product-chose-colors',
			payload,
		)
		return data
	}

	async deleteFromMyStoreProducts(store_id, ids) {
		const body = { store_id, ids }
		const { data } = await this.http.post(
			'/api/builder/delete-from-my-store-products',
			body,
		)
		return data
	}

	async editInkColor(store_id, front_side, back_side) {
		const body = { store_id, front_side, back_side }
		const { data } = await this.http.post('/api/builder/edit-ink-color', body)
		return data
	}

	async createDesign(store_id, design) {
		const body = { design, store_id }
		const { data } = await this.http.post('/api/builder/create-design', body)
		return data
	}

	async getTemplates() {
		const { data } = await this.http.get('/api/builder/get-templates')
		return data
	}

	async saveDesignImage(formData) {
		const { data } = await this.http.post(
			'/api/builder/save-design-image',
			formData,
			{
				headers: { 'Content-Type': 'multipart/form-data' },
			},
		)
		return data
	}

	async setFundraising(store_id, fundraising) {
		const body = { store_id, fundraising }
		const { data } = await this.http.post('/api/builder/set-fundraising', body)
		return data
	}

	async updateFundraisingStatus(payload) {
		const { data } = await this.http.post(
			'/api/builder/update-fundraising',
			payload,
		)
		return data
	}

	async receiveFunds(payload) {
		const { data } = await this.http.post('/api/builder/receive-funds', payload)
		return data
	}

	async saveFlashSaleSetting(payload) {
		const { data } = await this.http.post(
			'/api/builder/save-flash-sale-setting',
			payload,
		)
		return data
	}

	async getFlashSaleSettings(storeId) {
		const { data } = await this.http.get(
			`/api/builder/get-store-flash_sale?store_id=${storeId}`,
		)
		return data
	}
}

const spiritHeroApi = new SpiritHeroApi(apiClient)

export default spiritHeroApi
