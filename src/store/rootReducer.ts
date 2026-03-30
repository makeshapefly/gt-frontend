import { combineReducers, Action, Reducer } from 'redux'
import auth, { AuthState } from './slices/auth'
import base, { BaseState } from './slices/base'
import locale, { LocaleState } from './slices/locale/localeSlice'
import theme, { ThemeState } from './slices/theme/themeSlice'
import property, { PropertyState } from './slices/property/propertySlice'
import propertyRoom, { PropertyRoomState } from './slices/property/propertyRoomSlice'
import propertyLocation, { PropertyLocationState } from './slices/property/propertyLocationSlice'
import propertySpacial, { PropertySpacialState } from './slices/property/propertySpacialSlice'
import propertyHeating, { PropertyHeatingState } from './slices/property/propertyHeatingSlice'
import propertyElectrical, { PropertyElectricalState } from './slices/property/propertyElectricalSlice'
import propertyGas, { PropertyGasState } from './slices/property/propertyGasSlice'
import propertySewerage, { PropertySewerageState } from './slices/property/propertySewerageSlice'
import propertyWater, { PropertyWaterState } from './slices/property/propertyWaterSlice'
import propertyHotWater, { PropertyHotWaterState } from './slices/property/propertyHotWaterSlice'
import propertyWindows, { PropertyWindowsState } from './slices/property/propertyWindowsSlice'
import propertyType, { PropertyTypeState } from './slices/property/propertyTypeSlice'
import propertyTenure, { PropertyTenureState } from './slices/property/propertyTenureSlice'
import RtkQueryService from '@/services/RtkQueryService'

export type RootState = {
    auth: AuthState
    base: BaseState
    locale: LocaleState
    theme: ThemeState
    property: PropertyState,
    propertyRoom: PropertyRoomState,
    propertyLocation: PropertyLocationState,
    propertySpacial: PropertySpacialState,
    propertyHeating: PropertyHeatingState,
    propertyElectrical: PropertyElectricalState,
    propertyGas: PropertyGasState,
    propertySewerage: PropertySewerageState,
    propertyWater: PropertyWaterState,
    propertyHotWater: PropertyHotWaterState,
    propertyWindows: PropertyWindowsState,
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
    propertyRoom,
    propertyLocation,
    propertySpacial,
    propertyHeating,
    propertyElectrical,
    propertyGas,
    propertySewerage,
    propertyWater,
    propertyHotWater,
    propertyWindows,
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
