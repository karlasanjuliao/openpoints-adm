import {
  Box,
  Button,
  createStyles,
  Grid,
  InputAdornment,
  makeStyles,
  Paper,
  TextField,
  Theme,
  Typography
} from '@material-ui/core'
import {
  Lock as LockIcon,
  Mail as MailIcon,
} from '@material-ui/icons';
import Image from 'next/image'
import { useFormik } from 'formik';
import Link from 'next/link';
import * as Yup from 'yup';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react'

import { useAuth } from 'contexts/AuthUserContext';
import FormLoadingComponent from 'components/screen/FormLoading/FormLoading';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
      minHeight: '100vh',
      gap: theme.spacing(5),
      padding: theme.spacing(2),
    },
    sloganTitle: {
      marginBottom: theme.spacing(2),
    },
    form: {
      padding: theme.spacing(4),
      maxWidth: '500px',
    },
    submit: {
      marginTop: theme.spacing(2),
    },
    forgot: {
      textTransform: 'none',
      marginTop: theme.spacing(2),
    },
  })
);

interface IFormData {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmailAndPassword, authUser } = useAuth();
  const [loginError, setLoginError] = useState(false)

  useEffect(() => {
    if (authUser) {
      router.replace('/')
    }
  }, [authUser])

  const classes = useStyles();

  const initialValues: IFormData = {
    email: '',
    password: '',
  };

  const formSchema = Yup.object().shape({
    email: Yup.string().email('E-mail inválido').required('Obrigatório'),
    password: Yup.string().required('Obrigatório'),
  });

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: formSchema,
    onSubmit: async ({ email, password }) => {
      try {
        await signInWithEmailAndPassword(email, password)
        router.push('/')
      } catch(error) {
        setLoginError(true)
        console.log(error.message)
      }
      formik.setSubmitting(false);
    },
  });

  return (
      <Grid container style={{ height: '100vh' }}>
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          style={{
            backgroundImage: 'url(/img/bg.png)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square style={{ backgroundColor: '#d7d7d7'  }}>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Image src="/img/logo-color.png" alt="Logo" width="220" height="40" />
            <form noValidate onSubmit={formik.handleSubmit}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                id="email"
                placeholder="Seu e-mail"
                name="email"
                autoComplete="email"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailIcon />
                    </InputAdornment>
                  ),
                }}
                style={{ backgroundColor: '#ffffff', borderRadius: '4px'  }}
                onChange={formik.handleChange}
                value={formik.values.email}
                error={loginError || (formik.touched.email && Boolean(formik.errors.email))}
                helperText={formik.touched.email && formik.errors.email}
              />
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                name="password"
                placeholder="Sua senha"
                type="password"
                id="password"
                autoComplete="current-password"
                style={{ backgroundColor: '#ffffff', borderRadius: '4px'  }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                }}
                onChange={formik.handleChange}
                value={formik.values.password}
                error={loginError || (formik.touched.password && Boolean(formik.errors.password))}
                helperText={formik.touched.password && formik.errors.password}
              />

              <Typography color='error'>
                {loginError && 'Usuário e/ou senha inválido(s)!'}
              </Typography>

              <Button
                className={classes.submit}
                type="submit"
                size="large"
                fullWidth
                variant="contained"
                color="primary"
                disabled={formik.isSubmitting}
              >
                Entrar
              </Button>
              {formik.isSubmitting && <FormLoadingComponent />}
            </form>
            <Link href="/forgot-password" passHref>
              <Button variant="text" className={classes.forgot}>
                Esqueceu a senha?
              </Button>
            </Link>
          </Box>
        </Grid>
      </Grid>
  );
}
