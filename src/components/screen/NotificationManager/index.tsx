import { createStyles, makeStyles, Snackbar, Theme } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import clsx from  'clsx'

import { useNotificationContext, NotificationTypes } from 'contexts/NotificationContext'
import { useCallback } from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    shadow: {
        width: '100%',
        boxShadow: '0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%)',
        '& svg': {
            fill: '#ffffff'
        }
    },
    success: {
        color: "#ffffff",
        backgroundColor: "#2e7d32",
    },
    error: {
        color: "#ffffff",
        backgroundColor: "#d32f2f",
    }
  })
);

const NotificationManager = () => {
    const classes = useStyles()
    const [notification, setNotification] = useNotificationContext()

    const handleClose = useCallback(() => {
        setNotification({
            id: '',
            isVisible: false,
            message: ''
        })
    }, [])

    return (
        <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            autoHideDuration={3000}
            open={notification.isVisible}
            key={notification.message}
            onClose={handleClose}
        >
            <Alert onClose={handleClose} severity={notification.type} className={clsx(classes.shadow, classes[notification.type])}>
                {notification.message}
            </Alert>
        </Snackbar>
    )
}

export default NotificationManager
