import { useAppDispatch, useAppSelector } from "@/store"
import { addProperty } from "@/store/slices/property/propertySlice"
import { FormContainer } from '@/components/ui/Form'
import FormDesription from './components/FormDesription'
import FormRow from './components/FormRow'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import PostcodeAddressLookup from './components/PostcodeAddressLookup'

type FormModel = {
    name: string
    street: string
    postcode: string
    town: string
    latitude: number | null
    longitude: number | null
}

const AddProperty: React.FC = () => {
    const dispatch = useAppDispatch()
    const user = useAppSelector((state) => state.auth.user)

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Street number is required'),
        street: Yup.string().required('Street is required'),
        postcode: Yup.string().required('Postcode is required'),
        town: Yup.string(),
    })

    const onFormSubmit = async (
        values: FormModel,
        setSubmitting: (isSubmitting: boolean) => void,
    ) => {
        try {
            await dispatch(addProperty({
                property_name: `${values.name}`,
                street: values.street,
                postcode: values.postcode,
                town: values.town || undefined,
                latitude: values.latitude ?? undefined,
                longitude: values.longitude ?? undefined,
                user_id: user.id
            })).unwrap()

            toast.push(
                <Notification title="Property added" type="success" />,
                { placement: 'top-center' }
            )
        } catch (error) {
            toast.push(
                <Notification title="Add failed" type="danger" />,
                { placement: 'top-center' }
            )
        } finally {
            setSubmitting(false)
        }
    }

    const initialValues: FormModel = {
        name: '',
        street: '',
        postcode: '',
        town: '',
        latitude: null,
        longitude: null,
    }

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
                setSubmitting(true)
                onFormSubmit(values, setSubmitting)
            }}
        >
            {({ touched, errors, isSubmitting, setFieldValue }) => {
                const validatorProps = { touched, errors }

                return (
                    <Form>
                        <FormContainer>
                            <FormDesription
                                title="Add Property"
                                desc="Add a new property."
                            />

                            {/* Postcode Address Finder */}
                            <div className="py-8 border-b border-gray-200 dark:border-gray-600">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="font-semibold">Find address by postcode</span>
                                </div>
                                <PostcodeAddressLookup
                                    onAddressSelected={(address) => {
                                        setFieldValue('name', address.propertyNo ?? '')
                                        setFieldValue('street', address.streetName ?? '')
                                        setFieldValue('postcode', address.postcode ?? '')
                                        setFieldValue('town', address.town ?? '')
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
                                {/* Left: manual address entry */}
                                <div className="lg:col-span-2">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold shrink-0">OR</span>
                                        <span className="font-semibold">Enter address manually</span>
                                    </div>

                                    <FormRow name="name" label="Street Number" {...validatorProps}>
                                        <Field name="name" placeholder="e.g. 123" component={Input} />
                                    </FormRow>

                                    <FormRow name="street" label="Street" {...validatorProps}>
                                        <Field name="street" placeholder="e.g. High Street" component={Input} />
                                    </FormRow>

                                    <FormRow name="town" label="Town / District" {...validatorProps}>
                                        <Field name="town" placeholder="e.g. Berkhamsted" component={Input} />
                                    </FormRow>

                                    <FormRow name="postcode" label="Postcode" {...validatorProps} border={false}>
                                        <Field name="postcode" placeholder="e.g. HP4 3AP" component={Input} />
                                    </FormRow>
                                </div>

                                {/* Right: property metadata placeholder */}
                                <div className="lg:col-span-1">
                                    <div className="flex items-center justify-center h-full min-h-[260px] rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600 text-gray-400 text-sm">
                                        Property metadata coming soon
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="mt-6 ltr:text-right">
                                <Button
                                    variant="solid"
                                    loading={isSubmitting}
                                    type="submit"
                                >
                                    {isSubmitting ? 'Adding' : 'Add Property'}
                                </Button>
                            </div>
                        </FormContainer>
                    </Form>
                )
            }}
        </Formik>
    )
}

export default AddProperty
