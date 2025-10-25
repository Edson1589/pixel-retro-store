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
            <h2 className="text-xl font-extrabold bg-clip-text text-transparent
                     bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">Nuevo producto</h2>
            <br />
            <ProductForm onSubmit={submit} submitLabel="Crear producto" />
        </div>
    );
}
