import { useAppDispatch, useAppSelector } from "@/store"
import { fetchPropertyTypes } from "@/store/slices/property/propertyTypeSlice"
import { FormContainer } from '@/components/ui/Form'
import FormDesription from './FormDesription'
import FormRow from './FormRow'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Field, FieldProps, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useEffect } from "react"
import { HiCheck, HiOutlineUserCircle } from "react-icons/hi"
import Select from "@/components/ui/Select"
import Avatar from "@/components/ui/Avatar"
import { components } from 'react-select'
import type { OptionProps, ControlProps } from 'react-select'

type Property = {
    id: string
    name?: string
    street?: string
    postcode?: string
    property_type_id?: string
}

type EditPropertyProps = {
    property: Property
}

const Summary: React.FC<EditPropertyProps> = ({ property }) => {
    const dispatch = useAppDispatch()
    const propertyTypes = useAppSelector((state) => state.propertyType.list)
    console.log(propertyTypes)

    useEffect(() => {
        dispatch(fetchPropertyTypes())
    }, [dispatch])

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
    })

    const onFormSubmit = (
    ) => {
    }

    console.log("porpeprorir: " + JSON.stringify(propertyTypes))
    console.log("property: " + JSON.stringify(property))
    let data = {
        propertyType: propertyTypes.find(pt => pt.id === property?.property_type_id) || null,
        name: '',
    }

    const { Control } = components

    const propertyTypeOptions: PropertyTypeOption[] = propertyTypes.map((pt) => ({
        value: pt.id,
        label: pt.name,
    }))

    type PropertyTypeOption = {
        value: string
        label: string
    }

    const CustomControl = ({
        children,
        ...props
    }: ControlProps<PropertyTypeOption>) => {
        const selected = props.getValue()[0]
        return (
            <Control {...props}>
                {/* {selected && (
                   <Avatar
                        className="ltr:ml-4 rtl:mr-4"
                        shape="circle"
                        size={18}
                        src={selected.imgPath}
                    />
                )} */}
                {children}
            </Control>
        )
    }

    const CustomSelectOption = ({
        innerProps,
        label,
        data,
        isSelected,
    }: OptionProps<PropertyTypeOption>) => {
        return (
            <div
                className={`flex items-center justify-between p-2 ${isSelected
                    ? 'bg-gray-100 dark:bg-gray-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                {...innerProps}
            >
                <div className="flex items-center">
                    {/* <Avatar shape="circle" size={20} src={data.imgPath} /> */}
                    <span className="ml-2 rtl:mr-2">{label}</span>
                </div>
                {isSelected && <HiCheck className="text-emerald-500 text-xl" />}
            </div>
        )
    }

    console.log('id:', property.property_type_id)
    console.log('options:', propertyTypeOptions)
    console.log('data:', data)

    const initialValues = {
        propertyType: propertyTypes
            .map(pt => ({ value: pt.id, label: pt.name || '' })) // convert slice to Select options
            .find(opt => opt.value === property?.property_type_id) || null, // preselect
        name: property?.name || '', // prefill name if available
    }

    return (
        propertyTypes.length > 0 && (
            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    setSubmitting(true)
                    setTimeout(() => {
                        //onFormSubmit(values, setSubmitting)
                    }, 1000)
                }}
            >
                {({ values, touched, errors, isSubmitting, resetForm }) => {
                    const validatorProps = { touched, errors }
                    return (
                        <Form>
                            <FormContainer>
                                <FormDesription
                                    title="Summary"
                                    desc="Summary Info about this property."
                                />
                                <FormRow
                                    name="propertyType"
                                    label="Property Type"
                                    {...validatorProps}
                                >
                                    <Field name="propertyType">
                                        {({ field, form }: FieldProps) => (
                                            <Select<PropertyTypeOption>
                                                field={field}
                                                form={form}
                                                options={propertyTypeOptions}
                                                components={{
                                                    Option: CustomSelectOption,
                                                    Control: CustomControl,
                                                }}
                                                value={values.propertyType}
                                                onChange={(option) =>
                                                    form.setFieldValue(
                                                        field.name,
                                                        option?.value,
                                                    )
                                                }
                                            />
                                        )}
                                    </Field>
                                </FormRow>
                                <FormRow
                                    name="name"
                                    label="Name"
                                    {...validatorProps}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="name"
                                        placeholder="Name"
                                        component={Input}
                                        prefix={
                                            <HiOutlineUserCircle className="text-xl" />
                                        }
                                    />
                                </FormRow>
                                <div className="mt-4 ltr:text-right">
                                    <Button
                                        variant="solid"
                                        loading={isSubmitting}
                                        type="submit"
                                    >
                                        {isSubmitting ? 'Updating' : 'Update'}
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


export default Summary