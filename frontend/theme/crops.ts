/**
 * Crop icon and label registry.
 *
 * Maps crop enum values to emoji icons and localised display labels.
 * Used anywhere crop type is shown so users can identify crops at a
 * glance (icon) even if they can't read the label.
 */
import type { Crop } from '../services/api';

export interface CropDisplay {
  icon: string;
  labelEn: string;
  labelFull: string;
}

export const cropDisplay: Record<Crop, CropDisplay> = {
  wheat: {
    icon: '🌾',
    labelEn: 'Wheat',
    labelFull: 'Wheat (گندم)',
  },
  rice: {
    icon: '🍚',
    labelEn: 'Rice',
    labelFull: 'Rice (چاول)',
  },
  cotton: {
    icon: '🌱',
    labelEn: 'Cotton',
    labelFull: 'Cotton (کپاس)',
  },
  maize: {
    icon: '🌽',
    labelEn: 'Maize',
    labelFull: 'Maize (مکئی)',
  },
};

/** Convenience: get just the icon for a crop. */
export function getCropIcon(crop: Crop): string {
  return cropDisplay[crop].icon;
}

/** Convenience: get the short English label. */
export function getCropLabel(crop: Crop): string {
  return cropDisplay[crop].labelEn;
}

/** Convenience: get the full bilingual label. */
export function getCropFullLabel(crop: Crop): string {
  return cropDisplay[crop].labelFull;
}

/**
 * Get the localized crop label using i18n.
 * Usage: getCropLabelI18n(crop, t) where t is the translate function from useLanguage
 */
export function getCropLabelI18n(
  crop: Crop,
  t: (key: string) => string
): string {
  return t(`crops.${crop}.label`);
}

/**
 * Get the localized full crop label using i18n.
 * Usage: getCropFullLabelI18n(crop, t) where t is the translate function from useLanguage
 */
export function getCropFullLabelI18n(
  crop: Crop,
  t: (key: string) => string
): string {
  return t(`crops.${crop}.labelFull`);
}
