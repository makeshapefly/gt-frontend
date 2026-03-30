import { useState, useEffect, Suspense, lazy } from 'react'
import Tabs from '@/components/ui/Tabs'
import AdaptableCard from '@/components/shared/AdaptableCard'
import Container from '@/components/shared/Container'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from "@/store"
import { fetchPropertyById } from "@/store/slices/property"
import Summary from './components/Summary'
import Spatial from './components/Spatial'
import Frame from './components/Frame'
import Rooms from './components/Rooms'
import Windows from './components/Windows'
import Heating from './components/Heating'
import Electrical from './components/Electrical'
import Gas from './components/Gas'
import HotWater from './components/HotWater'
import WaterSewerage from './components/WaterSewerage'

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
    frame: { label: 'Frame', path: 'frame' },
    rooms: { label: 'Rooms', path: 'rooms' },
    windows: { label: 'Windows', path: 'windows' },
    heating: { label: 'Heating', path: 'heating' },
    electrical: { label: 'Electrical', path: 'electrical' },
    gas: { label: 'Gas', path: 'gas' },
    hot_water: { label: 'Hot Water', path: 'hot_water' },
    water_sewerage: { label: 'Water and Sewerage', path: 'water_sewerage' },
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
                        <span>{selectedProperty && selectedProperty.property_name} {selectedProperty && selectedProperty.street}, {selectedProperty && selectedProperty.postcode}</span>
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
                        {currentTab === 'spatial' && (
                            selectedProperty && <Spatial property={selectedProperty} />
                        )}
                        {currentTab === 'frame' && (
                            selectedProperty && <Frame property={selectedProperty} />
                        )}
                        {currentTab === 'rooms' && (
                            selectedProperty && <Rooms property={selectedProperty} />
                        )}
                        {currentTab === 'windows' && (
                            selectedProperty && <Windows property={selectedProperty} />
                        )}
                        {currentTab === 'heating' && (
                            selectedProperty && <Heating property={selectedProperty} />
                        )}
                        {currentTab === 'electrical' && (
                            selectedProperty && <Electrical property={selectedProperty} />
                        )}
                        {currentTab === 'gas' && (
                            selectedProperty && <Gas property={selectedProperty} />
                        )}
                        {currentTab === 'hot_water' && (
                            selectedProperty && <HotWater property={selectedProperty} />
                        )}
                        {currentTab === 'water_sewerage' && (
                            selectedProperty && <WaterSewerage property={selectedProperty} />
                        )}
                    </Suspense>
                </div>
            </AdaptableCard>
        </Container>
    )
}

export default EditProperty