module.exports = {
  payload: {
    type: 'object',
    properties: {
      cartId: {
        type: 'string'
      },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            productId: {
              type: 'string'
            },
            quantity: {
              type: 'integer'
            },
            price: {
              type: 'integer'
            }
          },
          required: [
            'id',
            'productId',
            'quantity',
            'price'
          ],
          additionalProperties: true
        }
      }
    },
    required: [
      'items'
    ],
    additionalProperties: true
  }
};