import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'
import { supabase } from '@/superbaseClient'

export type PropertyWater = {
    id: string
    property_id: string
    meter_number: string | null
    location: string | null
    manufacturer: string | null
    model: string | null
    installer: string | null
    installation_date: string | null
    warranty_years: number | null
    warranty_expiry_date: string | null
    stop_cock_location: string | null
    spare: boolean | null
}

export type PropertyWaterState = {
    propertyWater: PropertyWater | null
    loading: boolean
}

const initialState: PropertyWaterState = {
    propertyWater: null,
    loading: false,
}

const WATER_FIELDS =
    'id, property_id, meter_number, location, manufacturer, model, installer, installation_date, warranty_years, warranty_expiry_date, stop_cock_location, spare'

export const fetchPropertyWater = createAsyncThunk<PropertyWater | null, string>(
    `${SLICE_BASE_NAME}/fetchPropertyWater`,
    async (propertyId, { rejectWithValue }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('water_meter')
            .select(WATER_FIELDS)
            .eq('property_id', propertyId)
            .maybeSingle()

        if (error) return rejectWithValue(error.message)

        return data as PropertyWater | null
    }
)

export const savePropertyWater = createAsyncThunk(
    `${SLICE_BASE_NAME}/savePropertyWater`,
    async (payload: {
        id?: string
        property_id: string
        meter_number: string | null
        location: string | null
        manufacturer: string | null
        model: string | null
        installer: string | null
        installation_date: string | null
        warranty_years: number | null
        warranty_expiry_date: string | null
        stop_cock_location: string | null
        spare: boolean | null
    }, { rejectWithValue }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('water_meter')
            .upsert(payload, { onConflict: 'id' })
            .select(WATER_FIELDS)
            .maybeSingle()

        if (error) return rejectWithValue(error.message)

        return data
    }
)

const propertyWaterSlice = createSlice({
    name: `${SLICE_BASE_NAME}/water`,
    initialState,
    reducers: {
        clearPropertyWater(state) {
            state.propertyWater = null
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPropertyWater.pending, (state) => {
            state.loading = true
        })
        builder.addCase(fetchPropertyWater.fulfilled, (state, action) => {
            state.propertyWater = action.payload
            state.loading = false
        })
        builder.addCase(fetchPropertyWater.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(savePropertyWater.fulfilled, (state, action) => {
            state.propertyWater = action.payload
        })
    },
})

export const { clearPropertyWater } = propertyWaterSlice.actions
export default propertyWaterSlice.reducer
