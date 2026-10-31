import { PrismaClient, Role, Frequency, SubscriptionStatus, InvoiceStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PostgreSQL database for Brightloop Subscription Management...');

  const salt = await bcrypt.genSalt(10);

  // 1. Create Users
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@brightloop.com' },
    update: {},
    create: {
      name: 'Alex Rivera',
      email: 'customer@brightloop.com',
      companyName: 'Apex Retail Solutions Ltd.',
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace, Suite 300, Austin, TX 78701',
      role: Role.CUSTOMER,
      passwordHash: await bcrypt.hash('Password@123', salt),
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@brightloop.com' },
    update: {},
    create: {
      name: 'Sarah Chen',
      email: 'staff@brightloop.com',
      companyName: 'Brightloop Software Internal',
      phone: '+1 (555) 876-5432',
      address: 'Brightloop HQ, 100 Innovation Way, San Francisco, CA',
      role: Role.STAFF,
      passwordHash: await bcrypt.hash('Staff@12345', salt),
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@brightloop.com' },
    update: {},
    create: {
      name: 'Marcus Vance',
      email: 'admin@brightloop.com',
      companyName: 'Brightloop Software Management',
      phone: '+1 (555) 999-1122',
      address: 'Brightloop HQ, Executive Suite, San Francisco, CA',
      role: Role.ADMIN,
      passwordHash: await bcrypt.hash('Admin@12345', salt),
    },
  });

  // 2. Create Products
  const erpProduct = await prisma.product.create({
    data: {
      name: 'Brightloop Core ERP',
      type: 'Software',
      salesPrice: 300.0,
      costPrice: 50.0,
      notes: 'Base enterprise platform',
      variants: {
        create: [
          { name: 'Standard Edition', priceAdjustment: 0 },
          { name: 'Odoo Brand Edition', priceAdjustment: 560.0 },
        ],
      },
    },
  });

  const seatProduct = await prisma.product.create({
    data: {
      name: 'Staff User Seats',
      type: 'License',
      salesPrice: 35.0,
      costPrice: 5.0,
      notes: 'Per-seat monthly billing',
    },
  });

  // 3. Create Plans
  const enterprisePlan = await prisma.plan.create({
    data: {
      name: 'Brightloop Enterprise Cloud Suite',
      description: 'Full business suite with ERP, analytics, and CRM',
      price: 1420.0,
      billingFrequency: Frequency.MONTHLY,
      minQuantity: 5,
      canPause: true,
      canRenew: true,
    },
  });

  // 4. Create Subscription
  const subscription = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0041',
      customerId: customerUser.id,
      planId: enterprisePlan.id,
      startDate: new Date('2026-01-15'),
      expiryDate: new Date('2027-01-15'),
      paymentTerms: 'Net 15',
      status: SubscriptionStatus.ACTIVE,
      autoRenew: true,
      totalAmount: 1420.0,
      lines: {
        create: [
          {
            productId: erpProduct.id,
            quantity: 1,
            unitPrice: 860.0,
            amount: 860.0,
          },
          {
            productId: seatProduct.id,
            quantity: 10,
            unitPrice: 35.0,
            amount: 350.0,
          },
        ],
      },
    },
  });

  // 5. Create Invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-1044',
      customerId: customerUser.id,
      subscriptionId: subscription.id,
      issueDate: new Date('2026-10-15'),
      dueDate: new Date('2026-11-15'),
      subtotal: 1420.0,
      taxAmount: 142.0,
      discountAmount: 142.0,
      totalAmount: 1420.0,
      status: InvoiceStatus.CONFIRMED,
      lines: {
        create: [
          {
            productId: erpProduct.id,
            description: 'Core ERP Software Base (Odoo Brand Edition)',
            quantity: 1,
            unitPrice: 860.0,
            taxRate: 10,
            amount: 860.0,
          },
          {
            productId: seatProduct.id,
            description: 'Staff User Seats (10 seats)',
            quantity: 10,
            unitPrice: 35.0,
            taxRate: 10,
            amount: 350.0,
          },
        ],
      },
    },
  });

  console.log('PostgreSQL database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
