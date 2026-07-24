import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { SearchResult } from '@vigilancia/shared';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(params: { query: string; type?: string; propertyId?: string }): Promise<SearchResult> {
    const query = params.query.trim();
    if (!query) {
      return { visitors: [], employees: [], contractors: [], familyMembers: [] };
    }

    const searchFilter = {
      contains: query,
      mode: 'insensitive' as const,
    };

    const propertyFilter = params.propertyId ? { propertyId: params.propertyId } : {};

    const results: SearchResult = {
      visitors: [],
      employees: [],
      contractors: [],
      familyMembers: [],
    };

    const promises: Promise<unknown>[] = [];

    if (!params.type || params.type === 'all' || params.type === 'visitor') {
      promises.push(
        this.prisma.visitor
          .findMany({
            where: {
              ...propertyFilter,
              OR: [
                { fullName: searchFilter },
                { document: { contains: query } },
                { phone: { contains: query } },
                { vehiclePlate: { contains: query, mode: 'insensitive' } },
              ],
            },
            take: 20,
            orderBy: { fullName: 'asc' },
            include: { property: { select: { id: true, ownerId: true, houseNumber: true, block: true, street: true, neighborhood: true, status: true } } },
          })
          .then((v) => {
            results.visitors = v.map((item) => ({
              ...item,
              validFrom: item.validFrom.toISOString(),
              validUntil: item.validUntil.toISOString(),
            })) as unknown as SearchResult['visitors'];
          }),
      );
    }

    if (!params.type || params.type === 'all' || params.type === 'employee') {
      promises.push(
        this.prisma.employee
          .findMany({
            where: {
              ...propertyFilter,
              OR: [
                { fullName: searchFilter },
                { nationalId: { contains: query } },
                { phone: { contains: query } },
                { company: searchFilter },
              ],
            },
            take: 20,
            orderBy: { fullName: 'asc' },
            include: { property: { select: { id: true, houseNumber: true, block: true, street: true } } },
          })
          .then((e) => {
            results.employees = e as SearchResult['employees'];
          }),
      );
    }

    if (!params.type || params.type === 'all' || params.type === 'contractor') {
      promises.push(
        this.prisma.contractor
          .findMany({
            where: {
              ...propertyFilter,
              OR: [
                { company: searchFilter },
                { employeeName: searchFilter },
                { nationalId: { contains: query } },
                { phone: { contains: query } },
              ],
            },
            take: 20,
            orderBy: { company: 'asc' },
            include: { property: { select: { id: true, houseNumber: true, block: true, street: true } } },
          })
          .then((c) => {
            results.contractors = c.map((item) => ({
              ...item,
              authorizedUntil: item.authorizedUntil.toISOString(),
            })) as SearchResult['contractors'];
          }),
      );
    }

    if (!params.type || params.type === 'all' || params.type === 'resident') {
      promises.push(
        this.prisma.familyMember
          .findMany({
            where: {
              ...propertyFilter,
              OR: [
                { fullName: searchFilter },
                { nationalId: { contains: query } },
                { phone: { contains: query } },
              ],
            },
            take: 20,
            orderBy: { fullName: 'asc' },
            include: { property: { select: { id: true, houseNumber: true, block: true, street: true } } },
          })
          .then((f) => {
            results.familyMembers = f as SearchResult['familyMembers'];
          }),
      );
    }

    await Promise.all(promises);
    return results;
  }
}
