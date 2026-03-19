import { combineReducers, Action, Reducer } from 'redux'
import auth, { AuthState } from './slices/auth'
import base, { BaseState } from './slices/base'
import locale, { LocaleState } from './slices/locale/localeSlice'
import theme, { ThemeState } from './slices/theme/themeSlice'
import property, { PropertyState } from './slices/property/propertySlice'
import propertyType, { PropertyTypeState } from './slices/property/propertyTypeSlice'
import propertyTenure, { PropertyTenureState } from './slices/property/propertyTenureSlice'
import RtkQueryService from '@/services/RtkQueryService'

export type RootState = {
    auth: AuthState
    base: BaseState
    locale: LocaleState
    theme: ThemeState
    property: PropertyState,
    propertyTenure: PropertyTenureState,
    propertyType: PropertyTypeState
    /* eslint-disable @typescript-eslint/no-explicit-any */
    [RtkQueryService.reducerPath]: any
}

export interface AsyncReducers {
    [key: string]: Reducer<any, Action>
}

const staticReducers = {
    auth,
    base,
    locale,
    theme,
    property,
    propertyTenure,
    propertyType,
    [RtkQueryService.reducerPath]: RtkQueryService.reducer,
}

const rootReducer =
    (asyncReducers?: AsyncReducers) => (state: RootState, action: Action) => {
        const combinedReducer = combineReducers({
            ...staticReducers,
            ...asyncReducers,
        })
        return combinedReducer(state, action)
    }

export default rootReducer
