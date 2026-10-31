import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { dbStore } from '../../lib/store.js';
import { InvoiceStatus, PaymentMethod } from '../../types/index.js';

/**
 * BILLING, PAYMENTS & ANALYTICS CONTROLLER
 */

// 1. Auto-generate invoice from active subscription
export const generateInvoiceFromSubscription = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { subscriptionId, dueDate, notes, discountPercent, status } = req.body;

    if (!subscriptionId) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: subscriptionId',
      });
      return;
    }

    const invoice = dbStore.generateInvoiceFromSubscription(subscriptionId, {
      dueDate,
      notes,
      discountPercent: discountPercent !== undefined ? Number(discountPercent) : undefined,
      status,
    });

    res.status(201).json({
      success: true,
      message: `Invoice ${invoice.invoiceNumber} successfully generated from subscription.`,
      data: invoice,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to generate invoice from subscription.',
    });
  }
};

// 2. View all invoices (Staff/Admin) with filtering & search
export const getAllInvoices = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { status, customerId, search } = req.query;

    const invoices = dbStore.getAllInvoices({
      status: status ? String(status) : undefined,
      customerId: customerId ? String(customerId) : undefined,
      search: search ? String(search) : undefined,
    });

    res.status(200).json({
      success: true,
      data: invoices,
      count: invoices.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch invoices.',
    });
  }
};

// 3. View single invoice by ID
export const getInvoiceById = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const id = req.params.id as string;
    const invoice = dbStore.getInvoiceById(id);

    if (!invoice) {
      res.status(404).json({
        success: false,
        error: `Invoice with ID "${id}" was not found.`,
      });
      return;
    }

    // Attach related payment ledger entries for this invoice
    const payments = dbStore.payments.filter((p) => p.invoiceId === invoice.id);
    const customer = dbStore.findUserById(invoice.customerId);

    res.status(200).json({
      success: true,
      data: {
        ...invoice,
        customer: customer
          ? {
              id: customer.id,
              name: customer.name,
              email: customer.email,
              companyName: customer.companyName,
              phone: customer.phone,
              address: customer.address,
            }
          : undefined,
        payments,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch invoice details.',
    });
  }
};

// 4. Create manual invoice (Staff/Admin)
export const createManualInvoice = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { customerId, subscriptionId, dueDate, notes, lines, discountAmount, status } = req.body;

    if (!customerId) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: customerId',
      });
      return;
    }

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Invoice must contain at least one line item in "lines".',
      });
      return;
    }

    const invoice = dbStore.createManualInvoice({
      customerId,
      subscriptionId,
      dueDate,
      notes,
      lines,
      discountAmount: discountAmount !== undefined ? Number(discountAmount) : 0,
      status: status as InvoiceStatus,
    });

    res.status(201).json({
      success: true,
      message: `Invoice ${invoice.invoiceNumber} created successfully.`,
      data: invoice,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create manual invoice.',
    });
  }
};

// 5. Update invoice status (Draft -> Confirmed -> Paid / Cancelled / Overdue)
export const updateInvoiceStatus = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const validStatuses: InvoiceStatus[] = ['DRAFT', 'CONFIRMED', 'PAID', 'OVERDUE', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: `Invalid status "${status}". Allowed values: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const updated = dbStore.updateInvoiceStatus(id, status);

    res.status(200).json({
      success: true,
      message: `Invoice ${updated.invoiceNumber} status updated to ${status}.`,
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update invoice status.',
    });
  }
};

// 6. Manual payment recording against an invoice (Staff/Admin)
export const recordManualPayment = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { invoiceId, amount, paymentMethod, paymentDate, referenceNote } = req.body;

    if (!invoiceId || amount === undefined || !paymentMethod) {
      res.status(400).json({
        success: false,
        error: 'Missing required payment fields: invoiceId, amount, paymentMethod',
      });
      return;
    }

    const validMethods: PaymentMethod[] = ['CREDIT_CARD', 'BANK_TRANSFER', 'STRIPE', 'CASH', 'UPI'];
    if (!validMethods.includes(paymentMethod)) {
      res.status(400).json({
        success: false,
        error: `Invalid payment method. Allowed: ${validMethods.join(', ')}`,
      });
      return;
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({
        success: false,
        error: 'Payment amount must be a positive number.',
      });
      return;
    }

    const result = dbStore.recordManualPayment({
      invoiceId,
      amount: parsedAmount,
      paymentMethod,
      paymentDate,
      referenceNote,
    });

    res.status(201).json({
      success: true,
      message: `Payment ${result.payment.paymentNumber} recorded successfully.`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to record payment.',
    });
  }
};

// 7. View all payments ledger (Staff/Admin)
export const getAllPayments = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { invoiceId, customerId, paymentMethod } = req.query;

    const payments = dbStore.getAllPayments({
      invoiceId: invoiceId ? String(invoiceId) : undefined,
      customerId: customerId ? String(customerId) : undefined,
      paymentMethod: paymentMethod ? String(paymentMethod) : undefined,
    });

    res.status(200).json({
      success: true,
      data: payments,
      count: payments.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch payments.',
    });
  }
};

// 8. Executive revenue & billing analytics
export const getBillingAnalytics = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const analytics = dbStore.getBillingAnalytics();

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate billing analytics.',
    });
  }
};
