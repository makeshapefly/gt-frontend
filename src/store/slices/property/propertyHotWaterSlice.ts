import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'
import { supabase } from '@/superbaseClient'

export type PropertyHotWater = {
    id: string
    property_id: string
    type: string | null
    manufacturer: string | null
    model: string | null
    installer: string | null
    installation_date: string | null
    warranty_years: number | null
    warranty_expiry_date: string | null
    spare: boolean | null
}

export type PropertyHotWaterState = {
    propertyHotWater: PropertyHotWater | null
    loading: boolean
}

const initialState: PropertyHotWaterState = {
    propertyHotWater: null,
    loading: false,
}

const HOT_WATER_FIELDS =
    'id, property_id, type, manufacturer, model, installer, installation_date, warranty_years, warranty_expiry_date, spare'

export const fetchPropertyHotWater = createAsyncThunk<PropertyHotWater | null, string>(
    `${SLICE_BASE_NAME}/fetchPropertyHotWater`,
    async (propertyId, { rejectWithValue }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('hot_water')
            .select(HOT_WATER_FIELDS)
            .eq('property_id', propertyId)
            .maybeSingle()

        if (error) return rejectWithValue(error.message)

        return data as PropertyHotWater | null
    }
)

export const savePropertyHotWater = createAsyncThunk(
    `${SLICE_BASE_NAME}/savePropertyHotWater`,
    async (payload: {
        id?: string
        property_id: string
        type: string | null
        manufacturer: string | null
        model: string | null
        installer: string | null
        installation_date: string | null
        warranty_years: number | null
        warranty_expiry_date: string | null
        spare: boolean | null
    }, { rejectWithValue }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('hot_water')
            .upsert(payload, { onConflict: 'id' })
            .select(HOT_WATER_FIELDS)
            .maybeSingle()

        if (error) return rejectWithValue(error.message)

        return data
    }
)

const propertyHotWaterSlice = createSlice({
    name: `${SLICE_BASE_NAME}/hotWater`,
    initialState,
    reducers: {
        clearPropertyHotWater(state) {
            state.propertyHotWater = null
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPropertyHotWater.pending, (state) => {
            state.loading = true
        })
        builder.addCase(fetchPropertyHotWater.fulfilled, (state, action) => {
            state.propertyHotWater = action.payload
            state.loading = false
        })
        builder.addCase(fetchPropertyHotWater.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(savePropertyHotWater.fulfilled, (state, action) => {
            state.propertyHotWater = action.payload
        })
    },
})

export const { clearPropertyHotWater } = propertyHotWaterSlice.actions
export default propertyHotWaterSlice.reducer
