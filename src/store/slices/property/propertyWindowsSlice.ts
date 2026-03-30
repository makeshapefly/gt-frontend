import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'
import { supabase } from '@/superbaseClient'

export type PropertyWindow = {
    id: string
    property_id: string
    room_id: string
    window_number: number | null
    type: string | null
    frame: string | null
    area_m2: number | null
    room_volume_m3: number | null
}

export type PropertyWindowsState = {
    propertyWindows: PropertyWindow[]
    loading: boolean
}

const initialState: PropertyWindowsState = {
    propertyWindows: [],
    loading: false,
}

const WINDOW_FIELDS = 'id, property_id, room_id, window_number, type, frame, area_m2, room_volume_m3'

export const fetchPropertyWindows = createAsyncThunk<PropertyWindow[], string>(
    `${SLICE_BASE_NAME}/fetchPropertyWindows`,
    async (propertyId, { rejectWithValue }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('window')
            .select(WINDOW_FIELDS)
            .eq('property_id', propertyId)

        if (error) return rejectWithValue(error.message)

        return (data ?? []) as PropertyWindow[]
    }
)

export const addPropertyWindow = createAsyncThunk<PropertyWindow, {
    property_id: string
    room_id: string
    window_number: number | null
    type: string | null
    frame: string | null
    area_m2: number | null
    room_volume_m3: number | null
}>(
    `${SLICE_BASE_NAME}/addPropertyWindow`,
    async (payload, { rejectWithValue }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('window')
            .insert([payload])
            .select(WINDOW_FIELDS)
            .single()

        if (error) return rejectWithValue(error.message)

        return data as PropertyWindow
    }
)

export const updatePropertyWindow = createAsyncThunk<PropertyWindow, {
    id: string
    window_number: number | null
    type: string | null
    frame: string | null
    area_m2: number | null
    room_volume_m3: number | null
}>(
    `${SLICE_BASE_NAME}/updatePropertyWindow`,
    async ({ id, ...fields }, { rejectWithValue }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('window')
            .update(fields)
            .eq('id', id)
            .select(WINDOW_FIELDS)
            .single()

        if (error) return rejectWithValue(error.message)

        return data as PropertyWindow
    }
)

export const deletePropertyWindow = createAsyncThunk<string, string>(
    `${SLICE_BASE_NAME}/deletePropertyWindow`,
    async (id, { rejectWithValue }) => {
        const { error } = await supabase
            .schema('gt')
            .from('window')
            .delete()
            .eq('id', id)

        if (error) return rejectWithValue(error.message)

        return id
    }
)

const propertyWindowsSlice = createSlice({
    name: `${SLICE_BASE_NAME}/windows`,
    initialState,
    reducers: {
        clearPropertyWindows(state) {
            state.propertyWindows = []
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPropertyWindows.pending, (state) => {
            state.loading = true
        })
        builder.addCase(fetchPropertyWindows.fulfilled, (state, action) => {
            state.propertyWindows = action.payload
            state.loading = false
        })
        builder.addCase(fetchPropertyWindows.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(addPropertyWindow.fulfilled, (state, action) => {
            state.propertyWindows.push(action.payload)
        })
        builder.addCase(updatePropertyWindow.fulfilled, (state, action) => {
            const index = state.propertyWindows.findIndex(w => w.id === action.payload.id)
            if (index !== -1) state.propertyWindows[index] = action.payload
        })
        builder.addCase(deletePropertyWindow.fulfilled, (state, action) => {
            state.propertyWindows = state.propertyWindows.filter(w => w.id !== action.payload)
        })
    },
})

export const { clearPropertyWindows } = propertyWindowsSlice.actions
export default propertyWindowsSlice.reducer
