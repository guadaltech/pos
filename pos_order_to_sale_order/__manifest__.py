# -*- coding: utf-8 -*-
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# Copyright (C) 2019 - Today: Guadaltech S.L (http://www.guadaltech.es)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'PoS Order To Sale Order',
    'version': '12.0.1',
    'author': 'GRAP,Odoo Community Association (OCA),Guadaltech S.L',
    'category': 'Point Of Sale',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'maintainers': ['legalsylvain'],
    'development_status': "Production/Stable",
    'website': 'https://odoo-community.org/',
    'data': [
        'views/view_pos_config.xml',
        'views/pos_order_to_sale_order.xml',
    ],
    'demo': [
        'demo/res_groups.xml',
    ],
    'qweb': [
        'static/src/xml/pos_order_to_sale_order.xml',
    ],
}
