import React, { useState, useEffect } from 'react';
import {
    Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent,
    DialogActions, Autocomplete, IconButton, Grid, Chip, Card, InputAdornment
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Delete, Download, Receipt, Edit, Add, Search } from '@mui/icons-material';
import api from '../services/api';
import { Formik, Form, Field, FieldArray } from 'formik';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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

    const handleDelete = async (id) => {
        if (window.confirm('Bu siparişi silmek istediğinizden emin misiniz?')) {
            try {
                await api.delete(`/invoices/${id}`);
                fetchInvoices();
            } catch (error) {
                console.error('Sipariş silinirken hata:', error);
            }
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

    const handleMarkAsInvoiced = async (id) => {
        try {
            await api.put(`/invoices/${id}/mark-invoiced`);
            fetchInvoices();
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

    const columns = [
        {
            field: 'invoice_no',
            headerName: 'Sipariş No',
            width: 140,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    sx={{
                        bgcolor: 'rgba(79, 129, 189, 0.15)',
                        color: 'secondary.main',
                        fontWeight: 600,
                    }}
                />
            ),
        },
        {
            field: 'date',
            headerName: 'Tarih',
            width: 110,
            valueFormatter: (value) => {
                if (!value) return '';
                return new Date(value).toLocaleDateString('tr-TR');
            },
        },
        {
            field: 'Customer',
            headerName: 'Müşteri',
            flex: 1,
            minWidth: 180,
            valueGetter: (value, row) => row.Customer?.name
        },
        {
            field: 'total_amount_currency',
            headerName: 'Toplam',
            width: 130,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={600} color="primary.dark">
                    $ {parseFloat(params.value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Typography>
            ),
        },
        {
            field: 'is_invoiced',
            headerName: 'Durum',
            width: 130,
            renderCell: (params) => (
                params.row.is_invoiced
                    ? <Chip label="Faturalaştırıldı" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#059669' }} />
                    : <Chip label="Proforma" size="small" sx={{ bgcolor: 'rgba(248, 194, 36, 0.15)', color: '#c9a227' }} />
            ),
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 160,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                        onClick={() => handleEdit(params.row.id)}
                        size="small"
                        sx={{ color: 'secondary.main', '&:hover': { bgcolor: 'rgba(79, 129, 189, 0.1)' } }}
                        title="Düzenle"
                    >
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                        onClick={() => handleDownloadPdf(params.row.id, params.row.invoice_no)}
                        size="small"
                        sx={{ color: 'success.main', '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)' } }}
                        title="PDF İndir"
                    >
                        <Download fontSize="small" />
                    </IconButton>
                    {!params.row.is_invoiced && (
                        <IconButton
                            onClick={() => handleMarkAsInvoiced(params.row.id)}
                            size="small"
                            sx={{ color: 'primary.main', '&:hover': { bgcolor: 'rgba(248, 194, 36, 0.1)' } }}
                            title="Faturalaştır"
                        >
                            <Receipt fontSize="small" />
                        </IconButton>
                    )}
                    <IconButton
                        onClick={() => handleDelete(params.row.id)}
                        size="small"
                        sx={{ color: 'error.main', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                        title="Sil"
                    >
                        <Delete fontSize="small" />
                    </IconButton>
                </Box>
            ),
        },
    ];

    const getInitialValues = () => {
        if (editingInvoice) {
            return {
                customer_id: editingInvoice.customer_id,
                date: editingInvoice.date,
                exchange_rate_usd: editingInvoice.exchange_rate_usd || 30.0,
                notes: editingInvoice.notes || '',
                items: editingInvoice.items || [{ product_id: '', quantity: 1, unit: 'KG', unit_price: 0, delivery_location: '' }],
            };
        }
        return {
            customer_id: '',
            date: new Date().toISOString().split('T')[0],
            exchange_rate_usd: 30.0,
            notes: '',
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
                    {({ values, setFieldValue }) => (
                        <Form>
                            <DialogContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Autocomplete
                                            options={customers}
                                            getOptionLabel={(option) => option.name || ''}
                                            value={getSelectedCustomer(values.customer_id)}
                                            onChange={(e, value) => setFieldValue('customer_id', value?.id || '')}
                                            renderInput={(params) => <TextField {...params} label="Müşteri" required />}
                                        />
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Field as={TextField} name="date" label="Tarih" type="date" fullWidth InputLabelProps={{ shrink: true }} />
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Field as={TextField} name="exchange_rate_usd" label="USD Kuru" type="number" fullWidth />
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
        </Box>
    );
};

export default Invoices;
