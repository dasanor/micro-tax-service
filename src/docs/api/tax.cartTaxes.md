# tax.cartTaxes

This method is used to calculate the Cart taxes.

# Arguments

This method has the URL https://server/services/catalog/v1/tax.cartTaxes and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token  | yes | Token       | Bearer xxxxx... | Authentication token.
cartId | yes | String      | default         | Identifier to be used as a reference.
items  | yes | Object List | -               | The list of entries in the Cart.

## Items

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
id        | yes | String | HyR1hMmc   | Entry id.
productId | yes | String | By2ZWfAPnV | The Product Id.
quantity  | No  | Number | 1          | The quantity of product in the entry.
price     | yes | Number | 100.00     | The total price of this item (Not the Product price).

# Response

Returns a Tax object:

```javascript
{
    "ok": true,
    "cart": {
        "id": "H19PRsec",
        "items": [{
            "id": "HJyElmm9",
            "productId": "By2ZWfAPnV",
            "quantity": 1,
            "price": 100.00,
            "taxes": [
              {
                "beforeTax": 100,
                "tax": 7,
                "taxDetail": "VAT 7%"
              }
            ]
        }]
    }
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
  --url http://localhost:3000/services/catalog/v1/tax.cartTaxes \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{
      "cartId": 'H19PRsec', \
        "items": \
         [ { "id": "HJyElmm9", \
             "productId": 'By2ZWfAPnV', \
             "quantity": 1, \
             "price": 100.00 } ] \
      }'
```
