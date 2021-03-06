import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import playlistsFull from './assets/playlists-cut.png';
import radarChart from './assets/radar-chart.png';

const PlaylistContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 1000px;
  width: calc(100% - 40px);
  height: 80vh;
  color: white;
  margin-bottom: 100px;

  .content-container {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .text-container {
      width: 48%;
      max-width: 442px;

      img {
        margin-top: 100px;
        width: 100%;
      }

      h1 {
        font-size: 36px;
        letter-spacing: 2.4px;
        margin-bottom: 10px;
      }
      p {
        font-size: 36px;
        letter-spacing: 1px;
      }
    }

    .playlists {
      width: 48%;
      transform: translateY(50px);
      display: flex;
      justify-content: flex-end;

      img {
        width: 100%;
      }
    }
  }
`;

export default () => {
  return (
    <PlaylistContainer>
      <div className='content-container'>
        <div className='text-container'>
          <p>to create the perfect playlist for any mood.</p>
          <img src={playlistsFull} />
        </div>
        <div className='playlists'>
          <img src={radarChart} />
        </div>
      </div>
    </PlaylistContainer>
  )
};