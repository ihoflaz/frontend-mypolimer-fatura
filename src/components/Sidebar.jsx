import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Box } from '@mui/material';
import { Dashboard, People, Inventory, Receipt, Settings } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ drawerWidth }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { text: 'Ana Sayfa', icon: <Dashboard />, path: '/' },
        { text: 'Müşteriler', icon: <People />, path: '/customers' },
        { text: 'Ürünler', icon: <Inventory />, path: '/products' },
        { text: 'Faturalar', icon: <Receipt />, path: '/invoices' },
        { text: 'Ayarlar', icon: <Settings />, path: '/settings' },
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
            }}
        >
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    {menuItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                selected={location.pathname === item.path}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
};

export default Sidebar;
