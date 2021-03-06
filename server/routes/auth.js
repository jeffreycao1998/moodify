if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
} else {
    require('dotenv').config({ path: '/home/moodify/public_html/moodify/shared/.env' });
}

const express = require('express');
const router = express.Router();
const querystring = require('querystring');
const axios = require('axios');
const request = require('request');
const { addUser } = require("../helpers/userHelper");
const { clientRoot } = require("../env");

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = `${clientRoot}/`;
const stateKey = 'spotify_auth_state';

const generateRandomString = function (length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

module.exports = (db) => {

// when user presses 'login with spotify' redirect them to authorization screen
  router.get('/login', (req, res) => {
    const state = generateRandomString(16);
    res.cookie(stateKey, state);

    const scope =
      'ugc-image-upload playlist-read-private playlist-modify-private streaming user-read-email user-read-private user-library-read streaming playlist-modify-public playlist-read-collaborative user-modify-playback-state user-library-modify';
    res.send(
      'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
          response_type: 'code',
          client_id,
          scope,
          redirect_uri,
          state,
          show_dialog: true,
        }),
    );
  });

  // send back access, refresh tokens, and user data (ie. name)
  router.post('/token', async (req, res) => {
    const code = req.body.code;

    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code',
        client_id,
        client_secret,
      },
      json: true,
    };

    request.post(authOptions, async (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const access_token = body.access_token,
          refresh_token = body.refresh_token;

        const user = await axios.get('https://api.spotify.com/v1/me', {
          headers: { Authorization: 'Bearer ' + access_token },
        })
        .then(res => {
          const user = res.data.display_name;
          addUser(db, user, refresh_token);
          return res.data;
        })
        .catch(res => console.log(res));;
        
        res.send({ access_token, refresh_token, user });
      } else {
        res.send(
          '/#' +
            querystring.stringify({
              error: 'invalid_token',
            }),
        );
      }
    });
  });

  return router;
};
