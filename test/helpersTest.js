const {assert} = require("chai");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const serverUrl = "http://localhost:8080";

const {getUserByEmail} = require("../helpers.js");


const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("Testing getUserByEmail function", function () {
  it("should return a user for a valid email", function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";

    assert.equal(user.id, expectedUserID);
  });

  it("should return null for an email not in the database", function () {
    const user = getUserByEmail("notfound@example.com", testUsers);
    assert.isNull(user, null);
  });
});

describe("Testing login and access control", () => {
  it('should return 403 status code for unauthorized access to "http://localhost:8080/urls/b6UTxQ"', () => {
    const agent = chai.request.agent("http://localhost:8080");

    // Login with valid user data
    return agent
      .post("/login")
      .send({email: "user2@example.com", password: "dishwasher-funk"})
      .then((loginRes) => {
        // Make a GET request to a protected url
        return agent.get("/urls/b6UTxQ").then((accessRes) => {
          // Expect a 403 status code
          expect(accessRes).to.have.status(403);
        });
      });
  });
});

describe("Testing redirection and access control", () => {
  let agent;

  beforeEach(() => {
    // Initialize a new agent before each test
    agent = chai.request.agent(serverUrl);
  });

  afterEach(() => {
    // Close the agent after each test
    agent.close();
  });

  it('should redirect from "/" to "/login" with a status code of 302', () => {
    agent.get("/").then((res) => {
      expect(res).to.redirect;
      expect(res).to.redirectTo(`${serverUrl}/login`);
      expect(res).to.have.status(302);
    });
  });

  it('should redirect from "/urls/new" to "/login" with a status code of 302', () => {
    agent.get("/urls/new").then((res) => {
      expect(res).to.redirectTo(`${serverUrl}/login`);
      expect(res).to.have.status(302);
    });
  });

  it("should respond to a GET request for a non-existent URL with a status code of 404", () => {
    chai
      .request(serverUrl)
      .get("/urls/NOTEXISTS")
      .end((err, res) => {
        expect(res).to.have.status(404);
      });
  });

  it("should respond to a GET request for an unauthorized URL with a status code of 403", () => {
    chai
      .request(serverUrl)
      .get("/urls/b6UTxQ")
      .end((err, res) => {
        expect(res).to.have.status(403);
      });
  });
});
