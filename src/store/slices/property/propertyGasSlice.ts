import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'
import { supabase } from '@/superbaseClient'

export type PropertyGas = {
    id: string
    property_id: string
    mprn: string | null
    location: string | null
    manufacturer: string | null
    model: string | null
    installer: string | null
    installation_date: string | null
    warranty_years: number | null
    warranty_expiry_date: string | null
    spare: boolean | null
}

export type PropertyGasState = {
    propertyGas: PropertyGas | null
    loading: boolean
}

const initialState: PropertyGasState = {
    propertyGas: null,
    loading: false,
}

const GAS_FIELDS =
    'id, property_id, mprn, location, manufacturer, model, installer, installation_date, warranty_years, warranty_expiry_date, spare'

export const fetchPropertyGas = createAsyncThunk<PropertyGas | null, string>(
    `${SLICE_BASE_NAME}/fetchPropertyGas`,
    async (propertyId, { rejectWithValue }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('gas')
            .select(GAS_FIELDS)
            .eq('property_id', propertyId)
            .maybeSingle()

        if (error) return rejectWithValue(error.message)

        return data as PropertyGas | null
    }
)

export const savePropertyGas = createAsyncThunk(
    `${SLICE_BASE_NAME}/savePropertyGas`,
    async (payload: {
        id?: string
        property_id: string
        mprn: string | null
        location: string | null
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
            .from('gas')
            .upsert(payload, { onConflict: 'id' })
            .select(GAS_FIELDS)
            .maybeSingle()

        if (error) return rejectWithValue(error.message)

        return data
    }
)

const propertyGasSlice = createSlice({
    name: `${SLICE_BASE_NAME}/gas`,
    initialState,
    reducers: {
        clearPropertyGas(state) {
            state.propertyGas = null
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPropertyGas.pending, (state) => {
            state.loading = true
        })
        builder.addCase(fetchPropertyGas.fulfilled, (state, action) => {
            state.propertyGas = action.payload
            state.loading = false
        })
        builder.addCase(fetchPropertyGas.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(savePropertyGas.fulfilled, (state, action) => {
            state.propertyGas = action.payload
        })
    },
})

export const { clearPropertyGas } = propertyGasSlice.actions
export default propertyGasSlice.reducer
