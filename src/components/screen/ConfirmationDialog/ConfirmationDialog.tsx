import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide
} from '@material-ui/core';
import { TransitionProps } from '@material-ui/core/transitions/transition';
import { forwardRef, ReactNode, useState } from 'react';

interface IConfirmationDialogProps {
  id: string;
  title: string;
  children: ReactNode;
  classes?: Record<'paper', string>;
  keepMounted: boolean;
  open: boolean;
  cancelButtonText?: string;
  confirmButtonText?: string;
  onCancel: (value?: string) => void;
  onConfirmation: (value?: string) => void;
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function ConfirmationDialog(props: IConfirmationDialogProps) {
  const {
    children,
    open,
    title,
    cancelButtonText,
    confirmButtonText,
    onCancel,
    onConfirmation,
    ...other
  } = props;
  const handleCancel = () => {
    onCancel('cancel');
  };

  const handleConfirmation = () => {
    onConfirmation('ok');
  };

  return (
    <Dialog
      disableEscapeKeyDown
      maxWidth="xs"
      aria-labelledby="confirmation-dialog-title"
      open={open}
      TransitionComponent={Transition}
      {...other}
    >
      <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel} color="primary">
          {cancelButtonText || 'Cancelar'}
        </Button>
        <Button onClick={handleConfirmation} color="primary">
          {confirmButtonText || 'Ok'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
