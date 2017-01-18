/**
 * ## `tax.info` operation factory
 *
 * Get Tax operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const taxesChannel = base.config.get('bus:channels:taxes:name');
  const op = {
    name: 'tax.info',
    validator: {
      schema: base.utils.loadModule('schemas:infoTax')
    },
    handler: ({id}, reply) => {
      console.log(id);
      base.db.models.Tax
        .findOne({ _id: id })
        .exec()
        .then(tax => {
          if (!tax) throw base.utils.Error('tax_not_found', id);

          return reply(base.utils.genericResponse({ tax: tax.toClient() }));
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };

  return op;
}

// Exports the factory
module.exports = opFactory;
