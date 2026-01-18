import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, IconButton, Grid, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Delete, Download, Receipt, Edit } from '@mui/icons-material';
import api from '../services/api';
import { Formik, Form, Field, FieldArray } from 'formik';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

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

            // Transform items for the form
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

    const columns = [
        { field: 'invoice_no', headerName: 'Sipariş No', width: 150 },
        { field: 'date', headerName: 'Tarih', width: 120 },
        { field: 'Customer', headerName: 'Müşteri', width: 200, valueGetter: (value, row) => row.Customer?.name },
        { field: 'total_amount_currency', headerName: 'Toplam', width: 120 },
        {
            field: 'is_invoiced',
            headerName: 'Durum',
            width: 130,
            renderCell: (params) => (
                params.row.is_invoiced
                    ? <Chip label="Faturalaştırıldı" color="success" size="small" />
                    : <Chip label="Proforma" color="warning" size="small" />
            ),
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 200,
            renderCell: (params) => (
                <Box>
                    <IconButton onClick={() => handleEdit(params.row.id)} title="Düzenle" color="primary" size="small">
                        <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDownloadPdf(params.row.id, params.row.invoice_no)} title="PDF İndir" size="small">
                        <Download />
                    </IconButton>
                    {!params.row.is_invoiced && (
                        <IconButton onClick={() => handleMarkAsInvoiced(params.row.id)} title="Faturalaştır" color="success" size="small">
                            <Receipt />
                        </IconButton>
                    )}
                    <IconButton onClick={() => handleDelete(params.row.id)} title="Sil" color="error" size="small">
                        <Delete />
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

    const getSelectedCustomer = (customerId) => {
        return customers.find(c => c.id === customerId) || null;
    };

    const getSelectedProduct = (productId) => {
        return products.find(p => p.id === productId) || null;
    };

    return (
        <Box sx={{ height: 500, width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4">Siparişler / Faturalar</Typography>
                <Button variant="contained" onClick={() => setOpen(true)}>Yeni Sipariş</Button>
            </Box>
            <DataGrid
                rows={invoices}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[5, 10, 20]}
                loading={loading}
            />

            <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
                <DialogTitle>{editingInvoice ? 'Sipariş Düzenle' : 'Yeni Sipariş Formu'}</DialogTitle>
                <Formik
                    initialValues={getInitialValues()}
                    onSubmit={handleCreate}
                    enableReinitialize
                >
                    {({ values, setFieldValue }) => (
                        <Form>
                            <DialogContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Autocomplete
                                            options={customers}
                                            getOptionLabel={(option) => option.name || ''}
                                            value={getSelectedCustomer(values.customer_id)}
                                            onChange={(e, value) => setFieldValue('customer_id', value?.id || '')}
                                            renderInput={(params) => <TextField {...params} label="Müşteri" required />}
                                        />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Field as={TextField} name="date" label="Tarih" type="date" fullWidth InputLabelProps={{ shrink: true }} />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Field as={TextField} name="exchange_rate_usd" label="USD Kuru" type="number" fullWidth />
                                    </Grid>
                                </Grid>

                                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Sipariş Kalemleri</Typography>
                                <FieldArray name="items">
                                    {({ push, remove }) => (
                                        <Box>
                                            {values.items.map((item, index) => (
                                                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <Autocomplete
                                                        options={products}
                                                        getOptionLabel={(option) => `${option.product_code} - ${option.product_name}` || ''}
                                                        value={getSelectedProduct(item.product_id)}
                                                        onChange={(e, value) => {
                                                            setFieldValue(`items.${index}.product_id`, value?.id || '');
                                                            setFieldValue(`items.${index}.unit_price`, value?.unit_price || 0);
                                                        }}
                                                        renderInput={(params) => <TextField {...params} label="Ürün" sx={{ width: 250 }} size="small" />}
                                                        sx={{ width: 250 }}
                                                    />
                                                    <Field as={TextField} name={`items.${index}.quantity`} label="Miktar" type="number" sx={{ width: 100 }} size="small" />
                                                    <Field as={TextField} name={`items.${index}.unit`} label="Birim" sx={{ width: 80 }} size="small" />
                                                    <Field as={TextField} name={`items.${index}.unit_price`} label="Fiyat ($)" type="number" sx={{ width: 100 }} size="small" />
                                                    <Field as={TextField} name={`items.${index}.delivery_location`} label="Teslim Yeri" sx={{ width: 150 }} size="small" />
                                                    <IconButton onClick={() => remove(index)} color="error"><Delete /></IconButton>
                                                </Box>
                                            ))}
                                            <Button
                                                onClick={() => push({ product_id: '', quantity: 1, unit: 'KG', unit_price: 0, delivery_location: '' })}
                                                variant="outlined"
                                                sx={{ mt: 1 }}
                                            >
                                                Kalem Ekle
                                            </Button>
                                        </Box>
                                    )}
                                </FieldArray>

                                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Sipariş Notu</Typography>
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
                            <DialogActions>
                                <Button onClick={handleClose}>İptal</Button>
                                <Button type="submit" variant="contained">{editingInvoice ? 'Güncelle' : 'Oluştur'}</Button>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </Box>
    );
};

export default Invoices;
