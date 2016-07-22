'use strict';

const Helper = require("hubot-test-helper");
const helper = new Helper("../src");

const expect = require("chai").expect;

describe("random exercise", () => {

  let room;

  beforeEach(() => {
    room = helper.createRoom({room: "dailychannel"});
    room.robot.brain.userForId("briwa", {name: "briwa", "id": "briwa"});
    room.robot.brain.userForId("colin", {name: "colin", "id": "colin"});
    room.robot.brain.userForId("jun", {name: "jun", "id": "jun"});

    // mock @slack/node functions
    room.client = {
      getUserByID(user_id) {
        return room.robot.brain.users()[user_id];
      },
      getChannelByName(channel_name) {
        return {
          members: Object.keys(room.robot.brain.users())
        };
      }
    };
  });

  afterEach(() => {
    room.destroy();
  });

  context("default random exercise", () => {

    it("will start exercise normal mode", () => {
      return room.user.say("briwa", "hubot: start exercise normal mode").then(() => {

        // the randomized minute reply
        const randomized = room.messages[1][1];
        const random_number = parseInt(randomized.replace(/\D/g,''));
        expect(random_number).to.be.within(20, 30);
      });
    });

    it("will stop exercise", () => {
      return room.user.say("briwa", "hubot: start exercise normal mode").then(() => {
        return room.user.say("briwa", "hubot: stop exercise").then(() => {
          
          // the last message
          const last_message = room.messages[room.messages.length - 1];
          expect(last_message).to.eql(["hubot", "@briwa Exercise has been stopped! Thank you for doing the exercise :muscle:"]);
        });
      });
    });

    it("will not stop exercise when there's no existing exercise", () => {
      return room.user.say("briwa", "hubot: stop exercise").then(() => {
        expect(room.messages).to.eql([
          ["briwa", "hubot: stop exercise"],
          ["hubot", "@briwa No exercise has been initiated... what are you talking about? :|"]
        ]);
      });
    });

    it("will not start exercise if the mode is invalid", () => {
      return room.user.say("briwa", "hubot: start exercise stupid mode").then(() => {
        expect(room.messages).to.eql([
          ["briwa", "hubot: start exercise stupid mode"],
          ["hubot", "@briwa I don't think I understand the mode... stupid? What? Please try again!\nAvailable modes are normal, slow, fast and madness."]
        ]);
      });
    });

  });

  context("single exercise", () => {

    it("will start single exercise", () => {
      return room.user.say("briwa", "hubot: single exercise").then(() => {

        // the randomized exercise reply
        const randomized = room.messages[1][1];
        expect(randomized).to.include('Your turn to');
      });
    });

  });

});