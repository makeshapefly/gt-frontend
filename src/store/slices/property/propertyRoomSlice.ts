import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'
import { supabase } from '@/superbaseClient'

export type Radiator = {
    id: string
    property_id: string
    room_id: string
    type: string | null
    material: string | null
    height_mm: number | null
    width_mm: number | null
    output_watts: number | null
    manufacturer: string | null
    model: string | null
}

export type PropertyRoom = {
    id: string
    property_id: string
    room_number: string | null
    type: string | null
    radiators: Radiator[]
}

export type PropertyRoomState = {
    propertyRooms: PropertyRoom[]
    selectedRoom?: PropertyRoom
}

const initialState: PropertyRoomState = {
    propertyRooms: [],
    selectedRoom: undefined,
}

const ROOM_FIELDS = 'id, property_id, room_number, type, radiators:radiator(id, property_id, room_id, type, material, height_mm, width_mm, output_watts, manufacturer, model)'
const RADIATOR_FIELDS = 'id, property_id, room_id, type, material, height_mm, width_mm, output_watts, manufacturer, model'

export const fetchPropertyRooms = createAsyncThunk<PropertyRoom[], string>(
    `${SLICE_BASE_NAME}/fetchPropertyRooms`,
    async (propertyId, { rejectWithValue }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('room')
            .select(ROOM_FIELDS)
            .eq('property_id', propertyId)

        if (error) return rejectWithValue(error.message)
        console.log(data)

        return (data ?? []) as PropertyRoom[]
    }
)

export const addPropertyRoom = createAsyncThunk<
    PropertyRoom,
    {
        property_id: string
        room_number: string | null
        type: string | null
    }
>(
    `${SLICE_BASE_NAME}/addPropertyRoom`,
    async (payload, { rejectWithValue }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('room')
            .insert([payload])
            .select(ROOM_FIELDS)
            .single()

        if (error) return rejectWithValue(error.message)

        return data as PropertyRoom
    }
)

export const addPropertyRooms = createAsyncThunk<
    PropertyRoom[],
    Array<{
        property_id: string
        room_number: string | null
        type: string | null
    }>
>(
    `${SLICE_BASE_NAME}/addPropertyRooms`,
    async (payload, { rejectWithValue }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('room')
            .insert(payload)
            .select(ROOM_FIELDS)

        if (error) return rejectWithValue(error.message)

        return (data ?? []) as PropertyRoom[]
    }
)

export const updatePropertyRoom = createAsyncThunk<
    PropertyRoom,
    {
        id: string
        room_number: string | null
        type: string | null
    }
>(
    `${SLICE_BASE_NAME}/updatePropertyRoom`,
    async (payload, { rejectWithValue }) => {
        const { id, ...fields } = payload
        const { data, error } = await supabase
            .schema('gt')
            .from('room')
            .update(fields)
            .eq('id', id)
            .select(ROOM_FIELDS)
            .single()

        if (error) return rejectWithValue(error.message)

        return data as PropertyRoom
    }
)

export const deletePropertyRoom = createAsyncThunk<string, string>(
    `${SLICE_BASE_NAME}/deletePropertyRoom`,
    async (id, { rejectWithValue }) => {
        const { error } = await supabase
            .schema('gt')
            .from('room')
            .delete()
            .eq('id', id)

        if (error) return rejectWithValue(error.message)

        return id
    }
)

export const addRadiator = createAsyncThunk<Radiator, {
    property_id: string
    room_id: string
    type: string | null
    material: string | null
    height_mm: number | null
    width_mm: number | null
    output_watts: number | null
    manufacturer: string | null
    model: string | null
}>(
    `${SLICE_BASE_NAME}/addRadiator`,
    async (payload, { rejectWithValue }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('radiator')
            .insert([payload])
            .select(RADIATOR_FIELDS)
            .single()

        if (error) return rejectWithValue(error.message)

        return data as Radiator
    }
)

export const updateRadiator = createAsyncThunk<Radiator, {
    id: string
    type: string | null
    material: string | null
    height_mm: number | null
    width_mm: number | null
    output_watts: number | null
    manufacturer: string | null
    model: string | null
}>(
    `${SLICE_BASE_NAME}/updateRadiator`,
    async ({ id, ...fields }, { rejectWithValue }) => {
        const { data, error } = await supabase
            .schema('gt')
            .from('radiator')
            .update(fields)
            .eq('id', id)
            .select(RADIATOR_FIELDS)
            .single()

        if (error) return rejectWithValue(error.message)

        return data as Radiator
    }
)

export const deleteRadiator = createAsyncThunk<
    { radiatorId: string; roomId: string },
    { id: string; room_id: string }
>(
    `${SLICE_BASE_NAME}/deleteRadiator`,
    async ({ id, room_id }, { rejectWithValue }) => {
        const { error } = await supabase
            .schema('gt')
            .from('radiator')
            .delete()
            .eq('id', id)

        if (error) return rejectWithValue(error.message)

        return { radiatorId: id, roomId: room_id }
    }
)

export const deletePropertyRooms = createAsyncThunk<string[], string[]>(
    `${SLICE_BASE_NAME}/deletePropertyRooms`,
    async (ids, { rejectWithValue }) => {
        const { error } = await supabase
            .schema('gt')
            .from('room')
            .delete()
            .in('id', ids)

        if (error) return rejectWithValue(error.message)

        return ids
    }
)

const propertyRoomSlice = createSlice({
    name: `${SLICE_BASE_NAME}/room`,
    initialState,
    reducers: {
        selectRoom(state, action) {
            state.selectedRoom = action.payload
        },
        clearSelectedRoom(state) {
            state.selectedRoom = undefined
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPropertyRooms.fulfilled, (state, action) => {
            state.propertyRooms = action.payload
        })

        builder.addCase(addPropertyRoom.fulfilled, (state, action) => {
            state.propertyRooms.push(action.payload)
        })

        builder.addCase(addPropertyRooms.fulfilled, (state, action) => {
            state.propertyRooms.push(...action.payload)
        })

        builder.addCase(updatePropertyRoom.fulfilled, (state, action) => {
            const index = state.propertyRooms.findIndex(r => r.id === action.payload.id)
            if (index !== -1) {
                state.propertyRooms[index] = action.payload
            }
            if (state.selectedRoom?.id === action.payload.id) {
                state.selectedRoom = action.payload
            }
        })

        builder.addCase(deletePropertyRoom.fulfilled, (state, action) => {
            state.propertyRooms = state.propertyRooms.filter(r => r.id !== action.payload)
            if (state.selectedRoom?.id === action.payload) {
                state.selectedRoom = undefined
            }
        })

        builder.addCase(deletePropertyRooms.fulfilled, (state, action) => {
            const deleted = new Set(action.payload)
            state.propertyRooms = state.propertyRooms.filter(r => !deleted.has(r.id))
            if (state.selectedRoom && deleted.has(state.selectedRoom.id)) {
                state.selectedRoom = undefined
            }
        })

        builder.addCase(addRadiator.fulfilled, (state, action) => {
            const room = state.propertyRooms.find(r => r.id === action.payload.room_id)
            if (room) room.radiators.push(action.payload)
        })

        builder.addCase(updateRadiator.fulfilled, (state, action) => {
            const room = state.propertyRooms.find(r => r.id === action.payload.room_id)
            if (room) {
                const index = room.radiators.findIndex(r => r.id === action.payload.id)
                if (index !== -1) room.radiators[index] = action.payload
            }
        })

        builder.addCase(deleteRadiator.fulfilled, (state, action) => {
            const room = state.propertyRooms.find(r => r.id === action.payload.roomId)
            if (room) {
                room.radiators = room.radiators.filter(rad => rad.id !== action.payload.radiatorId)
            }
        })
    },
})

export const { selectRoom, clearSelectedRoom } = propertyRoomSlice.actions
export default propertyRoomSlice.reducer
