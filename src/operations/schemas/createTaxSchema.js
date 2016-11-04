module.exports = {
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
    description: {
      type: 'string'
    },
    rate: {
      type: 'number'
    },
    isPercentage: {
      type: 'boolean'
    }
  },
  required: [
    'code',
    'class',
    'title',
    'rate',
    'isPercentage'
  ],
  additionalProperties: true
};