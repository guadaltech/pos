odoo.define('pos_put_money.pos_put_money', ['web.rpc', 'web.core', 'web.session', 'point_of_sale.gui', 'point_of_sale.popups','point_of_sale.screens'], function (require) {
    "use strict";

    var rpc = require('web.rpc');
    var core = require('web.core');
    var session = require('web.session');
    var gui = require('point_of_sale.gui');
    var PopupWidget = require("point_of_sale.popups");
    var _t = core._t;

    var screens = require('point_of_sale.screens');



    var ActionpadWidget = screens.ActionpadWidget.include({

        init: function (parent, options) {
            this._super(parent, options);
        },

        renderElement: function () {
            var self = this;
            this._super();
            this.$('#put_money').on('click', function () {
                self.gui.show_popup('create_put_money_popup_widget', {});
            });

        }
    });


    var CreatePutMoneyPopupWidget = PopupWidget.extend({
        template: 'CreatePutMoneyPopupWidget',


        renderElement: function () {
            var self = this;
            this._super();
            var vals = false;


            $('.pos_create_put_money_button').click(function () {
                var order = self.pos.get_order();
                var client = order.attributes.client;
                if(!client) {
                    window.alert('Debe escoger un cliente.')
                } else {
                    var pos_put_money_value = $('#pos_put_money_value').val();
                    var pos_put_money_comment = $('#pos_put_money_comment').val();
                    if(!pos_put_money_value || !pos_put_money_comment) {
                        window.alert('Debe rellenar tanto el importe como el comentario.')
                    } else {
                        self.gui.show_popup('confirm',{
                            'title': _t('Poner Dinero'),
                            'body':  _t('¿Está seguro de que deseas introducir dinero en caja con un importe de ') +
                                   ' ' +
                                   pos_put_money_value +
                                   ' ' +
                                   _t('?'),
                            confirm: function() {
                                var today = new Date();

                                var vals = {
                                    'pos_put_money_value': pos_put_money_value,
                                    'pos_put_money_comment': pos_put_money_comment,
                                    'client': client['id'],
                                    'journal_id': parseInt($('select.paymentmethods')[0].value),
                                };
                                rpc.query({model: 'pos.session', method: 'put_money',args: [self.pos.pos_session.id, vals]})
                                .then(function (result) {
                                    alert('Ok');
                                },function(err,ev){
                                    ev.preventDefault();
                                    self.gui.show_popup('error',{
                                        'title': '¡Error!',
                                        'body': err["data"]["arguments"][0],
                                    });
                                });
                            },
                        });
                        return false;
                    }
                }
            });
        },
    });

    gui.define_popup({name: 'create_put_money_popup_widget', widget: CreatePutMoneyPopupWidget});

});