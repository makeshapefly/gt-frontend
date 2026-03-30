import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchPropertyLocation, savePropertyLocation } from '@/store/slices/property/propertyLocationSlice'
import { FormContainer, FormItem } from '@/components/ui/Form'
import FormDesription from './FormDesription'
import FormRow from './FormRow'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Field, Form, Formik } from 'formik'
import type { FieldProps, FormikHelpers } from 'formik'
import * as Yup from 'yup'
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

type LocationFormValues = {
    uprn: string
    usrn: string
    what_three_words: string
    latitude: string
    longitude: string
}

const validationSchema = Yup.object({
    uprn: Yup.string(),
    usrn: Yup.string(),
    what_three_words: Yup.string(),
    latitude: Yup.number().typeError('Must be a number').nullable(),
    longitude: Yup.number().typeError('Must be a number').nullable(),
})

const Location: React.FC<EditPropertyProps> = ({ property }) => {
    const dispatch = useAppDispatch()
    const location = useAppSelector((state) => state.propertyLocation.propertyLocation)

    useEffect(() => {
        dispatch(fetchPropertyLocation(property.id))
    }, [dispatch, property.id])

    const initialValues: LocationFormValues = {
        uprn: location?.uprn ?? '',
        usrn: location?.usrn ?? '',
        what_three_words: location?.what_three_words ?? '',
        latitude: location?.latitude?.toString() ?? '',
        longitude: location?.longitude?.toString() ?? '',
    }

    const onSubmit = async (
        values: LocationFormValues,
        { setSubmitting }: FormikHelpers<LocationFormValues>
    ) => {
        try {
            await dispatch(savePropertyLocation({
                id: property.id,
                uprn: values.uprn || null,
                usrn: values.usrn || null,
                what_three_words: values.what_three_words || null,
                latitude: values.latitude !== '' ? parseFloat(values.latitude) : null,
                longitude: values.longitude !== '' ? parseFloat(values.longitude) : null,
            })).unwrap()

            toast.push(
                <Notification title="Location saved" type="success" />,
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
            {({ errors, touched, isSubmitting }) => (
                <Form>
                    <FormContainer>
                        <FormDesription
                            title="Location"
                            desc="Geographical data for the Property."
                        />
                        <div className="grid md:grid-cols-3 gap-4 py-8 border-b border-gray-200 dark:border-gray-600 items-center">
                            <div className="font-semibold">Property Reference Identifiers</div>
                            <div className="col-span-2 flex flex-col lg:flex-row gap-4">
                                <Field name="uprn">
                                    {({ field }: FieldProps) => (
                                        <FormItem
                                            className="mb-0 flex-1"
                                            label="UPRN"
                                            invalid={(errors.uprn && touched.uprn) as boolean}
                                            errorMessage={errors.uprn}
                                        >
                                            <Input
                                                size="sm"
                                                placeholder="Unique Property Reference Number"
                                                {...field}
                                            />
                                        </FormItem>
                                    )}
                                </Field>
                                <Field name="usrn">
                                    {({ field }: FieldProps) => (
                                        <FormItem
                                            className="mb-0 flex-1"
                                            label="USRN"
                                            invalid={(errors.usrn && touched.usrn) as boolean}
                                            errorMessage={errors.usrn}
                                        >
                                            <Input
                                                size="sm"
                                                placeholder="Unique Street Reference Number"
                                                {...field}
                                            />
                                        </FormItem>
                                    )}
                                </Field>
                            </div>
                        </div>
                        <FormRow<LocationFormValues>
                            name="what_three_words"
                            label="What Three Words"
                            errors={errors}
                            touched={touched}
                        >
                            <Field name="what_three_words">
                                {({ field }: FieldProps) => (
                                    <Input
                                        size="sm"
                                        placeholder="e.g. filled.count.soap"
                                        {...field}
                                    />
                                )}
                            </Field>
                        </FormRow>
                        <div className="grid md:grid-cols-3 gap-4 py-8 items-center">
                            <div className="font-semibold">Coordinates</div>
                            <div className="col-span-2 flex flex-col lg:flex-row gap-4">
                                <Field name="latitude">
                                    {({ field }: FieldProps) => (
                                        <FormItem
                                            className="mb-0 flex-1"
                                            label="Latitude"
                                            invalid={(errors.latitude && touched.latitude) as boolean}
                                            errorMessage={errors.latitude}
                                        >
                                            <Input
                                                size="sm"
                                                placeholder="e.g. 51.5074"
                                                {...field}
                                            />
                                        </FormItem>
                                    )}
                                </Field>
                                <Field name="longitude">
                                    {({ field }: FieldProps) => (
                                        <FormItem
                                            className="mb-0 flex-1"
                                            label="Longitude"
                                            invalid={(errors.longitude && touched.longitude) as boolean}
                                            errorMessage={errors.longitude}
                                        >
                                            <Input
                                                size="sm"
                                                placeholder="e.g. -0.1278"
                                                {...field}
                                            />
                                        </FormItem>
                                    )}
                                </Field>
                            </div>
                        </div>
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

export default Location
