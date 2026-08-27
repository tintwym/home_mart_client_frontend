import { AuthModalLayout } from '@/components/auth-modal-layout';
import RegisterPage from '../../(auth)/register/page';

export default function RegisterModal() {
    return (
        <AuthModalLayout>
            <RegisterPage />
        </AuthModalLayout>
    );
}
