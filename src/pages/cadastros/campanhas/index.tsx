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
import { Edit, Clear, Search, Collections } from '@material-ui/icons';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next'
import { parseCookies } from 'nookies'

import CampaignService from 'services/api/Campaign';
import { Campaign } from 'models/Campaign';
import LayoutWithMenu from 'components/layout/LayoutWithMenu/LayoutWithMenu';
import { Pagination } from 'components/layout/Pagination';
import { useAuth } from 'contexts/AuthUserContext';

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

export default function CampaignList({ data, error }) {
  const classes = useStyles();
  const { pathname, query, push } = useRouter()

  const { authUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState(query.search || '')

  const searched = searchTerm === query.search

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

  if (!authUser || Number(authUser.customerId) !== Number(query.customerId)) return <div />

  return (
    <LayoutWithMenu>
      <div className={classes.toolbar}>
        <div>
          <Typography component="h1" variant="h4" className={classes.capitalize}>
            Campanhas
          </Typography>
        </div>
        <div>
          <Link href={`/cadastros/campanhas/cadastrar`} passHref>
            <Button variant="contained" color="primary" className={classes.capitalize} style={{ color: '#ffffff' }} disabled={authUser && authUser.profileId >= 2}>
              Nova Campanha
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
        <Table aria-label={'campanhas'}>
          <TableHead>
            <TableRow>
              <TableCell>Empresa</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Taxa destino férias</TableCell>
              {isSystemAdmin && (
                <TableCell width="140" align="center">
                  Ações
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {content ? content.map((item: Campaign) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.customer.name || item.customerId}
                  </TableCell>
                  <TableCell>
                    {item.campaignCode}
                  </TableCell>
                  <TableCell>
                    {item.name}
                  </TableCell>
                  <TableCell>
                    {item.destinoFeriasFee}
                  </TableCell>
                  {isSystemAdmin && (
                    <TableCell>
                      <Link href={`/cadastros/campanhas/editar/${item.id}`} passHref>
                        <IconButton aria-label="edit" title="Editar" disabled={authUser && authUser.profileId >= 2}>
                          <Edit />
                        </IconButton>
                      </Link>
                      <Link href={`/cadastros/campanhas/vitrine/${item.campaignCode}?name=${item.name}`} passHref>
                        <IconButton aria-label="showcase" title='Vitrine'>
                          <Collections />
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
        <Pagination totalPages={data && data.totalPages} pathname={`/cadastros/campanhas`} />
      )}

    </LayoutWithMenu>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { customerId, page = 1, search } = context.query as any
  const authToken = parseCookies(context)['destino-ferias-admin.token']
  let data = null

  try {
    data = await CampaignService.getCampaigns({ customerId, page, search }, authToken)
  } catch (err) {
    data = { error: { message: err.message } }
  }

  return { props: { data } }
}