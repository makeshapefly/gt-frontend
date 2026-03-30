import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    fetchPropertyRooms,
    addPropertyRoom,
    updatePropertyRoom,
    deletePropertyRoom,
} from '@/store/slices/property/propertyRoomSlice'
import type { PropertyRoom } from '@/store/slices/property/propertyRoomSlice'
import Drawer from '@/components/ui/Drawer'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Tooltip from '@/components/ui/Tooltip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { FormContainer, FormItem } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import type { FieldProps, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import useThemeClass from '@/utils/hooks/useThemeClass'

type Property = {
    id: string
    name?: string
    street?: string
    postcode?: string
}

type EditPropertyProps = {
    property: Property
}

type Option = {
    value: string
    label: string
}

const roomTypeOptions: Option[] = [
    { value: 'bedroom', label: 'Bedroom' },
    { value: 'bathroom', label: 'Bathroom' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'living_room', label: 'Living Room' },
    { value: 'dining_room', label: 'Dining Room' },
    { value: 'hallway', label: 'Hallway' },
    { value: 'garage', label: 'Garage' },
    { value: 'utility', label: 'Utility' },
    { value: 'other', label: 'Other' },
]

type RoomFormValues = {
    room_number: string
    type: string
}

const validationSchema = Yup.object({
    room_number: Yup.string().required('Required'),
    type: Yup.string().required('Required'),
})

const emptyForm: RoomFormValues = { room_number: '', type: '' }

const Rooms: React.FC<EditPropertyProps> = ({ property }) => {
    const dispatch = useAppDispatch()
    const rooms = useAppSelector((state) => state.propertyRoom.propertyRooms)
    const { textTheme } = useThemeClass()

    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editingRoom, setEditingRoom] = useState<PropertyRoom | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

    useEffect(() => {
        dispatch(fetchPropertyRooms(property.id))
    }, [dispatch, property.id])

    const openAdd = () => {
        setEditingRoom(null)
        setDrawerOpen(true)
    }

    const openEdit = (room: PropertyRoom) => {
        setEditingRoom(room)
        setDrawerOpen(true)
    }

    const closeDrawer = (resetForm: () => void) => {
        setDrawerOpen(false)
        setEditingRoom(null)
        resetForm()
    }

    const requestDelete = (id: string) => {
        setPendingDeleteId(id)
        setDeleteDialogOpen(true)
    }

    const onDeleteConfirm = async () => {
        if (!pendingDeleteId) return
        try {
            await dispatch(deletePropertyRoom(pendingDeleteId)).unwrap()
            toast.push(
                <Notification title="Room deleted" type="success" />,
                { placement: 'top-center' }
            )
        } catch {
            toast.push(
                <Notification title="Failed to delete room" type="danger" />,
                { placement: 'top-center' }
            )
        } finally {
            setDeleteDialogOpen(false)
            setPendingDeleteId(null)
        }
    }

    const onSubmit = async (
        values: RoomFormValues,
        { setSubmitting, resetForm }: FormikHelpers<RoomFormValues>
    ) => {
        try {
            if (editingRoom) {
                await dispatch(updatePropertyRoom({
                    id: editingRoom.id,
                    room_number: values.room_number,
                    type: values.type,
                })).unwrap()
                toast.push(
                    <Notification title="Room updated" type="success" />,
                    { placement: 'top-center' }
                )
            } else {
                await dispatch(addPropertyRoom({
                    property_id: property.id,
                    room_number: values.room_number,
                    type: values.type,
                })).unwrap()
                toast.push(
                    <Notification title="Room added" type="success" />,
                    { placement: 'top-center' }
                )
            }
            resetForm()
            setDrawerOpen(false)
            setEditingRoom(null)
        } catch {
            toast.push(
                <Notification title="Failed to save room" type="danger" />,
                { placement: 'top-center' }
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h5 className="font-semibold">Rooms</h5>
                <Button size="sm" variant="solid" onClick={openAdd}>
                    Add Room
                </Button>
            </div>

            {rooms.length === 0 ? (
                <p className="text-gray-400 text-sm">No rooms found. Click "Add Room" to add one.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-600">
                                <th className="text-left py-2 pr-3 font-medium text-gray-600 dark:text-gray-400">Room Number</th>
                                <th className="text-left py-2 pr-3 font-medium text-gray-600 dark:text-gray-400">Type</th>
                                <th className="py-2 w-20"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map((room) => (
                                <tr key={room.id} className="border-b border-gray-100 dark:border-gray-700">
                                    <td className="py-2 pr-3">{room.room_number ?? '—'}</td>
                                    <td className="py-2 pr-3">
                                        {roomTypeOptions.find(o => o.value === room.type)?.label ?? room.type ?? '—'}
                                    </td>
                                    <td className="py-2">
                                        <div className="flex justify-end text-lg">
                                            <Tooltip title="Edit">
                                                <span
                                                    className={`cursor-pointer p-2 hover:${textTheme}`}
                                                    onClick={() => openEdit(room)}
                                                >
                                                    <HiOutlinePencil />
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <span
                                                    className="cursor-pointer p-2 hover:text-red-500"
                                                    onClick={() => requestDelete(room.id)}
                                                >
                                                    <HiOutlineTrash />
                                                </span>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Formik
                initialValues={editingRoom
                    ? { room_number: editingRoom.room_number ?? '', type: editingRoom.type ?? '' }
                    : emptyForm
                }
                enableReinitialize
                validationSchema={validationSchema}
                onSubmit={onSubmit}
            >
                {({ errors, touched, isSubmitting, resetForm }) => (
                    <Drawer
                        title={editingRoom ? 'Edit Room' : 'Add Room'}
                        isOpen={drawerOpen}
                        onClose={() => closeDrawer(resetForm)}
                        footer={
                            <div className="flex justify-end gap-2">
                                <Button size="sm" onClick={() => closeDrawer(resetForm)}>
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    variant="solid"
                                    loading={isSubmitting}
                                    form="room-form"
                                    type="submit"
                                >
                                    Save
                                </Button>
                            </div>
                        }
                    >
                        <Form id="room-form">
                            <FormContainer>
                                <FormItem
                                    label="Room Number"
                                    invalid={!!errors.room_number && touched.room_number}
                                    errorMessage={errors.room_number}
                                >
                                    <Field name="room_number">
                                        {({ field }: FieldProps) => (
                                            <Input
                                                size="sm"
                                                placeholder="e.g. 1"
                                                {...field}
                                            />
                                        )}
                                    </Field>
                                </FormItem>

                                <FormItem
                                    label="Type"
                                    invalid={!!errors.type && touched.type}
                                    errorMessage={errors.type}
                                >
                                    <Field name="type">
                                        {({ field, form }: FieldProps) => (
                                            <Select<Option>
                                                options={roomTypeOptions}
                                                value={roomTypeOptions.find(o => o.value === field.value) ?? null}
                                                onChange={option => form.setFieldValue(field.name, option?.value ?? '')}
                                                placeholder="Select type..."
                                                size="sm"
                                            />
                                        )}
                                    </Field>
                                </FormItem>
                            </FormContainer>
                        </Form>
                    </Drawer>
                )}
            </Formik>

            <ConfirmDialog
                isOpen={deleteDialogOpen}
                type="danger"
                title="Delete room"
                confirmButtonColor="red-600"
                onClose={() => { setDeleteDialogOpen(false); setPendingDeleteId(null) }}
                onRequestClose={() => { setDeleteDialogOpen(false); setPendingDeleteId(null) }}
                onCancel={() => { setDeleteDialogOpen(false); setPendingDeleteId(null) }}
                onConfirm={onDeleteConfirm}
            >
                <p>Are you sure you want to delete this room? This action cannot be undone.</p>
            </ConfirmDialog>
        </div>
    )
}

export default Rooms
