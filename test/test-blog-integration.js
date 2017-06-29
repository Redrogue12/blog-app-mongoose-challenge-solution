const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

// Generate an object representing a blog post
function seedBlogData() {
  console.info('seeding blog post data');
  const seedData = [];
  for (let i=1; i<=10; i++) {
    seedData.push({
      author: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
      },
      title: faker.lorem.sentence(),
      content: faker.lorem.text()
    });
  }
  // this will return a promise
  return BlogPost.insertMany(seedData);
}

// Delete database
function tearDownDb() {

  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err))
  });
}

describe('Blog API resource', function() {

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
  describe('GET endpoint', function() {

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
        res.body.should.have.length.of.at.least(1);
        return BlogPost.count();
      })
      .then(function(count) {
        res.body.should.have.length.of(count);
      })
    });
  });

  it('should return posts with right fields', function() {
    //Get back all posts and ensure they have expected keys

    let resPost;
    return chai.request(app)
      .get('/posts')
      .then(function(res) {

        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.should.have.length.of.at.least(1);

        res.body.forEach(function(post) {
          post.should.be.a('object');
          post.should.include.keys('id', 'title', 'content', 'author', 'created');
        });
      })
  })



});
