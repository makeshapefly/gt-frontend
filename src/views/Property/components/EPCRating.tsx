type Props = {
    rating: string
}

const BANDS = [
    { rating: 'A', label: '92–100', color: 'bg-green-700', width: 'w-[40%]' },
    { rating: 'B', label: '81–91',  color: 'bg-green-500', width: 'w-[47%]' },
    { rating: 'C', label: '69–80',  color: 'bg-lime-400',  width: 'w-[54%]' },
    { rating: 'D', label: '55–68',  color: 'bg-yellow-400',width: 'w-[61%]' },
    { rating: 'E', label: '39–54',  color: 'bg-orange-400',width: 'w-[68%]' },
    { rating: 'F', label: '21–38',  color: 'bg-orange-600',width: 'w-[75%]' },
    { rating: 'G', label: '1–20',   color: 'bg-red-600',   width: 'w-[82%]' },
]

const EPCRating: React.FC<Props> = ({ rating }) => {
    const current = rating.toUpperCase()

    return (
        <div className="flex flex-col gap-1 mt-4">
            {BANDS.map((band) => {
                const isActive = band.rating === current
                return (
                    <div key={band.rating} className="flex items-center gap-2">
                        {/* Bar with arrow notch via clip-path */}
                        <div
                            className={`relative flex items-center h-7 text-white text-xs font-bold ${band.color} ${band.width}`}
                            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)' }}
                        >
                            <span className="pl-2">{band.rating}</span>
                        </div>
                        <span className="text-xs text-gray-500">{band.label}</span>
                        {isActive && (
                            <span className="text-xs font-bold text-gray-800">◀ Current</span>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default EPCRating
