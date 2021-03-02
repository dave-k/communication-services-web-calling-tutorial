
const CommunicationIdentityClient = require("@azure/communication-administration").CommunicationIdentityClient;
const HtmlWebPackPlugin = require("html-webpack-plugin");
const config = require("./config.json");
const webpack = require('webpack');

module.exports = (env) => {
  var communicationIdentityClient;
  new webpack.EnvironmentPlugin(['CONNECTION_STRING']);

  if (process.env.CONNECTION_STRING) {
    communicationIdentityClient = new CommunicationIdentityClient(process.env.CONNECTION_STRING);
  } else {
    if(!config || !config.connectionString || config.connectionString.indexOf('endpoint=') === -1)
    {
      throw new Error("Update `config.json` with connection string");
    }
    communicationIdentityClient = new  CommunicationIdentityClient(config.connectionString);
  }
  return {
    devtool: 'inline-source-map',
    mode: 'development',
    entry: "./src/index.js",
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader"
                    }
                ]
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./public/index.html",
            filename: "./index.html"
        })
    ],
    devServer: {
        open: true,
        before: function(app) {
            app.post('/tokens/provisionUser', async (req, res) => {
                try {
                    let communicationUserId = await communicationIdentityClient.createUser();
                    const tokenResponse = await communicationIdentityClient.issueToken(communicationUserId, ["voip"]);
                    res.json(tokenResponse);
                } catch (error) {
                    console.error(error);
                }
            });
        }
    }
  };
};
