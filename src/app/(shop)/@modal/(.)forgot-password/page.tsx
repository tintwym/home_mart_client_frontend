import { AuthModalLayout } from '@/components/auth-modal-layout';
import ForgotPasswordPage from '../../(auth)/forgot-password/page';

export default function ForgotPasswordModal() {
    return (
        <AuthModalLayout>
            <ForgotPasswordPage />
        </AuthModalLayout>
    );
}
