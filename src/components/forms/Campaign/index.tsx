import {
  Button,
  Container,
  createStyles,
  Grid,
  IconButton,
  makeStyles,
  MenuItem,
  Paper,
  TextField,
  InputAdornment,
  Theme,
  Typography,
} from '@material-ui/core';
import {
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useFormik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';

import useService from 'hooks/useService';
import CampaignService from 'services/api/Campaign';
import { Customer } from 'models/Customer';
import useNotification from 'hooks/useNotification'
import { NotificationTypes } from 'contexts/NotificationContext';
import LayoutWithMenu from 'components/layout/LayoutWithMenu/LayoutWithMenu';
import FormLoadingComponent from 'components/screen/FormLoading/FormLoading';
import CustomerService from 'services/api/Customer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbar: {
      display: 'flex',
      alignItems: 'center',
    },
    form: {
      marginTop: theme.spacing(3),
      padding: theme.spacing(3),
    },
    footer: {
      marginTop: theme.spacing(2)
    },
    hideIcon: {
      display: 'none'
    },
    chip: {
      backgroundColor: '#fd665e !important',
      color: '#ffffff !important',
      fontWeight: 700
    }
  })
);

export default function CampaignForm() {
  const classes = useStyles();
  const router = useRouter();
  const { id } = router.query;

  const [title, setTitle] = useState('Nova Campanha');
  const [customersList, setCustomersList] = useState(null)

  const [getCampaignById] = useService(CampaignService.getCampaignById)
  const [createCampaign] = useService(CampaignService.createCampaign)
  const [editCampaign] = useService(CampaignService.editCampaign)

  const [getCustomers, getCustomersLoading] = useService(CustomerService.getAllCustomers)

  const { notify } = useNotification()

  const initialValues: any = {
    customerId: '',
    name: '',
    campaignCode: '',
    destinoFeriasFee: 0,
    campaignConfig: {
      webpremiosClientId: '',
      webpremiosScope: '',
      redirectUrlAuth: '',
      conversionRate: ''
    }
  }

  const formSchema = Yup.object().shape({
    name: Yup.string()
      .required('Obrigatório'),
    customerId: Yup.string()
      .required('Obrigatório'),
    campaignCode: Yup.number()
      .required('Obrigatório'),
    destinoFeriasFee: Yup.number()
      .required('Obrigatório')
  });

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: formSchema,
    onSubmit: async (values) => {
      console.log('campaign final -> ', values)
      try {
        if (id) {
          await editCampaign({
            id,
            ...values
          })
        } else {
          await createCampaign(values)
        }

        notify({
          id: 'success',
          message: `Campanha adicionada com sucesso`,
          type: NotificationTypes.SUCCESS
        })
      } catch (error) {
        console.log(error)
        notify({
          id: 'error',
          message: `Ocorreu um erro. Por favor, tente novamente mais tarde.`,
          type: NotificationTypes.ERROR
        })
      } finally {
        formik.setSubmitting(false);
        router.back()
      }
    },
  });

  useEffect(() => {
    if (id) {
      getCampaignById({ id: String(id) }).then((response) => {
        setTitle(`Editando a campanha: ${response.name}`);
        formik.setValues({ ...response });
      })
    }
  }, [id]);

  useEffect(() => {
    (async function() {
      try {
        const customers = await getCustomers(null)
        setCustomersList(customers)
      } catch(error) {
        console.log(error)
      }
    })()
  }, [])

  return (
    <LayoutWithMenu>
      <Container maxWidth='xl'>
        <div className={classes.toolbar}>
          <Link href="/cadastros/campanhas" passHref>
            <IconButton aria-label="Voltar">
              <ArrowBackIcon />
            </IconButton>
          </Link>
          <Typography component="h1" variant="h5">
            {title}
          </Typography>
        </div>

        <Paper className={classes.form} elevation={3}>
          <form noValidate onSubmit={formik.handleSubmit}>
            <Grid container alignItems="flex-start" spacing={2}>
              <Grid item xs={12} lg={9}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  select
                  fullWidth
                  id="customerId"
                  label="Empresa"
                  name="customerId"
                  autoComplete="customerId"
                  onChange={formik.handleChange}
                  value={formik.values.customerId}
                  error={formik.touched.customerId && Boolean(formik.errors.customerId)}
                  helperText={formik.touched.customerId && formik.errors.customerId}
                  InputProps={{
                    endAdornment: getCustomersLoading ? <CircularProgress color="inherit" size={20} /> : null
                  }}
                  SelectProps={{
                    classes: { icon: getCustomersLoading ? classes.hideIcon : '' },
                  }}
                >
                  <MenuItem key={null} value={null}>
                    Escolha a empresa
                  </MenuItem>
                  {customersList && customersList.map((customer: Customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} lg={3}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="campaignCode"
                  label="Código *"
                  type='number'
                  name="campaignCode"
                  autoComplete="campaignCode"
                  onChange={formik.handleChange}
                  value={formik.values.campaignCode}
                  error={formik.touched.campaignCode && Boolean(formik.errors.campaignCode)}
                  helperText={formik.touched.campaignCode && formik.errors.campaignCode}
                />
              </Grid>
              <Grid item xs={12} lg={9}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="name"
                  label="Nome *"
                  name="name"
                  autoComplete="name"
                  onChange={formik.handleChange}
                  value={formik.values.name}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12} lg={3}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="destinoFeriasFee"
                  label="Taxa destino férias *"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                  type="number"
                  name="destinoFeriasFee"
                  autoComplete="destinoFeriasFee"
                  onChange={formik.handleChange}
                  value={formik.values.destinoFeriasFee}
                  error={formik.touched.destinoFeriasFee && Boolean(formik.errors.destinoFeriasFee)}
                  helperText={formik.touched.destinoFeriasFee && formik.errors.destinoFeriasFee}
                />
              </Grid>
              <div style={{ width: '100%', margin: '32px 0 16px' }}>
                <Divider>
                  <Chip className={classes.chip} label="Configuração" />
                </Divider>
              </div>
              <Grid item xs={12} lg={4}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="campaignConfig.webpremiosClientId"
                  label="client_id"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  name="campaignConfig.webpremiosClientId"
                  autoComplete="campaignConfig.webpremiosClientId"
                  onChange={formik.handleChange}
                  value={formik.values.campaignConfig.webpremiosClientId}
                />
              </Grid>
              <Grid item xs={12} lg={8}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="campaignConfig.webpremiosScope"
                  label="scope"
                  name="campaignConfig.webpremiosScope"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  autoComplete="campaignConfig.webpremiosScope"
                  onChange={formik.handleChange}
                  value={formik.values.campaignConfig.webpremiosScope}
                />
              </Grid>
              <Grid item xs={12} lg={8}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="campaignConfig.redirectUrlAuth"
                  label="redirect url_auth"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  name="campaignConfig.redirectUrlAuth"
                  autoComplete="campaignConfig.redirectUrlAuth"
                  onChange={formik.handleChange}
                  value={formik.values.campaignConfig.redirectUrlAuth}
                />
              </Grid>
              <Grid item xs={12} lg={4}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="campaignConfig.conversionRate"
                  label="Taxa de conversão (Qtd. de pontos equivalente a R$ 1,00)"
                  type="number"
                  name="campaignConfig.conversionRate"
                  autoComplete="campaignConfig.conversionRate"
                  onChange={formik.handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={formik.values.campaignConfig.conversionRate}
                />
              </Grid>
            </Grid>

            <Grid container item alignItems="center" justifyContent='space-between' className={classes.footer}>
              <Typography variant='subtitle2'>
                * Campos obrigatórios
              </Typography>
              <Button
                type="submit"
                size="large"
                variant="contained"
                color="primary"
                disabled={formik.isSubmitting}
              >
                Salvar
              </Button>
            </Grid>

            {formik.isSubmitting && <FormLoadingComponent />}
          </form>
        </Paper>
      </Container>
    </LayoutWithMenu>
  );
}
