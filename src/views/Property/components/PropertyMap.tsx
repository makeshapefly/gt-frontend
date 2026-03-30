type Props = {
    street?: string
    postcode?: string
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const PropertyMap: React.FC<Props> = ({ street, postcode }) => {
    const query = [street, postcode].filter(Boolean).join(', ')

    if (!API_KEY) {
        return (
            <div className="flex items-center justify-center h-full w-full text-gray-400 text-sm">
                Google Maps API key not configured
            </div>
        )
    }

    if (!query) {
        return (
            <div className="flex items-center justify-center h-full w-full text-gray-400 text-sm">
                No address available
            </div>
        )
    }

    const src = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${encodeURIComponent(query)}&zoom=16`

    return (
        <iframe
            title="Property location"
            src={src}
            className="w-full h-full rounded border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
        />
    )
}

export default PropertyMap
