module.exports = {
    pluginOptions: {
        webpackBundleAnalyzer: {
            openAnalyzer: true
        }
    },
    configureWebpack: {
        resolve: {
            alias: {
                moment: 'moment/min/moment.min.js',
            }
        }
    }
};