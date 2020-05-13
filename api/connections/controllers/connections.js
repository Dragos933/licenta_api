'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const accountSid = 'AC2f5cd81ae5dd7d467e2c3740c0927696';
const authToken = '0dc734591f6511711fff5f813353af7c';
const client = require('twilio')(accountSid, authToken);


module.exports = {
  sendCode: async ctx => {
    const { phone } = ctx.request.body;
    return client.verify.services('VA821cc6d8f12407a366b7924af714df6c')
      .verifications
      .create({to: phone, channel: 'sms'})
      .then(verification => verification);
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
  }
};
