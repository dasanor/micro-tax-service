const shortId = require('shortid');

const Code = require('code');
const Lab = require('lab');
const nock = require('nock');

// shortcuts
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const beforeEach = lab.beforeEach;
const after = lab.after;
const it = lab.it;
const expect = Code.expect;

const base = require('../index.js');
const server = base.services.server;

const defaultHeaders = base.config.get('test:defaultHeaders');

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
  cleanDB(done);
}

// Helper to inject a call with default parameters
function callService(options) {
  options.method = options.method || 'POST';
  options.headers = options.headers || defaultHeaders;
  return server.inject(options);
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
        code: 'default-fixed',
        class: 'default',
        title: 'Tax 5',
        rate: 5,
        isPercentage: false
      }
    };
    return callService(options)
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
          const result = response.result;
          expect(result.ok).to.equal(true);
          const tax = result.tax;
          expect(tax.id).to.be.a.string();
          expect(tax.code).to.be.a.string().and.to.equal('default-fixed');
          expect(tax.title).to.be.a.string().and.to.equal('Tax 5');
          done();
      })
      .catch((error) => done(error));
  });
});