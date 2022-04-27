const { createProxyMiddleware } = require('http-proxy-middleware');

const apiProxy = createProxyMiddleware({
  target: "https://reddit.com",
  changeOrigin: true,
  pathRewrite: {
    "^/api": "" // strip "/api" from the URL
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
