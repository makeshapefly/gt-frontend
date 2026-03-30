import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'
import { supabase } from '@/superbaseClient'

export type PropertySpacial = {
    id: string
    site_area: number | null
    built_area: number | null
    spatial_gia: number | null
    spatial_gea: number | null
    spatial_volume: number | null
}

export type PropertySpacialState = {
    propertySpacial: PropertySpacial | null
    loading: boolean
}

const initialState: PropertySpacialState = {
    propertySpacial: null,
    loading: false,
}

const SPACIAL_FIELDS = 'id, site_area, built_area, spatial_gia, spatial_gea, spatial_volume'

export const fetchPropertySpacial = createAsyncThunk<PropertySpacial | null, string>(
    `${SLICE_BASE_NAME}/fetchPropertySpacial`,
    async (id, { rejectWithValue }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('property')
            .select(SPACIAL_FIELDS)
            .eq('id', id)
            .maybeSingle()

        if (error) return rejectWithValue(error.message)

        return data as PropertySpacial | null
    }
)

export const savePropertySpacial = createAsyncThunk(
    `${SLICE_BASE_NAME}/savePropertySpacial`,
    async (payload: {
        id: string
        site_area: number | null
        built_area: number | null
        spatial_gia: number | null
        spatial_gea: number | null
        spatial_volume: number | null
    }, { rejectWithValue }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('property')
            .update(payload)
            .eq('id', payload.id)
            .select(SPACIAL_FIELDS)
            .maybeSingle()

        if (error) return rejectWithValue(error.message)

        return data
    }
)

const propertySpacialSlice = createSlice({
    name: `${SLICE_BASE_NAME}/spacial`,
    initialState,
    reducers: {
        clearPropertySpacial(state) {
            state.propertySpacial = null
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPropertySpacial.pending, (state) => {
            state.loading = true
        })
        builder.addCase(fetchPropertySpacial.fulfilled, (state, action) => {
            state.propertySpacial = action.payload
            state.loading = false
        })
        builder.addCase(fetchPropertySpacial.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(savePropertySpacial.fulfilled, (state, action) => {
            state.propertySpacial = action.payload
        })
    },
})

export const { clearPropertySpacial } = propertySpacialSlice.actions
export default propertySpacialSlice.reducer
