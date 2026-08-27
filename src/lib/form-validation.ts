export function validateEmail(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) {
        return 'Email is required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return 'Enter a valid email address';
    }
    return undefined;
}

export function validatePassword(
    value: string,
    minLength = 8,
): string | undefined {
    if (!value) {
        return 'Password is required';
    }
    if (value.length < minLength) {
        return `Password must be at least ${minLength} characters`;
    }
    return undefined;
}

export function validateName(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) {
        return 'Name is required';
    }
    if (trimmed.length < 2) {
        return 'Name must be at least 2 characters';
    }
    return undefined;
}

export function validatePasswordConfirmation(
    password: string,
    confirmation: string,
): string | undefined {
    if (!confirmation) {
        return 'Please confirm your password';
    }
    if (password !== confirmation) {
        return 'Passwords do not match';
    }
    return undefined;
}
