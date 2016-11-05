module.exports = {
  type: 'object',
  properties: {
    id: {
      type: 'string'
    },
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
    'id'
  ],
  additionalProperties: true
};