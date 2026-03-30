import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'
import { supabase } from '@/superbaseClient'

export type PropertyHeating = {
    id: string
    property_id: string
    energy_source: string | null
    type: string | null
    manufacturer: string | null
    model: string | null
    installer: string | null
    installation_date: string | null
    warranty_years: number | null
    warranty_expiry_date: string | null
}

export type PropertyHeatingState = {
    propertyHeating: PropertyHeating | null
    loading: boolean
}

const initialState: PropertyHeatingState = {
    propertyHeating: null,
    loading: false,
}

const HEATING_FIELDS =
    'id, property_id, energy_source, type, manufacturer, model, installer, installation_date, warranty_years, warranty_expiry_date'

export const fetchPropertyHeating = createAsyncThunk<PropertyHeating | null, string>(
    `${SLICE_BASE_NAME}/fetchPropertyHeating`,
    async (propertyId, { rejectWithValue }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('main_heating')
            .select(HEATING_FIELDS)
            .eq('property_id', propertyId)
            .maybeSingle()

        if (error) return rejectWithValue(error.message)

        return data as PropertyHeating | null
    }
)

export const savePropertyHeating = createAsyncThunk(
    `${SLICE_BASE_NAME}/savePropertyHeating`,
    async (payload: {
        id?: string
        property_id: string
        energy_source: string | null
        type: string | null
        manufacturer: string | null
        model: string | null
        installer: string | null
        installation_date: string | null
        warranty_years: number | null
        warranty_expiry_date: string | null
    }, { rejectWithValue }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('main_heating')
            .upsert(payload, { onConflict: 'id' })
            .select(HEATING_FIELDS)
            .maybeSingle()

        if (error) return rejectWithValue(error.message)

        return data
    }
)

const propertyHeatingSlice = createSlice({
    name: `${SLICE_BASE_NAME}/heating`,
    initialState,
    reducers: {
        clearPropertyHeating(state) {
            state.propertyHeating = null
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPropertyHeating.pending, (state) => {
            state.loading = true
        })
        builder.addCase(fetchPropertyHeating.fulfilled, (state, action) => {
            state.propertyHeating = action.payload
            state.loading = false
        })
        builder.addCase(fetchPropertyHeating.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(savePropertyHeating.fulfilled, (state, action) => {
            state.propertyHeating = action.payload
        })
    },
})

export const { clearPropertyHeating } = propertyHeatingSlice.actions
export default propertyHeatingSlice.reducer
