import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import DatePicker from '@/components/ui/DatePicker'
import Drawer from '@/components/ui/Drawer'
import Tooltip from '@/components/ui/Tooltip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { FormContainer, FormItem } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import type { FieldProps, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { AiOutlineSave } from 'react-icons/ai'
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    fetchPropertyHeating,
    savePropertyHeating,
} from '@/store/slices/property/propertyHeatingSlice'
import {
    fetchPropertyRooms,
    addRadiator,
    updateRadiator,
    deleteRadiator,
} from '@/store/slices/property/propertyRoomSlice'
import type { Radiator } from '@/store/slices/property/propertyRoomSlice'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import FormDesription from './FormDesription'
import FormRow from './FormRow'

type Property = {
    id: string
    street?: string
    postcode?: string
}

type EditPropertyProps = {
    property: Property
}

type HeatingFormValues = {
    energy_source: string
    type: string
    manufacturer: string
    model: string
    installer: string
    installation_date: Date | null
    warranty_years: string
    warranty_expiry_date: Date | null
}

type RadiatorFormValues = {
    type: string
    material: string
    height_mm: string
    width_mm: string
    output_watts: string
}

type Option = { value: string; label: string }

const radiatorTypeOptions: Option[] = [
    { value: 'panel', label: 'Panel' },
    { value: 'column', label: 'Column' },
    { value: 'towel_rail', label: 'Towel Rail' },
    { value: 'baseboard', label: 'Baseboard' },
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

const heatingValidation = Yup.object({
    energy_source: Yup.string(),
    type: Yup.string(),
    manufacturer: Yup.string(),
    model: Yup.string(),
    installer: Yup.string(),
    installation_date: Yup.date().nullable(),
    warranty_years: Yup.number().typeError('Must be a number').nullable(),
    warranty_expiry_date: Yup.date().nullable(),
})

const radiatorValidation = Yup.object({
    type: Yup.string().required('Required'),
    material: Yup.string(),
    height_mm: Yup.number().typeError('Must be a number').nullable(),
    width_mm: Yup.number().typeError('Must be a number').nullable(),
    output_watts: Yup.number().typeError('Must be a number').nullable(),
})

const emptyRadiatorForm: RadiatorFormValues = { type: '', material: '', height_mm: '', width_mm: '', output_watts: '' }

const Heating: React.FC<EditPropertyProps> = ({ property }) => {
    const dispatch = useAppDispatch()
    const heating = useAppSelector((state) => state.propertyHeating.propertyHeating)
    const rooms = useAppSelector((state) => state.propertyRoom.propertyRooms)

    const [drawerOpen, setDrawerOpen] = useState(false)
    const [activeRoomId, setActiveRoomId] = useState<string | null>(null)
    const [editingRadiator, setEditingRadiator] = useState<Radiator | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [pendingDelete, setPendingDelete] = useState<{ id: string; room_id: string } | null>(null)

    useEffect(() => {
        dispatch(fetchPropertyHeating(property.id))
        dispatch(fetchPropertyRooms(property.id))
    }, [dispatch, property.id])

    const heatingInitialValues: HeatingFormValues = {
        energy_source: heating?.energy_source ?? '',
        type: heating?.type ?? '',
        manufacturer: heating?.manufacturer ?? '',
        model: heating?.model ?? '',
        installer: heating?.installer ?? '',
        installation_date: heating?.installation_date ? new Date(heating.installation_date) : null,
        warranty_years: heating?.warranty_years?.toString() ?? '',
        warranty_expiry_date: heating?.warranty_expiry_date ? new Date(heating.warranty_expiry_date) : null,
    }

    const onHeatingSubmit = async (
        values: HeatingFormValues,
        { setSubmitting }: FormikHelpers<HeatingFormValues>
    ) => {
        try {
            await dispatch(savePropertyHeating({
                ...(heating?.id ? { id: heating.id } : {}),
                property_id: property.id,
                energy_source: values.energy_source || null,
                type: values.type || null,
                manufacturer: values.manufacturer || null,
                model: values.model || null,
                installer: values.installer || null,
                installation_date: values.installation_date
                    ? values.installation_date.toISOString().split('T')[0]
                    : null,
                warranty_years: values.warranty_years !== '' ? parseInt(values.warranty_years) : null,
                warranty_expiry_date: values.warranty_expiry_date
                    ? values.warranty_expiry_date.toISOString().split('T')[0]
                    : null,
            })).unwrap()

            toast.push(<Notification title="Heating saved" type="success" />, { placement: 'top-center' })
        } catch {
            toast.push(<Notification title="Save failed" type="danger" />, { placement: 'top-center' })
        } finally {
            setSubmitting(false)
        }
    }

    const openAddRadiator = (roomId: string) => {
        setEditingRadiator(null)
        setActiveRoomId(roomId)
        setDrawerOpen(true)
    }

    const openEditRadiator = (radiator: Radiator) => {
        setEditingRadiator(radiator)
        setActiveRoomId(radiator.room_id)
        setDrawerOpen(true)
    }

    const closeDrawer = (resetForm: () => void) => {
        setDrawerOpen(false)
        setActiveRoomId(null)
        setEditingRadiator(null)
        resetForm()
    }

    const onRadiatorSubmit = async (
        values: RadiatorFormValues,
        { setSubmitting, resetForm }: FormikHelpers<RadiatorFormValues>
    ) => {
        const fields = {
            type: values.type || null,
            material: values.material || null,
            height_mm: values.height_mm !== '' ? parseInt(values.height_mm) : null,
            width_mm: values.width_mm !== '' ? parseInt(values.width_mm) : null,
            output_watts: values.output_watts !== '' ? parseInt(values.output_watts) : null,
        }
        try {
            if (editingRadiator) {
                await dispatch(updateRadiator({ id: editingRadiator.id, ...fields })).unwrap()
                toast.push(<Notification title="Radiator updated" type="success" />, { placement: 'top-center' })
            } else {
                if (!activeRoomId) return
                await dispatch(addRadiator({ property_id: property.id, room_id: activeRoomId, ...fields })).unwrap()
                toast.push(<Notification title="Radiator added" type="success" />, { placement: 'top-center' })
            }
            resetForm()
            setDrawerOpen(false)
            setActiveRoomId(null)
            setEditingRadiator(null)
        } catch {
            toast.push(<Notification title="Failed to save radiator" type="danger" />, { placement: 'top-center' })
        } finally {
            setSubmitting(false)
        }
    }

    const requestDelete = (radiator: Radiator) => {
        setPendingDelete({ id: radiator.id, room_id: radiator.room_id })
        setDeleteDialogOpen(true)
    }

    const onDeleteConfirm = async () => {
        if (!pendingDelete) return
        try {
            await dispatch(deleteRadiator(pendingDelete)).unwrap()
            toast.push(<Notification title="Radiator deleted" type="success" />, { placement: 'top-center' })
        } catch {
            toast.push(<Notification title="Failed to delete radiator" type="danger" />, { placement: 'top-center' })
        } finally {
            setDeleteDialogOpen(false)
            setPendingDelete(null)
        }
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Heating System */}
            <Formik
                enableReinitialize
                initialValues={heatingInitialValues}
                validationSchema={heatingValidation}
                onSubmit={onHeatingSubmit}
            >
                {({ errors, touched, isSubmitting, values, setFieldValue }) => (
                    <Form>
                        <FormContainer>
                            <FormDesription
                                title="Heating"
                                desc="Heating system details for this property."
                            />
                            <FormRow<HeatingFormValues> name="energy_source" label="Energy Source" errors={errors} touched={touched}>
                                <Field name="energy_source">
                                    {({ field }: FieldProps) => (
                                        <Input size="sm" placeholder="e.g. Gas, Electric, Oil" {...field} />
                                    )}
                                </Field>
                            </FormRow>
                            <FormRow<HeatingFormValues> name="type" label="Type" errors={errors} touched={touched}>
                                <Field name="type">
                                    {({ field }: FieldProps) => (
                                        <Input size="sm" placeholder="e.g. Combi Boiler, Heat Pump" {...field} />
                                    )}
                                </Field>
                            </FormRow>
                            <FormRow<HeatingFormValues> name="manufacturer" label="Manufacturer" errors={errors} touched={touched}>
                                <Field name="manufacturer">
                                    {({ field }: FieldProps) => (
                                        <Input size="sm" placeholder="Manufacturer" {...field} />
                                    )}
                                </Field>
                            </FormRow>
                            <FormRow<HeatingFormValues> name="model" label="Model" errors={errors} touched={touched}>
                                <Field name="model">
                                    {({ field }: FieldProps) => (
                                        <Input size="sm" placeholder="Model" {...field} />
                                    )}
                                </Field>
                            </FormRow>
                            <FormRow<HeatingFormValues> name="installer" label="Installer" errors={errors} touched={touched}>
                                <Field name="installer">
                                    {({ field }: FieldProps) => (
                                        <Input size="sm" placeholder="Installer" {...field} />
                                    )}
                                </Field>
                            </FormRow>
                            <FormRow<HeatingFormValues> name="installation_date" label="Installation Date" errors={errors} touched={touched}>
                                <DatePicker
                                    value={values.installation_date}
                                    onChange={(date) => setFieldValue('installation_date', date)}
                                />
                            </FormRow>
                            <FormRow<HeatingFormValues> name="warranty_years" label="Warranty (Years)" errors={errors} touched={touched}>
                                <Field name="warranty_years">
                                    {({ field }: FieldProps) => (
                                        <Input size="sm" placeholder="e.g. 5" {...field} />
                                    )}
                                </Field>
                            </FormRow>
                            <FormRow<HeatingFormValues> name="warranty_expiry_date" label="Warranty Expiry" errors={errors} touched={touched} border={false}>
                                <DatePicker
                                    value={values.warranty_expiry_date}
                                    onChange={(date) => setFieldValue('warranty_expiry_date', date)}
                                />
                            </FormRow>
                        </FormContainer>
                        <div className="mt-4 flex justify-end">
                            <Button size="sm" variant="solid" loading={isSubmitting} icon={<AiOutlineSave />} type="submit">
                                Save
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>

            {/* Radiators */}
            <div>
                <FormDesription
                    title="Radiators"
                    desc="Radiators installed in each room of this property."
                />
                {rooms.length === 0 ? (
                    <p className="text-sm text-gray-400 mt-4">No rooms found. Add rooms in the Rooms tab first.</p>
                ) : (
                    <div className="flex flex-col gap-6 mt-4">
                        {rooms.map((room) => (
                            <div key={room.id}>
                                <div className="flex items-center justify-between mb-2">
                                    <h6 className="font-semibold text-sm">
                                        {room.room_number ? `Room ${room.room_number}` : 'Room'}{room.type ? ` — ${roomTypeLabels[room.type] ?? room.type}` : ''}
                                    </h6>
                                    <Button size="xs" variant="solid" onClick={() => openAddRadiator(room.id)}>
                                        Add Radiator
                                    </Button>
                                </div>
                                {room.radiators.length === 0 ? (
                                    <p className="text-xs text-gray-400">No radiators in this room.</p>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-600">
                                                <th className="text-left py-2 pr-3 font-medium text-gray-600 dark:text-gray-400">Type</th>
                                                <th className="text-left py-2 pr-3 font-medium text-gray-600 dark:text-gray-400">Material</th>
                                                <th className="text-left py-2 pr-3 font-medium text-gray-600 dark:text-gray-400">H (mm)</th>
                                                <th className="text-left py-2 pr-3 font-medium text-gray-600 dark:text-gray-400">W (mm)</th>
                                                <th className="text-left py-2 pr-3 font-medium text-gray-600 dark:text-gray-400">Output (W)</th>
                                                <th className="py-2 w-12"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {room.radiators.map((rad) => (
                                                <tr key={rad.id} className="border-b border-gray-100 dark:border-gray-700">
                                                    <td className="py-2 pr-3">{radiatorTypeOptions.find(o => o.value === rad.type)?.label ?? rad.type ?? '—'}</td>
                                                    <td className="py-2 pr-3">{rad.material ?? '—'}</td>
                                                    <td className="py-2 pr-3">{rad.height_mm ?? '—'}</td>
                                                    <td className="py-2 pr-3">{rad.width_mm ?? '—'}</td>
                                                    <td className="py-2 pr-3">{rad.output_watts ?? '—'}</td>
                                                    <td className="py-2">
                                                        <div className="flex justify-end gap-1">
                                                            <Tooltip title="Edit">
                                                                <span
                                                                    className="cursor-pointer p-1 hover:text-blue-500 text-lg"
                                                                    onClick={() => openEditRadiator(rad)}
                                                                >
                                                                    <HiOutlinePencil />
                                                                </span>
                                                            </Tooltip>
                                                            <Tooltip title="Delete">
                                                                <span
                                                                    className="cursor-pointer p-1 hover:text-red-500 text-lg"
                                                                    onClick={() => requestDelete(rad)}
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
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add / Edit Radiator Drawer */}
            <Formik
                enableReinitialize
                initialValues={editingRadiator ? {
                    type: editingRadiator.type ?? '',
                    material: editingRadiator.material ?? '',
                    height_mm: editingRadiator.height_mm?.toString() ?? '',
                    width_mm: editingRadiator.width_mm?.toString() ?? '',
                    output_watts: editingRadiator.output_watts?.toString() ?? '',
                } : emptyRadiatorForm}
                validationSchema={radiatorValidation}
                onSubmit={onRadiatorSubmit}
            >
                {({ errors, touched, isSubmitting, resetForm, values, setFieldValue }) => (
                    <Drawer
                        title={editingRadiator ? 'Edit Radiator' : 'Add Radiator'}
                        isOpen={drawerOpen}
                        onClose={() => closeDrawer(resetForm)}
                        footer={
                            <div className="flex justify-end gap-2">
                                <Button size="sm" onClick={() => closeDrawer(resetForm)}>Cancel</Button>
                                <Button
                                    size="sm"
                                    variant="solid"
                                    loading={isSubmitting}
                                    form="radiator-form"
                                    type="submit"
                                >
                                    Save
                                </Button>
                            </div>
                        }
                    >
                        <Form id="radiator-form">
                            <FormContainer>
                                <FormItem
                                    label="Type"
                                    invalid={!!errors.type && touched.type}
                                    errorMessage={errors.type}
                                >
                                    <Select<Option>
                                        options={radiatorTypeOptions}
                                        value={radiatorTypeOptions.find(o => o.value === values.type) ?? null}
                                        onChange={(opt) => setFieldValue('type', opt?.value ?? '')}
                                        placeholder="Select type..."
                                        size="sm"
                                    />
                                </FormItem>
                                <FormItem
                                    label="Material"
                                    invalid={!!errors.material && touched.material}
                                    errorMessage={errors.material}
                                >
                                    <Field name="material">
                                        {({ field }: FieldProps) => (
                                            <Input size="sm" placeholder="e.g. Steel, Cast Iron" {...field} />
                                        )}
                                    </Field>
                                </FormItem>
                                <FormItem
                                    label="Height (mm)"
                                    invalid={!!errors.height_mm && touched.height_mm}
                                    errorMessage={errors.height_mm}
                                >
                                    <Field name="height_mm">
                                        {({ field }: FieldProps) => (
                                            <Input size="sm" placeholder="e.g. 600" {...field} />
                                        )}
                                    </Field>
                                </FormItem>
                                <FormItem
                                    label="Width (mm)"
                                    invalid={!!errors.width_mm && touched.width_mm}
                                    errorMessage={errors.width_mm}
                                >
                                    <Field name="width_mm">
                                        {({ field }: FieldProps) => (
                                            <Input size="sm" placeholder="e.g. 1000" {...field} />
                                        )}
                                    </Field>
                                </FormItem>
                                <FormItem
                                    label="Output (Watts)"
                                    invalid={!!errors.output_watts && touched.output_watts}
                                    errorMessage={errors.output_watts}
                                >
                                    <Field name="output_watts">
                                        {({ field }: FieldProps) => (
                                            <Input size="sm" placeholder="e.g. 1500" {...field} />
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
                title="Delete radiator"
                confirmButtonColor="red-600"
                onClose={() => { setDeleteDialogOpen(false); setPendingDelete(null) }}
                onRequestClose={() => { setDeleteDialogOpen(false); setPendingDelete(null) }}
                onCancel={() => { setDeleteDialogOpen(false); setPendingDelete(null) }}
                onConfirm={onDeleteConfirm}
            >
                <p>Are you sure you want to delete this radiator? This action cannot be undone.</p>
            </ConfirmDialog>
        </div>
    )
}

export default Heating
