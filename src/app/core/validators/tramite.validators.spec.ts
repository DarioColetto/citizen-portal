import { FormControl, FormGroup } from '@angular/forms';
import { dniValidator, emailMatchValidator } from './tramite.validators';

describe('Tramite Validators', () => {
  describe('dniValidator', () => {
    const control = new FormControl('', dniValidator());

    it('accepts valid 8-digit DNI', () => {
      control.setValue('28456789');
      expect(control.errors).toBeNull();
    });

    it('rejects alphabetic input', () => {
      control.setValue('ABCDEFGH');
      expect(control.errors?.['invalidDni']).toBeTruthy();
    });

    it('rejects less than 7 digits', () => {
      control.setValue('12345');
      expect(control.errors?.['invalidDni']).toBeTruthy();
    });

    it('passes on empty value', () => {
      control.setValue('');
      expect(control.errors).toBeNull();
    });
  });

  describe('emailMatchValidator', () => {
    it('passes when emails match', () => {
      const group = new FormGroup(
        {
          applicantEmail: new FormControl('test@mail.com'),
          confirmEmail: new FormControl('test@mail.com'),
        },
        { validators: emailMatchValidator('applicantEmail', 'confirmEmail') }
      );
      expect(group.errors).toBeNull();
    });

    it('fails when emails differ', () => {
      const group = new FormGroup(
        {
          applicantEmail: new FormControl('a@mail.com'),
          confirmEmail: new FormControl('b@mail.com'),
        },
        { validators: emailMatchValidator('applicantEmail', 'confirmEmail') }
      );
      expect(group.errors?.['emailMismatch']).toBeTruthy();
    });
  });
});
