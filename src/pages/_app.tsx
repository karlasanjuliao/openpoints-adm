import { useEffect, useState } from 'react'
import { ThemeProvider } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import { AppProps } from 'next/app';
import Head from 'next/head';
import Router from 'next/router'
import { Backdrop, CircularProgress } from '@material-ui/core';

import { AuthUserProvider } from 'contexts/AuthUserContext';
import { NotificationContextProvider } from 'contexts/NotificationContext';
import theme from 'styles/theme';

import SafeHydrate from 'components/layout/SafeHydrate'
import NotificationManager from 'components/screen/NotificationManager'

import 'react-image-lightbox/style.css'

function MyApp({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState<boolean>(false)
  useEffect(() => {
    Router.events.on('routeChangeStart', () => setLoading(true))
    Router.events.on('routeChangeComplete', () => setLoading(false))
    Router.events.on('routeChangeError', () => setLoading(false))
    return () => {
      Router.events.off('routeChangeStart', () => setLoading(true))
      Router.events.off('routeChangeComplete', () => setLoading(false))
      Router.events.off('routeChangeError', () => setLoading(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <SafeHydrate>
      <Head>
        <title>Admin | Destino Férias</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Backdrop
          style={{ color: '#fff', zIndex: 9999 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <AuthUserProvider>
          <NotificationContextProvider>
            <Component loading={loading} {...pageProps} />
            <NotificationManager />
          </NotificationContextProvider>
        </AuthUserProvider>
      </ThemeProvider>
    </SafeHydrate>
  );
}

export default MyApp;
