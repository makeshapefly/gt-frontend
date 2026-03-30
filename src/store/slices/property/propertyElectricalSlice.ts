import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'
import { supabase } from '@/superbaseClient'

export type PropertyElectrical = {
    id: string
    property_id: string
    mpan: string | null
    location: string | null
    manufacturer: string | null
    model: string | null
    installer: string | null
    installation_date: string | null
    warranty_years: number | null
    warranty_expiry_date: string | null
}

export type PropertyElectricalState = {
    propertyElectrical: PropertyElectrical | null
    loading: boolean
}

const initialState: PropertyElectricalState = {
    propertyElectrical: null,
    loading: false,
}

const ELECTRICAL_FIELDS =
    'id, property_id, mpan, location, manufacturer, model, installer, installation_date, warranty_years, warranty_expiry_date'

export const fetchPropertyElectrical = createAsyncThunk<PropertyElectrical | null, string>(
    `${SLICE_BASE_NAME}/fetchPropertyElectrical`,
    async (propertyId, { rejectWithValue }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('electricity')
            .select(ELECTRICAL_FIELDS)
            .eq('id', propertyId)
            .maybeSingle()

        if (error) return rejectWithValue(error.message)

        return data as PropertyElectrical | null
    }
)

export const savePropertyElectrical = createAsyncThunk(
    `${SLICE_BASE_NAME}/savePropertyElectrical`,
    async (payload: {
        id?: string
        property_id: string
        mpan: string | null
        location: string | null
        manufacturer: string | null
        model: string | null
        installer: string | null
        installation_date: string | null
        warranty_years: number | null
        warranty_expiry_date: string | null
    }, { rejectWithValue }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('electricity')
            .upsert(payload, { onConflict: 'id' })
            .select(ELECTRICAL_FIELDS)
            .maybeSingle()

        if (error) return rejectWithValue(error.message)

        return data
    }
)

const propertyElectricalSlice = createSlice({
    name: `${SLICE_BASE_NAME}/electrical`,
    initialState,
    reducers: {
        clearPropertyElectrical(state) {
            state.propertyElectrical = null
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPropertyElectrical.pending, (state) => {
            state.loading = true
        })
        builder.addCase(fetchPropertyElectrical.fulfilled, (state, action) => {
            state.propertyElectrical = action.payload
            state.loading = false
        })
        builder.addCase(fetchPropertyElectrical.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(savePropertyElectrical.fulfilled, (state, action) => {
            state.propertyElectrical = action.payload
        })
    },
})

export const { clearPropertyElectrical } = propertyElectricalSlice.actions
export default propertyElectricalSlice.reducer
