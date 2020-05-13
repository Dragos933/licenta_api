'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { sanitizeEntity } = require('strapi-utils');

module.exports = {
  create: async (ctx) => {
    const { body } = ctx.request;
    const { id: userId } = ctx.state.user;

    try {

      const res = await strapi.services.events.create({
        ...body,
        user: userId,
      })

      ctx.send(res);
    } catch (error) {
      ctx.send(error);
    }
  },
  find: async (ctx) => {
    let entities;

    if (ctx.query._q) {
      entities = await strapi.services.events.search(ctx.query);
    } else {
      entities = await strapi.services.events.find(ctx.query);
    }
    const toReturn = [];
    
    for (let i = 0; i < entities.length; i++) {
      let event;
      if (entities[i].planting_event) {
        event = await strapi.services['planting-event'].findOne({ id: entities[i].planting_event.id });
      } else {
        event = await strapi.services['recycling-event'].findOne({ id: entities[i].recycling_event.id });
      }

      toReturn.push({
        ...entities[i],
        location: event.location,
      });
    }

    return toReturn
      .map(entity => sanitizeEntity(entity, { model: strapi.models.events }));
  },
  monthEvents: async (ctx) => {
    let entities;

    const { month } = ctx.query;

    ctx.query = {
      ...ctx.query,
      month: undefined,
    }
    if (ctx.query._q) {
      entities = await strapi.services.events.search(ctx.query);
    } else {
      entities = await strapi.services.events.find(ctx.query);
    }

    const toReturn = entities.filter(item => {
      const itemMonth = item.date_open.split('-')[1];
      if (itemMonth === month) {
        return item;
      }
    });
    
    return toReturn
      .map(entity => sanitizeEntity(entity, { model: strapi.models.events }));
  }
};
