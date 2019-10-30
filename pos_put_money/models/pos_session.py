# -*- coding: utf-8 -*-

from odoo import models, fields, api
from odoo.exceptions import *


class PosSession(models.Model):
    _inherit = 'pos.session'

    def put_money(self, vals):
        if not vals['client']:
            raise Warning("No ha seleccionado un cliente para el pago.")

        cash_wizard = self.env['cash.box.in'].create(
            {'name': vals['pos_put_money_comment'], 'amount': vals['pos_put_money_value'],
             'pos_journal_id': vals['journal_id'], 'pos_partner_id': vals['client']})

        cash_wizard = cash_wizard.with_context(active_model='pos.session', active_ids=[self.id])
        cash_wizard.run()
        return cash_wizard
