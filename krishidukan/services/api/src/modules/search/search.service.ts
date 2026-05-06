import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DEFAULT_SEARCH_RADIUS_KM, DEFAULT_SEARCH_LIMIT, MAX_SEARCH_RADIUS_KM, MAX_SEARCH_LIMIT,
} from '@krishidukan/shared';

export interface SearchResultRow {
  shop_id: string;
  business_name: string;
  owner_name: string;
  phone: string;
  address_line: string;
  city: string;
  lat: number;
  lng: number;
  price: number;
  mrp: number;
  quantity: number;
  in_stock: boolean;
  distance_m: number;
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchByProduct(
    productId: string,
    userLat: number,
    userLng: number,
    radiusKm = DEFAULT_SEARCH_RADIUS_KM,
    limit = DEFAULT_SEARCH_LIMIT,
    page = 1,
  ) {
    const safeRadius = Math.min(radiusKm, MAX_SEARCH_RADIUS_KM);
    const safeLimit = Math.min(limit, MAX_SEARCH_LIMIT);
    const offset = (page - 1) * safeLimit;
    const radiusMeters = safeRadius * 1000;

    // ST_MakePoint(lng, lat) — PostGIS uses X=longitude, Y=latitude.
    // ::geography cast is required for meter-accurate spheroidal distance.
    const results = await this.prisma.$queryRaw<SearchResultRow[]>(
      Prisma.sql`
        SELECT
          s.id                AS shop_id,
          s.business_name,
          s.owner_name,
          s.phone,
          s.address_line,
          s.city,
          s.lat,
          s.lng,
          si.price::float     AS price,
          si.mrp::float       AS mrp,
          si.quantity,
          si.in_stock,
          ST_Distance(
            s.location::geography,
            ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography
          )                   AS distance_m
        FROM shops s
        INNER JOIN shop_inventory si
          ON si.shop_id = s.id
          AND si.product_id = ${productId}
          AND si.in_stock = true
        WHERE
          s.status = 'active'
          AND ST_DWithin(
            s.location::geography,
            ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
            ${radiusMeters}
          )
        ORDER BY distance_m ASC
        LIMIT ${safeLimit}
        OFFSET ${offset}
      `,
    );

    return results.map((r) => ({
      shopId: r.shop_id,
      businessName: r.business_name,
      ownerName: r.owner_name,
      phone: r.phone,
      addressLine: r.address_line,
      city: r.city,
      lat: r.lat,
      lng: r.lng,
      price: r.price,
      mrp: r.mrp,
      quantity: r.quantity,
      inStock: r.in_stock,
      distanceM: r.distance_m,
      distanceKm: +(r.distance_m / 1000).toFixed(2),
    }));
  }

  async logSearch(
    productId: string,
    userLat: number,
    userLng: number,
    radiusKm: number,
    resultsCount: number,
    userId?: string,
  ) {
    await this.prisma.searchLog.create({
      data: { productId, queryLat: userLat, queryLng: userLng, radiusKm, resultsCount, userId },
    });
  }
}
