import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent,
    DialogActions, MenuItem, IconButton, Card, InputAdornment, Chip, useMediaQuery, useTheme
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit, Delete, Add, Search, Inventory } from '@mui/icons-material';
import api from '../services/api';
import { Formik, Form, Field } from 'formik';
import { ProductSchema } from '../utils/validationSchemas';

const Products = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [products, setProducts] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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

    // Filter products based on search
    const filteredProducts = products.filter(product =>
        product.product_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.raw_material_type?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns = useMemo(() => {
        const allColumns = [
            {
                field: 'product_name',
                headerName: 'Ürün Adı',
                flex: 1,
                minWidth: isMobile ? 150 : 200,
                renderCell: (params) => (
                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                        {params.value}
                    </Typography>
                ),
            },
            {
                field: 'raw_material_type',
                headerName: 'Tip',
                width: 80,
                renderCell: (params) => (
                    <Chip
                        label={params.value || '-'}
                        size="small"
                        sx={{
                            bgcolor: 'rgba(248, 194, 36, 0.15)',
                            color: '#c9a227',
                            fontWeight: 600,
                            fontSize: isMobile ? '0.7rem' : '0.8rem',
                        }}
                    />
                ),
            },
            {
                field: 'origin',
                headerName: 'Menşei',
                width: 100,
                hideOnMobile: true,
            },
            {
                field: 'packaging',
                headerName: 'Paketleme',
                width: 120,
                hideOnMobile: true,
            },
            {
                field: 'description',
                headerName: 'Açıklama',
                flex: 1,
                minWidth: 150,
                hideOnMobile: true,
            },
            {
                field: 'actions',
                headerName: '',
                width: isMobile ? 70 : 100,
                sortable: false,
                renderCell: (params) => (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                            onClick={() => handleEdit(params.row)}
                            size="small"
                            sx={{ color: 'secondary.main', '&:hover': { bgcolor: 'rgba(79, 129, 189, 0.1)' } }}
                        >
                            <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                            onClick={() => handleDelete(params.row.id)}
                            size="small"
                            sx={{ color: 'error.main', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </Box>
                ),
            },
        ];

        return isMobile
            ? allColumns.filter(col => !col.hideOnMobile)
            : allColumns;
    }, [isMobile]);

    const initialValues = editingProduct || {
        product_name: '',
        raw_material_type: '',
        description: '',
        origin: '',
        packaging: '',
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                        Ürünler
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Toplam {products.length} ürün
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
                    Yeni Ürün
                </Button>
            </Box>

            {/* Search & Table Card */}
            <Card sx={{ overflow: 'hidden' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <TextField
                        placeholder="Ürün ara..."
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
                        rows={filteredProducts}
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
                                bgcolor: 'rgba(248, 194, 36, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Inventory sx={{ color: 'primary.main' }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={600}>
                                {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Ürün bilgilerini girin
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>
                <Formik
                    initialValues={initialValues}
                    validationSchema={ProductSchema}
                    onSubmit={handleCreate}
                    enableReinitialize
                >
                    {({ errors, touched }) => (
                        <Form>
                            <DialogContent>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                    <Field as={TextField} name="product_name" label="Ürün Adı" fullWidth error={touched.product_name && !!errors.product_name} helperText={touched.product_name && errors.product_name} />
                                    <Field as={TextField} name="raw_material_type" label="Hammadde Tipi" fullWidth select>
                                        {['PP', 'PE', 'PVC', 'PET', 'PS', 'ABS', 'LDPE', 'HDPE', 'LLDPE', 'GPPS', 'HIPS'].map(type => (
                                            <MenuItem key={type} value={type}>{type}</MenuItem>
                                        ))}
                                    </Field>
                                    <Field as={TextField} name="origin" label="Menşei" fullWidth />
                                    <Field as={TextField} name="packaging" label="Paketleme" fullWidth />
                                </Box>
                                <Field as={TextField} name="description" label="Açıklama (Hammadde Detayları)" fullWidth multiline rows={3} sx={{ mt: 2 }} />
                            </DialogContent>
                            <DialogActions sx={{ p: 3, pt: 0 }}>
                                <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 2 }}>
                                    İptal
                                </Button>
                                <Button type="submit" variant="contained" sx={{ borderRadius: 2, px: 3 }}>
                                    {editingProduct ? 'Güncelle' : 'Kaydet'}
                                </Button>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </Box>
    );
};

export default Products;
