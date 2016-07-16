const Helper = require("hubot-test-helper");
const helper = new Helper("../src");

const expect = require("chai").expect;

describe("random exercise", function() {

  beforeEach(function() {
    room = helper.createRoom();
    room.robot.brain.userForId("briwa", {name: "briwa"});
    room.robot.brain.userForId("colin", {name: "colin"});
    room.robot.brain.userForId("jun", {name: "jun"});
  });

  afterEach(function() {
    room.destroy();
  });

  context("default random exercise", function() {

    it("will start exercise normal mode", function() {
      return room.user.say("briwa", "hubot: start exercise normal mode").then(function() {

        // the randomized minute reply
        const randomized = room.messages[1][1];
        const random_number = parseInt(randomized.replace(/\D/g,''));
        expect(random_number).to.be.within(20, 30);
      });
    });

    it("will stop exercise", function() {
      return room.user.say("briwa", "hubot: start exercise normal mode").then(function() {
        return room.user.say("briwa", "hubot: stop exercise").then(function() {
          
          // the last message
          const last_message = room.messages[room.messages.length - 1];
          expect(last_message).to.eql(["hubot", "@briwa Exercise has been stopped! Thank you for doing the exercise :muscle:"]);
        });
      });
    });

    it("will not stop exercise when there's no existing exercise", function() {
      return room.user.say("briwa", "hubot: stop exercise").then(function() {
        expect(room.messages).to.eql([
          ["briwa", "hubot: stop exercise"],
          ["hubot", "@briwa No exercise has been initiated... what are you talking about? :|"]
        ]);
      });
    });

    it("will not start exercise if the mode is invalid", function() {
      return room.user.say("briwa", "hubot: start exercise stupid mode").then(function() {
        expect(room.messages).to.eql([
          ["briwa", "hubot: start exercise stupid mode"],
          ["hubot", "@briwa I don't think I understand the mode... stupid? What? Please try again!\nAvailable modes are normal, slow, fast and madness."]
        ]);
      });
    });

  });

  context("single exercise", function() {

    it("will start single exercise", function() {
      return room.user.say("briwa", "hubot: single exercise").then(function() {

        // the randomized exercise reply
        const randomized = room.messages[1][1];
        expect(randomized).to.include('Your turn to');
      });
    });

  });
});