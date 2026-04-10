import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Drawer from '@/components/ui/Drawer'
import Tooltip from '@/components/ui/Tooltip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { FormContainer, FormItem } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import type { FieldProps, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchPropertyRooms } from '@/store/slices/property/propertyRoomSlice'
import {
    fetchPropertyWindows,
    addPropertyWindow,
    updatePropertyWindow,
    deletePropertyWindow,
} from '@/store/slices/property/propertyWindowsSlice'
import type { PropertyWindow } from '@/store/slices/property/propertyWindowsSlice'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import FormDesription from './FormDesription'

type Property = {
    id: string
    street?: string
    postcode?: string
}

type EditPropertyProps = {
    property: Property
}

type WindowFormValues = {
    window_number: string
    type: string
    frame: string
    area_m2: string
    room_volume_m3: string
    date_of_installation: string
}

type Option = { value: string; label: string }

const windowTypeOptions: Option[] = [
    { value: 'single', label: 'Single Glazed' },
    { value: 'double', label: 'Double Glazed' },
    { value: 'triple', label: 'Triple Glazed' },
    { value: 'bay', label: 'Bay' },
    { value: 'skylight', label: 'Skylight' },
    { value: 'velux', label: 'Velux' },
    { value: 'other', label: 'Other' },
]

const frameTypeOptions: Option[] = [
    { value: 'upvc', label: 'uPVC' },
    { value: 'timber', label: 'Timber' },
    { value: 'aluminium', label: 'Aluminium' },
    { value: 'composite', label: 'Composite' },
    { value: 'other', label: 'Other' },
]

const roomTypeLabels: Record<string, string> = {
    bedroom: 'Bedroom',
    bathroom: 'Bathroom',
    kitchen: 'Kitchen',
    living_room: 'Living Room',
    dining_room: 'Dining Room',
    hallway: 'Hallway',
    garage: 'Garage',
    utility: 'Utility',
    other: 'Other',
}

const validationSchema = Yup.object({
    window_number: Yup.number().typeError('Must be a number').nullable(),
    type: Yup.string().required('Required'),
    frame: Yup.string(),
    area_m2: Yup.number().typeError('Must be a number').nullable(),
    room_volume_m3: Yup.number().typeError('Must be a number').nullable(),
})

const emptyForm: WindowFormValues = { window_number: '', type: '', frame: '', area_m2: '', room_volume_m3: '', date_of_installation: '' }

const Windows: React.FC<EditPropertyProps> = ({ property }) => {
    const dispatch = useAppDispatch()
    const rooms = useAppSelector((state) => state.propertyRoom.propertyRooms)
    const windows = useAppSelector((state) => state.propertyWindows.propertyWindows)

    const [drawerOpen, setDrawerOpen] = useState(false)
    const [activeRoomId, setActiveRoomId] = useState<string | null>(null)
    const [editingWindow, setEditingWindow] = useState<PropertyWindow | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

    useEffect(() => {
        dispatch(fetchPropertyRooms(property.id))
        dispatch(fetchPropertyWindows(property.id))
    }, [dispatch, property.id])

    const windowsForRoom = (roomId: string) =>
        windows.filter(w => w.room_id === roomId)

    const openAdd = (roomId: string) => {
        setEditingWindow(null)
        setActiveRoomId(roomId)
        setDrawerOpen(true)
    }

    const openEdit = (win: PropertyWindow) => {
        setEditingWindow(win)
        setActiveRoomId(win.room_id)
        setDrawerOpen(true)
    }

    const closeDrawer = (resetForm: () => void) => {
        setDrawerOpen(false)
        setActiveRoomId(null)
        setEditingWindow(null)
        resetForm()
    }

    const onSubmit = async (
        values: WindowFormValues,
        { setSubmitting, resetForm }: FormikHelpers<WindowFormValues>
    ) => {
        const fields = {
            window_number: values.window_number !== '' ? parseInt(values.window_number) : null,
            type: values.type || null,
            frame: values.frame || null,
            area_m2: values.area_m2 !== '' ? parseFloat(values.area_m2) : null,
            room_volume_m3: values.room_volume_m3 !== '' ? parseFloat(values.room_volume_m3) : null,
            date_of_installation: values.date_of_installation || null,
        }
        try {
            if (editingWindow) {
                await dispatch(updatePropertyWindow({ id: editingWindow.id, ...fields })).unwrap()
                toast.push(<Notification title="Window updated" type="success" />, { placement: 'top-center' })
            } else {
                if (!activeRoomId) return
                await dispatch(addPropertyWindow({ property_id: property.id, room_id: activeRoomId, ...fields })).unwrap()
                toast.push(<Notification title="Window added" type="success" />, { placement: 'top-center' })
            }
            resetForm()
            setDrawerOpen(false)
            setActiveRoomId(null)
            setEditingWindow(null)
        } catch {
            toast.push(<Notification title="Failed to save window" type="danger" />, { placement: 'top-center' })
        } finally {
            setSubmitting(false)
        }
    }

    const requestDelete = (id: string) => {
        setPendingDeleteId(id)
        setDeleteDialogOpen(true)
    }

    const onDeleteConfirm = async () => {
        if (!pendingDeleteId) return
        try {
            await dispatch(deletePropertyWindow(pendingDeleteId)).unwrap()
            toast.push(<Notification title="Window deleted" type="success" />, { placement: 'top-center' })
        } catch {
            toast.push(<Notification title="Failed to delete window" type="danger" />, { placement: 'top-center' })
        } finally {
            setDeleteDialogOpen(false)
            setPendingDeleteId(null)
        }
    }

    return (
        <div>
            <FormDesription
                title="Windows"
                desc="Windows installed in each room of this property."
            />

            {rooms.length === 0 ? (
                <p className="text-sm text-gray-400 mt-4">No rooms found. Add rooms in the Rooms tab first.</p>
            ) : (
                <div className="flex flex-col gap-6 mt-4">
                    {rooms.map((room) => {
                        const roomWindows = windowsForRoom(room.id)
                        return (
                            <div key={room.id}>
                                <div className="flex items-center justify-between mb-2">
                                    <h6 className="font-semibold text-sm">
                                        {room.room_number ? `Room ${room.room_number}` : 'Room'}
                                        {room.type ? ` — ${roomTypeLabels[room.type] ?? room.type}` : ''}
                                    </h6>
                                    <Button size="xs" variant="solid" onClick={() => openAdd(room.id)}>
                                        Add Window
                                    </Button>
                                </div>
                                {roomWindows.length === 0 ? (
                                    <p className="text-xs text-gray-400">No windows in this room.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-200 dark:border-gray-600">
                                                    <th className="text-left py-2 pr-3 font-medium text-gray-600 dark:text-gray-400">#</th>
                                                    <th className="text-left py-2 pr-3 font-medium text-gray-600 dark:text-gray-400">Type</th>
                                                    <th className="text-left py-2 pr-3 font-medium text-gray-600 dark:text-gray-400">Frame</th>
                                                    <th className="text-left py-2 pr-3 font-medium text-gray-600 dark:text-gray-400">Area (m²)</th>
                                                    <th className="text-left py-2 pr-3 font-medium text-gray-600 dark:text-gray-400">Room Vol (m³)</th>
                                                    <th className="py-2 w-12"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {roomWindows.map((w) => (
                                                    <tr key={w.id} className="border-b border-gray-100 dark:border-gray-700">
                                                        <td className="py-2 pr-3">{w.window_number ?? '—'}</td>
                                                        <td className="py-2 pr-3">{windowTypeOptions.find(o => o.value === w.type)?.label ?? w.type ?? '—'}</td>
                                                        <td className="py-2 pr-3">{frameTypeOptions.find(o => o.value === w.frame)?.label ?? w.frame ?? '—'}</td>
                                                        <td className="py-2 pr-3">{w.area_m2 ?? '—'}</td>
                                                        <td className="py-2 pr-3">{w.room_volume_m3 ?? '—'}</td>
                                                        <td className="py-2">
                                                            <div className="flex justify-end gap-1">
                                                                <Tooltip title="Edit">
                                                                    <span
                                                                        className="cursor-pointer p-1 hover:text-blue-500 text-lg"
                                                                        onClick={() => openEdit(w)}
                                                                    >
                                                                        <HiOutlinePencil />
                                                                    </span>
                                                                </Tooltip>
                                                                <Tooltip title="Delete">
                                                                    <span
                                                                        className="cursor-pointer p-1 hover:text-red-500 text-lg"
                                                                        onClick={() => requestDelete(w.id)}
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
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Add / Edit Window Drawer */}
            <Formik
                enableReinitialize
                initialValues={editingWindow ? {
                    window_number: editingWindow.window_number?.toString() ?? '',
                    type: editingWindow.type ?? '',
                    frame: editingWindow.frame ?? '',
                    area_m2: editingWindow.area_m2?.toString() ?? '',
                    room_volume_m3: editingWindow.room_volume_m3?.toString() ?? '',
                    date_of_installation: editingWindow.date_of_installation?.toString() ?? '',
                } : emptyForm}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
            >
                {({ errors, touched, isSubmitting, resetForm, values, setFieldValue }) => (
                    <Drawer
                        title={editingWindow ? 'Edit Window' : 'Add Window'}
                        isOpen={drawerOpen}
                        onClose={() => closeDrawer(resetForm)}
                        footer={
                            <div className="flex justify-end gap-2">
                                <Button size="sm" onClick={() => closeDrawer(resetForm)}>Cancel</Button>
                                <Button
                                    size="sm"
                                    variant="solid"
                                    loading={isSubmitting}
                                    form="window-form"
                                    type="submit"
                                >
                                    Save
                                </Button>
                            </div>
                        }
                    >
                        <Form id="window-form">
                            <FormContainer>
                                <FormItem
                                    label="Window Number"
                                    invalid={!!errors.window_number && touched.window_number}
                                    errorMessage={errors.window_number}
                                >
                                    <Field name="window_number">
                                        {({ field }: FieldProps) => (
                                            <Input size="sm" placeholder="e.g. 1" {...field} />
                                        )}
                                    </Field>
                                </FormItem>
                                <FormItem
                                    label="Type"
                                    invalid={!!errors.type && touched.type}
                                    errorMessage={errors.type}
                                >
                                    <Select<Option>
                                        options={windowTypeOptions}
                                        value={windowTypeOptions.find(o => o.value === values.type) ?? null}
                                        onChange={(opt) => setFieldValue('type', opt?.value ?? '')}
                                        placeholder="Select type..."
                                        size="sm"
                                    />
                                </FormItem>
                                <FormItem
                                    label="Frame"
                                    invalid={!!errors.frame && touched.frame}
                                    errorMessage={errors.frame}
                                >
                                    <Select<Option>
                                        options={frameTypeOptions}
                                        value={frameTypeOptions.find(o => o.value === values.frame) ?? null}
                                        onChange={(opt) => setFieldValue('frame', opt?.value ?? '')}
                                        placeholder="Select frame..."
                                        size="sm"
                                    />
                                </FormItem>
                                <FormItem
                                    label="Area (m²)"
                                    invalid={!!errors.area_m2 && touched.area_m2}
                                    errorMessage={errors.area_m2}
                                >
                                    <Field name="area_m2">
                                        {({ field }: FieldProps) => (
                                            <Input size="sm" placeholder="e.g. 1.5" {...field} />
                                        )}
                                    </Field>
                                </FormItem>
                                <FormItem
                                    label="Room Volume (m³)"
                                    invalid={!!errors.room_volume_m3 && touched.room_volume_m3}
                                    errorMessage={errors.room_volume_m3}
                                >
                                    <Field name="room_volume_m3">
                                        {({ field }: FieldProps) => (
                                            <Input size="sm" placeholder="e.g. 30.5" {...field} />
                                        )}
                                    </Field>
                                </FormItem>
                                <FormItem
                                    label="Date of Installation"
                                    invalid={!!errors.date_of_installation && touched.date_of_installation}
                                    errorMessage={errors.date_of_installation}
                                >
                                    <Field name="date_of_installation">
                                        {({ field }: FieldProps) => (
                                            <Input size="sm" {...field} />
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
                title="Delete window"
                confirmButtonColor="red-600"
                onClose={() => { setDeleteDialogOpen(false); setPendingDeleteId(null) }}
                onRequestClose={() => { setDeleteDialogOpen(false); setPendingDeleteId(null) }}
                onCancel={() => { setDeleteDialogOpen(false); setPendingDeleteId(null) }}
                onConfirm={onDeleteConfirm}
            >
                <p>Are you sure you want to delete this window? This action cannot be undone.</p>
            </ConfirmDialog>
        </div>
    )
}

export default Windows
