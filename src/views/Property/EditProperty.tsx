import { useState, useEffect, Suspense, lazy } from 'react'
import Tabs from '@/components/ui/Tabs'
import AdaptableCard from '@/components/shared/AdaptableCard'
import Container from '@/components/shared/Container'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from "@/store"
import { fetchPropertyById } from "@/store/slices/property"
import Summary from './components/Summary'

const { TabNav, TabList } = Tabs

const Location = lazy(() => import('./components/Location'))

const propertyMenu: Record<
    string,
    {
        label: string
        path: string
    }
    > = {
    summary: { label: 'Summary', path: 'summary' },
    location: { label: 'Location', path: 'location' },
    spatial: { label: 'Spatial', path: 'spatial' },
}

const EditProperty = () => {
    const dispatch = useAppDispatch()
    const selectedProperty = useAppSelector((state) => state.property.selected)
    const [currentTab, setCurrentTab] = useState('profile')

    //const { id } = useParams<{ id: string }>()
    const { id, tab } = useParams<{ id: string; tab: string }>()

    const navigate = useNavigate()

    const location = useLocation()

    const path = location.pathname.substring(
        location.pathname.lastIndexOf('/') + 1,
    )

    const onTabChange = (val: string) => {
        setCurrentTab(val)
        if (id) {
            navigate(`/app/properties/${id}/edit/${val}`)
        }
    }

    useEffect(() => {
        setCurrentTab(tab || 'summary') // fallback if tab is missing
        if (id) dispatch(fetchPropertyById(id))
    }, [dispatch, id, tab])

    return (
        <Container>
            <div className="mb-6">
                <div className="flex items-center mb-2">
                    <h3>
                        <span>{selectedProperty && selectedProperty.street}, {selectedProperty && selectedProperty.postcode}</span>
                        <span className="ltr:ml-2 rtl:mr-2">

                        </span>
                    </h3>
                </div>
            </div>
            <AdaptableCard>
                <Tabs value={currentTab} onChange={(val) => onTabChange(val)}>
                    <TabList>
                        {Object.keys(propertyMenu).map((key) => (
                            <TabNav key={key} value={key}>
                                {propertyMenu[key].label}
                            </TabNav>
                        ))}
                    </TabList>
                </Tabs>
                <div className="px-4 py-6">
                    <Suspense fallback={<></>}>
                        {currentTab === 'summary' && (
                            selectedProperty && <Summary property={selectedProperty} />
                        )}
                        {currentTab === 'location' && (
                            selectedProperty && <Location property={selectedProperty} />
                        )}
                    </Suspense>
                </div>
            </AdaptableCard>
        </Container>
    )
}

export default EditProperty