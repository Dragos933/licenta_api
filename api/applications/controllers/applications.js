'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { sanitizeEntity } = require('strapi-utils');

module.exports = {
  find: async (ctx) => {
    let entities;

    if (ctx.query._q) {
      entities = await strapi.services.applications.search(ctx.query);
    } else {
      entities = await strapi.services.applications.find(ctx.query);
    }
    const toReturn = [];
    
    for (let i = 0; i < entities.length; i++) {
      let event;
      if (entities[i].event.planting_event) {
        event = await strapi.services['planting-event'].findOne({ id: entities[i].event.planting_event });
      } else {
        event = await strapi.services['recycling-event'].findOne({ id: entities[i].event.recycling_event });
      }
      toReturn.push({
        ...entities[i],
        location: event.location,
      });
    }

    return toReturn
      .map(entity => sanitizeEntity(entity, { model: strapi.models.applications }));
  },
};
