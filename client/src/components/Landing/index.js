import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useCookies } from 'react-cookie';
import { StateContext } from '../../App';

import logo from '../../assets/logo.svg';
// import TurntableModel from './TurntableModel';
import vinylRecord from '../../assets/vinyl-record.png';
import hand from '../../assets/hand.png';
import Parallax from './Parallax';

const LandingPageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #191F35;
  overflow: hidden;
  background-image: url('https://i.imgur.com/pafOlyj.jpg');
  background-size: cover;

  .section1 {
    width: 100%;
    height: 100vh;
    position: relative;
    display: flex;
    justify-content: center;

    .overlay {
      height: 100%;
      width: 100%;
      background-color: rgba(0,0,0,.4);
      position: absolute;
      top: 0;
      left: 0;
      z-index: 5;
    }

    .content-container {
      position: relative;
      display: flex;
      justify-content: space-between;
      padding: 0 30px;
      width: 100%;
      max-width: 1440px;

      .logo {
        position: absolute;
        width: 200px;
        height: 100px;
        left: 30px;
        z-index: 100;
      }

      .cta-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        z-index: 100;

        .cta {
          max-width: 432px;

          h1 {
            color: white;
            font-size: 64px;
          }

          button {
            width: 200px;
            height: 45px;
            font-size: 18px;
            color: white;
            background-color: #17C274;
            border-radius: 4px;
            outline: none;
            border: none;
            margin-top: 20px;

            :hover {
              cursor: pointer;
            }
          }
        }
      }

      .vinyl-record {
        position: absolute;
        bottom: 0;
        left: calc(50% - 425px);
        transform-origin: center;
        z-index: 8;

        img {
          width: 800px;
          height: 800px;
        }
      }

      .hand {
        position: absolute;
        bottom: 0;
        left: -232px;
        z-index: 9;
      }
    }
  }
`;

const Landing = () => {
  const [ cookies, setCookie, removeCookie ] = useCookies(['cookie-name']);
  const [ accessToken, setAccessToken ] = useContext(StateContext).AccessToken;

  const login = () => {
    axios.get(`http://localhost:9000/auth/login`)
      .then(res => {
        window.location = res.data;
      })
      .catch(err => console.log(err));
  };

  const getAccessToken = (code) => {
    axios.post(`http://localhost:9000/auth/token`, {
      code
    })
    .then(res => {
      const { access_token, refresh_token, user } = res.data;
      
      if (!access_token.includes('error')) {
        removeCookie('code');
        setCookie('accessToken', access_token);
        setCookie('refreshToken', refresh_token);
        setCookie('userData', JSON.stringify(user));
        setAccessToken(access_token);
        window.location = 'http://localhost:3000';
      }
    })
    .catch(err => console.log(err));
  };

  useEffect(() => {
    const url = window.location.search;
    const getQuery = url.split('?')[1];

    if (getQuery && getQuery.includes('code') && !cookies.code) {
      const params = getQuery.split('&');
      const code = params[0].substring(5);
      setCookie('code', code);
      window.location.reload();
    }
  },[]);

  useEffect(() => {
    if (cookies.code && !cookies.accessToken) {
      getAccessToken(cookies.code);
    }
  },[]);

  const [rotation, setRotation] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const handleResize = () => setRotation(window.innerWidth)
  const handleScroll = () => setOffsetY(window.pageYOffset);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  },[]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  },[]);

  return(
    <LandingPageContainer>
      <section className='section1'>
        <div className='overlay' />
        <div className='content-container'>
          <img className='logo' src={logo} />
          <div className='cta-container'>
            <div className='cta'>
              <h1>Create your perfect mood with Moodify.</h1>
              <button onClick={login}>Login With Spotify</button>
            </div>
          </div>
          <div 
            className='vinyl-record'
            style={{ transform: `rotateZ(${ rotation * 0.1 + offsetY * 0.05 }deg)` }}>
            <img src={vinylRecord} />
          </div>
          <div 
            className='hand'
            style={{ transform: `translateY(${ offsetY * -0.5 }px)` }}>
            <img src={hand} />
          </div>
        </div>
      </section>
      <Parallax />
    </LandingPageContainer>
  );

};

export default Landing;