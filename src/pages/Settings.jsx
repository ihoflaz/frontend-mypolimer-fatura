import React, { useState, useEffect } from 'react';
import {
    Box, Button, Typography, TextField, Grid, Alert, IconButton,
    Divider, Card, CardContent, Tabs, Tab, Snackbar, Avatar
} from '@mui/material';
import { Add, Delete, Settings as SettingsIcon, Business, AccountBalance, Image } from '@mui/icons-material';
import api from '../services/api';
import { Formik, Form, Field, FieldArray } from 'formik';

function TabPanel({ children, value, index, ...other }) {
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

const Settings = () => {
    const [settings, setSettings] = useState(null);
    const [message, setMessage] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                setSettings(response.data);
            } catch (error) {
                console.error('Ayarlar yüklenirken hata:', error);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (values) => {
        try {
            const formData = new FormData();
            Object.keys(values).forEach(key => {
                if (key === 'logo' && values[key]) {
                    formData.append('logo', values[key]);
                } else if (key === 'watermark' && values[key]) {
                    formData.append('watermark', values[key]);
                } else if (key === 'bank_accounts') {
                    formData.append('bank_accounts', JSON.stringify(values[key]));
                } else {
                    formData.append(key, values[key]);
                }
            });

            const response = await api.put('/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSettings(response.data);
            setMessage('Ayarlar başarıyla güncellendi');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Ayarlar güncellenirken hata:', error);
            setMessage('Ayarlar güncellenirken hata oluştu');
            setSnackbarOpen(true);
        }
    };

    if (!settings) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography color="text.secondary">Yükleniyor...</Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                    Firma Ayarları
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Firma bilgilerini ve PDF ayarlarını yönetin
                </Typography>
            </Box>

            <Formik
                initialValues={{
                    company_name: settings.company_name || '',
                    address: settings.address || '',
                    city: settings.city || '',
                    tax_office: settings.tax_office || '',
                    tax_id: settings.tax_id || '',
                    trade_registry_no: settings.trade_registry_no || '',
                    mersis_no: settings.mersis_no || '',
                    phone: settings.phone || '',
                    email: settings.email || '',
                    logo: null,
                    watermark: null,
                    bank_accounts: settings.bank_accounts || [],
                }}
                onSubmit={handleSubmit}
            >
                {({ setFieldValue, values }) => (
                    <Form>
                        <Card>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                                <Tabs
                                    value={tabValue}
                                    onChange={(e, v) => setTabValue(v)}
                                    sx={{
                                        '& .MuiTab-root': {
                                            textTransform: 'none',
                                            fontWeight: 500,
                                        },
                                    }}
                                >
                                    <Tab icon={<Business sx={{ fontSize: 18 }} />} iconPosition="start" label="Firma Bilgileri" />
                                    <Tab icon={<Image sx={{ fontSize: 18 }} />} iconPosition="start" label="Logo & Filigran" />
                                    <Tab icon={<AccountBalance sx={{ fontSize: 18 }} />} iconPosition="start" label="Banka Hesapları" />
                                </Tabs>
                            </Box>

                            <CardContent sx={{ p: 3 }}>
                                {/* Tab 0: Firma Bilgileri */}
                                <TabPanel value={tabValue} index={0}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Field as={TextField} name="company_name" label="Firma Adı" fullWidth />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Field as={TextField} name="city" label="Şehir" fullWidth />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Field as={TextField} name="address" label="Adres" fullWidth multiline rows={2} />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Field as={TextField} name="tax_office" label="Vergi Dairesi" fullWidth />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Field as={TextField} name="tax_id" label="Vergi Kimlik No" fullWidth />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Field as={TextField} name="trade_registry_no" label="Ticaret Sicil No" fullWidth />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Field as={TextField} name="mersis_no" label="Mersis No" fullWidth />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Field as={TextField} name="phone" label="Telefon" fullWidth />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Field as={TextField} name="email" label="E-posta" fullWidth />
                                        </Grid>
                                    </Grid>
                                </TabPanel>

                                {/* Tab 1: Logo & Filigran */}
                                <TabPanel value={tabValue} index={1}>
                                    <Grid container spacing={4}>
                                        <Grid item xs={12} md={6}>
                                            <Box sx={{ p: 3, border: '2px dashed', borderColor: 'divider', borderRadius: 3, textAlign: 'center' }}>
                                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                                    Logo (Sol Üst Köşe)
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    PDF'in sol üst köşesinde görünecek renkli logo
                                                </Typography>
                                                {settings.logo_path && (
                                                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                                                        <Box
                                                            component="img"
                                                            src={settings.logo_path.startsWith('http') ? settings.logo_path : `http://localhost:3000/${settings.logo_path.replace(/\\/g, '/').replace(/^public\//, '')}`}
                                                            alt="Firma Logosu"
                                                            sx={{
                                                                maxWidth: 150,
                                                                maxHeight: 80,
                                                                objectFit: 'contain',
                                                                border: '1px solid',
                                                                borderColor: 'divider',
                                                                borderRadius: 2,
                                                                p: 1,
                                                            }}
                                                        />
                                                    </Box>
                                                )}
                                                <Button
                                                    variant="outlined"
                                                    component="label"
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    Logo Seç
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        hidden
                                                        onChange={(e) => setFieldValue('logo', e.currentTarget.files[0])}
                                                    />
                                                </Button>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Box sx={{ p: 3, border: '2px dashed', borderColor: 'divider', borderRadius: 3, textAlign: 'center' }}>
                                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                                    Filigran / Arma
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    PDF'in arka planında saydam olarak görünecek arma
                                                </Typography>
                                                {settings.watermark_path && (
                                                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                                                        <Box
                                                            component="img"
                                                            src={settings.watermark_path.startsWith('http') ? settings.watermark_path : `http://localhost:3000/${settings.watermark_path.replace(/\\/g, '/').replace(/^public\//, '')}`}
                                                            alt="Filigran"
                                                            sx={{
                                                                maxWidth: 150,
                                                                maxHeight: 80,
                                                                objectFit: 'contain',
                                                                border: '1px solid',
                                                                borderColor: 'divider',
                                                                borderRadius: 2,
                                                                p: 1,
                                                            }}
                                                        />
                                                    </Box>
                                                )}
                                                <Button
                                                    variant="outlined"
                                                    component="label"
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    Filigran Seç
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        hidden
                                                        onChange={(e) => setFieldValue('watermark', e.currentTarget.files[0])}
                                                    />
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </TabPanel>

                                {/* Tab 2: Banka Hesapları */}
                                <TabPanel value={tabValue} index={2}>
                                    <FieldArray name="bank_accounts">
                                        {({ push, remove }) => (
                                            <Box>
                                                {values.bank_accounts.map((bank, index) => (
                                                    <Card
                                                        key={index}
                                                        variant="outlined"
                                                        sx={{ mb: 2, borderRadius: 2 }}
                                                    >
                                                        <CardContent>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                                                        {index + 1}
                                                                    </Avatar>
                                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                                        Banka Hesabı {index + 1}
                                                                    </Typography>
                                                                </Box>
                                                                <IconButton
                                                                    onClick={() => remove(index)}
                                                                    size="small"
                                                                    sx={{ color: 'error.main' }}
                                                                >
                                                                    <Delete fontSize="small" />
                                                                </IconButton>
                                                            </Box>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={12} sm={6}>
                                                                    <Field as={TextField} name={`bank_accounts.${index}.bank_name`} label="Banka Adı" fullWidth size="small" />
                                                                </Grid>
                                                                <Grid item xs={12} sm={6}>
                                                                    <Field as={TextField} name={`bank_accounts.${index}.branch_name`} label="Şube Adı" fullWidth size="small" />
                                                                </Grid>
                                                                <Grid item xs={12}>
                                                                    <Field as={TextField} name={`bank_accounts.${index}.account_holder`} label="Hesap Sahibi" fullWidth size="small" />
                                                                </Grid>
                                                                <Grid item xs={12}>
                                                                    <Field as={TextField} name={`bank_accounts.${index}.iban_tl`} label="TL IBAN" fullWidth size="small" />
                                                                </Grid>
                                                            </Grid>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                                <Button
                                                    startIcon={<Add />}
                                                    onClick={() => push({ bank_name: '', branch_name: '', account_holder: '', iban_tl: '' })}
                                                    variant="outlined"
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    Banka Hesabı Ekle
                                                </Button>
                                            </Box>
                                        )}
                                    </FieldArray>
                                </TabPanel>
                            </CardContent>

                            <Divider />

                            <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        px: 4,
                                        background: 'linear-gradient(135deg, rgb(248, 194, 36) 0%, #ffd54f 100%)',
                                        color: '#1a1a2e',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #e6b320 0%, #f0c740 100%)',
                                        },
                                    }}
                                >
                                    Kaydet
                                </Button>
                            </Box>
                        </Card>
                    </Form>
                )}
            </Formik>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                message={message}
            />
        </Box>
    );
};

export default Settings;
