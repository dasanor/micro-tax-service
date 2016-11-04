module.exports = {
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
            type: 'number'
          },
          price: {
            type: 'number'
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
};