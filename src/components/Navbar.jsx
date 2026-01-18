import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ drawerWidth }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                ml: { sm: `${drawerWidth}px` },
            }}
        >
            <Toolbar>
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                    Polimer Proforma Yönetim Sistemi
                </Typography>
                <Box>
                    <Typography variant="body1" component="span" sx={{ mr: 2 }}>
                        {user?.username}
                    </Typography>
                    <Button color="inherit" onClick={handleLogout}>Çıkış</Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
