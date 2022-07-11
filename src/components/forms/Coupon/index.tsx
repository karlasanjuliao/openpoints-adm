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
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  FormLabel,
  FormControlLabel
} from '@mui/material';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useFormik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import MaterialTable from 'material-table'

import useService from 'hooks/useService';
import { Profile } from 'models/Profile';
import { Campaign } from 'models/Campaign';
import useNotification from 'hooks/useNotification'
import { NotificationTypes } from 'contexts/NotificationContext';
import LayoutWithMenu from 'components/layout/LayoutWithMenu/LayoutWithMenu';
import FormLoadingComponent from 'components/screen/FormLoading/FormLoading';
import CampaignService from 'services/api/Campaign';
import CouponService from 'services/api/Coupon';
import { UsedCouponCodeRequest } from 'services/api/Coupon/requests';
import { CouponCode } from 'models/Coupon';

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
    paper: {
      width: '100%',
      padding: theme.spacing(2),
      margin: `32px auto`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    codeList: {
      width: '100%',
      padding: theme.spacing(2),
      margin: `32px auto`
    },
    chip: {
      backgroundColor: '#fd665e !important',
      color: '#ffffff !important',
      fontWeight: 700
    },
  })
);

type CouponCodeUsedDataProps = UsedCouponCodeRequest & {
  couponCode?: string
}
const initialCouponCodeUsedData = {
  note: 'Reserva feita manualmente usando o cupom do cliente'
}

export default function Coupon() {
  const classes = useStyles();
  const router = useRouter();
  const { id } = router.query;

  const [getAllCampaigns, getAllCampaignsLoading] = useService(CampaignService.getAllCampaigns)

  const [title, setTitle] = useState('Novo Cupom');

  const [getCouponById] = useService(CouponService.getCouponById)
  const [createCoupon] = useService(CouponService.createCoupon)
  const [editCoupon] = useService(CouponService.editCoupon)

  const [disableCouponCode] = useService(CouponService.disableCouponCode)
  const [usedCouponCode] = useService(CouponService.usedCouponCode)

  const [automaticCoupon, setAutomaticCoupon] = useState(false)

  const [campaignsList, setCampaignsList] = useState(null)

  const [couponCodes, setCouponCodes] = useState(null)

  const [couponCodeUsedData, setCouponCodeUsedData] =
    useState<CouponCodeUsedDataProps>(initialCouponCodeUsedData);

  const { notify } = useNotification()

  const initialValues: any = {
    automaticCode: '',
    couponCode: '',
    description: '',
    value: '',
    discountType: '',
    campaignId: '',
    email: '',
    minPurchaseValue: '',
    maxPurchaseValue: '',
    quantity: '',
    expirationDate: '',
    air: true,
    hotel: true,
    car: true,
    experience: true
  }

  const discountTypeList = [
    {
      id: 1,
      name: 'PONTOS'
    },
    {
      id: 2,
      name: 'PERCENTUAL'
    }
  ]

  const handleIntegerFieldsChange = (e) => {
    const { name, value } = e.target
    return formik.setFieldValue(name, value.replace(/[^0-9]/g, ''))
  }

  const formSchema = Yup.object().shape({
    couponCode: Yup.string(),
    description: Yup.string()
      .required('Obrigatório'),
    discountType: Yup.string()
        .required('Obrigatório'),
    value: Yup.string()
      .when('discountType', {
        is: (discountType) => String(discountType) === '2',
        then: Yup
          .string()
          .test('max100%', 'Valor máximo permitido: 100', (value) => Number(value) <= 100)
          .required('Obrigatório'),
        otherwise: Yup.string().required('Obrigatório')
      }),
    campaignId: Yup.string(),
    email: Yup.string()
      .nullable()
      .email('E-mail inválido'),
    minPurchaseValue: Yup.string()
      .required('Obrigatório'),
    maxPurchaseValue: Yup.string()
      .required('Obrigatório'),
    quantity: Yup.string()
      .required('Obrigatório'),
    expirationDate: Yup.string()
      .required('Obrigatório'),
    });

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: formSchema,
    onSubmit: async (values) => {

      try {
        if (id) {
          await editCoupon({
            id,
            ...values
          })
        } else {
          await createCoupon(values)
        }
        notify({
          id: 'success',
          message: `Cupom ${!!id ? 'editado' : 'adicionado'} com sucesso`,
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
    formik.setFieldValue("automaticCode", automaticCoupon)
  }, [automaticCoupon])

  useEffect(() => {
    if (id) {
      getCouponById({ id: String(id) }).then((response) => {
        setTitle(`Editando o cupom: ${response.couponCode}`);
        formik.setValues({ ...response });

        if (response?.couponCodes) {
          setCouponCodes(response?.couponCodes)
        }
      })
    }
  }, [id]);

  useEffect(() => {
    getAllCampaigns(undefined)
      .then(campaigns => {
        setCampaignsList(campaigns)
      })
      .catch(error => {
        console.log(error)
      })
  }, [])

  const handleCouponCodeDisabling = async (id) => {
    try {
      await disableCouponCode({ id })
      notify({
        id: 'success',
        message: `Cupom ${id} desabilitado com sucesso`,
        type: NotificationTypes.SUCCESS
      })
    } catch (error) {
      notify({
        id: 'error',
        message: `Ocorreu um erro. Por favor, tente novamente mais tarde.`,
        type: NotificationTypes.ERROR
      })
    }
  }

  const handleCouponCodeUsing = async () => {
    const { couponCode, ...couponCodeUsedRequest } = couponCodeUsedData

    try {
      await usedCouponCode(couponCodeUsedRequest)
      notify({
        id: 'success',
        message: `Cupom ${couponCode} utilizado manualmente com sucesso!`,
        type: NotificationTypes.SUCCESS
      })
    } catch (error) {
      notify({
        id: 'error',
        message: `Ocorreu um erro. Por favor, tente novamente mais tarde.`,
        type: NotificationTypes.ERROR
      })
    }
  }

  return (
    <LayoutWithMenu>
      <Container maxWidth='xl'>
        <div className={classes.toolbar}>
          <Link href="/cadastros/cupons-desconto" passHref>
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
              <Grid item style={{ display: 'flex', alignItems: 'center', paddingTop: 40 }}>
                <Typography variant="caption">Cupom manual</Typography>
                <Switch
                  disabled={!!id}
                  checked={automaticCoupon}
                  onChange={selectedOption =>
                    setAutomaticCoupon(selectedOption.target.checked)
                  }
                  inputProps={{ 'aria-label': 'controlled' }}
                />
                <Typography variant="caption">Cupom randômico</Typography>
              </Grid>
              <Grid item md={3}  style={{ marginRight: 'auto' }}>
                <TextField
                  disabled={!!id}
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="couponCode"
                  label="Código do cupom"
                  name="couponCode"
                  autoComplete="couponCode"
                  onChange={e => formik.setFieldValue('couponCode', e.target.value.toLocaleUpperCase())}
                  value={formik.values.couponCode || ''}
                  error={formik.touched.couponCode && Boolean(formik.errors.couponCode)}
                  helperText={formik.touched.couponCode && formik.errors.couponCode}
                  inputProps={{ maxLength: 15 }}
                />
              </Grid>

              <Grid item md={12}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="description"
                  label="Descrição *"
                  name="description"
                  autoComplete="description"
                  onChange={formik.handleChange}
                  value={formik.values.description || ''}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                  inputProps={{ maxLength: 50 }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  disabled={!!id}
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  select
                  fullWidth
                  id="discountType"
                  label="Tipo de desconto"
                  name="discountType"
                  autoComplete="discountType"
                  onChange={formik.handleChange}
                  value={formik.values.discountType}
                  error={formik.touched.discountType && Boolean(formik.errors.discountType)}
                  helperText={formik.touched.discountType && formik.errors.discountType}
                >
                  <MenuItem key={null} value={null}>
                    Escolha o tipo de desconto
                  </MenuItem>
                  {discountTypeList && discountTypeList.map((discountType: Profile) => (
                    <MenuItem key={discountType.id} value={discountType.id}>
                      {discountType.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item md={3}>
                <TextField
                  disabled={!!id}
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="value"
                  label="Valor *"
                  name="value"
                  onChange={e => handleIntegerFieldsChange(e)}
                  value={formik.values.value}
                  error={formik.touched.value && Boolean(formik.errors.value)}
                  helperText={formik.touched.value && formik.errors.value}
                />
              </Grid>
              <Grid item md={6}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  select
                  fullWidth
                  id="campaignId"
                  label="Campanha"
                  name="campaignId"
                  autoComplete="campaignId"
                  onChange={formik.handleChange}
                  value={formik.values.campaignId}
                  error={formik.touched.campaignId && Boolean(formik.errors.campaignId)}
                  helperText={formik.touched.campaignId && formik.errors.campaignId}
                  disabled={!campaignsList}
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
              <Grid item md={6}>
                <TextField
                  disabled={!!id}
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="email"
                  label="Disponível para e-mail"
                  name="email"
                  autoComplete="email"
                  onChange={formik.handleChange}
                  value={formik.values.email || ''}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              <Grid item md={3}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="minPurchaseValue"
                  label="Mínimo de pontos na compra *"
                  name="minPurchaseValue"
                  onChange={e => handleIntegerFieldsChange(e)}
                  value={formik.values.minPurchaseValue}
                  error={formik.touched.minPurchaseValue && Boolean(formik.errors.minPurchaseValue)}
                  helperText={formik.touched.minPurchaseValue && formik.errors.minPurchaseValue}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item md={3}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="maxPurchaseValue"
                  label="Máximo de pontos na compra *"
                  onChange={e => handleIntegerFieldsChange(e)}
                  name="maxPurchaseValue"
                  value={formik.values.maxPurchaseValue}
                  error={formik.touched.maxPurchaseValue && Boolean(formik.errors.maxPurchaseValue)}
                  helperText={formik.touched.maxPurchaseValue && formik.errors.maxPurchaseValue}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item md={6}>
                <TextField
                  disabled={!!id}
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="quantity"
                  label="Quantidade *"
                  name="quantity"
                  onChange={e => handleIntegerFieldsChange(e)}
                  value={formik.values.quantity}
                  error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                  helperText={formik.touched.quantity && formik.errors.quantity}
                />
              </Grid>
              <Grid item md={6}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  type="date"
                  fullWidth
                  id="expirationDate"
                  label="Data de expiração *"
                  name="expirationDate"
                  onChange={formik.handleChange}
                  value={formik.values.expirationDate}
                  error={formik.touched.expirationDate && Boolean(formik.errors.expirationDate)}
                  helperText={formik.touched.expirationDate && formik.errors.expirationDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>

            <Paper className={classes.paper} elevation={3}>
              <FormLabel component="legend">Permitido para os produtos:</FormLabel>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.air}
                    onChange={selectedOption =>
                      formik.setFieldValue("air", selectedOption.target.checked)
                    }
                    inputProps={{ 'aria-label': 'controlled' }}
                    name="air"
                  />
                }
                label="Aéreo"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.hotel}
                    onChange={selectedOption =>
                      formik.setFieldValue("hotel", selectedOption.target.checked)
                    }
                    inputProps={{ 'aria-label': 'controlled' }}
                    name="hotel"
                  />
                }
                label="Hotel"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.car}
                    onChange={selectedOption =>
                      formik.setFieldValue("car", selectedOption.target.checked)
                    }
                    inputProps={{ 'aria-label': 'controlled' }}
                    name="car"
                  />
                }
                label="Carro"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.experience}
                    onChange={selectedOption =>
                      formik.setFieldValue("experience", selectedOption.target.checked)
                    }
                    inputProps={{ 'aria-label': 'controlled' }}
                    name="experience"
                  />
                }
                label="Experiência"
              />
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
                disabled={formik.isSubmitting}
              >
                Salvar
              </Button>
            </Grid>

            {formik.isSubmitting && <FormLoadingComponent />}
          </form>
        </Paper>
        {couponCodes && (
          <Paper className={classes.codeList} elevation={3}>
            <div style={{ width: '100%', margin: '0 0 32px 0' }}>
              <Divider>
                <Chip className={classes.chip} label="Lista de códigos" />
              </Divider>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center', margin: '0 0 32px 0' }}>
              <MaterialTable
                columns={[
                    { title: 'Código', field: 'couponCode' },
                    { title: 'Quantidade', field: 'qtAvailable' }
                ]}
                key={couponCodes?.length}
                data={couponCodes || []}
                options={{
                    pageSize: couponCodes.length,
                    exportButton: true,
                    exportFileName: 'Lista de cupons',
                    search: true,
                    showTitle: false,
                    headerStyle: { position: 'sticky', top: 0 },
                    paging: false
                }}
                actions={[
                  {
                    icon: 'block',
                    tooltip: 'Desabilitar',
                    onClick: (_, { couponCodeId }: CouponCode) => handleCouponCodeDisabling(couponCodeId)
                  },
                  {
                    icon: 'download_done',
                    tooltip: 'Cupom utilizado',
                    onClick: (_, { couponCodeId, couponCode }: CouponCode) => {
                      return setCouponCodeUsedData({
                        ...couponCodeUsedData,
                        couponCodeId,
                        couponCode
                      })
                    }
                  }
                ]}
                localization={{
                    header: {
                        actions: 'Ações'
                    },
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
              />
            </div>
          </Paper>
        )}
      </Container>

      <Dialog
        open={!!couponCodeUsedData?.couponCodeId}
        onClose={() => setCouponCodeUsedData(initialCouponCodeUsedData)}
      >
        <DialogTitle> Código: {couponCodeUsedData?.couponCode} </DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            id="description"
            name="description"
            label="Código da reserva"
            fullWidth
            variant="standard"
            value={couponCodeUsedData?.bookingCode || ''}
            onChange={e => setCouponCodeUsedData({
              ...couponCodeUsedData,
              bookingCode: e.target.value.toLocaleUpperCase()
            })}
          />
          <TextField
            disabled
            margin="normal"
            id="description"
            name="description"
            label="Nota"
            multiline
            maxRows={2}
            fullWidth
            variant="standard"
            value={couponCodeUsedData.note}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCouponCodeUsedData(initialCouponCodeUsedData)}>Cancelar</Button>
          <Button onClick={handleCouponCodeUsing} disabled={!couponCodeUsedData?.bookingCode}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </LayoutWithMenu>
  );
}
