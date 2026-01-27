// features/products/productsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import spiritHeroApi from '@/api/spiritHeroApi'

// Начальное состояние
const initialState = {
	myShopProducts: [],
	catalogProducts: [],
	initialCatalogProducts: [],
	initialMyShopProducts: [],
	productsByCategory: [],
	filters: null,
	sortingBy: '',
	activeFilters: {
		brands: [],
		categories: [],
		colorFamilies: [],
	},
	isLoading: false,
	error: null,
}

export const fetchProducts = createAsyncThunk(
	'products/fetchProducts',
	async (_, { rejectWithValue }) => {
		try {
			const response = await spiritHeroApi.getProducts()
			console.log('getProducts response', response)

			return response
		} catch (error) {
			return rejectWithValue(error.message)
		}
	},
)

const productsSlice = createSlice({
	name: 'products',
	initialState,
	reducers: {
		setMyShopProducts: (state, action) => {
			state.myShopProducts = action.payload
		},
		setCatalogProducts: (state, action) => {
			state.catalogProducts = action.payload
		},
		setInitialCatalogProducts: (state, action) => {
			state.initialCatalogProducts = action.payload
		},
		setInitialMyShopProducts: (state, action) => {
			state.initialMyShopProducts = action.payload
		},
		setSortingBy: (state, action) => {
			state.sortingBy = action.payload
		},
		setActiveFilters: (state, action) => {
			state.activeFilters = {
				...state.activeFilters,
				...action.payload,
			}
		},
		resetFilters: (state) => {
			state.activeFilters = {
				brands: [],
				categories: [],
				colorFamilies: [],
			}
		},
		toggleProductSelection: (state, action) => {
			const { productId, isSelected, isCatalog } = action.payload
			const targetArray = isCatalog ? 'catalogProducts' : 'myShopProducts'

			state[targetArray] = state[targetArray].map((product) =>
				String(product.id) === String(productId)
					? { ...product, selected: isSelected }
					: product,
			)
		},
		selectAllProducts: (state, action) => {
			const { isCatalog, select } = action.payload
			const targetArray = isCatalog ? 'catalogProducts' : 'myShopProducts'

			state[targetArray] = state[targetArray].map((product) => ({
				...product,
				selected: select,
			}))
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchProducts.pending, (state) => {
				state.isLoading = true
				state.error = null
			})
			.addCase(fetchProducts.fulfilled, (state, action) => {
				const myShopProductIds = new Set(
					state.initialMyShopProducts.map((p) => String(p.id)),
				)
				const filteredCatalogProducts = action.payload.products.filter(
					(product) => !myShopProductIds.has(String(product.id)),
				)
				state.isLoading = false
				state.catalogProducts = filteredCatalogProducts
				state.initialCatalogProducts = filteredCatalogProducts
				state.filters = action.payload.filters
			})
			.addCase(fetchProducts.rejected, (state, action) => {
				state.isLoading = false
				state.error = action.payload
			})
	},
})

// Селекторы
export const selectAllProducts = (state) => state.products
export const selectCatalogProducts = (state) => state.products.catalogProducts
export const selectMyShopProducts = (state) => state.products.myShopProducts
export const selectInitialCatalogProducts = (state) =>
	state.products.initialCatalogProducts
export const selectInitialMyShopProducts = (state) =>
	state.products.initialMyShopProducts
export const selectIsLoading = (state) => state.products.isLoading
export const selectFilters = (state) => state.products.filters
export const selectActiveFilters = (state) => state.products.activeFilters
export const selectSortingBy = (state) => state.products.sortingBy

export const {
	setMyShopProducts,
	setCatalogProducts,
	setInitialCatalogProducts,
	setInitialMyShopProducts,
	setSortingBy,
	setActiveFilters,
	resetFilters,
	toggleProductSelection,
	selectAllProducts: selectAllProductsAction,
} = productsSlice.actions

export default productsSlice.reducer
