import { useEffect, useCallback, useMemo, useRef } from 'react'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import { HiOutlineEye, HiOutlineTrash } from 'react-icons/hi'
import { useAppDispatch, useAppSelector } from "@/store"
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useNavigate } from 'react-router-dom'
import type {
    DataTableResetHandle,
    OnSortParam,
    ColumnDef,
    Row,
} from '@/components/shared/DataTable'

type Property = {
    id: string
    name?: string
    street: string
    postcode?: string
}

const ActionColumn = ({ row }: { row: Property }) => {
    const dispatch = useAppDispatch()
    const { textTheme } = useThemeClass()
    const navigate = useNavigate()

    const onDelete = () => {
        //dispatch(setDeleteMode('single'))
        //dispatch(setSelectedRow([row.id]))
    }

    const onView = useCallback(() => {
        navigate(`/app/properties/${row.id}/edit/summary`)
    }, [navigate, row])

    return (
        <div className="flex justify-end text-lg">
            <Tooltip title="View/Edit">
                <span
                    className={`cursor-pointer p-2 hover:${textTheme}`}
                    onClick={onView}
                >
                    <HiOutlineEye />
                </span>
            </Tooltip>
            <Tooltip title="Delete">
                <span
                    className="cursor-pointer p-2 hover:text-red-500"
                    onClick={onDelete}
                >
                    <HiOutlineTrash />
                </span>
            </Tooltip>
        </div>
    )
}

const PropertyTable = () => {
    const tableRef = useRef<DataTableResetHandle>(null)

    const dispatch = useAppDispatch()
    const property = useAppSelector((state) => state.property)

   /* const { pageIndex, pageSize, sort, query, total } = useAppSelector(
        (state) => state.salesOrderList.data.tableData,
    ) */

    const data = useAppSelector((state) => state.property.list)

    useEffect(() => {
       // dispatch(setSelectedRows([]))
        //fetchData()
    }, [dispatch]) //fetchData, pageIndex, pageSize, sort])

    useEffect(() => {
        if (tableRef) {
            tableRef.current?.resetSelected()
        }
    }, [data])

   /* const tableData = useMemo(
        () => ({ pageIndex, pageSize, sort, query, total }),
        [pageIndex, pageSize, sort, query, total],
    ) */

    const columns: ColumnDef<Property>[] = useMemo(
        () => [
            {
                header: 'Street',
                accessorKey: 'street',
                cell: ({ row }) => <span>{row.original.street}</span>,
            },
            {
                header: 'Postcode',
                accessorKey: 'postcode',
                cell: ({ row }) => <span>{row.original.postcode}</span>,
            },
            {
                header: '',
                id: 'action',
                cell: (props) => <ActionColumn row={props.row.original} />,
            },
        ],
        [],
    )

    const onPaginationChange = (page: number) => {
        //const newTableData = cloneDeep(tableData)
        //newTableData.pageIndex = page
        //dispatch(setTableData(newTableData))
    }

    const onSelectChange = (value: number) => {
        //const newTableData = cloneDeep(tableData)
        //newTableData.pageSize = Number(value)
        //newTableData.pageIndex = 1
        //dispatch(setTableData(newTableData))
    }

    const onSort = (sort: OnSortParam) => {
        //const newTableData = cloneDeep(tableData)
        //newTableData.sort = sort
        //dispatch(setTableData(newTableData))
    }

    const onRowSelect = (checked: boolean, row: Property) => {
        if (checked) {
           // dispatch(addRowItem([row.id]))
        } else {
           // dispatch(removeRowItem(row.id))
        }
    }

    const onAllRowSelect = useCallback(
        (checked: boolean, rows: Row<Property>[]) => {
            if (checked) {
                const originalRows = rows.map((row) => row.original)
                const selectedIds: string[] = []
                originalRows.forEach((row) => {
                    selectedIds.push(row.id)
                })
               // dispatch(setSelectedRows(selectedIds))
            } else {
               // dispatch(setSelectedRows([]))
            }
        },
        [dispatch],
    )

    return (
        <DataTable
            ref={tableRef}
            columns={columns}
            data={data}
            pagingData={{
                total: 10,
                pageIndex: 0,
                pageSize: 10,
            }}
            onPaginationChange={onPaginationChange}
            onSelectChange={onSelectChange}
            onSort={onSort}
            onCheckBoxChange={onRowSelect}
            onIndeterminateCheckBoxChange={onAllRowSelect}
        />
    )
}

export default PropertyTable
