# -*- coding: utf-8 -*-

from odoo import models, fields, api
from odoo.exceptions import *


class ResPartner(models.Model):
    _inherit = 'res.partner'

    @api.model
    def find_debt(self, partner):
        result = {}
        if partner:
            invoices = self.env['account.invoice'].search([('partner_id','=',partner.get('id')),('state','=','open')])
            if invoices:
                result['invoices']=True
            sales = self.env['sale.order'].search([('partner_id', '=', partner.get('id')), ('invoice_status', '=', 'to invoice')])
            if sales:
                result['sales'] = True
        return result