import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Paper, Grid, Alert, IconButton, Divider } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import api from '../services/api';
import { Formik, Form, Field, FieldArray } from 'formik';

const Settings = () => {
    const [settings, setSettings] = useState(null);
    const [message, setMessage] = useState('');

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
        } catch (error) {
            console.error('Ayarlar güncellenirken hata:', error);
            setMessage('Ayarlar güncellenirken hata oluştu');
        }
    };

    if (!settings) return <div>Yükleniyor...</div>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Firma Ayarları</Typography>
            {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}
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
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>Temel Bilgiler</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Field as={TextField} name="company_name" label="Firma Adı" fullWidth margin="normal" />
                                    <Field as={TextField} name="address" label="Adres" fullWidth margin="normal" multiline rows={2} />
                                    <Field as={TextField} name="city" label="Şehir" fullWidth margin="normal" />
                                    <Field as={TextField} name="tax_office" label="Vergi Dairesi" fullWidth margin="normal" />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Field as={TextField} name="tax_id" label="Vergi Kimlik No" fullWidth margin="normal" />
                                    <Field as={TextField} name="trade_registry_no" label="Ticaret Sicil No" fullWidth margin="normal" />
                                    <Field as={TextField} name="mersis_no" label="Mersis No" fullWidth margin="normal" />
                                    <Field as={TextField} name="phone" label="Telefon" fullWidth margin="normal" />
                                    <Field as={TextField} name="email" label="E-posta" fullWidth margin="normal" />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>Logo (Sol Üst Köşe)</Typography>
                                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
                                        PDF'in sol üst köşesinde görünecek renkli logo
                                    </Typography>
                                    {settings.logo_path && (
                                        <Box sx={{ mb: 2 }}>
                                            <img
                                                src={settings.logo_path.startsWith('http') ? settings.logo_path : `http://localhost:3000/${settings.logo_path.replace(/\\/g, '/').replace(/^public\//, '')}`}
                                                alt="Firma Logosu"
                                                style={{ maxWidth: '150px', maxHeight: '80px', objectFit: 'contain', border: '1px solid #ddd', padding: '5px' }}
                                            />
                                        </Box>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(event) => {
                                            setFieldValue('logo', event.currentTarget.files[0]);
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>Filigran / Arma</Typography>
                                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
                                        PDF'in arka planında saydam olarak görünecek arma
                                    </Typography>
                                    {settings.watermark_path && (
                                        <Box sx={{ mb: 2 }}>
                                            <img
                                                src={settings.watermark_path.startsWith('http') ? settings.watermark_path : `http://localhost:3000/${settings.watermark_path.replace(/\\/g, '/').replace(/^public\//, '')}`}
                                                alt="Filigran"
                                                style={{ maxWidth: '150px', maxHeight: '80px', objectFit: 'contain', border: '1px solid #ddd', padding: '5px' }}
                                            />
                                        </Box>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(event) => {
                                            setFieldValue('watermark', event.currentTarget.files[0]);
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>Banka Hesapları</Typography>
                            <FieldArray name="bank_accounts">
                                {({ push, remove }) => (
                                    <Box>
                                        {values.bank_accounts.map((bank, index) => (
                                            <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                    <Typography variant="subtitle2">Banka Hesabı {index + 1}</Typography>
                                                    <IconButton onClick={() => remove(index)} color="error" size="small">
                                                        <Delete />
                                                    </IconButton>
                                                </Box>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} md={6}>
                                                        <Field as={TextField} name={`bank_accounts.${index}.bank_name`} label="Banka Adı" fullWidth size="small" />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <Field as={TextField} name={`bank_accounts.${index}.branch_name`} label="Şube Adı" fullWidth size="small" />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Field as={TextField} name={`bank_accounts.${index}.account_holder`} label="Hesap Sahibi" fullWidth size="small" />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Field as={TextField} name={`bank_accounts.${index}.iban_tl`} label="TL IBAN" fullWidth size="small" />
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        ))}
                                        <Button
                                            startIcon={<Add />}
                                            onClick={() => push({ bank_name: '', branch_name: '', account_holder: '', iban_tl: '' })}
                                            variant="outlined"
                                        >
                                            Banka Hesabı Ekle
                                        </Button>
                                    </Box>
                                )}
                            </FieldArray>
                        </Paper>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="submit" variant="contained" size="large">Kaydet</Button>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Box>
    );
};

export default Settings;
