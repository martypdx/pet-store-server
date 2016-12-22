const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
chai.use(chaiHttp);

const connection = require('../lib/setup-mongoose');
const db = require('./db');
const app = require('../lib/app');

describe('stores', () => {

    before(db.drop(connection));

    const request = chai.request(app);

    let store = { name: 'cute store' };

    it('/GET all', () => request
        .get('/api/stores')
        .then(res => assert.deepEqual(res.body, []))
    );

    it('/POST', () => request
        .post('/api/stores')
        .send(store)
        .then(({ body }) => {
            assert.ok(body._id);
            assert.equal(body.name, store.name);
            store = body;
        })
    );

    let pet = { 
        name: 'lizzy',
        animal: 'lizard'
    };
    
    it('/POST pet with store id', () => {
        pet.store = store._id;
        return request
            .post('/api/pets')
            .send(pet)
            .then(({ body }) => pet = body);
    });

    it('/GET by id', () => request
        .get(`/api/stores/${store._id}`)
        .then(({ body }) =>  {
            assert.equal(body._id, store._id);
            assert.equal(body.name, store.name);
            assert.isOk(body.pets);
            assert.deepEqual(body.pets, [pet]);
        })
    );

    it('/GET all after post contains one item', done => {
        request
            .get('/api/stores')
            .then(({ body }) => {
                assert.deepEqual(body, [store]);
                done();
            })
            .catch(done);
    });

    it('/DELETE store', () => request
        .delete(`/api/stores/${store._id}`)
    );

    it('/GET by id gives 404', () => request
        .get(`/api/stores/${store._id}`).then(
            () => { throw new Error('unexpected success response'); },
            res => assert.equal(res.status, 404)
        )
    );

    it('removes associated pets', () => request
        .get('/api/pets')
        .then(res => res.body)
        .then(pets => assert.equal(pets.length, 0))
    );

});