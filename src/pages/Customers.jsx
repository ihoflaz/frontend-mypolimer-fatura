import React, { useState, useEffect } from 'react';
import {
    Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent,
    DialogActions, IconButton, Paper, InputAdornment, Card, Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit, Delete, Add, Search, People, Business } from '@mui/icons-material';
import api from '../services/api';
import { Formik, Form, Field } from 'formik';
import { CustomerSchema } from '../utils/validationSchemas';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCustomers = React.useCallback(async () => {
        try {
            const response = await api.get('/customers');
            setCustomers(response.data);
        } catch (error) {
            console.error('Müşteriler yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleCreate = async (values, { resetForm }) => {
        try {
            if (editingCustomer) {
                await api.put(`/customers/${editingCustomer.id}`, values);
            } else {
                await api.post('/customers', values);
            }
            fetchCustomers();
            handleClose();
            resetForm();
        } catch (error) {
            console.error('Müşteri kaydedilirken hata:', error);
        }
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingCustomer(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
            try {
                await api.delete(`/customers/${id}`);
                fetchCustomers();
            } catch (error) {
                console.error('Müşteri silinirken hata:', error);
            }
        }
    };

    // Filter customers based on search
    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.includes(searchQuery)
    );

    const columns = [
        {
            field: 'name',
            headerName: 'Firma Adı',
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            bgcolor: 'rgba(79, 129, 189, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Business fontSize="small" sx={{ color: 'secondary.main' }} />
                    </Box>
                    <Typography variant="body2" fontWeight={500}>
                        {params.value}
                    </Typography>
                </Box>
            ),
        },
        { field: 'company_title', headerName: 'Ünvan', flex: 1, minWidth: 150 },
        { field: 'city', headerName: 'Şehir', width: 120 },
        { field: 'tax_office', headerName: 'Vergi Dairesi', width: 130 },
        { field: 'tax_number', headerName: 'VKN', width: 120 },
        { field: 'phone', headerName: 'Telefon', width: 140 },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                        onClick={() => handleEdit(params.row)}
                        size="small"
                        sx={{
                            color: 'secondary.main',
                            '&:hover': { bgcolor: 'rgba(79, 129, 189, 0.1)' }
                        }}
                    >
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                        onClick={() => handleDelete(params.row.id)}
                        size="small"
                        sx={{
                            color: 'error.main',
                            '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' }
                        }}
                    >
                        <Delete fontSize="small" />
                    </IconButton>
                </Box>
            ),
        },
    ];

    const initialValues = editingCustomer || {
        name: '',
        company_title: '',
        tax_id: '',
        tax_office: '',
        tax_number: '',
        city: '',
        contact_person: '',
        email: '',
        phone: '',
        address: ''
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                        Müşteriler
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Toplam {customers.length} müşteri
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
                    Yeni Müşteri
                </Button>
            </Box>

            {/* Search & Table Card */}
            <Card sx={{ overflow: 'hidden' }}>
                {/* Search Bar */}
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <TextField
                        placeholder="Müşteri ara..."
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

                {/* DataGrid */}
                <Box sx={{ height: 500 }}>
                    <DataGrid
                        rows={filteredCustomers}
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
                maxWidth="md"
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
                                bgcolor: 'rgba(79, 129, 189, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <People sx={{ color: 'secondary.main' }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={600}>
                                {editingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Müşteri bilgilerini girin
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>
                <Formik
                    initialValues={initialValues}
                    validationSchema={CustomerSchema}
                    onSubmit={handleCreate}
                    enableReinitialize
                >
                    {({ errors, touched }) => (
                        <Form>
                            <DialogContent>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                    <Field as={TextField} name="name" label="Firma Adı" fullWidth error={touched.name && !!errors.name} helperText={touched.name && errors.name} />
                                    <Field as={TextField} name="company_title" label="Firma Ünvanı" fullWidth />
                                    <Field as={TextField} name="tax_office" label="Vergi Dairesi" fullWidth />
                                    <Field as={TextField} name="tax_number" label="VKN/TCKN" fullWidth />
                                    <Field as={TextField} name="city" label="Şehir" fullWidth />
                                    <Field as={TextField} name="contact_person" label="İletişim Kişisi" fullWidth />
                                    <Field as={TextField} name="email" label="E-posta" fullWidth />
                                    <Field as={TextField} name="phone" label="Telefon" fullWidth />
                                </Box>
                                <Field as={TextField} name="address" label="Adres" fullWidth multiline rows={2} sx={{ mt: 2 }} />
                            </DialogContent>
                            <DialogActions sx={{ p: 3, pt: 0 }}>
                                <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 2 }}>
                                    İptal
                                </Button>
                                <Button type="submit" variant="contained" sx={{ borderRadius: 2, px: 3 }}>
                                    {editingCustomer ? 'Güncelle' : 'Kaydet'}
                                </Button>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </Box>
    );
};

export default Customers;
