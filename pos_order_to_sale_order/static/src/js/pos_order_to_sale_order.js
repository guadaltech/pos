/* ***************************************************************************
    Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
    Copyright (C) 2019 - Today: Guadaltech (http://www.guadaltech.es)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
**************************************************************************** */
odoo.define('pos_order_to_sale_order.pos_order_to_sale_order',function(require){

    "use strict";

   	var core = require('web.core');
   	var models = require('point_of_sale.models');
	var Chrome = require('point_of_sale.chrome');
   	var screens = require('point_of_sale.screens');
  	var PosBaseWidget = require('point_of_sale.BaseWidget');
  	var rpc    = require('web.rpc');
  	var _t = core._t;


    /* ************************************************************************
        New Widget CreateSaleOrderButtonWidget
    ************************************************************************ */

    var CreateSaleOrderButtonWidget = PosBaseWidget.extend({
        template: 'CreateSaleOrderButtonWidget',

        /**
        * Define all the confirmation messages.
        */
        init: function (parent, options) {
            //var self = this
            this._super(parent, options);
            this.sale_order_state = options.sale_order_state;
            if (this.sale_order_state === 'draft') {
                this.display_text = _t("Create Draft Order");
                this.confirmation_message = _t(
                    'Create Draft Sale Order and discard the current' +
                    ' PoS Order?');
                this.confirmation_comment = _t(
                    "This operation will permanently discard the current PoS" +
                    " Order and create a draft Sale Order, based on the" +
                    " current order lines.");
            } else if (options.sale_order_state === 'confirmed') {
                this.display_text = _t("Create Confirmed Order");
                this.confirmation_message = _t(
                    'Create Confirmed Sale Order and discard the current' +
                    ' PoS Order?');
                this.confirmation_comment = _t(
                    "This operation will permanently discard the current PoS" +
                    " Order and create a confirmed Sale Order, based on the" +
                    " current order lines.");
            } else if (options.sale_order_state === 'delivered') {
                this.display_text = _t("Create Delivered Order");
                this.confirmation_message = _t(
                    'Create Delivered Sale Order and discard the current' +
                    ' PoS Order?');
                this.confirmation_comment = _t(
                    "This operation will permanently discard the current PoS" +
                    " Order and create a confirmed Sale Order, based on the" +
                    " current order lines. The according picking will be" +
                    " marked as delivered.");
            }
            if (! this.pos.pricelist_engine) {
                this.confirmation_comment += _t(
                    "\nNote if you have manually changed unit prices for" +
                    " some products, this changes will not been taken into" +
                    " account in the sale order.")
            }
        },

        /**
        * Define onclick function when the button to create sale order is
        * clicked.
        * - On click, check if there is a customer defined,
        * - ask confirmation call server to create sale order, and delete
        *   the current order.
        */
        renderElement: function () {
            var self = this;
            this._super();
            this.$el.click(function () {
                var current_order = self.pos.get('selectedOrder');
                // Prevent empty delivery order
                if (!current_order.orderlines) {
                    self.gui.show_popup('error', {
                        title: _t('Empty Order'),
                        body: _t(
                            'There must be at least one product in your' +
                            ' order to create Sale Order.'),
                    });
                    return;
                }
                // Check Customer
                if (!current_order.get_client()) {
                    self.gui.show_popup('error', {
                        title: _t('No customer defined'),
                        body: _t(
                            'You should select a customer in order to create' +
                            ' a Sale Order. Please select one by clicking' +
                            ' the order tab.'),
                    });
                    return;
                }
                self.gui.show_popup('confirm', {
                    message: self.confirmation_message,
                    comment: self.confirmation_comment,
                    confirm: function () {

                        rpc.query({model: 'sale.order', method: 'create_order_from_pos',args: [self.prepare_create_sale_order(current_order)]})
                        .then(function (result) {
                                $.unblockUI();
                                self.hook_create_sale_order_success(result);

                        },function(err,ev){
                            $.unblockUI();
                            self.hook_create_sale_order_error(err, ev);
                            }
                        );
                    },
                });
            });
        },

        /**
        * Overloadable function to send custom sale order data to server
        */
        prepare_create_sale_order: function (order) {
            var res = order.export_as_JSON();
            res.sale_order_state = this.sale_order_state;
            return res;
        },

        /**
        * Overloadable function to make custom action after Sale order
        * Creation succeeded
        */
        hook_create_sale_order_success: function (result) {
            this.pos.get('selectedOrder').destroy();
        },

        /**
        * Overloadable function to make custom action after Sale order
        * Creation failed
        */
        hook_create_sale_order_error: function (error, event) {
            event.preventDefault();
            var self = this;
            if (error.code === 200) {
                // Business Logic Error, not a connection problem
                self.gui.show_popup('error-traceback', {
                    title: error.data.message,
                    body: error.data.debug,
                });
            } else {
                // Connexion problem
                self.gui.show_popup('error', {
                    title: _t('The order could not be sent'),
                    body: _t(
                        'Check your internet connection and try again.'),
                });
            }
        },

    });


    /* ************************************************************************
        Extend PosWidget:
    ************************************************************************ */
    Chrome.Chrome.include({

        build_widgets: function () {
            this._super();
            if (this.pos.config.iface_create_draft_sale_order) {
                this.create_draft_sale_order_button = new CreateSaleOrderButtonWidget(this, {'sale_order_state': 'draft'});
                this.create_draft_sale_order_button.appendTo(this.$('ul.orderlines'));
            }
            if (this.pos.config.iface_create_confirmed_sale_order) {
                this.create_confirmed_sale_order_button = new CreateSaleOrderButtonWidget(this, {'sale_order_state': 'confirmed'});
                this.create_confirmed_sale_order_button.appendTo(
                    this.$('ul.orderlines'));
            }
            if (this.pos.config.iface_create_delivered_sale_order) {
                this.create_delivered_sale_order_button = new CreateSaleOrderButtonWidget(this, {'sale_order_state': 'delivered'});
                this.create_delivered_sale_order_button.appendTo(
                    this.$('ul.orderlines'));
            }
        },
    });


    /* ************************************************************************
        Extend OrderWidget
    ************************************************************************ */
    screens.OrderWidget.include({

        /**
        * Overload renderElement(), to display buttons when the order change.
        */
        renderElement: function (scrollbottom) {
            this._super(scrollbottom);
            if (this.create_draft_sale_order_button) {
                this.create_draft_sale_order_button.appendTo(
                    this.$('ul.orderlines')
                );
            }
            if (this.create_confirmed_sale_order_button) {
                this.create_confirmed_sale_order_button.appendTo(
                    this.$('ul.orderlines')
                );
            }
            if (this.create_delivered_sale_order_button) {
                this.create_delivered_sale_order_button.appendTo(
                    this.$('ul.orderlines')
                );
            }

        },
    });

});
