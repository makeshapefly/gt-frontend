import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'
import { supabase } from '@/superbaseClient'

export type Property = {
    id: string
    property_name?: string
    street?: string
    postcode?: string
    date_of_construction?: string | null
    construction_age_band?: string | null
    epc_rating?: number | null
}

export type PropertyRoof = {
    id: string
    property_id: string
    frame: string | null
    covering: string | null
    percentage: string | null
    insulation: string | null
}

export type PropertyWall = {
    id: string
    property_id: string
    type: string | null
    insulation: string | null
    percentage: string | null
}

export type PropertyState = {
    list: Property[]
    selected?: Property
    deleteConfirmation: boolean
    propertyRoofs: PropertyRoof[]
    propertyWalls: PropertyWall[]
}

const initialState: PropertyState = {
    list: [],
    selected: undefined,
    deleteConfirmation: false,
    propertyRoofs: [],
    propertyWalls: [],
}

export const fetchProperties = createAsyncThunk<Property[]>(
    'property/fetchProperties',
    async () => {
        const { data, error } = await supabase
            .schema('gt')
            .from('property')
            .select(`
            id,
            property_name,
            street,
            postcode,
            epc_rating,
            property_roof (*)
          `);

        if (error) throw error

        const properties: Property[] = (data ?? []).map(item => ({
            id: item.id,
            property_name: item.property_name,
            street: item.street,
            postcode: item.postcode,
            epc_rating: item.epc_rating,
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

        const property: Property = data

        return property
    }
)

export const updatePropertySummary = createAsyncThunk(
    'property/updatePropertySummary',
    async (payload: {
        id: string
        property_type_id: string
        property_tenure_id: string
        date_of_construction: string | null
        construction_age_band: string | null
        epc_rating: number | null
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
    string,
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

        return id
    }
)

export const addProperty = createAsyncThunk<
    Property,
    {
        property_name: string
        street: string
        postcode: string
        town?: string
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

// --- Property roof rows ---

export const fetchPropertyRoofs = createAsyncThunk<PropertyRoof[], string>(
    'property/fetchPropertyRoofs',
    async (propertyId: string) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('property_roof')
            .select('id, property_id, frame, covering, percentage, insulation')
            .eq('property_id', propertyId)

        if (error) throw error

        return (data ?? []) as PropertyRoof[]
    }
)

export const addPropertyRoof = createAsyncThunk<
    void,
    {
        property_id: string
        frame: string | null
        covering: string | null
        percentage: string | null
        insulation: string | null
    }
>(
    'property/addPropertyRoof',
    async (payload, { rejectWithValue }) => {
        const { error } = await supabase
            .schema('gt')
            .from('property_roof')
            .insert([payload])

        if (error) return rejectWithValue(error.message)
    }
)

export const deletePropertyRoof = createAsyncThunk<string, string>(
    'property/deletePropertyRoof',
    async (id: string, { rejectWithValue }) => {
        const { error } = await supabase
            .schema('gt')
            .from('property_roof')
            .delete()
            .eq('id', id)

        if (error) return rejectWithValue(error.message)

        return id
    }
)

export const updatePropertyRoof = createAsyncThunk<
    PropertyRoof,
    {
        id: string
        frame: string | null
        covering: string | null
        percentage: string | null
        insulation: string | null
    }
>(
    'property/updatePropertyRoof',
    async (payload, { rejectWithValue }) => {
        const { id, ...fields } = payload
        const { data, error } = await supabase
            .schema('gt')
            .from('property_roof')
            .update(fields)
            .eq('id', id)
            .select('id, property_id, frame, covering, percentage, insulation')
            .single()

        if (error) return rejectWithValue(error.message)

        return data as PropertyRoof
    }
)

// --- Property wall rows ---

export const fetchPropertyWalls = createAsyncThunk<PropertyWall[], string>(
    'property/fetchPropertyWalls',
    async (propertyId: string) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('property_wall')
            .select('id, property_id, type, insulation, percentage')
            .eq('property_id', propertyId)

        if (error) throw error

        return (data ?? []) as PropertyWall[]
    }
)

export const addPropertyWall = createAsyncThunk<
    void,
    {
        property_id: string
        type: string | null
        insulation: string | null
        percentage: string | null
    }
>(
    'property/addPropertyWall',
    async (payload, { rejectWithValue }) => {
        const { error } = await supabase
            .schema('gt')
            .from('property_wall')
            .insert([payload])

        if (error) return rejectWithValue(error.message)
    }
)

export const updatePropertyWall = createAsyncThunk<
    PropertyWall,
    {
        id: string
        type: string | null
        insulation: string | null
        percentage: string | null
    }
>(
    'property/updatePropertyWall',
    async (payload, { rejectWithValue }) => {
        const { id, ...fields } = payload
        const { data, error } = await supabase
            .schema('gt')
            .from('property_wall')
            .update(fields)
            .eq('id', id)
            .select('id, property_id, type, insulation, percentage')
            .single()

        if (error) return rejectWithValue(error.message)

        return data as PropertyWall
    }
)

export const deletePropertyWall = createAsyncThunk<string, string>(
    'property/deletePropertyWall',
    async (id: string, { rejectWithValue }) => {
        const { error } = await supabase
            .schema('gt')
            .from('property_wall')
            .delete()
            .eq('id', id)

        if (error) return rejectWithValue(error.message)

        return id
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

            if (state.selected?.id === action.payload) {
                state.selected = undefined
            }
        })

        builder.addCase(addProperty.fulfilled, (state, action) => {
            state.list.push(action.payload)
        })

        builder.addCase(fetchPropertyRoofs.fulfilled, (state, action) => {
            state.propertyRoofs = action.payload
        })

        builder.addCase(addPropertyRoof.fulfilled, () => {
            // re-fetch after save to get fresh IDs
        })

        builder.addCase(updatePropertyRoof.fulfilled, (state, action) => {
            const index = state.propertyRoofs.findIndex(r => r.id === action.payload.id)
            if (index !== -1) {
                state.propertyRoofs[index] = action.payload
            }
        })

        builder.addCase(deletePropertyRoof.fulfilled, (state, action) => {
            state.propertyRoofs = state.propertyRoofs.filter(r => r.id !== action.payload)
        })

        builder.addCase(fetchPropertyWalls.fulfilled, (state, action) => {
            state.propertyWalls = action.payload
        })

        builder.addCase(addPropertyWall.fulfilled, () => {
            // re-fetch after save to get fresh IDs
        })

        builder.addCase(updatePropertyWall.fulfilled, (state, action) => {
            const index = state.propertyWalls.findIndex(w => w.id === action.payload.id)
            if (index !== -1) {
                state.propertyWalls[index] = action.payload
            }
        })

        builder.addCase(deletePropertyWall.fulfilled, (state, action) => {
            state.propertyWalls = state.propertyWalls.filter(w => w.id !== action.payload)
        })
    }
})

export const { setProperties, toggleDeleteConfirmation, setSelectedProperty } = propertySlice.actions
export default propertySlice.reducer
