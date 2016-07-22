// Description:
//   Random exercises throughout the day. Only picks up active users from channel members
//

'use strict';

module.exports = robot => {

  const moment = require('moment');
  const scheduler = require('node-schedule');
  const _ = require('lodash');
  const mode_preset = {
    normal: {
      min: 20,
      max: 30
    },
    slow: {
      min: 45,
      max: 60
    },
    fast: {
      min: 10,
      max: 15
    },
    madness: {
      min: 1, 
      max: 5 
    }
  };

  const exercises = {
    "list": [
      {
        "name" : "pushup",
        "range" : [10, 15, 20, 25],
        "unit" : "times"
      },
      {
        "name" : "plank",
        "range" : [30, 60],
        "unit" : "seconds"
      },
      {
        "name" : "sit up",
        "range" : [15, 30, 45],
        "unit" : "times"
      },
      {
        "name" : "high knees running in place",
        "range" : [30, 60],
        "unit" : "seconds"
      },
      {
        "name" : "meditation",
        "range" : [1, 3, 5],
        "unit" : "minutes"
      },
      {
        "name" : "tricep dips on a chair",
        "range" : [30, 60],
        "unit" : "seconds"
      },
      {
        "name" : "walking",
        "range" : [5, 10, 15],
        "unit" : "minutes"
      },
      {
        "name" : "water",
        "range" : [8, 16, 32],
        "unit" : "oz",
        "action" : "drink"
      },
      {
        "name" : "alternating leg lunges",
        "range" : [30, 60],
        "unit" : "seconds"
      },
      {
        "name" : "squats",
        "range" : [30, 60],
        "unit" : "seconds"
      },
      {
        "name" : "wall sits",
        "range" : [30, 60],
        "unit" : "seconds"
      }
    ]
  };

  // where we keep the exercise data
  let exercise_start;
  let mode = 'normal';

  const postExercise = (config) => {
    // do not proceed if there's no exercise initiated
    if (!config.first && !config.single && !exercise_start) {
      console.log('No exercise is initiated, aborting...');
      return false;
    }

    const messages = [];
    const respond = config.respond;
    const room = config.room || respond.message.room;

    let recipient;
    if (respond) {
      // in DMs
      if (respond.message.user.name === respond.message.room) {
        recipient = `@${respond.message.user.name}`;
      } else {
        // in channel
        recipient = `#${respond.message.room}`;
      }

    } else {
      // automated
      recipient = `#${room}`;
    }

    const scheduleNextExercise = (room) => {
      const minutes = _.random(mode_preset[mode].min, mode_preset[mode].max);
      const next = moment().add( minutes, 'minutes' );

      const job = scheduler.scheduleJob( next.toDate(), () => {
        postExercise({
          room: room,
          next: true
        });
      });

      return {
        minutes,
        job
      };
    };

    const generateMessage = (user, exercise) => {
      const slack_user = typeof user === 'string' ? robot.adapter.client.getUserByID(user) : user;
      return `Your turn to ${exercise.action || 'do'} ${exercise.name} for ${_.sample(exercise.range)} ${exercise.unit} today, @${slack_user.name}!`; 
    };

    if (config.single) {
      const user = respond.message.user;
      const exercise = _.sample(exercises.list);

      messages.push(generateMessage(user, exercise));
    } else if (config.first) {
      const channel_users = robot.adapter.client.getChannelByName(room).members;
      const possible_users = channel_users.filter((user) => {
        const slack_user = robot.adapter.client.getUserByID(user);
        return !slack_user.is_bot;
      });

      // set the initiator locally
      exercise_start = {
        time: moment().toISOString(),
        mode: mode,
        members: _.shuffle(possible_users),
        exercises: _.shuffle(exercises.list),
        job: null
      };

      // schedule the next one
      const { minutes, job } = scheduleNextExercise(room);
      exercise_start.job = job;
      messages.push(`Alright, it's on! Next exercise will commence in ${minutes} minutes :muscle:`);
    } else if (config.next) {
      if (!exercise_start.exercises.length) {
        // refill
        exercise_start.exercises = _.shuffle(exercises.list);
      }

      // let's just mutate! who cares
      const user = exercise_start.members.pop();
      const exercise = exercise_start.exercises.pop();

      messages.push(generateMessage(user, exercise));

      if (!exercise_start.members.length) {
        messages.push(`Everyone in the channel has had their turn, so it's a wrap! See you on the next exercise ;)`);
        exercise_start.job.cancel();
        exercise_start = null;
      } else {
        // schedule the next one
        const { minutes, job } = scheduleNextExercise(room);
        exercise.job = job;
        messages.push(`The next exercise will commence in ${minutes} minutes :muscle:`);
      }
    }

    robot.send({room: recipient}, messages.join('\n'));
  }

  robot.respond(/start exercise (\w+) mode/i, res => {

    if (res.message.room === res.message.user.name) {
      res.reply(`Please ask me again in channel, not direct message!`);
      return false;
    }

    const new_mode = res.match[1];
    if (!mode_preset[new_mode]) {
      const messages = [
        `I don't think I understand the mode... ${new_mode}? What? Please try again!`,
        `Available modes are normal, slow, fast and madness.`
      ];
      res.reply(messages.join('\n'));
      return false;
    }

    // apply the new mode
    mode = new_mode;

    if (exercise_start) {
      res.reply(`Okay, resetting the current exercise...`);
    }

    postExercise({
      respond: res,
      first: true
    });
  });

  robot.respond(/stop exercise/i, res => {

    if (res.message.room === res.message.user.name) {
      res.reply(`Please ask me again in channel, not direct message!`);
      return false;
    }

    if (!exercise_start) {
      res.reply('No exercise has been initiated... what are you talking about? :|');
      return false;
    }

    exercise_start.job.cancel();
    exercise_start = null;
    res.reply('Exercise has been stopped! Thank you for doing the exercise :muscle:');
  });

  robot.respond(/single exercise/i, res => {

    postExercise({
      respond: res,
      single: true,
    });

  });
}