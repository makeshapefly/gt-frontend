import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'
import { supabase } from '@/superbaseClient'

export type Property = {
    id: string
    name?: string
    street?: string
    postcode?: string
}

export type PropertyState = {
    list: Property[]
    selected?: Property
}

const initialState: PropertyState = {
    list: [],
    selected: undefined,
}

export const fetchProperties = createAsyncThunk<Property[]>(
    'property/fetchProperties',
    async () => {
        const { data, error } = await supabase
            .schema('gt')
            .from('property')
            .select(`
            id,
            street,
            postcode,
            property_roof (*)
          `);

        if (error) throw error

        // 3. Map to your type
        const properties: Property[] = (data ?? []).map(item => ({
            id: item.id,
            street: item.street,
            postcode: item.postcode,
            roof: item.property_roof
        }))

        console.log(properties)

        return properties
    }
)

export const fetchPropertyById = createAsyncThunk<Property, string>(
    'property/fetchPropertyById',
    async (id: string) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('property')
            .select(`
        *,
        property_tenure (*)
      `)
            .eq('id', id)
            .single()

        if (error) throw error

        // 3. Map to your type
        const property: Property = data

        return property
    }
)

const propertySlice = createSlice({
    name: `${SLICE_BASE_NAME}/property`,
    initialState,
    reducers: {
        setProperties(state, action: PayloadAction<Property[]>) {
            state.list = action.payload
        },
        addProperty(state, action: PayloadAction<Property>) {
            state.list.push(action.payload
            )
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchProperties.fulfilled, (state, action) => {
            state.list = action.payload
        })

        builder.addCase(fetchPropertyById.fulfilled, (state, action) => {
            state.selected = action.payload
        })
    }
})

export const { setProperties, addProperty } = propertySlice.actions
export default propertySlice.reducer