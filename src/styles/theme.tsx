import { createTheme } from '@material-ui/core/styles';

// Create a theme instance.
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 768,
      md: 1024,
      lg: 1280,
      xl: 1440,
    },
  },
  typography: {
    fontSize: 16
  },
  palette: {
    action: {
      disabled: 'rgba(221, 221, 221, 0.62)'
    },
    primary: {
      main: '#000000',
      light: '#ff988b',
      dark: '#2f2f2f',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#263238',
      light: '#4f5b62',
      dark: '#000a12',
      contrastText: '#ffffff'
    }
  },
});

export default theme;
