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
    rate: {
      type: 'integer'
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