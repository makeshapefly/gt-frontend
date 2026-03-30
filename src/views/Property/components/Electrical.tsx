import { useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import DatePicker from '@/components/ui/DatePicker'
import { FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import type { FieldProps, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { AiOutlineSave } from 'react-icons/ai'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    fetchPropertyElectrical,
    savePropertyElectrical,
} from '@/store/slices/property/propertyElectricalSlice'
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

type ElectricalFormValues = {
    mpan: string
    location: string
    manufacturer: string
    model: string
    installer: string
    installation_date: Date | null
    warranty_years: string
    warranty_expiry_date: Date | null
}

const validationSchema = Yup.object({
    mpan: Yup.string(),
    location: Yup.string(),
    manufacturer: Yup.string(),
    model: Yup.string(),
    installer: Yup.string(),
    installation_date: Yup.date().nullable(),
    warranty_years: Yup.number().typeError('Must be a number').nullable(),
    warranty_expiry_date: Yup.date().nullable(),
})

const Electrical: React.FC<EditPropertyProps> = ({ property }) => {
    const dispatch = useAppDispatch()
    const electrical = useAppSelector((state) => state.propertyElectrical.propertyElectrical)

    useEffect(() => {
        dispatch(fetchPropertyElectrical(property.id))
    }, [dispatch, property.id])

    const initialValues: ElectricalFormValues = {
        mpan: electrical?.mpan ?? '',
        location: electrical?.location ?? '',
        manufacturer: electrical?.manufacturer ?? '',
        model: electrical?.model ?? '',
        installer: electrical?.installer ?? '',
        installation_date: electrical?.installation_date ? new Date(electrical.installation_date) : null,
        warranty_years: electrical?.warranty_years?.toString() ?? '',
        warranty_expiry_date: electrical?.warranty_expiry_date ? new Date(electrical.warranty_expiry_date) : null,
    }

    const onSubmit = async (
        values: ElectricalFormValues,
        { setSubmitting }: FormikHelpers<ElectricalFormValues>
    ) => {
        try {
            await dispatch(savePropertyElectrical({
                ...(electrical?.id ? { id: electrical.id } : {}),
                property_id: property.id,
                mpan: values.mpan || null,
                location: values.location || null,
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

            toast.push(
                <Notification title="Electrical saved" type="success" />,
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

    return (
        <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
        >
            {({ errors, touched, isSubmitting, values, setFieldValue }) => (
                <Form>
                    <FormContainer>
                        <FormDesription
                            title="Electrical"
                            desc="Electrical supply details for this property."
                        />
                        <FormRow<ElectricalFormValues>
                            name="mpan"
                            label="MPAN"
                            errors={errors}
                            touched={touched}
                        >
                            <Field name="mpan">
                                {({ field }: FieldProps) => (
                                    <Input size="sm" placeholder="Meter Point Administration Number" {...field} />
                                )}
                            </Field>
                        </FormRow>
                        <FormRow<ElectricalFormValues>
                            name="location"
                            label="Location"
                            errors={errors}
                            touched={touched}
                        >
                            <Field name="location">
                                {({ field }: FieldProps) => (
                                    <Input size="sm" placeholder="e.g. Utility room, garage" {...field} />
                                )}
                            </Field>
                        </FormRow>
                        <FormRow<ElectricalFormValues>
                            name="manufacturer"
                            label="Manufacturer"
                            errors={errors}
                            touched={touched}
                        >
                            <Field name="manufacturer">
                                {({ field }: FieldProps) => (
                                    <Input size="sm" placeholder="Manufacturer" {...field} />
                                )}
                            </Field>
                        </FormRow>
                        <FormRow<ElectricalFormValues>
                            name="model"
                            label="Model"
                            errors={errors}
                            touched={touched}
                        >
                            <Field name="model">
                                {({ field }: FieldProps) => (
                                    <Input size="sm" placeholder="Model" {...field} />
                                )}
                            </Field>
                        </FormRow>
                        <FormRow<ElectricalFormValues>
                            name="installer"
                            label="Installer"
                            errors={errors}
                            touched={touched}
                        >
                            <Field name="installer">
                                {({ field }: FieldProps) => (
                                    <Input size="sm" placeholder="Installer" {...field} />
                                )}
                            </Field>
                        </FormRow>
                        <FormRow<ElectricalFormValues>
                            name="installation_date"
                            label="Installation Date"
                            errors={errors}
                            touched={touched}
                        >
                            <DatePicker
                                value={values.installation_date}
                                onChange={(date) => setFieldValue('installation_date', date)}
                            />
                        </FormRow>
                        <FormRow<ElectricalFormValues>
                            name="warranty_years"
                            label="Warranty (Years)"
                            errors={errors}
                            touched={touched}
                        >
                            <Field name="warranty_years">
                                {({ field }: FieldProps) => (
                                    <Input size="sm" placeholder="e.g. 5" {...field} />
                                )}
                            </Field>
                        </FormRow>
                        <FormRow<ElectricalFormValues>
                            name="warranty_expiry_date"
                            label="Warranty Expiry"
                            errors={errors}
                            touched={touched}
                            border={false}
                        >
                            <DatePicker
                                value={values.warranty_expiry_date}
                                onChange={(date) => setFieldValue('warranty_expiry_date', date)}
                            />
                        </FormRow>
                    </FormContainer>
                    <div className="sticky bottom-0 z-10 -mx-8 px-8 py-4 flex items-center justify-end border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <Button
                            size="sm"
                            variant="solid"
                            loading={isSubmitting}
                            icon={<AiOutlineSave />}
                            type="submit"
                        >
                            Save
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    )
}

export default Electrical
