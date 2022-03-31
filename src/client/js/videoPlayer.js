import fetch from "node-fetch";
 
const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5
video.volume = volumeValue;

const handleVideoEnded = () => {
    playBtn.innerText = "Play";
}

const handlePlayClick = (event) => {
    if(video.paused) {
        video.play();
    } else {
        video.pause();
    }
    playBtn.innerText = video.paused ? "Play" : "Paused";
};

const handleMuteClick = (event) => {
    if(video.muted) {
        video.muted = false;
    }   else {
        video.muted = true;
    }
    muteBtn.innerText = video.muted ? "Unmute" : "Mute" ;
    volumeRange.value = video.muted ? 0 : volumeValue ;
};

const handleVolumeRange = (event) => {
    const {
        target: {value},
    } = event;
    if(video.muted) {
        video.muted = false;
        muteBtn.innerText = "Mute";
    }
    console.log(value);
    volumeValue = value;
    video.volume = value;
}

const formatTime = (seconds) => {
    return new Date(seconds*1000).toISOString().substring(11,19);
};

const handleLoadedMetadata = () => {
    totalTime.innerText = formatTime(Math.floor(video.duration));
    timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
    currentTime.innerText = formatTime(Math.floor(video.currentTime));
    timeline.value = Math.floor(video.currentTime);
};

const handleTimelinecChange = (event) => {
    const {
        target: { value }
    } = event;
    video.currentTime = value;
};

const handleFullscreen = (event) => {
    const fullscreen = document.fullscreenElement;
    if(fullscreen) {
        document.exitFullscreen();
        fullScreenBtn.innerText = "Enter Full Screen";
    } else {
        videoContainer.requestFullscreen();
        fullScreenBtn.innerText = "Exit Full Screen";
    }
};

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
    if(controlsTimeout) {
        clearTimeout(controlsTimeout);
        controlsTimeout = null;
    }
    if(controlsMovementTimeout) {
        clearTimeout(controlsMovementTimeout);
        controlsMovementTimeout = null;
    }
    videoControls.classList.add("showing");
    controlsMovementTimeout = setTimeout(hideControls, 2000);
};

const handleMouseLeave = () => {
    controlsTimeout = setTimeout(hideControls, 2000);
};

const handleKeyDown = (event) => {
    if(event.keyCode === 32) {
        if(video.paused) {
            video.play();
        } else {
            video.pause();
        }
        playBtn.innerText = video.paused ? "Play" : "Paused";
    }
};

const handleEnded = () => {
    const { id } = videoContainer.dataset;
    fetch(`/api/videos/${id}/view`, {
        method: "POST",
    });
}

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeRange);
video.addEventListener("ended", handleVideoEnded);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("click", handlePlayClick);
video.addEventListener("ended", handleEnded);
timeline.addEventListener("input", handleTimelinecChange)
fullScreenBtn.addEventListener("click", handleFullscreen);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
document.addEventListener("keydown", handleKeyDown);