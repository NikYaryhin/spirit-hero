// features/products/productsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import spiritHeroApi from '@/api/spiritHeroApi'

const initialState = {
	myShopProducts: [],
	catalogProducts: [],
	initialCatalogProducts: [],
	initialMyShopProducts: [],
	productsByCategory: [],
	filters: null,
	minimalGroups: [],
	sortingBy: '',
	activeFilters: {
		brands: [],
		categories: [],
		colorFamilies: [],
	},
	isLoading: false,
	error: null,
	isFundraisingGroup: false,
}

export const fetchProducts = createAsyncThunk(
	'products/fetchProducts',
	async (_, { rejectWithValue }) => {
		try {
			const response = await spiritHeroApi.getProducts()
			console.debug('getProducts response', response)
			console.debug("isFlashSaleType", response.products.filter(product => product.is_flash_sale_type))			
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
		setMinimalGroups: (state, action) => {
			state.minimalGroups = action.payload
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
		setIsLoading: (state, action) => {
			state.isLoading = action.payload
		},
		toggleProductSelection: (state, action) => {
			const { productId, isSelected, isCatalog } = action.payload
			const targetArray = isCatalog ? 'catalogProducts' : 'myShopProducts'

			state[targetArray] = state[targetArray].map((product) =>
				String(product.id) === String(productId) ? { ...product, selected: isSelected } : product,
			)
		},
		selectAllProductsAction: (state, action) => {
			const { isCatalog, select } = action.payload
			const targetArray = isCatalog ? 'catalogProducts' : 'myShopProducts'

			state[targetArray] = state[targetArray].map((product) => ({
				...product,
				selected: select,
			}))
		},
		selectProductsByIdsAction: (state, action) => {
			const { isCatalog, select, ids } = action.payload
			const targetArray = isCatalog ? 'catalogProducts' : 'myShopProducts'
			const idsSet = new Set((ids || []).map((id) => String(id)))

			state[targetArray] = state[targetArray].map((product) =>
				idsSet.has(String(product.id)) ? { ...product, selected: select } : product,
			)
		},
		setIsFundraisingGroup: (state, action) => {
			state.isFundraisingGroup = action.payload
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchProducts.pending, (state) => {
				state.isLoading = true
				state.error = null
			})
			.addCase(fetchProducts.fulfilled, (state, action) => {
				const myShopProductIds = new Set(state.initialMyShopProducts.map((p) => String(p.id)))
				const filteredCatalogProducts = action.payload.products.filter(
					(product) => !myShopProductIds.has(String(product.id)),
				)
				state.isLoading = false
				state.catalogProducts = filteredCatalogProducts
				state.initialCatalogProducts = filteredCatalogProducts
				state.filters = action.payload.filters
				state.minimalGroups = action.payload.minimum_groups
			})
			.addCase(fetchProducts.rejected, (state, action) => {
				state.isLoading = false
				state.error = action.payload
			})
	},
})

export const selectAllProducts = (state) => state.products
export const selectCatalogProducts = (state) => state.products.catalogProducts
export const selectMyShopProducts = (state) => state.products.myShopProducts
export const selectInitialCatalogProducts = (state) => state.products.initialCatalogProducts
export const selectInitialMyShopProducts = (state) => state.products.initialMyShopProducts
export const selectIsLoading = (state) => state.products.isLoading
export const selectFilters = (state) => state.products.filters
export const selectActiveFilters = (state) => state.products.activeFilters
export const selectSortingBy = (state) => state.products.sortingBy
export const selectIsFundraisingGroup = (state) => state.products.isFundraisingGroup

export const {
	setMyShopProducts,
	setCatalogProducts,
	setInitialCatalogProducts,
	setInitialMyShopProducts,
	setMinimalGroups,
	setSortingBy,
	setActiveFilters,
	resetFilters,
	setIsLoading,
	toggleProductSelection,
	selectAllProductsAction,
	selectProductsByIdsAction,
	setIsFundraisingGroup,
} = productsSlice.actions

export default productsSlice.reducer
