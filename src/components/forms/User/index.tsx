import {
  Button,
  ButtonGroup,
  Container,
  createStyles,
  Grid,
  IconButton,
  makeStyles,
  MenuItem,
  Paper,
  Switch,
  TextField,
  TextFieldProps,
  Theme,
  Typography,
} from '@material-ui/core';
import {
  CircularProgress,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import InputMask from "react-input-mask"
import { useFormik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';

import useService from 'hooks/useService';
import UserService from 'services/api/User';
import { Customer } from 'models/Customer';
import { Profile } from 'models/Profile';
import { Campaign } from 'models/Campaign';
import useNotification from 'hooks/useNotification'
import { NotificationTypes } from 'contexts/NotificationContext';
import LayoutWithMenu from 'components/layout/LayoutWithMenu/LayoutWithMenu';
import FormLoadingComponent from 'components/screen/FormLoading/FormLoading';
import CurrencyField from 'components/forms/UI/CurrencyField'
import CustomerService from 'services/api/Customer';
import CampaignService from 'services/api/Campaign';

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
    },
    paper: {
      width: '100%',
      padding: theme.spacing(2),
      margin: `32px auto`
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
  const [campaignsList, setCampaignsList] = useState(null)

  const [getUserById] = useService(UserService.getUserById)
  const [createUser] = useService(UserService.createUser)
  const [editUser] = useService(UserService.editUser)
  const [getAllCampaigns, getAllCampaignsLoading] = useService(CampaignService.getAllCampaigns)

  const [automaticPassword, setAutomaticPassword] = useState(true)

  const [balanceActionType, setBalanceActionType] = useState(null);
  const [balanceData, setBalanceData] = useState(null);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const [balanceAction] = useService(UserService.balanceAction)

  const [getCustomers, getCustomersLoading] = useService(CustomerService.getAllCustomers)
  const [getProfiles, getProfilesLoading] = useService(UserService.getProfiles)

  const { notify } = useNotification()

  const initialValues: any = {
    name: '',
    lastName: '',
    documentNumber: '',
    cellPhone: '',
    customerId: '',
    profileId: '',
    userName: '',
    password: '',
    enabled: true,
    balance: '',
    campaignId: ''
  }

  const formSchema = Yup.object().shape({
    name: Yup.string()
      .required('Obrigatório'),
    lastName: Yup.string()
      .required('Obrigatório'),
    documentNumber: Yup.string(),
    cellPhone: Yup.string()
      .required('Obrigatório'),
    customerId: Yup.string()
      .required('Obrigatório'),
    profileId: Yup.string()
      .required('Obrigatório'),
    userName: Yup.string()
      .email('E-mail inválido')
      .required('Obrigatório'),
    balance: Yup.string().nullable()
      .when('profileId', {
        is: (profileId) => String(profileId) === '4' && !id,
        then: Yup.string().nullable().required('Obrigatório'),
        otherwise: Yup.string().nullable().notRequired()
      }),
    campaignId: Yup.string().nullable()
      .when('profileId', {
        is: (profileId) => String(profileId) === '4',
        then: Yup.string().nullable().required('Obrigatório'),
        otherwise: Yup.string().nullable().notRequired()
      })
  });

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: formSchema,
    onSubmit: async (values) => {
      const { documentNumber, cellPhone, ...rest } = values
      const formattedDocumentNumber = documentNumber ? documentNumber.replace(/\D/g, "") : documentNumber
      const formattedCellPhone = cellPhone ? cellPhone.replace(/\D/g, "") : cellPhone

      const updatedValues = {
        documentNumber: formattedDocumentNumber,
        cellPhone: formattedCellPhone,
        ...rest
      }

      try {
        if (id) {
          await editUser({
            id,
            ...updatedValues
          })
        } else {
          await createUser(updatedValues)
        }
        notify({
          id: 'success',
          message: `Usuário ${!!id ? 'editado' : 'adicionado'} com sucesso`,
          type: NotificationTypes.SUCCESS
        })
        formik.setSubmitting(false);
        router.back()
      } catch (error) {
        const errorMsg = error?.response?.data?.error
        notify({
          id: 'error',
          message: errorMsg || `Ocorreu um erro. Por favor, tente novamente mais tarde.`,
          type: NotificationTypes.ERROR
        })
        formik.setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (automaticPassword) {
      formik.setFieldValue("password", null)
    }
  }, [automaticPassword])

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

  useEffect(() => {
    let userCustomerId: string | null = null
    if (formik?.values.customerId !== '') {
      userCustomerId = String(formik.values.customerId)
    }

    if (userCustomerId) {
      getAllCampaigns({ customerId: userCustomerId, own: true })
        .then(campaigns => {
          if (!!campaigns) {
            setCampaignsList(campaigns)
          }
        })
        .catch(error => {
          console.log(error)
        })
    }
  }, [formik.values.customerId])

  const balanceTitles = {
    credit: 'Creditar',
    debit: 'Debitar',
    refund: 'Estornar'
  }

  const handleChangeBalanceData = (name, value) => {
    setBalanceData({
      ...balanceData,
      [name]: value
    })
  }

  const handleCloseBalanceDialog = () => {
    setBalanceActionType(null)
    setBalanceData(null)
  }

  const handleBalanceAction = async () => {
    if (!id) return false

    const balanceBody = {
      userId: id,
      ...balanceData
    }

    try {
      setBalanceLoading(true)
      await balanceAction({
        type: balanceActionType,
        ...balanceBody
      })
      notify({
        id: 'success',
        message: `Saldo atualizado com sucesso!`,
        type: NotificationTypes.SUCCESS
      })
      setOpenConfirmationDialog(false)
      handleCloseBalanceDialog()
      setTimeout(() => {
        router.reload();
      }, 1500);
    } catch (error) {
      console.log(error)
      notify({
        id: 'error',
        message: `Ocorreu um erro. Por favor, tente novamente mais tarde.`,
        type: NotificationTypes.ERROR
      })
      setOpenConfirmationDialog(false)
      handleCloseBalanceDialog()
    }
  }

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
            <Grid item md={12} style={{ display: 'flex', paddingBottom: 16, alignItems: 'center' }}>
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
            <Grid container alignItems="flex-start" spacing={2}>
              <Grid item md={6}>
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
                  value={formik.values.name || ''}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item md={6}>
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
                  value={formik.values.lastName || ''}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && formik.errors.lastName}
                />
              </Grid>
              <Grid item md={6}>
                <InputMask
                  mask="999.999.999-99"
                  color="secondary"
                  id="documentNumber"
                  name="documentNumber"
                  autoComplete="documentNumber"
                  onChange={formik.handleChange}
                  value={formik.values.documentNumber || ''}
                >
                  {(inputProps: JSX.IntrinsicAttributes & TextFieldProps) => (
                    <TextField
                      {...inputProps}
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      label="CPF *"
                      error={formik.touched.documentNumber && Boolean(formik.errors.documentNumber)}
                      helperText={formik.touched.documentNumber && formik.errors.documentNumber}
                    />
                  )}
                </InputMask>
              </Grid>
              <Grid item md={6}>
                <InputMask
                  mask="(99) 99999-9999"
                  color="secondary"
                  id="cellPhone"
                  name="cellPhone"
                  autoComplete="cellPhone"
                  onChange={formik.handleChange}
                  value={formik.values.cellPhone || ''}
                >
                  {(inputProps: JSX.IntrinsicAttributes & TextFieldProps) => (
                    <TextField
                      {...inputProps}
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      label="Celular *"
                      error={formik.touched.cellPhone && Boolean(formik.errors.cellPhone)}
                      helperText={formik.touched.cellPhone && formik.errors.cellPhone}
                    />
                  )}
                </InputMask>
              </Grid>
              <Grid item xs={12} md={6}>
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
                  value={formik.values.customerId || ''}
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
              <Grid item xs={12} md={6}>
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
                  value={formik.values.profileId || ''}
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
              <Grid item md={5}>
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
                  value={formik.values.userName || ''}
                  error={formik.touched.userName && Boolean(formik.errors.userName)}
                  helperText={formik.touched.userName && formik.errors.userName}
                />
              </Grid>
              <Grid item md={4} style={{ display: 'flex', alignItems: 'center', paddingTop: 32, justifyContent: 'center' }}>
                <Typography variant="caption">Senha manual</Typography>
                <Switch
                  disabled={!!id}
                  checked={automaticPassword}
                  onChange={selectedOption =>
                    setAutomaticPassword(selectedOption.target.checked)
                  }
                  inputProps={{ 'aria-label': 'controlled' }}
                />
                <Typography variant="caption">Senha automática</Typography>
              </Grid>
              <Grid item md={3}>
                <TextField
                  disabled={automaticPassword || !!id}
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="password"
                  label="Senha"
                  name="password"
                  autoComplete="password"
                  onChange={formik.handleChange}
                  value={automaticPassword ? '' : formik.values.password || ''}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                />
              </Grid>
            </Grid>
            <Paper className={classes.paper} elevation={3}>
              <div style={{ width: '100%', margin: '0 0 32px 0' }}>
                <Divider>
                  <Chip className={classes.chip} label="Configuração de pontos" />
                </Divider>
              </div>
              <Grid container spacing={2} style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', margin: '0 0 32px 0' }}>
                <Grid item md={9}>
                  <TextField
                    color="secondary"
                    variant="outlined"
                    margin="normal"
                    select
                    fullWidth
                    style={{ width: '100%' }}
                    id="campaignId"
                    label="Campanha *"
                    name="campaignId"
                    autoComplete="campaignId"
                    onChange={formik.handleChange}
                    value={formik.values.campaignId || ''}
                    error={formik.touched.campaignId && Boolean(formik.errors.campaignId)}
                    helperText={formik.touched.campaignId && formik.errors.campaignId}
                    disabled={!campaignsList || formik.values.profileId !== 4}
                    InputProps={{
                      endAdornment: getAllCampaignsLoading ? <CircularProgress color="inherit" size={20} /> : null
                    }}
                    SelectProps={{
                      classes: { icon: getAllCampaignsLoading ? classes.hideIcon : '' },
                    }}
                  >
                    <MenuItem key={''} value={''}>
                      Escolha a campanha
                    </MenuItem>
                    {campaignsList && campaignsList.length > 0 && campaignsList.map((campaign: Campaign) => {
                      return (
                        <MenuItem key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </MenuItem>
                      )})}
                  </TextField>
                </Grid>
                <Grid item md={3}>
                  <CurrencyField
                    disabled={!!id || formik.values.profileId !== 4}
                    color="secondary"
                    variant="outlined"
                    margin="normal"
                    onValueChange={formik.setFieldValue}
                    initialValue={formik.values.balance || ''}
                    value={formik.values.balance || ''}
                    name="balance"
                    id="balance"
                    label="Saldo *"
                    error={formik.touched.balance && Boolean(formik.errors.balance)}
                    helperText={formik.touched.balance && formik.errors.balance}
                  />
                </Grid>
              </Grid>
              <Grid item md={12}>
                  <ButtonGroup variant="outlined" disabled={!id || formik.values.profileId !== 4} style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button color="primary" onClick={() => setBalanceActionType('credit')}>Creditar</Button>
                    <Button color="primary" onClick={() => setBalanceActionType('debit')}>Debitar</Button>
                    <Button color="primary" onClick={() => setBalanceActionType('refund')}>Estornar</Button>
                  </ButtonGroup>
                </Grid>
            </Paper>

            <Grid container item alignItems="center" justifyContent='space-between' className={classes.footer}>
              <Typography variant='subtitle2'>
                * Campos obrigatórios
              </Typography>
              <Button
                type="submit"
                size="large"
                variant="contained"
                color="primary"
                disabled={formik.isSubmitting || balanceLoading}
              >
                Salvar
              </Button>
            </Grid>

            {(formik.isSubmitting || balanceLoading) && <FormLoadingComponent />}
          </form>
        </Paper>
      </Container>

      <Dialog open={openConfirmationDialog} onClose={() => setOpenConfirmationDialog(false)}>
        <DialogTitle>Confirmação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja realmente <u style={{ textTransform: 'lowercase' }}> {!!balanceActionType ? balanceTitles[balanceActionType] : ''}</u> <b> {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(balanceData?.value) || ''}</b> do saldo?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmationDialog(false)}>Não</Button>
          <Button onClick={handleBalanceAction}>Sim</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!balanceActionType} onClose={handleCloseBalanceDialog}>
        <DialogTitle>{!!balanceActionType ? balanceTitles[balanceActionType] : ''} saldo</DialogTitle>
        <DialogContent>
          <CurrencyField
            color="secondary"
            variant="outlined"
            margin="normal"
            onValueChange={handleChangeBalanceData}
            initialValue={balanceData?.value || 0}
            value={balanceData?.value || 0}
            name="value"
            id="value"
            label="Valor"
          />
          <TextField
            margin="normal"
            id="description"
            name="description"
            label="Descrição"
            multiline
            maxRows={3}
            fullWidth
            variant="standard"
            onChange={e => handleChangeBalanceData(e.target.name, e.target.value)}
            value={balanceData?.description || ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBalanceDialog}>Cancelar</Button>
          <Button onClick={() => setOpenConfirmationDialog(true)} disabled={!balanceData?.value || !balanceData?.description}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </LayoutWithMenu>
  );
}
