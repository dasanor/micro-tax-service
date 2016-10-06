# Taxes Service

Ecommerce Taxes service, part of the [microbase](http://microbase.io)
ecosystem.

# Features

* Net and gross calculations
* Easily creation of custom taxes, based on Cart, Products and User data

# Entities

The Tax entity holds the information about taxes.

## Taxes

Field | Description| Type | Required | Default
------|------------|------|----------|--------
id | Internal unique Tax identifier | String | yes | System generated
code | The Tax code unique identifier (i.e.: VAT) | String | yes | -
class | The Tax class (specific implementation) identifier | String | yes | -
title | The Tax title | String | yes | -
description | The Tax description | String | no | -
rate | The Tax rate | Number | yes | -
isPercentage | The Tax rate is a percentaje or absolute | Boolean | yes | true

# API

The full API documentation can be accessed in the microbase web http://api.microbase.io
and provide access to the Stocks and Reserves endpoints to create,
modify and delete them:

## Taxes

Name | Description | Method | Endpoint
-----|-------------|--------|---------
tax:createTax | Creates a Tax | `POST` | `/services/catalog/v1/tax.createTax`
tax:cartTaxes | Calculates the Cart taxes | `POST` | `/services/catalog/v1/tax.cartTaxes`
