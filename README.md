# Taxes Service

[![NPM version][npm-image]][npm-url] 
[![Downloads][downloads-image]][npm-url] 
[![Build Status][travis-image]][travis-url] 
[![Coverage Status][coveralls-image]][coveralls-url] 
[![bitHound Overall Score][bithound-overal-image]][bithound-url]
[![bitHound Code][bithound-code-image]][bithound-url]
[![Dependency status][bithound-image]][bithound-url] 
[![Dev Dependency status][bithound-dev-image]][bithound-url] 

[npm-url]:https://npmjs.org/package/microbase
[downloads-image]:http://img.shields.io/npm/dm/microbase.svg
[npm-image]:http://img.shields.io/npm/v/microbase.svg

[travis-url]:https://travis-ci.org/ncornag/micro-tax-service
[travis-image]:http://img.shields.io/travis/ncornag/micro-tax-service/develop.svg
[coveralls-url]:https://coveralls.io/r/ncornag/micro-tax-service
[coveralls-image]:https://img.shields.io/coveralls/ncornag/micro-tax-service/develop.svg

[bithound-url]:https://www.bithound.io/github/ncornag/micro-tax-service/develop
[bithound-overal-image]:https://www.bithound.io/github/ncornag/micro-tax-service/badges/score.svg
[bithound-image]:https://img.shields.io/bithound/dependencies/github/ncornag/micro-tax-service.svg
[bithound-dev-image]:https://img.shields.io/bithound/devDependencies/github/ncornag/micro-tax-service.svg
[bithound-code-image]:https://www.bithound.io/github/ncornag/micro-tax-service/badges/code.svg

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

The full API documentation can be accessed in the microbase web http://docs.microbase.io