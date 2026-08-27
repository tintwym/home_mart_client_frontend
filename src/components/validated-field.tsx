'use client';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type ValidatedFieldProps = {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: string;
    autoComplete?: string;
    placeholder?: string;
    disabled?: boolean;
};

export function ValidatedField({
    id,
    label,
    type = 'text',
    value,
    onChange,
    onBlur,
    error,
    autoComplete,
    placeholder,
    disabled,
}: ValidatedFieldProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                autoComplete={autoComplete}
                placeholder={placeholder}
                disabled={disabled}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                className={cn(error && 'border-destructive focus-visible:ring-destructive/30')}
            />
            <InputError id={`${id}-error`} message={error} />
        </div>
    );
}
