import { lazy } from 'react'
import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    {
        key: 'properties',
        path: '/properties',
        component: lazy(() => import('@/views/Property/Properties')),
        authority: [],
    },
    {
        key: 'appsProperty.edit',
        path: `/app/properties/:id/edit/:tab`,
        component: lazy(() => import('@/views/Property/EditProperty')),
        authority: [],
    },
]
