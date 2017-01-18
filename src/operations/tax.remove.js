/**
 * ## `tax.remove` operation factory
 *
 * Remove Tax operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const taxesChannel = base.config.get('bus:channels:taxes:name');
  const productListURI = base.config.get('services:uris:product.list');
  const op = {
    validator: {
      schema: base.utils.loadModule('schemas:removeTax')
    },
    handler: ({id}, reply) => {

      base.db.models.Tax
        .findOne({ _id: id })
        .exec()
        .then(tax => {
          if (!tax) throw base.utils.Error('tax_not_found', id);

          return [tax, base.services.call({
            name: productListURI
          }, {taxCode : tax.code})];

        })
        .then(([tax, productList]) => {
          if(productList && productList.data && productList.data.length > 0) {
            throw base.utils.Error('tax_has_products_associated', {id});
          }

          return tax.remove();
        })
        .then(tax => {
          if (base.logger.isDebugEnabled()) base.logger.debug(`[tax] tax ${tax._id} removed`);

          base.bus.publish(`${taxesChannel}.REMOVE`,
            {
              remove: tax,
              data: tax._id
            }
          );

          return reply(base.utils.genericResponse());
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };

  return op;
}

// Exports the factory
module.exports = opFactory;
