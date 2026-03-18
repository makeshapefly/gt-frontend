
type Property = {
    id: string
    name?: string
    street?: string
    postcode?: string
}

type EditPropertyProps = {
    property: Property
}

const Location: React.FC<EditPropertyProps> = ({ property }) => {
    return (
        <div>Location</div>
    )
}

export default Location