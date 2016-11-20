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
          price: {
            type: 'number'
          }
        },
        required: [
          'id',
          'productId',
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