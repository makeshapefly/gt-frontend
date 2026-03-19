import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'
import { supabase } from '@/superbaseClient'

export type PropertyTenure = {
    id: string
    name: string
}

export type PropertyTenureState = {
    list: PropertyTenure[]
    selected?: PropertyTenure
}

const initialState: PropertyTenureState = {
    list: [],
    selected: undefined,
}

// Fetch all property tenures
export const fetchPropertyTenures = createAsyncThunk<PropertyTenure[]>(
    'propertyTenure/fetchPropertyTenures',
    async () => {
        const { data, error } = await supabase
            .schema('gt')
            .from('property_tenure')
            .select(`
                id,
                name
            `)

        if (error) throw error

        const propertyTenures: PropertyTenure[] = (data ?? []).map(item => ({
            id: item.id,
            name: item.name
        }))

        console.log(propertyTenures)

        return propertyTenures
    }
)

// Fetch single property tenure by ID
export const fetchPropertyTenureById = createAsyncThunk<PropertyTenure, string>(
    'propertyTenure/fetchPropertyTenureById',
    async (id: string) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('property_tenure')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error

        const propertyTenure: PropertyTenure = data

        console.log(propertyTenure)

        return propertyTenure
    }
)

const propertyTenureSlice = createSlice({
    name: `${SLICE_BASE_NAME}/propertyTenure`,
    initialState,
    reducers: {
        setPropertyTenures(state, action: PayloadAction<PropertyTenure[]>) {
            state.list = action.payload
        },
        addPropertyTenure(state, action: PayloadAction<PropertyTenure>) {
            state.list.push(action.payload)
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPropertyTenures.fulfilled, (state, action) => {
            state.list = action.payload
        })

        builder.addCase(fetchPropertyTenureById.fulfilled, (state, action) => {
            state.selected = action.payload
        })
    }
})

export const { setPropertyTenures, addPropertyTenure } = propertyTenureSlice.actions
export default propertyTenureSlice.reducer