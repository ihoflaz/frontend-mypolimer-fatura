import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit, Delete } from '@mui/icons-material';
import api from '../services/api';
import { Formik, Form, Field } from 'formik';
import { ProductSchema } from '../utils/validationSchemas';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProducts = React.useCallback(async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Ürünler yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleCreate = async (values, { resetForm }) => {
        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, values);
            } else {
                await api.post('/products', values);
            }
            fetchProducts();
            handleClose();
            resetForm();
        } catch (error) {
            console.error('Ürün kaydedilirken hata:', error);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingProduct(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                console.error('Ürün silinirken hata:', error);
            }
        }
    };

    const columns = [
        { field: 'product_code', headerName: 'Ürün Kodu', width: 120 },
        { field: 'product_name', headerName: 'Ürün Adı', width: 200 },
        { field: 'raw_material_type', headerName: 'Hammadde Tipi', width: 120 },
        { field: 'description', headerName: 'Açıklama', width: 200 },
        { field: 'origin', headerName: 'Menşei', width: 100 },
        { field: 'unit_price', headerName: 'Fiyat', width: 100 },
        { field: 'currency', headerName: 'Para Birimi', width: 100 },
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

    const initialValues = editingProduct || {
        product_code: '',
        product_name: '',
        raw_material_type: '',
        description: '',
        origin: '',
        packaging: '',
        unit_price: '',
        currency: 'USD',
        default_vat_rate: 20
    };

    return (
        <Box sx={{ height: 500, width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4">Ürünler</Typography>
                <Button variant="contained" onClick={() => setOpen(true)}>Yeni Ürün</Button>
            </Box>
            <DataGrid
                rows={products}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[5, 10, 20]}
                loading={loading}
            />

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>{editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün'}</DialogTitle>
                <Formik
                    initialValues={initialValues}
                    validationSchema={ProductSchema}
                    onSubmit={handleCreate}
                    enableReinitialize
                >
                    {({ errors, touched }) => (
                        <Form>
                            <DialogContent>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                    <Field as={TextField} name="product_code" label="Ürün Kodu" fullWidth margin="normal" error={touched.product_code && !!errors.product_code} helperText={touched.product_code && errors.product_code} />
                                    <Field as={TextField} name="product_name" label="Ürün Adı" fullWidth margin="normal" error={touched.product_name && !!errors.product_name} helperText={touched.product_name && errors.product_name} />
                                    <Field as={TextField} name="raw_material_type" label="Hammadde Tipi" fullWidth margin="normal" select>
                                        {['PP', 'PE', 'PVC', 'PET', 'PS', 'ABS', 'LDPE', 'HDPE', 'LLDPE', 'GPPS', 'HIPS'].map(type => (
                                            <MenuItem key={type} value={type}>{type}</MenuItem>
                                        ))}
                                    </Field>
                                    <Field as={TextField} name="origin" label="Menşei" fullWidth margin="normal" />
                                    <Field as={TextField} name="packaging" label="Paketleme" fullWidth margin="normal" />
                                    <Field as={TextField} name="unit_price" label="Birim Fiyat" type="number" fullWidth margin="normal" />
                                    <Field as={TextField} name="currency" label="Para Birimi" select fullWidth margin="normal">
                                        <MenuItem value="USD">USD</MenuItem>
                                        <MenuItem value="EUR">EUR</MenuItem>
                                    </Field>
                                    <Field as={TextField} name="default_vat_rate" label="KDV Oranı (%)" type="number" fullWidth margin="normal" />
                                </Box>
                                <Field as={TextField} name="description" label="Açıklama (Hammadde Detayları)" fullWidth margin="normal" multiline rows={3} />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose}>İptal</Button>
                                <Button type="submit" variant="contained">{editingProduct ? 'Güncelle' : 'Kaydet'}</Button>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </Box>
    );
};

export default Products;
