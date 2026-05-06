import { LicenseType } from '../enums/license-type.enum';

export interface CreateLicenseDto {
  licenseType: LicenseType;
  licenseNumber: string;
  issueDate?: string;
  expiryDate?: string;
}
