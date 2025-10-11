const {createProxyMiddleware} = require('http-proxy-middleware');

module.exports = function(app) {
  // app.use('/api', createProxyMiddleware({
  //   target: 'https://uat-api.gf250923.org',
  //   changeOrigin: true,
  //   pathRewrite: {
  //     [`^/api`]: '',
  //   },
  // }));
}