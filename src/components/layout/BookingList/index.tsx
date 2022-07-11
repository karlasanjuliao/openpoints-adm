import {
    Button,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    TextField,
    Typography,
} from '@material-ui/core';
import {
    Clear,
    Search,
    NavigateNext as NavgateNextIcon,
    NavigateBefore as NavigateBeforeIcon
} from '@material-ui/icons';
import { useEffect, useState, useRef, useCallback } from 'react';
import { usePagination } from "use-pagination-firestore";
import MaterialTable, { MTableToolbar } from 'material-table'
import { CSVLink } from 'react-csv'

import firebaseClient from 'services/firebase/client';
import useWindowDimensions from 'hooks/useWindowDimensions';
import LayoutWithMenu from 'components/layout/LayoutWithMenu/LayoutWithMenu';
import FormLoadingComponent from 'components/screen/FormLoading/FormLoading';
import { formatDate } from 'utils';

const QueryToType = Object.freeze({
    experiencias: 'EXPERIENCE',
    aereo: 'FLIGHT',
    hotel: 'HOTEL',
    carro: 'CAR'
})

const QueryToTitle = Object.freeze({
    experiencias: 'Experiências',
    aereo: 'Aéreo',
    hotel: 'Hotel',
    carro: 'Carro'
})

const TranslatedTypes = Object.freeze({
    FLIGHT: 'AÉREO',
    CAR: 'CARRO',
    HOTEL: 'HOTEL',
    EXPERIENCE: 'EXPERIÊNCIA'
})

const FilterToFields = Object.freeze({
    bookingCode: {
        label: 'Protocolo',
        operator: '==',
        field: 'bookingCode'
    },
    userName: {
        label: 'Usuário',
        operator: '==',
        field: 'user.userName'
    },
    startDate: {
        label: 'Data início',
        operator: '>=',
        field: 'bookingDate'
    },
    endDate: {
        label: 'Data fim',
        operator: '<=',
        field: 'bookingDate'
    },
    status: {
        label: 'Status',
        operator: '==',
        field: 'status'
    },
})

const queryBase = firebaseClient
    .firestore()
    .collection("bookings")

export default function BookingList({
    type,
    isSystemAdmin,
    userCustomerId
}: any) {
    const [bookings, setBookings] = useState(null)
    const [filterData, setFilterData] = useState(null)
    const [initialQuery, setInitialQuery] = useState({
        queryBase,
        updated: false
    })
    const [loadingQuery, setLoadingQuery] = useState(false)

    const [csvData, setCsvData]: any[] = useState([])
    const csvInstance = useRef<any | null>(null)

    const {
        items,
        isLoading,
        isStart,
        isEnd,
        getPrev,
        getNext,
    } = usePagination(initialQuery.queryBase, { limit: 50 })

    const { windowHeight } = useWindowDimensions()

    useEffect(() => {
        if (type && !initialQuery.updated) {
            setLoadingQuery(true)
            let newQuery: any = initialQuery.queryBase
            if (!isSystemAdmin) {
                newQuery = newQuery
                    .where("customerId", "==", Number(userCustomerId))
                    .where("type", "==", String(QueryToType[type as string]).trim())
            } else {
                newQuery = newQuery
                    .where("type", "==", String(QueryToType[type as string]).trim())
            }
            newQuery = newQuery.orderBy("bookingDate", "desc")
            setInitialQuery({
                queryBase: newQuery,
                updated: true
            })
        }
    }, [type])

    const handleAppendPassengers = useCallback((items) => {
        let bookingList = []
        items.map(({
            pointsTotalValue,
            cashTotalValue,
            cashPrice,
            ...item
        }) => item.passengers.map(({
            name: passengerName,
            lastName: passengerLastName,
            email: passengerEmail,
            phone: passengerPhone,
            documentType: passengerDocumentType,
            documentId: passengerDocumentId,
            birthdate: passengerBirthdate,
            address: passengerAddress
        }: any, index: number) => {
            bookingList.push({
                ...item,
                passengerName,
                passengerLastName,
                passengerEmail,
                passengerPhone,
                passengerDocumentType,
                passengerDocumentId,
                passengerBirthdate,
                passengerAddress,
                ...(index === 0 && {
                    pointsTotalValue,
                    cashTotalValue,
                    cashPrice
                })
            })
        }))
        return bookingList
    }, [])

    useEffect(() => {
        if (items && initialQuery.updated) {
            setBookings({ items: handleAppendPassengers(items) })
            setLoadingQuery(false)
        }
    }, [items])

    const renderFilterInput = () => {
        const InputBase = ({ children, ...props }: any) => (
            <TextField
                name={filterData.filter}
                disabled={bookings.filtered}
                value={filterData.value || ''}
                color='secondary'
                size='small'
                label={FilterToFields[filterData.filter].label}
                onChange={e => setFilterData({ ...filterData, value: e.target.value })}
                variant="outlined"
                style={{ margin: '8px' }}
                {...props}
            >
                {children}
            </TextField>
        )
        switch (filterData.filter) {
            case 'startDate':
            case 'endDate':
                return (
                    <InputBase
                        type='date'
                        value={filterData.value ? formatDate(filterData.value, 'yyyy-MM-dd') : ''}
                        onChange={e => setFilterData({ ...filterData, value: new Date(e.target.value).getTime() })}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                )
            case 'status':
                return (
                    <InputBase select style={{ width: '180px' }}>
                        <MenuItem key={''} value={''}>
                            Escolha o status
                        </MenuItem>
                        <MenuItem key={'Pendente'} value={'Pendente'}>
                            Pendente
                        </MenuItem>
                        <MenuItem key={'Emitido'} value={'EMITIDO'}>
                            Emitido
                        </MenuItem>
                        <MenuItem key={'Expirado'} value={'EXPIRADO'}>
                            Expirado
                        </MenuItem>
                        <MenuItem key={'Finalizado'} value={'FINALIZADO'}>
                            Finalizado
                        </MenuItem>
                        <MenuItem key={'Cancelado'} value={'CANCELADO'}>
                            Cancelado
                        </MenuItem>
                        <MenuItem key={'Confirmado'} value={'CONFIRMADO'}>
                            Confirmado
                        </MenuItem>
                    </InputBase>
                )
            default:
                return <InputBase type='text' />
        }
    }

    const handleClearFilter = async () => {
        const result = await initialQuery.queryBase.get()
        const initialBookings = result.docs.map(doc => doc.data())
        setBookings({
            items: handleAppendPassengers(initialBookings)
        })
        setFilterData(null)
        setLoadingQuery(false)
    }

    const handleFilter = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!filterData) {
            return
        }
        setLoadingQuery(true)
        if (bookings.filtered && filterData) {
            handleClearFilter()
            return
        }
        let newQuery: any = queryBase.where("type", "==", String(QueryToType[type as string]).trim())
        if (!isSystemAdmin) {
            newQuery = newQuery.where("customerId", "==", Number(userCustomerId))
        }
        newQuery = newQuery.where(FilterToFields[filterData.filter].field, FilterToFields[filterData.filter].operator, filterData.value)
        const result = await newQuery.get()
        const filteredBookings = result.docs.map(doc => doc.data())

        setBookings({
            filtered: true,
            items: handleAppendPassengers(filteredBookings)
        })
        setLoadingQuery(false)
    }

    const handleExportCsv = async (columnList) => {
        /**
         * Get all data from firestore:
         */
         setLoadingQuery(true)
        const resultFromFirestore = await initialQuery.queryBase.get()
        const allData = resultFromFirestore.docs.map(doc => doc.data())

        const data = handleAppendPassengers(allData)

        const filteredColumns = columnList.filter(columnDef => {
            return !columnDef.hidden && columnDef.field && columnDef.export !== false;
        })
        const headers = filteredColumns.map(columnDef => columnDef.title)

        const csvData = data.map(rowData =>
            filteredColumns.map(columnDef => {
                const splittedField = columnDef.field.split('.')
                let columnField = rowData[splittedField[0]]
                if (splittedField.length > 1) {
                    splittedField.slice(1).forEach((key: string) => {
                        columnField = columnField[key]
                    });
                }
                return columnDef.render ? columnDef.render(rowData) : columnField;
            })
        );

        setCsvData([headers, ...csvData])
        setLoadingQuery(false)
    }

    useEffect(() => {
        if (csvData && csvInstance && csvInstance.current && csvInstance.current.link) {
          setTimeout(() => {
            csvInstance.current.link.click();
            setCsvData([]);
          });
        }
      }, [csvData]);

    return (
      <LayoutWithMenu>
          {bookings?.items ? (
                <MaterialTable
                    isLoading={isLoading || loadingQuery || !bookings}
                    columns={[
                        { title: 'Empresa', field: 'customerName' },
                        { title: 'Tipo', field: 'type', render: rowData => TranslatedTypes[rowData.type] },
                        { title: 'Campanha', field: 'campaignName', cellStyle: { whiteSpace: 'nowrap' } },
                        { title: 'Código', field: 'bookingCode' },
                        { title: 'Data reserva', field: 'bookingDate', headerStyle: { whiteSpace: 'nowrap' }, render: rowData => rowData.date ? formatDate(rowData.bookingDate, 'dd/MM/yyyy') : '-' },
                        { title: 'Localizador', field: 'locator' },
                        { title: 'Status', field: 'status' },
                        { title: 'Pedido', field: 'purchaseId' },
                        { title: 'Descrição', field: 'description', cellStyle: { minWidth: '300px' }},
                        { title: 'Data', field: 'date', render: rowData => rowData.date ? formatDate(rowData.date, 'dd/MM/yyyy') : '-' },
                        { title: 'Usuário', field: 'user.userName' },
                        { title: 'Passageiro', field: 'passengerName', render: (rowData) => `${rowData.passengerName} ${rowData.passengerLastName}`, headerStyle: { whiteSpace: 'nowrap' }, cellStyle: { whiteSpace: 'nowrap' } },
                        { title: 'passengerLastName', field: 'passengerLastName', hidden: true },
                        { title: 'passengerDocumentType', field: 'passengerDocumentType', hidden: true },
                        { title: 'Documento', field: 'passengerDocumentId', render: (rowData) => rowData.passengerDocumentType && rowData.passengerDocumentId ? `${rowData.passengerDocumentType}: ${rowData.passengerDocumentId}` : '-', headerStyle: { whiteSpace: 'nowrap' }, cellStyle: { whiteSpace: 'nowrap' } },
                        { title: 'Data de nascimento', field: 'passengerBirthdate', headerStyle: { whiteSpace: 'nowrap' }, cellStyle: { whiteSpace: 'nowrap' } },
                        { title: 'Endereço', field: 'passengerAddress', headerStyle: { whiteSpace: 'nowrap' }, cellStyle: { whiteSpace: 'nowrap' } },
                        { title: 'E-mail', field: 'passengerEmail', headerStyle: { whiteSpace: 'nowrap' } },
                        { title: 'Telefone', field: 'passengerPhone', cellStyle: { whiteSpace: 'nowrap' } },
                        { title: 'Valor (pontos)', field: 'pointsTotalValue', headerStyle: { whiteSpace: 'nowrap' } },
                        { title: 'Valor (R$)', field: 'cashTotalValue', headerStyle: { whiteSpace: 'nowrap' }, render: rowData => rowData.cashTotalValue !== undefined ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(rowData.cashTotalValue) : '' },
                        { title: 'Preço total (R$)', field: 'cashPrice', headerStyle: { whiteSpace: 'nowrap' }, render: rowData => rowData.cashPrice !== undefined ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(rowData.cashPrice) : '' },
                    ]}
                    key={bookings?.items?.length}
                    data={bookings?.items || []}
                    // detailPanel={rowData => {
                    //     return (
                    //         <ul>
                    //             <li>{ rowData.date }</li>
                    //             <li>{ rowData.description }</li>
                    //         </ul>
                    //     )
                    // }}
                    // onRowClick={(event, rowData, togglePanel) => togglePanel()}
                    options={{
                        pageSize: bookings?.items?.length,
                        exportButton: Boolean(bookings && bookings?.items.length) ? {
                            csv: true,
                            pdf: false
                        } : false,
                        exportCsv: handleExportCsv,
                        search: false,
                        showTitle: false,
                        headerStyle: { position: 'sticky', top: 0 },
                        maxBodyHeight: `${windowHeight - 290}px`
                    }}
                    localization={{
                        body: {
                            emptyDataSourceMessage: 'Não há dados.',
                        },
                        toolbar: {
                            searchPlaceholder: 'Pesquisar...',
                            exportTitle: 'Exportar',
                            exportAriaLabel: 'Exportar',
                            exportCSVName: "Exportar em .CSV",
                        }
                    }}
                    components={{
                        Toolbar: (props) => (
                            <>
                                <form onSubmit={handleFilter}>
                                    <Grid container item justifyContent='center' alignItems='center' style={{ padding: '24px 0 8px' }}>
                                        <Typography variant='h6' style={{ padding: '8px 16px', marginRight: 'auto' }}> {`Reservas - ${QueryToTitle[type as string]}`} </Typography>
                                        <Paper style={{ padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <TextField
                                                color="secondary"
                                                variant="outlined"
                                                size='small'
                                                select
                                                disabled={(bookings && bookings.filtered) || (bookings && !bookings?.items.length)}
                                                label="Filtrar por"
                                                name="status"
                                                value={filterData?.filter || ''}
                                                onChange={e => setFilterData({ filter: e.target.value })}
                                                style={{ width: '140px', margin: '8px' }}
                                            >
                                                <MenuItem key={''} value={''}>
                                                    Escolha o filtro
                                                </MenuItem>
                                                <MenuItem key={'bookingCode'} value={'bookingCode'}>
                                                    Protocolo
                                                </MenuItem>
                                                <MenuItem key={'userName'} value={'userName'}>
                                                    Usuário
                                                </MenuItem>
                                                <MenuItem key={'startDate'} value={'startDate'}>
                                                    Data início
                                                </MenuItem>
                                                <MenuItem key={'endDate'} value={'endDate'}>
                                                    Data fim
                                                </MenuItem>
                                                <MenuItem key={'status'} value={'status'}>
                                                    Status
                                                </MenuItem>
                                            </TextField>
                                            {filterData && filterData.filter ? (
                                                renderFilterInput()
                                            ) : (
                                                <TextField
                                                    type='text'
                                                    name=''
                                                    value={''}
                                                    disabled
                                                    color='secondary'
                                                    size='small'
                                                    label=""
                                                    style={{ margin: '8px' }}
                                                    variant="outlined"
                                                />
                                            )}
                                            <Button
                                                type='submit'
                                                color="primary"
                                                disabled={!filterData}
                                            >
                                                {bookings && bookings.filtered ? <Clear /> : <Search />}
                                            </Button>
                                        </Paper>
                                        <MTableToolbar {...props} />
                                    </Grid>
                                </form>
                                {csvData.length > 0 ?
                                    <CSVLink
                                        data={csvData}
                                        headers={Object.keys(csvData[0])}
                                        filename={`Relatório de Resgates - ${QueryToTitle[type as string]}.csv`}
                                        ref={csvInstance}
                                        data-interception='off'
                                        style={{ visibility: 'hidden', opacity: 0 }}
                                    />
                                : undefined}
                            </>
                        ),
                        Pagination: () => (
                            <Grid container item justifyContent='center'>
                                <IconButton onClick={getPrev} disabled={isStart || Boolean(bookings && !bookings?.items.length)}>
                                    <NavigateBeforeIcon/>
                                </IconButton>
                                <IconButton onClick={getNext} disabled={isEnd || Boolean(bookings && !bookings?.items.length)}>
                                    <NavgateNextIcon/>
                                </IconButton>
                            </Grid>
                        )
                    }}
                />
          ) : <FormLoadingComponent />}
      </LayoutWithMenu>
    );
}