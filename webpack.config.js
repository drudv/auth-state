const path = require('path');

module.exports = {
  entry: path.join(__dirname, '/lib/index.js'),

  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'index.js',
  },

  module: {

    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.join(__dirname, '/lib'),
      },
    ],
  },

};
