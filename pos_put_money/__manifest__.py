# -*- coding: utf-8 -*-
#################################################################################
#    Copyright (c) 2019-Present Guadaltech S.L (<https://guadaltech.es/>)
#################################################################################
{
    "name": "Pos Put Money",
    "category": 'Point of sale',
    "summary": """
        Add an option in existing Point Of Sale to Put Money""",
    "description": """ Add an option in existing Point Of Sale to Put Money  """,
    "sequence": 1,
    "author": "Guadaltech S.L",
    "website": "http://www.guadaltech.es",
    "version": '12.0.1',
    "depends": ['point_of_sale'],
    "data": ['views/templates.xml'],
    'qweb': [
        'static/src/xml/pos_put_money.xml',
    ]
}
