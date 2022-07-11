import {
  Button,
  createStyles,
  Grid,
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
import { Delete, Edit, CheckCircle, Cancel, Clear, Search } from '@material-ui/icons';
import Link from 'next/link';
import { useState } from 'react';
import { GetServerSideProps } from 'next'
import { parseCookies } from 'nookies'

import { Customer } from 'models/Customer';
import { useAuth } from 'contexts/AuthUserContext';
import CustomerService from 'services/api/Customer';
import useService from 'hooks/useService';
import LayoutWithMenu from 'components/layout/LayoutWithMenu/LayoutWithMenu';
import ConfirmationDialog from 'components/screen/ConfirmationDialog/ConfirmationDialog';
import FormLoadingComponent from 'components/screen/FormLoading/FormLoading';
import { Pagination } from 'components/layout/Pagination';

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

export default function CustomerList({ data, error }) {
  const classes = useStyles();
  const { pathname, query, push } = useRouter()
  const { authUser: { profileId } } = useAuth()

  const [searchTerm, setSearchTerm] = useState(query.search || '')

  const searched = searchTerm === query.search

  const hasPagination = data && data.totalPages && data.totalPages > 1
  const content = data && data.content

  const handleClickSearch = (e) => {
    if (searched) {
      setSearchTerm('')
      push({
        pathname
      })
    } else {
      handleSearchTerm(e)
    }
  }

  const handleSearchTerm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    push({
      pathname,
      query: {
        search: searchTerm
      },
    })
  }

  const [itemToDelete, setItemToDelete] = useState<Customer | null>(null);
  const [deleteCustomer, loadingDelete] = useService(CustomerService.deleteCustomer)

  const handleDeleteConfirmation = async () => {
    setItemToDelete(null);
    try {
      await deleteCustomer({ id: itemToDelete.id })
    } catch(error) {
      console.log(error)
    }
  };

  return (
    <LayoutWithMenu>
      <div className={classes.toolbar}>
        <div>
          <Typography component="h1" variant="h4" className={classes.capitalize}>
            Empresas
          </Typography>
        </div>
        <div>
          <Link href={`/cadastros/empresas/cadastrar`} passHref>
            <Button variant="contained" color="primary" className={classes.capitalize} style={{ color: '#ffffff' }} disabled={profileId && profileId >= 2}>
              Nova Empresa
            </Button>
          </Link>
        </div>
      </div>

      <Grid item xs={12}>
        <TableContainer component={Paper} className={classes.table}>
          <form onSubmit={handleSearchTerm} className={classes.formSearch}>
            <TextField
              type='text'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
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
          <Table aria-label={'Empresas'}>
            <TableHead>
              <TableRow>
                <TableCell>Razão Social</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>CNPJ</TableCell>
                <TableCell>Endereço</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Status</TableCell>
                <TableCell width="140" align="center">
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {content ? content.map((item: Customer) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.name}
                    </TableCell>
                    <TableCell>
                      {item.socialName}
                    </TableCell>
                    <TableCell>
                      {item.cnpj}
                    </TableCell>
                    <TableCell>
                      {item.address}
                    </TableCell>
                    <TableCell>
                      {item.phone}
                    </TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.enabled ? <CheckCircle style={{ color: 'green' }} /> : <Cancel style={{ color: 'red' }}  /> }</TableCell>
                    <TableCell>
                      <IconButton
                        aria-label="delete"
                        onClick={() => setItemToDelete(item)}
                      >
                        <Delete />
                      </IconButton>
                      <Link href={`/cadastros/empresas/editar/${item.id}`} passHref>
                        <IconButton aria-label="edit" title="Editar">
                          <Edit />
                        </IconButton>
                      </Link>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell> {error ? 'Ocorreu um erro ao carregar os dados.' : query.search ? `Não foram encontrados resultados para '${query.search}'` : 'Não há dados'} </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      {hasPagination && (
        <Pagination totalPages={data && data.totalPages} pathname={`/cadastros/empresas`} />
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
          Deseja realmente excluir <strong>{itemToDelete.name}</strong>?
        </ConfirmationDialog>
      )}

      {loadingDelete && <FormLoadingComponent />}
    </LayoutWithMenu>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { page = 1, search } = context.query as any
  const authToken = parseCookies(context)['destino-ferias-admin.token']
  let data = null

  try {
    data = await CustomerService.getCustomers({ page, search }, authToken)
  } catch (err) {
    data = { error: { message: err.message } }
  }

  return { props: { data } }
}