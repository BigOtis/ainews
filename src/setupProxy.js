const { createProxyMiddleware } = require('http-proxy-middleware');

const isTest = true;

module.exports = function(app) {
  if(isTest){
    app.use(
      '/api',
      createProxyMiddleware({
        target: 'http://localhost:4000',
        changeOrigin: true,
      })
    );
  }
};