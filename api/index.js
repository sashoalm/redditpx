const { createProxyMiddleware } = require('http-proxy-middleware');

const apiProxy = createProxyMiddleware({
  router: function(req) {
    let target = req.url.split('/')[2];
    //console.log('target ', target)
    return {
      protocol: 'https:', host: target,
    }
  },
  changeOrigin: true,
  pathRewrite: function(path, req) {
    //console.log('path', '/' + req.url.split('/').slice(3).join('/'));
    return '/' + req.url.split('/').slice(3).join('/')
  },

  onProxyRes(proxyRes) {
    proxyRes.headers['x-added'] = 'foobar'; // add new header to response
    delete proxyRes.headers['x-removed']; // remove header from response
  }
});

// Expose the proxy on the "/api/*" endpoint.
export default function (req, res) {
  return apiProxy(req, res);
};
