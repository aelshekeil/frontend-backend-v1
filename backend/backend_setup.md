# Backend Setup for Application Tracking

This guide will help you set up the backend for the application tracking feature.

## 1. Create a Custom Route for Tracking

You need to create a custom route in your Strapi backend to handle the tracking requests.

**File: `src/api/track/routes/track.js`**

```javascript
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/track/:trackingNumber',
      handler: 'track.findOne',
      config: {
        auth: false,
      },
    },
  ],
};
```

## 2. Create a Custom Controller for Tracking

Next, create a custom controller to handle the logic for the tracking route.

**File: `src/api/track/controllers/track.js`**

```javascript
'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::track.track', ({ strapi }) => ({
  async findOne(ctx) {
    const { trackingNumber } = ctx.params;

    const visaApplication = await strapi.db.query('api::visa-application.visa-application').findOne({
      where: { trackingNumber },
    });

    if (visaApplication) {
      return { data: visaApplication };
    }

    const drivingLicenseApplication = await strapi.db.query('api::driving-license-application.driving-license-application').findOne({
      where: { trackingNumber },
    });

    if (drivingLicenseApplication) {
      return { data: drivingLicenseApplication };
    }

    return ctx.notFound('Application not found');
  },
}));
```

## 3. Generate Shorter Tracking Numbers

To generate shorter tracking numbers, you can use a library like `nanoid`. First, install it:

```bash
npm install nanoid
# or
yarn add nanoid
```

Then, modify your application submission logic to generate a shorter tracking number.

### For Visa Applications

**File: `src/api/visa-application/controllers/visa-application.js`**

```javascript
'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const { nanoid } = require('nanoid');

module.exports = createCoreController('api::visa-application.visa-application', ({ strapi }) => ({
  async create(ctx) {
    const { data } = ctx.request.body;
    data.trackingNumber = nanoid(10); // Generate a 10-character tracking number
    const response = await super.create(ctx);
    return response;
  },
}));
```

### For Driving License Applications

**File: `src/api/driving-license-application/controllers/driving-license-application.js`**

```javascript
'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const { nanoid } = require('nanoid');

module.exports = createCoreController('api::driving-license-application.driving-license-application', ({ strapi }) => ({
  async create(ctx) {
    const { data } = ctx.request.body;
    data.trackingNumber = nanoid(10); // Generate a 10-character tracking number
    const response = await super.create(ctx);
    return response;
  },
}));
```

By following these steps, you will have a fully functional tracking system with shorter, more user-friendly tracking numbers.
