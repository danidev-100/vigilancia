import { PrismaClient, Role, VisitorType, EntryMethod, IncidentType, PropertyStatus } from '@prisma/client';
import { hashSync } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Vigilancia database...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.entry.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.contractor.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.visitor.deleteMany();
  await prisma.familyMember.deleteMany();
  await prisma.property.deleteMany();
  await prisma.session.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // ---- USERS ----

  const admin = await prisma.user.create({
    data: {
      email: 'admin@vigilancia.app',
      name: 'Admin Principal',
      passwordHash: hashSync('Admin123!', 12),
      role: Role.ADMIN,
      emailVerified: true,
      phone: '+5491123456789',
    },
  });

  const guard1 = await prisma.user.create({
    data: {
      email: 'guardia1@vigilancia.app',
      name: 'Carlos Segura',
      passwordHash: hashSync('Guardia123!', 12),
      role: Role.SECURITY_GUARD,
      emailVerified: true,
      phone: '+5491123456790',
    },
  });

  const guard2 = await prisma.user.create({
    data: {
      email: 'guardia2@vigilancia.app',
      name: 'María Puerta',
      passwordHash: hashSync('Guardia123!', 12),
      role: Role.SECURITY_GUARD,
      emailVerified: true,
      phone: '+5491123456791',
    },
  });

  const owner1 = await prisma.user.create({
    data: {
      email: 'propietario1@vigilancia.app',
      name: 'Roberto Fernández',
      passwordHash: hashSync('Duenio123!', 12),
      role: Role.PROPERTY_OWNER,
      emailVerified: true,
      phone: '+5491123456792',
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      email: 'propietario2@vigilancia.app',
      name: 'Laura Martínez',
      passwordHash: hashSync('Duenio123!', 12),
      role: Role.PROPERTY_OWNER,
      emailVerified: true,
      phone: '+5491123456793',
    },
  });

  // ---- PROPERTIES ----

  const prop1 = await prisma.property.create({
    data: {
      ownerId: owner1.id,
      houseNumber: '123',
      block: 'A',
      street: 'Calle Principal',
      neighborhood: 'Los Alamos',
      status: PropertyStatus.ACTIVE,
    },
  });

  const prop2 = await prisma.property.create({
    data: {
      ownerId: owner1.id,
      houseNumber: '456',
      block: 'B',
      street: 'Avenida Central',
      neighborhood: 'Los Alamos',
      status: PropertyStatus.ACTIVE,
    },
  });

  const prop3 = await prisma.property.create({
    data: {
      ownerId: owner2.id,
      houseNumber: '789',
      block: 'C',
      street: 'Calle Secundaria',
      neighborhood: 'Los Alamos',
      status: PropertyStatus.ACTIVE,
    },
  });

  // ---- FAMILY MEMBERS ----

  const fm1 = await prisma.familyMember.create({
    data: {
      propertyId: prop1.id,
      fullName: 'Ana Fernández',
      nationalId: 'DNI 30.123.456',
      phone: '+5491123456794',
      relationship: 'SPOUSE',
    },
  });

  const fm2 = await prisma.familyMember.create({
    data: {
      propertyId: prop1.id,
      fullName: 'Pedro Fernández',
      nationalId: 'DNI 45.678.901',
      phone: '+5491123456795',
      relationship: 'CHILD',
    },
  });

  await prisma.familyMember.create({
    data: {
      propertyId: prop3.id,
      fullName: 'Juan Martínez',
      nationalId: 'DNI 32.654.987',
      phone: '+5491123456796',
      relationship: 'SPOUSE',
    },
  });

  // ---- VISITORS ----

  const today = new Date();
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  const visitor1 = await prisma.visitor.create({
    data: {
      propertyId: prop1.id,
      fullName: 'John Smith',
      document: 'PASSPORT AB123456',
      phone: '+5491133334444',
      email: 'john@example.com',
      vehiclePlate: 'ABC-123',
      vehicleBrand: 'Toyota',
      vehicleModel: 'Corolla',
      authorizedById: owner1.id,
      visitorType: VisitorType.ONE_TIME,
      validFrom: today,
      validUntil: nextMonth,
      qrCode: 'qr-vst-' + crypto.randomUUID().slice(0, 8),
      isActive: true,
    },
  });

  await prisma.visitor.create({
    data: {
      propertyId: prop2.id,
      fullName: 'Emily Johnson',
      document: 'DNI 40.555.777',
      phone: '+5491144445555',
      authorizedById: owner1.id,
      visitorType: VisitorType.SCHEDULED,
      validFrom: today,
      validUntil: nextMonth,
      qrCode: 'qr-vst-' + crypto.randomUUID().slice(0, 8),
      isActive: true,
      notes: 'Visita recurrente — viene los viernes',
    },
  });

  await prisma.visitor.create({
    data: {
      propertyId: prop3.id,
      fullName: 'Michael Brown',
      document: 'DNI 38.222.111',
      phone: '+5491155556666',
      vehiclePlate: 'DEF-456',
      vehicleBrand: 'Honda',
      vehicleModel: 'Civic',
      authorizedById: owner2.id,
      visitorType: VisitorType.PERMANENT,
      validFrom: yesterday,
      validUntil: nextMonth,
      qrCode: 'qr-vst-' + crypto.randomUUID().slice(0, 8),
      isActive: true,
    },
  });

  // ---- EMPLOYEES ----

  await prisma.employee.create({
    data: {
      propertyId: prop1.id,
      fullName: 'Lucía García',
      nationalId: 'DNI 35.444.888',
      phone: '+5491166667777',
      position: 'Housekeeper',
      company: 'CleanHome Services',
      vehiclePlate: 'GHI-789',
      workSchedule: '{"monday":"09:00-17:00","wednesday":"09:00-17:00","friday":"09:00-17:00"}',
      isActive: true,
    },
  });

  await prisma.employee.create({
    data: {
      propertyId: prop2.id,
      fullName: 'José Rodríguez',
      nationalId: 'DNI 32.111.333',
      phone: '+5491177778888',
      position: 'Gardener',
      company: 'Verde Jardín',
      isActive: true,
    },
  });

  await prisma.employee.create({
    data: {
      propertyId: prop3.id,
      fullName: 'María López',
      nationalId: 'DNI 36.789.012',
      phone: '+5491188889999',
      position: 'Cook',
      company: 'Gourmet Home',
      vehiclePlate: 'JKL-012',
      isActive: true,
    },
  });

  // ---- CONTRACTORS ----

  await prisma.contractor.create({
    data: {
      propertyId: prop1.id,
      company: 'PoolTech SRL',
      employeeName: 'Carlos Mendez',
      nationalId: 'DNI 28.456.789',
      phone: '+5491199990000',
      serviceType: 'Pool Maintenance',
      workOrder: 'WO-2026-001',
      authorizedUntil: nextMonth,
    },
  });

  await prisma.contractor.create({
    data: {
      propertyId: prop3.id,
      company: 'Electro Hogar',
      employeeName: 'Diego Torres',
      nationalId: 'DNI 31.654.321',
      phone: '+5491100001111',
      serviceType: 'Electrical Repair',
      workOrder: 'WO-2026-002',
      vehiclePlate: 'MNO-345',
      authorizedUntil: nextMonth,
    },
  });

  // ---- VEHICLES ----

  await prisma.vehicle.create({
    data: {
      plate: 'FML-001',
      brand: 'Toyota',
      model: 'Corolla Cross',
      color: 'White',
      ownerType: 'FAMILY_MEMBER',
      propertyId: prop1.id,
      familyMemberId: fm1.id,
      ownerId: fm1.id,
    },
  });

  await prisma.vehicle.create({
    data: {
      plate: 'FML-002',
      brand: 'Volkswagen',
      model: 'Golf',
      color: 'Blue',
      ownerType: 'FAMILY_MEMBER',
      propertyId: prop1.id,
      familyMemberId: fm2.id,
      ownerId: fm2.id,
    },
  });

  // ---- ENTRIES ----

  const twoHoursAgo = new Date(today.getTime() - 2 * 60 * 60 * 1000);
  const oneHourAgo = new Date(today.getTime() - 1 * 60 * 60 * 1000);

  // Active entry (no exit)
  await prisma.entry.create({
    data: {
      personType: 'VISITOR',
      visitorId: visitor1.id,
      guardId: guard1.id,
      propertyId: prop1.id,
      gate: 'Main Gate',
      entryTime: twoHoursAgo,
      entryMethod: EntryMethod.QR_CODE,
    },
  });

  // Completed entry (with exit)
  const entry2 = await prisma.entry.create({
    data: {
      personType: 'EMPLOYEE',
      employeeId: (await prisma.employee.findFirst({ where: { propertyId: prop1.id } }))!.id,
      guardId: guard2.id,
      propertyId: prop1.id,
      gate: 'Main Gate',
      entryTime: oneHourAgo,
      entryMethod: EntryMethod.NATIONAL_ID,
    },
  });

  await prisma.entry.update({
    where: { id: entry2.id },
    data: {
      exitTime: new Date(),
    },
  });

  // ---- INCIDENTS ----

  await prisma.incident.create({
    data: {
      guardId: guard1.id,
      title: 'Suspicious vehicle near Block A',
      description: 'A white van without community sticker was circling Block A for 30 minutes. Occupants identified as delivery personnel after verification.',
      incidentType: IncidentType.SUSPICIOUS_ACTIVITY,
      photos: [],
    },
  });

  await prisma.incident.create({
    data: {
      guardId: guard2.id,
      title: 'Gate sensor malfunction',
      description: 'Main gate sensor failed to detect vehicle exit at 14:30. Manually opened gate. Maintenance notified.',
      incidentType: IncidentType.OTHER,
      photos: [],
    },
  });

  // ---- NOTIFICATIONS ----

  await prisma.notification.create({
    data: {
      userId: owner1.id,
      title: 'Visitor Arrived',
      message: 'John Smith has arrived at the Main Gate.',
      type: 'VISITOR_ARRIVAL',
      data: { visitorId: visitor1.id, gate: 'Main Gate', time: twoHoursAgo.toISOString() },
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: owner1.id,
      title: 'Employee Entry',
      message: 'Lucía García (CleanHome Services) entered via Main Gate.',
      type: 'EMPLOYEE_ARRIVAL',
      data: { gate: 'Main Gate', time: oneHourAgo.toISOString() },
      isRead: true,
    },
  });

  await prisma.notification.create({
    data: {
      userId: owner2.id,
      title: 'Welcome to Vigilancia',
      message: 'Your neighborhood security system is now active.',
      type: 'SYSTEM_ALERT',
      isRead: false,
    },
  });

  // ---- AUDIT LOG ----

  await prisma.auditLog.createMany({
    data: [
      { userId: admin.id, action: 'SEED_EXECUTED', entityType: 'SYSTEM', details: { description: 'Database seeded successfully' } },
      { userId: owner1.id, action: 'VISITOR_CREATED', entityType: 'VISITOR', entityId: visitor1.id, details: { name: 'John Smith' } },
      { userId: guard1.id, action: 'ENTRY_REGISTERED', entityType: 'ENTRY', details: { visitorId: visitor1.id, gate: 'Main Gate' } },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('📋 Test Accounts:');
  console.log('   Admin:            admin@vigilancia.app / Admin123!');
  console.log('   Security Guard:    guardia1@vigilancia.app / Guardia123!');
  console.log('   Property Owner:    propietario1@vigilancia.app / Duenio123!');
  console.log('   Property Owner 2:  propietario2@vigilancia.app / Duenio123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
