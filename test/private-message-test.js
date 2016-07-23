'use strict';

const Helper = require("hubot-test-helper");
const helper = new Helper("../src");
const expect = require("chai").expect;

describe("random exercise in private message", () => {

  let room;

  beforeEach(() => {
    room = helper.createRoom({name: "dummy"});
    room.robot.brain.userForId("dummy", {name: "dummy", id: "dummy"});
  });

  afterEach(() => {
    room.destroy();
  });

  context("default", () => {
    it("will not start exercise if it's initiated in private message", () => {
      return room.user.say("dummy", "hubot: start exercise normal mode").then(() => {
        const confirmed_message = room.messages[room.messages.length - 1][1];
        expect(confirmed_message).to.include("Please ask me again in channel");
      });
    });

    it("will not stop exercise if it's initiated in private message", () => {
      return room.user.say("dummy", "hubot: stop exercise").then(() => {
        const confirmed_message = room.messages[room.messages.length - 1][1];
        expect(confirmed_message).to.include("Please ask me again in channel");
      });
    });
  });

  context("single exercise", () => {
    it("will generate single exercise in private message", () => {
      return room.user.say("dummy", "hubot: single exercise").then(() => {
        const exercise_message = room.messages[room.messages.length - 1][1];
        expect(exercise_message).to.include("Your turn to");
      });
    });
  });
});