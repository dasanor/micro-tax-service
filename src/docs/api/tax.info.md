# tax.info

This method is used to retrieve the information of an existent Tax.

# Arguments

This method has the URL https://server/services/tax/v1/tax.info and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token        | yes | Token    | Bearer xxxxx... | Authentication token.
id           | yes  | String  | rJGOMDf         | Tax database identifier.

# Response

Returns a Tax object:

```javascript
{
    "ok": true,
    "tax": {
        "id": "HJs04P45",
        "code": "default",
        "class": "default",
        "title": "IVA 10%",
        "rate": 10,
        "isPercentage": true
    }
}
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
tax_not_found | The data causing the error | Tax to update not found
validation_error | The data causing the error | Some validation error

# Example

```bash
curl --request POST \
  --url http://localhost:3000/services/tax/v1/tax.info \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{
      "id": "HJs04P45" \
      }'
```
