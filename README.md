# Hubot: hubot-random-exercise

[![Build Status](https://img.shields.io/travis/briwa/hubot-random-exercise/master.svg?style=flat-square)](https://travis-ci.org/briwa/hubot-random-exercise)
[![npm version](https://img.shields.io/npm/v/hubot-random-exercise.svg?style=flat-square)](https://www.npmjs.com/package/hubot-random-exercise)

Sends out messages to users to do randomly picked exercise.
Inspired from [brandonshin/slackbot-workout](https://github.com/brandonshin/slackbot-workout), so props to them!

I only used this for Slack. Haven't tried for others, so use with caution :fire:

## Installation

Add **hubot-random-exercise** to your `package.json` file:

```
npm install --save hubot-random-exercise
```

Add **hubot-random-exercise** to your `external-scripts.json`:

```json
["hubot-random-exercise"]
```

Run `npm install`

## Sample Interaction

### Default
Invite the bot to a channel and start getting crazy.

```
user1>> @hubot start exercise normal mode
hubot>> Alright, it's on! Next exercise will commence in 28 minutes :muscle:
```

Bot will post a message to the channel every 20-30 minutes in normal mode. 
There are a few other modes available: fast (10-15 min), slow (45-60 min), and madness (1-5 min).
A random exercise will be picked from the `exercises` list. Feel free to modify to make it your own.
The exercise will be assigned to one of the members in the channel, picked at random.

As scheduled, the message would be like this:
```
hubot>> Your turn to do alternating leg lunges for 60 seconds today, @user1!
hubot>> The next exercise will commence in 24 minutes :muscle:
```

And then it goes on and on, until all members have been picked.

If you want to stop the exercise prematurely, do so with:
```
user1>> @hubot stop exercise
hubot>> @user1 Exercise has been stopped! Thank you for doing the exercise :muscle:
```

### Single exercise
Alternatively, you can do a single exercise for yourself:

```
user1>> @hubot single exercise
hubot>> Your turn to do alternating leg lunges for 60 seconds today, @user1!
```
This will only generate one message only, as opposed to the default one.