export enum LicenseType {
  PESTICIDE_LICENSE = 'pesticide_license',
  FERTILIZER_LICENSE = 'fertilizer_license',
  SEED_LICENSE = 'seed_license',
  GST_REGISTRATION = 'gst_registration',
  TRADE_LICENSE = 'trade_license',
  FSSAI = 'fssai',
  OTHER = 'other',
}

export const LICENSE_TYPE_LABELS: Record<LicenseType, string> = {
  [LicenseType.PESTICIDE_LICENSE]: 'Pesticide License (Form-9/Form-3)',
  [LicenseType.FERTILIZER_LICENSE]: 'Fertilizer License',
  [LicenseType.SEED_LICENSE]: 'Seed Dealer License',
  [LicenseType.GST_REGISTRATION]: 'GST Registration',
  [LicenseType.TRADE_LICENSE]: 'Trade License',
  [LicenseType.FSSAI]: 'FSSAI License',
  [LicenseType.OTHER]: 'Other',
};
