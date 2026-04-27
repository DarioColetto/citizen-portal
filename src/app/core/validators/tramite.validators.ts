import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dniValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value) return null;
    return /^\d{7,8}$/.test(value.replace(/\./g, '')) ? null : { invalidDni: true };
  };
}

export function emailMatchValidator(emailKey: string, confirmKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const email = group.get(emailKey)?.value as string;
    const confirm = group.get(confirmKey)?.value as string;
    if (!email || !confirm) return null;
    return email === confirm ? null : { emailMismatch: true };
  };
}

export function fileSizeValidator(maxMb: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const files = control.value as { size: number }[] | null;
    if (!files?.length) return null;
    const oversized = files.some(f => f.size > maxMb * 1024 * 1024);
    return oversized ? { fileTooLarge: { maxMb } } : null;
  };
}
