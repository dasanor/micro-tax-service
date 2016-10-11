module.exports = {
  payload: {
    type: 'object',
    properties: {
      code: {
        type: 'string'
      },
      class: {
        type: 'string'
      },
      title: {
        type: 'string'
      },
      rate: {
        type: 'integer'
      },
      isPercentage: {
        type: 'boolean'
      }
    },
    required: [
      'code',
      'class',
      'rate',
      'isPercentage'
    ],
    additionalProperties: true
  }
};