const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
chai.use(chaiHttp);

const connection = require('../lib/setup-mongoose');
const db = require('./db');
const app = require('../lib/app');

describe('pets', () => {

    const request = chai.request(app);

    before(db.drop(connection));

    let store = null;
    
    before(() => request
        .post('/api/stores')
        .send({ name: 'best store' })
        .then(({ body }) => {
            assert.ok(body._id);
            store = body;
        })
    );

    it('cannot /POST without store id', () => request
        .post('/api/pets')
        .send({ name: 'bobby', animal: 'cat' })
        .then(
            () => { throw new Error('unexpected success response'); },
            res => assert.equal(res.status, 400)
        )
    );

    let pet = { 
        name: 'the pet',
        animal: 'cat'
    };
    
    it('/POST pet with store id', () => {
        pet.store = store._id;
        return request
            .post('/api/pets')
            .send(pet)
            .then(({ body }) => {
                assert.isOk(body._id);
                assert.equal(body.name, pet.name);
                assert.equal(body.animal, pet.animal);
                pet = body;
            });
    });

    it('/DELETE pet', () => {
        const url = `/api/pets/${pet._id}`;
        return request.delete(url)
            .then(() => request.get(url))
            .then(
                () => { throw new Error('unexpected success response'); },
                res => assert.equal(res.status, 404)
            );
    });
});