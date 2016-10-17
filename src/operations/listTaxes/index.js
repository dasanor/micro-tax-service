/**
 * ## `tax.list` operation factory
 *
 * List Taxes operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const taxesChannel = base.config.get('bus:channels:taxes:name');
  const op = {
    name: 'tax.list',
    //schema: require(base.config.get('schemas:createTax')),
    handler: (msg, reply) => {

      // Query
      const query = base.db.models.Tax
        .find();

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
