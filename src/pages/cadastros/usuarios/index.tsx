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
import { Delete, Edit, CheckCircle, Cancel, Clear, Search } from '@material-ui/icons';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next'
import { parseCookies } from 'nookies'

import UserService from 'services/api/User';
import { User } from 'models/User';
import LayoutWithMenu from 'components/layout/LayoutWithMenu/LayoutWithMenu';
import { Pagination } from 'components/layout/Pagination';
import { useAuth } from 'contexts/AuthUserContext';
import useService from 'hooks/useService';
import ConfirmationDialog from 'components/screen/ConfirmationDialog/ConfirmationDialog';
import FormLoadingComponent from 'components/screen/FormLoading/FormLoading';

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

export default function UserList({ data, error }) {
  const classes = useStyles();
  const { pathname, query, push } = useRouter()

  const { authUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState(query.search || '')

  useEffect(() => {
    if (authUser) {
      if (query.customerId && Number(authUser.customerId) !== Number(query.customerId)) {
        alert('Não autorizado.')
      }
      push({
        pathname,
        query: {
          customerId: authUser.customerId
        }
      })
    }
  }, [authUser])

  const isSystemAdmin = authUser && authUser.profileId === 1

  const searched = searchTerm === query.search

  const hasPagination = data && data.totalPages && data.totalPages > 1
  const content = data && data.content

  const handleClickSearch = (e) => {
    if (searched) {
      setSearchTerm('')
      push({
        pathname,
        query: {
          customerId: query.customerId
        },
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
        ...query,
        search: searchTerm
      },
    })
  }

  const [itemToDelete, setItemToDelete] = useState<User | null>(null);
  const [deleteUser, loadingDelete] = useService(UserService.deleteUser)

  const handleDeleteConfirmation = async () => {
    setItemToDelete(null);
    try {
      await deleteUser({ id: itemToDelete.id })
    } catch(error) {
      console.log(error)
    }
  };

  if (!authUser || Number(authUser.customerId) !== Number(query.customerId)) return <div />

  return (
    <LayoutWithMenu>
      <div className={classes.toolbar}>
        <div>
          <Typography component="h1" variant="h4" className={classes.capitalize}>
            Usuários
          </Typography>
        </div>
        <div>
          <Link href={`/cadastros/usuarios/cadastrar`} passHref>
            <Button variant="contained" color="primary" className={classes.capitalize} style={{ color: '#ffffff' }} disabled={authUser && authUser.profileId >= 3}>
              Novo Usuário
            </Button>
          </Link>
        </div>
      </div>

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
        <Table aria-label={'usuários'}>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Sobrenome</TableCell>
              <TableCell>Empresa</TableCell>
              <TableCell>Perfil</TableCell>
              <TableCell>E-mail</TableCell>
              <TableCell>Status</TableCell>
              {isSystemAdmin && (
                <TableCell width="140" align="center">
                  Ações
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {content ? content.map((item: User) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.name}
                  </TableCell>
                  <TableCell>
                    {item.lastName}
                  </TableCell>
                  <TableCell>
                    {item.customer.name}
                  </TableCell>
                  <TableCell>
                    {item.profile.name}
                  </TableCell>
                  <TableCell>{item.userName}</TableCell>
                  <TableCell>{item.enabled ? <CheckCircle style={{ color: 'green' }} /> : <Cancel style={{ color: 'red' }}  /> }</TableCell>
                  {isSystemAdmin && (
                    <TableCell>
                      <IconButton
                        aria-label="delete"
                        onClick={() => setItemToDelete(item)}
                      >
                        <Delete />
                      </IconButton>
                      <Link href={`/cadastros/usuarios/editar/${item.id}`} passHref>
                        <IconButton aria-label="edit" title="Editar" disabled={authUser && authUser.profileId >= 3}>
                          <Edit />
                        </IconButton>
                      </Link>
                    </TableCell>
                  )}
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell> {error ? 'Ocorreu um erro ao carregar os dados.' : query.search ? `Não foram encontrados resultados para '${query.search}'` : 'Não há dados'} </TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </TableContainer>

      {hasPagination && (
        <Pagination totalPages={data && data.totalPages} pathname={`/cadastros/usuarios`} />
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
  const { customerId, page = 1, search } = context.query as any
  const authToken = parseCookies(context)['destino-ferias-admin.token']
  let data = null

  try {
    data = await UserService.getUsersByCustomerId({ customerId, page, search }, authToken)
  } catch (err) {
    data = { error: { message: err.message } }
  }

  return { props: { data } }
}