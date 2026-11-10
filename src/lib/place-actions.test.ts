import { expect, test } from 'vitest';
import { placeActionAvailability, safeWebsite } from './place-actions';
test('Google reference does not confirm purchases or appointments', () => {
  expect(placeActionAvailability({ website: 'https://example.org', phone: '+33 1 23 45 67 89' })).toEqual({ website: 'https://example.org/', phone: 'tel:+33123456789', canConfirmOrder: false, canConfirmAppointment: false });
});
test('external contact links reject executable protocols', () => {
  expect(safeWebsite('javascript:alert(1)')).toBeNull();
});