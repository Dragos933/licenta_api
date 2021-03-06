'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const accountSid = 'AC2f5cd81ae5dd7d467e2c3740c0927696';
const authToken = '695d074d807a5aba935e262e32ab3bc4';
const client = require('twilio')(accountSid, authToken);


module.exports = {
  connect: async ctx => {
    const { body } = ctx.request;
    const { user: userAccepting } = ctx.state;
    const { type, userInviting, user: userInvited } = body;
    try {
      const user = await strapi.plugins['users-permissions'].services.user.fetch({ username: userInviting });
      if (type === 'Accept') {
        const res = await strapi.services.connections.update(
            {
              user: user.id,
              username: userInvited,
            },
            {
              status: 'Accepted',
            }
          );
        await strapi.services.connections.create({
          user: userAccepting.id,
          username: userInviting,
          status: 'Accepted',
          date: new Date(),
        });
        return ctx.send(res);
      } else {
        const res = await strapi.services.connections.delete({
          user: user.id,
          username: userInvited,
          status: 'Pending',
        });
        return ctx.send(res);
      }
    } catch (error) {
      return ctx.throw(400, error);
    }
  },
  sendCode: async ctx => {
    const { phone } = ctx.request.body;
    try {
      const res = await client.verify.services('VA821cc6d8f12407a366b7924af714df6c')
        .verifications
        .create({to: phone, channel: 'sms'})
        .then(verification => verification);

      return  res;
    } catch (error) {
      return ctx.throw(400, 'Bad Request');
    }
  },
  verifyCode: async ctx => {
    const { phone, code } = ctx.request.body;

    const res = await client.verify.services('VA821cc6d8f12407a366b7924af714df6c')
      .verificationChecks
      .create({to: phone, code: `${code}`})
      .then(verification_check => verification_check);
    
    if (res.status === 'approved') {
      const { id: userId } = ctx.state.user;
      strapi.plugins['users-permissions'].services.user.edit({ id: userId }, {
        phone,
        phone_verified: true,
      });

      ctx.send({ status: 200, message: 'Success'});
    }

    ctx.send({ status: 400, message: 'There was an error'});
  },
  create: async ctx => {
    const { user } = ctx.state;

    const { body: data } = ctx.request;

    const { username: userUsername } = user;
    const { username: sentUsername } = data;
    
    if (userUsername === sentUsername) {
      ctx.throw(400, 'The username you provided is yours.');
    }

    try {
      const res = await strapi.services.connections.find({ user: user.id });
      const connections = res.filter(item => item.username === sentUsername);
      if (connections.length === 0) {
        const result = await strapi.services.connections.create(data);
        ctx.send(result);
      } else {
        ctx.throw(400, 'You are already friend with the user.');
      }
    } catch (error) {
      ctx.throw(400, error);
    }
  }
};
