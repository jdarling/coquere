require('../vendor/polyfills/templatePolyfill');
require('../vendor/satnav/satnav');
require('../vendor/alertify/alertify').alertify.set({ delay: 1000 });

require('./lib/views').add([
  require('../views/nav.jsx'),
  require('../views/recipelisting.jsx'),
  require('../views/recipeview.jsx'),
  require('../views/commentbox.jsx'),
  require('../views/serverstatus.jsx'),
  require('../views/loginform.jsx'),
  require('../views/profile.jsx'),
]);

require('./lib/nav');
