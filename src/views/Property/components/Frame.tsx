import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Tooltip from '@/components/ui/Tooltip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { FormContainer } from '@/components/ui/Form'
import { Field, FieldArray, Form, Formik, getIn } from 'formik'
import type { FieldProps, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { HiOutlineTrash } from 'react-icons/hi'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    fetchPropertyRoofs,
    addPropertyRoof,
    updatePropertyRoof,
    deletePropertyRoof,
} from '@/store/slices/property/propertySlice'
import Alert from '@/components/ui/Alert'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { AiOutlineSave } from 'react-icons/ai'

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

type RoofFormRow = {
    id: string | null
    frame: string
    covering: string
    percentage: string
    insulation: string
}

type RoofFormValues = {
    roofs: RoofFormRow[]
}

const frameOptions: Option[] = [
    { value: 'metal', label: 'Metal' },
    { value: 'wood', label: 'Wood' },
]

const coveringOptions: Option[] = [
    { value: 'tile', label: 'Tile' },
    { value: 'slate', label: 'Slate' },
]

const insulationOptions: Option[] = [
    { value: 'no_insulation', label: 'No Insulation' },
    { value: 'full_insulation', label: 'Full Insulation' },
    { value: 'partial_insulation', label: 'Partial Insulation' },
]

const emptyRow = (): RoofFormRow => ({
    id: null,
    frame: '',
    covering: '',
    percentage: '',
    insulation: '',
})

const roofRowSchema = Yup.object({
    frame: Yup.string().required('Required'),
    covering: Yup.string().required('Required'),
    percentage: Yup.string().required('Required'),
    insulation: Yup.string().required('Required'),
})

const validationSchema = Yup.object({
    roofs: Yup.array().of(roofRowSchema),
})

const Frame: React.FC<EditPropertyProps> = ({ property }) => {
    const dispatch = useAppDispatch()
    const savedRoofs = useAppSelector((state) => state.property.propertyRoofs)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null)
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

    useEffect(() => {
        dispatch(fetchPropertyRoofs(property.id))
    }, [dispatch, property.id])

    const initialValues: RoofFormValues = {
        roofs: (savedRoofs ?? []).map(r => ({
            id: r.id,
            frame: r.frame ?? '',
            covering: r.covering ?? '',
            percentage: r.percentage ?? '',
            insulation: r.insulation ?? '',
        })),
    }

    const onSubmit = async (
        values: RoofFormValues,
        { setSubmitting }: FormikHelpers<RoofFormValues>
    ) => {
        try {
            for (const row of values.roofs) {
                if (row.id) {
                    await dispatch(updatePropertyRoof({
                        id: row.id,
                        frame: row.frame,
                        covering: row.covering,
                        percentage: row.percentage,
                        insulation: row.insulation,
                    })).unwrap()
                } else {
                    await dispatch(addPropertyRoof({
                        property_id: property.id,
                        frame: row.frame,
                        covering: row.covering,
                        percentage: row.percentage,
                        insulation: row.insulation,
                    })).unwrap()
                }
            }
            toast.push(
                <Notification title="Roof updated" type="success" />,
                { placement: 'top-center' }
            )
        } catch {
            toast.push(
                <Notification title="Save failed" type="danger" />,
                { placement: 'top-center' }
            )
        } finally {
            setSubmitting(false)
        }
    }

    const requestDelete = (index: number, id: string | null) => {
        setPendingDeleteIndex(index)
        setPendingDeleteId(id)
        setDeleteDialogOpen(true)
    }

    const onDeleteCancel = () => {
        setDeleteDialogOpen(false)
        setPendingDeleteIndex(null)
        setPendingDeleteId(null)
    }

    const fieldError = (errors: object, touched: object, name: string) => {
        const error = getIn(errors, name)
        const touch = getIn(touched, name)
        return touch && error ? error : null
    }

    return (
        <div>
            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
            >
                {({ values, errors, touched, isSubmitting }) => {
                    const totalPercentage = values.roofs.reduce(
                        (sum, r) => sum + (parseFloat(r.percentage) || 0), 0
                    )
                    return (
                        <Form>
                            <FormContainer>
                                <FieldArray name="roofs">
                                    {({ push, remove }) => {
                                        const onDeleteConfirm = () => {
                                            setDeleteDialogOpen(false)
                                            if (pendingDeleteIndex === null) return

                                            if (pendingDeleteId) {
                                                dispatch(deletePropertyRoof(pendingDeleteId))
                                            }
                                            remove(pendingDeleteIndex)
                                            setPendingDeleteIndex(null)
                                            setPendingDeleteId(null)
                                        }

                                        return (
                                            <>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h5 className="font-semibold">Roof</h5>
                                                    <Button
                                                        size="sm"
                                                        variant="solid"
                                                        type="button"
                                                        onClick={() => push(emptyRow())}
                                                    >
                                                        Add Roof
                                                    </Button>
                                                </div>

                                                {values.roofs.length > 0 && (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="border-b border-gray-200 dark:border-gray-600">
                                                                    <th className="text-left py-2 pr-3 font-medium text-gray-600 dark:text-gray-400 w-1/4">Frame</th>
                                                                    <th className="text-left py-2 pr-3 font-medium text-gray-600 dark:text-gray-400 w-1/4">Covering</th>
                                                                    <th className="text-left py-2 pr-3 font-medium text-gray-600 dark:text-gray-400 w-1/6">Percentage</th>
                                                                    <th className="text-left py-2 font-medium text-gray-600 dark:text-gray-400 w-1/4">Insulation</th>
                                                                    <th className="py-2 w-10"></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {values.roofs.map((row, index) => (
                                                                    <tr key={row.id ?? `new-${index}`} className="border-b border-gray-100 dark:border-gray-700 align-top">
                                                                        <td className="py-2 pr-3">
                                                                            <Field name={`roofs[${index}].frame`}>
                                                                                {({ field, form }: FieldProps) => (
                                                                                    <div>
                                                                                        <Select<Option>
                                                                                            options={frameOptions}
                                                                                            value={frameOptions.find(o => o.value === field.value) ?? null}
                                                                                            onChange={option => form.setFieldValue(field.name, option?.value ?? '')}
                                                                                            placeholder="Select..."
                                                                                            size="sm"
                                                                                            menuPortalTarget={document.body}
                                                                                            menuPosition="fixed"
                                                                                        />
                                                                                        {fieldError(errors, touched, `roofs[${index}].frame`) && (
                                                                                            <span className="text-red-500 text-xs mt-1 block">
                                                                                                {fieldError(errors, touched, `roofs[${index}].frame`)}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </Field>
                                                                        </td>
                                                                        <td className="py-2 pr-3">
                                                                            <Field name={`roofs[${index}].covering`}>
                                                                                {({ field, form }: FieldProps) => (
                                                                                    <div>
                                                                                        <Select<Option>
                                                                                            options={coveringOptions}
                                                                                            value={coveringOptions.find(o => o.value === field.value) ?? null}
                                                                                            onChange={option => form.setFieldValue(field.name, option?.value ?? '')}
                                                                                            placeholder="Select..."
                                                                                            size="sm"
                                                                                            menuPortalTarget={document.body}
                                                                                            menuPosition="fixed"
                                                                                        />
                                                                                        {fieldError(errors, touched, `roofs[${index}].covering`) && (
                                                                                            <span className="text-red-500 text-xs mt-1 block">
                                                                                                {fieldError(errors, touched, `roofs[${index}].covering`)}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </Field>
                                                                        </td>
                                                                        <td className="py-2 pr-3">
                                                                            <Field name={`roofs[${index}].percentage`}>
                                                                                {({ field, form }: FieldProps) => (
                                                                                    <div>
                                                                                        <Input
                                                                                            size="sm"
                                                                                            type="text"
                                                                                            placeholder="%"
                                                                                            value={field.value}
                                                                                            onChange={e => form.setFieldValue(field.name, e.target.value)}
                                                                                        />
                                                                                        {fieldError(errors, touched, `roofs[${index}].percentage`) && (
                                                                                            <span className="text-red-500 text-xs mt-1 block">
                                                                                                {fieldError(errors, touched, `roofs[${index}].percentage`)}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </Field>
                                                                        </td>
                                                                        <td className="py-2">
                                                                            <Field name={`roofs[${index}].insulation`}>
                                                                                {({ field, form }: FieldProps) => (
                                                                                    <div>
                                                                                        <Select<Option>
                                                                                            options={insulationOptions}
                                                                                            value={insulationOptions.find(o => o.value === field.value) ?? null}
                                                                                            onChange={option => form.setFieldValue(field.name, option?.value ?? '')}
                                                                                            placeholder="Select..."
                                                                                            size="sm"
                                                                                            menuPortalTarget={document.body}
                                                                                            menuPosition="fixed"
                                                                                        />
                                                                                        {fieldError(errors, touched, `roofs[${index}].insulation`) && (
                                                                                            <span className="text-red-500 text-xs mt-1 block">
                                                                                                {fieldError(errors, touched, `roofs[${index}].insulation`)}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </Field>
                                                                        </td>
                                                                        <td className="py-2 text-lg text-right">
                                                                            <Tooltip title="Delete">
                                                                                <span
                                                                                    className="cursor-pointer p-2 hover:text-red-500"
                                                                                    onClick={() => requestDelete(index, row.id)}
                                                                                >
                                                                                    <HiOutlineTrash />
                                                                                </span>
                                                                            </Tooltip>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}

                                                {values.roofs.length === 0 && (
                                                    <p className="text-gray-400 text-sm">No roof entries. Click "Add Roof" to add one.</p>
                                                )}

                                                {values.roofs.length > 0 && totalPercentage > 100 && (
                                                    <Alert
                                                        type="warning"
                                                        showIcon
                                                        className="mt-4"
                                                    >
                                                        Total percentage is {totalPercentage}% — it cannot exceed 100%.
                                                    </Alert>
                                                )}

                                                <ConfirmDialog
                                                    isOpen={deleteDialogOpen}
                                                    type="danger"
                                                    title="Delete roof"
                                                    confirmButtonColor="red-600"
                                                    onClose={onDeleteCancel}
                                                    onRequestClose={onDeleteCancel}
                                                    onCancel={onDeleteCancel}
                                                    onConfirm={onDeleteConfirm}
                                                >
                                                    <p>
                                                        Are you sure you want to delete this roof entry? This action cannot be undone.
                                                    </p>
                                                </ConfirmDialog>
                                            </>
                                        )
                                    }}
                                </FieldArray>
                            </FormContainer>
                            <div className="sticky bottom-0 z-10 -mx-8 px-8 py-4 flex items-center justify-end border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                <Button
                                    size="sm"
                                    variant="solid"
                                    loading={isSubmitting}
                                    icon={<AiOutlineSave />}
                                    type="submit"
                                    disabled={totalPercentage > 100}
                                >
                                    Save
                                </Button>
                            </div>
                        </Form>
                    )
                }}
            </Formik>
        </div>
    )
}

export default Frame