import classNames from 'classnames'
import { Avatar, Badge, Button, Card } from "@/components/ui"
import Chart from '@/components/shared/Chart'
import { useAppDispatch, useAppSelector } from "@/store"
import { fetchProperties } from "@/store/slices/property"
import { useEffect, useMemo } from "react"
import { useNavigate } from 'react-router-dom'
import {
    HiOutlineHome,
    HiCurrencyPound,
    HiOutlineTrendingUp,
    HiOutlineTrendingDown,
    HiOutlineOfficeBuilding,
    HiPlusCircle,
} from 'react-icons/hi'

const EPC_COLORS: Record<string, string> = {
    A: '#15803d',
    B: '#22c55e',
    C: '#a3e635',
    D: '#eab308',
    E: '#f97316',
    F: '#ea580c',
    G: '#dc2626',
}

const EPC_ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

const Home = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const properties = useAppSelector((state) => state.property.list)

    useEffect(() => {
        dispatch(fetchProperties())
    }, [])

    const epcChartData = useMemo(() => {
        const counts: Record<string, number> = {}
        for (const p of properties) {
            if (p.epc_rating) {
                const r = p.epc_rating.toUpperCase()
                counts[r] = (counts[r] ?? 0) + 1
            }
        }
        const labels = EPC_ORDER.filter((r) => counts[r] > 0)
        const data = labels.map((r) => counts[r])
        const colors = labels.map((r) => EPC_COLORS[r])
        return { labels, data, colors }
    }, [properties])

    const GrowShrink = ({ value }: { value: number }) => (
        <span className="flex items-center rounded-full gap-1">
            <span className={classNames(
                'rounded-full p-1',
                value > 0 && 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100',
                value < 0 && 'text-red-600 bg-red-100 dark:text-red-100 dark:bg-red-500/20',
            )}>
                {value > 0 && <HiOutlineTrendingUp />}
                {value < 0 && <HiOutlineTrendingDown />}
            </span>
            <span className={classNames(
                'font-semibold',
                value > 0 && 'text-emerald-600',
                value < 0 && 'text-red-600',
            )}>
                {value > 0 && <>+ </>}{value}
            </span>
        </span>
    )

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Stat cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                <Card>
                    <div className="flex items-center gap-4">
                        <Avatar
                            size={55}
                            className="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-100"
                            icon={<HiOutlineHome />}
                        />
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold leading-none">Properties</h4>
                                <Button
                                    size="xs"
                                    variant="solid"
                                    icon={<HiPlusCircle />}
                                    onClick={() => navigate('/app/add-property')}
                                >
                                    Add
                                </Button>
                            </div>
                            <p>{properties.length}</p>
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
                            <h4 className="font-bold leading-none mb-2">Portfolio Value</h4>
                            <p>£980,000</p>
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
                            <h4 className="font-bold leading-none mb-2">Improvements</h4>
                            <p>12</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card>
                    <h4>EPC Ratings</h4>
                    <div className="mt-6">
                        {epcChartData.data.length > 0 ? (
                            <>
                                <Chart
                                    donutTitle={`${epcChartData.data.reduce((a, b) => a + b, 0)}`}
                                    donutText="Properties"
                                    series={epcChartData.data}
                                    customOptions={{
                                        labels: epcChartData.labels,
                                        colors: epcChartData.colors,
                                    }}
                                    type="donut"
                                />
                                <div className="mt-6 grid grid-cols-2 gap-3 max-w-[200px] mx-auto">
                                    {epcChartData.labels.map((label, index) => (
                                        <div key={label} className="flex items-center gap-2">
                                            <Badge
                                                badgeStyle={{ backgroundColor: epcChartData.colors[index] }}
                                            />
                                            <span className="font-semibold text-sm">
                                                {label} — {epcChartData.data[index]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-gray-400 mt-4">No EPC ratings recorded yet.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default Home
