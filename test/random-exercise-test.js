'use strict';

const Helper = require("hubot-test-helper");
const helper = new Helper("../src");

const expect = require("chai").expect;

const sinon = require("sinon");
const moment = require("moment");

describe("random exercise", () => {

  let room, clock, now;

  beforeEach(() => {
    room = helper.createRoom({name: "dailychallenge"});

    let dummy_user = "dummy";
    let max_dummy = 10;
    for (let i = max_dummy; i--;) {
      room.robot.brain.userForId(`dummy${i}`, {
        name: `dummy${i}`,
        id: `dummy${i}`
      });
    }

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

  context("default random exercise", () => {

    it("will start and stop exercise normally", () => {
      return room.user.say("dummy1", "hubot: start exercise normal mode").then(() => {
        const confirmed_message = room.messages[1][1];
        expect(confirmed_message).to.include("Next exercise will commence in");

        // the randomized minute reply
        const random_number = parseInt(confirmed_message.replace(/\D/g,''));
        expect(random_number).to.be.within(20, 30);

        return room.user.say("dummy1", "hubot: stop exercise").then(() => {
          // the last message
          const last_message = room.messages[room.messages.length - 1];
          expect(last_message).to.eql(["hubot", "@dummy1 Exercise has been stopped! Thank you for doing the exercise :muscle:"]);
        });
      });
    });

    it("will not stop exercise when there's no existing exercise", () => {
      return room.user.say("dummy1", "hubot: stop exercise").then(() => {
        expect(room.messages).to.eql([
          ["dummy1", "hubot: stop exercise"],
          ["hubot", "@dummy1 No exercise has been initiated... what are you talking about? :|"]
        ]);
      });
    });

    it("will not start exercise if the mode is invalid", () => {
      return room.user.say("dummy1", "hubot: start exercise stupid mode").then(() => {
        expect(room.messages).to.eql([
          ["dummy1", "hubot: start exercise stupid mode"],
          ["hubot", "@dummy1 I don't think I understand the mode... stupid? What? Please try again!\nAvailable modes are normal, slow, fast and madness."]
        ]);
      });
    });

    it("will start exercise for all members", () => {
      return room.user.say("dummy1", "hubot: start exercise normal mode").then(() => {

        // a normal mode span is 30 mins max each exercise
        const total_members = room.client.getChannelByName().members.length;
        const total_time_spent = total_members * 30; // in minutes

        // modify the time reference to the end of the exercise
        now.add(total_time_spent, 'minutes');
        const diff_in_ms = now.diff( moment.unix(0) + 60000 );

        // go to the future
        setTimeout(() => {
          // 2 extras are from the initial message from user and the first exercise message
          expect(room.messages.length).to.equal(total_members + 2);

          // expect a congratulatory message when done
          expect(room.messages[room.messages.length - 1][1]).to.include("it's a wrap!");
        }, diff_in_ms );

        // tick the clock until the end of the exercise
        clock.tick(diff_in_ms);
      });
    });

  });

  context("single exercise", () => {

    it("will start single exercise", () => {
      return room.user.say("dummy1", "hubot: single exercise").then(() => {

        // the randomized exercise reply
        const randomized = room.messages[1][1];
        expect(randomized).to.include('Your turn to');
      });
    });

  });

});