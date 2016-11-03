/**
 * ## `tax.list` operation factory
 *
 * List Taxes operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const equalExpression = value => value;
  const inExpression = value => ({
    $in: value.split(',')
  });
  const likeExpression = value => ({
    $regex: new RegExp(value, 'i')
  });
  const filterExpressions = {
    id: inExpression,
    code: inExpression,
    class: inExpression,
    title: likeExpression,
    description: likeExpression,
    rate: equalExpression,
    isPercentage: equalExpression
  };

  const selectableFields = base.db.models.Tax.selectableFields;
  const defaultFields = selectableFields.join(' ');
  const allowedProperties = Object.keys(filterExpressions);
  const defaultLimit = 10;
  const maxLimit = 100;

  const op = {
    handler: (params, reply) => {

      // Filters
      const filters = allowedProperties
        .filter(k => params.hasOwnProperty(k))
        .reduce((result, k) => {
          const field = k === 'id' ? '_id' : k;
          result[field] = filterExpressions[k](params[k]);
          return result;
        }, {});

      // Pagination
      let limit = +params.limit || defaultLimit;
      if (limit > maxLimit) limit = maxLimit;
      const skip = +params.skip || 0;

      // Fields
      let fields;
      if (params.fields) {
        fields = params.fields.split(',')
          .filter(f => {
            if (f.substr(0, 1) === '-') return selectableFields.indexOf(f.substring(1)) !== -1;
            return selectableFields.indexOf(f) !== -1;
          })
          .join(' ');
      } else {
        fields = defaultFields;
      }

      // Query
      const query = base.db.models.Tax
        .find(filters, fields)
        .skip(skip)
        .limit(limit);

      // Exec the query
      query.exec()
        .then(taxes => {
          return reply(base.utils.genericResponse({
            data: taxes.map(tax => tax.toClient())
          }));
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };

  return op;
}

// Exports the factory
module.exports = opFactory;
