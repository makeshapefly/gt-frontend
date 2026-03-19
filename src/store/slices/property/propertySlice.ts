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
    deleteConfirmation: boolean
}

const initialState: PropertyState = {
    list: [],
    selected: undefined,
    deleteConfirmation: false,
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

export const updatePropertySummary = createAsyncThunk(
    'property/updatePropertySummary',
    async (payload: {
        id: string
        //name: string
        property_type_id: string
        property_tenure_id: string
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

export const deleteProperty = createAsyncThunk<
    string, // return the id
    string
>(
    'property/deleteProperty',
    async (id: string) => {
        console.log("think id: " + id)
        const { data, error } = await supabase
            .schema('gt')
            .from('property')
            .delete()
            .eq('id', id)

        if (error) {
            console.log(error)
            throw new Error(error.message)
        }

        console.log(data)

        return id // return the deleted property id
    }
)

export const addProperty = createAsyncThunk<
    Property,
    {
        property_name: string
        street: string
        postcode: string
        property_type_id: string
        property_tenure_id: string
        user_id: string
    }
>(
    'property/addProperty',
    async (payload, { rejectWithValue }) => {
        console.log(JSON.stringify(payload))
        const { data, error } = await supabase
            .schema('gt')
            .from('property')
            .insert([payload])
            .select()
            .single()

        if (error) {
            return rejectWithValue(error.message)
        }

        return data
    }
)

const propertySlice = createSlice({
    name: `${SLICE_BASE_NAME}/property`,
    initialState,
    reducers: {
        setProperties(state, action: PayloadAction<Property[]>) {
            state.list = action.payload
        },
        /* addProperty(state, action: PayloadAction<Property>) {
             state.list.push(action.payload
             )
         }, */
        toggleDeleteConfirmation: (state, action) => {
            state.deleteConfirmation = action.payload
        },
        setSelectedProperty: (state, action) => {
            state.selected = action.payload
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchProperties.fulfilled, (state, action) => {
            state.list = action.payload
        })

        builder.addCase(fetchPropertyById.fulfilled, (state, action) => {
            state.selected = action.payload
        })

        builder.addCase(updatePropertySummary.fulfilled, (state, action) => {
            const index = state.list.findIndex(p => p.id === action.payload.id)
            if (index !== -1) {
                state.list[index] = action.payload
            }

            state.selected = action.payload
        })

        builder.addCase(deleteProperty.fulfilled, (state, action) => {
            state.list = state.list.filter(p => p.id !== action.payload)

            // if the deleted one was selected, clear it
            if (state.selected?.id === action.payload) {
                state.selected = undefined
            }
        })

        builder.addCase(addProperty.fulfilled, (state, action) => {
            state.list.push(action.payload)
        })
    }
})

export const { setProperties, toggleDeleteConfirmation, setSelectedProperty } = propertySlice.actions
export default propertySlice.reducer