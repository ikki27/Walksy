import type { PlaceCategory } from './place.types';

// OpenStreetMap describes a place as class + type, e.g. amenity=pharmacy or shop=supermarket
const AMENITY_CATEGORIES: Record<string, PlaceCategory> = {
  bank: 'bank',
  atm: 'bank',
  bureau_de_change: 'bank',
  pharmacy: 'pharmacy',
  hospital: 'hospital',
  clinic: 'hospital',
  doctors: 'hospital',
  dentist: 'hospital',
  post_office: 'post',
  townhall: 'government',
  courthouse: 'government',
  police: 'government',
  social_facility: 'government',
};

export function toPlaceCategory(osmClass: string | undefined, osmType: string | undefined): PlaceCategory {
  const type = osmType ?? '';

  switch (osmClass) {
    case 'amenity':
      return AMENITY_CATEGORIES[type] ?? 'other';
    case 'healthcare':
      return type === 'pharmacy' ? 'pharmacy' : 'hospital';
    case 'office':
      return type === 'government' ? 'government' : 'other';
    case 'shop':
      return type === 'chemist' || type === 'medical_supply' ? 'pharmacy' : 'shop';
    default:
      return 'other';
  }
}
