'use client';

import { useCallback, useState } from 'react';

type Validators<T extends string> = Record<
    T,
    (value: string, allValues: Values<T>) => string | undefined
>;

type Values<T extends string> = Record<T, string>;

export function useFieldValidation<T extends string>(
    initialValues: Values<T>,
    validators: Validators<T>,
) {
    const [values, setValues] = useState<Values<T>>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<T, boolean>>>({});

    const validateField = useCallback(
        (field: T, nextValues?: Values<T>) => {
            const snapshot = nextValues ?? values;
            const message = validators[field]?.(
                snapshot[field] ?? '',
                snapshot,
            );
            setErrors((prev) => {
                const next = { ...prev };
                if (message) {
                    next[field] = message;
                } else {
                    delete next[field];
                }
                return next;
            });
            return message;
        },
        [validators, values],
    );

    const setValue = useCallback(
        (field: T, value: string) => {
            setValues((prev) => {
                const next = { ...prev, [field]: value };
                (Object.keys(validators) as T[]).forEach((key) => {
                    if (touched[key]) {
                        validateField(key, next);
                    }
                });
                return next;
            });
        },
        [touched, validateField, validators],
    );

    const blurField = useCallback(
        (field: T) => {
            setTouched((prev) => ({ ...prev, [field]: true }));
            validateField(field);
        },
        [validateField],
    );

    const validateAll = useCallback(() => {
        const nextErrors: Partial<Record<T, string>> = {};
        let valid = true;
        (Object.keys(validators) as T[]).forEach((field) => {
            const message = validators[field](values[field] ?? '', values);
            if (message) {
                nextErrors[field] = message;
                valid = false;
            }
        });
        setErrors(nextErrors);
        setTouched(
            Object.fromEntries(
                (Object.keys(validators) as T[]).map((field) => [field, true]),
            ) as Partial<Record<T, boolean>>,
        );
        return valid;
    }, [validators, values]);

    const clearErrors = useCallback(() => setErrors({}), []);

    return {
        values,
        errors,
        touched,
        setValue,
        blurField,
        validateAll,
        clearErrors,
        setValues,
    };
}
