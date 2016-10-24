/**
 * ## `tax.update` operation factory
 *
 * Update Tax operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const taxesChannel = base.config.get('bus:channels:taxes:name');
  const op = {
    validator: {
      schema: require(base.config.get('schemas:updateTax')),
    },
    handler: (msg, reply) => {
      let id = msg.id;

      base.db.models.Tax
        .findOne({ _id: id })
        .exec()
        .then(tax => {
          if (!tax) throw base.utils.Error('tax_not_found', id);

          tax.code = msg.code || tax.code;
          tax.class = msg.class || tax.class;
          tax.title = msg.title || tax.title;
          tax.rate = msg.rate || tax.rate;

          if(msg.isPercentage != undefined) {
            tax.isPercentage = msg.isPercentage;
          }

          return tax.save();
        })
        .then(savedTax => {
          if (base.logger.isDebugEnabled()) base.logger.debug(`[tax] tax ${savedTax._id} updated`);

          base.bus.publish(`${taxesChannel}.UPDATE`,
            {
              new: savedTax.toObject({ virtuals: true }),
              data: msg
            }
          );

          return reply(base.utils.genericResponse({ tax: savedTax.toClient() }));
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
