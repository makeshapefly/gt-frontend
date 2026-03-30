import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'
import { supabase } from '@/superbaseClient'

export type PropertyType = {
    id: string
    name: string
}

export type PropertyTypeState = {
    list: PropertyType[]
    selected?: PropertyType
}

const initialState: PropertyTypeState = {
    list: [],
    selected: undefined,
}

// Fetch all property types
export const fetchPropertyTypes = createAsyncThunk<PropertyType[]>(
    'propertyType/fetchPropertyTypes',
    async () => {
        const { data, error } = await supabase
            .schema('gt')
            .from('property_type')
            .select(`
                id,
                name
            `)

        if (error) throw error

        const propertyTypes: PropertyType[] = (data ?? []).map(item => ({
            id: item.id,
            name: item.name
        }))

        console.log(propertyTypes)

        return propertyTypes
    }
)

// Fetch single property type by ID
export const fetchPropertyTypeById = createAsyncThunk<PropertyType, string>(
    'propertyType/fetchPropertyTypeById',
    async (id: string) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('property_type')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error

        const propertyType: PropertyType = data

        console.log(propertyType)

        return propertyType
    }
)

const propertyTypeSlice = createSlice({
    name: `${SLICE_BASE_NAME}/propertyType`,
    initialState,
    reducers: {
        setPropertyTypes(state, action: PayloadAction<PropertyType[]>) {
            state.list = action.payload
        },
        addPropertyType(state, action: PayloadAction<PropertyType>) {
            state.list.push(action.payload)
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPropertyTypes.fulfilled, (state, action) => {
            state.list = action.payload
        })

        builder.addCase(fetchPropertyTypeById.fulfilled, (state, action) => {
            state.selected = action.payload
        })
    }
})

export const { setPropertyTypes, addPropertyType } = propertyTypeSlice.actions
export default propertyTypeSlice.reducer