module.exports = {
    pluginOptions: {
        webpackBundleAnalyzer: {
            openAnalyzer: true
        }
    },
    configureWebpack: {
        resolve: {
            alias: {
                moment: 'moment/src/moment',
                M: "materialize-css/dist/js/materialize.min.js"
            }
        }
    }
};