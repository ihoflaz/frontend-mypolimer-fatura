import React from 'react';
import {
    Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Toolbar, Box, Typography, Avatar
} from '@mui/material';
import { Dashboard, People, Inventory, Receipt, Settings, Business } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ drawerWidth, mobileOpen, onDrawerToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { text: 'Ana Sayfa', icon: <Dashboard />, path: '/' },
        { text: 'Müşteriler', icon: <People />, path: '/customers' },
        { text: 'Ürünler', icon: <Inventory />, path: '/products' },
        { text: 'Siparişler', icon: <Receipt />, path: '/invoices' },
        { text: 'Ayarlar', icon: <Settings />, path: '/settings' },
    ];

    const drawerContent = (
        <>
            {/* Logo Section */}
            <Box
                sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                <Avatar
                    sx={{
                        width: 48,
                        height: 48,
                        bgcolor: 'rgb(248, 194, 36)',
                        color: '#1a1a2e',
                        fontWeight: 700,
                        fontSize: '1.25rem',
                    }}
                >
                    MY
                </Avatar>
                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            color: 'white',
                            fontSize: '1rem',
                            lineHeight: 1.2,
                        }}
                    >
                        MY POLİMER
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.7rem',
                        }}
                    >
                        Yönetim Paneli
                    </Typography>
                </Box>
            </Box>

            {/* Menu Items */}
            <Box sx={{ flex: 1, py: 2 }}>
                <List>
                    {menuItems.map((item) => {
                        const isSelected = location.pathname === item.path;
                        return (
                            <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
                                <ListItemButton
                                    onClick={() => {
                                        navigate(item.path);
                                        if (onDrawerToggle) onDrawerToggle();
                                    }}
                                    selected={isSelected}
                                    sx={{
                                        borderRadius: 2,
                                        mb: 0.5,
                                        py: 1.5,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.08)',
                                            transform: 'translateX(4px)',
                                        },
                                        '&.Mui-selected': {
                                            bgcolor: 'rgb(248, 194, 36)',
                                            color: '#1a1a2e',
                                            '&:hover': {
                                                bgcolor: 'rgb(248, 194, 36)',
                                            },
                                            '& .MuiListItemIcon-root': {
                                                color: '#1a1a2e',
                                            },
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 40,
                                            color: isSelected
                                                ? '#1a1a2e'
                                                : 'rgba(255, 255, 255, 0.8)',
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontWeight: isSelected ? 600 : 500,
                                            fontSize: '0.9rem',
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    p: 2,
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    textAlign: 'center',
                }}
            >
                <Typography
                    variant="caption"
                    sx={{ color: 'rgba(255, 255, 255, 0.4)' }}
                >
                    v1.0.0
                </Typography>
            </Box>
        </>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        background: 'linear-gradient(180deg, rgb(79, 129, 189) 0%, #3d6a9f 100%)',
                        border: 'none',
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        background: 'linear-gradient(180deg, rgb(79, 129, 189) 0%, #3d6a9f 100%)',
                        border: 'none',
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default Sidebar;
