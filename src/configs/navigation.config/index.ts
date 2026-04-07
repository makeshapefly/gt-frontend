import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE,
} from '@/constants/navigation.constant'
import type { NavigationTree } from '@/@types/navigation'

const navigationConfig: NavigationTree[] = [
    {
        key: 'home',
        path: '/home',
        title: 'Dashboard',
        translateKey: 'nav.home',
        icon: 'home',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    /** Example purpose only, please remove */
    {
        key: 'properties',
        path: '/properties',
        title: 'properties',
        translateKey: 'nav.singleMenuItem',
        icon: 'singleMenu',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'improvements',
        path: '/improvements',
        title: 'Upgrades',
        translateKey: 'Upgrades',
        icon: 'improvements',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
]

export default navigationConfig
