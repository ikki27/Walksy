import type { PlaceCategory } from '../types/place';

// suggestion cards per kind of place, values point to translations in src/i18n/locales
export const PLACE_SUGGESTIONS: Record<PlaceCategory, string[]> = {
  bank: [
    'suggestions.openAccount',
    'suggestions.depositMoney',
    'suggestions.withdrawMoney',
    'suggestions.transferMoney',
    'suggestions.payBills',
    'suggestions.changePin',
  ],
  hospital: ['suggestions.checkIn', 'suggestions.findDepartment', 'suggestions.whatToBring'],
  pharmacy: ['suggestions.pickUpPrescription', 'suggestions.askPharmacist'],
  government: ['suggestions.renewId', 'suggestions.bookAppointment', 'suggestions.whatToBring'],
  post: ['suggestions.sendPackage', 'suggestions.pickUpPackage', 'suggestions.payBills'],
  shop: ['suggestions.findProduct', 'suggestions.askForHelp'],
  other: ['suggestions.whatToBring', 'suggestions.askForHelp'],
};
