import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FirebaseAdminService } from '../../firebase-admin/firebase-admin.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import { FIREBASE_STORAGE_LICENSES_PATH, LICENSE_SIGNED_URL_EXPIRY_MS } from '@krishidukan/shared';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LicensesService {
  constructor(
    private prisma: PrismaService,
    private firebase: FirebaseAdminService,
  ) {}

  async create(
    shopId: string,
    dto: CreateLicenseDto,
    fileBuffer: Buffer,
    mimeType: string,
    originalName: string,
  ) {
    const ext = originalName.split('.').pop() ?? 'pdf';
    const storagePath = `${FIREBASE_STORAGE_LICENSES_PATH}/${shopId}/${uuidv4()}.${ext}`;

    await this.firebase.uploadBuffer(fileBuffer, mimeType, storagePath);

    return this.prisma.shopLicense.create({
      data: {
        shopId,
        licenseType: dto.licenseType,
        licenseNumber: dto.licenseNumber,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : null,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        documentUrl: storagePath,
      },
    });
  }

  async findByShopId(shopId: string) {
    return this.prisma.shopLicense.findMany({ where: { shopId }, orderBy: { createdAt: 'desc' } });
  }

  async getSignedUrl(licenseId: string, requestingShopId: string | null, isAdmin: boolean): Promise<string> {
    const license = await this.prisma.shopLicense.findUnique({ where: { id: licenseId } });
    if (!license) throw new NotFoundException('License not found');

    const canAccess = isAdmin || license.shopId === requestingShopId;
    if (!canAccess) throw new ForbiddenException('Access denied');

    return this.firebase.getSignedStorageUrl(license.documentUrl, LICENSE_SIGNED_URL_EXPIRY_MS);
  }

  async delete(licenseId: string, shopId: string) {
    const license = await this.prisma.shopLicense.findUnique({ where: { id: licenseId } });
    if (!license) throw new NotFoundException('License not found');
    if (license.shopId !== shopId) throw new ForbiddenException('Access denied');

    await this.firebase.deleteFile(license.documentUrl);
    await this.prisma.shopLicense.delete({ where: { id: licenseId } });
  }
}
