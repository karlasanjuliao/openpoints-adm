import {
  Button,
  createStyles,
  IconButton,
  InputAdornment,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Theme,
  Typography
} from '@material-ui/core';
import { useRouter } from 'next/router';
import { Delete, Edit, Clear, Search } from '@material-ui/icons';
import Link from 'next/link';
import { useState } from 'react';
import { GetServerSideProps } from 'next'
import { parseCookies } from 'nookies'

import CouponService from 'services/api/Coupon';
import { Coupon } from 'models/Coupon';
import LayoutWithMenu from 'components/layout/LayoutWithMenu/LayoutWithMenu';
import { Pagination } from 'components/layout/Pagination';
import { useAuth } from 'contexts/AuthUserContext';
import useService from 'hooks/useService';
import ConfirmationDialog from 'components/screen/ConfirmationDialog/ConfirmationDialog';
import FormLoadingComponent from 'components/screen/FormLoading/FormLoading';
import { formatDate } from 'utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    capitalize: {
      textTransform: 'capitalize'
    },
    table: {
      marginTop: theme.spacing(3)
    },
    formSearch: {
      paddingLeft: '16px',
      margin: '8px 0 16px'
    }
  })
);

export default function CouponsList({ data, error }) {
  const classes = useStyles();
  const { pathname, query, push } = useRouter()

  const { authUser } = useAuth();

  const [searchCode, setSearchCode] = useState(query.code || '')

  const isSystemAdmin = authUser && authUser.profileId === 1

  const searched = searchCode === query.code

  const hasPagination = data && data.totalPages && data.totalPages > 1
  const content = data && data.content

  const handleClickSearch = (e) => {
    if (searched) {
      setSearchCode('')
      push({
        pathname,
        query: {
          customerId: query.customerId
        },
      })
    } else {
      handleSearchCode(e)
    }
  }

  const handleSearchCode = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    push({
      pathname,
      query: {
        ...query,
        code: searchCode
      },
    })
  }

  const [itemToDelete, setItemToDelete] = useState<Coupon | null>(null);
  const [deleteCoupon, loadingDelete] = useService(CouponService.deleteCoupon)

  const handleDeleteConfirmation = async () => {
    setItemToDelete(null);
    try {
      await deleteCoupon({ id: itemToDelete.id })
    } catch(error) {
      console.log(error)
    }
  };

  if (!authUser) return <div />

  return (
    <LayoutWithMenu>
      <div className={classes.toolbar}>
        <div>
          <Typography component="h1" variant="h4" className={classes.capitalize}>
            Cupons
          </Typography>
        </div>
        <div>
          <Link href={`/cadastros/cupons-desconto/cadastrar`} passHref>
            <Button variant="contained" color="primary" className={classes.capitalize} style={{ color: '#ffffff' }} disabled={authUser && authUser.profileId >= 3}>
              Novo Cupom
            </Button>
          </Link>
        </div>
      </div>

      <TableContainer component={Paper} className={classes.table}>
        <form onSubmit={handleSearchCode} className={classes.formSearch}>
            <TextField
              type='text'
              value={searchCode}
              onChange={e => setSearchCode(e.target.value)}
              color='secondary'
              InputProps={{
                endAdornment:
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickSearch}
                      edge="end"
                    >
                      {searched ? <Clear /> : <Search />}
                    </IconButton>
                  </InputAdornment>
              }}
              label="Pesquisar"
            />
          </form>
        <Table aria-label={'cupons-desconto'}>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Tipo Desconto</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Campanha</TableCell>
              <TableCell>Data expiração</TableCell>
              {isSystemAdmin && (
                <TableCell width="140" align="center">
                  Ações
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {content ? content.map((item: Coupon) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.couponCode}
                  </TableCell>
                  <TableCell>
                    {item.description}
                  </TableCell>
                  <TableCell>
                    {item.discountType}
                  </TableCell>
                  <TableCell>
                    {item.value}
                  </TableCell>
                  <TableCell>
                    {item.campaign?.name}
                  </TableCell>
                  <TableCell>
                    {item.expirationDate ? formatDate(item.expirationDate, 'dd/MM/yyyy') : '-'}
                  </TableCell>
                  {isSystemAdmin && (
                    <TableCell>
                      <IconButton
                        aria-label="delete"
                        onClick={() => setItemToDelete(item)}
                      >
                        <Delete />
                      </IconButton>
                      <Link href={`/cadastros/cupons-desconto/editar/${item.id}`} passHref>
                        <IconButton aria-label="edit" title="Editar" disabled={authUser && authUser.profileId >= 3}>
                          <Edit />
                        </IconButton>
                      </Link>
                    </TableCell>
                  )}
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell> {error ? 'Ocorreu um erro ao carregar os dados.' : query.code ? `Não foram encontrados resultados para '${query.code}'` : 'Não há dados'} </TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </TableContainer>

      {hasPagination && (
        <Pagination totalPages={data && data.totalPages} pathname={`/cadastros/cupons-desconto`} />
      )}

      {itemToDelete && (
        <ConfirmationDialog
          id={`delete-${itemToDelete.id}`}
          title="Excluir"
          confirmButtonText="Excluir"
          keepMounted
          open={!!itemToDelete}
          onCancel={() => setItemToDelete(null)}
          onConfirmation={handleDeleteConfirmation}
        >
          Deseja realmente excluir <strong>{itemToDelete.couponCode}</strong>?
        </ConfirmationDialog>
      )}

      {loadingDelete && <FormLoadingComponent />}

    </LayoutWithMenu>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { page = 1, code } = context.query as any
  const authToken = parseCookies(context)['destino-ferias-admin.token']
  let data = null

  try {
    data = await CouponService.getCoupons({ page, code }, authToken)
  } catch (err) {
    data = { error: { message: err.message } }
  }

  return { props: { data } }
}