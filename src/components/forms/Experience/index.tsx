import {
  Button,
  Checkbox,
  Container,
  createStyles,
  FormControlLabel,
  Grid,
  IconButton,
  makeStyles,
  MenuItem,
  Paper,
  TextField,
  Theme,
  Typography,
  useMediaQuery
} from '@material-ui/core';
import {
  Autocomplete,
  CircularProgress,
  Chip,
  Divider,
  ImageList,
  ImageListItem,
  ImageListItemBar
} from '@mui/material';
import { Delete as DeleteIcon, ZoomIn as ZoomInIcon, ArrowBack as ArrowBackIcon } from '@material-ui/icons';
import { useFormik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useRef, useEffect, useState } from 'react';
import * as Yup from 'yup';
import Lightbox from 'react-image-lightbox';

import { formatDate } from 'utils'
import firebaseClient from 'services/firebase/client';
import CampaignService from 'services/api/Campaign';
import CustomerService from 'services/api/Customer';
import useService from 'hooks/useService';
import { useAuth } from 'contexts/AuthUserContext';
import ExperienceService from 'services/api/Experience';
import { Customer } from 'models/Customer';
import { Campaign } from 'models/Campaign';
import { Experience, ExperienceDate, ExperienceType } from 'models/Experience';
import useNotification from 'hooks/useNotification'
import useDebounce from 'hooks/useDebounce'
import { NotificationTypes } from 'contexts/NotificationContext';
import LayoutWithMenu from 'components/layout/LayoutWithMenu/LayoutWithMenu';
import FormLoadingComponent from 'components/screen/FormLoading/FormLoading';
import CurrencyField from 'components/forms/UI/CurrencyField'

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
    paper: {
      width: '100%',
      padding: theme.spacing(2),
      margin: `16px auto`
    },
    hideIcon: {
      display: 'none'
    },
    chip: {
      backgroundColor: '#fd665e !important',
      color: '#ffffff !important',
      fontWeight: 700
    },
    experienceDates: {
      width: '100%',
    },
    addExperienceDates: {
      margin: `32px auto`
    },
    titleBar: {
      background:
        'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
    },
    toUpload: {
      opacity: 0.35
    },
    footer: {
      marginTop: theme.spacing(2)
    }
  })
);

const storage = firebaseClient.storage()

const ExperienceForm = () => {
  const classes = useStyles();
  const { authUser } = useAuth()
  const [title, setTitle] = useState('Nova Experiência');

  const [customersList, setCustomersList] = useState(null)
  const [experienceTypesList, setExperienceTypesList] = useState(null)
  const [campaignsList, setCampaignsList] = useState(null)
  const [voucherTypesList, setVoucherTypesList] = useState(null)

  const [cityInputValue, setCityInputValue] = useState('')
  const [openCityInput, setOpenCityInput] = useState(false);
  const [cityOptions, setCityOptions] = useState([]);
  const debouncedCityInputValue: string = useDebounce<string>(cityInputValue, 500);

  const [imageList, setImageList] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [viewerIsOpen, setViewerIsOpen] = useState(false);
  const uploadImageRef = useRef(null);

  const router = useRouter();
  const { id } = router.query;

  const [getExperienceById, getExperienceByIdLoading] = useService(ExperienceService.getExperienceById)
  const [createExperience] = useService(ExperienceService.createExperience)
  const [editExperience] = useService(ExperienceService.editExperience)

  const [deleteExperienceDate] = useService(ExperienceService.deleteExperienceDate)

  const [getExperienceTypes, getExperienceTypesLoading] = useService(ExperienceService.getExperienceTypes)
  const [getVoucherTypes, getVoucherTypesLoading] = useService(ExperienceService.getVoucherTypes)

  const [getCustomers, getCustomersLoading] = useService(CustomerService.getAllCustomers)

  const [getAllCampaigns, getAllCampaignsLoading] = useService(CampaignService.getAllCampaigns)

  const isSystemAdmin = authUser && authUser.profileId === 1

  const { notify } = useNotification()

  const isMobile = useMediaQuery('(max-width:768px)');

  const newExperienceDate = {
    date: '',
    time: '',
    qtAvailable: '',
    newDate: true
  }

  const initialValues: any = {
    name: '',
    customerId: '',
    description: '',
    whatToExpect: '',
    qtParticipants: '',
    category: '',
    experienceTypeId: '',
    voucherTypeId: '',
    campaignId: '',
    duration: '',
    unitDuration: '',
    period: '',
    whatIsIncluded: '',
    whatIsNotIncluded: '',
    importantInfo: '',
    originalPrice: 0,
    price: 0,
    city: null,
    localization: '',
    startDate: '',
    endDate: '',
    cancellationPolicy: '',
    freeCancel: false,
    experienceDates: [
      {
        id: 1,
        ...newExperienceDate
      }
    ]
  }

  const formSchema = Yup.object().shape({
    name: Yup.string()
      .required('Obrigatório'),
    campaignId: Yup.string()
      .nullable()
      .required('Obrigatório'),
    description: Yup.string()
      .required('Obrigatório'),
    qtParticipants: Yup.string()
      .required('Obrigatório'),
    experienceTypeId: Yup.string()
      .required('Obrigatório'),
    voucherTypeId: Yup.string()
      .required('Obrigatório'),
    duration: Yup.string()
      .required('Obrigatório'),
    unitDuration: Yup.string()
      .required('Obrigatório'),
    city: Yup.object().nullable().required('Obrigatório'),
    localization: Yup.string()
      .required('Obrigatório'),
    price: Yup.number()
      .required('Obrigatório'),
    startDate: Yup.string()
      .required('Obrigatório'),
    endDate: Yup.string()
      .required('Obrigatório'),
    experienceDates: Yup.array().of(
      Yup.object().shape({
        date: Yup.string()
          .required('Obrigatório'),
        qtAvailable: Yup.string()
          .required('Obrigatório'),
      })
    ).min(1)
  });

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: formSchema,
    onSubmit: async (formValues) => {
      const updatedValues = (({ city, experienceDates, ...values }) =>
        ({
          ...values,
          cityId: city.id,
          experienceDates: experienceDates.map(({
            id,
            newDate,
            time,
            ...experienceDatesFields
          }) => newDate ? {
            time: time === '' ? null : time,
            ...experienceDatesFields
          } : {
            id,
            time: time === '' ? null : time,
            ...experienceDatesFields
          })
        }))(formValues)
      // console.log('experience final -> ', updatedValues)
      let savedExperience: Experience
      try {
        if (id) {
          savedExperience = await editExperience({
            id,
            ...updatedValues
          })
        } else {
          savedExperience = await createExperience(updatedValues)
        }
        if (savedExperience.id || id) {
          const experienceId = (savedExperience.id || id) as number
          await handeUploadImages(experienceId)
        }
        notify({
          id: 'success',
          message: `Experiência ${id ? 'editada' : 'adicionada'} com sucesso`,
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
      getExperienceById({ id: String(id) }).then((response) => {
        setTitle(`Editando a experiência: ${response.name}`);
        const experienceValues = {
          ...response,
          startDate: formatDate(response.startDate, 'yyyy-MM-dd'),
          endDate: formatDate(response.endDate, 'yyyy-MM-dd'),
          experienceDates: response.experienceDates.map((xpDate) => {
            return ({
              ...xpDate,
              date: xpDate.date,
              time: xpDate.time || ''
            })
          })
        }
        formik.setValues(experienceValues)
      })
      storage.ref(`experience/${id}`).listAll().then(async imageRefs => {
        const storagedImages = await Promise.all(imageRefs.items.map(async (ref, index) => {
          const source = await ref.getDownloadURL()
          return ({
            id: index + 1,
            storagedName: ref?.name,
            source
          })
        }))
        if (storagedImages.length > 0) {
          const sortedImageList = storagedImages.sort((a, b) => a.id - b.id)
          setImageList(sortedImageList)
        }
      })
    }
  }, [id]);

  useEffect(() => {
    Promise.all([
      getCustomers(null),
      getVoucherTypes(null)
    ]).then(([customers, voucherTypes]) => {
        setCustomersList(customers)
        setVoucherTypesList(voucherTypes)
      }).catch(error => {
        console.log(error)
      })
  }, [])

  useEffect(() => {
    let userCustomerId: string | null = null
    if (isSystemAdmin) {
      if (formik?.values.customerId !== '') {
        userCustomerId = String(formik.values.customerId)
      }
    } else if (authUser && String(authUser.customerId)) {
      userCustomerId = String(authUser.customerId)
    }

    if (userCustomerId) {
      Promise.all([
        getAllCampaigns({ customerId: userCustomerId }),
        getExperienceTypes({ customerId: userCustomerId }),
      ]).then(([campaigns, experienceTypes]) => {
          setCampaignsList(campaigns)
          setExperienceTypesList(experienceTypes)
        }).catch(error => {
          console.log(error)
        })
    }
  }, [formik.values.customerId, authUser])

  useEffect(() => {
    if (cityOptions.length > 0 && debouncedCityInputValue.length < 3) {
      setCityOptions([]);
      return;
    }

    (async () => {
      const db = firebaseClient.firestore();
      const result = await db.collection("cities")
                      .where("keyWords", 'array-contains', debouncedCityInputValue.trim().toLowerCase())
                      .get()
      const data = result.docs.map(doc => doc.data());
      if (data) {
        setCityOptions(data);
      }
    })();
  }, [debouncedCityInputValue]);

  useEffect(() => {
    if (!openCityInput) {
      setCityOptions([]);
    }
  }, [openCityInput]);

  const handleAddExperienceDates = () => {
    formik.setFieldValue("experienceDates", [
      ...formik.values.experienceDates,
      {
        id: formik.values.experienceDates.length + 1,
        ...newExperienceDate
      }
    ])
  }

  const handleRemoveExperienceDates = async (experienceDateField: ExperienceDate) => {
    if (!experienceDateField.newDate && experienceDateField.id) {
      deleteExperienceDate(experienceDateField.id).then(() => {
        alert('Data removida com sucesso.')
        formik.setFieldValue(
          "experienceDates",
          formik.values.experienceDates.filter((experienceDate: ExperienceDate) => (
            experienceDate.date !== experienceDateField.date &&
            experienceDate.qtAvailable !== experienceDateField.qtAvailable
          ))
        );
      }).catch(error => {
        alert('Não foi possível remover a data.')
      })
    } else {
      formik.setFieldValue(
        "experienceDates",
        formik.values.experienceDates.filter((experienceDate: ExperienceDate) => (
          experienceDate.date !== experienceDateField.date &&
          experienceDate.qtAvailable !== experienceDateField.qtAvailable
        ))
      );
    }
  };

  const handleClickImagesToUpload = () => {
    if (uploadImageRef) {
      return uploadImageRef.current?.click();
    }
  };

  const handleImagesToUpload = (e: { target: HTMLInputElement; }) => {
    const lastImageId = imageList?.length > 0 ? imageList[imageList.length - 1].id + 1 : 1
    for (let i = 0; i < (e.target as HTMLInputElement).files.length; i++) {
      const newImage = (e.target as HTMLInputElement).files[i] as any;
      const newId = lastImageId + i

      newImage.id = newId;
      newImage.toUpload = true
      newImage.storagedName = `${id}-${newId}`
      newImage.source = URL.createObjectURL(newImage)
      newImage.onload = () => URL.revokeObjectURL(newImage.source)

      setImageList((prevState) => !prevState ? [newImage] : [...prevState, newImage]);
    }
  }

  const handeUploadImages = async (id: number) => {
    const imagesToUpload = imageList.filter(img => img.toUpload)
    if (imagesToUpload.length === 0) return

    if (!storage) return

    const promises = []

    imagesToUpload.map((img) => {
      const uploadTask = storage.ref(`experience/${id}/${img.storagedName}`).put(img);
      promises.push(uploadTask);
    })

    Promise.all(promises)
      .catch((err) => console.log(err));
  }

  const openLightbox = useCallback((index) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  }, []);

  const closeLightbox = () => {
    setCurrentImage(0);
    setViewerIsOpen(false);
  };

  const handleDeleteImage = (image) => {
    const updatedImageList = imageList.filter(img => img.storagedName !== image.storagedName)
    if (!image.toUpload) {
      storage.ref(`experience/${id}/${image.storagedName}`).delete().then(() => {
        setImageList(updatedImageList)
        notify({
          id: 'success',
          message: 'Imagem removida com sucesso!',
          type: NotificationTypes.SUCCESS
        })
      })
      .catch(() => {
        notify({
          id: 'error',
          message: `Ocorreu um erro ao remover a imagem.`,
          type: NotificationTypes.ERROR
        })
      })
    } else {
      setImageList(updatedImageList)
      notify({
        id: 'success',
        message: 'Imagem removida com sucesso!',
        type: NotificationTypes.SUCCESS
      })
    }
  }

  if (id && getExperienceByIdLoading) return <FormLoadingComponent />

  return (
    <LayoutWithMenu>
      <Container maxWidth='xl' className={classes.mainContainer}>
        <div className={classes.toolbar}>
          <Link href="/cadastros/experiencias" passHref>
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
              {isSystemAdmin && (
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
                      value={formik.values.customerId}
                      error={formik.touched.customerId && Boolean(formik.errors.customerId)}
                      helperText={formik.touched.customerId && formik.errors.customerId}
                      disabled={!customersList}
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
              )}
              <Grid item xs={12} md={6}>
                {!id || (id && campaignsList && campaignsList.length > 0 && formik.values.campaignId) ? (
                  <TextField
                    color="secondary"
                    variant="outlined"
                    margin="normal"
                    select
                    fullWidth
                    id="campaignId"
                    label="Campanha *"
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
                ) : <CircularProgress color="inherit" size={20} />}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="name"
                  label="Título *"
                  name="name"
                  autoComplete="name"
                  onChange={formik.handleChange}
                  value={formik.values.name}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  multiline
                  minRows={5}
                  maxRows={5}
                  id="description"
                  label="Descrição *"
                  name="description"
                  autoComplete="description"
                  onChange={formik.handleChange}
                  value={formik.values.description}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={3}
                  id="whatToExpect"
                  label="O que esperar?"
                  name="whatToExpect"
                  autoComplete="whatToExpect"
                  onChange={formik.handleChange}
                  value={formik.values.whatToExpect || ''}
                  error={formik.touched.whatToExpect && Boolean(formik.errors.whatToExpect)}
                  helperText={formik.touched.whatToExpect && formik.errors.whatToExpect}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="qtParticipants"
                  label="Quantidade de participantes *"
                  InputProps={{
                    inputProps: {
                      min: 0
                    }
                  }}
                  type="number"
                  name="qtParticipants"
                  autoComplete="qtParticipants"
                  onChange={formik.handleChange}
                  value={formik.values.qtParticipants || ''}
                  error={formik.touched.qtParticipants && Boolean(formik.errors.qtParticipants)}
                  helperText={formik.touched.qtParticipants && formik.errors.qtParticipants}
                />
              </Grid>
              <Grid item xs={12} md={9}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="category"
                  label="Categoria"
                  name="category"
                  autoComplete="category"
                  onChange={formik.handleChange}
                  value={formik.values.category || ''}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  helperText={formik.touched.category && formik.errors.category}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                {!id || (id && experienceTypesList && experienceTypesList.length > 0 && formik.values.experienceTypeId) ? (
                  <TextField
                    color="secondary"
                    variant="outlined"
                    margin="normal"
                    select
                    fullWidth
                    id="experienceTypeId"
                    label="Tipo de Experiência *"
                    name="experienceTypeId"
                    autoComplete="experienceTypeId"
                    onChange={formik.handleChange}
                    value={formik.values.experienceTypeId || ''}
                    error={formik.touched.experienceTypeId && Boolean(formik.errors.experienceTypeId)}
                    helperText={formik.touched.experienceTypeId && formik.errors.experienceTypeId}
                    disabled={!experienceTypesList}
                    InputProps={{
                      endAdornment: getExperienceTypesLoading ? <CircularProgress color="inherit" size={20} /> : null
                    }}
                    SelectProps={{
                      classes: { icon: getExperienceTypesLoading ? classes.hideIcon : '' },
                    }}
                  >
                    <MenuItem key={''} value={''}>
                      Escolha o tipo de experiência
                    </MenuItem>
                    {experienceTypesList && experienceTypesList.length > 0 && experienceTypesList.map((xpType: ExperienceType) => (
                      <MenuItem key={xpType.id} value={xpType.id}>
                        {xpType.name}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : <CircularProgress color="inherit" size={20} />}
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  select
                  fullWidth
                  id="voucherTypeId"
                  label="Tipo de voucher *"
                  name="voucherTypeId"
                  autoComplete="voucherTypeId"
                  onChange={formik.handleChange}
                  value={formik.values.voucherTypeId || ''}
                  error={formik.touched.voucherTypeId && Boolean(formik.errors.voucherTypeId)}
                  helperText={formik.touched.voucherTypeId && formik.errors.voucherTypeId}
                  disabled={!voucherTypesList}
                  InputProps={{
                    endAdornment: getVoucherTypesLoading ? <CircularProgress color="inherit" size={20} /> : null
                  }}
                  SelectProps={{
                    classes: { icon: getVoucherTypesLoading ? classes.hideIcon : '' },
                  }}
                >
                  <MenuItem key={''} value={''}>
                    Escolher tipo de voucher
                  </MenuItem>
                  {voucherTypesList && voucherTypesList.map((option: ExperienceType) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="duration"
                  label="Duração *"
                  type="number"
                  name="duration"
                  autoComplete="duration"
                  onChange={formik.handleChange}
                  value={formik.values.duration || ''}
                  error={formik.touched.duration && Boolean(formik.errors.duration)}
                  helperText={formik.touched.duration && formik.errors.duration}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  select
                  fullWidth
                  id="unitDuration"
                  label="Unidade duração *"
                  name="unitDuration"
                  autoComplete="unitDuration"
                  onChange={formik.handleChange}
                  value={formik.values.unitDuration || ''}
                  error={formik.touched.unitDuration && Boolean(formik.errors.unitDuration)}
                  helperText={formik.touched.unitDuration && formik.errors.unitDuration}
                >
                  <MenuItem key={null} value={null}>
                    Selecione a unidade da duração
                  </MenuItem>
                  <MenuItem key={'M'} value={'M'}>
                    Minutos
                  </MenuItem>
                  <MenuItem key={'H'} value={'H'}>
                    Horas
                  </MenuItem>
                  <MenuItem key={'D'} value={'D'}>
                    Dias
                  </MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  select
                  fullWidth
                  id="period"
                  label="Período"
                  name="period"
                  autoComplete="period"
                  onChange={formik.handleChange}
                  value={formik.values.period || ''}
                  error={formik.touched.period && Boolean(formik.errors.period)}
                  helperText={formik.touched.period && formik.errors.period}
                >
                  <MenuItem key={null} value={null}>
                    Selecione o período
                  </MenuItem>
                  <MenuItem key={'M'} value={'M'}>
                    Manhã - 6h às 12h
                  </MenuItem>
                  <MenuItem key={'T'} value={'T'}>
                    Tarde - 12h às 17h
                  </MenuItem>
                  <MenuItem key={'N'} value={'N'}>
                    Noite - 17h à 0h
                  </MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={2}
                  id="whatIsIncluded"
                  label="O que está incluso"
                  name="whatIsIncluded"
                  autoComplete="whatIsIncluded"
                  onChange={formik.handleChange}
                  value={formik.values.whatIsIncluded || ''}
                  error={formik.touched.whatIsIncluded && Boolean(formik.errors.whatIsIncluded)}
                  helperText={formik.touched.whatIsIncluded && formik.errors.whatIsIncluded}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={2}
                  id="whatIsNotIncluded"
                  label="O que NÃO está incluso"
                  name="whatIsNotIncluded"
                  autoComplete="whatIsNotIncluded"
                  onChange={formik.handleChange}
                  value={formik.values.whatIsNotIncluded || ''}
                  error={formik.touched.whatIsNotIncluded && Boolean(formik.errors.whatIsNotIncluded)}
                  helperText={formik.touched.whatIsNotIncluded && formik.errors.whatIsNotIncluded}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  multiline
                  minRows={4}
                  maxRows={4}
                  id="importantInfo"
                  label="Informações importantes"
                  name="importantInfo"
                  autoComplete="importantInfo"
                  onChange={formik.handleChange}
                  value={formik.values.importantInfo || ''}
                  error={formik.touched.importantInfo && Boolean(formik.errors.importantInfo)}
                  helperText={formik.touched.importantInfo && formik.errors.importantInfo}
                />
              </Grid>

              <Grid item xs={6} md={2}>
                {!id || (id && formik.values.originalPrice) ? (
                  <CurrencyField
                    color="secondary"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    onValueChange={formik.setFieldValue}
                    initialValue={formik.values.originalPrice || ''}
                    value={formik.values.originalPrice || ''}
                    name="originalPrice"
                    id="originalPrice"
                    label="Preço de"
                    error={formik.touched.originalPrice && Boolean(formik.errors.originalPrice)}
                    helperText={formik.touched.originalPrice && formik.errors.originalPrice}
                  />
                ) : <CircularProgress color="inherit" size={20} />}
              </Grid>
              <Grid item xs={6} md={2}>
                {!id || (id && formik.values.price) ? (
                  <CurrencyField
                    color="secondary"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    onValueChange={formik.setFieldValue}
                    initialValue={formik.values.price || ''}
                    value={formik.values.price || ''}
                    name="price"
                    id="price"
                    label="Preço *"
                    error={formik.touched.price && Boolean(formik.errors.price)}
                    helperText={formik.touched.price && formik.errors.price}
                  />
                ) : <CircularProgress color="inherit" size={20} />}
              </Grid>
              <Grid item xs={12} md={8}>
                <Autocomplete
                  id="city"
                  open={cityOptions.length > 0}
                  onOpen={() => {
                    setOpenCityInput(true);
                  }}
                  onClose={() => {
                    setOpenCityInput(false);
                  }}
                  clearText='Limpar'
                  popupIcon={''}
                  fullWidth
                  filterOptions={(x) => x}
                  value={formik.values.city}
                  onChange={(_, cityValue) => formik.setFieldValue('city', cityValue)}
                  inputValue={cityInputValue}
                  onInputChange={(_, newInputValue) => {
                    setCityInputValue(newInputValue);
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  getOptionLabel={(option) => `${option.cityName}/${option.uf}`}
                  options={cityOptions}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cidade *"
                      color="secondary"
                      variant="outlined"
                      margin="normal"
                      error={formik.touched.city && Boolean(formik.errors.city)}
                      helperText={formik.touched.city && formik.errors.city}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {(debouncedCityInputValue.length > 0 && openCityInput) ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  color="secondary"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="localization"
                  label="Local *"
                  name="localization"
                  autoComplete="localization"
                  onChange={formik.handleChange}
                  value={formik.values.localization || ''}
                  error={formik.touched.localization && Boolean(formik.errors.localization)}
                  helperText={formik.touched.localization && formik.errors.localization}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  label="Mostrar a partir de: *"
                  type="date"
                  id='startDate'
                  name='startDate'
                  value={formik.values.startDate || ''}
                  onChange={formik.handleChange}
                  error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                  helperText={formik.touched.startDate && formik.errors.startDate}
                  margin="normal"
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  label="Até: *"
                  type="date"
                  id='endDate'
                  name='endDate'
                  value={formik.values.endDate || ''}
                  onChange={formik.handleChange}
                  error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                  helperText={formik.touched.endDate && formik.errors.endDate}
                  margin="normal"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid container item alignItems="center">
                <Grid item xs={12} md={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.freeCancel}
                        onChange={event =>
                          formik.setFieldValue("freeCancel", event.target.checked)
                        }
                        name="freeCancel"
                      />
                    }
                    label="Cancelamento grátis"
                  />
                </Grid>
                <Grid item xs={12} md={9}>
                  <TextField
                    color="secondary"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    id="cancellationPolicy"
                    label="Politica de cancelamento"
                    multiline
                    minRows={2}
                    maxRows={2}
                    name="cancellationPolicy"
                    autoComplete="cancellationPolicy"
                    onChange={formik.handleChange}
                    value={formik.values.cancellationPolicy || ''}
                    error={formik.touched.cancellationPolicy && Boolean(formik.errors.cancellationPolicy)}
                    helperText={formik.touched.cancellationPolicy && formik.errors.cancellationPolicy}
                  />
                </Grid>
              </Grid>
              <Paper className={classes.paper} elevation={3}>
                <Grid container item alignItems="center" className={classes.experienceDates}>
                  <div style={{ width: '100%', margin: '0 0 32px' }}>
                    <Divider>
                      <Chip className={classes.chip} label="Datas disponíveis: *" />
                    </Divider>
                  </div>
                  <Grid container item>
                    {formik.errors.experienceDates && !Array.isArray(formik.errors.experienceDates) && (
                      <Grid container item style={{ color: 'red', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography> É necessário adicionar pelo menos uma data. </Typography>
                      </Grid>
                    )}
                    {formik.values.experienceDates && formik.values.experienceDates.map((experienceDate: ExperienceDate, index: number) => {
                      const touched = formik.touched.experienceDates && formik.touched.experienceDates[index]
                      const error = formik.errors.experienceDates && formik.errors.experienceDates[index]
                      return (
                      <Grid container item key={index} alignItems='center'>
                        <Grid container item xs={12} md={4} justifyContent='center'>
                          <Chip className={classes.chip} label={index + 1} />
                        </Grid>
                        <Grid container item xs={12} md={8} justifyContent={isMobile ? 'space-between' : 'space-evenly'} alignItems='baseline'>
                          <TextField
                            label="Data *"
                            type="date"
                            {...formik.getFieldProps(`experienceDates[${index}].date`)}
                            error={touched && touched.date && error && Boolean(error.date)}
                            helperText={touched && touched.date && error && error.date ? error.date : ' '}
                            margin="normal"
                            disabled={!formik.values.experienceDates[index].newDate && Boolean(id)}
                            variant="outlined"
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                          <TextField
                            label="Hora"
                            type="time"
                            {...formik.getFieldProps(`experienceDates[${index}].time`)}
                            margin="normal"
                            disabled={!formik.values.experienceDates[index].newDate && Boolean(id)}
                            variant="outlined"
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                          <TextField
                            {...formik.getFieldProps(`experienceDates[${index}].qtAvailable`)}
                            error={touched && touched.qtAvailable && error && Boolean(error.qtAvailable)}
                            helperText={touched && touched.qtAvailable && error && error.qtAvailable ? error.qtAvailable : ' '}
                            type='number'
                            color="secondary"
                            variant="outlined"
                            margin="normal"
                            InputProps={{
                              inputProps: {
                                min: 0
                              }
                            }}
                            label="Quantidade disponível *"
                          />
                          <IconButton
                            aria-label="delete"
                            onClick={() => handleRemoveExperienceDates(experienceDate)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    )})}
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={handleAddExperienceDates}
                      className={classes.addExperienceDates}
                    >
                      Adicionar data
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
              <Paper className={classes.paper} elevation={3}>
                <div style={{ width: '100%', margin: '0 0 32px' }}>
                  <Divider>
                    <Chip className={classes.chip} label="Imagens:" />
                  </Divider>
                </div>
                <Grid container item alignItems="center">
                  <Grid item md={3}>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleClickImagesToUpload()}
                      className={classes.addExperienceDates}
                    >
                      Adicionar imagem
                    </Button>
                    <input type="file" multiple ref={uploadImageRef} accept="image/jpeg" onChange={handleImagesToUpload} onClick={(event) => { event.currentTarget.value = null }} hidden />
                  </Grid>
                  <Grid container item md={9}>
                    {imageList ? (
                      imageList.length > 0 ? (
                        <ImageList cols={5} rowHeight={164}>
                        {imageList.map((image, index) => (
                          <ImageListItem key={index} {...image.toUpload ? { className: classes.toUpload } : {}}>
                            <img
                              loading="lazy"
                              {...(image.toUpload ? {
                                className: classes.toUpload,
                                src: image.source
                              } : {
                                src: `${image.source}?w=164&h=164&fit=crop&auto=format`,
                                srcSet: `${image.source}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`
                              })}
                            />
                            <ImageListItemBar
                              classes={{
                                root: classes.titleBar
                              }}
                              actionIcon={
                                <>
                                <IconButton onClick={() => handleDeleteImage(image)}>
                                  <DeleteIcon style={{ color: '#ffffff' }}  />
                                </IconButton>
                                <IconButton onClick={() => openLightbox(index)}>
                                  <ZoomInIcon style={{ color: '#ffffff' }}  />
                                </IconButton>
                                </>
                              }
                            />
                          </ImageListItem>
                        ))}
                      </ImageList>
                      ) : (
                        <Typography> Ainda não existem imagens cadastradas. </Typography>
                      )
                    ) : (
                      id && (
                        <CircularProgress color="inherit" size={20} />
                      )
                    )}
                  </Grid>
                </Grid>
              </Paper>
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
            {viewerIsOpen && (
              <Lightbox
                reactModalStyle={{
                  overlay: {
                    zIndex: 9999999
                  }
                }}
                mainSrc={imageList[currentImage]?.source}
                nextSrc={imageList[(currentImage + 1) % imageList.length]?.source}
                prevSrc={imageList[(currentImage + imageList.length - 1) % imageList.length]?.source}
                onCloseRequest={closeLightbox}
                onMovePrevRequest={() =>
                  setCurrentImage((currentImage + imageList.length - 1) % imageList.length)
                }
                onMoveNextRequest={() =>
                  setCurrentImage((currentImage + 1) % imageList.length)
                }
              />
            )}
          </form>
        </Paper>
      </Container>
    </LayoutWithMenu>
  );
}

export default ExperienceForm