import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'
import { supabase } from '@/superbaseClient'

export type PropertyLocation = {
    id: string
    uprn: string | null
    usrn: string | null
    what_three_words: string | null
    latitude: number | null
    longitude: number | null
}

export type PropertyLocationState = {
    propertyLocation: PropertyLocation | null
    loading: boolean
}

const initialState: PropertyLocationState = {
    propertyLocation: null,
    loading: false,
}

const LOCATION_FIELDS =
    'id, uprn, usrn, what_three_words, latitude, longitude'

export const fetchPropertyLocation = createAsyncThunk<PropertyLocation | null, string>(
    `${SLICE_BASE_NAME}/fetchPropertyLocation`,
    async (id, { rejectWithValue }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('property')
            .select(LOCATION_FIELDS)
            .eq('id', id)
            .maybeSingle()

        if (error) return rejectWithValue(error.message)

        return data as PropertyLocation | null
    }
)

/*export const savePropertyLocation = createAsyncThunk<
    PropertyLocation,
    {
        id: string
        //latitude: number | null
        //longitude: number | null
        uprn: string | null
        usrn: string | null
    }
>(
    `${SLICE_BASE_NAME}/savePropertyLocation`,
    async (payload, { rejectWithValue }) => {
        const { data, error } = await supabase
            schema('gt')
            .from('property')
            .update(payload)
            .eq('id', payload.id)
            .select()
            .maybeSingle();

        if (error) return rejectWithValue(error.message)

        return data as PropertyLocation
    }
) */

export const savePropertyLocation = createAsyncThunk(
    '${SLICE_BASE_NAME}/savePropertyLocation',
    async (payload: {
        id: string
        uprn: string | null
        usrn: string | null
        what_three_words: string | null
        latitude: number | null
        longitude: number | null
    }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('property')
            .update(payload)
            .eq('id', payload.id)
            .select()
            .maybeSingle();

        if (error) throw error

        return data
    }
)

const propertyLocationSlice = createSlice({
    name: `${SLICE_BASE_NAME}/location`,
    initialState,
    reducers: {
        clearPropertyLocation(state) {
            state.propertyLocation = null
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPropertyLocation.pending, (state) => {
            state.loading = true
        })
        builder.addCase(fetchPropertyLocation.fulfilled, (state, action) => {
            state.propertyLocation = action.payload
            state.loading = false
        })
        builder.addCase(fetchPropertyLocation.rejected, (state) => {
            state.loading = false
        })

        builder.addCase(savePropertyLocation.fulfilled, (state, action) => {
            state.propertyLocation = action.payload
        })
    },
})

export const { clearPropertyLocation } = propertyLocationSlice.actions
export default propertyLocationSlice.reducer
