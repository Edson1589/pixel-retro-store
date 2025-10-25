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
            <h2 className="text-xl font-extrabold bg-clip-text text-transparent
                     bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">Nuevo evento/torneo</h2>
            <br />
            <EventForm onSubmit={submit} submitLabel="Crear evento" />
        </div>
    );
}
