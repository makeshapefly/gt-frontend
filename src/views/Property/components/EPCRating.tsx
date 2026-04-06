type Props = {
    score: number
}

const BANDS = [
    { rating: 'A', min: 92, max: 100, label: '92–100', color: 'bg-green-700', width: 'w-[40%]' },
    { rating: 'B', min: 81, max: 91,  label: '81–91',  color: 'bg-green-500', width: 'w-[47%]' },
    { rating: 'C', min: 69, max: 80,  label: '69–80',  color: 'bg-lime-400',  width: 'w-[54%]' },
    { rating: 'D', min: 55, max: 68,  label: '55–68',  color: 'bg-yellow-400',width: 'w-[61%]' },
    { rating: 'E', min: 39, max: 54,  label: '39–54',  color: 'bg-orange-400',width: 'w-[68%]' },
    { rating: 'F', min: 21, max: 38,  label: '21–38',  color: 'bg-orange-600',width: 'w-[75%]' },
    { rating: 'G', min: 1,  max: 20,  label: '1–20',   color: 'bg-red-600',   width: 'w-[82%]' },
]

function scoreToRating(score: number): string {
    const band = BANDS.find((b) => score >= b.min && score <= b.max)
    return band?.rating ?? 'G'
}

const EPCRating: React.FC<Props> = ({ score }) => {
    const current = scoreToRating(score)

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
                            <span className="text-xs font-bold text-gray-800">◀ {score} ({band.rating})</span>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default EPCRating
