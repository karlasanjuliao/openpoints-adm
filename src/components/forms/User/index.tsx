import {
  Button,
  Container,
  createStyles,
  Grid,
  IconButton,
  makeStyles,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core';
import {
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useFormik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';

import useService from 'hooks/useService';
import UserService from 'services/api/User';
import { Customer } from 'models/Customer';
import { Profile } from 'models/Profile';
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
  })
);

export default function User() {
  const classes = useStyles();
  const router = useRouter();
  const { id } = router.query;

  const [title, setTitle] = useState('Novo Usuário');
  const [customersList, setCustomersList] = useState(null)
  const [profileList, setProfileList] = useState(null)

  const [getUserById] = useService(UserService.getUserById)
  const [createUser] = useService(UserService.createUser)
  const [editUser] = useService(UserService.editUser)

  const [getCustomers, getCustomersLoading] = useService(CustomerService.getAllCustomers)
  const [getProfiles, getProfilesLoading] = useService(UserService.getProfiles)

  const { notify } = useNotification()

  const initialValues: any = {
    name: '',
    lastName: '',
    customerId: '',
    profileId: '',
    userName: '',
    password: '',
    enabled: true
  }

  const formSchema = Yup.object().shape({
    name: Yup.string()
      .required('Obrigatório'),
    lastName: Yup.string()
      .required('Obrigatório'),
    customerId: Yup.string()
      .required('Obrigatório'),
    profileId: Yup.string()
      .required('Obrigatório'),
    userName: Yup.string().email('E-mail inválido').required('Obrigatório')
  });

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: formSchema,
    onSubmit: async (values) => {
      try {
        console.log('user final -> ', values)
        if (id) {
          await editUser({
            id,
            ...values
          })
        } else {
          await createUser(values)
        }
        notify({
          id: 'success',
          message: `Usuário adicionado com sucesso`,
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
      getUserById({ id: String(id) }).then((response) => {
        setTitle(`Editando o usuário: ${response.name}`);
        formik.setValues({ ...response });
      })
    }
  }, [id]);

  useEffect(() => {
    Promise.all([
      getCustomers(null),
      getProfiles(null)
    ]).then(([customers, profiles]) => {
        setCustomersList(customers)
        setProfileList(profiles)
      }).catch(error => {
        console.log(error)
      })
  }, [])

  return (
    <LayoutWithMenu>
      <Container maxWidth='xl'>
        <div className={classes.toolbar}>
          <Link href="/cadastros/usuarios" passHref>
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
              <Grid item lg={6}>
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
              <Grid item lg={6}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="lastName"
                  label="Sobrenome *"
                  name="lastName"
                  autoComplete="lastName"
                  onChange={formik.handleChange}
                  value={formik.values.lastName}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && formik.errors.lastName}
                />
              </Grid>
              <Grid item xs={12} lg={6}>
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
              <Grid item xs={12} lg={6}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  select
                  fullWidth
                  id="profileId"
                  label="Perfil"
                  name="profileId"
                  autoComplete="profileId"
                  onChange={formik.handleChange}
                  value={formik.values.profileId}
                  error={formik.touched.profileId && Boolean(formik.errors.profileId)}
                  helperText={formik.touched.profileId && formik.errors.profileId}
                  InputProps={{
                    endAdornment: getProfilesLoading ? <CircularProgress color="inherit" size={20} /> : null
                  }}
                  SelectProps={{
                    classes: { icon: getProfilesLoading ? classes.hideIcon : '' },
                  }}
                >
                  <MenuItem key={null} value={null}>
                    Escolha o perfil
                  </MenuItem>
                  {profileList && profileList.map((profile: Profile) => (
                    <MenuItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item lg={5}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="userName"
                  label="E-mail *"
                  name="userName"
                  autoComplete="userName"
                  onChange={formik.handleChange}
                  value={formik.values.userName}
                  error={formik.touched.userName && Boolean(formik.errors.userName)}
                  helperText={formik.touched.userName && formik.errors.userName}
                />
              </Grid>
              {!id && (
                <Grid item lg={4}>
                  <TextField
                    color="secondary"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    id="password"
                    label="Senha"
                    name="password"
                    autoComplete="password"
                    onChange={formik.handleChange}
                    value={formik.values.password}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                  />
                </Grid>
              )}
              <Grid item lg={2} style={{ display: 'flex', paddingTop: 40, marginLeft: 'auto' }}>
                <Typography>Inativo</Typography>
                <Switch
                  checked={formik.values.enabled}
                  onChange={selectedOption =>
                    formik.setFieldValue("enabled", selectedOption.target.checked)
                  }
                  inputProps={{ 'aria-label': 'controlled' }}
                />
                <Typography>Ativo</Typography>
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
