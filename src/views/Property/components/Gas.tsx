import { useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'
import DatePicker from '@/components/ui/DatePicker'
import { FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import type { FieldProps, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { AiOutlineSave } from 'react-icons/ai'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    fetchPropertyGas,
    savePropertyGas,
} from '@/store/slices/property/propertyGasSlice'
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

type GasFormValues = {
    mprn: string
    location: string
    manufacturer: string
    model: string
    installer: string
    installation_date: Date | null
    warranty_years: string
    warranty_expiry_date: Date | null
    spare: boolean
}

const validationSchema = Yup.object({
    mprn: Yup.string(),
    location: Yup.string(),
    manufacturer: Yup.string(),
    model: Yup.string(),
    installer: Yup.string(),
    installation_date: Yup.date().nullable(),
    warranty_years: Yup.number().typeError('Must be a number').nullable(),
    warranty_expiry_date: Yup.date().nullable(),
    spare: Yup.boolean(),
})

const Gas: React.FC<EditPropertyProps> = ({ property }) => {
    const dispatch = useAppDispatch()
    const gas = useAppSelector((state) => state.propertyGas.propertyGas)

    useEffect(() => {
        dispatch(fetchPropertyGas(property.id))
    }, [dispatch, property.id])

    const initialValues: GasFormValues = {
        mprn: gas?.mprn ?? '',
        location: gas?.location ?? '',
        manufacturer: gas?.manufacturer ?? '',
        model: gas?.model ?? '',
        installer: gas?.installer ?? '',
        installation_date: gas?.installation_date ? new Date(gas.installation_date) : null,
        warranty_years: gas?.warranty_years?.toString() ?? '',
        warranty_expiry_date: gas?.warranty_expiry_date ? new Date(gas.warranty_expiry_date) : null,
        spare: gas?.spare ?? false,
    }

    const onSubmit = async (
        values: GasFormValues,
        { setSubmitting }: FormikHelpers<GasFormValues>
    ) => {
        try {
            await dispatch(savePropertyGas({
                ...(gas?.id ? { id: gas.id } : {}),
                property_id: property.id,
                mprn: values.mprn || null,
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
                spare: values.spare,
            })).unwrap()

            toast.push(
                <Notification title="Gas saved" type="success" />,
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
                            title="Gas"
                            desc="Gas supply details for this property."
                        />
                        <FormRow<GasFormValues>
                            name="mprn"
                            label="MPRN"
                            errors={errors}
                            touched={touched}
                        >
                            <Field name="mprn">
                                {({ field }: FieldProps) => (
                                    <Input size="sm" placeholder="Meter Point Reference Number" {...field} />
                                )}
                            </Field>
                        </FormRow>
                        <FormRow<GasFormValues>
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
                        <FormRow<GasFormValues>
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
                        <FormRow<GasFormValues>
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
                        <FormRow<GasFormValues>
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
                        <FormRow<GasFormValues>
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
                        <FormRow<GasFormValues>
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
                        <FormRow<GasFormValues>
                            name="warranty_expiry_date"
                            label="Warranty Expiry"
                            errors={errors}
                            touched={touched}
                        >
                            <DatePicker
                                value={values.warranty_expiry_date}
                                onChange={(date) => setFieldValue('warranty_expiry_date', date)}
                            />
                        </FormRow>
                        <FormRow<GasFormValues>
                            name="spare"
                            label="Spare"
                            errors={errors}
                            touched={touched}
                            border={false}
                        >
                            <Checkbox
                                checked={values.spare}
                                onChange={(checked) => setFieldValue('spare', checked)}
                            >
                                Spare meter point
                            </Checkbox>
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

export default Gas
