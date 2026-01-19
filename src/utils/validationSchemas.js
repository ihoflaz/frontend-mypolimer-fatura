import * as Yup from 'yup';

export const CustomerSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
    tax_id: Yup.string(),
    // Add other validations
});

export const ProductSchema = Yup.object().shape({
    product_name: Yup.string().required('Ürün adı gereklidir'),
});
