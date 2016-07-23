'use strict';

const Helper = require("hubot-test-helper");
const helper = new Helper("../src");

const expect = require("chai").expect;

const sinon = require("sinon");
const moment = require("moment");

describe("private message", () => {

  let room, clock, now;

  beforeEach(() => {
    room = helper.createRoom({name: "dummy"});
    room.robot.brain.userForId("dummy", {name: "dummy", id: "dummy"});

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

    now = moment.unix(0);
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    room.destroy();
    clock.restore();
    now = null;
    room.client = null;
  });

  context("default", () => {
    it("will not start exercise if it's initiated in private message", () => {
      return room.user.say("dummy", "hubot: start exercise normal mode").then(() => {
        const confirmed_message = room.messages[1][1];
        expect(confirmed_message).to.include("Please ask me again in channel");
      });
    });

    it("will not stop exercise if it's initiated in private message", () => {
      return room.user.say("dummy", "hubot: stop exercise").then(() => {
        const confirmed_message = room.messages[1][1];
        expect(confirmed_message).to.include("Please ask me again in channel");
      });
    });
  });

  context("single exercise", () => {
    it("will generate singe exercise in private message", () => {
      return room.user.say("dummy", "hubot: single exercise").then(() => {
        const confirmed_message = room.messages[1][1];
        expect(confirmed_message).to.include("Your turn to");
      });
    });
  });
});