import { Loading } from "@/components/shared"
import classNames from 'classnames'
import { Avatar, Card } from "@/components/ui"
import { useAppDispatch, useAppSelector } from "@/store"
import { fetchProperties } from "@/store/slices/property"
import { useEffect } from "react"
import {
    HiOutlineHome,
    HiCalendar,
    HiOutlineTrendingUp,
    HiOutlineTrendingDown,
    HiCurrencyPound,
    HiOutlineOfficeBuilding,
} from 'react-icons/hi'
//import { property } from "lodash"

const Home = () => {
    const dispatch = useAppDispatch()
    const property = useAppSelector((state) => state.property)
    useEffect(() => {
        dispatch(fetchProperties())
    }, [])

    const GrowShrink = ({ value }: { value: number }) => {
        return (
            <span className="flex items-center rounded-full gap-1">
                <span
                    className={classNames(
                        'rounded-full p-1',
                        value > 0 &&
                        'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100',
                        value < 0 &&
                        'text-red-600 bg-red-100 dark:text-red-100 dark:bg-red-500/20',
                    )}
                >
                    {value > 0 && <HiOutlineTrendingUp />}
                    {value < 0 && <HiOutlineTrendingDown />}
                </span>
                <span
                    className={classNames(
                        'font-semibold',
                        value > 0 && 'text-emerald-600',
                        value < 0 && 'text-red-600',
                    )}
                >
                    {value > 0 && <>+ </>}
                    {value}
                </span>
            </span>
        )
    }

    return <div className="flex flex-col gap-4 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card>
                <div className="flex items-center gap-4">
                    <Avatar
                        size={55}
                        className="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-100"
                        icon={<HiOutlineHome />}
                    />
                    <div>
                        <div className="flex gap-1.5 items-end mb-2">
                            <h4 className="font-bold leading-none">Properties</h4>
                        </div>
                        <p className="flex items-center gap-1">
                            <span>{property.length}</span>
                        </p>
                    </div>
                </div>
            </Card>
            <Card>
                <div className="flex items-center gap-4">
                    <Avatar
                        size={55}
                        className="bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-100"
                        icon={<HiCurrencyPound />}
                    />
                    <div>
                        <div className="flex gap-1.5 items-end mb-2">
                            <h4 className="font-bold leading-none">Portfolio Value</h4>
                        </div>
                        <p className="flex items-center gap-1">
                            <span>£980000</span>
                        </p>
                    </div>
                </div>
            </Card>
            <Card>
                <div className="flex items-center gap-4">
                    <Avatar
                        size={55}
                        className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100"
                        icon={<HiOutlineOfficeBuilding />}
                    />
                    <div>
                        <div className="flex gap-1.5 items-end mb-2">
                            <h4 className="font-bold leading-none">Improvements</h4>
                        </div>
                        <p className="flex items-center gap-1">
                            <span>12</span>
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    </div>
}

export default Home
