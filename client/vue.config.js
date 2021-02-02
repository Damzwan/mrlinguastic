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
    },
    pwa: {
        name: 'Mr.Linguastic',
        msTileColor: '#1b5e20',
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'black',
        iconPaths: {
            favicon32: 'img/icons/favicon-32x32.png',
            favicon16: 'img/icons/favicon-16x16.png',
            appleTouchIcon: 'img/icons/apple-touch-icon.png',
            maskIcon: 'img/icons/safari-pinned-tab.svg',
            msTileImage: 'img/icons/mstile-150x150.png'
        },
        manifestOptions: {
            background_color: "#1b5e20",
            description: "A Community Driven Language Learning Platform",
            start_url: "/#/home",
            theme_color: "#1b5e20"
        },
        workboxOptions: {
            skipWaiting: true
        }
    }
};