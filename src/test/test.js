const shortId = require('shortid');

const Code = require('code');
const Lab = require('lab');
const nock = require('nock');
const request = require('supertest');

// shortcuts
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const beforeEach = lab.beforeEach;
const after = lab.after;
const it = lab.it;
const expect = Code.expect;

const base = require('../index.js');
const app = base.transports.http.app;

const defaultHeaders = base.config.get('test:defaultHeaders');
const normalStockStatus = 0;
const reserveStockForMinutes = base.config.get('reserveStockForMinutes');

let initialTaxes = [];

// Check the environment
if (process.env.NODE_ENV !== 'test') {
  console.log('\n[test] THIS ENVIRONMENT IS NOT FOR TEST!\n');
  process.exit(1);
}

// Check the database
if (!base.db.url.includes('test')) {
  console.log('\n[test] THIS DATABASE IS NOT A TEST DATABASE!\n');
  process.exit(1);
}

// Helper to clean the DB
function cleaner(callback) {
  const db = base.db.connections[0];
  var count = Object.keys(db.collections).length;
  Object.keys(db.collections).forEach(colName => {
    const collection = db.collections[colName];
    collection.drop(() => {
      if (--count <= 0 && callback) {
        callback();
      }
    });
  });
}

// Helper to clean the database
function cleanDB(done) {
  cleaner(done);
}

// Helper to initialize the database
function initDB(done) {
  cleanDB(() => {
    createTaxes()
      .then(() => {
        done();
      });
  });
}

// Helper to inject a call with default parameters
function callService(options) {
  options.method = options.method || 'POST';
  options.headers = options.headers || defaultHeaders;
  const promise = request(app)[options.method.toLowerCase()](options.url);
  Object.keys(options.headers).forEach(key => {
    promise.set(key, options.headers[key]);
  });
  if (options.payload) promise.send(options.payload);
  return promise;
}

// Helper to mock a product data get
function mockProductDataGet(options, times = 1) {
  nock('http://gateway')
    .post('/services/catalog/v1/product.info', {
      id: options.productId,
      fields: '-variants'
    })
    .times(times)
    .reply(200, {
      ok: true,
      product: {
        price: options.price || 1260,
        salePrice: options.salePrice || 1041.26,
        taxCode: options.taxCode || 'default-percentage',
        isNetPrice: options.isNetPrice || false,
        categories: [],
        stockStatus: options.stockStatus || normalStockStatus,
        title: `${options.productId} title`,
        brand: `${options.productId} brand`,
        sku: `${options.productId} sku`,
        id: options.productId
      }
    });
}

// Helper to mock a successful stock:reserve call
function mockStockReserveOk(entryRequest, times = 1) {
  nock('http://gateway')
    .post('/services/stock/v1/stock.reserve', {
      productId: entryRequest.productId,
      quantity: entryRequest.quantity,
      warehouseId: entryRequest.warehouseId,
      reserveStockForMinutes: reserveStockForMinutes
    })
    .times(times)
    .reply(200, {
      ok: true,
      reserve: {
        id: shortId.generate(),
        warehouseId: entryRequest.warehouseId,
        quantity: entryRequest.quantity,
        expirationTime: new Date()
      }
    });
}

// Helper to mock a product tax data get
function mockProductTaxDataGet(options, times = 1) {
  nock('http://gateway')
    .post('/services/catalog/v1/product.list', {
      id: options.productId,
      fields: 'taxCode,categories,isNetPrice'
    })
    .times(times)
    .reply(200, {
      ok: true,
      page: {limit: 10, skip: 0},
      data: options.productId.split(',').map(productId => ({
        isNetPrice: options.isNetPrice || false,
        categories: [],
        id: productId,
        taxCode: options.taxCode || 'default-percentage'
      }))
    });
}

// Helper to create Taxes
function createTaxes() {
  return callService({
    url: '/services/tax/v1/tax.create',
    payload: {
      code: 'default-percentage',
      class: 'default',
      title: 'Tax 21%',
      rate: 21,
      isPercentage: true
    }
  })
    .then(response => {
      return callService({
        url: '/services/tax/v1/tax.create',
        payload: {
          code: 'default-fixed',
          class: 'default',
          title: 'Tax 5',
          rate: 5,
          isPercentage: false
        }
      });
    })
    .then(response => {
      return callService({
        url: '/services/tax/v1/tax.create',
        payload: {
          code: 'default-test',
          class: 'default',
          title: 'Tax 10',
          rate: 10,
          isPercentage: false
        }
      });
    })
    .then(response => {
      const taxesChannel = base.config.get('bus:channels:taxes:name');
      base.bus.publish(`${taxesChannel}.CREATE`, {});
    })
}

function getTax(taxCode){
  return callService({
    url: `/services/tax/v1/tax.list?code=${taxCode}`
  })
}

/*
 Taxes Tests
 */
describe('Taxes', () => {
  beforeEach(done => {
    initDB(done);
  });
  after(done => {
    cleanDB(done);
  });

  it('create tax', done => {
    const options = {
      url: '/services/tax/v1/tax.create',
      payload: {
        code: 'test',
        class: 'default',
        title: 'Tax 5',
        rate: 5,
        isPercentage: false
      }
    };
    callService(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        // Expected result:
        // {
        //   "ok": true,
        //   "tax": {
        //      code: 'default-fixed',
        //      class: 'default',
        //      title: 'Tax 5',
        //      rate: 5,
        //      isPercentage: false,
        //      id : "1"
        //   }
        // }
        const result = response.body;
        expect(result.ok).to.equal(true);
        const tax = result.tax;
        expect(tax.id).to.be.a.string();
        expect(tax.code).to.be.a.string().and.to.equal('test');
        expect(tax.title).to.be.a.string().and.to.equal('Tax 5');
        done();
      })
      .catch((error) => done(error));
  });

  it('list tax', done => {
    const options = {
      url: '/services/tax/v1/tax.list'
    };
    callService(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.equal(true);
        expect(result.data.length).to.equal(3);
        expect(result.data[0].code).to.equal('default-percentage');
        expect(result.data[1].code).to.equal('default-fixed');
        expect(result.data[2].code).to.equal('default-test');

        done();
      })
      .catch((error) => done(error));
  });

  it('tax info', done => {
    getTax('default-percentage')
      .then(response =>{
        const options = {
          url: '/services/tax/v1/tax.info',
          payload : {
            id: response.body.data[0].id
          }
        };

        return callService(options);
      })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.equal(true);
        expect(result.tax.code).to.equal('default-percentage');

        done();
      })
      .catch((error) => done(error));
  });

  it('tax info not found', done => {
    const options = {
      url: '/services/tax/v1/tax.info',
      payload : {
        id: '1'
      }
    };
    callService(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.equal('tax_not_found');

        done();
      })
      .catch((error) => done(error));
  });

  it('update tax', done => {
    getTax('default-test')
      .then(response => {
        const options = {
          url: '/services/tax/v1/tax.update',
          payload: {
            id: response.body.data[0].id,
            code: 'default-test-updated'
          }
        };
        return callService(options)
      })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.equal(true);
        expect(result.tax.code).to.equal('default-test-updated');

        done();
      })
      .catch((error) => done(error));
  });

  it('update tax not found', done => {
    const options = {
      url: '/services/tax/v1/tax.update',
      payload : {
        id: '1',
        code : 'default-test-updated'
      }
    };
    callService(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.equal('tax_not_found');

        done();
      })
      .catch((error) => done(error));
  });

  it('remove tax', done => {
    getTax('default-test')
      .then( response => {
      const options = {
        url: '/services/tax/v1/tax.remove',
        payload: {
          id: response.body.data[0].id
        }
      };
      return callService(options)
    })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.equal(true);

        done();
      })
      .catch((error) => done(error));
  });

  it('remove tax not found', done => {
    const options = {
      url: '/services/tax/v1/tax.remove',
      payload : {
        id: '1'
      }
    };
    callService(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.equal('tax_not_found');

        done();
      })
      .catch((error) => done(error));
  });

  it('calculates gross percentage tax', done => {
    const cartId = 'xxxx';
    const entryRequest = { id: '1', productId: '0001', price: 200 };
    const options = {
      url: `/services/tax/v1/tax.cartTaxes?cartId=${cartId}`,
      payload: { items: [entryRequest] }
    };
    mockProductTaxDataGet({ productId: entryRequest.productId });
    callService(options)
      .then((response) => {
        expect(nock.isDone()).to.equal(true);
        expect(response.statusCode).to.equal(200);
        // Expected result:
        // {
        //   "ok": true,
        //   "cart": {
        //     "cartId": "xxxx",
        //     "items": [{
        //       "id": "1",
        //       "productId": "0001",
        //       "quantity": 2,
        //       "price": 100,
        //       "beforeTax": 200,
        //       "tax": 42,
        //       "taxDetail": "Tax 21%"
        //     }]
        //   }
        // }
        const result = response.body;
        expect(result.ok).to.equal(true);
        const cart = result.cart;
        expect(cart.cartId).to.be.a.string().and.to.equal(cartId);
        expect(cart.items[0].taxes[0].beforeTax).to.be.a.number().and.to.equal(200);
        expect(cart.items[0].taxes[0].tax).to.be.a.number().and.to.equal(42);
        expect(cart.items[0].taxes[0].taxDetail).to.be.a.string().and.to.equal('Tax 21%');
        done();
      })
      .catch((error) => done(error));
  });

  it('calculates net percentage tax', done => {
    const cartId = 'xxxx';
    const entryRequest = { id: '1', productId: '0001', price: 200 };
    const options = {
      url: `/services/tax/v1/tax.cartTaxes?cartId=${cartId}`,
      payload: { items: [entryRequest] }
    };
    mockProductTaxDataGet({ productId: entryRequest.productId, isNetPrice: true });
    callService(options)
      .then((response) => {
        expect(nock.isDone()).to.equal(true);
        expect(response.statusCode).to.equal(200);
        // Expected result:
        // {
        //   "ok": true,
        //   "cart": {
        //     "cartId": "xxxx",
        //     "items": [{
        //       "id": "1",
        //       "productId": "0001",
        //       "quantity": 2,
        //       "price": 100,
        //       "beforeTax": 158,
        //       "tax": 42,
        //       "taxDetail": "Tax 21%"
        //     }]
        //   }
        // }
        const result = response.body;
        expect(result.ok).to.equal(true);
        const cart = result.cart;
        expect(cart.cartId).to.be.a.string().and.to.equal(cartId);
        expect(cart.items[0].taxes[0].beforeTax).to.be.a.number().and.to.equal(158);
        expect(cart.items[0].taxes[0].tax).to.be.a.number().and.to.equal(42);
        expect(cart.items[0].taxes[0].taxDetail).to.be.a.string().and.to.equal('Tax 21%');
        done();
      })
      .catch((error) => done(error));
  });

  it('calculates gross fixed tax', done => {
    const cartId = 'xxxx';
    const entryRequest = { id: '1', productId: '0001', price: 200 };
    const options = {
      url: `/services/tax/v1/tax.cartTaxes?cartId=${cartId}`,
      payload: { items: [entryRequest] }
    };
    mockProductTaxDataGet({ productId: entryRequest.productId, taxCode: 'default-fixed' });
    callService(options)
      .then((response) => {
        expect(nock.isDone()).to.equal(true);
        expect(response.statusCode).to.equal(200);
        // Expected result:
        // {
        //   "ok": true,
        //   "cart": {
        //     "cartId": "xxxx",
        //     "items": [{
        //       "id": "1",
        //       "productId": "0001",
        //       "quantity": 2,
        //       "price": 100,
        //       "beforeTax": 200,
        //       "tax": 10,
        //       "taxDetail": "Tax 5"
        //     }]
        //   }
        // }
        const result = response.body;
        expect(result.ok).to.equal(true);
        const cart = result.cart;
        expect(cart.cartId).to.be.a.string().and.to.equal(cartId);
        expect(cart.items[0].taxes[0].beforeTax).to.be.a.number().and.to.equal(200);
        expect(cart.items[0].taxes[0].tax).to.be.a.number().and.to.equal(10);
        expect(cart.items[0].taxes[0].taxDetail).to.be.a.string().and.to.equal('Tax 5');
        done();
      })
      .catch((error) => done(error));
  });

  it('calculates net fixed tax', done => {
    const cartId = 'xxxx';
    const entryRequest = { id: '1', productId: '0001', price: 200 };
    const options = {
      url: `/services/tax/v1/tax.cartTaxes?cartId=${cartId}`,
      payload: { items: [entryRequest] }
    };
    mockProductTaxDataGet({
      productId: entryRequest.productId,
      taxCode: 'default-fixed',
      isNetPrice: true
    });
    callService(options)
      .then(response => {
        expect(nock.isDone()).to.equal(true);
        expect(response.statusCode).to.equal(200);
        // Expected result:
        // {
        //   "ok": true,
        //   "cart": {
        //     "cartId": "xxxx",
        //     "items": [{
        //       "id": "1",
        //       "productId": "0001",
        //       "quantity": 2,
        //       "price": 100,
        //       "beforeTax": 190,
        //       "tax": 10,
        //       "taxDetail": "Tax 5"
        //     }]
        //   }
        // }
        const result = response.body;
        expect(result.ok).to.equal(true);
        const cart = result.cart;
        expect(cart.cartId).to.be.a.string().and.to.equal(cartId);
        expect(cart.items[0].taxes[0].beforeTax).to.be.a.number().and.to.equal(190);
        expect(cart.items[0].taxes[0].tax).to.be.a.number().and.to.equal(10);
        expect(cart.items[0].taxes[0].taxDetail).to.be.a.string().and.to.equal('Tax 5');
        done();
      })
      .catch((error) => done(error));
  });
});