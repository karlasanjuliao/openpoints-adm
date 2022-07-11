import {
  AppBar,
  ButtonGroup,
  Button,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Popover,
  Toolbar,
  Typography,
  useMediaQuery
} from '@material-ui/core'
import {
  createStyles,
  makeStyles,
  Theme,
} from '@material-ui/core/styles';
import {
  AccountCircle as AccountCircleIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
} from '@material-ui/icons'
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'
import { useRouter } from 'next/router'

import { useAuth } from 'contexts/AuthUserContext';

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    toolbar: {
      padding: 0,
      [theme.breakpoints.up("md")]: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      },
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    navLink: {
      color: '#ffffff',
      textTransform: 'none',
      fontWeight: 400
    },
    drawerPaper: {
      width: drawerWidth,
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
      justifyContent: 'flex-end',
    },
    userMenu: {
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down("md")]: {
        marginLeft: 'auto',
      },
    },
    content: {
      flexGrow: 1,
      paddingTop: theme.spacing(3),
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      })
    },
  })
);

export default function LayoutWithMenuComponent({ children }) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { authUser, signOut } = useAuth()
  const { push } = useRouter()

  const [state, setState] = useState({
    value: 0,
    anchorEl: null,
    popno: -1
  })

  const handlePopoverClose = () => {
    setState({ ...state, anchorEl: null, popno: -1 });
  };

  const handleClick = (e, _popno) => {
    setState({ ...state, anchorEl: e.currentTarget, popno: _popno });
  };

  const isMobile = useMediaQuery('(max-width:768px)');

  // Menu:
  const registerMenu: Array<any> = [
    { name: 'Início', to: '/' },
    { name: 'Empresas', to: '/cadastros/empresas' },
    { name: 'Usuários', to: `/cadastros/usuarios?customerId=${authUser && authUser.customerId}` },
    { name: 'Experiências', to: `/cadastros/experiencias` },
    { name: 'Cupons de desconto', to: `/cadastros/cupons-desconto` },
  ];

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleMenu = (event: { currentTarget: any; }) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <div className={classes.root}>
      <AppBar position="fixed">
        <Container maxWidth='xl'>
          <Toolbar className={classes.toolbar}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDrawerOpen}
                  edge="start"
                  className={classes.menuButton}
                >
                  <MenuIcon />
                </IconButton>
              )}
              {!isMobile && (
                <>
                  <div style={{ display: 'flex' }}>
                    <Typography variant='caption'> <b> ADMIN | </b> </Typography>
                    <Image src="/img/logo.png" alt="Logo" width="150" height="24" />
                  </div>
                  <ButtonGroup variant="contained" color='primary'>
                    <Button onClick={() => push('/')} className={classes.navLink}> Início </Button>
                    <Button onClick={e => handleClick(e, 1)} className={classes.navLink}>Cadastros</Button>
                    <Button onClick={e => handleClick(e, 2)} className={classes.navLink}>Reservas</Button>
                    <Button disabled onClick={() => push('/configuracoes')} className={classes.navLink}>Configurações</Button>
                  </ButtonGroup>
                  <Popover
                    id="nav-links"
                    open={state.anchorEl !== null}
                    onClose={handlePopoverClose}
                    anchorEl={state.anchorEl}
                    style={{ marginTop: '40px' }}
                  >
                    {state.popno === 1 && (
                      <MenuList>
                        <Link href={'/cadastros/empresas'} passHref shallow={false}>
                          <MenuItem button component="a">
                            Empresas
                          </MenuItem>
                        </Link>
                        <Link href={'/cadastros/usuarios'} passHref shallow={false}>
                          <MenuItem button component="a">
                            Usuários
                          </MenuItem>
                        </Link>
                        <Link href={'/cadastros/experiencias'} passHref shallow={false}>
                          <MenuItem button component="a">
                            Experiências
                          </MenuItem>
                        </Link>
                        <Link href={'/cadastros/campanhas'} passHref shallow={false}>
                          <MenuItem button component="a">
                            Campanhas
                          </MenuItem>
                        </Link>
                        <Link href={'/cadastros/cupons-desconto'} passHref shallow={false}>
                          <MenuItem button component="a">
                            Cupons de desconto
                          </MenuItem>
                        </Link>
                      </MenuList>
                    )}
                    {state.popno === 2 && (
                      <MenuList>
                        <Link href={'/reservas/aereo'} passHref shallow={false}>
                          <MenuItem button component="a">Aéreo</MenuItem>
                        </Link>
                        <Link href={'/reservas/hotel'} passHref shallow={false}>
                          <MenuItem button component="a">Hotel</MenuItem>
                        </Link>
                        <Link href={'/reservas/carro'} passHref shallow={false}>
                          <MenuItem button component="a">Carro</MenuItem>
                        </Link>
                        <Link href={'/reservas/experiencias'} passHref shallow={false}>
                          <MenuItem button component="a">Experiências</MenuItem>
                        </Link>
                      </MenuList>
                    )}
                  </Popover>
                </>
              )}
              <div className={classes.userMenu}>
                {authUser && !isMobile && (
                  <Grid>
                    <Typography variant='subtitle2'> {authUser.name} {authUser.lastName} </Typography>
                    <Typography variant='caption'> {authUser.profile.name} </Typography>
                  </Grid>
                )}
                <IconButton
                  aria-label="user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountCircleIcon />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  {authUser && isMobile && (
                    <>
                      <MenuItem>
                        Olá, {authUser.name}
                      </MenuItem>
                      <Divider />
                    </>
                  )}
                  <MenuItem onClick={() => signOut()}>Sair</MenuItem>
                </Menu>
              </div>
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="temporary"
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List>
          {registerMenu.map((menuItem, index) => (
            <Link key={index} href={menuItem.to} passHref shallow={false}>
              <ListItem button component="a">
                <ListItemIcon>{menuItem.icon}</ListItemIcon>
                <ListItemText primary={menuItem.name} />
              </ListItem>
            </Link>
          ))}
        </List>
      </Drawer>
      <main
        className={classes.content}
      >
        <div className={classes.drawerHeader} />
        <Container maxWidth='xl'>
          {children}
        </Container>
      </main>
    </div>
  );
}
