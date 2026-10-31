import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { dbStore } from '../../lib/store.js';

export const getCustomerDashboard = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const customerId = req.user!.id;
    const summary = dbStore.getCustomerDashboard(customerId);

    if (!summary) {
      res.status(404).json({ success: false, error: 'Customer data not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCustomerSubscriptions = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const isStaffOrAdmin = req.user?.role === 'STAFF' || req.user?.role === 'ADMIN';
    const subscriptions = isStaffOrAdmin
      ? dbStore.subscriptions
      : dbStore.getCustomerSubscriptions(req.user!.id);

    res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSubscriptionById = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const id = req.params.id as string;
    const customerId = req.user!.role === 'CUSTOMER' ? req.user!.id : undefined;

    const subscription = dbStore.getSubscriptionById(id, customerId);
    if (!subscription) {
      res.status(404).json({ success: false, error: 'Subscription not found or unauthorized.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCustomerInvoices = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const isStaffOrAdmin = req.user?.role === 'STAFF' || req.user?.role === 'ADMIN';
    const invoices = isStaffOrAdmin
      ? dbStore.invoices
      : dbStore.getCustomerInvoices(req.user!.id);

    res.status(200).json({
      success: true,
      data: invoices,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getInvoiceById = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const id = req.params.id as string;
    const customerId = req.user!.role === 'CUSTOMER' ? req.user!.id : undefined;

    const invoice = dbStore.getInvoiceById(id, customerId);
    if (!invoice) {
      res.status(404).json({ success: false, error: 'Invoice not found or unauthorized.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCustomerPayments = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const isStaffOrAdmin = req.user?.role === 'STAFF' || req.user?.role === 'ADMIN';
    const payments = isStaffOrAdmin
      ? dbStore.payments
      : dbStore.getCustomerPayments(req.user!.id);

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const payInvoice = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const customerId = req.user!.id;
    const { invoiceId, paymentMethod, note } = req.body;

    if (!invoiceId) {
      res.status(400).json({ success: false, error: 'Invoice ID is required.' });
      return;
    }

    const invoice = dbStore.getInvoiceById(invoiceId, customerId);
    if (!invoice) {
      res.status(404).json({ success: false, error: 'Invoice not found or not owned by you.' });
      return;
    }

    if (invoice.status === 'PAID') {
      res.status(400).json({ success: false, error: 'This invoice has already been fully paid.' });
      return;
    }

    const result = dbStore.recordCustomerPayment(
      customerId,
      invoiceId,
      invoice.totalAmount,
      paymentMethod || 'CREDIT_CARD',
      note
    );

    if (!result) {
      res.status(500).json({ success: false, error: 'Failed to record payment transaction.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Payment of ₹${invoice.totalAmount.toFixed(2)} recorded successfully for Invoice ${invoice.invoiceNumber}.`,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCustomerProfile = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = dbStore.findUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ success: false, error: 'Profile not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        companyName: user.companyName,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateCustomerProfile = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { name, companyName, phone, address } = req.body;
    const updated = dbStore.updateUser(req.user!.id, {
      name,
      companyName,
      phone,
      address,
    });

    if (!updated) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        companyName: updated.companyName,
        phone: updated.phone,
        address: updated.address,
        role: updated.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
