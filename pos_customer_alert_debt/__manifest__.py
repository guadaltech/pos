# -*- coding: utf-8 -*-
#################################################################################
#    Copyright (c) 2019-Present Guadaltech S.L (<https://guadaltech.es/>)
#################################################################################
{
    "name": "Pos Customer Alert Debt Invoices and sales",
    "category": 'Point of sale',
    "summary": """
        Add a warning in POS if client debt invoice or there are sales pending to invoice """,
    "description": """ Add a warning in POS if client debt invoice or there are sales pending to invoice  """,
    "sequence": 1,
    "author": "Guadaltech S.L",
    "website": "http://www.guadaltech.es",
    "version": '12.0.1',
    "depends": ['point_of_sale','pos_order_to_sale_order'],
    "data": ['views/templates.xml'],
    'qweb': []
}
