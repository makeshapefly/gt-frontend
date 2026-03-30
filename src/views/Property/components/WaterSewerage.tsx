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
    fetchPropertyWater,
    savePropertyWater,
} from '@/store/slices/property/propertyWaterSlice'
import {
    fetchPropertySewerage,
    savePropertySewerage,
} from '@/store/slices/property/propertySewerageSlice'
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

type WaterFormValues = {
    meter_number: string
    location: string
    manufacturer: string
    model: string
    installer: string
    installation_date: Date | null
    warranty_years: string
    warranty_expiry_date: Date | null
    stop_cock_location: string
    spare: boolean
}

type SewerageFormValues = {
    drains_layout: string
    septic_tank_type: string
    manufacturer: string
    model: string
    installer: string
    installation_date: Date | null
    warranty_years: string
    warranty_expiry_date: Date | null
    maintenance_history: string
    spare: boolean
}

const waterValidationSchema = Yup.object({
    meter_number: Yup.string(),
    location: Yup.string(),
    manufacturer: Yup.string(),
    model: Yup.string(),
    installer: Yup.string(),
    installation_date: Yup.date().nullable(),
    warranty_years: Yup.number().typeError('Must be a number').nullable(),
    warranty_expiry_date: Yup.date().nullable(),
    stop_cock_location: Yup.string(),
    spare: Yup.boolean(),
})

const sewerageValidationSchema = Yup.object({
    drains_layout: Yup.string(),
    septic_tank_type: Yup.string(),
    manufacturer: Yup.string(),
    model: Yup.string(),
    installer: Yup.string(),
    installation_date: Yup.date().nullable(),
    warranty_years: Yup.number().typeError('Must be a number').nullable(),
    warranty_expiry_date: Yup.date().nullable(),
    maintenance_history: Yup.string(),
    spare: Yup.boolean(),
})

const WaterSewerage: React.FC<EditPropertyProps> = ({ property }) => {
    const dispatch = useAppDispatch()
    const water = useAppSelector((state) => state.propertyWater.propertyWater)
    const sewerage = useAppSelector((state) => state.propertySewerage.propertySewerage)

    useEffect(() => {
        dispatch(fetchPropertyWater(property.id))
        dispatch(fetchPropertySewerage(property.id))
    }, [dispatch, property.id])

    const waterInitialValues: WaterFormValues = {
        meter_number: water?.meter_number ?? '',
        location: water?.location ?? '',
        manufacturer: water?.manufacturer ?? '',
        model: water?.model ?? '',
        installer: water?.installer ?? '',
        installation_date: water?.installation_date ? new Date(water.installation_date) : null,
        warranty_years: water?.warranty_years?.toString() ?? '',
        warranty_expiry_date: water?.warranty_expiry_date ? new Date(water.warranty_expiry_date) : null,
        stop_cock_location: water?.stop_cock_location ?? '',
        spare: water?.spare ?? false,
    }

    const sewerageInitialValues: SewerageFormValues = {
        drains_layout: sewerage?.drains_layout ?? '',
        septic_tank_type: sewerage?.septic_tank_type ?? '',
        manufacturer: sewerage?.manufacturer ?? '',
        model: sewerage?.model ?? '',
        installer: sewerage?.installer ?? '',
        installation_date: sewerage?.installation_date ? new Date(sewerage.installation_date) : null,
        warranty_years: sewerage?.warranty_years?.toString() ?? '',
        warranty_expiry_date: sewerage?.warranty_expiry_date ? new Date(sewerage.warranty_expiry_date) : null,
        maintenance_history: sewerage?.maintenance_history ?? '',
        spare: sewerage?.spare ?? false,
    }

    const onWaterSubmit = async (
        values: WaterFormValues,
        { setSubmitting }: FormikHelpers<WaterFormValues>
    ) => {
        try {
            await dispatch(savePropertyWater({
                ...(water?.id ? { id: water.id } : {}),
                property_id: property.id,
                meter_number: values.meter_number || null,
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
                stop_cock_location: values.stop_cock_location || null,
                spare: values.spare,
            })).unwrap()

            toast.push(
                <Notification title="Water saved" type="success" />,
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

    const onSewerageSubmit = async (
        values: SewerageFormValues,
        { setSubmitting }: FormikHelpers<SewerageFormValues>
    ) => {
        try {
            await dispatch(savePropertySewerage({
                ...(sewerage?.id ? { id: sewerage.id } : {}),
                property_id: property.id,
                drains_layout: values.drains_layout || null,
                septic_tank_type: values.septic_tank_type || null,
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
                maintenance_history: values.maintenance_history || null,
                spare: values.spare,
            })).unwrap()

            toast.push(
                <Notification title="Sewerage saved" type="success" />,
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
        <div className="flex flex-col gap-8">
            {/* Water Section */}
            <Formik
                enableReinitialize
                initialValues={waterInitialValues}
                validationSchema={waterValidationSchema}
                onSubmit={onWaterSubmit}
            >
                {({ errors, touched, isSubmitting, values, setFieldValue }) => (
                    <Form>
                        <FormContainer>
                            <FormDesription
                                title="Water"
                                desc="Water meter details for this property."
                            />
                            <FormRow<WaterFormValues>
                                name="meter_number"
                                label="Meter Number"
                                errors={errors}
                                touched={touched}
                            >
                                <Field name="meter_number">
                                    {({ field }: FieldProps) => (
                                        <Input size="sm" placeholder="Water meter number" {...field} />
                                    )}
                                </Field>
                            </FormRow>
                            <FormRow<WaterFormValues>
                                name="location"
                                label="Location"
                                errors={errors}
                                touched={touched}
                            >
                                <Field name="location">
                                    {({ field }: FieldProps) => (
                                        <Input size="sm" placeholder="e.g. Utility room, outside" {...field} />
                                    )}
                                </Field>
                            </FormRow>
                            <FormRow<WaterFormValues>
                                name="stop_cock_location"
                                label="Stop Cock Location"
                                errors={errors}
                                touched={touched}
                            >
                                <Field name="stop_cock_location">
                                    {({ field }: FieldProps) => (
                                        <Input size="sm" placeholder="e.g. Under kitchen sink" {...field} />
                                    )}
                                </Field>
                            </FormRow>
                            <FormRow<WaterFormValues>
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
                            <FormRow<WaterFormValues>
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
                            <FormRow<WaterFormValues>
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
                            <FormRow<WaterFormValues>
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
                            <FormRow<WaterFormValues>
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
                            <FormRow<WaterFormValues>
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
                            <FormRow<WaterFormValues>
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
                        <div className="mt-4 flex justify-end">
                            <Button
                                size="sm"
                                variant="solid"
                                loading={isSubmitting}
                                icon={<AiOutlineSave />}
                                type="submit"
                            >
                                Save Water
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>

            {/* Sewerage Section */}
            <Formik
                enableReinitialize
                initialValues={sewerageInitialValues}
                validationSchema={sewerageValidationSchema}
                onSubmit={onSewerageSubmit}
            >
                {({ errors, touched, isSubmitting, values, setFieldValue }) => (
                    <Form>
                        <FormContainer>
                            <FormDesription
                                title="Sewerage"
                                desc="Sewerage and drainage details for this property."
                            />
                            <FormRow<SewerageFormValues>
                                name="drains_layout"
                                label="Drains Layout"
                                errors={errors}
                                touched={touched}
                            >
                                <Field name="drains_layout">
                                    {({ field }: FieldProps) => (
                                        <Input
                                            size="sm"
                                            textArea
                                            rows={3}
                                            placeholder="Describe the drains layout"
                                            {...field}
                                        />
                                    )}
                                </Field>
                            </FormRow>
                            <FormRow<SewerageFormValues>
                                name="septic_tank_type"
                                label="Septic Tank Type"
                                errors={errors}
                                touched={touched}
                            >
                                <Field name="septic_tank_type">
                                    {({ field }: FieldProps) => (
                                        <Input size="sm" placeholder="e.g. Conventional, Mound, Aerobic" {...field} />
                                    )}
                                </Field>
                            </FormRow>
                            <FormRow<SewerageFormValues>
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
                            <FormRow<SewerageFormValues>
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
                            <FormRow<SewerageFormValues>
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
                            <FormRow<SewerageFormValues>
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
                            <FormRow<SewerageFormValues>
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
                            <FormRow<SewerageFormValues>
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
                            <FormRow<SewerageFormValues>
                                name="maintenance_history"
                                label="Maintenance History"
                                errors={errors}
                                touched={touched}
                            >
                                <Field name="maintenance_history">
                                    {({ field }: FieldProps) => (
                                        <Input
                                            size="sm"
                                            textArea
                                            rows={3}
                                            placeholder="Describe any maintenance history"
                                            {...field}
                                        />
                                    )}
                                </Field>
                            </FormRow>
                            <FormRow<SewerageFormValues>
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
                                    Spare connection point
                                </Checkbox>
                            </FormRow>
                        </FormContainer>
                        <div className="mt-4 flex justify-end">
                            <Button
                                size="sm"
                                variant="solid"
                                loading={isSubmitting}
                                icon={<AiOutlineSave />}
                                type="submit"
                            >
                                Save Sewerage
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default WaterSewerage
