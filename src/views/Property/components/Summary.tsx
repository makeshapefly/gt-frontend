import { useAppDispatch, useAppSelector } from "@/store"
import { fetchPropertyTypes } from "@/store/slices/property/propertyTypeSlice"
import { fetchPropertyTenures } from "@/store/slices/property/propertyTenureSlice"
import { updatePropertySummary } from "@/store/slices/property/propertySlice"
import { FormContainer } from '@/components/ui/Form'
import AdaptableCard from '@/components/shared/AdaptableCard'
import FormDesription from './FormDesription'
import EPCRating from './EPCRating'
import PropertyMap from './PropertyMap'
import FormRow from './FormRow'
import Button from '@/components/ui/Button'
import { Field, FieldProps, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useEffect, useState } from "react"
import { HiCheck, HiOutlinePencil } from "react-icons/hi"
import { AiOutlineSave } from 'react-icons/ai'
import Select from "@/components/ui/Select"
import Avatar from "@/components/ui/Avatar"
import DatePicker from '@/components/ui/DatePicker'
import { components } from 'react-select'
import type { OptionProps, ControlProps } from 'react-select'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

type Property = {
    id: string
    name?: string
    street?: string
    postcode?: string
    property_type_id?: string
    property_tenure_id?: string
    date_of_construction?: string | null
    construction_age_band?: string | null
    epc_rating?: string | null
}

type EditPropertyProps = {
    property: Property
}

type Option = {
    value: string
    label: string
}

export type SummaryFormModel = {
    propertyTenure: Option | null
    propertyType: Option | null
    date_of_construction: Date | null
    construction_age_band: Option | null
    epc_rating: Option | null
}

const ageBandOptions: Option[] = [
    { value: '1800-1900', label: '1800-1900' },
    { value: '1900-2026', label: '1900-2026' },
]

const epcRatingOptions: Option[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((r) => ({
    value: r,
    label: r,
}))

const Summary: React.FC<EditPropertyProps> = ({ property }) => {
    const dispatch = useAppDispatch()
    const propertyTypes = useAppSelector((state) => state.propertyType.list)
    const propertyTenures = useAppSelector((state) => state.propertyTenure.list)
    const [editingEpc, setEditingEpc] = useState(false)

    useEffect(() => {
        dispatch(fetchPropertyTypes())
        dispatch(fetchPropertyTenures())
    }, [dispatch])

    const validationSchema = Yup.object().shape({
        propertyType: Yup.object().nullable().required('Property type is required'),
        propertyTenure: Yup.object().nullable().required('Property tenure is required'),
    })

    const onFormSubmit = async (
        values: SummaryFormModel,
        setSubmitting: (isSubmitting: boolean) => void,
    ) => {
        try {
            await dispatch(updatePropertySummary({
                id: property.id,
                property_type_id: values.propertyType!.value,
                property_tenure_id: values.propertyTenure!.value,
                date_of_construction: values.date_of_construction
                    ? values.date_of_construction.toISOString().split('T')[0]
                    : null,
                construction_age_band: values.construction_age_band?.value ?? null,
                epc_rating: values.epc_rating?.value ?? null,
            })).unwrap()

            setEditingEpc(false)
            toast.push(
                <Notification title="Property updated" type="success" />,
                { placement: 'top-center' }
            )
        } catch (error) {
            toast.push(
                <Notification title="Update failed" type="danger" />,
                { placement: 'top-center' }
            )
        } finally {
            setSubmitting(false)
        }
    }

    const { Control } = components

    const propertyTypeOptions: PropertyTypeOption[] = propertyTypes.map((pt) => ({
        value: pt.id,
        label: pt.name,
    }))

    const propertyTenureOptions: PropertyTenureOption[] = propertyTenures.map((pt) => ({
        value: pt.id,
        label: pt.name,
    }))

    type PropertyTypeOption = {
        value: string
        label: string
    }

    type PropertyTenureOption = {
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

    const initialValues = {
        propertyType: propertyTypes
            .map(pt => ({ value: pt.id, label: pt.name || '' })) // convert slice to Select options
            .find(opt => opt.value === property?.property_type_id) || null, // preselect
        propertyTenure: propertyTenures
            .map(pt => ({ value: pt.id, label: pt.name || '' }))
            .find(opt => opt.value === property?.property_tenure_id) || null,
        date_of_construction: property?.date_of_construction
            ? new Date(property.date_of_construction)
            : null,
        construction_age_band: ageBandOptions.find(o => o.value === property?.construction_age_band) || null,
        epc_rating: epcRatingOptions.find(o => o.value === property?.epc_rating) || null,
    }

    return (
        propertyTypes.length > 0 && (
            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    setSubmitting(true)
                    onFormSubmit(values, setSubmitting)
                }}
            >
                {({ values, touched, errors, isSubmitting, resetForm }) => {
                    const validatorProps = { touched, errors }
                    return (
                        <Form>
                            <FormContainer>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <div className="lg:col-span-2">
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
                                                            form.setFieldValue(field.name, option)
                                                        }
                                                    />
                                                )}
                                            </Field>
                                        </FormRow>
                                        <FormRow
                                            name="propertyTenure"
                                            label="Property Tenure"
                                            {...validatorProps}
                                        >
                                            <Field name="propertyTenure">
                                                {({ field, form }: FieldProps) => (
                                                    <Select<PropertyTenureOption>
                                                        field={field}
                                                        form={form}
                                                        options={propertyTenureOptions}
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
                                        <div className="mt-6">
                                            <FormDesription
                                                title="Construction Dates"
                                                desc="Details about when the property was constructed."
                                            />
                                        </div>
                                        <FormRow
                                            name="date_of_construction"
                                            label="Date of Construction"
                                            {...validatorProps}
                                        >
                                            <Field name="date_of_construction">
                                                {({ field, form }: FieldProps) => (
                                                    <DatePicker
                                                        value={field.value}
                                                        inputFormat="DD/MM/YYYY"
                                                        onChange={(date) =>
                                                            form.setFieldValue(field.name, date)
                                                        }
                                                    />
                                                )}
                                            </Field>
                                        </FormRow>
                                        <FormRow
                                            name="construction_age_band"
                                            label="Construction Age Band"
                                            {...validatorProps}
                                            border={false}
                                        >
                                            <Field name="construction_age_band">
                                                {({ field, form }: FieldProps) => (
                                                    <Select<Option>
                                                        field={field}
                                                        form={form}
                                                        options={ageBandOptions}
                                                        value={values.construction_age_band}
                                                        onChange={(option) =>
                                                            form.setFieldValue(field.name, option)
                                                        }
                                                    />
                                                )}
                                            </Field>
                                        </FormRow>
                                    </div>
                                    <div className="lg:col-span-1">
                                        <AdaptableCard>
                                            <div className="flex items-center justify-between">
                                                <h5>EPC Rating</h5>
                                                {property.epc_rating && !editingEpc && (
                                                    <span
                                                        className="cursor-pointer p-1 hover:text-blue-500 text-lg"
                                                        onClick={() => setEditingEpc(true)}
                                                    >
                                                        <HiOutlinePencil />
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">Energy Performance Certificate rating for this property.</p>
                                            {property.epc_rating && !editingEpc ? (
                                                <EPCRating rating={property.epc_rating} />
                                            ) : (
                                                <div className="mt-4">
                                                    {!property.epc_rating && (
                                                        <p className="text-sm text-gray-400 mb-2">No EPC rating recorded. Select one below.</p>
                                                    )}
                                                    <Field name="epc_rating">
                                                        {({ field, form }: FieldProps) => (
                                                            <Select<Option>
                                                                options={epcRatingOptions}
                                                                value={values.epc_rating}
                                                                onChange={(opt) => form.setFieldValue(field.name, opt)}
                                                                placeholder="Select rating A–G..."
                                                            />
                                                        )}
                                                    </Field>
                                                    {editingEpc && (
                                                        <button
                                                            type="button"
                                                            className="mt-2 text-xs text-gray-400 hover:text-gray-600"
                                                            onClick={() => setEditingEpc(false)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </AdaptableCard>
                                        <AdaptableCard className="mt-4">
                                            <h5>Location</h5>
                                            <p className="text-sm text-gray-500 mt-1">Map view of this property.</p>
                                            <div className="mt-4 h-48 rounded overflow-hidden">
                                                <PropertyMap street={property.street} postcode={property.postcode} />
                                            </div>
                                        </AdaptableCard>
                                    </div>
                                </div>
                            </FormContainer>
                            <div className="sticky bottom-0 z-10 -mx-8 px-8 py-4 mt-8 flex items-center justify-end border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
                    )
                }}
            </Formik>
        )
    )
}


export default Summary