const { merge } = require('webpack-merge')
const common = require('./webpack.config.common.js')

module.exports = (env) =>
    merge(common, {
        entry: env.entry,
        mode: 'development',
        optimization: {
            minimize: false,
        },
        devtool: 'eval-source-map',
    })
