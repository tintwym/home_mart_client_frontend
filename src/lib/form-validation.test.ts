import { describe, expect, it } from 'vitest';
import {
    validateEmail,
    validateListingDescription,
    validateListingTitle,
    validateName,
    validatePassword,
    validatePasswordConfirmation,
    validatePhone,
    validatePrice,
    validateRequired,
} from './form-validation';

describe('validateEmail', () => {
    it('requires a value', () => {
        expect(validateEmail('')).toBe('Email is required');
        expect(validateEmail('   ')).toBe('Email is required');
    });

    it('rejects invalid addresses', () => {
        expect(validateEmail('not-an-email')).toBe('Enter a valid email address');
        expect(validateEmail('a@b')).toBe('Enter a valid email address');
    });

    it('accepts a normal address', () => {
        expect(validateEmail('you@example.com')).toBeUndefined();
    });
});

describe('validatePassword', () => {
    it('requires a value', () => {
        expect(validatePassword('')).toBe('Password is required');
    });

    it('enforces minimum length', () => {
        expect(validatePassword('short', 8)).toBe(
            'Password must be at least 8 characters',
        );
        expect(validatePassword('longenough')).toBeUndefined();
    });
});

describe('validateName', () => {
    it('requires at least two characters', () => {
        expect(validateName('')).toBe('Name is required');
        expect(validateName('A')).toBe('Name must be at least 2 characters');
        expect(validateName('Ada')).toBeUndefined();
    });
});

describe('validatePasswordConfirmation', () => {
    it('requires a match', () => {
        expect(validatePasswordConfirmation('secret12', '')).toBe(
            'Please confirm your password',
        );
        expect(validatePasswordConfirmation('secret12', 'other')).toBe(
            'Passwords do not match',
        );
        expect(validatePasswordConfirmation('secret12', 'secret12')).toBeUndefined();
    });
});

describe('validatePhone', () => {
    it('allows empty', () => {
        expect(validatePhone('')).toBeUndefined();
    });

    it('rejects too-short numbers', () => {
        expect(validatePhone('123')).toBe('Enter a valid phone number');
        expect(validatePhone('+95 9 123 4567')).toBeUndefined();
    });
});

describe('listing validators', () => {
    it('validates title', () => {
        expect(validateListingTitle('')).toBe('Title is required');
        expect(validateListingTitle('ab')).toBe(
            'Title must be at least 3 characters',
        );
        expect(validateListingTitle('Oak table')).toBeUndefined();
    });

    it('validates description', () => {
        expect(validateListingDescription('short')).toBe(
            'Description must be at least 10 characters',
        );
        expect(validateListingDescription('A sturdy oak dining table')).toBeUndefined();
    });

    it('validates price', () => {
        expect(validatePrice('')).toBe('Price is required');
        expect(validatePrice('abc')).toBe('Enter a valid price');
        expect(validatePrice('0')).toBe('Price must be greater than 0');
        expect(validatePrice('12.50')).toBeUndefined();
    });
});

describe('validateRequired', () => {
    it('uses the field label', () => {
        expect(validateRequired('', 'Subcategory')).toBe(
            'Subcategory is required',
        );
        expect(validateRequired('abc', 'Subcategory')).toBeUndefined();
    });
});
