'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  create: async (ctx) => {
    const { body } = ctx.request;
    const { id: userId } = ctx.state.user;

    try {
      const event = await strapi.services.events.findOne({ id: body.event });

      if (event.user.id !== userId) {
        ctx.throw(400, 'The operation is forbidden!');
      }
      
      const res = await strapi.services["recycling-event"].create({
        ...body,
      })

      ctx.send(res);
    } catch (error) {
      ctx.send(error);
    }
  }
};
