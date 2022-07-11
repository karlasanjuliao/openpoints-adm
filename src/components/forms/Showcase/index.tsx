import {
  Button,
  Container,
  createStyles,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Theme
} from '@material-ui/core';
import {
  Box,
  ButtonBase,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@material-ui/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useRef, useEffect, useState } from 'react';
import Lightbox from 'react-image-lightbox';

import firebaseClient from 'services/firebase/client';
import useNotification from 'hooks/useNotification'
import { NotificationTypes } from 'contexts/NotificationContext';
import LayoutWithMenu from 'components/layout/LayoutWithMenu/LayoutWithMenu';
import FormLoadingComponent from 'components/screen/FormLoading/FormLoading';

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
    footer: {
      marginTop: theme.spacing(2)
    }
  })
);

const ImageWrapper = styled('span')(({ theme }) => ({
  height: 200,
  [theme.breakpoints.down('sm')]: {
    width: '100% !important', // Overrides inline-style
    height: 100,
  },
}))

const ImageButton = styled(ButtonBase)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  '&:hover, &.Mui-focusVisible': {
    zIndex: 1,
    '& .MuiImageBackdrop-root': {
      opacity: 0.15,
    },
    '& .MuiImageMarked-root': {
      opacity: 0,
    },
    '& .MuiTypography-root': {
      border: '4px solid currentColor',
    },
  },
}));

const ImageSrc = styled('span')({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center 40%',
});

const Image = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.common.white,
}));

const ImageBackdrop = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundColor: theme.palette.common.black,
  opacity: 0.4,
  transition: theme.transitions.create('opacity'),
}));

const ImageMarked = styled('span')(({ theme }) => ({
  height: 3,
  width: 18,
  backgroundColor: theme.palette.common.white,
  position: 'absolute',
  bottom: -2,
  left: 'calc(50% - 9px)',
  transition: theme.transitions.create('opacity'),
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  zIndex: 10,
  right: 8,
  bottom: 8,
  '&:hover': {
    background: '#fd665e'
  }
}));


const storage = firebaseClient.storage()

const ShowcaseForm = () => {
  const classes = useStyles();

  const [imageList, setImageList] = useState([...new Array(3)]);
  const [currentImage, setCurrentImage] = useState(0);
  const [viewerIsOpen, setViewerIsOpen] = useState(false);
  const uploadImageRefs = useRef(new Array())
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { campaignCode, name: campaignName } = router.query;

  const { notify } = useNotification()

  const handleSubmitShowcase = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (campaignCode) {
        await handeUploadImages(Number(campaignCode))
      }
      notify({
        id: 'success',
        message: `Vitrine salva com sucesso!`,
        type: NotificationTypes.SUCCESS
      })
    } catch (error) {
      console.log(error)
      notify({
        id: 'error',
        message: `Ocorreu um erro. Por favor, tente novamente mais tarde!`,
        type: NotificationTypes.ERROR
      })
    } finally {
      setLoading(false)
      router.push('/cadastros/campanhas')
    }
  }

  useEffect(() => {
    if (campaignCode) {
      setLoading(true)
      storage.ref(`campaign/${campaignCode}`).listAll().then(async imageRefs => {
        const storagedImages = await Promise.all(imageRefs.items.map(async (ref) => {
          const source = await ref.getDownloadURL()
          // console.log('veio do firebase', {
          //   id: Number(ref.name.replace(/\D/g, '')),
          //   source
          // })
          return ({
            id: Number(ref.name.replace(/\D/g, '')),
            source
          })
        }))
        if (storagedImages.length > 0) {
          const sortedImageList = storagedImages.sort((a, b) => a.id - b.id)
          const newImageList = imageList.slice()
          sortedImageList.map(img => newImageList[img.id - 1] = img)
          setImageList(newImageList)
        }
        setLoading(false)
      })
    }
  }, [campaignCode]);

  const handleClickImagesToUpload = (index) => {
    if (uploadImageRefs) {
      return uploadImageRefs.current[index]?.click();
    }
  };

  const handleImagesToUpload = (e: { target: HTMLInputElement }) => {
    const index = e.target.getAttribute("data-index")

    const newImage = (e.target as HTMLInputElement).files[0] as any;
    newImage.id = Number(index) + 1
    newImage.toUpload = true
    newImage.source = URL.createObjectURL(newImage)
    newImage.onload = () => URL.revokeObjectURL(newImage.source)
    const newImageList = imageList.slice()
    newImageList[index] = newImage
    setImageList(newImageList)
  }

  const handeUploadImages = async (id: number) => {
    const imagesToUploadCount = imageList.filter(img => img !== undefined && img?.toUpload)
    if (imagesToUploadCount.length === 0) return

    if (!storage) return

    const promises = []

    imageList.map((img, index) => {
      if (img?.toUpload) {
        const uploadTask = storage.ref(`campaign/${id}/imagem${index + 1}`).put(img);
        promises.push(uploadTask);
      }
    })

    Promise.all(promises)
      .catch((err) => console.log(err));
  }

  const openLightbox = useCallback((index) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  }, []);

  const handleDeleteImage = useCallback(async (campaignId, image, index) => {
    if (!campaignId) return
    if (!image?.toUpload) {
      try {
        await storage.ref(`campaign/${campaignId}/imagem${image.id}`).delete()
        alert('Imagem removida com sucesso!')
      } catch (error) {
        console.log('Erro ao remover imagem: ', error)
      }
    }
    const updatedImageList = imageList.slice()
    updatedImageList[index] = undefined
    setImageList(updatedImageList)
  }, [])

  if (!campaignCode) return <FormLoadingComponent />

  return (
    <LayoutWithMenu>
      <Container maxWidth='xl' className={classes.mainContainer}>
        <div className={classes.toolbar}>
          <Link href="/cadastros/campanhas" passHref>
            <IconButton aria-label="Voltar">
              <ArrowBackIcon />
            </IconButton>
          </Link>
          <Typography component="h1" variant="h5">
            {`Vitrine - ${campaignName}`}
          </Typography>
        </div>

        <Paper className={classes.form} elevation={3}>
          <form noValidate onSubmit={handleSubmitShowcase}>
            <Grid container alignItems="flex-start" spacing={2}>
              <Grid container item alignItems="center">
                <Box sx={{ display: 'flex', flexWrap: 'wrap', minWidth: 300, width: '100%' }}>
                  {imageList.map((image, index) => (
                    <ImageWrapper style={{
                      width: 'calc(33.333% - 4px)',
                      height: 200,
                      margin: '2px',
                      position: 'relative'
                    }}>
                      {image !== undefined && (
                        <DeleteButton onClick={() => handleDeleteImage(campaignCode, image, index)}>
                          <DeleteIcon style={{ color: '#ffffff' }}  />
                        </DeleteButton>
                      )}
                      <input type="file" ref={(element) => uploadImageRefs.current[index] = element} accept="image/jpeg" data-index={index} onChange={handleImagesToUpload} style={{ display: "none" }} />
                      <ImageButton
                        focusRipple
                        key={index}
                        onClick={() => {
                          if (image?.source) {
                            openLightbox(index)
                          } else {
                            handleClickImagesToUpload(index)
                          }
                        }}
                      >
                        <ImageSrc
                          style={{
                            ...(image?.source) ?
                              { backgroundImage: `url(${image.source})` } :
                              { backgroundColor: '#dddddd' },
                            ...(image?.toUpload) && ({ opacity: 0.35 })
                          }}
                        />
                        <ImageBackdrop className="MuiImageBackdrop-root" />
                        <Image>
                          <Typography
                            variant="subtitle1"
                            color="inherit"
                            sx={{
                              position: 'relative',
                              p: 4,
                              pt: 2,
                              pb: (theme) => `calc(${theme.spacing(1)} + 6px)`,
                            }}
                          >
                            {`Imagem ${index + 1}`} <br />
                            <span style={{ fontSize: 13 }}>{index === 1 ? '300x250' : '625x250' }</span>
                            <ImageMarked className="MuiImageMarked-root" />
                          </Typography>
                        </Image>
                      </ImageButton>
                    </ImageWrapper>
                  ))}
                </Box>
              </Grid>
            </Grid>

            <Grid container item alignItems="center" justifyContent='space-between' className={classes.footer}>
              <Typography variant='subtitle2'>
                <span style={{ fontWeight: 900, fontSize: 16 }}>Dimensões das imagens:</span><br />
                <b>Imagem 1:</b> 625px x 250px <br />
                <b>Imagem 2:</b> 300px x 250px <br />
                <b>Imagem 3:</b> 625px x 250px <br />
              </Typography>
              <Button
                type="submit"
                size="large"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                Salvar
              </Button>
            </Grid>

            {loading && <FormLoadingComponent />}
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
                onCloseRequest={() => setViewerIsOpen(false)}
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

export default ShowcaseForm