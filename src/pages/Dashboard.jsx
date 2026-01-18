import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, Button } from '@mui/material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [rates, setRates] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await api.get('/common/exchange-rates');
                setRates(response.data);
            } catch (error) {
                console.error('Kurlar yüklenirken hata:', error);
            }
        };
        fetchRates();
    }, []);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Ana Sayfa</Typography>

            <Grid container spacing={3}>
                {/* Döviz Kurları */}
                <Grid item xs={12} md={6} lg={4}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom>Döviz Kurları (TCMB)</Typography>
                        {rates ? (
                            <Box>
                                <Typography>USD Satış: {rates.USD?.selling}</Typography>
                                <Typography>EUR Satış: {rates.EUR?.selling}</Typography>
                            </Box>
                        ) : (
                            <Typography>Kurlar yükleniyor...</Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Hızlı İşlemler */}
                <Grid item xs={12} md={6} lg={8}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Hızlı İşlemler</Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="contained" onClick={() => navigate('/invoices')}>Yeni Fatura</Button>
                            <Button variant="outlined" onClick={() => navigate('/customers')}>Müşteri Ekle</Button>
                            <Button variant="outlined" onClick={() => navigate('/products')}>Ürün Ekle</Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
