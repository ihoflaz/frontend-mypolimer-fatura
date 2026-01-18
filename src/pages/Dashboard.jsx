import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, Button, Card, CardContent, Skeleton, Divider } from '@mui/material';
import {
    TrendingUp, People, Inventory, Receipt, Euro, AttachMoney,
    ArrowForward, Add
} from '@mui/icons-material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Stat Card Component
const StatCard = ({ title, value, icon, color, subtext, onClick }) => (
    <Card
        sx={{
            height: '100%',
            cursor: onClick ? 'pointer' : 'default',
            transition: 'all 0.3s ease',
            '&:hover': onClick ? {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.12)',
            } : {},
        }}
        onClick={onClick}
    >
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                        {title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                        {value}
                    </Typography>
                    {subtext && (
                        <Typography variant="caption" color="text.secondary">
                            {subtext}
                        </Typography>
                    )}
                </Box>
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: `${color}15`,
                        color: color,
                    }}
                >
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

// Quick Action Button
const QuickActionButton = ({ icon, title, subtitle, onClick, color = 'primary' }) => (
    <Button
        variant="outlined"
        onClick={onClick}
        sx={{
            p: 2.5,
            width: '100%',
            height: '100%',
            minHeight: 100,
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
            borderRadius: 3,
            borderColor: 'divider',
            borderWidth: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
                borderColor: color === 'primary' ? 'primary.main' : 'secondary.main',
                bgcolor: color === 'primary' ? 'rgba(248, 194, 36, 0.05)' : 'rgba(79, 129, 189, 0.05)',
                transform: 'translateY(-2px)',
            },
        }}
    >
        <Box
            sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: color === 'primary' ? 'rgba(248, 194, 36, 0.15)' : 'rgba(79, 129, 189, 0.15)',
                color: color === 'primary' ? 'primary.main' : 'secondary.main',
                mb: 1.5,
            }}
        >
            {icon}
        </Box>
        <Typography variant="subtitle2" color="text.primary" fontWeight={600}>
            {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
            {subtitle}
        </Typography>
    </Button>
);

const Dashboard = () => {
    const [rates, setRates] = useState(null);
    const [stats, setStats] = useState({ customers: 0, products: 0, invoices: 0 });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ratesRes, customersRes, productsRes, invoicesRes] = await Promise.all([
                    api.get('/common/exchange-rates').catch(() => ({ data: null })),
                    api.get('/customers').catch(() => ({ data: [] })),
                    api.get('/products').catch(() => ({ data: [] })),
                    api.get('/invoices').catch(() => ({ data: [] })),
                ]);

                setRates(ratesRes.data);
                setStats({
                    customers: customersRes.data?.length || 0,
                    products: productsRes.data?.length || 0,
                    invoices: invoicesRes.data?.length || 0,
                });
            } catch (error) {
                console.error('Veriler yüklenirken hata:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Get current hour for greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Günaydın';
        if (hour < 18) return 'İyi Günler';
        return 'İyi Akşamlar';
    };

    return (
        <Box>
            {/* Welcome Section */}
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        mb: 0.5,
                    }}
                >
                    {getGreeting()}, {user?.username || 'Kullanıcı'} 👋
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    İşte bugünkü özet ve hızlı işlemler
                </Typography>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={6} sm={6} md={3}>
                    {loading ? (
                        <Skeleton variant="rounded" height={130} />
                    ) : (
                        <StatCard
                            title="Toplam Müşteri"
                            value={stats.customers}
                            icon={<People />}
                            color="rgb(79, 129, 189)"
                            onClick={() => navigate('/customers')}
                        />
                    )}
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                    {loading ? (
                        <Skeleton variant="rounded" height={130} />
                    ) : (
                        <StatCard
                            title="Toplam Ürün"
                            value={stats.products}
                            icon={<Inventory />}
                            color="rgb(248, 194, 36)"
                            onClick={() => navigate('/products')}
                        />
                    )}
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                    {loading ? (
                        <Skeleton variant="rounded" height={130} />
                    ) : (
                        <StatCard
                            title="Toplam Sipariş"
                            value={stats.invoices}
                            icon={<Receipt />}
                            color="#10b981"
                            onClick={() => navigate('/invoices')}
                        />
                    )}
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                    {loading ? (
                        <Skeleton variant="rounded" height={130} />
                    ) : (
                        <StatCard
                            title="USD Kuru"
                            value={rates?.USD?.selling ? `₺${parseFloat(rates.USD.selling).toFixed(2)}` : '-'}
                            icon={<AttachMoney />}
                            color="#8b5cf6"
                            subtext={rates?.EUR?.selling ? `EUR: ₺${parseFloat(rates.EUR.selling).toFixed(2)}` : ''}
                        />
                    )}
                </Grid>
            </Grid>

            {/* Quick Actions */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Hızlı İşlemler
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={6} sm={6} md={3}>
                    <QuickActionButton
                        icon={<Add />}
                        title="Yeni Sipariş"
                        subtitle="Sipariş oluştur"
                        onClick={() => navigate('/invoices')}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                    <QuickActionButton
                        icon={<People />}
                        title="Müşteri Ekle"
                        subtitle="Yeni müşteri kaydet"
                        onClick={() => navigate('/customers')}
                        color="secondary"
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                    <QuickActionButton
                        icon={<Inventory />}
                        title="Ürün Ekle"
                        subtitle="Yeni ürün kaydet"
                        onClick={() => navigate('/products')}
                        color="secondary"
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                    <QuickActionButton
                        icon={<TrendingUp />}
                        title="Raporlar"
                        subtitle="Detaylı analiz"
                        onClick={() => navigate('/invoices')}
                        color="primary"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
