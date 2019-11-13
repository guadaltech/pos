odoo.define('pos_customer_alert_debt.pos_customer_alert_debt', ['web.rpc', 'web.core', 'web.session', 'point_of_sale.gui', 'point_of_sale.popups','point_of_sale.screens'], function (require) {
    "use strict";

    var rpc = require('web.rpc');
    var core = require('web.core');
    var session = require('web.session');
    var gui = require('point_of_sale.gui');
    var PopupWidget = require("point_of_sale.popups");
    var _t = core._t;

    var PaymentScreenWidget = require('point_of_sale.screens').PaymentScreenWidget;



    var PaymentScreenWidgetAlert = PaymentScreenWidget.include({

        customer_changed: function() {
            var self = this;
            this._super();
            $('.debtpartner').remove();
            var client = this.pos.get_client();
            rpc.query({model: 'res.partner', method: 'find_debt',args: [client]})
            .then(function (result) {
                if('invoices' in result){
                    $('.set-customer').append($('<i class="debtpartner" style="color: red;"> ! </i>'));
                }
                if('sales' in result){
                    $('.set-customer').append($('<i class="debtpartner" style="color: blue;"> ! </i>'));
                }
            },function(err,ev){
                self.gui.show_popup('error', {
                    'title': _t('!!!Error Calculated Debt!!!'),
                    'body': _t("Error Calculated Debt."),
                });
            });

        },


    });



});