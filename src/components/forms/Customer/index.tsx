import {
  Box,
  Button,
  Container,
  createStyles,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Switch,
  TextField,
  TextFieldProps,
  Theme,
  Typography,
} from '@material-ui/core';
import InputMask from "react-input-mask"
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useFormik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';

import useService from 'hooks/useService';
import useNotification from 'hooks/useNotification'
import { NotificationTypes } from 'contexts/NotificationContext';
import LayoutWithMenu from 'components/layout/LayoutWithMenu/LayoutWithMenu';
import FormLoadingComponent from 'components/screen/FormLoading/FormLoading';
import CustomerService from 'services/api/Customer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mainContainer: {
      [theme.breakpoints.down("xs")]: {
        padding: 0
      },
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
    },
    form: {
      marginTop: theme.spacing(3),
      padding: theme.spacing(3),
    },
    footer: {
      marginTop: theme.spacing(2),
      [theme.breakpoints.down("md")]: {
        marginTop: 0,
        display: 'flex',
        flexDirection: 'column',
        '& > button' : {
          width: '100%',
          margin: '16px 0'
        }
      },
    },
    switch: {
      display: 'flex',
      margin: '16px auto',
      [theme.breakpoints.up("md")]: {
        paddingTop: 40,
        margin: '0 0 0 auto',
      },
    }
  })
);

export default function Customer() {
  const classes = useStyles();
  const [title, setTitle] = useState('Nova Empresa');
  const router = useRouter();
  const { id } = router.query;

  const [getCustomerById] = useService(CustomerService.getCustomerById)
  const [createCustomer] = useService(CustomerService.createCustomer)
  const [editCustomer] = useService(CustomerService.editCustomer)

  const { notify } = useNotification()

  const initialValues: any = {
    socialName: '',
    name: '',
    cnpj: '',
    address: '',
    number: '',
    neighborhood: '',
    zipCode: '',
    phone: '',
    email: '',
    enabled: true
  }

  const formSchema = Yup.object().shape({
    socialName: Yup.string()
      .required('Obrigatório'),
    name: Yup.string()
      .required('Obrigatório'),
    cnpj: Yup.string()
      .required('Obrigatório'),
    address: Yup.string()
      .required('Obrigatório'),
    number: Yup.string()
      .required('Obrigatório'),
    zipCode: Yup.string()
      .required('Obrigatório'),
    neighborhood: Yup.string()
      .required('Obrigatório'),
    email: Yup.string().email('E-mail inválido').required('Obrigatório')
  });

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: formSchema,
    onSubmit: async (values) => {
      try {
        console.log('customer final -> ', values)
        if (id) {
          await editCustomer({
            id,
            ...values
          })
        } else {
          await createCustomer(values)
        }
        notify({
          id: 'success',
          message: `Empresa ${id ? 'editada' : 'adicionada'} com sucesso`,
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
        router.replace(`/cadastros/empresas`)
      }
    },
  });

  useEffect(() => {
    if (id) {
      getCustomerById({ id: Number(id) }).then((response) => {
        setTitle(`Editando a empresa: ${response.name}`);
        formik.setValues({ ...response });
      })
    }
  }, [id]);

  return (
    <LayoutWithMenu>
      <Container maxWidth='xl' className={classes.mainContainer}>
        <div className={classes.toolbar}>
          <Link href="/cadastros/empresas" passHref>
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
              <Grid item xs={12} md={6}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="socialName"
                  label="Razão Social *"
                  name="socialName"
                  autoComplete="socialName"
                  autoFocus
                  onChange={formik.handleChange}
                  value={formik.values.socialName}
                  error={formik.touched.socialName && Boolean(formik.errors.socialName)}
                  helperText={formik.touched.socialName && formik.errors.socialName}
                />
              </Grid>
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={3}>
                <InputMask
                  mask="99.999.999/9999-99"
                  color="secondary"
                  id="cnpj"
                  name="cnpj"
                  autoComplete="cnpj"
                  onChange={formik.handleChange}
                  value={formik.values.cnpj}
                >
                  {(inputProps: JSX.IntrinsicAttributes & TextFieldProps) => (
                    <TextField
                      {...inputProps}
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      label="CNPJ *"
                      error={formik.touched.cnpj && Boolean(formik.errors.cnpj)}
                      helperText={formik.touched.cnpj && formik.errors.cnpj}
                    />
                  )}
                </InputMask>
              </Grid>
              <Grid item xs={12} md={9}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="address"
                  label="Endereço *"
                  name="address"
                  autoComplete="address"
                  onChange={formik.handleChange}
                  value={formik.values.address}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="number"
                  label="Número *"
                  name="number"
                  autoComplete="number"
                  onChange={formik.handleChange}
                  value={formik.values.number}
                  error={formik.touched.number && Boolean(formik.errors.number)}
                  helperText={formik.touched.number && formik.errors.number}
                />
              </Grid>
              <Grid item xs={6} md={3}>
              <InputMask
                  mask="99.999-999"
                  color="secondary"
                  id="zipCode"
                  name="zipCode"
                  autoComplete="zipCode"
                  onChange={formik.handleChange}
                  value={formik.values.zipCode}
                >
                  {(inputProps: JSX.IntrinsicAttributes & TextFieldProps) => (
                    <TextField
                      {...inputProps}
                      color="secondary"
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      label="CEP *"
                      error={formik.touched.zipCode && Boolean(formik.errors.zipCode)}
                      helperText={formik.touched.zipCode && formik.errors.zipCode}
                    />
                  )}
                </InputMask>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="neighborhood"
                  label="Bairro *"
                  name="neighborhood"
                  autoComplete="neighborhood"
                  onChange={formik.handleChange}
                  value={formik.values.neighborhood}
                  error={formik.touched.neighborhood && Boolean(formik.errors.neighborhood)}
                  helperText={formik.touched.neighborhood && formik.errors.neighborhood}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <InputMask
                  mask="(99) 9999-9999"
                  color="secondary"
                  id="phone"
                  name="phone"
                  autoComplete="phone"
                  onChange={formik.handleChange}
                  value={formik.values.phone}
                >
                  {(inputProps: JSX.IntrinsicAttributes & TextFieldProps) => (
                    <TextField
                      {...inputProps}
                      color="secondary"
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      label="Telefone"
                      error={formik.touched.phone && Boolean(formik.errors.phone)}
                      helperText={formik.touched.phone && formik.errors.phone}
                    />
                  )}
                </InputMask>
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="email"
                  label="E-mail *"
                  name="email"
                  autoComplete="email"
                  onChange={formik.handleChange}
                  value={formik.values.email}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              <Box className={classes.switch}>
                <Typography>Inativo</Typography>
                <Switch
                  checked={formik.values.enabled}
                  onChange={selectedOption =>
                    formik.setFieldValue("enabled", selectedOption.target.checked)
                  }
                  inputProps={{ 'aria-label': 'controlled' }}
                />
                <Typography>Ativo</Typography>
              </Box>
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
