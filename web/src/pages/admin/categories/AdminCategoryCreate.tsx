import { useNavigate } from 'react-router-dom';
import CategoryForm from './CategoryForm';
import { createCategory } from '../../../services/adminApi';

export default function AdminCategoryCreate() {
    const nav = useNavigate();
    const submit = async (payload: { name: string; slug: string }) => {
        const c = await createCategory(payload);
        nav(`/admin/categories/${c.id}`);
    };
    return (
        < CategoryForm onSubmit={submit} submitLabel="Crear categoría" />
    );
}
