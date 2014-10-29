require('../vendor/polyfills/templatePolyfill');
require('../vendor/satnav/satnav');
require('./lib/nav');

require('./lib/views').add([
  require('../views/recipelisting.jsx'),
  require('../views/recipeview.jsx'),
  require('../views/commentbox.jsx'),
]);
