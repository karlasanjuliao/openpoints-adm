import {
  Backdrop,
  Box,
  CircularProgress,
  createStyles,
  makeStyles,
  Theme,
} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: theme.spacing(1, 0),
    },
    loadingProgress: {
      marginRight: theme.spacing(1),
    },
  })
);

export default function FormLoadingComponent({ withText }: { withText?: boolean }) {
  const classes = useStyles();

  return (
    <Backdrop
      style={{ color: '#fff', zIndex: 9999 }}
      open
    >
      <Box className={classes.loading}>
        <CircularProgress
          className={classes.loadingProgress}
          disableShrink
          color="primary"
          size={20}
        />
        {withText && 'Processando...'}
      </Box>
    </Backdrop>
  );
}
