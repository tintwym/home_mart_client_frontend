'use client';

import { useCallback, useRef, useState } from 'react';

type Validators<T extends string> = Record<
    T,
    (value: string, allValues: Values<T>) => string | undefined
>;

type Values<T extends string> = Record<T, string>;

function fieldError<T extends string>(
    field: T,
    snapshot: Values<T>,
    validators: Validators<T>,
): string | undefined {
    return validators[field]?.(snapshot[field] ?? '', snapshot);
}

export function useFieldValidation<T extends string>(
    initialValues: Values<T>,
    validators: Validators<T>,
) {
    const [values, setValuesState] = useState<Values<T>>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<T, boolean>>>({});
    const valuesRef = useRef(values);
    const touchedRef = useRef(touched);
    valuesRef.current = values;
    touchedRef.current = touched;

    const applyErrors = useCallback(
        (snapshot: Values<T>, fields: T[]) => {
            setErrors((prev) => {
                const next = { ...prev };
                fields.forEach((field) => {
                    const message = fieldError(field, snapshot, validators);
                    if (message) next[field] = message;
                    else delete next[field];
                });
                return next;
            });
        },
        [validators],
    );

    const setValues = useCallback((next: Values<T>) => {
        valuesRef.current = next;
        setValuesState(next);
    }, []);

    const setValue = useCallback(
        (field: T, value: string) => {
            const next = { ...valuesRef.current, [field]: value };
            valuesRef.current = next;
            setValuesState(next);
            const fieldsToCheck = (Object.keys(validators) as T[]).filter(
                (key) => key === field || Boolean(touchedRef.current[key]),
            );
            applyErrors(next, fieldsToCheck);
        },
        [applyErrors, validators],
    );

    const blurField = useCallback(
        (field: T) => {
            const nextTouched = { ...touchedRef.current, [field]: true };
            touchedRef.current = nextTouched;
            setTouched(nextTouched);
            applyErrors(valuesRef.current, [field]);
        },
        [applyErrors],
    );

    const validateAll = useCallback(() => {
        const fields = Object.keys(validators) as T[];
        const snapshot = valuesRef.current;
        const nextTouched = Object.fromEntries(
            fields.map((field) => [field, true]),
        ) as Partial<Record<T, boolean>>;
        touchedRef.current = nextTouched;
        setTouched(nextTouched);

        const nextErrors: Partial<Record<T, string>> = {};
        let valid = true;
        fields.forEach((field) => {
            const message = fieldError(field, snapshot, validators);
            if (message) {
                nextErrors[field] = message;
                valid = false;
            }
        });
        setErrors(nextErrors);
        return valid;
    }, [validators]);

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
