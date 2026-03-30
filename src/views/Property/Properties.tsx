import { AdaptableCard } from "@/components/shared"
import OrdersTableTools from "./components/OrdersTableTools"
import PropertyTable from "./components/PropertyTable"
import OrderDeleteConfirmation from "./components/OrderDeleteConfirmation"

/** Example purpose only */
const Properties = () => {
    return <div>
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3 className="mb-4 lg:mb-0">Properties</h3>
            </div>
            <PropertyTable />
        </AdaptableCard>
    </div>
}

export default Properties
