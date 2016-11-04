# tax.update

This method is used to get a list of Taxes.

# Arguments

This method has the URL https://server/services/tax/v1/tax.list and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token        | yes  | Token        | Bearer xxxxx... | Authentication token.
id           | yes  | String List  | rJGOMDf         | Tax database identifier.
code         | no   | String List  | default         | Code to be used as a reference in the Product.
class        | no   | String List  | default         | Identifier to the implementation code (i.e.: default.js).
title        | no   | String       | VAT 10%         | Tax description.
description  | no   | String       | Description     | Tax description.
rate         | no   | Number       | 10              | Number to be used in the calculations (i.e.: 10%).
isPercentage | no   | Boolean      | false           | Is the tax a percentage or a fixed amount? Defaults to true.

# Response

Returns a Tax object:

```javascript
{
    "ok": true,
    "data": [
        {
            "id": "HJs04P45",
            "code": "default",
            "class": "default",
            "title": "IVA 10%",
            "rate": 10,
            "isPercentage": true
        }
    ]
}
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
validation_error | The data causing the error | Some validation error

# Example

```bash
curl --request POST \
  --url http://localhost:3000/services/tax/v1/tax.list \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{
      "id": "HJs04P45,GFssj54j" \
      }'
```
