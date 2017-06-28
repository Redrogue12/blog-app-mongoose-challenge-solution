const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

// Fill database
function seedBlogData() {
  console.info('Seeding blog data');
  const seedData = [];

  for (let i=1; i<=10; i++) {
    seedData.push(generateBlogData());
  }
  // this will return a Promise
  return BlogPost.insertMany(seedData);
}

// Generate an object representing a blog post
function generateBlogData() {
  return {
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    },
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph()
  }
}

// Delete database
function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Restaurants API resource', function() {

  // Each function returns a Promise

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlogData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  // nested describe blocks
  describe('GET endpoing', function() {

    it('should return all existing blog posts', function() {
      // 1. Prove all posts are returned by GET request
      // 2. Prove response has the right status and data type
      // 3. Prove the number of posts in response is equal to number in db
      // we declare a res variable so we can pass the value of the response to
      // the next function
      let res;
      return chai.request(app)
      .get('/posts')
      .then(function(_res) {
        res = _res;
        res.should.have.status(200);
        res.body.BlogPost.should.have.length.of.at.least(1);
        return BlogPost.count();
      })
      .then(function(count) {
        res.body.BlogPost.should.have.length.of(count);
      })
    });
  });

});
