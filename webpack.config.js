const webpack = require('webpack');
const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

let entries = {};

glob.sync('./src/js/**/[^_]*.js').map(file => {
  return entries[file.match(/src\/js\/(\w+).js/i)[1]] = file;
});

module.exports = {
  mode: "development",
  entry: entries,
  output: {
    filename: 'js/[name]-bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  resolve: {
    alias: {
      '@JS': path.resolve(__dirname, 'src/js'),
      '@SCSS': path.resolve(__dirname, 'src/scss')
    }
  },
  devtool: "source-map",
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 9999,
    overlay: true,
    open: true,
    openPage: 'index.html'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '/'
            }
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 102400,
              outputPath: 'img/'
            }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              pngquant: {
                quality: '80'
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlReplaceWebpackPlugin([
      {
        pattern: /(<!--\s*|@@)(css|js):([\w-]+)(\s*-->)?/g,
        replacement: (match, $1, type, file, $4, index, input) => {
          const tpl = {
            css: '<link rel="stylesheet" href="/css/%s">',
            js: '<script src="/js/%s"></script>'
          };

          const url = file + '-bundle.' + type;

          return $4 === undefined ? url : tpl[type].replace('%s', url);
        }
      }
    ]),
    new ESLintPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name]-bundle.css'
    }),
    new StyleLintPlugin({
      configFile: '.stylelintrc'
    })
  ]
}

glob.sync('./src/html/**/[^_]*.html').map(file => {
  const filename = file.match(/src\/html\/(\w+).html/i)[1];

  module.exports.plugins.unshift(
    new HtmlWebpackPlugin({
      filename: filename + '.html',
      template: file,
      publicPath: '/',
      inject: false
    })
  );
});

console.log(entries);