if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
} else {
    require('dotenv').config({ path: '/home/moodify/public_html/moodify/shared/.env' });
}

const axios = require('axios');
const express = require('express');
const router = express.Router();
const { getUserId } = require('../helpers/spotify');

// create playlist
router.post('/create', async (req, res) => {
  let { accessToken, name, description, uris, image } = req.body;
  let playlistData;
  if (uris.length >= 200) return res.status(414).send({
    message: 'Uri too long, status 414'
  })
  
  const user_id = await getUserId(accessToken, res);
  
  // create playlist
  const playlist_id = await axios({
    method: 'post',
    url: `https://api.spotify.com/v1/users/${user_id}/playlists`,
    headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
    data: { name, description }
  })
  .then(playlist => {
    playlistData = playlist.data;
    return playlist.data.id;
  })
  .catch(err => res.sendStatus(err.response.status));
  
  //add songs to playlist
  let songsAdded = 0;
  while (songsAdded < uris.length) {
    const songURIS = uris.splice(songsAdded, songsAdded + 50).join(',');

    await axios({
      method: 'post',
      url: `https://api.spotify.com/v1/playlists/${playlist_id}/tracks?uris=${songURIS}`,
      headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
      data: { name, description }
    })
    .catch(err => res.sendStatus(err.response.status));
    songsAdded += 100;
  };
  
  // add playlist image
  if (image.size !== null) {
    await axios({
      method: 'put',
      url: `https://api.spotify.com/v1/playlists/${playlist_id}/images`,
      headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'image/jpeg' },
      data: image.slice(23),
    }).catch(err => res.sendStatus(err.response.status));
  }

  res.send(playlistData);
});

// get ids of user's playlists
router.post('/ids', async (req, res) => {
  const { accessToken } = req.body;

  axios({
    method: 'get',
    url: `https://api.spotify.com/v1/me/playlists?limit=50`,
    headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
  })
  .then(playlists => res.send(playlists.data.items))
  .catch(err => res.sendStatus(err.response.status));
});

module.exports = router;
