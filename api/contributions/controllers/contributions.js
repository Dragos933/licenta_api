'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  contribute: async ctx => {
    const { body } = ctx.request;
    const { user_id, event_id, amount, type, date } = body;

    try {
      const res = await strapi.services.contributions.findOne({ user: user_id, event: event_id});
      if (res) {
        const haveAmount = type === 'noTrees' ? res.noTrees : res.noBags;
        const totalAmount = parseInt(amount, 10) + haveAmount;
        if (type === 'noTrees') {
          await strapi.services.contributions.update(
              { user: user_id, event: event_id},
              { noTrees: totalAmount}
            )
        } else {
          await strapi.services.contributions.update(
              { user: user_id, event: event_id},
              { noBags: totalAmount}
            )
        }
      } else {
        if (type === 'noTrees') {
          await strapi.services.contributions.create({
            user: user_id,
            event: event_id,
            date,
            noTrees: parseInt(amount, 10),
          });
        } else {
          await strapi.services.contributions.create({
            user: user_id,
            event: event_id,
            date,
            noBags: parseInt(amount, 10),
          });
        }
      }
    } catch (error) {
      ctx.throw(400, error);
    }
    return ctx.send({ message: 'Success' })
  }
};
