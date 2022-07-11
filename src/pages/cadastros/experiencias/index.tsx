import {
  Button,
  createStyles,
  IconButton,
  InputAdornment,
  makeStyles,
  Grid,
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
import { GetServerSideProps } from 'next'
import { Delete, Clear, Edit, Search } from '@material-ui/icons';
import Link from 'next/link';
import { useRouter } from 'next/router'
import { parseCookies } from 'nookies'
import { useState } from 'react'

import ExperienceService from 'services/api/Experience'
import useService from 'hooks/useService';
import { Experience } from 'models/Experience';
import useNotification from 'hooks/useNotification'
import { NotificationTypes } from 'contexts/NotificationContext';
import { formatDate } from 'utils';
import LayoutWithMenu from 'components/layout/LayoutWithMenu/LayoutWithMenu';
import { Pagination } from 'components/layout/Pagination';
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

export default function ExperienceList({ data, error }) {
  const classes = useStyles()
  const { pathname, query, push } = useRouter()

  const [searchTerm, setSearchTerm] = useState(query.search || '')

  const searched = searchTerm === query.search

  const hasPagination = data && data.totalPages && data.totalPages > 1
  const content = data && data.content

  const { notify } = useNotification()

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

  const [itemToDelete, setItemToDelete] = useState<Experience | null>(null);
  const [deleteExperience, loadingDelete] = useService(ExperienceService.deleteExperience)

  const handleDeleteConfirmation = async () => {
    setItemToDelete(null);
    try {
      await deleteExperience({ id: itemToDelete.id })
      notify({
        id: 'success',
        message: `Experiência removida com sucesso!`,
        type: NotificationTypes.SUCCESS
      })
    } catch(error) {
      notify({
        id: 'error',
        message: `Não foi possível excluir a experiência.`,
        type: NotificationTypes.ERROR
      })
    }
  }

  return (
    <LayoutWithMenu>
      <div className={classes.toolbar}>
        <div>
          <Typography component="h1" variant="h4" className={classes.capitalize}>
            Experiências
          </Typography>
        </div>
        <div>
          <Link href={`/cadastros/experiencias/cadastrar`} passHref>
            <Button variant="contained" color="primary" className={classes.capitalize}>
              Nova Experiência
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
          <Table aria-label='Experiências'>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Data Início</TableCell>
                <TableCell>Data Fim</TableCell>
                <TableCell>Preço</TableCell>
                <TableCell width="140" align="center">
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {content && content.length > 0 ? content.map((item: Experience) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.name}
                    </TableCell>
                    <TableCell>
                      {item.startDate ? formatDate(item.startDate, 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      {item.endDate ? formatDate(item.endDate, 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      {item.price ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.price) : '-'}
                    </TableCell>
                    <TableCell>
                      <Link href={`/cadastros/experiencias/editar/${item.id}`} passHref>
                        <IconButton aria-label="edit" title="Editar">
                          <Edit />
                        </IconButton>
                      </Link>
                      <IconButton
                        aria-label="delete"
                        onClick={() => setItemToDelete(item)}
                      >
                        <Delete />
                      </IconButton>
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
        <Pagination totalPages={data && data.totalPages} pathname={`/cadastros/experiencias`} />
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
    data = await ExperienceService.getExperiences({ page, search }, authToken)
  } catch (err) {
    data = { error: { message: err.message } }
  }

  return { props: { data } }
}