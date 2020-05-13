'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  create: async ctx => {
    const { body: data } = ctx.request;

    const weatherData = await strapi.services['weather-datas'].find();
    const filteredData = weatherData.map(item => {
      return (
        item.date
      );
    });

    
    data.map(async (item) => {
      if (!filteredData.includes(item.date)) {
        await strapi.services['weather-datas'].create(item);
      }
      return null;
    });
    
    ctx.send({ status: 200, message: 'Success'});
  }
};
