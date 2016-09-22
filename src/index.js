const base = require('microbase')();

// Register model(s)
require(base.config.get('models:taxModel'))(base);

// Add operations
base.services.addOperation(require('./operations/createTax')(base));
base.services.addOperation(require('./operations/cartTaxes')(base));

module.exports = base;
