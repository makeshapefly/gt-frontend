import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Upload from '@/components/ui/Upload'
import AdaptableCard from '@/components/shared/AdaptableCard'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import { FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import type { FieldProps, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { AiOutlineSave } from 'react-icons/ai'
import { HiOutlineDocument, HiOutlineTrash } from 'react-icons/hi'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    fetchPropertySpacial,
    savePropertySpacial,
} from '@/store/slices/property/propertySpacialSlice'
import { supabase } from '@/superbaseClient'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import FormDesription from './FormDesription'
import FormRow from './FormRow'

type Property = {
    id: string
    name?: string
    street?: string
    postcode?: string
}

type EditPropertyProps = {
    property: Property
}

type SpacialFormValues = {
    site_area: string
    built_area: string
    spatial_gia: string
    spatial_gea: string
    spatial_volume: string
}

type FloorPlanFile = {
    name: string
    path: string
}

const validationSchema = Yup.object({
    site_area: Yup.number().typeError('Must be a number').nullable(),
    built_area: Yup.number().typeError('Must be a number').nullable(),
    spatial_gia: Yup.number().typeError('Must be a number').nullable(),
    spatial_gea: Yup.number().typeError('Must be a number').nullable(),
    spatial_volume: Yup.number().typeError('Must be a number').nullable(),
})

const Spatial: React.FC<EditPropertyProps> = ({ property }) => {
    const dispatch = useAppDispatch()
    const spacial = useAppSelector((state) => state.propertySpacial.propertySpacial)
    const userId = useAppSelector((state) => state.auth.user.id)
    const [floorPlans, setFloorPlans] = useState<FloorPlanFile[]>([])

    useEffect(() => {
        dispatch(fetchPropertySpacial(property.id))
        loadFloorPlans()
    }, [dispatch, property.id])

    const loadFloorPlans = async () => {
        const { data, error } = await supabase.storage
            .from('floor_plans')
            .list(`${userId}/${property.id}`)

        if (!error && data) {
            setFloorPlans(data.map(f => ({
                name: f.name,
                path: `${userId}/${property.id}/${f.name}`,
            })))
        }
    }

    const initialValues: SpacialFormValues = {
        site_area: spacial?.site_area?.toString() ?? '',
        built_area: spacial?.built_area?.toString() ?? '',
        spatial_gia: spacial?.spatial_gia?.toString() ?? '',
        spatial_gea: spacial?.spatial_gea?.toString() ?? '',
        spatial_volume: spacial?.spatial_volume?.toString() ?? '',
    }

    const onSubmit = async (
        values: SpacialFormValues,
        { setSubmitting }: FormikHelpers<SpacialFormValues>
    ) => {
        try {
            await dispatch(savePropertySpacial({
                id: property.id,
                site_area: values.site_area !== '' ? parseFloat(values.site_area) : null,
                built_area: values.built_area !== '' ? parseFloat(values.built_area) : null,
                spatial_gia: values.spatial_gia !== '' ? parseFloat(values.spatial_gia) : null,
                spatial_gea: values.spatial_gea !== '' ? parseFloat(values.spatial_gea) : null,
                spatial_volume: values.spatial_volume !== '' ? parseFloat(values.spatial_volume) : null,
            })).unwrap()

            toast.push(
                <Notification title="Spatial data saved" type="success" />,
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

    const beforeUpload = (files: FileList | null) => {
        let valid: boolean | string = true
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
        if (files) {
            for (const f of files) {
                if (!allowedTypes.includes(f.type)) {
                    valid = 'Please upload a PDF, JPG or PNG file'
                }
            }
        }
        return valid
    }

    const onUpload = async (files: File[]) => {
        for (const file of files) {
            const path = `${userId}/${property.id}/${file.name}`
            const { error } = await supabase.storage
                .from('floor_plans')
                .upload(path, file, { upsert: true })

            if (error) {
                toast.push(
                    <Notification title={`Failed to upload ${file.name}`} type="danger" />,
                    { placement: 'top-center' }
                )
            } else {
                setFloorPlans(prev => {
                    const exists = prev.some(f => f.path === path)
                    if (exists) return prev
                    return [...prev, { name: file.name, path }]
                })
            }
        }
    }

    const onOpen = async (path: string) => {
        const { data, error } = await supabase.storage
            .from('floor_plans')
            .createSignedUrl(path, 60)

        if (error || !data) {
            toast.push(
                <Notification title="Failed to open file" type="danger" />,
                { placement: 'top-center' }
            )
            return
        }

        window.open(data.signedUrl, '_blank')
    }

    const onRemove = async (path: string) => {
        const { error } = await supabase.storage
            .from('floor_plans')
            .remove([path])

        if (error) {
            toast.push(
                <Notification title="Failed to remove file" type="danger" />,
                { placement: 'top-center' }
            )
        } else {
            setFloorPlans(prev => prev.filter(f => f.path !== path))
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-2">
                                <FormDesription
                                    title="Spatial"
                                    desc="Area and volume measurements for this property."
                                />
                                <FormRow<SpacialFormValues>
                                    name="site_area"
                                    label="Site Area"
                                    errors={errors}
                                    touched={touched}
                                >
                                    <Field name="site_area">
                                        {({ field }: FieldProps) => (
                                            <Input size="sm" placeholder="m²" {...field} />
                                        )}
                                    </Field>
                                </FormRow>
                                <FormRow<SpacialFormValues>
                                    name="built_area"
                                    label="Built Area"
                                    errors={errors}
                                    touched={touched}
                                >
                                    <Field name="built_area">
                                        {({ field }: FieldProps) => (
                                            <Input size="sm" placeholder="m²" {...field} />
                                        )}
                                    </Field>
                                </FormRow>
                                <FormRow<SpacialFormValues>
                                    name="spatial_gia"
                                    label="GIA"
                                    errors={errors}
                                    touched={touched}
                                >
                                    <Field name="spatial_gia">
                                        {({ field }: FieldProps) => (
                                            <Input size="sm" placeholder="m²" {...field} />
                                        )}
                                    </Field>
                                </FormRow>
                                <FormRow<SpacialFormValues>
                                    name="spatial_gea"
                                    label="GEA"
                                    errors={errors}
                                    touched={touched}
                                >
                                    <Field name="spatial_gea">
                                        {({ field }: FieldProps) => (
                                            <Input size="sm" placeholder="m²" {...field} />
                                        )}
                                    </Field>
                                </FormRow>
                                <FormRow<SpacialFormValues>
                                    name="spatial_volume"
                                    label="Spatial Volume"
                                    errors={errors}
                                    touched={touched}
                                    border={false}
                                >
                                    <Field name="spatial_volume">
                                        {({ field }: FieldProps) => (
                                            <Input size="sm" placeholder="m³" {...field} />
                                        )}
                                    </Field>
                                </FormRow>
                            </div>

                            <div className="lg:col-span-1">
                                <AdaptableCard className="mb-4">
                                    <h5>Floor Plans</h5>
                                    <p className="mb-6">Upload floor plan documents for this property</p>

                                    {floorPlans.length > 0 && (
                                        <div className="mb-4 flex flex-col gap-2">
                                            {floorPlans.map(fp => (
                                                <div
                                                    key={fp.path}
                                                    className="flex items-center justify-between rounded border border-gray-200 dark:border-gray-600 px-3 py-2"
                                                >
                                                    <div
                                                        className="flex items-center gap-2 text-sm truncate cursor-pointer hover:text-blue-500"
                                                        onClick={() => onOpen(fp.path)}
                                                    >
                                                        <HiOutlineDocument className="text-lg shrink-0" />
                                                        <span className="truncate">{fp.name}</span>
                                                    </div>
                                                    <span
                                                        className="cursor-pointer p-1 hover:text-red-500 text-lg shrink-0"
                                                        onClick={() => onRemove(fp.path)}
                                                    >
                                                        <HiOutlineTrash />
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <Upload
                                        draggable
                                        beforeUpload={beforeUpload}
                                        showList={false}
                                        onChange={onUpload}
                                    >
                                        <div className="my-10 text-center">
                                            <DoubleSidedImage
                                                className="mx-auto"
                                                src="/img/others/upload.png"
                                                darkModeSrc="/img/others/upload-dark.png"
                                            />
                                            <p className="font-semibold mt-4">
                                                <span className="text-gray-800 dark:text-white">
                                                    Drop your file here, or{' '}
                                                </span>
                                                <span className="text-blue-500">browse</span>
                                            </p>
                                            <p className="mt-1 opacity-60 dark:text-white text-sm">
                                                Supports PDF, JPG, PNG
                                            </p>
                                        </div>
                                    </Upload>
                                </AdaptableCard>
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

export default Spatial
