import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'
import { supabase } from '@/superbaseClient'

export type Property = {
    id: string
    name?: string
    street?: string
    postcode?: string
}

export type PropertyState = Property[]

const initialState: PropertyState = []

export const fetchProperties = createAsyncThunk<Property[]>(
    'property/fetchProperties',
    async () => {
        const { data, error } = await supabase
            .schema('gt')
            .from('property')  // include schema if needed
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

/*export const fetchProperties = createAsyncThunk<Property[]>(
    'property/fetchProperties',
    async (_, thunkAPI) => {
        const { data, error } = await supabase
            .from('property')
            .select(`
        id,
        street as name,
        property_roof (*)
      `) // map street → name to match Property type

        if (error) {
            return [] // or you can throw: thunkAPI.rejectWithValue(error.message)
        }

        // data might be null, so force array
        return (data ?? []) as unknown as Property[]
    }
) */

const propertySlice = createSlice({
    name: `${SLICE_BASE_NAME}/property`,
    initialState,
    reducers: {
        setProperties(state, action: PayloadAction<PropertyState>) {
            return action.payload
        },
        addProperty(state, action: PayloadAction<Property>) {
            state.push(action.payload)
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchProperties.fulfilled, (state, action: PayloadAction<Property[]>) => {
            return action.payload
        })
    }
})

export const { setProperties, addProperty } = propertySlice.actions
export default propertySlice.reducer