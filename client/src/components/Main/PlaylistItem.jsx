import React, { useContext, useState, useEffect } from "react";
import { StateContext } from "../../App";
import axios from "axios";
import { serverRoot } from "../../env";
import { debounce } from "debounce";

import styled, { keyframes } from "styled-components";
import PlayButton from "../../assets/icons/PlayButton.svg";
import WaveFormSource from "../../assets/icons/audio.svg";
// import setCurrentSongPlaying from "../../helpers/songPreviewManager";
import { filterTracks } from "../../helpers/filter";
import { getAudioFeatures, getAverages } from "../../helpers/calculations";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

// React-GA for Google Analytics
import ReactGA from "react-ga";
import setCurrentSongPlaying from "../../helpers/songPreviewManager";
import { NIL } from "uuid";

const StyledSongCoverContainer = styled.div`
  position: relative;
  height: 100%;
  width: 44px;
  border-radius: 5px 0px 0px 5px;
  left: 0px;
`;

const StyledSongImage = styled.img`
  height: 100%;
  border-radius: 5px 0px 0px 5px;
`;

const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  display: ${(props) => (props.playing ? "flex" : "none")};
  justify-content: center;
  background-color: rgba(46, 213, 137, 0.32);
  height: 45px;
  width: 45px;
  padding: 5px;
  border-radius: 5px 0px 0px 5px;
`;

const SongName = styled.h4`
  font-family: "Inter";
  display: block;
  width: 100%;
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  color: white;
  margin: 0;

  color: ${(props) => (props.playing ? "#2ed589" : null)};
`;

const ArtistName = styled.p`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  line-height: 16px;
  letter-spacing: -0.157143px;
  color: #cecfd3;
  margin: 0;
`;

const AudioFeatures = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  color: white;
  font-family: Inter;
  font-size: 11px;
  font-weight: normal;

  @media (max-width: 450px) {
    display: none;
  }

  p {
    width: 75px;

    @media (max-width: 1125px) {
      width: 50px;
    }
    text-align: center;
  }
`;

const SongMetaData = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-left: 12px;
  width: 275px;
  max-width: 275px;
`;

const animateIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.6) translateY(-8px);
  }
  100% {
    opacity: 1;
  }
`;

const StyledPlaylistItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  background-color: ${(props) => (props.playing ? "#21232e" : "#3c4051")};
  height: 45px;
  width: 100%;
  border-radius: 5px;
  margin: 12px 0;
  position: relative;

  /* Animations here */
  animation: ${animateIn} 220ms;
  animation-delay: calc(${(props) => props.idx} * 5ms);
  animation-fill-mode: both;
  animation-timing-function: ease-in-out;
  transition: background-color 200ms ease-in;

  /*  */
  &:hover {
    background-color: #21232e;
    cursor: ${(props) => (props.previewUrl ? "pointer" : "default")};
  }

  &:hover ${SongName} {
    color: #2ed589;
  }

  &:hover ${OverlayContainer} {
    display: ${(props) => (props.previewUrl ? "flex" : "none")};
  }
`;

const playProgress = keyframes`
from {
  width: 0%;
}
to {
 width: 100%;
}
`;

const StyledProgressContainer = styled.div`
  position: absolute;
  display: flex;
  width: 100%;
  height: 3px;
  padding-left: 45px;
  bottom: 0px;
  width: 0%;
  border-radius: 0px 0px 5px;
  z-index: 100;
  width: 100%;

  div {
    animation: ${(props) => (props.playing ? playProgress : null)} 30s linear;
    width: 0%;
    background-color: #2ed589;
  }

  @keyframes play-progress {
    0% {
      width: 0px;
    }
    100% {
      width: 200px;
    }
  }
`;

const initialPosition = {
  mouseX: null,
  mouseY: null,
};

const PlaylistItem = (props) => {
  const [accessToken, setAccessToken] = useContext(StateContext).AccessToken;
  const [chartValues, setChartValues] = props.chartValues;
  const [userTracks, setTracks] = props.userTracks;
  const [playlistMinMax, setPlaylistMinMax] = props.playlistMinMax;
  const [snackbar, setSnackbar] = props.snackbar;

  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setPlaying] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(false);

  const [position, setPosition] = useState(initialPosition);
  const handleClick = (event) => {
    event.preventDefault();
    setPosition({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  useEffect(() => {
    if (isPlaying) {
      setCurrentSongPlaying(props.previewUrl, () => {
        setPlaying(false);
      });
    }
  }, [isPlaying]);

  const playPreview = () => {
    if (!props.previewUrl) return;
    props.setSongSrc((prev) => ({
      playing: !prev.playing,
      src: props.previewUrl,
    }));
    setPlaying(!isPlaying);
  };

  const playing = isPlaying;

  const handleClose = (event) => {
    event.stopPropagation();
    setPosition(initialPosition);
  };

  const addSimilarSongs = (event, trackId) => {
    event.stopPropagation();
    ReactGA.event({
      category: "Add Similar Songs",
      action: "User clicked add similar songs.",
    });
    setPosition(initialPosition);
    const totalSongs = filterTracks(userTracks, playlistMinMax).length;

    axios
      .post(`${serverRoot}/tracks/recommendations`, {
        accessToken,
        recommendationSeeds: [{ track_id: trackId }],
        playlistMinMax,
      })
      .then((res) => {
        setTracks((prev) => {
          const allSongs = {
            songs: [...prev.songs, ...res.data.songs],
          };

          const newTracks = filterTracks(allSongs, playlistMinMax);
          if (newTracks.length === totalSongs) {
            setSnackbar({
              ...snackbar,
              open: true,
              message: "Sorry, could not find any similar songs",
              variant: "error",
            });
          }
          setChartValues(getAverages(allSongs.songs));

          return {
            loading: false,
            songs: [...prev.songs, ...res.data.songs],
          };
        });
      })
      .catch((res) => {
        setSnackbar({
          ...snackbar,
          open: true,
          message: res.message,
          variant: "error",
        });
      });
  };

  const removeSong = (event, trackId) => {
    event.stopPropagation();
    ReactGA.event({
      category: "Remove Song",
      action: "User clicked remove song.",
    });
    setPosition(initialPosition);
    setTracks((prev) => {
      const newSongs = filterTracks(prev, playlistMinMax, trackId);

      return {
        loading: false,
        songs: newSongs,
      };
    });
  };

  const applySongFeatures = (event, audioFeatures) => {
    event.stopPropagation();
    ReactGA.event({
      category: "Use As Filter",
      action: "User clicked use as filter.",
    });
    setPosition(initialPosition);

    const {
      danceability,
      energy,
      instrumentalness,
      loudness,
      tempo,
      valence,
    } = audioFeatures;
    const newFeatures = getAudioFeatures(audioFeatures);
    setPlaylistMinMax((prev) => {
      return {
        loading: true,
        data: { ...newFeatures },
      };
    });
  };

  return (
    <StyledPlaylistItem
      idx={props.idx}
      className="playlist-item"
      onClick={debounce(playPreview, 200)}
      onContextMenu={handleClick}
      styled={{ cursor: "context-menu" }}
      previewUrl={props.previewUrl}
      playing={playing}
    >
      <Menu
        open={position.mouseY !== null}
        onClose={handleClose}
        autoFocus={false}
        anchorReference="anchorPosition"
        anchorPosition={
          position.mouseY !== null && position.mouseX !== null
            ? { top: position.mouseY, left: position.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={(event) => addSimilarSongs(event, props.id)}>
          add similar songs
        </MenuItem>
        <MenuItem onClick={(event) => applySongFeatures(event, props.audio)}>
          use as filter
        </MenuItem>
        <MenuItem onClick={(event) => removeSong(event, props.id)}>
          remove song
        </MenuItem>
      </Menu>

      <StyledSongCoverContainer>
        <StyledSongImage src={props.img} />
      </StyledSongCoverContainer>

      <OverlayContainer playing={playing}>
        {playing && <img src={WaveFormSource} />}
        {!playing && <img src={PlayButton} />}
      </OverlayContainer>
      <SongMetaData>
        <SongName playing={playing}>
          {props.name.length > 26
            ? props.name.slice(0, 20) + "..."
            : props.name}
        </SongName>
        <ArtistName>{props.artist}</ArtistName>
      </SongMetaData>
      <AudioFeatures>
        <p>{Math.round(props.audio.tempo)}</p>
        <p>{Math.round(props.audio.energy * 100)}</p>
        <p>{Math.round(props.audio.danceability * 100)}</p>
        <p>{Math.round(props.audio.valence * 100)}</p>
        <p>{Math.round(props.audio.instrumentalness * 100)}</p>
        <p>{Math.round(props.audio.loudness)}db</p>
      </AudioFeatures>
      <StyledProgressContainer playing={playing}>
        <div></div>
      </StyledProgressContainer>
    </StyledPlaylistItem>
  );
};

export default PlaylistItem;
