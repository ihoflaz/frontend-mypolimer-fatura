import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit, Delete } from '@mui/icons-material';
import api from '../services/api';
import { Formik, Form, Field } from 'formik';
import { CustomerSchema } from '../utils/validationSchemas';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Firma Adı', width: 180 },
        { field: 'company_title', headerName: 'Ünvan', width: 180 },
        { field: 'city', headerName: 'Şehir', width: 120 },
        { field: 'tax_office', headerName: 'Vergi Dairesi', width: 120 },
        { field: 'tax_number', headerName: 'VKN', width: 120 },
        { field: 'phone', headerName: 'Telefon', width: 130 },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 120,
            renderCell: (params) => (
                <Box>
                    <IconButton onClick={() => handleEdit(params.row)} color="primary" size="small" title="Düzenle">
                        <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row.id)} color="error" size="small" title="Sil">
                        <Delete />
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
        <Box sx={{ height: 500, width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4">Müşteriler</Typography>
                <Button variant="contained" onClick={() => setOpen(true)}>Yeni Müşteri</Button>
            </Box>
            <DataGrid
                rows={customers}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[5, 10, 20]}
                loading={loading}
            />

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>{editingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri'}</DialogTitle>
                <Formik
                    initialValues={initialValues}
                    validationSchema={CustomerSchema}
                    onSubmit={handleCreate}
                    enableReinitialize
                >
                    {({ errors, touched }) => (
                        <Form>
                            <DialogContent>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                    <Field as={TextField} name="name" label="Firma Adı" fullWidth margin="normal" error={touched.name && !!errors.name} helperText={touched.name && errors.name} />
                                    <Field as={TextField} name="company_title" label="Firma Ünvanı" fullWidth margin="normal" />
                                    <Field as={TextField} name="tax_office" label="Vergi Dairesi" fullWidth margin="normal" />
                                    <Field as={TextField} name="tax_number" label="VKN/TCKN" fullWidth margin="normal" />
                                    <Field as={TextField} name="city" label="Şehir" fullWidth margin="normal" />
                                    <Field as={TextField} name="contact_person" label="İletişim Kişisi" fullWidth margin="normal" />
                                    <Field as={TextField} name="email" label="E-posta" fullWidth margin="normal" />
                                    <Field as={TextField} name="phone" label="Telefon" fullWidth margin="normal" />
                                </Box>
                                <Field as={TextField} name="address" label="Adres" fullWidth margin="normal" multiline rows={2} />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose}>İptal</Button>
                                <Button type="submit" variant="contained">{editingCustomer ? 'Güncelle' : 'Kaydet'}</Button>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </Box>
    );
};

export default Customers;
