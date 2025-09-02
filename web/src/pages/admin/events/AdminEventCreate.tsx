import { useNavigate } from 'react-router-dom';
import EventForm from './EventForm';
import { adminCreateEvent } from '../../../services/adminApi';

export default function AdminEventCreate() {
    const nav = useNavigate();
    const submit = async (fd: FormData) => {
        const e = await adminCreateEvent(fd);
        nav(`/admin/events/${e.id}`);
    };
    return (
        <div>
            <h2 className="text-lg font-bold mb-3">Nuevo evento/torneo</h2>
            <EventForm onSubmit={submit} submitLabel="Crear" />
        </div>
    );
}
