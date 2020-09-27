import React from 'react';
import styled from 'styled-components';

const PlayListImageContainer = styled.div`
  width: 100%;
  max-width: 684px;
  height: 224px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('${props => props.playlistImage}');
  background-size: cover;
  overflow: hidden;
  border-radius: 10px;

  .dark-overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.4);
  }

  .playlist-text {
    color: white;
    width: 90%;
    max-width: 365px;
    z-index: 99;

    .playlist-name {
      font-size: 24px;
      letter-spacing: -0.4px;
      margin-bottom: 10px;
    }

    .playlist-description {
      font-size: 14px;
      letter-spacing: 0.22px;
    }
  }

  .playlist-info {
    color: #808080;
    position: absolute;
    bottom: 0;
    right: 0;
    padding: 10px;
    font-size: 14px;
    line-height: 20px;

    p {
      text-align: right;
    }
  }

  @media(max-width: 768px) {
    display: none;
  }
`;

export default function PlaylistImage() {
  const randomImageFromSpotify = 'https://i.imgur.com/iuyq8dP.png'

  return(
    <PlayListImageContainer playlistImage={randomImageFromSpotify}>
      <div className='dark-overlay' />
      <div className='playlist-text'>
        <h2 className='playlist-name'>
          Orangized Playlist
        </h2>
        <p className='playlist-description'>A playlist based on the music in your saved tracks orangized by a high bpm with low energy filter.</p>
      </div>
      <div className='playlist-info'>
        <p>Songs In Playlist — 436</p>
        <p>Total Listening Time — 2:31</p>
      </div>
    </PlayListImageContainer>
  );
}