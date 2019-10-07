# -*- coding: utf-8 -*-
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# Copyright (C) 2019 - Today: Guadaltech S.L (http://www.guadaltech.es)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models, api, _


class SaleOrder(models.Model):
    _inherit = 'sale.order'

    @api.model
    def _prepare_order_field_from_pos(self, order_data):
        session_obj = self.env['pos.session']
        session = session_obj.browse(order_data['pos_session_id'])
        res = {}
        res.update({
            'partner_id':       order_data['partner_id'] or False,
            'origin':           _("Point of Sale %s") % (session.name),
            'client_order_ref': order_data['name'],
            'user_id':          order_data['user_id'] or False,
            'order_line':       [],
        })
        if order_data.get('pricelist_id'):
            res.update({
                'pricelist_id': order_data['pricelist_id'],
            })
        else:
            res.update({
                'pricelist_id': 1,
            })
        for line_data in order_data['lines']:
            res['order_line'].append([
                0, False, self._prepare_order_line_field_from_pos(
                    line_data[2], res)])
        return res

    @api.model
    def _prepare_order_line_field_from_pos(self, line_data, sale_order_data):
        res = {}
        res.update({
            'product_id': line_data['product_id'],
            'product_uom_qty': line_data['qty'],
            'price_unit':  line_data['price_unit'],
            'discount': line_data['discount'],
            'tax_id': line_data['tax_ids'],
            'partner_id' : sale_order_data['partner_id'],
            'quantity' : line_data['qty']
        })
        return res

    @api.model
    def create_order_from_pos(self, order_data):
        is_pos_pricelist = len(self.env['ir.module.module'].search(
            [('name', '=', 'pos_pricelist'), ('state', '=', 'installed')]))
        # Create Draft Sale order
        sale_order = self.create(
            self.with_context(is_pos_pricelist=is_pos_pricelist).
            _prepare_order_field_from_pos(order_data))

        # Confirm Sale Order
        if order_data['sale_order_state'] in ['confirmed', 'delivered']:
            sale_order.action_confirm()

        # mark picking as delivered
        if order_data['sale_order_state'] == 'delivered':
            for picking in sale_order.picking_ids:
                picking.action_confirm()
                picking.action_assign()
                for move in  picking.move_ids_without_package:
                    move.quantity_done = move.product_uom_qty
                picking.action_done()

        return {
            'sale_order_id': sale_order.id,
        }
