import { useAppDispatch, useAppSelector } from "@/store"
import { fetchPropertyTypes } from "@/store/slices/property/propertyTypeSlice"
import { fetchPropertyTenures } from "@/store/slices/property/propertyTenureSlice"
import { addProperty } from "@/store/slices/property/propertySlice"
import { FormContainer } from '@/components/ui/Form'
import FormDesription from './components/FormDesription'
import FormRow from './components/FormRow'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Field, FieldProps, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useEffect } from "react"
import { HiCheck } from "react-icons/hi"
import Select from "@/components/ui/Select"
import { components } from 'react-select'
import type { OptionProps, ControlProps } from 'react-select'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { supabase } from "@/superbaseClient"

type Option = {
    value: string
    label: string
}

type FormModel = {
    name: string
    street: string
    postcode: string
    propertyTenure: Option | null
    propertyType: Option | null
}

const AddProperty: React.FC = () => {
    const dispatch = useAppDispatch()
    const propertyTypes = useAppSelector((state) => state.propertyType.list)
    const propertyTenures = useAppSelector((state) => state.propertyTenure.list)
    const user = useAppSelector((state) => state.auth.user)
    console.log("user: " + JSON.stringify(user))

    useEffect(() => {
        dispatch(fetchPropertyTypes())
        dispatch(fetchPropertyTenures())
    }, [dispatch])

    // ✅ Yup validation (ALL required)
    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Street number is required'),
        street: Yup.string().required('Street is required'),
        postcode: Yup.string().required('Postcode is required'),
        propertyType: Yup.object()
            .nullable()
            .required('Property type is required'),
        propertyTenure: Yup.object()
            .nullable()
            .required('Property tenure is required'),
    })

    const onFormSubmit = async (
        values: FormModel,
        setSubmitting: (isSubmitting: boolean) => void,
    ) => {
        try {
            //const user = await supabase.auth.getUser()
            console.log("submitting: " + user.id)
            await dispatch(addProperty({
                property_name: `${values.name} ${values.name}`,
                street: `${values.street}`,
                postcode: values.postcode,
                property_type_id: values.propertyType!.value,
                property_tenure_id: values.propertyTenure!.value,
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

    const { Control } = components

    const propertyTypeOptions: Option[] = propertyTypes.map((pt) => ({
        value: pt.id,
        label: pt.name,
    }))

    const propertyTenureOptions: Option[] = propertyTenures.map((pt) => ({
        value: pt.id,
        label: pt.name,
    }))

    const CustomControl = ({
        children,
        ...props
    }: ControlProps<Option>) => {
        return <Control {...props}>{children}</Control>
    }

    const CustomSelectOption = ({
        innerProps,
        label,
        isSelected,
    }: OptionProps<Option>) => {
        return (
            <div
                className={`flex items-center justify-between p-2 ${
                    isSelected
                        ? 'bg-gray-100 dark:bg-gray-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                {...innerProps}
            >
                <span>{label}</span>
                {isSelected && <HiCheck className="text-emerald-500 text-xl" />}
            </div>
        )
    }

    const initialValues: FormModel = {
        name: '',
        street: '',
        postcode: '',
        propertyType: null,
        propertyTenure: null,
    }

    return (
        propertyTypes.length > 0 && propertyTenures.length > 0 && (
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    setSubmitting(true)
                    onFormSubmit(values, setSubmitting)
                }}
            >
                {({ values, touched, errors, isSubmitting }) => {
                    const validatorProps = { touched, errors }

                    return (
                        <Form>
                            <FormContainer>
                                <FormDesription
                                    title="Add Property"
                                    desc="Add a new property."
                                />

                                {/* Street Number */}
                                <FormRow name="name" label="Street Number" {...validatorProps}>
                                    <Field
                                        name="name"
                                        placeholder="e.g. 123"
                                        component={Input}
                                    />
                                </FormRow>

                                {/* Street */}
                                <FormRow name="street" label="Street" {...validatorProps}>
                                    <Field
                                        name="street"
                                        placeholder="e.g. High Street"
                                        component={Input}
                                    />
                                </FormRow>

                                {/* Postcode */}
                                <FormRow name="postcode" label="Postcode" {...validatorProps}>
                                    <Field
                                        name="postcode"
                                        placeholder="e.g. HP4 3AP"
                                        component={Input}
                                    />
                                </FormRow>

                                {/* Property Type */}
                                <FormRow name="propertyType" label="Property Type" {...validatorProps}>
                                    <Field name="propertyType">
                                        {({ field, form }: FieldProps) => (
                                            <Select<Option>
                                                field={field}
                                                form={form}
                                                options={propertyTypeOptions}
                                                placeholder="Please select"
                                                components={{
                                                    Option: CustomSelectOption,
                                                    Control: CustomControl,
                                                }}
                                                value={values.propertyType}
                                                onChange={(option) =>
                                                    form.setFieldValue(field.name, option)
                                                }
                                            />
                                        )}
                                    </Field>
                                </FormRow>

                                {/* Property Tenure */}
                                <FormRow name="propertyTenure" label="Property Tenure" {...validatorProps}>
                                    <Field name="propertyTenure">
                                        {({ field, form }: FieldProps) => (
                                            <Select<Option>
                                                field={field}
                                                form={form}
                                                options={propertyTenureOptions}
                                                placeholder="Please select"
                                                components={{
                                                    Option: CustomSelectOption,
                                                    Control: CustomControl,
                                                }}
                                                value={values.propertyTenure}
                                                onChange={(option) =>
                                                    form.setFieldValue(field.name, option)
                                                }
                                            />
                                        )}
                                    </Field>
                                </FormRow>

                                {/* Submit */}
                                <div className="mt-4 ltr:text-right">
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
    )
}

export default AddProperty