/**
 * ## `tax.cartTaxes` operation factory
 *
 * Calculate Cart Taxes operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const productListURI = base.config.get('services:uris:product.list');
  // Preload taxes
  let taxes;

  function loadTaxes() {
    base.db.models.Tax
      .find()
      .exec()
      .then(loadedTaxes => {
        taxes = loadedTaxes.reduce((result, item) => {
          result[item.code] = item;
          return result;
        }, {});
        if (base.logger.isDebugEnabled()) base.logger.debug('[Taxes] taxes loaded');
      })
      .catch(error => {
        base.logger.error('[taxes]', error);
      });
  }

  loadTaxes();

  // Reload taxes on Taxes change
  const taxesChannel = base.config.get('bus:channels:taxes:name');
  base.bus.subscribe(`${taxesChannel}.*`, (/* msg */) => {
    loadTaxes();
  });

  // Preload tax classes (code)
  const defaultTaxCode = base.config.get('taxes:defaultCode');
  const taxClasses = {};
  base.utils.loadModulesFromKey('taxes:classes').forEach(taxClass => {
    const taxName = taxClass.keys[taxClass.keys.length - 1];
    taxClasses[taxName] = taxClass.module;
  });

  function calculateItemTaxes(taxContext, calculateItemTaxesFn) {
    if(!taxes[taxContext.taxCode]){
      throw base.utils.Error('tax_not_found', { taxCode: taxContext.taxCode });
    }

    const taxClass = taxes[taxContext.taxCode].class;
    taxContext.taxData = taxes[taxContext.taxCode];
    return taxClasses[taxClass](taxContext, calculateItemTaxesFn);
  }

  const op = {
    validator: {
      schema: base.utils.loadModule('schemas:cartTaxes')
    },
    handler: (cart, reply) => {
      // List unique product IDs
      const productIds = [...new Set(cart.items.reduce((list, item) => {
        list.push(item.productId);
        return list;
      }, []))];

      return Promise
        .resolve(productIds)
        .then(() => {
          // Preload products
          return base.services
            .call({
              name: productListURI
            }, {
              id: productIds.join(','),
              fields: 'taxCode,categories,isNetPrice'
            })
        })
        .then(response => {
          if (response.ok === false) {
            throw base.utils.Error(response.error, response.data, true);
          }
          return response.data.reduce((result, item) => {
            result[item.id] = item;
            return result;
          }, {});
        })
        .then(products => {
          // Calculate each line taxes
          cart.items.forEach(item => {
            const product = products[item.productId];
            if (!product) {
              throw base.utils.Error('product_not_found', { productId: item.productId });
            }
            const taxCode = product.taxCode || defaultTaxCode;
            const { beforeTax, tax, taxDetail } = calculateItemTaxes(
              {
                cart,
                item,
                product,
                taxCode
                /* , store, user */
              },
              calculateItemTaxes
            );
            item.taxes = item.taxes || [];
            item.taxes.push({
              beforeTax,
              tax,
              taxDetail
            });
          });
          reply(base.utils.genericResponse({ cart }));
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
