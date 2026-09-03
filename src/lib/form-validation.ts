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
    if (trimmed.length > 80) {
        return 'Name must be 80 characters or fewer';
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

export function validatePhone(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const digits = trimmed.replace(/[^\d+]/g, '');
    if (digits.replace(/\D/g, '').length < 7) {
        return 'Enter a valid phone number';
    }
    return undefined;
}

export function validateListingTitle(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) {
        return 'Title is required';
    }
    if (trimmed.length < 3) {
        return 'Title must be at least 3 characters';
    }
    if (trimmed.length > 120) {
        return 'Title must be 120 characters or fewer';
    }
    return undefined;
}

export function validateListingDescription(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) {
        return 'Description is required';
    }
    if (trimmed.length < 10) {
        return 'Description must be at least 10 characters';
    }
    return undefined;
}

export function validatePrice(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) {
        return 'Price is required';
    }
    const amount = Number(trimmed);
    if (!Number.isFinite(amount)) {
        return 'Enter a valid price';
    }
    if (amount <= 0) {
        return 'Price must be greater than 0';
    }
    return undefined;
}

export function validateRequired(
    value: string,
    label = 'This field',
): string | undefined {
    if (!value.trim()) {
        return `${label} is required`;
    }
    return undefined;
}
