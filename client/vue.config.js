
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
                'materialize-css/dist/js': "materialize-css/dist/js/materialize.min.js"
            }
        },
    }
};