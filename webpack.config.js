const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    clean: true,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: true
    }),
    new webpack.DefinePlugin({
      'window.ANALYTICS_ENABLED': JSON.stringify(process.env.ANALYTICS_ENABLED || 'true'),
      'window.PRIVACY_DNT_RESPECT': JSON.stringify(process.env.PRIVACY_DNT_RESPECT || 'true'),
      'window.GTM_CONTAINER_ID': JSON.stringify(process.env.GTM_CONTAINER_ID || ''),
      'window.PRIVACY_SALT': JSON.stringify(process.env.PRIVACY_SALT || 'dealradarus_2025')
    })
  ],
  devServer: {
    static: './dist',
    port: 3000,
    historyApiFallback: true,
    hot: true,
    open: false,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    proxy: {
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/reviews': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/comments': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/reports': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/filters': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/alerts': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};