var path = require('path');

module.exports = {
    output: {
        library: "MwChat",
        libraryTarget: 'var'
    },
    resolve: {
        root: [
            path.resolve('./src/scripts')
        ]
    },
    plugins: [],
    module: {
        loaders: [
            {
                test: /\.(jsx|js)$/,
                loaders: ['babel']
            }
        ]
    }
}
