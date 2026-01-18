import React from 'react';
import {
    AppBar, Toolbar, Typography, Button, Box, IconButton,
    Avatar, Menu, MenuItem, Divider, useMediaQuery, useTheme
} from '@mui/material';
import { Menu as MenuIcon, Logout, Person, KeyboardArrowDown } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ drawerWidth, onDrawerToggle }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Page titles
    const pageTitles = {
        '/': 'Ana Sayfa',
        '/customers': 'Müşteriler',
        '/products': 'Ürünler',
        '/invoices': 'Siparişler',
        '/settings': 'Ayarlar',
    };

    const currentTitle = pageTitles[location.pathname] || 'My Polimer';

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                ml: { sm: `${drawerWidth}px` },
                bgcolor: 'white',
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            }}
        >
            <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
                {/* Mobile Menu Button */}
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onDrawerToggle}
                    sx={{
                        mr: 2,
                        display: { sm: 'none' },
                        color: 'text.primary',
                    }}
                >
                    <MenuIcon />
                </IconButton>

                {/* Page Title */}
                <Box sx={{ flexGrow: 1 }}>
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                        }}
                    >
                        {currentTitle}
                    </Typography>
                    {!isMobile && (
                        <Typography
                            variant="body2"
                            sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                        >
                            Polimer Proforma Yönetim Sistemi
                        </Typography>
                    )}
                </Box>

                {/* User Menu */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                        onClick={handleMenuOpen}
                        sx={{
                            textTransform: 'none',
                            color: 'text.primary',
                            borderRadius: 2,
                            px: 2,
                            '&:hover': {
                                bgcolor: 'rgba(79, 129, 189, 0.08)',
                            },
                        }}
                        endIcon={<KeyboardArrowDown />}
                    >
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: 'rgb(79, 129, 189)',
                                fontSize: '0.875rem',
                                mr: 1,
                            }}
                        >
                            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                        {!isMobile && (
                            <Typography variant="body2" fontWeight={500}>
                                {user?.username || 'Kullanıcı'}
                            </Typography>
                        )}
                    </Button>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                            elevation: 3,
                            sx: {
                                mt: 1.5,
                                minWidth: 180,
                                borderRadius: 2,
                                overflow: 'visible',
                                '&:before': {
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    top: 0,
                                    right: 14,
                                    width: 10,
                                    height: 10,
                                    bgcolor: 'background.paper',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    zIndex: 0,
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <Box sx={{ px: 2, py: 1.5 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                                {user?.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Yönetici
                            </Typography>
                        </Box>
                        <Divider />
                        <MenuItem
                            onClick={() => { handleMenuClose(); navigate('/settings'); }}
                            sx={{ py: 1.5 }}
                        >
                            <Person sx={{ mr: 2, fontSize: 20, color: 'text.secondary' }} />
                            Ayarlar
                        </MenuItem>
                        <MenuItem
                            onClick={() => { handleMenuClose(); handleLogout(); }}
                            sx={{ py: 1.5, color: 'error.main' }}
                        >
                            <Logout sx={{ mr: 2, fontSize: 20 }} />
                            Çıkış Yap
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
