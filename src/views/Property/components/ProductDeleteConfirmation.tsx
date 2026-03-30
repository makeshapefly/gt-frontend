import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
    toggleDeleteConfirmation,
    useAppDispatch,
    useAppSelector,
} from '../store'
import { deleteProperty, setSelectedProperty } from '@/store/slices/property'

const ProductDeleteConfirmation = () => {
    const dispatch = useAppDispatch()
    const dialogOpen = useAppSelector(
        (state) => state.property.deleteConfirmation
    )
    const selectedProperty = useAppSelector(
        (state) => state.property.selected
    )
    /*const tableData = useAppSelector(
        (state) => state.salesProductList.data.tableData,
    ) */

    const onDialogClose = () => {
        dispatch(toggleDeleteConfirmation(false))
    }

    const onDelete = async () => {
        dispatch(toggleDeleteConfirmation(false))
        if (selectedProperty) {
            console.log(JSON.stringify(selectedProperty))
            const response = await dispatch(deleteProperty(selectedProperty.id)).unwrap()
            console.log(response.message)
            if (response.message === 'success') {
                // dispatch(getProducts(tableData))
                toast.push(
                    <Notification
                        title={'Successfuly Deleted'}
                        type="success"
                        duration={2500}
                    >
                        Property successfuly deleted
                    </Notification>,
                    {
                        placement: 'top-center',
                    },
                )
            }
        }
    }

    return (
        <ConfirmDialog
            isOpen={dialogOpen}
            type="danger"
            title="Delete property"
            confirmButtonColor="red-600"
            onClose={onDialogClose}
            onRequestClose={onDialogClose}
            onCancel={onDialogClose}
            onConfirm={onDelete}
        >
            <p>
                Are you sure you want to delete this property? All data related
                to this property will be permanently deleted. This action cannot be
                undone.
            </p>
        </ConfirmDialog>
    )
}

export default ProductDeleteConfirmation
