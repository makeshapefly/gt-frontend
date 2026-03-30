import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'
import { supabase } from '@/superbaseClient'

export type PropertySewerage = {
    id: string
    property_id: string
    drains_layout: string | null
    septic_tank_type: string | null
    manufacturer: string | null
    model: string | null
    installer: string | null
    installation_date: string | null
    warranty_years: number | null
    warranty_expiry_date: string | null
    maintenance_history: string | null
    spare: boolean | null
}

export type PropertySewerageState = {
    propertySewerage: PropertySewerage | null
    loading: boolean
}

const initialState: PropertySewerageState = {
    propertySewerage: null,
    loading: false,
}

const SEWERAGE_FIELDS =
    'id, property_id, drains_layout, septic_tank_type, manufacturer, model, installer, installation_date, warranty_years, warranty_expiry_date, maintenance_history, spare'

export const fetchPropertySewerage = createAsyncThunk<PropertySewerage | null, string>(
    `${SLICE_BASE_NAME}/fetchPropertySewerage`,
    async (propertyId, { rejectWithValue }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('sewerage')
            .select(SEWERAGE_FIELDS)
            .eq('property_id', propertyId)
            .maybeSingle()

        if (error) return rejectWithValue(error.message)

        return data as PropertySewerage | null
    }
)

export const savePropertySewerage = createAsyncThunk(
    `${SLICE_BASE_NAME}/savePropertySewerage`,
    async (payload: {
        id?: string
        property_id: string
        drains_layout: string | null
        septic_tank_type: string | null
        manufacturer: string | null
        model: string | null
        installer: string | null
        installation_date: string | null
        warranty_years: number | null
        warranty_expiry_date: string | null
        maintenance_history: string | null
        spare: boolean | null
    }, { rejectWithValue }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('sewerage')
            .upsert(payload, { onConflict: 'id' })
            .select(SEWERAGE_FIELDS)
            .maybeSingle()

        if (error) return rejectWithValue(error.message)

        return data
    }
)

const propertySewerageSlice = createSlice({
    name: `${SLICE_BASE_NAME}/sewerage`,
    initialState,
    reducers: {
        clearPropertySewerage(state) {
            state.propertySewerage = null
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPropertySewerage.pending, (state) => {
            state.loading = true
        })
        builder.addCase(fetchPropertySewerage.fulfilled, (state, action) => {
            state.propertySewerage = action.payload
            state.loading = false
        })
        builder.addCase(fetchPropertySewerage.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(savePropertySewerage.fulfilled, (state, action) => {
            state.propertySewerage = action.payload
        })
    },
})

export const { clearPropertySewerage } = propertySewerageSlice.actions
export default propertySewerageSlice.reducer
