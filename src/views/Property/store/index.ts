import { combineReducers } from '@reduxjs/toolkit'
import reducers, { PropertyState } from '@/store/slices/property/propertySlice'
import { useSelector } from 'react-redux'

import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState } from '@/store'

const reducer = combineReducers({
    data: reducers,
})

export const useAppSelector: TypedUseSelectorHook<
    RootState & {
        'property': {
            data: PropertyState
        }
    }
> = useSelector

export * from '@/store/slices/property/propertySlice'
export { useAppDispatch } from '@/store'
export default reducer
