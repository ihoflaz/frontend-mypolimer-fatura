import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent,
    DialogActions, Autocomplete, IconButton, Grid, Chip, Card, InputAdornment,
    useMediaQuery, useTheme, FormControlLabel, Checkbox, Alert, Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Delete, Download, Receipt, Edit, Add, Search, Cancel } from '@mui/icons-material';
import api from '../services/api';
import { Formik, Form, Field, FieldArray } from 'formik';

const Invoices = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [invoices, setInvoices] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancellingInvoiceId, setCancellingInvoiceId] = useState(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
    const [invoicingId, setInvoicingId] = useState(null);
    const [exchangeRate, setExchangeRate] = useState('');

    const fetchInvoices = React.useCallback(async () => {
        try {
            const response = await api.get('/invoices');
            setInvoices(response.data);
        } catch (error) {
            console.error('Faturalar yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchData = React.useCallback(async () => {
        try {
            const [custRes, prodRes] = await Promise.all([
                api.get('/customers'),
                api.get('/products')
            ]);
            setCustomers(custRes.data);
            setProducts(prodRes.data);
        } catch (error) {
            console.error('Veriler yüklenirken hata:', error);
        }
    }, []);

    useEffect(() => {
        fetchInvoices();
        fetchData();
    }, [fetchInvoices, fetchData]);

    const handleCreate = async (values, { resetForm }) => {
        try {
            let totalCurrency = 0;
            const items = values.items.map(item => {
                const lineTotal = item.quantity * item.unit_price;
                totalCurrency += lineTotal;
                return { ...item, line_total: lineTotal };
            });

            const payload = {
                ...values,
                items,
                total_amount_currency: totalCurrency,
                total_amount_try: totalCurrency * values.exchange_rate_usd,
            };

            if (editingInvoice) {
                await api.put(`/invoices/${editingInvoice.id}`, payload);
            } else {
                await api.post('/invoices', payload);
            }

            fetchInvoices();
            handleClose();
            resetForm();
        } catch (error) {
            console.error('Sipariş kaydedilirken hata:', error);
        }
    };

    const handleEdit = async (id) => {
        try {
            const response = await api.get(`/invoices/${id}`);
            const invoice = response.data;

            const transformedInvoice = {
                ...invoice,
                items: invoice.InvoiceItems?.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit: item.unit || 'KG',
                    unit_price: item.unit_price,
                    delivery_location: item.delivery_location || '',
                })) || []
            };

            setEditingInvoice(transformedInvoice);
            setOpen(true);
        } catch (error) {
            console.error('Sipariş yüklenirken hata:', error);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setEditingInvoice(null);
    };

    const handleOpenCancelDialog = (id) => {
        setCancellingInvoiceId(id);
        setCancellationReason('');
        setCancelDialogOpen(true);
    };

    const handleCloseCancelDialog = () => {
        setCancelDialogOpen(false);
        setCancellingInvoiceId(null);
        setCancellationReason('');
    };

    const handleCancelInvoice = async () => {
        if (!cancellingInvoiceId) return;
        try {
            await api.put(`/invoices/${cancellingInvoiceId}/cancel`, {
                cancellation_reason: cancellationReason
            });
            fetchInvoices();
            handleCloseCancelDialog();
        } catch (error) {
            console.error('Sipariş iptal edilirken hata:', error);
            alert(error.response?.data?.message || 'Bir hata oluştu');
        }
    };

    const handleDownloadPdf = async (id, invoiceNo) => {
        try {
            const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `siparis-${invoiceNo}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('PDF indirilirken hata:', error);
        }
    };

    const handleOpenInvoiceDialog = (id) => {
        setInvoicingId(id);
        setExchangeRate('');
        setInvoiceDialogOpen(true);
    };

    const handleCloseInvoiceDialog = () => {
        setInvoiceDialogOpen(false);
        setInvoicingId(null);
        setExchangeRate('');
    };

    const handleConfirmInvoice = async () => {
        if (!invoicingId || !exchangeRate) {
            alert('Lütfen döviz kurunu girin');
            return;
        }
        try {
            await api.put(`/invoices/${invoicingId}/mark-invoiced`, {
                exchange_rate_usd: parseFloat(exchangeRate)
            });
            fetchInvoices();
            handleCloseInvoiceDialog();
        } catch (error) {
            console.error('Faturalaştırma hatası:', error);
            alert(error.response?.data?.message || 'Bir hata oluştu');
        }
    };

    // Filter invoices
    const filteredInvoices = invoices.filter(inv =>
        inv.invoice_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.Customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns = useMemo(() => {
        const allColumns = [
            {
                field: 'invoice_no',
                headerName: 'No',
                width: isMobile ? 90 : 140,
                renderCell: (params) => (
                    <Chip
                        label={params.value}
                        size="small"
                        sx={{
                            bgcolor: 'rgba(79, 129, 189, 0.15)',
                            color: 'secondary.main',
                            fontWeight: 600,
                            fontSize: isMobile ? '0.7rem' : '0.8rem',
                        }}
                    />
                ),
            },
            {
                field: 'date',
                headerName: 'Tarih',
                width: 100,
                hideOnMobile: true,
                valueFormatter: (value) => {
                    if (!value) return '';
                    return new Date(value).toLocaleDateString('tr-TR');
                },
            },
            {
                field: 'Customer',
                headerName: 'Müşteri',
                flex: 1,
                minWidth: isMobile ? 100 : 180,
                valueGetter: (value, row) => row.Customer?.name,
                renderCell: (params) => (
                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                        {params.value}
                    </Typography>
                ),
            },
            {
                field: 'total_amount_currency',
                headerName: 'Toplam',
                width: isMobile ? 80 : 130,
                renderCell: (params) => (
                    <Typography variant="body2" fontWeight={600} color="primary.dark" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                        ${parseFloat(params.value || 0).toFixed(0)}
                    </Typography>
                ),
            },
            {
                field: 'status',
                headerName: 'Durum',
                width: 110,
                hideOnMobile: true,
                renderCell: (params) => {
                    if (params.row.status === 'Cancelled') {
                        const reason = params.row.cancellation_reason || 'İptal nedeni belirtilmemiş';
                        return (
                            <Tooltip title={`İptal Nedeni: ${reason}`} arrow>
                                <Chip label="İptal" size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#dc2626', cursor: 'pointer' }} />
                            </Tooltip>
                        );
                    }
                    return params.row.is_invoiced
                        ? <Chip label="Faturalı" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#059669' }} />
                        : <Chip label="Proforma" size="small" sx={{ bgcolor: 'rgba(248, 194, 36, 0.15)', color: '#c9a227' }} />;
                },
            },
            {
                field: 'actions',
                headerName: '',
                width: isMobile ? 120 : 160,
                sortable: false,
                renderCell: (params) => (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                            onClick={() => handleEdit(params.row.id)}
                            size="small"
                            sx={{ color: 'secondary.main', '&:hover': { bgcolor: 'rgba(79, 129, 189, 0.1)' } }}
                        >
                            <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                            onClick={() => handleDownloadPdf(params.row.id, params.row.invoice_no)}
                            size="small"
                            sx={{ color: 'success.main', '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)' } }}
                        >
                            <Download fontSize="small" />
                        </IconButton>
                        {params.row.status !== 'Cancelled' && !params.row.is_invoiced && (
                            <IconButton
                                onClick={() => handleOpenInvoiceDialog(params.row.id)}
                                size="small"
                                sx={{ color: 'primary.main', '&:hover': { bgcolor: 'rgba(248, 194, 36, 0.1)' } }}
                            >
                                <Receipt fontSize="small" />
                            </IconButton>
                        )}
                        {params.row.status !== 'Cancelled' && (
                            <IconButton
                                onClick={() => handleOpenCancelDialog(params.row.id)}
                                size="small"
                                sx={{ color: 'error.main', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                                title="İptal Et"
                            >
                                <Cancel fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                ),
            },
        ];

        return isMobile
            ? allColumns.filter(col => !col.hideOnMobile)
            : allColumns;
    }, [isMobile]);

    const getInitialValues = () => {
        if (editingInvoice) {
            return {
                customer_id: editingInvoice.customer_id,
                date: editingInvoice.date,
                notes: editingInvoice.notes || '',
                is_bonded_warehouse: editingInvoice.is_bonded_warehouse || false,
                is_vat_included: editingInvoice.is_vat_included || false,
                items: editingInvoice.items || [{ product_id: '', quantity: 1, unit: 'KG', unit_price: 0, delivery_location: '' }],
            };
        }
        return {
            customer_id: '',
            date: new Date().toISOString().split('T')[0],
            notes: '',
            is_bonded_warehouse: false,
            is_vat_included: false,
            items: [{ product_id: '', quantity: 1, unit: 'KG', unit_price: 0, delivery_location: '' }],
        };
    };

    const getSelectedCustomer = (customerId) => customers.find(c => c.id === customerId) || null;
    const getSelectedProduct = (productId) => products.find(p => p.id === productId) || null;

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                        Siparişler
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Toplam {invoices.length} sipariş
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpen(true)}
                    sx={{
                        px: 3,
                        py: 1,
                        background: 'linear-gradient(135deg, rgb(248, 194, 36) 0%, #ffd54f 100%)',
                        color: '#1a1a2e',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #e6b320 0%, #f0c740 100%)',
                        },
                    }}
                >
                    Yeni Sipariş
                </Button>
            </Box>

            {/* Search & Table Card */}
            <Card sx={{ overflow: 'hidden' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <TextField
                        placeholder="Sipariş ara..."
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ width: { xs: '100%', sm: 300 } }}
                    />
                </Box>

                <Box sx={{ height: 500 }}>
                    <DataGrid
                        rows={filteredInvoices}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[5, 10, 20]}
                        loading={loading}
                        disableSelectionOnClick
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-columnHeaders': {
                                bgcolor: 'rgba(79, 129, 189, 0.08)',
                            },
                            '& .MuiDataGrid-row:hover': {
                                bgcolor: 'rgba(79, 129, 189, 0.04)',
                            },
                        }}
                    />
                </Box>
            </Card>

            {/* Dialog */}
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: 'rgba(248, 194, 36, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Receipt sx={{ color: 'primary.main' }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={600}>
                                {editingInvoice ? 'Sipariş Düzenle' : 'Yeni Sipariş'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Sipariş bilgilerini girin
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>
                <Formik
                    initialValues={getInitialValues()}
                    onSubmit={handleCreate}
                    enableReinitialize
                >
                    {({ values, setFieldValue, touched, errors, setTouched }) => (
                        <Form>
                            <DialogContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Autocomplete
                                            options={customers}
                                            getOptionLabel={(option) => option.name || ''}
                                            value={getSelectedCustomer(values.customer_id)}
                                            onChange={(e, value) => setFieldValue('customer_id', value?.id || '')}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Müşteri"
                                                    required
                                                    error={!values.customer_id && touched.customer_id}
                                                    helperText={!values.customer_id && touched.customer_id ? 'Müşteri seçimi zorunludur' : ''}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Field as={TextField} name="date" label="Tarih" type="date" fullWidth InputLabelProps={{ shrink: true }} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={values.is_bonded_warehouse}
                                                    onChange={(e) => setFieldValue('is_bonded_warehouse', e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography variant="body2" fontWeight={500}>Antrepolu Devir</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Seçilirse KDV %0 olarak hesaplanır
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={values.is_vat_included}
                                                    onChange={(e) => setFieldValue('is_vat_included', e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography variant="body2" fontWeight={500}>KDV Dahil</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Seçilirse PDF'te fiyatlar %20 KDV dahil yazılır
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </Grid>
                                </Grid>

                                <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 2 }}>
                                    Sipariş Kalemleri
                                </Typography>
                                <FieldArray name="items">
                                    {({ push, remove }) => (
                                        <Box>
                                            {values.items.map((item, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        display: 'flex',
                                                        gap: 1,
                                                        mb: 1.5,
                                                        alignItems: 'center',
                                                        flexWrap: 'wrap',
                                                        p: 1.5,
                                                        bgcolor: 'rgba(79, 129, 189, 0.04)',
                                                        borderRadius: 2,
                                                    }}
                                                >
                                                    <Autocomplete
                                                        options={products}
                                                        getOptionLabel={(option) => `${option.product_code} - ${option.product_name}` || ''}
                                                        value={getSelectedProduct(item.product_id)}
                                                        onChange={(e, value) => {
                                                            setFieldValue(`items.${index}.product_id`, value?.id || '');
                                                            setFieldValue(`items.${index}.unit_price`, value?.unit_price || 0);
                                                        }}
                                                        renderInput={(params) => <TextField {...params} label="Ürün" size="small" />}
                                                        sx={{ width: { xs: '100%', sm: 220 } }}
                                                    />
                                                    <Field as={TextField} name={`items.${index}.quantity`} label="Miktar" type="number" sx={{ width: 90 }} size="small" />
                                                    <Field as={TextField} name={`items.${index}.unit`} label="Birim" sx={{ width: 70 }} size="small" />
                                                    <Field as={TextField} name={`items.${index}.unit_price`} label="Fiyat ($)" type="number" sx={{ width: 100 }} size="small" />
                                                    <Field as={TextField} name={`items.${index}.delivery_location`} label="Teslim Yeri" sx={{ width: { xs: '100%', sm: 130 } }} size="small" />
                                                    <IconButton onClick={() => remove(index)} color="error" size="small">
                                                        <Delete />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                            <Button
                                                onClick={() => push({ product_id: '', quantity: 1, unit: 'KG', unit_price: 0, delivery_location: '' })}
                                                variant="outlined"
                                                startIcon={<Add />}
                                                sx={{ mt: 1, borderRadius: 2 }}
                                            >
                                                Kalem Ekle
                                            </Button>
                                        </Box>
                                    )}
                                </FieldArray>

                                <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
                                    Sipariş Notu
                                </Typography>
                                <Field
                                    as={TextField}
                                    name="notes"
                                    label="Sipariş Notu (PDF'te görünecek)"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder="Siparişe eklemek istediğiniz notları buraya yazabilirsiniz..."
                                />
                            </DialogContent>
                            <DialogActions sx={{ p: 3, pt: 0 }}>
                                <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 2 }}>
                                    İptal
                                </Button>
                                <Button type="submit" variant="contained" sx={{ borderRadius: 2, px: 3 }}>
                                    {editingInvoice ? 'Güncelle' : 'Oluştur'}
                                </Button>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>

            {/* Cancel Dialog */}
            <Dialog
                open={cancelDialogOpen}
                onClose={handleCloseCancelDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: 'rgba(239, 68, 68, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Cancel sx={{ color: 'error.main' }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={600}>
                                Siparişi İptal Et
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Bu işlem geri alınamaz
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Siparişi iptal etmek istediğinizden emin misiniz? Lütfen iptal nedenini belirtin.
                    </Typography>
                    <TextField
                        fullWidth
                        label="İptal Nedeni"
                        multiline
                        rows={3}
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        placeholder="Örn: Müşteri talebi ile iptal edildi..."
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={handleCloseCancelDialog} variant="outlined" sx={{ borderRadius: 2 }}>
                        Vazgeç
                    </Button>
                    <Button
                        onClick={handleCancelInvoice}
                        variant="contained"
                        color="error"
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        İptal Et
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Invoice Dialog - Ask for Exchange Rate */}
            <Dialog
                open={invoiceDialogOpen}
                onClose={handleCloseInvoiceDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: 'rgba(248, 194, 36, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Receipt sx={{ color: 'primary.main' }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={600}>
                                Siparişi Faturalaştır
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Döviz kurunu girin
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Lütfen faturalaştırma tarihindeki güncel USD kurunu girin. Bu değer raporlama için kullanılacaktır.
                    </Alert>
                    <TextField
                        fullWidth
                        label="USD/TRY Kuru"
                        type="number"
                        value={exchangeRate}
                        onChange={(e) => setExchangeRate(e.target.value)}
                        placeholder="Örn: 34.50"
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$1 =</InputAdornment>,
                            endAdornment: <InputAdornment position="end">TL</InputAdornment>,
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={handleCloseInvoiceDialog} variant="outlined" sx={{ borderRadius: 2 }}>
                        Vazgeç
                    </Button>
                    <Button
                        onClick={handleConfirmInvoice}
                        variant="contained"
                        sx={{ borderRadius: 2, px: 3 }}
                        disabled={!exchangeRate}
                    >
                        Faturalaştır
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Invoices;
