import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterFarmerDto } from './dto/register-farmer.dto';

@Injectable()
export class FarmersService {
  constructor(private prisma: PrismaService) {}

  async upsert(firebaseUid: string, phone: string, dto: RegisterFarmerDto) {
    return this.prisma.userFarmer.upsert({
      where: { firebaseUid },
      create: { firebaseUid, phone, name: dto.name, lat: dto.lat, lng: dto.lng },
      update: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.lat !== undefined ? { lat: dto.lat } : {}),
        ...(dto.lng !== undefined ? { lng: dto.lng } : {}),
      },
    });
  }

  async findByFirebaseUid(firebaseUid: string) {
    const farmer = await this.prisma.userFarmer.findUnique({ where: { firebaseUid } });
    if (!farmer) throw new NotFoundException('Farmer profile not found');
    return farmer;
  }
}
