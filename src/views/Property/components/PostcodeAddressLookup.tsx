import { useEffect, useRef, useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

export type AddressDetail = {
    propertyNo: number,
    streetName: string,
    organisation: string
    line1: string
    line2: string
    line3: string
    town: string
    county: string
    postcode: string
    country: string
}

type ListOption = {
    value: string
    label: string
}

type Props = {
    onAddressSelected: (address: AddressDetail) => void
}

const DEBOUNCE_MS = 400
const DATA_KEY = import.meta.env.VITE_SIMPLY_POSTCODE_KEY
const BASE = `/simplypostcode/full_v3`
const UK_POSTCODE_RE = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2}$/i

const PostcodeAddressLookup: React.FC<Props> = ({ onAddressSelected }) => {
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [selecting, setSelecting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [options, setOptions] = useState<ListOption[]>([])
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)

        if (!UK_POSTCODE_RE.test(query.trim())) {
            setOptions([])
            setError(null)
            return
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch(
                    `${BASE}/getaddresslist?data_api_Key=${DATA_KEY}&query=${encodeURIComponent(query.trim())}`
                )
                const data = await res.json()
                console.log('SimplyPostcode list response:', data)

                const records: unknown[] = Array.isArray(data)
                    ? data
                    : (data.records ?? data.addresses ?? data.results ?? [])

                if (records.length === 0) {
                    setOptions([])
                    setError('No addresses found')
                    return
                }

                setError(null)
                setOptions(
                    records.map((r: any) => ({
                        value: r.ID,
                        label: r.Line,
                    }))
                )
            } catch {
                setError('Lookup failed. Please try again.')
                setOptions([])
            } finally {
                setLoading(false)
            }
        }, DEBOUNCE_MS)

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [query])

    const handleSelect = async (opt: ListOption | null) => {
        if (!opt) return
        setSelecting(true)
        try {
            const res = await fetch(
                `${BASE}/getselectedaddress?data_api_Key=${DATA_KEY}&id=${encodeURIComponent(opt.value)}`
            )
            const data = await res.json()
            console.log('SimplyPostcode selected address response:', data)

            const detail: AddressDetail = {
                propertyNo: data.propertyNo ?? '',
                streetName: data.streetName ?? '',
                organisation: data.organisation ?? data.Organisation ?? '',
                line1: data.line1 ?? data.Line1 ?? '',
                line2: data.line2 ?? data.Line2 ?? '',
                line3: data.line3 ?? data.Line3 ?? '',
                town: data.town ?? data.Town ?? '',
                county: data.county ?? data.County ?? '',
                postcode: data.postcode ?? data.postcode ?? '',
                country: data.country ?? data.Country ?? '',
            }

            onAddressSelected(detail)
        } catch {
            console.error('Failed to fetch selected address detail')
        } finally {
            setSelecting(false)
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <Input
                placeholder="Enter postcode e.g. HP4 3AP"
                value={query}
                suffix={loading ? <span className="text-xs text-gray-400">Searching...</span> : null}
                onChange={(e) => setQuery(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {options.length > 0 && (
                <Select<ListOption>
                    options={options}
                    placeholder={selecting ? 'Loading address...' : 'Select an address...'}
                    isDisabled={selecting}
                    onChange={handleSelect}
                />
            )}
        </div>
    )
}

export default PostcodeAddressLookup
