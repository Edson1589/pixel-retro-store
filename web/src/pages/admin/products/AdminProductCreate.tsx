import { useNavigate } from 'react-router-dom';
import ProductForm from './ProductForm';
import { createProduct } from '../../../services/adminApi';

export default function AdminProductCreate() {
    const nav = useNavigate();

    const submit = async (fd: FormData) => {
        const saved = await createProduct(fd);
        nav(`/admin/products/${saved.id}`);
    };

    return (
        <div>
            <h2 className="text-lg font-bold mb-3">Nuevo producto</h2>
            <ProductForm onSubmit={submit} submitLabel="Crear producto" />
        </div>
    );
}
