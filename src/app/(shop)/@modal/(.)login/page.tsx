import { AuthModalLayout } from '@/components/auth-modal-layout';
import LoginPage from '../../(auth)/login/page';

export default function LoginModal() {
    return (
        <AuthModalLayout>
            <LoginPage />
        </AuthModalLayout>
    );
}
