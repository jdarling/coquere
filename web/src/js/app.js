require('../vendor/polyfills/templatePolyfill');
require('../vendor/satnav/satnav');
require('../vendor/alertify/alertify').alertify.set({ delay: 1000 });

require('./lib/views').add([
  require('../views/recipelisting.jsx'),
  require('../views/recipeview.jsx'),
  require('../views/commentbox.jsx'),
]);

require('./lib/nav');
