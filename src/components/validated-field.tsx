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
    multiline?: boolean;
    min?: string | number;
    step?: string | number;
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
    multiline = false,
    min,
    step,
}: ValidatedFieldProps) {
    const invalid = Boolean(error);
    const describedBy = error ? `${id}-error` : undefined;
    const fieldClass = cn(
        invalid && 'border-destructive focus-visible:ring-destructive/30',
    );

    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            {multiline ? (
                <textarea
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    aria-invalid={invalid || undefined}
                    aria-describedby={describedBy}
                    className={cn(
                        'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-28 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50',
                        fieldClass,
                    )}
                />
            ) : (
                <Input
                    id={id}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    disabled={disabled}
                    min={min}
                    step={step}
                    aria-invalid={invalid || undefined}
                    aria-describedby={describedBy}
                    className={fieldClass}
                />
            )}
            <InputError id={`${id}-error`} message={error} />
        </div>
    );
}
