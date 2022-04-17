const { javascript } = require("webpack")
const { watch } = require("../webpack.config")

자 이제 후론트엔드

# Player Setup

플레이어를 직접 만들어볼거다.
그전에 우리 webpack이 어떻게 설정되어있는지 확인해볼거다.
webpack에는 진입점(entry point)이 있다.

***************************************************************************************************************************************
(webpack.config.js)

module.exports = {
    entry: "./src/client/js/main.js",   <- 여기
    mode: "development"
 .
 .
***************************************************************************************************************************************

진입점에서 모든 javascript파일을 컴파일하고 이 컴파일된 JS파일은 base.pug에 로드되었다.
그리고 이 base는 모든 페이지에 포함되어있다.

자 그럼 이 비디오플레이어 코드를 검색화면에 로드하는게 맞을까?
당연히 아니지

지금부터 할것은 다른 javascript파일을 만들어서 그 다른 javascript파일을 다른 페이지에 포함시켜줄거다.
예를들면 비디어플레이어 코드는 비디오보는 페이지에서만 로드시키는거다.

그러기위해서 일단 지금 우리의 webpack에는 하나의 entry point만 있다.
고것을 바꿔줄건데

main.js를 하는 대신에 videoPlayer.js라는 새로운 파일을 만들어주고
entry를 object로 만들어주고 각각 이름을 붙여줄거다.
그리고 output에도 이름이 있다.
모든것들이 main.js로 변할텐데 우린 그걸 원하지 않는다.
현재의 경우 2개의 main.js 파일이 생기는거다.

그러니 output에 [name]이라는 변수를 쓰면 각 원래의 파일에 따른 이름으로 각기다른 JS파일이 만들어진다.

***************************************************************************************************************************************
(webpack.config.js)

module.exports = {
    entry: {                                       <- 여기서 entry point를 객체로 만들고
        main: "./src/client/js/main.js",
        videoPlayer: "./src/client/js/videoPlayer.js",
    },
    mode: "development"
    watch: true,
    plugins: [
        new MiniCssExtractPlugin({
            filename: "css/style.css",
        }),
    ],
    output: {
        filename: "js/[name].js",                   <- 여기러 output filename을 변수로 받는다.
        path: path.resolve(__dirname, "assets"),
        clean: true,
    }
***************************************************************************************************************************************

이렇게 여러 다른 파일들을 webpack으로 포함시킬수 있게 되었다.

이제 videoPlayer.js 를 비디오플레이어가 필요한 페이지로 로드해줘야한다.
오직 watch.pug에서만 비디오플레이어를 사용한다.

watch.pug에서는 base를 extends하고있다.
그리고 그 base에는 script를 넣을 공간이 없다.

그래서 base에 block을 추가하고 sciprts라고 이름 붙일거다.

***************************************************************************************************************************************
(base.pug)

doctype html
html(lang="ko")
    head
        title #{pageTitle} | #{siteName}
        link(rel="stylesheet", href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css")
        link(rel="stylesheet", href="/static/css/style.css" )
    body
        include partials/header
        main
            block content
        include partials/footer.pug
    script(src="/static/js/main.js") <- 원래 이건데
    block scripts                       <- 이걸로 바꿈
***************************************************************************************************************************************

block content 가 다른 템플릿들을 모두 채울 수 있는것처럼
block scripts도 똑같이 하는거다.

그리고 watch.pug에 block scripts에 videoPlayer.js를 넣어주면 watch.pug에서만 videoPlayer.js를 로드할수있게된다.

***************************************************************************************************************************************
(watch.pug)

extends base.pug

block content
    video(src="/" + video.fileUrl, controls)
    div
        p=video.description
        small=video.createdAt
    div
        small Uploaded by
            a(href=`/users/${video.owner._id}`)=video.owner.name
    if String(video.owner._id) === loggedInUser._id
        a(href=`${video.id}/edit`) Edit Video &rarr;
        br
        a(href=`${video.id}/delete`) Delete Video &rarr;

block scripts  <- 여기 넣어주면 됨
    script(src="/static/js/videoPlayer.js")
***************************************************************************************************************************************

src에서 static를 추가해준 이유는 우리의 서버에서 라우드를 '/static' 을 사용하도록 설정되어 있고
assets폴더에 접근권한을 주기 위해서다.

자 이제 비디오플레이어를 만들기위한 준비를 마쳤다.
만들어보자.



# Play Pause

비디오플레이어를 만들기 전에 HTML에 마크업을 해줘야한다.
아래처럼 재생정지버튼/음소거버튼/볼륨조절버튼을 만든다.

input form에 대한 스타일을 전부 크게 설정해놓았기 때문에 not() 을 사용해서 특정 타입의 input은 기존 css에서 제외시켜준다.


***************************************************************************************************************************************
(form.scss)

input:not(input[type="range"]) {                                    <- 요기서 not으로 제외시켜주고
    all: unset;
    padding: 15px 20px;
    border-radius: 5px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background-color: black;
    margin-bottom: 5px;
    font-size: 16px;
    color: white;
    width: 90%;
    &::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }
  }

(watch.pug)

  extends base.pug

  block content
      video(src="/" + video.fileUrl, controls)
      div
          button#play Play                                          <- 요기서 특정 HTML을 만들고 마크업 해준다. 그리고 아이디로 구분지어준다.
          button#mute Mute
          span#time 00:00/00:00
          input(type="range", step="0.1", min="0", max="1")#volume

  block scripts
      script(src="/static/js/videoPlayer.js")

***************************************************************************************************************************************

자 이제 이 새로만든 HTML들의 id를 javascript에 넣어줄거다.
아래처럼 가져오면 된다.
오랜만에 보쥬 아주 반갑쥬.

***************************************************************************************************************************************
(videoPlayer.js)

const video = document.querySelector("video");
const play = document.getElementById("play");
const mute = document.getElementById("mute");
const time = document.getElementById("time");
const volume = document.getElementById("volume");***************************************************************************************************************************************

자 이제 이것들을 javascript에서 우린 쓸수있게 되었다.

video element에 대해 알아보자면
비디오와 오디오는 둘다 html media element로부터 상속을 받는다.
그리고 손나 많은 프로퍼티들을 가지고있다.
그리고 그중에 paused가 우리가 사용할 element 이다.

이게 true면 비디오가 멈춰있는거고 false면 재생중인거다.

그리고 당연하게도 재생시켜주고 멈춰주는 .paly() 와 .pause() 라는 메소드가 있으니 이걸 사용하면 된다.


***************************************************************************************************************************************
const handlePlay = (e) => {
    if(video.paused) {
        video.play();       <- 멈춰있으면 재생하고
    } else {
        video.pause();      <- 재생중이면 멈춰주고
    }
};

const handleMute = (e) => {

};

playBtnß.addEventListener("click", handlePlay);
mute.addEventListener("click", handleMute);
***************************************************************************************************************************************

그리고 이것을 클릭했을 때 #play의 텍스트가 바뀌어주게 할거다.
그냥 playBtn.innerText("ply or pause") 를 If 조건문안에 넣어줘도 되지만

video에 addEventListener를 사용하여 만들어볼거다.

video element에는 "pause"라는 이벤트가 있고 비디오가 멈추면 발생하는 이벤트다(click도 이벤트다. 동일한 맥락임)
이게 별로 맘에 안드는 방법일지도 모르지만 좋은 코딩은 세분화되어 구조화된 코딩이고
가각의 펑션이 하나의 기능들을가지고 역할을 잘 수행하기 때문에 이것이 더 좋은 코딩이다.


***************************************************************************************************************************************
(videoPlayer.js)

const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const mute = document.getElementById("mute");
const time = document.getElementById("time");
const volume = document.getElementById("volume");

const handlePlayClick = (e) => {
    if(video.paused) {
        video.play();
    } else {
        video.pause();
    }
};

const handleMute = (e) => {

};
const handlePause = (e) => playBtn.innerText = "Play";
const handlePlay = (e) => playBtn.innerText = "Pause";

playBtn.addEventListener("click", handlePlayClick);
mute.addEventListener("click", handleMute);
video.addEventListener("pause", handlePause);
video.addEventListener("play", handlePlay);
***************************************************************************************************************************************


# Mute and Unmute

mute버튼을 누르면 볼륨이0이되면서 볼륨 게이지도 0으로 가고 다시 누르면 원래 소리나오던 상태로 돌아가게한다.
video에는 muted라는 프로퍼티가 있고 이것은 우리가 바꿔줄 수 있다.(=readOnly가 아니다.)
아래처럼 muteBtn을 클릭한 이벤트가 발생할 떄 이 video의 muted 프로퍼티를 버꿔주면 된다.
(play 버튼도 위와같은 방식으로 바꿔줬음)

***************************************************************************************************************************************
(videoPlayer.js)

const handleMute = (e) => {
    if(video.muted) {
        video.muted = false;
    }   else {
        video.muted = true;
    }
    muteBtn.innerText = video.muted ? "Unmute" : "Mute" ;
};
const handlePause = (e) => playBtn.innerText = "Play";
const handlePlay = (e) => playBtn.innerText = "Pause";

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
video.addEventListener("pause", handlePause);
video.addEventListener("play", handlePlay);
***************************************************************************************************************************************

이제 볼륨게이지와 볼륨을 연결해줄거다.
Mute 버튼을 누르면 0으로 가고 다시 누르면 0.5로 가게 일단 설정
volumeRange element에 value를 통해서 간단하게 설정 가능하다.

***************************************************************************************************************************************
(videoPlayer.js)

const handleMute = (e) => {
    if(video.muted) {
        video.muted = false;
    }   else {
        video.muted = true;
    }
    muteBtn.innerText = video.muted ? "Unmute" : "Mute" ;
    volumeRange.value = video.muted ? 0 : 0.5 ;             <- 여기지롱
};
***************************************************************************************************************************************


자 이제 뮤트를 해재했을 때 원래의 볼륨값으로 돌아오게 하는것과
볼륨레인지 버튼과 실제 볼륨값을 연동시켜서 드래그하면 볼륨이 바뀔수있게하는 기능을 구현할거다.




# Volume

먼저 range의 기본값을 세팅할거다.
템플릿에서 input element에 value를 설정해줌으로서 간단하게 기본값 설정이 가능하다.

***************************************************************************************************************************************
(watch.pug)

extends base.pug

block content
    video(src="/" + video.fileUrl, controls)
    div
        button#play Play
        button#mute Mute
        span#time 00:00/00:00
        input(type="range", step="0.1", value=0.5, min="0", max="1")#volume     <- 여기지롱

block scripts
    script(src="/static/js/videoPlayer.js")

***************************************************************************************************************************************

이건 그냥 html의 input의 value일 뿐이다.
비디오의 음량을 아직 바꾸진 않는다.

video element에는 volume 이라는 프로퍼티가 있는데 이거가 그냥 video의 volume을 설정하는거다.
아주 심플하다. 다있네 이미 그냥 뭐

그리고 videoPlayer.js 에서
초기 video.volume의 값을 0.5로 volumeRange의 기본값과 동일하게 맞춰 주고
드래그할 때마다 움직임을 감지하여 일치시켜주면 된다.

change라는 even를 사용하면 된다.
아니 근데 change는 마우스를 드래그 하고 놓았을 때만 발생하는 이벤트다.
나는 마우스를 드래그하면 자연스럽게 볼륨도 같이 변하게하는 기능을 구현하고싶다.

그렇게하기 위해 HTML의 Range type=range인 input의 다른 event가 뭐가있는지 찾아보았다.

아니 그랫더니 "input" 이라는 evnet가 있어서 이놈은 드래그하면서 range의 값이 변할 때 마다.
이벤트를 발생시키는 놈이다.

내가원하는 바로 그거다.

이벤트가 발생하면 addEventListener에서 콜백함수에 evnet라는 인자를 주고
그 event 인자의 event.target.value에 input의 값이 들어있다.

이제 이걸 video.volume과 연결시켜주면 우리는 비디오의 볼륨을 조절할수가 있다.


***************************************************************************************************************************************
(videoPlayer.js)

const handleVolumeRange = (event) => {
    const {
        target: {value},
    } = event;
    if(video.muted) {                   <- 뮤트상태였다가 볼륨레인지를 움직이면 뮤트버튼의 텍스트를 바꿔주는 기능
        video.muted = false;
        muteBtn.innerText = "Mute";
    }
    video.volume = value;               <- 볼륨레인지의 값을 실제 비디오의 볼륨값으로 넣어준다.
}

volumeRange.addEventListener("input", handleVolumeRange);       <- "input" 이벤트가 "handleVolumeRange"함수에 "event" 인자를 넘겨준다.
***************************************************************************************************************************************

이제 뮤트였다가 뮤트상태해재를 위해 다시 버튼을 누르면 원래 볼륨으로 돌아가는 기능을 구현할거다.


# Duration and Current Time

현재재생시간 / 전체비디오시간
-> 요거 만들어 볼거임.

이번에는 "loadedmetadata" 라는 event를 사용할거다.
meta data는 비디오를 제외한 모든것을 말한다.
예를들면 비디오의 전체시간이라던지 가로세로 크기라던지 뭐 하여간 그냥 이런저런 대부분 비디오의 이미지를 제외한 모든데이터이다.
일단 HTML에 우리가 값을 부여할수있게 id를 붙여서 현재시간과 전체시간을 만들어준다.

***************************************************************************************************************************************
(watch.pug)

extends base.pug

block content
    video(src="/" + video.fileUrl, controls)
    div
        button#play Play
        button#mute Mute
        input(type="range", step="0.1", value=0.5, min="0", max="1")#volume
        div
            span#currentTime 00:00                  <- 요기 만드는겨
            span /
            span#totalTime 00:00

(videoPlayer.js)

block scripts
    script(src="/static/js/videoPlayer.js")

    const handleLoadedMetadata = () => {
        totalTime.innerText = Math.floor(video.duration);   <- 비디오 시간이 들어감 초단위 그리고 소수점 지워줌(Math.floor 사용하여)
    };

    playBtn.addEventListener("click", handlePlayClick);
    muteBtn.addEventListener("click", handleMuteClick);
    volumeRange.addEventListener("input", handleVolumeRange);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
***************************************************************************************************************************************

이제 totalTime에는 전체 비디오의 시간이 들어간다.

이제 1초마다 현재시간이 업데이트되게 만들것이고
그렇기 위해 사용할 이벤트는 timeUpdate라는 이벤트이다.
이 이벤트는 비디오의 시간이 변할 때 마다 발생된다.
그리고 video.currentTime 프로퍼티를 통해 현재 시간을 받을 수 있다.

***************************************************************************************************************************************
(videoPlayer.js)

const handleTimeUpdate = () => {
    currentTime.innerText = Math.floor(video.currentTime);          <- 비디오의 현재시간을 HTML 에 입력하여 화면에 출력(소수점 없앰)
};

video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);             <- 비디오 시간이 바뀔때마다 이벤트를 발생시켜 함수를 실행
***************************************************************************************************************************************

현재까지 정리하자면 우리가 event를 사용하고있기 때문에, javascript는 비디오가 로드될 때 마다
handleLoadedMetadata 함수를 호출해줄것이다.

javascript는 handleTimeUpdate function을 비디오의 시간이 변할 때 마다 호출해줄것이고
그 때마다 비디오의 현재시간을 알아내고 그 시간을 HTML 에 넣어줄것이다.


# Time Formatting

Date() -> 현재 날짜 및 시간 반환
new Date("숫자") -> 1970년 1월1일 09시(한국시간)부터 "숫자" 밀리초만큼의 시간이 지난 날짜&시간 을 반환

1970년 1월1일 09시 -> javascript의 0 time

new Date(29*1000)
 반환되는 값 -> Thu Jan 01 1970 09:00:29 GMT+0900 (한국 표준시)

new Date(29*1000).toISOString()
 반환되는 값 -> '1970-01-01T00:00:29.000Z

toISOString
 : 주어진 날짜를 국제표준시 기준 ISO 8601 형식으로 표현한 문자열.
 -> 요거 없으면 일단 new Date() 했을 때 시간이 09시부터 시작하게 된다. 왜냐면 한국이 9시간 먼저가니까 국제 기준시간 대비

toString()
 : 어떤문자.subString(시작인덱스, 종료인덱스) -> 어떤문자의 시작인덱스부터 종료인덱스까지의 문자열을 가져온다.(시작인덱스는 0부터다)

new Date(seconds*1000).toISOString().substring(11,19);
 : 요러케 하면 seconds의 시간을 00:00:00 요 형식으로 가져올수 있다. 꽤나괜춘한 트릭이다.

***************************************************************************************************************************************
const formatTime = (seconds) => {
    return new Date(seconds*1000).toISOString().substring(11,19);           <- 초단위를 00:00:00 format으로 바꿔주는 function
};

const handleLoadedMetadata = () => {
    totalTime.innerText = formatTime(Math.floor(video.duration));
};

const handleTimeUpdate = () => {
    currentTime.innerText = formatTime(Math.floor(video.currentTime));
};

video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);               ,,;:
***************************************************************************************************************************************



# Timeline

id가 timeline인 input HTML 태그를 하나 만들어준다.
이것은 max를 정해두지 않는다. 왜냐면 동영상시간이 얼마나될지 모르니까
또한 step은 1씩 움직이게 한다. 1초씩 움직이게 할것이기 때문
value는 0 왜냐면 처음에는 기본적으로 0초부터 동영상플레이할것이기 때문

***************************************************************************************************************************************
(watch.pug)

extends base.pug

block content
    video(src="/" + video.fileUrl, controls)
    div
        button#play Play
        button#mute Mute
        input(type="range", step="0.1", value=0.5, min="0", max="1")#volume
        div
            span#currentTime 00:00
            span /
            span#totalTime 00:00
        div
            input(type="range", step="1", value=0, min="0")#timeline

block scripts
    script(src="/static/js/videoPlayer.js")
***************************************************************************************************************************************

비디오 전체 시간은 handleLoadedMetadata를 통해서 받는다.
왜냐면 요 이벤트 안에는 동영상 전체 시간이 들어있기 때문
이렇듯 HTML의 type="range" 인 input은 min, max를 꼭 정해줘야한다.
그래야 javascript가 어디가 시작이고 끝인지 알 수 있기 때문이다.
또한 step또 당연히 있어야지 그래야 얼마나 넘길지 Javascript가 알기 때문이다.

현재 우리의 경우 에서는 maximum value가 비디오의 마지막 시간과 같기 때문에
비디오와 똑같은 길이를 가진 range input이 생긴거다.


***************************************************************************************************************************************
(videoPlayer.js)

const handleLoadedMetadata = () => {
    totalTime.innerText = formatTime(Math.floor(video.duration));
    timeline.max = Math.floor(video.duration);                      <- 여기서 range input의 max value를 정해진거다. 비디오가 로드될 때
};
***************************************************************************************************************************************

그래서 이제 비디오 시간과 range input의 value를 똑같이되게 세팅해줄거다.
메뉴얼에 나와있다시피 video.currentTime은 getter이자 setter 즉, 받아올수도 있고
직접 값을 수정해줄수도 있다는 말이다.
그러면 우리는 range input의 값을 그냥 video.currentTime에 넣으면 된다는거다.

***************************************************************************************************************************************
(videoPlayer.js)

const handleTimelinecChange = (event) => {
    const {
        target: { value }
    } = event;
    video.currentTime = value;     <- 요기서 그냥 현재 input value 때려넣으면 끗임.
};
***************************************************************************************************************************************








# Fullscreen

일단 watch templete에 버튼하나 만들어 주고

***************************************************************************************************************************************
(watch.pug)

extends base.pug

block content
    video(src="/" + video.fileUrl)
    div
        button#play Play
        button#mute Mute
        input(type="range", step="0.1", value=0.5, min="0", max="1")#volume
        div
            span#currentTime 00:00
            span /
            span#totalTime 00:00
        div
            input(type="range", step="1", value=0, min="0")#timeline
        div
            button#fullScreen Enter Full Screen

block scripts
    script(src="/static/js/videoPlayer.js")
***************************************************************************************************************************************


API를 이용해 풀스크린을 만드는건 정말 쉽다.
element를 선택해주고 .requestFullscreen()만 쓰면된다.

자 그럼 요거 버튼 videoPlayer.js로 가져와서 클릭이벤트 발생했을 때 비디오에다가 .requestFullscreen() 해주면 된다.
하지만 그렇게되면 그냥 비디오만 풀스크린 되는거다.
모든 우리의 컨트롤러들은 제외한체
우리는 비디오와함께 만든 컨트롤럴들도 함꼐 전체화면화 되기를 바란다.

그러니 비디오 관련된 컨트롤러와 비디오를 #videoContainer 라는 id 로 하나로 묶어버려서
그 묶은것은 .requestFullscreen() 해주었다.

***************************************************************************************************************************************
(watch.pug)

extends base.pug

block content
        div#videoContainer
            video(src="/" + video.fileUrl)
            div
                button#play Play
                button#mute Mute
                input(type="range", step="0.1", value=0.5, min="0", max="1")#volume
                div
                    span#currentTime 00:00
                    span /
                    span#totalTime 00:00
                div
                    input(type="range", step="1", value=0, min="0")#timeline
                div
                    button#fullScreen Enter Full Screen
block scripts
    script(src="/static/js/videoPlayer.js")
***************************************************************************************************************************************

근데 그러면 같이 전체화면 되긴하는데 모양이 구림

일단 전체화면 버튼 누르면 전체화면 버튼 "Exit Full Screen" 으로 바뀌고
"Exit Full Screen" 누르면 전체화면이 취소되도록 만들어 주려한다.

document.fullscreenElement 라는게 있다.
이 프로퍼티는 우리한테 element를 준다.
현재 풀스크린모드인 element가 우리한테 element를 준다는거다.

document.fullscreenElement 가 null 을 반환한다면 풀스크린모드인 element가 없다는거다.




# Controls Events part One

마우스를 비디오 위로 올리면 컨트롤러가 보이고 마우스 움직임이 없으면 또 몇초 있다가 사라지고 하는 기능을 구현
또 비디오 안으로 들어갔다가 나오면 다시 컨트롤러 사라지고 이것도.

이번 파트를 통해 event와 timeout에 대해 배울거다.

Step1
마우스가 언제 비디오에 들어가고, 언제 비디오 안에서 움직이는지를 탐지
video element에는 마우스관련 많은 event들이 있는데 여기서는 그중 "mousemove"를 사용할거다.

마우스가 움직이면 컨트롤러들에게 class를 추가해줄거다.
왜냐면 나중에 CSS를 이용해서 class_style 을 변경할 예정이기 때문이다.

일단 비디오 컨트롤러를 묶은 div에 ID를 붙임

***************************************************************************************************************************************
(watch.pug)

extends base.pug

block content
        div#videoContainer
            video(src="/" + video.fileUrl).videoPlayer
            div#videoControls                           <- 요기에 #videoControls라고 이름 붙임
                button#play Play
                button#mute Mute
                input(type="range", step="0.1", value=0.5, min="0", max="1")#volume
                div
                    span#currentTime 00:00
                    span /
                    span#totalTime 00:00
                div
                    input(type="range", step="1", value=0, min="0")#timeline
                div
                    button#fullScreen Enter Full Screen
block scripts
    script(src="/static/js/videoPlayer.js")
***************************************************************************************************************************************

그리고 handleMouseMove를 통해 움직이면 "showing" 이라는 class이름을 붙여주게한다.
아래처럼 하면 된다.

***************************************************************************************************************************************
(videoPlayer.js)

const videoControls = document.getElementById("videoControls");     <- 이거로 받고

const handleMouseMove = () => {
    videoControls.classList.add("showing"); <- 요거로 class 생기개 해주고
};

video.addEventListener("mousemove", handleMouseMove);   <- 요기서 비디오안에서 이제 마우스 움직이는 이벤트 발생 캐치하고
***************************************************************************************************************************************

이제 마우스가 나가면 class_name을 지우도록 할거다.
"mouseleave" event를 사용하여 이벤트를 캐치하면되고
classList.remove()를 통해 class를 지워줄 수 있다.

***************************************************************************************************************************************
(videoPlayer.js)

const videoControls = document.getElementById("videoControls");

const handleMouseLeave = () => {
    videoControls.classList.remove("showing");
};
video.addEventListener("mouseleave", handleMouseLeave);
***************************************************************************************************************************************


근디 우리는 마우스가 나간다고 바로 class가 사라지는건 원하지 않는다.
마우스가 나가고 2초뒤에 사라지도록 기능을 구현해볼거다.
Javascript에서 기다리게 하려면, setTimeout 이라는 function을 사용하면 된다.

setTimeout("사용할 함수", "딜레이할 시간(ms)");

사용법은 위와 같으니 아래처럼 코드를 작성해주면 2초뒤에 class이름이 사라지게된다.

***************************************************************************************************************************************
(videoPlayer.js)


const handleMouseLeave = () => {
    setTimeout(
        () => {
            videoControls.classList.remove("showing");
        }, 2000);
};
***************************************************************************************************************************************

근데 이렇게하면 문제가 나가고 2초안에 다시 마우스를 비디오안에 올려놔도 class가 지워진다는 점 이다.
이말은 마우스가 다시 비디오위로 올라오면 timeout을 취소해야한다는 뜻이다.

그렇게 하기 위해서 우리가 첫번째로 알아야할건
timeout의 return값을 이해해야한다.

우리가 setTimeout function을 부를 때, return값으로 뭔가를 받는다.
id를 받는데 이것은 브라우저가 timeout에 부여하는 하나밖에 없는 id다.

여기서 우리는 clearTimeout이라는 function에 이 id를 건내주면 된다.
쉽쥬?

근데 handleMouseLeave에서 setTimeout으로 return값을 받는데 그걸 어떻게 handleMouseMove에 변수로 사용할까?
아 당연히 전역변수로 만들어서 받고쓰고 뭐 그렇게 하면 된다.
아래 처럼 하면 됨.

***************************************************************************************************************************************
(videoPlayer.js)

let controlsTimeout = null;                                     <- 1. 전역변수 만들고

const handleMouseMove = () => {
    if(controlsTimeout) {                                       <- 3. 요기서 그 값을 이용하면 된다.
        clearTimeout(controlsTimeout);
        controlsTimeout = null;
    }
    videoControls.classList.add("showing");
};

const handleMouseLeave = () => {
    controlsTimeout = setTimeout(                         <- 2. setTimeout의 return값(id값) 받고
        () => {
            videoControls.classList.remove("showing");
        }, 2000);
};

video.addEventListener("mousemove", handleMouseMove);
video.addEventListener("mouseleave", handleMouseLeave);
***************************************************************************************************************************************



# Controls Events part Two

이제 마우스가 멈추는걸 감지할거다.
마우스가 비디오안에서 계속 움직이면 컨트롤러를 띄우지만 멈추고 2초지나면 컨트롤러가 사라지게할거다.

근데 "mousestop" 이라는 event는 없으므로 setTimeout과 clearTimeout을 사용할거다.
매번 마우스가 움직일 때 마다 setTimeout을 시작시킬거다. 그리고 이 setTimeout은 마우스를 사라지게해주는 역할을 할거다.
그리고 마우스가 계속 움직이면 setTimeout을 취소시킬거다.
이건 아주 빨리 일어날거고 handleMouseMove function에서 수행시킬거다.

다시말해, 마우스를 비디오안으로 들여보내고 비디오안에서 마우스가 움직이기 시작하면 timeout을 시작할거고
그 timeout은 2초뒤에 컨트롤들을 숨길거다.
그리고 마우스를 움직일 때 clearTimeout도 같이 시작하게 할거다.


***************************************************************************************************************************************
(videoPlayer.js)

let controlsMovementTimeout = null;

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {                 <- 마우스를 움직이면 이 function은 연속적으로 계속 호출된다.
    if(controlsTimeout) {
        clearTimeout(controlsTimeout);
        controlsTimeout = null;
    }
    if(controlsMovementTimeout) {               <- 움직임을 멈추면 실행되지 않는다.
        clearTimeout(controlsMovementTimeout);  <- 움직임을 멈추면 요게 실행되서 타임아웃이 취소되지않고 2초 지나면 hideControls가 실행되는거임.
                                                <- 근뎨 게속 움직이면 밑에서 계속 새로 만들고 여기서 계속 새로 지우는거다.
        controlsMovementTimeout = null;
    }
    videoControls.classList.add("showing");
    controlsMovementTimeout = setTimeout(hideControls, 2000);      <- 마우스을 계속움직이면 새로운 timeout이 계속 생겨나는거다.
};
***************************************************************************************************************************************


!! querySelector를 사용하면 무조건 첫번째거를 가져온다 !!

스스로 해결해보자.
1. videoContainer 이쁘게 꾸미자.
2. 비디오를 클릭했을 때 재생과 멈춤이 가능하게 하자
3. 스페이스바로 재생과 멈춤이 가능하게 하자.




# Register View Controller

영상 조회수 기록하자.
더이상 백엔드에서 템플릿을 렌더링하는게 아니라 api를 이용해서 템플릿을 보여주게 할거다.
요즘시대방식인거지

API는 프론트엔드와 백엔드가 서버를 통해 통신하는 방법을 말한다.

일단 apiRouter.js를 만든다.
api는 백엔드가 템플릿을 렌더링하지 않을 때 프론트와 백엔드가 통신하는 방법을 말한다.


***************************************************************************************************************************************
(apiRouter.js)

import express from "express";

const apiRouter = express.Router();

export default apiRouter;
***************************************************************************************************************************************

위와같이 기본구성을 짜고 이제 이 Router에 뭘 해줘야할까
우리는 유저가 영상을 시청하면 백엔드에 요청을 보낼건데
이 요청으로는 URL을 바꾸지 않을거다.
 -> 요청을 보내더라도 URL을 바꾸지 않고 템플릿을 렌더링하지 않겠다는거다.
Javascript로 요청을 보내볼건데 자세한건 차차 알아보기로하고

아무튼 이 요청은 백엔드에 조회수 +1을 하게할거다.

처음으로 form을 이용하지 않는 POST 요청이다.

***************************************************************************************************************************************
(apiRouter.js)

import express from "express";

const apiRouter = express.Router();

apiRouter.post("videos/:id([0-9a-f]{24})/view")

export default apiRouter;
***************************************************************************************************************************************

apiRouter.post("videos/:id/view") 이렇게 경로를 지정해주면
전체 URL이 localhost:4000/api/videos/:id/view 가 된다.

여기에 POST 요청을 보내주면 조회수를 기록하게 만들어줄거다.

아 근데 video id는 구분해줘야하니까 정규표현식 추가하자.
    -> apiRouter.post("videos/:id([0-9a-f]{24})/view")

그다음 이제 controller를 추가해줄건데 여기에는 video를 다루는 controller가 필요하니까
videoController.js 에 만들고 가져올거다.

***************************************************************************************************************************************
(apiRouter.js)

import express from "express";
import { get } from "mongoose"
import fetch from "node-fetch"
import { render } from "pug"
import webpack from "webpack"
import { registerView } from "../controllers/videoController";
import Video from "./models/Video"

const apiRouter = express.Router();

apiRouter.post("videos/:id([0-9a-f]{24})/view", registerView);

export default apiRouter;
***************************************************************************************************************************************

이제 registerView 컨트롤러를 가지고 뭘할거냐면
우선 video id를 가지고 video를 가져올거다.

이 컨트롤러는 페이지를 렌더링하지 않는다.
apiRouter.post("videos/:id([0-9a-f]{24})/view", registerView); 이건 프론트엔드에서
자바스크립트로 호출하는 URL인데 URL을 바꾸지 않는다.
이말은 어디에서나 접근할 수 있다는 말이다.
그리고 우리는 템플릿을 렌더링할 필요가 없다.
백엔드에 정보를 전송하고 처리하는것 뿐이니까
그래도 백엔드가 이요청에 대한 응답으로 뭘 줄지는 정해야하는데

템플릿을 렌더링하지 않으면 뭘 할 수 있을까
뭘하냐면 res.status() 를 리턴할 수 있다.
그리고 status코드를 보내게 할수 있다.
이게 다다.

즉 만약 아래의 컨트롤러에서 비디오를 찾지 못할경우 res.status를 return하면 된다는 말이다.

근데 비디오가 있으면 그 비디오를 update하면 된다.
그리고 video 업데이트 후 성공이다라는 상태코드 200 을 날려주면 끗.
아래코드 참고

***************************************************************************************************************************************
(videoController.js)

export const registerView = async (req, res) => {
    const {id} = req.params;
    const video = await Video.findById(id);
    id(!video) {
        res.status(404);
    }
    video.meta.views = video.meta.views + 1;
    await video.save();
    return res.status(200);
};
***************************************************************************************************************************************

자 그럼 이제
apiRouter.post("videos/:id([0-9a-f]{24})/view", registerView);
요기에서 저 URL 을 프론트엔드에서 호출해야한다.

우리는 보통 브라우저에서 URL 을 호출하는것에 익숙하다.
그냥 주소창에 URL 을 치면 되니까 그리고 그러면 백엔드의 컨트롤러를 실해시키니까

그런데 이번에는 이런 이동 없이 URL을 호출하는 방법을 사용해볼거다.
interactive하게 만들 수 있는 가장 기본적인 방법이다.

interactivity는 URL 이 바뀌지 않아도 페이지에 변화가 생기는걸 말한다.
예를들어 댓글달아도 URL 이 안바뀌는거지. 아주 신기하지

지금 우리가 PUG 를 사용하는건 아주 interactive하지 않다.
왜냐하면 URL 을 바꿔줘야 하니까

URL 을 바꾸면 백엔드가 뭔가 하지?
URL 을 바꾸는게 백엔드가 강제로 뭔가 하게 만들 수 있는 유일한 방법이니까

이번에는 클라이언트에서 자바스크립트로 URl에 요청하는걸 만들어 볼거다.
브라우저의 주소창을 이용하는게 아니라 자바스크립트를 이용해서!!
아주 신난다.


# Register View Event

이제 videoPlayer.js 에서 이벤트를 하나 추가해줄거다.

지금 추가하려는 이벤트는 유저가 비디오시청을 끝냈을 때 생기는 이벤트이다.
video element만 쓸수있는 event이다.
(timeUpdate 이벤트처럼 비디오에서만 쓸수있는것)

그 이벤트는 바로 "ended" 라는 이벤트이다.
이 "ended" 이벤트를 사용해서 handleEnded 라는 함수를 작동시킬거다.

즉 이 "ended" 이벤트가 발생했을 때 백엔드에 요청을 보내는거다.
백엔드에 요청을 보낼때는 fetch 를 쓰면 된다
    -> fetch 추가 공부 필요

fetch에 http://localhost:4000
없이 바로 "/" 로 시작하면 우리 웹사이트에 요청을 보낼수있다.

***************************************************************************************************************************************
(videoPlayer.js)

const handleEnded = () => {
    fetch("/api/videos/우리비디오id/view")
}
***************************************************************************************************************************************

자 근데 우리가 프론트엔드에서 어떻게 video id 를 알 수 있을까
그래서 이 템플릿을 렌더링하는 pug한테 비디오에 대한 정보를 남기라고 말해줘야한다.
프론트엔드에서 자바스크립트가 알 수 있도록 말이다.

자 그럼 watch.pug에서 알려줘야겠지
왜냐하면 이 pug코드가 백엔드에 의해 컴파일되서 video object를 만들고있기 때문이다.

뭐 span으로 video.id를 넣어도 되겠지만 프론트엔드에 video.id를 넣는건 별로 좋은 방법이 아니다.

가장 좋은 방법은 우리가 직접 데이터를 만들어서 HTML 에 저장하는거다.
바로 data attribute를 이용해서 말이다.

자 그럼 이제부터 HTML element에 커스텀 데이터를 저장하는방법을 알아보자

어떻게 할거냐면 pug한테 video.id의 정보를 HTML 의 어딘가에 저장하라고 알려줄거다.
  -> 자바스크립트가 알수있게 하기 위함이란걸 잊지 말자.

와 HTML 에
<article>
data-어쩌고 = "저쩌고"
</article>

라고 적으면

Javascript에서
article.dataset.어쩌고 를 통해서 "저쩌고" 를 가져올수가 있다.

아주 신기하다.

이런식으로 HTML element에 데이터를 저장할 수 있는거다.

span을 사용해서 유저에게는 보이지않게 id를 저장할 수는 있는데 이건 별로 좋은 방법이 아니다.
대신 data attribute를 사용하는게 좋다. 아주 좋다.
그리고 이 data attribute는 내가 원하는 어떤 데이터든지 저장할수있따. 진짜 아무거나
이걸 사용해서 pug가 렌더링할 때 데이터를 저장하도록 만들 수 있다.
그러면 우리는 자바스크립트로 그 데이터를 가져오는거지
이것이 백엔드와 프론트엔드가 데이터를 공유하는 가장 쉬운 방법이다.

***************************************************************************************************************************************
extends base.pug

block content
        #videoContainer(data-id = video.id)        <- 여기다 여기다 추가하는거다!!
            video(src="/" + video.fileUrl)
            div#videoControls
                button#play Play
                button#mute Mute
                input(type="range", step="0.1", value=0.5, min="0", max="1")#volume
                div
                    span#currentTime 00:00
                    span /
                    span#totalTime 00:00
                div
                    input(type="range", step="1", value=0, min="0")#timeline
                div
                    button#fullScreen Enter Full Screen
block scripts
    script(src="/static/js/videoPlayer.js")
***************************************************************************************************************************************


자 이제 그럼 아래처럼 하면 비디오시청완료 이벤트가 발생하면
우리는 video의 id를 알아서 해당 URL 에 요청을 보낼수가 있게 되었다.


***************************************************************************************************************************************
(videoPlayer.js)

const handleEnded = () => {
    const { id } = videoControls.dataset;       <- 요기서 vide의 id를 가져올수있는거다.
    fetch(`/api/videos/${id}/view`);
}
***************************************************************************************************************************************

근데 위처럼 그냥 저렇게 URL 만 적으면 그냥 GET 요청을 보내는거다.
근데 우린 그게 아니지
우리는 apiRouter에 POST 요청을 받도록 만들었으니까
그러면 우리는 저기 fetch에 method만 추가해주면 된다.
아래처럼

***************************************************************************************************************************************
(videoPlayer.js)

const handleEnded = () => {
    const { id } = videoControls.dataset;
    fetch(`/api/videos/${id}/view`, {
        method: "POST",                     <- 여기다 추가해준거여! 그럼 이제 저 URL 로 POST 요청을 보내는거여
    });
}
***************************************************************************************************************************************


자 근데 안돼
크롬 개발자도구의 Network 를 확인해보니 내가 보낸 POST 요청이 계속 pending(보류중)이다.
이건 계속 연결중인거다. 즉 백엔드와의 연결이 끝나지가 않고 있는거다.
왤까?
문제는 우리가 상태코드를 보내지 않아서 이다.

그냥 res.status() 해준다고 보내주는게 아니다.
이건 응답에 그냥 상태코드를 추가하기만 해준것이다.
예전거 보면 res.status().render() 로
상태코드를 추가하고 결국엔 렌더링을 해줬자나

그냥 응답에대한 상태코드를 설정해주는것일 뿐이야
즉, 아무것도 return해주지 않은거다.

뒤에 render() 같은것들을 해줘야 status()를 추가해준게 의미가 있어지는거다
그래야 저 상태코드를 가지고 렌더링을 해준다는 의미가 되는거다.

이럴땐 그냥 res.status() 가 아니가
res.sendStatus() 를 써줘야 한다.
이렇게 해야만 연결을 끝낼수가 있다.

자 지금까지 웹사이트에 상호작용을 추가해봤다.
URL 을 바꿀 필요도 없고, 아무것도 클릭할 필요가 없다.
이벤트가 발생할 때 까지 기다리면 Javascript가 백엔드에 요청을 보내는거다.



# Recorder Setup

비디오 녹화하는거 만들어 봅시다잉
5초 제한두고 -> 5초 지나면 녹화된 비디오 다운받고 -> 내가만든 upload를 통해 비디오 업로드 하게하는것

recorder.js 라고 하나 만들고
webpack.config.js 에 recorder.js 추가해주고 시작한다.

recorder는 upload하는 페이지에서만 작동하므로 upload.pug에 scripts block을 이용해서 recorder.js 를 import 시킨다.

***************************************************************************************************************************************
(upload.pug)

extend base.pug

block content
    if errorMessage
        span=errorMessage
    form(method="POST", enctype="multipart/form-data")
        label(for="video") Video File
        input(type="file", accept="video/*", required, id="video", name="video")
        input(placeholder="Title", required, type="text", name="title", maxlength=80)
        input(placeholder="Description", required, type="text", name="description", minlength=2)
        input(placeholder="Hashtags, seperated by comma.", required, type="text", name="hashtags")
        input(type="submit", value="Upload Video")

block scripts
    script(src="/static/js/recorder.js")            <- 요거 추가해준거여 아주 기본적인거지 이제 이런건 적기도 민망할정도
***************************************************************************************************************************************


자 그럼 이제 녹화버튼을 만들어볼건데
녹화된 내용을 div 태그에 담아줄거다.

***************************************************************************************************************************************
extend base.pug

block content
    button#startBtn Start Recording     <- 이거다 그냥 버튼하나 추가해준거다.
    if errorMessage
        span=errorMessage
    form(method="POST", enctype="multipart/form-data")
        label(for="video") Video File
        input(type="file", accept="video/*", required, id="video", name="video")
        input(placeholder="Title", required, type="text", name="title", maxlength=80)
        input(placeholder="Description", required, type="text", name="description", minlength=2)
        input(placeholder="Hashtags, seperated by comma.", required, type="text", name="hashtags")
        input(type="submit", value="Upload Video")

block scripts
    script(src="/static/js/recorder.js")
***************************************************************************************************************************************

늘 그랫듯 getElementById("") 를 통해서 javascript로 startBtn을 가져오고
addEventListener("click", asdasd) 를 통해 함수를 실행시킬거다.

근데 이번에 사용하려는 함수는 사용자의 navigator에서 카메라와 오디오를  가져다 줄거다.
정말이란다.

navigator.mediaDevice.getUserMedia(constraints);
라는건데 뭐 어떻게 쓰는지는 이제부터 한번 아라보자.

근데 이거가 실행되기까지 시간이 좀 걸린다.
왜냐면 카메라 사용여부랑 마이크사용여부 같은걸 물어봐야 하기 때문이다.

그러면 당연히 async, await 를 써주어야 하겠지 아주 당연히(아니면 promise를 써도됨. 근데 어려워서 시름)

자 그럼 getUserMedia 라는 함수를 호출하면 stream을 불러올거다.
데이터의 stream 이다.(비디오랑 오디오)

그리고 이 함수는 constraints라는 객체를 argument로 받는다.
constraints 객체는
{ audio : true, video : true }
이거다.

{ audio : true,
  video : {
    width: ,
    height: ,
  }
}


이게 될수도 있다.
뭐 아무튼 오디오랑 비디오 데이터에 대한 뭔가 뭐 설정해주는거다.

일단 우리는 그냥
{ audio : true, video : true }
이거 쓸거임.

***************************************************************************************************************************************
(recorder.js)

const startBtn = document.getElementById("startBtn");

const handleStart = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    console.log(stream);
};

startBtn.addEventListener("click", handleStart);
***************************************************************************************************************************************


자 그럼 요렇게 아주 심플하게 만들어주면
에러가 뜨지.

***************************************************************************************************************************************
recorder.js:8 Uncaught ReferenceError: regeneratorRuntime is not defined
    at eval (recorder.js:8:46)
    at eval (recorder.js:35:2)
    at Object../src/client/js/recorder.js (recorder.js:18:1)
    at recorder.js:29:61
    at recorder.js:31:12
***************************************************************************************************************************************

이게 뭘까
이게 뭔가..?

이게 뭐냐면 프론트엔드에서 async 와 await 를 쓰려면
regeneratorRuntime 을 설치해야하는디 그걸 안해서 그런거다.

그냥 설치하면 되는겨

$ npm i regenerate

그리고 import 하면되는겨

***************************************************************************************************************************************
(recoeder.js)

import regeneratorRuntime from "regenerator-runtime";   <- 이렇게 import 하면됨 그럼 에러 안뜸. 왼쪽 저거도 npm 사이트에 다 나와있음
const startBtn = document.getElementById("startBtn");

const handleStart = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    console.log(stream);
};

startBtn.addEventListener("click", handleStart);
***************************************************************************************************************************************

아 근디 recoeder.js에만 넣기보다는 그냥 main.js에 넣는게 좋겠다.
여기서만 쓰는것도 아니니까

그러면 main.js에다 import하고 main.js를 모든 script에다가 추가하면 되겠다.
그러면 base.pug에 scripts 블록에 추가하면 되겠쥬

***************************************************************************************************************************************
doctype html
html(lang="ko")
    head
        title #{pageTitle} | #{siteName}
        link(rel="stylesheet", href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css")
        link(rel="stylesheet", href="/static/css/style.css" )
    body
        include partials/header
        main
            block content
        include partials/footer.pug
    script(src="/static/js/main.js")    <- 여기다 넣어주면 모든 프론트엔드 자바스크립트에서 사용 가능
    block scripts
***************************************************************************************************************************************



# Video Preview

현재까지 정리
    Start Recording 버튼을 누르면 navigator의 mediaDevices API 를 호출한다.
    -> navigator 의 기능은 현재 머무르고 있는 브라우저의 정보를 얻을 수 있는 엘리먼트 이다.

    그리고 mediaDevices API 안에는 getUserMedia 라는 function이 있다.
    만일 사용자가 요청을 수락하게되면 stream을 받아온다.

콘솔창에서 받은 mediaStream을 확인할 수 있다.
콘솔창에서 확인하는 이 mediaStream은 물론 나한테 어떠한 것도 주지 않는다.
콘솔에서 비디오를 볼수있는거도 아니다.

허지만 카메라에 잡힌 부분을 미리보기 할 수 있게 된다.

요걸 위해서 video element를 추가해줄거다.
요렇게 해서 카메라로부터 얻은 stream을 video element에 담아볼거다.
upload.pug 에 일단 video element 추가하고 #preview 라고 id를 붙여준다.

***************************************************************************************************************************************
(upload.pug)

extend base.pug

block content
    video#preview                   <- 요거여! 근데 src는 지정을 안해줬지?
    button#startBtn Start Recording
    if errorMessage
        span=errorMessage
    form(method="POST", enctype="multipart/form-data")
        label(for="video") Video File
        input(type="file", accept="video/*", required, id="video", name="video")
        input(placeholder="Title", required, type="text", name="title", maxlength=80)
        input(placeholder="Description", required, type="text", name="description", minlength=2)
        input(placeholder="Hashtags, seperated by comma.", required, type="text", name="hashtags")
        input(type="submit", value="Upload Video")

block scripts
    script(src="/static/js/recorder.js")
***************************************************************************************************************************************

upload 할 때는 src가 필요없다.
왜냐하면 javascript의 함수가 video src를 줄것이기 때문이다.

이전에 우리가 받은 strem을 가져다가 video element의 내부에 넣을거다.


***************************************************************************************************************************************
(recoeder.js)

const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");            <- upload.pug의 #preview 가져오고

const handleStart = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    console.log(stream);
    video.srcObject = stream;                        <- 받은 stream을 video.srcObject에 넣어주고(그냥 src가 아니여 stream이 객체니까)
    video.play();                                    <- video play 한다.
};

startBtn.addEventListener("click", handleStart);
***************************************************************************************************************************************


이렇게 src가 없는 video를 upload.pug 에 만들었고,
우리는 받아놓은 stream이 있으니까, srcObject에 stream을 추가하고 vidoe를 재생하게된다.

와 된당! 신기하당!

자 우리는 stream을 가져오고 있고 video에 srcObject를 부여하고 있다.
됴대체 srcObject가 뭐징
srcObject는 video가 가질수 있는 무언가를 의미한다.

stream을 위해 srcObject를 쓰는거고 그래서 video가 재생되는거다. 
그말은, stream은 실시간으로 재생되는 무언가라는 의미다. 

그래서 브라우저에서 실시간으로 움직이는거를 받아올수 있는거다. 
왜냐하면 카메라가 stream을 받아오고, 그걸 video 요소에 담아주기 때문이다. 

srcObject는 mediaStream, mediaSource, Blob, File 을 실행할 때
video에게 주는 무언가를 의미하기도 한다.

HTML 요소인 src와는 다른거다.
URL 에서는 src를 쓴다... 끗.?

HTMLMediaElement srcObject

HTMLMediaElement 인터페이스의 srcObject 속성은 HTMLMediaElement와 연결된 미디어의 소스 역할을 하는 객체를 설정하거나 반환합니다.
그 객체는 MediaStream, MediaSource, Blob 또는 파일(Blob에서 상속됨)일 수 있습니다.


!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
blob은 Binary Large Object의 약자입니다.
이름에서 바이너리 형태로 큰 객체를 저장할 것이라는 것을 추측할 수 있습니다. 여기서 이 큰 객체라는 것은
주로 이미지, 비디오, 사운드 등과 같은 멀티미디어 객체들을 주로 가리킵니다
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

# Recording Video

이제 stream을 녹화해 볼거다.
우리는 stream을 가져오고 있으니까, stream은 어찌보면 0과1로 이루어진 흐르는 강물과도 같다.
그리고 그걸 전부 비디오미리보기에 넣은거고

그리고 우린 그걸 녹화해볼거고 이 때 사용하는게 MediaRecorder function이다.

자 그전에 우리는 진짜 미리보기로 만들거고 녹화는 따로 할거다.
그러면 우리는 따로 버튼을 누르지 않아도 upload.pug로 오면 알아서 비디오가 브라우저에 보이게 만들어줄거다.

***************************************************************************************************************************************
(recorder.js)

const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

const handleStart = () => {
        여기가 레알 녹화가 진행되는 부분
};

const init = async () => {                                                          <- 요거는 그냥 미리보기 함수
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.play();
};

init();                                                                 <- 계속 실행시킴으로서 미리보기는 계속 나오게

startBtn.addEventListener("click", handleStart);
***************************************************************************************************************************************

순서는
stream을 가져오고 미리보기로 보여주고 그다음에 버튼을 누르게 되면 녹화를 하는것이다.

그전에 버튼 누르면 "Start Recording"  <-> "Stop Recording"
왔다갔다하게 만들어야하는데 아래처럼 코드를 짜주게 되면
처음으로 startBtn을 누르면 handleStart라는 function을 실행하게 된다.
handleStart가 호출되면 startBtn의 텍스트부분을 바꾸고
그다음 handleStart는 EventListener를 제거할거다.
그다음 새로운 EventListener를 추가해줄건데, 이번에는 handleStop이 될거다.

마찬가지로 handleStop도 정반대지만 동일한 로직으로 움직이게 된다.

즉, 버튼의 EventListener를 클릭할 때 마다 지우고 새로 추가해주는 개념인거다.

***************************************************************************************************************************************
(recorder.js)

const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

const handleStop = () => {
    startBtn.innerText = "Start Recording";
    startBtn.removeEventListener("click", handleStop);
    startBtn.addEventListener("click", handleStart);
};

const handleStart = () => {
    startBtn.innerText = "Stop Recording";
    startBtn.removeEventListener("click", handleStart);
    startBtn.addEventListener("click", handleStop);
};

const init = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.play();
};

init();

startBtn.addEventListener("click", handleStart);
***************************************************************************************************************************************

자 이제 녹화기능을 구현할거고 MediaRecorder를 사용해볼거다.
MediaRecorder는 비디오든 오디오든 녹화하고 싶은걸 모두 녹화시킬 수 있다.

사용방법은 아주 간단하다.

MediaRecorder를 만들고 여기에 stream을 전달하기만 하면 된다.

우리는 버튼을 클릭하는 순간 녹화를 시작할거니까
handleStart function에다가 녹화기능을 넣어주면 된다.

근디 stream은 init함수 안에만 있는디?
근디 function은 바깥에서 변수를 가져올 수 있다.
하지만 다른 function에서 직접 가져다 쓸수는 없다.

그러니 stream을 전역변수로 선언해주고 init function에서 stream을 넣어주면
handleStart function에서 stream을 가져다 쓸수 있다. 이제 stream은 전역변수니까!

그러믄 우리는 MediaRecorder에다가 stream을 받은 후 생성자를 통해 객체를 생성하여 recorder에 넣어주고
이 recorder의 start() 메소드를 실행해주면 녹화가 된다.

***************************************************************************************************************************************
(recorder.js)

const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;

const handleStop = () => {
    startBtn.innerText = "Start Recording";
    startBtn.removeEventListener("click", handleStop);
    startBtn.addEventListener("click", handleStart);
};

const handleStart = () => {
    startBtn.innerText = "Stop Recording";
    startBtn.removeEventListener("click", handleStart);
    startBtn.addEventListener("click", handleStop);
    const recorder = new MediaRecorder(stream);
    recorder.start();
};

const init = async () => {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.play();
};

init();

startBtn.addEventListener("click", handleStart);
***************************************************************************************************************************************

근디 이게 그냥 되는게 또 아니여
우리는 MediaRecorder event를 사용을 해야한다.
이거 event 사용안해주면 위에다가 한거 다 무용지물이다.

우리는 dataavailable event를 사용할거다.

recorder.stop() 을 호출하여 녹화가 중단 될 때는 저장된 데이터의 최종 video를 담은 dataavailable event가 발생된다.
그리고 이 event는 최종 비디오 파일과 함께 딸려나온다.
그래서 우리는 ondataavailable handler에 event를 등록해줘야한다.

    MediaRecorder.ondataavailable
    datavailable 이벤트의 이벤트핸들러


작동 구성
1. 녹화 시작 <- handleStart function의 recorder.start() 사용
2. 5초 후 recorder.stop() 을 사용하여 녹화 중지
3. 녹화 중지 후 dataavailable event 발생
4. ondataavailable handler를 통해 dataavailable event 캐치
5. ondataavailable handler = recorder.ondataavailable = (event) => {}; 에서 event로 data property를 가진 Blob Event를 받음.
6. data를 받으면 사용자가 다운로드 받을수 있음

***************************************************************************************************************************************
(recorder.js)

const handleStart = () => {
    startBtn.innerText = "Stop Recording";
    startBtn.removeEventListener("click", handleStart);
    startBtn.addEventListener("click", handleStop);
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event) => {
        console.log("recording done");        <- 3)
        console.log(event);                   <- 4)
        console.log(event.data);              <- 5)
    };
    console.log(recorder);  <-1)
    recorder.start();
    console.log(recorder);  <-2)
    setTimeout(()=> {
        recorder.stop()
    }, 5000);
};
***************************************************************************************************************************************

위의 코드를 녹화시키면 브라우저의 콘솔창에는 아래와 같이 결과값이 나온다.
1),2),3),4),5) 의 console.log 임을 참고하자.

1) MediaRecorder {stream: MediaStream, mimeType: '', state: 'inactive', onstart: null, onstop: null, …}
-> inactive 였던게

2) MediaRecorder {stream: MediaStream, mimeType: '', state: 'recording', onstart: null, onstop: null, …}
-> recording 녹화중으로 바뀌고

3) recording done
-> 녹화가 끝나고

4) BlobEvent {isTrusted: true, data: Blob, timecode: 1647610247019.5752, type: 'dataavailable', target: MediaRecorder, …}
-> 우리가 얻은 event이다. 뭐 여기있는거 그닥 별로 안중요하다. 중요한건 그안의 data이다.

5)  -> 여기의 event.data 가 우리의 비디오다.
Blob {size: 140379, type: 'video/x-matroska;codecs=avc1'}
size: 140379
type: "video/x-matroska;codecs=avc1"
[[Prototype]]: Blob

이제 이 한줄로인해 받은 비도오가 있고 이걸로 사용자의 컴퓨터에 다운로드 받는 기능을 구현할것이다.



# Recording Video part Two

5초뒤에 녹화중지가 되는게 아니라 녹화중지 버튼을 누르면 녹화가 중지되게 바꿔줄거다.

recorder를 전역변수로 빼주고 handleStop() 에 recoder.stop() 을 넣어주면 된다.

***************************************************************************************************************************************
(recorder.js)

let stream;
let recorder;           <- 전역변수로 뺴주고

const handleStop = () => {
    startBtn.innerText = "Start Recording";
    startBtn.removeEventListener("click", handleStop);
    startBtn.addEventListener("click", handleStart);

    recorder.stop();                <- 녹화중지되게 해주고
};

const handleStart = () => {
    startBtn.innerText = "Stop Recording";
    startBtn.removeEventListener("click", handleStart);
    startBtn.addEventListener("click", handleStop);
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event) => {
        console.log(event.data);
    };
    recorder.start();
};
startBtn.addEventListener("click", handleStart);
***************************************************************************************************************************************

이제 "Stop Recording" 버튼을 누르면 event.data를 얻을수 있게되었따.
event.data에서 우리가 실제로 얻게되는것은 파일이다.

이제 objectUrl이라는걸 만들어 볼거다.



recorder.ondataavailable = (event) => {
    const videoFile = URL.createObjectURL();
    console.log(videoFile);
};

여기서 createObjectURL은 브라우저의 메모리에서만 가능한 URL을 만들어준다.
즉, event.data라는 파일을 브라우저에서만 사용할 수 있으니까
공유를 하도록 만들어줄 필요가 있고 그래서 createObjectURL을 사용한거고
이건 브라우저가 생성하는 URL을 우리애게 주는 역할을 수행한다. 
그리고 이 URL은 파일을 가리키고 있다.
그래서 우린 파일에 접근할 수 있다. 
이 URL은 실제로 백엔드에는 존재하지 않는다. 

console.log(videoFile);로 보게 될 URL은 나의 웹사이트상에서 존재하는 URL처럼 보이지만 실제로는 없다.
단순히 브라우저의 메모리를 가리키기만 하는 URL일 뿐이다.
그냥 파일을 가리키는 URL이다. 라고 생각하면 편하다.

그리고 녹화를 시작/정지 해보며 콘솔창에
blob:http://localhost:4000/e2426853-4e05-4314-afb4-9716dd21bd1b
라는걸 볼수 있는데

이렇게 blob으로 시작하는 URL을 얻게되고, localhost에 독특한 id값이 따라오게 된다.
근데 이 URL을 따라가보면 우리 서버상에는 없다는걸 알 수 있다.

자 정리하자면
blob:http://localhost:4000/e2426853-4e05-4314-afb4-9716dd21bd1b
이건 브라우저에 의해 만들어졌고 접근할 수 있는 파일을 가리키고 있다.
즉, 파일은 브라우저의 메모리상에 있다는 거다.

그러니까 만약 파일을가지고 뭔가를 해보려면
그 파일을 URL에 집어넣어서 접근할 수 있도록 만들어야한다.


그러면 녹화한 파일을 preview에서 반복 재생되게 만들어 보자.

***************************************************************************************************************************************
(recoder.js)

const handleStart = () => {
    startBtn.innerText = "Stop Recording";
    startBtn.removeEventListener("click", handleStart);
    startBtn.addEventListener("click", handleStop);
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event) => {
        const videoFile = URL.createObjectURL(event.data);
        console.log(videoFile);
        video.srcObject = null;   <- stream 들어오던거 멈춰주고
        video.src = videoFile;    <- 녹화한 파일을 HTML video element에 src로 지정해주고
        video.loop = true;        <- 반복되게 해주고
        video.play();             <- 재생
    };
    recorder.start();
};
***************************************************************************************************************************************

video.src = videoFile;
에서의 videoFile 이 URL은 브라우저에서만 만들어졌고, 오직 브라우저상에서만 존재하며
브라우저로 하여금 파일에 접근할 수 있게 만들었다. (그래야 우리도 파일에 접근할 수 있으니까)

URL을 만든것처럼 보이지만 실제론 URL을 만든게 아니다.
브라우저의 메모리상에 파일을 저장해두고, 브라우저가 그 파일에 접근할 수 있는 URL을 주는거다.

blob:http://localhost:4000/e2426853-4e05-4314-afb4-9716dd21bd1b

이거만 보면 뭔가 우리의 localhost에서 호스팅되고 있는거처럼 보이지만
실제론 아니라는거다.

자 이제 녹화한걸 다운로드 받는 기능을 구현해볼거다.

그래서 우리는 "Stop Recording" 버튼을 눌렀을 때
녹화를 멈출것이고 다시 Start Recording 하고싶은것이 아니니 video.innerText를 "Download Recording"으로 바꿔주고

handleDownload라는 function을 만들어서 우리의 PC에 다운로드 해보도록 할거다.

즉, "Stop Recording" 버튼을 누르면, handleStop function의 EventListener를 제거하고
handleDownload function을 위한 EventListener를 추가해볼거다.

다시한번 말하지만
blob:http://localhost:4000/e2426853-4e05-4314-afb4-9716dd21bd1b
이 URL은 브라우저가 파일을 보여주는 방법일 뿐이다.

우리가 브라우저의 메모리에 저장된 그 파일을 미리보거나 보고싶을 때 이 URL 이 필요한거다.

그래서
const videoFile = URL.createObjectURL(event.data);
을 한거다.

브라우저의 메모상에 접근고자 하는 파일이 있고 
이 URL을 통해 접근할 수 있다. 



# Downloading the File

자 이제 다운로드를 해보자 
우리가 만든 이 비디오를 가지고 할 수 있는 것중 하나는 
우클릭으로 비디오 저장하기를 하는거다. 
이걸 사용자가 직접 우클릭으로 하지 않고 따로 가짜 클릭을 만들어서 할거다. 

무슨말이냐면 링크를 걸어주긴 할건데 가짜 링크를 걸어준다는 말이다. 

자 그럼 일단 비디오파일을 공유해줘야한다. 
왜냐하면 비디오 파일은 handleDownload functions에서도 가능해야하기 떄무니다. 

그러면 videoFile을 전역변수로 빼주면 새로만든 handleDownload function에서도 
videoFile URL을 가지게 될수있다. 

a 태그에는 다운로드라는게 있는데 이는 사용자로 하여금 URL을 통해 어디로 보내주는게 아니라 URL을 저장하게 해준다. 
이게 지금 우리가 원하는거지 
a 태그에 다운로드라는 속성을 추가하면 
href로 이동하는게 아니라 곧장 파일을 다운로드 받을 수 있게 해준다. 

***************************************************************************************************************************************
(recorder.js)

const handleDownload = () => {
    const a = document.createElement("a");      <-  여기서 앵커하나 만들고 
    a.href = videoFile;                         <- href 에 녹화한 video 파일의 URL을 넣어주고(브라우저안의 가상 URL, 비디오파일로 갈수있는 URL)
    a.download = "downloadVideo.webm."          <- 다운로드라는 속성을 추가  "downloadVideo.webm" 는 그냥 download할 때 기본으로 저장되는 파일의 이름.형식 이다
    document.body.appendChild(a);               <- HTML에 위까지 만든 a 태그를 추가해준다. 
    a.click();                                  <- 이건 a 태그를 클릭한것처럼 실행시켜주는 메소드.
};
***************************************************************************************************************************************

비디오 다운로드 기능 구현 끗 




# WEBASSEMBLY VIDEO TRANSCODE Introduction 

이번 섹션에서 우리는 FFmpeg를 가지고 녹화한 비디오의 형식을 webm -> mp4 로 변환할거다. 
또한 FFmpeg를 통해 비디오의 썸네일을 추출할거다. 

FFmpeg는 S/W 이다. 
비디오나 오디오 같은 미디어파일들을 다룰수가 있다. 
최고란다. 

비디오 캡쳐뜨고 뭐 편집하고 오디오만 추출하고 뭐 아무튼 어지간한거 다 할 수있는 아주 좋은 S/W 라고 하네.
C언어로 만들어 졌다. 

매우빠르고 거의 모든 프로그래밍 언어에서 사용할 수 있다. 
또한 나의 콘솔에서 설치할 수 있다. 

1. FF는 컴퓨터에 설치할 수 있는 놀라운 소프트웨어 이고 비디오로 할 수 있는 대부분의 것을 할수있게한다. 
2. FF를 실행하려면 백엔드에서 실행해야만 한다. 근데 그건 비싸다. 
    -> 예를들어 1GB짜리 영상이고 그걸 편집해야한다고하면 그걸 백엔드가 처리해야하고 어우 뭐 그래픽카드도 필요하고 서버 용량도 많이 필요하고 아무튼 뭐 필요한게 많다. 

이러한 2번의 문제를 해결하기 위해 webassembly라는게 있다. 
webassembly는 개방형 표준이다. 
기본적으로 웹사이트가 매우 빠른 코드를 실행할 수 있게 해준다. 

프론트에서는 세종류의 코드만 사용할 수 있다. -> HTML, CSS, JavaScript 
근데 이 webassembly는 우리가 프론트에서 매우 빠른 코드를 실행할 수 있게 해준다. 

Javascript를 쓰지않고, 다른 종류의 프로그램을 사용할 수 있게해준다. 

물론 나는 여기서 webassembly를 직접 작성하지는 않는다. 
왜냐하면 겁나 복잡하고 어렵기 떄문 
대부분 나는 webassembly로 컴파일 되는 go 또는 Rust를 작성할것이다. 

중요한건 프론트엔드에서 정말 빠른 코드를 실행할 수 있다는거다. 
 = 실행비용이 큰 프로그램들을 브라우저에서 실행할 수 있다는거다.!

이 webassembly가 나중에 더 고도로 발전되게 된다면 
우리는 포토샵이나 프리미어 프로를 별도로 다운로드 받을 필요 없이 브라우저에서 이모든것들을 할 수 있게 될수도 있는거다. 
뭐 이렇게 무거운 프로그램들을 빠르게 돌릴 수 있게 해주는 역할 이라는거다. 

암튼 이번에 내가 할것은 ffmpeg.wasm 을 사용하는거다. 
ffmpeg.wasm는 비디오를 변환하기 위해 사용자의 컴퓨터를 사용한다. 

실제 유튜브는 업로드된 비디오를 지들 회사의 비싼 서버에서 변환한다. 
근데 내가 할것은 나의 브라우저에서 비디오를 변환하는거다.

즉, 나는 나의 컴퓨터의 처리능력을 사용하는거다. 
나의 서버의 처리능력을 사용하는것이 아니다. 

아니 근데 왜 webm -> mp4 로 동영상 파일 형식을 변화하려 하는가 
그 이유는 모든 기기들이 webm을 이해하지는 못하기 때문이다. 
iOS에서는 webm 비디오를 볼수 없을 수도 있다. 
그래서 mp4로 변환하는 거다. 
mp4는 모든 기기에서 읽을 수 있기 때문이다. 



# Transcode Video 

$ npm i @ffmpeg/ffmpeg @ffmpeg/core
    -> ffmpeg 다운

***************************************************************************************************************************************
(recorder.js)
import { vreateFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';    <- ffmpegimport

const handleDownload = async () => {
    const ffmpeg = createFFmpeg({ log: true });              <- ffmpeg instance 생성 
    awiat ffmpeg.load();

    const a = document.createElement("a");
    a.href = videoFile;
    a.download = "downdloadVidoe.webm"
    document.body.appendChild(a);
    a.click();
};
***************************************************************************************************************************************

{log: true} 를 사용한 이유는, 무슨일이 일어나는지 콘솔에서 확인하기 위함. 
ffpmeg.load를 await하는 이유는, 사용자가 소프트웨어를 사용할 것이기 때문이다. 

중요한거다. 
사용자가 javascript가 아닌 코드를 사용하는거다. 무언가를 설치한 후에 말이다. 
우리 웹사이트에서 다른 소프트웨어를 사용하는거고 무거울 수 있으니 완전히 로드하는걸 기다려주는거다. 

자 이제 ffmpeg에 파일을 만들어준다. 
ffmpeg.FS()를 통해 만든다. FS = File System
3가지 메소드가 있는데 우리는 그중에 "wtieFile" 을 사용할거다. 

ffmpeg.FS("writeFile") 은 ffmpeg의 가상의 세계에 파일을 생성해준다.
가상의 컴퓨터에 파일을 생성해주는거다. 

이제 파일을 작성할거고 파일의 이름을 전송해야한다. 
그리고 그 이름은 "recording.wenm" 이다. 
이게 우리가 만드는 파일의 포맷이니까. 
그다음 이 ffmpeg.FS 함수에 binaryData function 을 줘야한다. 
ffmpeg의 세계에 가상의 파일을 만드려면 0과1의 정보를 줘야한다. 
그 binaryData는 뭘까 
바로 videoFile이다. 우리의 srcObject 이다. 
이 URl(videoFile)은 영상정보를 가리키고 있다. 

그래서 fetchFile 함수를 사용할거다. 
videoFile은 blob 인걸 잊지 말자. 
이 videoFIle URL 자체가 어떻게보면 파일인거다.

ffmpeg.FS("writeFile", "recording.webm", await fetchFile(videoFile))

자 이렇게 ffmpeg의 세계에 파일을 만든거다. 

하지만 아직 뭐 하는건 없다. 
ffmpeg 명령어를 입력해줘야 한다. 

await ffmpeg.run("내가 원하는 명령어", "내가원하는 파일이름") 를 통해서 명령을 입력할 수 있다. 

await ffmpeg.run("-i", "recording.webm") 
-i 는 input을 나타내고 
recording.webm이라는 파일을 우리가 미리 만들어놨기에 이렇게 쓸수가 있는거다. 

이렇게 써주면 ffmpeg.run은 가상의 컴퓨터에 이미 존재하는 파일을 input으로 받는거다. 

고런 다음에 output으로 "output.mp4" 라고 적어주면 
 -> await ffmpeg.run("-i", "recording.webm", "output.mp4") 
recording.webm -> output.mp4 로 변환되는거다...???

자 이거 중요하다잉. 
recording.webm은 파일이다.  
videoRecorder에서 온 데이터를 가지고, ffmpeg.FS() 를 통해 만들어진 파일이다. 
그리고 recording.webm. input을 받아서 output.mp4로 변환해주는 명령어를 사용했다. 

await ffmpeg.run("-i", "recording.webm", "-r", "60", "output.mp4") 
     -> 이거 "-r" 이랑 "60" 은 초당 60프레임으로 인코딩해주는 명령어 일단 그렇게 알고 넘어가자. 더 빠른 영상인코딩을 가능하게 해주는거임. 


자 그럼 여기까지 만들어 놓고 
이 모든게 handleDown 함수를 사용하면 동작하는거라는걸 잊지 않고.
"Start Recording" -> "Stop Recording" -> "Download Recording"
해주면 자 이제 손나 많은것들이 콘솔창에서 보이게 될텐데 

막 인코딩을 존나게 할거고 그게 끝나면 뭐 아무일도 없을거다. 
아직 output을 가지고 뭐 하는게 없으니까 
똑같이 그냥 webm 파일이 다운로드된다. 

아무튼 뭐 이제 가상의 파일시스템에 output.mp4 라는 파일이 있다. 
이제 이걸 가지고 뭐 사부작사부작 해볼거다. 
기억해야 할것은 여기서는 브라우저가 아닌 나의 컴퓨터가 작업하는것처럼 하고있다는것. 


!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
1. http://localhost:4000/node_modules/@ffmpeg/core/dist/ffmpeg-core.js 404 (Not Found) 또는
createFFmpegCore is not defined 오류 해결 방법
(@ffmpeg/ffmpeg": "^0.10.0 이상으로 진행시)

위와 같은 오류가 뜨시는 분들은 http://localhost:3000/node_modules/@ffmpeg/core/dist/에서 ffmpeg-core.js, ffmpeg-core.wasm, ffmpeg-core.worker.js파일들을 찾지 못해 생기는 에러이기 때문에 아래와 같이 corePath를 지정해주시면 됩니다.
https://github.com/ffmpegwasm/ffmpeg.wasm#why-it-doesnt-work-in-my-local-environment
```
createFFmpeg({
corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
log: true
});
```

(위의 1번 다른 해결 방법)
기존 FFmpeg를 삭제하시고, 다운그레이드된 버전으로 설치하시면 됩니다.
npm i @ffmpeg/ffmpeg@0.9.7 @ffmpeg/core@0.8.5

2. Uncaught (in promise) ReferenceError: SharedArrayBuffer is not defined 오류 해결 방법
FFmpeg를 실행했을 때, 콘솔창에 위와 같은 오류가 난다면 server.js에 app.set()아래에 함수를 추가해주시면 됩니다.

오류 원인 : SharedArrayBuffer는 cross-origin isolated된 페이지에서만 사용할 수 있습니다. 따라서 ffmpeg.wasm을 사용하려면 Cross-Origin-Embedder-Policy: require-corp 및 Cross-Origin-Opener-Policy: same-origin를 header에 설정해 자체 서버를 호스팅해야 합니다.
https://github.com/ffmpegwasm/ffmpeg.wasm/issues/263

// server.js
```
app.use((req, res, next) => {
res.header("Cross-Origin-Embedder-Policy", "require-corp");
res.header("Cross-Origin-Opener-Policy", "same-origin");
next();
});
```

FFmpeg Usage
https://github.com/ffmpegwasm/ffmpeg.wasm#usage

FFmpeg API
https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/docs/api.md#api

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!




# Download Transcoded Video 

자 이제 브라우저의 메모리에는 output.mp4라는 파일이 있다. 
우선 이 파일을 불러와야한다. 

const 어쩌고저쩌고 = ffmpeg("readFile", "불러오려는 파일이름")

요렇게 하면 불러와서 "어쩌고저쩌고" 에 들어가게 된다. 

우리 예시는 아래 코드와 같다. 

***************************************************************************************************************************************
(reocorder.j)

const handleDownload = async () => {
    const ffmpeg = createFFmpeg({
        corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
        log: true
        });
    await ffmpeg.load();
    ffmpeg.FS("writeFile", "recording.webm", await fetchFile(videoFile));
    await ffmpeg.run("-i", "recording.webm", "-r", "60", "output.mp4");
    
    const mp4File = ffmpeg.FS("readFile", "output.mp4");

    const a = document.createElement("a");
    a.href = videoFile;
    a.download = "downdloadVidoe.webm"
    document.body.appendChild(a);
    a.click();
};
***************************************************************************************************************************************

자 한번 더 상기해야할것은 브라우저가 아니라 컴퓨터에서 작업하는거랑 비슷한거라는거다. 
파일시스템에 생성된 파일을 읽어들이
그 파일을 console.log(mp4File) 해보면 

이 파일은 Unit8Array(array of 8-bit unsigned integers) 타입이 될거다.
unsigned integer는 앞에 부호가 없는 양의 정수라는 뜻이다. 
대학교 때 배웠던거 까묵지 말자. 

자 그럼
console.log(mp4File)
console.log(mp4File.buffer)
를 해주게 되면 

Uint8Array(34545) [0, 0, 0, 32, 102, 116, 121, 112, 105, 115, 111, 109, 0, 0, 2, 0, 105, 115, 111, 109, 105, 115, 111, 50, 97, 118, 99, 49, 109, 112, 52, 49, 0, 0, 0, 8, 102, 114, 101, 101, 0, 0, 129, 230, 109, 100, 97, 116, 0, 0, 2, 160, 6, 5, 255, 255, 156, 220, 69, 233, 189, 230, 217, 72, 183, 150, 44, 216, 32, 217, 35, 238, 239, 120, 50, 54, 52, 32, 45, 32, 99, 111, 114, 101, 32, 49, 54, 48, 32, 45, 32, 72, 46, 50, 54, 52, 47, 77, 80, 69, …]
recorder.js:45 ArrayBuffer(34545)

콘솔창에 위와같은것들이 뜨는데 

뭐 일단 34545 길이를 가진 배열이 생겼고 이게 내가 만든 영상 파일이다. 
근데 뭐 이거가지고는 아무것도 할 수 가 없겠지. 

그래서 blob을 만들거다. 
blob 은 
blob:http://localhost:4000/e2426853-4e05-4314-afb4-9716dd21bd1b 
요건디 
자바스크립트 세계의 파일과도 같은거다.
파일같은 객체를 만드는 blob이라는 방법이다. 
한마디로 blob은 binary 정보를 가지고있는 파일이른거다. 

이제부터 하는것은 Uint8Array(34545) [0, 0, 0, 32, 102, 116, 121, 112,...] 배열로 부터 
blob을 만들어내는거다. 

Uint8Array로부터 blob을 만들수는 없지만 ArrayBuffer로는 만들 수 있다. 

ArrayBuffer는 뭘까? 
mp4 파일은 Uint8Array 에서 볼수있다시피 존나 뭐 이상한 숫자들의 배열로 이루어져 있다. 
하지만 이 배열들은 실제 파일을 나타내고 있다. 
videoFile을 나타내고 있는거다.

이 배열의 raw data, 즉, binary data에 접근하려면 mp4File.buffer 를 사용해야한다.
buffer는 ArrayBuffer를 반환하고 ArrayBuffer는 raw binary data를 나타내는 object이다.

한마디로 내가 찍은 영상을 나타내는 bytes의 배열이다.

그럼 Unit8Array와 ArrayBuffer에 무슨 의미가 있을까 
Unit8Array는 내가 하고싶은대로 할 수 있는 파일이다. 
bye를 삭제할 수도, 두개의 파일을 하나로 만들수도 뭐 이런것들을 할수 있는 파일. 

하지만 raw data 에 접근하고 싶다면, 실제 파일에 접근하고 싶다면 buffer를 사용해야 한다. 
뭐 겁나 어려운 얘기가 되고있는데, 

결론적으로 binary data를 사용하고 싶다면 buffer를 사용해야한다는 것이다.

이제 실제파일인 blob을 만들거다.(자바스크립트에서 파일같은 객체를 만들려면, blob에 binary를 줘야하는거다.)

***************************************************************************************************************************************
(recorder.js)

const handleDownload = async () => {
    const ffmpeg = createFFmpeg({
        corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
        log: true
        });
    await ffmpeg.load();
    ffmpeg.FS("writeFile", "recording.webm", await fetchFile(videoFile));
    await ffmpeg.run("-i", "recording.webm", "-r", "60", "output.mp4");
    
    const mp4File = ffmpeg.FS("readFile", "output.mp4");

    const mp4Blob = new Blob([mp4File.buffer], { type: "vidoe/mp4" });         <- 요거로 만드는겨. 
    
    const a = document.createElement("a");
    a.href = videoFile;
    a.download = "downdloadVidoe.webm"
    document.body.appendChild(a);
    a.click();
};
***************************************************************************************************************************************

new Blob() 을 통해 blob을 만드는데 blob은 배열안에 배열을 받을 수 있다.
그리고 나서 자바스크립트에게 이건 video/mp4 type의 파일이라고 알려줘야 한다.

자 그럼 new Blob()을 통해 새로운 blob이 생겼다.

자 이전에 우리는 녹화가 끝난후 recorder.ondataavailable = (event) => { ... 에서 
event.data 가 생긴게 있었는데 그 data가 blob이었다. 
그리고 그 data를 우리가 접근할 수 있는 URL에 넣을수 있다는걸 우리는 안다.(URL.createObjectURL(blobData) 사용, 브라우자안에서 파일을 가리키는 마법의 URL 생성)

이게 지금 해야할 일이다. 

이제 webm 형식인 videoFile을 mp4Url 로 바꿀거다.
그리고 파일 형식도 mp4로 바꿀거다.

***************************************************************************************************************************************
(recorder.js)

const handleDownload = async () => {
    const ffmpeg = createFFmpeg({
        corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
        log: true
        });
    await ffmpeg.load();
    ffmpeg.FS("writeFile", "recording.webm", await fetchFile(videoFile));
    await ffmpeg.run("-i", "recording.webm", "-r", "60", "output.mp4");
    
    const mp4File = ffmpeg.FS("readFile", "output.mp4");

    const mp4Blob = new Blob([mp4File.buffer], { type: "vidoe/mp4" });
    
    const mp4Url = URL.createObjectURL(mp4Blob);                        <- 요기서 URL 생성 
    
    const a = document.createElement("a");
    a.href = mp44Url;                                                    <- URL 주소 ffmpeg로 만들어준 새로운 URL 바꿔주고
    a.download = "downdloadVidoe.mp4"                                    <- 파일형식도 mp4로 바꿔준다.
    document.body.appendChild(a);                                       
    a.click();
};
***************************************************************************************************************************************




# Thumbnail

***************************************************************************************************************************************
(recorder.js)

const handleDownload = async () => {
    const ffmpeg = createFFmpeg({
        corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
        log: true
        });
    await ffmpeg.load();
    ffmpeg.FS("writeFile", "recording.webm", await fetchFile(videoFile));
    await ffmpeg.run("-i", "recording.webm", "-r", "60", "output.mp4");

    await ffmpeg.run("-i", "recordomg.webm", "-ss", "00:00:01", "-frames:v", "1", "thumbnail.jpg");
        -> "-ss" 는 원하는 시간대로 가게 한다. 여기서 우리는 1초로 가게한거다.
        -> "frames:v", "1" 는 첫프레임의 스크린샷을 찍어준다. 이동한 시간의 스크린샷 한장을 찍는다고 생각하면 된다. 
        -> 이제 이 스샷찍은걸 "thumbnail.jpg" 라는 output으로 내보내는거다.
            -> 여기서 만든 output은 FS(파일시스템)의 메모리에 만들어지는거다. 


    const mp4File = ffmpeg.FS("readFile", "output.mp4");
    const thumbFile = ffmpeg.FS("readFile", "thumbnail.jpg");
        -> 만든 썸네일파일 읽어오고

    const mp4Blob = new Blob([mp4File.buffer], { type: "vidoe/mp4" });
    const thumgBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });
        -> blob 만들어주고 
    
    const mp4Url = URL.createObjectURL(mp4Blob);
    const thumbUrl = URL.createObjectURL(thumgBlob);
        -> 파일에 접근하기 위한 URL 을 만들어준다. 
    
    const a = document.createElement("a");
    a.href = mp4Url;
    a.download = "downdloadVidoe.mp4"
    document.body.appendChild(a);
    a.click();


    const thumbA = document.createElement("a");
    thumbA.href = thumbUrl;
    thumbA.download = "thunmNail.jpg"
    document.body.appendChild(thumbA);
    thumbA.click();
        -> thumbnail img 파일을 다운로드해준다. 

};
***************************************************************************************************************************************






# Thumbnail Upload part One

Video Model에 thumbnail Url 추가해야함. 

***************************************************************************************************************************************
(Video.js)

import mongoose, { mongo } from "mongoose";

const videoSchema = new mongoose.Schema({
    //비디오 형식을 저장하는 구간
    title: { type: String, required: true, trim: true, maxLength: 80},
    fileUrl: { type:String, required: true },
    thumbUrl: { type:String, required: true },                              <- 이거 추가함. 
    description: { type: String, required: true, trim: true, minLength: 2},
    createdAt: { type: Date, required: true, default: Date.now, trim: true},
    hashtags: [{ type: String, trim: true }],
    meta: {
        views: { type: Number, required: true, default: 0, trim: true },
        rating: { type: Number, required: true, default: 0, trim: true }
    },
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

videoSchema.static("formatHashtags", function (potato) {
    return potato.split(",").map((word) => word.startsWith("#") ? word : `#${word}`);
})


const Video = mongoose.model("Video", videoSchema);

export default Video;
***************************************************************************************************************************************

이제 video에 유용하게 사용할 thumbUrl이 생겼다. 
upload.pug에 영상 파일을 위한 input이 있는데 
여기세 썸네일 업로드하는 input을 하나 추가해 줄거다. 

***************************************************************************************************************************************

extend base.pug 

block content  
    video#preview
    button#actionBtn Start Recording
    if errorMessage
        span=errorMessage
    form(method="POST", enctype="multipart/form-data")
        label(for="video") Video File 
        input(type="file", accept="video/*", required, id="video", name="video")
        label(for="thumb") Thumbnail File                                               <- 요기랑
        input(type="file", accept="image/*", required, id="thumb", name="thumb")        <- 요기 그냥 위에 video 해준거랑 똑같이 이름만 바꿔서 업로드칸 만든거임.
        input(placeholder="Title", required, type="text", name="title", maxlength=80)
        input(placeholder="Description", required, type="text", name="description", minlength=2)
        input(placeholder="Hashtags, seperated by comma.", required, type= "text", name="hashtags")
        input(type="submit", value="Upload Video")

block scripts   
    script(src="/static/js/recorder.js")
***************************************************************************************************************************************

근데 조그마한 문제가 하나 있다. 
우리가 route로 두개의 파일을 보낸다는거다.
현재 우리의 videoRouter는 비디오파일만 받을 준비가 되어있다. 
썸네일을 업로드할 준비는 안되어있다.

***************************************************************************************************************************************
(videoRouter.js)

videoRouter.route("/:id([0-9a-f]{24})").get(watch);  
videoRouter.route("/:id([0-9a-f]{24})/edit").all(protectorMiddleware).get(getEdit).post(postEdit); 
videoRouter.route("/:id([0-9a-f]{24})/delete").get(protectorMiddleware, deleteVideo); 
videoRouter.get("/upload", protectorMiddleware, getUpload);
videoRouter.post("/upload", protectorMiddleware, videoUpload.single("video"), postUpload);   <- 봐라 비디오만 받잔여 
***************************************************************************************************************************************




#  Thumbnail Upload part Two

자 이제 파일을 업로드 해볼건데 
이전에 했던거처럼 multer를 사용해야한다.
근디 multer에는 하나만 업로드하는 single만 있는게 아니라 
여러개 업로드할 수 있는 fileds라는것도 있다. 
그리고 그 fields안의 배열에 우리가 업로드하고 싶은것들의 이름을 특정할 수 있다. 

전에는 하나만 받는 single을 썻고, 이 파일은 req.file에 저장됬었다. 
.fields에는 video, thumb같이 form에 있는 파일 name이 들어있는 배열을 쓰면 된다. 

자 그럼 single을 fileds로 바꿔주고 이안에 두개의 객체가 들어간 배열을 넣어준다. 

***************************************************************************************************************************************
(videoRouter.js)

videoRouter.post("/upload", protectorMiddleware, videoUpload.fields([
    { name: "video" },
    { name: "thumb" },
]), 
postUpload
);
***************************************************************************************************************************************

근데 이렇게만 해주면 postUpload 컨트롤러에 에러가 생기신다. 
왜냐면 postUpload는 req.file을 기다리고 있기 때문 

하지만 공식문서를 보면 req.files 를 쓰라고 나와있다.
그래서 req.files 로 아래 처럼 바꿔줘야한다. 
그리고 req.files 안에는 video와 thumb 각각의 객체가 따로 있기 때문에 그것을 별도로 다 받아와야한다. 

req.files를 console.log 해보면 아래와같은 객체안의 배열안의 객체형태이다.


***************************************************************************************************************************************
(req.files)

{
    video: [
      {
        fieldname: 'video',
        originalname: 'downdloadVidoe.mp4',
        encoding: '7bit',
        mimetype: 'video/mp4',
        destination: 'uploads/videos',
        filename: '211b21cc9772f57cdcfe0a9759ccff7a',
        path: 'uploads/videos/211b21cc9772f57cdcfe0a9759ccff7a',
        size: 67558
      }
    ],
    thumb: [
      {
        fieldname: 'thumb',
        originalname: 'thunmNail.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'uploads/videos',
        filename: '95d76ed41166292753ac233a577191f1',
        path: 'uploads/videos/95d76ed41166292753ac233a577191f1',
        size: 16186
      }
    ]
  }
***************************************************************************************************************************************

자 그럼 fileUrl이랑 thumbUrl에 저 req.files를 이용해서 url을 넣어줄 수 있겄지

***************************************************************************************************************************************
(videoController.js)

export const postUpload = async (req, res) => {
    // here we will add a video to the videos array.
    const {
        user: { _id }
    } = req.session;
    const { video, thumb } = req.files;                <- 그래서 여기를 files로 바꿔주고 video, thumb로 별도로 받음
    const { title, description, hashtags } = req.body;
    try{
        const newVideo = await Video.create({
            title,
            description,
            fileUrl: video[0].path,                 <- video랑 thumb이 배열이니까 [0] 을 넣어준것이다. 그안에있는 객체를 찾는거여.
            thumbUrl: thumb[0].path,
            owner: _id,
            hashtags: Video.formatHashtags(hashtags)
        })
        const user = await User.findById(_id);
        user.videos.push(newVideo._id);
        user.save();
        return res.redirect("/");
    } catch(error){
        console.log('error: ', error);
        return res.status(400).render("upload", {
            pageTitle: "Upload Video",
            errorMessage: error._message            
        });
    }
    
};
***************************************************************************************************************************************


자 이제 내 썸네일도 포함되어서 비디오가 업로드가 된다.
그럼 이제 썸네일 이미지를 사용해서 사진을 추가해보자. 

mixin의 video.pug에서 div.video-mixin__thumb 에 배경화면을 설정할 수 있다.

***************************************************************************************************************************************
(video.pug)

mixin video(video) 
    a(href=`/videos/${video.id}`).video-mixin
    div.video-mixin__thumb(style=`background-image: url(/${video.thumbUrl}); background-size: cover; background-position: center`) <- 요렇게 넣어주면 된다.
        div.video-mixin__data
            span.video-mixin__title=video.title  
            div.video-mixin__meta 
                span #{video.owner.name} ⚬ 
                span #{video.meta.views} 회
***************************************************************************************************************************************

# Flash messages installation

현재 publicOnly middleware를 사용하여 로그인이 되어있는 상태에서 URL을 통해 로그인 페이지로 가려하면 
그냥 바로 홈페이지로 돌려보낸다. 
여기에 뭔가 메세지를 하나 렌더링해주고 홈으로 돌려보내는게 좋을듯하다. 

지금 우리는 그냥 바로 홈으로 redirect해주고있기 때문에 템플릿에 메세지를 남길 수 없다.

***************************************************************************************************************************************
(middleware.js)

export const publicOnlyMiddleware = (req, res, next) => {
    if(!req.session.loggedIn) {
        return next();
    } else {
        return res.redirect("/");
    }
}
***************************************************************************************************************************************

이제 어떻게 사용자에게 메세지를 보내고, 그 메세지를 템플릿에 추가할 수 있는지 아라보자.

그렇게하기 위해 사용하는게 "Flash Message" 다. 

그리고 이걸 사용하기위해서는 express-flash 가 필요하다. 
express-flash는 사용자에게 flash message를 남길 수 있게 해준다. 
사용자에게 메세지를 남길 수 있게 해주는 미들웨어라고 보면 된다.

이 미들웨어는 session에 근거하기 때문에 한 사용자만 볼 수 있다. 

1. 일단 설치
-> $ npm i express-flash

2. server.js 에 import. 해주고 사용해준다.

***************************************************************************************************************************************
(server.js)

import flash from "express-flash";  <-import. 해주고

app.use(flash())                    <- 사용하는겨
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);

export default app;
***************************************************************************************************************************************

자 위처럼 딱 설정해주면 
이제 저 app.use(flash()) 가 session에 연결해서 사용자에게 메세지를 남길거다.
그러믄 어떻게 메세지를 남길까

flash() 미들웨어를 설치한 순간부터 req.flash 라는 함수를 사용할 수 있다. 

***************************************************************************************************************************************
(middleware.js)

export const protectorMiddleware = (req, res, next) => {
    if(req.session.loggedIn) {
        return next();
    } else {
        req.flash("error", "Not authorized");
        return res.redirect("/login");
    }
}

export const publicOnlyMiddleware = (req, res, next) => {
    if(!req.session.loggedIn) {
        return next();
    } else {
        req.flash("error", "Not authorized");
        return res.redirect("/");
    }
}
***************************************************************************************************************************************

일단 여기까지는 메세지를 보여주는건 아니고 만들기만 한거다.
req.flash("메세지의 종류", "남기고자 하는 말")
요거다.

자 현재까지 정리하면 
1. 서버에 express middleware 설치 
2. 메시지를 사용할 수 있도록 사용자를 redirect 하는 곳에 req.flash 사용. 
이다.

아 그렇다고 redirecr 하는곳에만 쓸수있는건 아니다. 
어디들 그냥 가져다 쓸 수 있음.


# Sending Messages 

내가 req.flash()를 사용해서 메시지를 보낼 때 
근본적으로 내가 하는 일은 locals 속성을 만드는거다. 
지금까지 해왔다시피 locals는 템플릿에서 사용할 수 있는 것들이다. 

flash 미들웨어를 설치하면, 우리를 위해 messages loacals를 만들어준다. 
그래야 우리의 views에서 사용할 수 있겠지. 

그니까 아래처럼 base.pug에서 그냥 바로 messages 가져다 쓸 수 있다는 거다.

***************************************************************************************************************************************
(base.pug)

doctype html 
html(lang="ko")
    head 
        title #{pageTitle} | #{siteName} 
        link(rel="stylesheet", href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css")
        link(rel="stylesheet", href="/static/css/style.css" )
    body 
        if (messages.error)             <- 여기서 에러종류 확인하고 
            span=messages.error         <- 컨트롤러에 적어놓은 메시지 출력
        if (messages.info)              <- 똑같음1
            span=messages.info          <- 똑같음2
        include partials/header
        main 
            block content 
        include partials/footer.pug
    script(src="/static/js/main.js") 
    block scripts
***************************************************************************************************************************************

즉, 우리가 flash미들웨어를 사용하고, req.flash()를 사용하면 
요 req.flash()가 messages.locals 를 만들어준다.
이전에 만등렀던 loggedIn, siteName, loggedInUser처럼 locals는 템플릿에서 사용이 가능하다. 

req.flash()에서 에러의 종류를 설정하면 
템플릿에서 mseeages.(에러종류) 로 접근하여 사용할 수 있다.

flash message의 좋은점은 한번만 보여진다는 것이다.
아주 놀랍구만. 

메세지가 한 번 보여지고 나면 express가 메세지를 cache에서 지워버린다.
아주 놀라워. 

사용자에게 일회성 메세지를 보내기에는 아주 좋은 기능인거다.

근데 위에처럼 그냥 텍스트만 띄우는거는 별로 간지가 안난다.
원래 코딩은 간지다.

이렇게 하는 대신에 간지나게 알림처럼 보이게 할거다.
일단 mixins에 message.pug를 만든다.

***************************************************************************************************************************************
(message.pug)

mixin message(kind, text)
    div.message(class="kind")
     span=text
***************************************************************************************************************************************

자 위에처럼 kind와 text를 받아쓰는 mixins를 하나 만들고 

base.pug에 kind의 종류에 따라 message.pug를 사용할수있게 배치해준다.


***************************************************************************************************************************************
(base.pug)

include mixins/message

html(lang="ko")
    head 
        title #{pageTitle} | #{siteName} 
        link(rel="stylesheet", href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css")
        link(rel="stylesheet", href="/static/css/style.css" )
    body 
        if (messages.error)                     <- messages의 kind에 따라
            +message("error", messages.error)   <- messages의 text를 출력해준다.
        if (messages.info)
            +message("info", messages.info)
        include partials/header
        main 
            block content 
        include partials/footer.pug
    script(src="/static/js/main.js") 
    block scripts
***************************************************************************************************************************************

자 요렇게 mixin을 써서 요래요래 해줬으면 이제 뭐가 달라진거냐
바로 원래는 저 messges의 text에 class가 추가되었으니까 
CSS에서 막 이것저것 지지고볶고 할 수 가 있다는거다.








# Commnet Models 

자 이제 댓글 시작합니다.
새로 배우는건 없다. 이전까지 배웠던걸 모두 사용할 뿐이다.

Comment 모델을 만들거고, 댓글에는 누가 달았는지와 어느 동영상에 달렸는지를 알게 해야한다.
아 또한 언제 달렸는지도 알아야 한다.

***************************************************************************************************************************************
(Comment.js)

import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    video: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Video" },
    createdAt: { type: Date, required: true, default: Date.now, trim: true},

});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;import mongoose from "mongoose";
***************************************************************************************************************************************

위처럼 모델 만들었으면 뭐할까?
기억해보자.

init.js에 import해줘서 여기저기서 다 쓰이게 만들어줘야한다.

아니 자 근데 한가지 또 생각해야할것 이 있다.
댓글은 비디오에 달리는거고, 그 말은 비디오는 많은 댓글을 가질 수 있다는 것이다.

그렇다면 유저와 비디오의 스키마에 댓글을 추가해줘야한다는 말이다.

***************************************************************************************************************************************
(Video.js)

import mongoose, { mongo } from "mongoose";

const videoSchema = new mongoose.Schema({
    //비디오 형식을 저장하는 구간
    title: { type: String, required: true, trim: true, maxLength: 80},
    fileUrl: { type:String, required: true },
    thumbUrl: { type:String, required: true },
    description: { type: String, required: true, trim: true, minLength: 2},
    createdAt: { type: Date, required: true, default: Date.now, trim: true},
    hashtags: [{ type: String, trim: true }],
    meta: {
        views: { type: Number, required: true, default: 0, trim: true },
        rating: { type: Number, required: true, default: 0, trim: true }
    },
    comment: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" }],        <- 요기 요거 추가해준겨
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

videoSchema.static("formatHashtags", function (potato) {
    return potato.split(",").map((word) => word.startsWith("#") ? word : `#${word}`);
})

 
const Video = mongoose.model("Video", videoSchema);

export default Video;
***************************************************************************************************************************************

마찬가지로 유저도 많은 댓글들을 가지고 있으니 똑같이 해줘야겠지.


***************************************************************************************************************************************
(User.js)

import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    avatarUrl: String,
    socialOnly: { type: Boolean, default: false },
    username: { type: String, required: true, unique: true },
    password: { type: String},
    name: { type: String, required: true },
    location: String,
    comment: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" }],     <- 요거 똑같이 추가해준겨 
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
})

userSchema.pre("save", async function () {
    if(this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 5) ;
    }
});

const User = mongoose.model("User", userSchema);
export default User;
***************************************************************************************************************************************

자 이제 우리가 만든 Comment Model을 init.js로 import해줘서 
Mongoose가 Comment Model을 Compile 할 수 있도록 해주면 된다.



# Comment Box

댓글을 작성하는 FrontEnd 부분을 만들어보자.

commentSections.js 라는 파일을 만들고 
webpack이 인식할수 있도록 webpack에 넣어주자.

그리고 이 commentSections.js는 watch.pug에서만 사용될 테니 watch.pug에 commentSection.js를 넣어준다.
그리고 watch.pug에 댓글란구성을 위한 html을 구성해준다.

대략 CSS에서 다루기 위해 .class를 추가해주고 Javascript에서 다루기 위해 #id를 추가해주는거 같다.

***************************************************************************************************************************************
(watch.pug)

extends base.pug 

block content
        #videoContainer(data-id = video.id)
            video(src="/" + video.fileUrl)
            div#videoControls
                button#play Play 
                button#mute Mute 
                input(type="range", step="0.1", value=0.5, min="0", max="1")#volume
                div 
                    span#currentTime 00:00 
                    span / 
                    span#totalTime 00:00
                div 
                    input(type="range", step="1", value=0, min="0")#timeline
                div 
                    button#fullScreen Enter Full Screen
            div
                p=video.description
                small=video.createdAt
            div 
                small Uploaded by 
                    a(href=`/users/${video.owner._id}`)=video.owner.name
        if String(video.owner._id) === loggedInUser._id
            a(href=`${video.id}/edit`) Edit Video &rarr;
            br
            a(href=`${video.id}/delete`) Delete Video &rarr;      
        if loggedIn                                                         <- 로그인 했을 때 만 댓글 쓸수있게 할거임.
            div.video__comments                                             <- 요기 댓글추가하기위한 form을 추가해준다.
                form.video__comment-form#commentForm
                    textarea(cols="30", rows="10", placeholder="댓글쓰셈")
                    button Add Comment
            


block scripts 
    script(src="/static/js/videoPlayer.js")
    script(src="/static/js/commentSection.js")
***************************************************************************************************************************************

이번에는 쓴 댓글에 대해 add comment 버튼을 눌렀을 때에 대한 
event listner를 추가해준다.

form 안의 submit 버튼을 클릭하면 자바스크립트는 이 form을 submit 하는거로 알아듣기에 
form.addEventListener("submir") 으로 이벤트를 감지할 수 있다.

그리고 form이 submit 되면 브라우저는 페이지를 새로고침 하는 기본동작(default behavior)이 있는데 그것을 멈춰줘야한다.
 -> event.preventDefault() 요거로 멈춰줄 수 있음.

event.preventDefault() 요거 해주면 event감지 후 실행되는 함수안의 코드만 실행되는거다.
그리고 브라우저는 원래 하던짓을 하지 않는다.

예를 들어 a tag에 event.preventDefault() 이거해주면 브라우저가 href로 이동하지 않는다.

이제 DB에 댓글을 추가해야 한다.

그러려면 우리가 어디 video에 있는지 알아야 하니까 
data attribute(data-id=video._id)  를 받아올거다.

이 data attribute들은 우리가 view event를 만들 때 만들어졌다.
우리가 백엔드에 req를 보내는게 우리가 동영상을 다 봤다는걸 알리는거다.

data attribute를 가져오기 위해 videoContainer를 가져오고
그 videoContainer 안에는 dataset이 있고 
그 dataset은 video._id 를 가지고 있다.

그래서 우리는 댓글을 쓰고 submit 해주면 
handleSubmit 함수를 통해 댓글의 내용을 받고, video의 _id 를 받았으니 

이제 우리는 데이터를 백엔드로 전송할 준비가 된거다.

왜냐면 우리는 요 사용자가 적은 텍스트와 어떤 비디오인지만 알면 되니까.

지금까지 정리하자면 
먼저 우리는 사용자로부터 내용을 받고, 그런 다음 어떤 비디오에 댓글을 달지 알아야했다. 그리고 그 정보는 dataset에 있었다.

그렇다면 이제는 백엔드에 request를 보내야한다.

자 우리의 comment 모델에서 보면 createdAt은 어차피 자동으로 추가되는거고 
owner는 어차피 세션을 통해 알 수 있으니 굳이 자바스크립트를 통해 추가해 줄 필요는 없다.
그러니 텍스트랑 비디오만 알면 준비가 다 된거다.

우리가 알아야 할 것은, 백엔드에 request를 보내면 누가 request를 보내는지 session에서 알면 된다.

만약 내가 프론트엔드 코드에게 누가 댓글의 주인인지 알려주게 된다면 이건 보안상 별로 좋지 않다.
session으로부터 누가 댓글의 주인인지 알 수 있으면 된다. 



# API Route part One 

자 이제 백엔드에 request를 보내보자.
이전에 비디오 조회수를 기록했을 때 처럼 fetch를 이용해서 POST request를 보내준다.

일단 POST Request를 보낼 URL를 설정해주고 뭘 보내야할 지 알아야하는데 
이전의 비디오 조회수의 경우는 그냥 URL로 POST request만을 보내주는것만으로도 충분했다.
하지만 댓글의 경우는 우리는 백엔드에 text data를 보내야한다.
그러니 
method: Post, 
body: {
    text,
}

가 들어가는거다.

우리가 form을 제출하면 우리의 백엔드는 req.body안에서 모든 input을 받는다는걸 안다.
fetch 에서 req.body를 만들기위해 form을 만들어줄 필요는 없다. 그냥 

fetch(`api/videos/${videoId}/comment`, {
    method: "POST",
    body: {
        text,
    },        
});

위처럼 적어줘서 body를 보내도 된다.

이미 우리는 req.body를 충분히 사용해왔었다.
예를들어 videoController.js에서 postEdit 컨트롤러에서 우리는 
HTML의 form으로부터 만들어진 req.body를 받았었따.

그래서 우리는 이제 댓글을 보낼때의 request에서의 body를 만들건데 
fetch를 사용하는거다.

다시 강조하지만, fetch는 JS를 통해 request를 보낼 수 있게 해준다.(URL을 변경없이 보내는겨~)

자 아래처럼 fetch를 통해서 text를 보내는 코드를 작성하였다.

***************************************************************************************************************************************
(commentSection.js)

const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const handleSubmit = (event) => {
    event.preventDefault();
    const textarea = form.querySelector("textarea");
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;
    fetch(`api/videos/${videoId}/comment`, {
        method: "POST",
        body: {
            text,
        },        
    });
};

if(form) {
    form.addEventListener("submit", handleSubmit);    
}
***************************************************************************************************************************************

자 근데 우리하네튼ㄴ apiRouter가 있다.
apiRouter.post를 써서 createComment라는 function을 동작하게 할거다.
그리고 createCommnet라는 function을 이제 만들어볼거다.

***************************************************************************************************************************************
(apiRouter.js)

import express from "express";
import { registerView, createComment } from "../controllers/videoController"; <- 당연히 가져와야겠찌 근데 아직 없찌 이제 만들거지.

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);     <- 여기서 길터주고 이제 createComment라는 함수를 만들어 볼거다.

export default apiRouter;
***************************************************************************************************************************************

일단 보내는 데이터를 잘 받는지 확인하기 위해 
console.log(req.params);로 video id 확인하고 
console.log(req.body); 로 댓글 받아지는지 확인해보자
    
***************************************************************************************************************************************
(videoController.js)

export const createComment = (req, res) => {
    console.log(req.params);
    console.log(req.body);
    return res.end();
};
***************************************************************************************************************************************

자 이렇게 해주고 댓글을 작성 후 submit을 해보면 
video id(req.params)는 잘 받아지는데 
댓글(req.body)은 null이네?
왤까?

이전에 했던걸 되짚어 보면 
우리는 form이 있고, req.body를 이용하여 form input에 접근할 수 있다.

동영상을 업로드했을 때 req.body에서 모든 input값들을 받아왔었다.(동영상재목, 설명, 해시태그였음)
어떻게 했었냐면

***************************************************************************************************************************************
(server.js)
app.use(express.urlencoded({ extended: true}));
***************************************************************************************************************************************

요거다. 요기있는 요 urlendcoded 미들웨어다.
이건 우리가 서버에 제공한 미들웨어인데 그래서 서버가 form으로부터 오는 data를 이해할 수 있었던 것이다.

자 그럼 이제부터 서버가 form으로부터 오는 데이터를 이해할수있게 만들어 볼거다.
그리고 우리가 주로 fetch를 통해서 보내는 데이터는 JSON데이터다.
그래서 우리는 handleSubmit function안의 req.body를 받아서 JSON.stringify 해줄거다.

내가 어떠한 객체를 보내고 싶을 때 사실은 Javascript Object를 보낼 순 없다.
왜냐면 부라우저와 서버는 객체를 받아서 string으로 만들어버리기 때문이다.

아 그래서 댓글을 submit 했을 때 network를 보면 뭐가 발생한거냐면 
우리가 적어서 보내는 text가 string으로 바뀌는 거였고..
그니까 뭐 객체로 전달되는게 아니라 브라우저에서 네트워크에서 내가보낸 post request를 보면 그안에 Request Payload를 보면
[object Object] 그냥 이런 텍스트로 전달이 되었다는 것이다.

예를들어 브라우저의 콘솔에서 확인을 해보면 
obj = { name: "lee" };
라는 객체가 있고 
obj.toString() 을 해주게되면 
"[object Object]" 요게 나와버린다는거랑 같은 이치인것이다.

그러니 백엔드에 객체를 보낼 때 객체를 보내는게 아닌 그냥 레알 우리가적은 댓글 text문자를 보내면 어떨까?
그래서 post request를 보내지만, object를 보내지는 않는거다.
우리는 말그대로 text만 보내면 되는거다.

그러니 

***************************************************************************************************************************************
const handleSubmit = (event) => {
    event.preventDefault();
    const textarea = form.querySelector("textarea");
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;
    fetch(`api/videos/${videoId}/comment`, {
        method: "POST",
        body: {
            text,
        },   
         -> 요거 아니고 
        body: text <- 사용자가 레알로 적은 댓글 텍스트
         -> 요거로 보내는 거디.
    });
};
***************************************************************************************************************************************

오 이렇게 하니까 브라우저의 개발자도구의 네트워크에서 확인해 보니 
우리가 보내는 post request에는 [object Object] 요거 아니고 내가 원하는 댓글이 들어가있다.

아니 근데 왜 

***************************************************************************************************************************************
(videoController.js)

export const createComment = (req, res) => {
    console.log(req.params);
    console.log(req.body);
    return res.end();
};
***************************************************************************************************************************************

여기서의 console.log(req.body);는 아직도 [object Object] 인걸까 
아직도 우리는 req.body에 접근하지 못하고 있다.

뭐 그래도 적어도 일단 이제 우리가 제대로 보낼수는 있게 되었고 우리는 text를 보낸다고 알고있다.

***************************************************************************************************************************************
(server.js)
app.use(express.urlencoded({ extended: true}));
***************************************************************************************************************************************

그래서 위의 저 미들웨어가 웹사이트로 들어오는 form을 이해하도록 만들어 주듯이 
다른 미들웨어를 사용해서 웹사이트에 request로 들어노는 text를 이해하도록 할 수 있다.
그 미들웨어는

***************************************************************************************************************************************
(server.js)
app.use(express.text());
***************************************************************************************************************************************

요거다....
이건 웹사이트에 request로 들어오는 text를 이해하도록 만들어준다.
이렇게 미들웨어를 추가함으로써 이제 우리의 백엔드는, 누군가 text를 보내면 그러 이해하게 될거다.
그리고 우리의 백엔드는 모든 text를 받아서 req.body에 넣어줄거다.

저 미들웨어를 사용해주니 이제 console.log(req.body) 의 댓글이 콘솔에 잘 나온다..

자 이제 우리는 프론트엔드에서 백엔드로 드디어 데이터를 보낼 수 있게 된거다.
아니 근디 이게 뭐 지금은 댓글만 보내니까 문제가 없는건데 뭐 댓글일아 평점을 같이 보낸다고 하면 어쩔것이여 
그럴때는 객체를 써야할거아니여 근디 또 객체는 [object Object] 이거로 나오고 

그니까 결국 우리는 객체를 string으로 바꿔줘야하는거다.
그래서 우리는 JSON.stringify() 를 해줄거다.

예를 보여주자면 

obj = {name:"lee"}

JSON.stringify(obj)
 -> '{"name":"lee"}'

요로캐 마치 그냥 문자처럼 저롷게 만들어 주는거다.

그래서 우리는 저 객체를 string으로 보내줄 수 있는거다.

그러믄 백엔드는 저 객체모양의 string을 받아서 다시 객체로 바꿔줘야할거 아닌가.
근데 또 우리의 멋진 express에는 고런 기능을 해주는 미들웨어가 있다.

그것은 바로 express.json() 이다.

***************************************************************************************************************************************
(server.js)
/*app.use(express.text());*/ <- 이거 이제 필요없음 
app.use(express.json()); <- 이거로 바쭤주면 됨.
***************************************************************************************************************************************

그래서 이 미들웨어를 추가하면 express는 텍스트를 받아서 다시 JS의 그것으로 바꿔준다.
마치브라우저에서 JSON.parse("원래는객체였던그것그러나지금은텍스트") 해주는것을 자동으로 그냥 해주는것이다.
아주 편리하고 좋구만. 

자 이제 Express는 우리가 form으로 보내는 string을 받아서 json으로 바꾸려고한다.
하지만 이걸 위해서는 Express에게 json을 보내고있다고 얘기해줘야한다.
얘기안해주면 그냥 text 보낸다고 생각하기 때문이다.

그러기 위해 우리는 request의 content-type을 바꿔줘야 한다.

그래서 우리는 fetch에 가서 header를 더해줄거다.
header는 기본적으로 request에 대한 정보를 담고 있다.

우리는 header를 더해줌으로써 express에게 "오케이 이거 text처럼 보일순 있지만 사실은 json임 그러니 json 미들웨어를 통해 처리되어야함"
이라고 말해주는거다.

아래처럼 "Content-Type": "application/json" 이라고 적어주면 된다.


***************************************************************************************************************************************
(commentSection.js)

const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const handleSubmit = (event) => {
    event.preventDefault();
    const textarea = form.querySelector("textarea");
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;
    fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({text: "댓글", rating: "별점"}),      
    });
};

if(form) {
    form.addEventListener("submit", handleSubmit);    
}
***************************************************************************************************************************************

와 이렇게 하니까 
req.body를 객체로 받을 수 있게 되었다.

우리는 JS객체를 받아서 string으로 바꿔서 인터넷으로 보낼 수 있게 했고 
string을 보냇고 
그리고 이게 서버에 도착하면 이 string을 JS object로 바꿔서 우리가 받을수 있게 된거다.

자 이제 내가 백엔드와 프론트엔드간에 정보를 보내는 방법인거다.

이게 프론트엔드가 백엔드에 매우 큰 object를 보내야 할 때 사용하는 방법인거다.

최종적으로 아래와 같은 형태인거고 if문을 통해서 text(댓글) 이 비어있을 때는 아무것도 request를 보내지 않는 코드를 추가했다.

***************************************************************************************************************************************
(commentSection.js)

const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const handleSubmit = (event) => {
    event.preventDefault();
    const textarea = form.querySelector("textarea");
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;
    if(text === "") {
        return;
    }
    fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),      
    });
};

if(form) {
    form.addEventListener("submit", handleSubmit);    
}
***************************************************************************************************************************************





# Commenting

자 이제 우리는 댓글을달려고하는 비디오의 id와 댓글의 text를 가지고 있다.
남은것은 댓글을 다는 사람이 누군지를 알아야 한다.

공부했듯 우리가 백엔드로 보내는 request들은 쿠키와함께 보내진다는걸 알아야 한다.
브라우저의 개발자도구에 네트워크에서 우리가 댓글을 submit할 때 보내는 POST request를 보면 쿠키가 들어가있다.
즉, 우리는 백엔드에 쿠키를 보내고 있는거다.

그럼 우리의 백엔드는 쿠키로 뭘 할까?
프론트에서 쿠키를 보내면 백엔드에서는 세션은 찾아본다.
그리고 우리는 세션에 이미 로그인한 사용자를 추가해 놓았다.

즉. 그냥 fetch만 하게되면 브라우저가 작동하는 원리(쿠키를보내면 세션을 찾는 그 원리) 우리의 쿠키는 자동으로 브라우저에 의해 전송되고 
그말은 videoController에서 우리가 뭔가 쓸게 있다는 거다.
그건 바로 req.session.user다. 오호?

이 req.session.user는 우리가 localhost:4000 -> localhost:4000 으로 fetch request를 보냇기 때문에 쓸 수 있는거다.
그래서 브라우저는 우리가 같은 프론트엔드에서 백엔드로 보낸다는것을 알기 때문에 쿠키의 원칙에 의해서, 우리는 쿠키를 자동으로 받을 수 있다.
 -> 백은 프론트의 브라우저를 쿠키의 id를 통해 구분한다. 상시 연결이 아니고 요청이 올떄 이 쿠키를 보고 이게 누군지 아는거다. 이전에 공부했었음.

그러니 fetch로 백엔드에 데이터를 보낼 때 쿠키는 자동으로 보내지는거고 이게 쿠키가 아주 편한 이유다.
그리고 우리는 백엔드에 객체를 이해할 수 있도록 json 미들웨어를 통해 구성을 이미 해놨으므로 
쿠키에서 사용자의 정보(객체형식으로 이루어짐)를 받을 수 있다.

자 이제 댓글을 만들기 위해 필요한 모든게 준비가 되었다.

이제 Comment.create() 를 통해 Mongoose를 이용하여 DB에 넣어주면 된다.
하기 코드참고 

***************************************************************************************************************************************
(videoController.js)


export const createComment = async (req, res) => {
    const {
         session: { user },
         params: { id },
         body : { text },
    } = req;
    
    const video = await Video.findById(id);

    if(!video) {
        return res.sendStatus(404);
    }

    const comment = await Comment.create({
        text,
        owner: user._id,
        video: id,
    });
    video.comments.push(comment._id);           <- video 데이터에 댓글달아준거 추가해줘야함.
    video.save();
    return res.sendStatus(201);
};
***************************************************************************************************************************************




# Rendering Comments 

일단 watch페이지에서 video에 댓글의 id를 통해 populate해줘야 댓글의 text를 가져올 수 있다.

***************************************************************************************************************************************
(videoController.js)

export const watch = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id).populate("owner").populate("comments");
    console.log('와치페이지에서의비디오임근데왜 콘솔에서 안나오지: ', video);
    if (video === null) {
        return res.render("404", { pageTitle: "Video not found" })
    }
    return res.render("watch", { pageTitle: video.title,video: video, });
    
} 
***************************************************************************************************************************************

자 이제 우리의 video에 댓글이 있는거고 이걸 화면에 출력하면 된다.

***************************************************************************************************************************************
(watch.pug)

extends base.pug 

block content
        #videoContainer(data-id = video.id)
            video(src="/" + video.fileUrl)
            div#videoControls
                button#play Play 
                button#mute Mute 
                input(type="range", step="0.1", value=0.5, min="0", max="1")#volume
                div 
                    span#currentTime 00:00 
                    span / 
                    span#totalTime 00:00
                div 
                    input(type="range", step="1", value=0, min="0")#timeline
                div 
                    button#fullScreen Enter Full Screen
            div
                p=video.description
                small=video.createdAt
            div 
                small Uploaded by 
                    a(href=`/users/${video.owner._id}`)=video.owner.name
        if String(video.owner._id) === loggedInUser._id
            a(href=`${video.id}/edit`) Edit Video &rarr;
            br
            a(href=`${video.id}/delete`) Delete Video &rarr;      
        if loggedIn
            div.video__add-comments 
                form.video__comment-form#commentForm
                    textarea(cols="30", rows="10", placeholder="댓글쓰셈")
                    button Add Comment
        div.video__comments                     <- 여기서 출력하면 된다.
            each comment in video.comments
                li=comment.text            


block scripts 
    script(src="/static/js/videoPlayer.js")
    script(src="/static/js/commentSection.js")
***************************************************************************************************************************************

근데 지금 댓글들이 오래된게 위에있고 최신것이 아래로 내려가고 있다.
이것은 문제가 많다.
최신것부터 위로오게 하려면 그냥 배열을 뒤집으면 됨.
근데 어떻게 뒤집냐면 pug는 
each comment in video.comments <- 이부분에서 자바스크립트 코드를 실행한다.
그러니 그냥 저 배열에다가 reverse() 메소드를 붙여주면 된다.


***************************************************************************************************************************************
extends base.pug 

block content
        #videoContainer(data-id = video.id)
            video(src="/" + video.fileUrl)
            div#videoControls
                button#play Play 
                button#mute Mute 
                input(type="range", step="0.1", value=0.5, min="0", max="1")#volume
                div 
                    span#currentTime 00:00 
                    span / 
                    span#totalTime 00:00
                div 
                    input(type="range", step="1", value=0, min="0")#timeline
                div 
                    button#fullScreen Enter Full Screen
            div
                p=video.description
                small=video.createdAt
            div 
                small Uploaded by 
                    a(href=`/users/${video.owner._id}`)=video.owner.name
        if String(video.owner._id) === loggedInUser._id
            a(href=`${video.id}/edit`) Edit Video &rarr;
            br
            a(href=`${video.id}/delete`) Delete Video &rarr;      
        if loggedIn
            div.video__add-comments 
                form.video__comment-form#commentForm
                    textarea(cols="30", rows="10", placeholder="댓글쓰셈")
                    button Add Comment
        div.video__comments
            each comment in video.comments.reverse() <- 여기다 메소드하나 넣어주면 됨. 그럼 최신것부터 나옴.
                li=comment.text            


block scripts 
    script(src="/static/js/videoPlayer.js")
    script(src="/static/js/commentSection.js")
***************************************************************************************************************************************


자 그럼 댓글을 달 때마다 아래처럼 페이지를 리로드해서 실시간 처럼 보이게 할 수 있는 방법도 있찌만 
그러면 페이지를 리로드할 떄마다 다시 다 가져와야 하고 DB에 있는 비디오를 다시 또 조회해야한다.
그건 너무 낭비고 부하가 너무 심하다.

***************************************************************************************************************************************
(commentSection.js)

const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const handleSubmit = async (event) => {
    event.preventDefault();
    const textarea = form.querySelector("textarea");
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;
    if(text === "") {
        return;
    }
    await fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),      
    });
    textarea.value = "";
    window.location.reload();
};

if(form) {
    form.addEventListener("submit", handleSubmit);    
}
***************************************************************************************************************************************

그래서 우리는 새로고침을 하지 않고 댓글을 제출했을 때 추가되는것처럼 보이게 할 거다.



# Realtime Comments 

fetch에 await를 추가한건 fetch를 하게되면 백엔드로 가야하고 
백엔드는 DB랑 뭔가를 하고 나서, status code를 return하고 
그러고 나서 백엔드가 우리에게 돌아오는데 이게 당연히 시간이 좀 걸린다.
긍게 await를 한거다.

근디 이전에 조회수 올릴 때는 await 안했지 왜냐하면 그거는 그냥 보내면 끝잉게 
근데 이건 보내고 받고 그 뒤에 코드들이 실행되어야하니까 await 해준거다.

fetch를 하게 되면 response를 받는데 이 response 객체에 status라는 프로퍼티에 상태코드가 들어있다.

그러니 이 response.status 가 201이면 오케이고 404면 뭐 없는거다.
그러면 그거에 따라서 이후 동작들을 나눠줄 수 가 있게되는거다.

자 이제 뭘 할거냐면 서버가 만약 201을 response.status 로 돌려준다면 즉, "오케이 댓글 만들어졌다잉!" 이렇게 응답을 한다면 
JS로 댓글을 만드는걸 할것이다.
지금 당장은 pug에서 만들어지고 있다. 
근디 우리는 JS로부터 새로고침을 하지 않고 댓글을 추가하려고 하는것이다.

기존에는 댓글을 DB에 등록하고 페이지를 리로드해서 내가 작성한 댓글이 페이지에 보이게 하였다.
하지만 자바스크립트로 나의 HTML에 추가함으로서 마치 실시간으로 댓글이 달리는것같은 착각을 주게 할 수 있다.
그리고 페이지를 다시 리로드해보면 기존에 DB에 댓글이 등록이 되었기 때문에 내가 단 댓글이 등록이 되어있어 동일한 페이지가 보이게 되는것이다.

하기코드 참고 

***************************************************************************************************************************************
(commentSection.js)

const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const addComment = (text) => {
    const videoComments = document.querySelector(".video__Comments ul");
    const newComment = document.createElement("li");
    newComment.className = "video__comment";
    const icon = document.createElement("i");
    const span = document.createElement("span");
    icon.className = "fas fa-comment";
    span.innerText = ` ${text}`;
    newComment.appendChild(icon);
    newComment.appendChild(span);
    videoComments.prepend(newComment);

};

const handleSubmit = async (event) => {
    event.preventDefault();
    const textarea = form.querySelector("textarea");
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;
    if(text === "") {
        return;
    }
    const { status } = await fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),      
    });
    if(status === 201) {
        addComment(text);
        textarea.value = "";
    }
};

if(form) {
    form.addEventListener("submit", handleSubmit);    
}
***************************************************************************************************************************************




# Comment Ids

댓글 삭제하는 기능을 만들어보자.
근데 이 삭제하는버튼이 아무한테나 보이면 안되고 댓글 작성자만 삭제 버튼이 보이게 해야한다.
그리고 백엔드에서도 실제 이걸 요청하는 사람이 댓글주인이 맞는지도 확인해야한다.

HTML에서 숨기는것은 edit video 이런게 주인에게만 보이게하는것과 방법이 동일하게 하면 된다.

근데 일단 뭐 백엔드에 지우는거 요청하고 할 때는 
아래와 같이 각 댓글 li 마다 data-set으로 comment의 id를 달아줌으로서 어떻게 뭐 할 수 있을거같다.

***************************************************************************************************************************************
(watch.pug)

div.video__comments
            ul
                each comment in video.comments.reverse()
                    li.video__comment(data-id=comment.id)
                        i.fas.fa-comment
                        span  #{comment.text}
                        span ❌
***************************************************************************************************************************************

근데 문제는 Javascript로 프론트상에서만 만든 가짜 댓글을 지울 때 가 문제다.
얘는 방금 Javascript로 만든 가짜라 data-set이(=comment.id) 가 없기 때문이다.

data request를 보내려면 댓글의 id를 알아야한다.

우리는 videoController.js에서 새로 작성한 댓글에 접근할 수 있다.
그니까 우리가 백엔드에 fetch를 보내고 201이 돌아오면 addComment() 를 실행하는 이과정 말이다.

여기서 그냥 백엔드에서 201 상태코드만 보내는거 대신에(=sendStatus 대신에)
여기에 json을 더해주면 된다.

***************************************************************************************************************************************
(videoController.js)

export const createComment = async (req, res) => {
    const {
         session: { user },
         params: { id },
         body : { text },
    } = req;
    
    const video = await Video.findById(id);

    if(!video) {
        return res.sendStatus(404);
    }

    const comment = await Comment.create({
        text,
        owner: user._id,
        video: id,
    });
    video.comments.push(comment._id);
    video.save();
    return res.status(201).json({ newCommentId: comment._id });     <- 여기다. 여기서 comment._id를 같이 return 해주는거다.
};
***************************************************************************************************************************************

우리는 상태코드를 보내는것만이 아니라 프론트엔드에 메시지를 되돌려 보낸거다.

와 이렇게 하고 브라우저의 개발자도구의 네트워크에서 우리가 보낸 POST Request에서 response를 보니까 { newCommentId: comment._id } 이게 있따.
와 신기하다.
이전에는 response를 받지 않고 그냥 상태코드만 받았었다.

근디 이제는 response를 받았다.
이제 이걸 추출해야한다.

fetch한거를 response라는 변수에 담았따 아래처럼
그러면 상태코드는 당연히 response.status 로 나타내야겠지.

***************************************************************************************************************************************
(commentSection.js)

const handleSubmit = async (event) => {
    event.preventDefault();
    const textarea = form.querySelector("textarea");
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;
    if(text === "") {
        return;
    }
    const response = await fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),      
    });
    if(response.status === 201) {
        addComment(text);
        textarea.value = "";
        console.log(response);              <- 요기서 response를 봤떠니 뭐 따로 댓글의 아이디가 나오지는 않네?
    }
};
***************************************************************************************************************************************

그리고 위처럼 response를 콘솔로그했더니 댓글아이디가 있을줄 알았더니 없다???
왜냐면 response의 body를 추출해야하기 떄무니다.
body를 추출하려면 일단 json으로 보냇던거를 얻어야 겠지.


const json = await response.json(); <- 요거로 받을 수 있다.

즉, const json = await response.json(); 요거로 백엔드에서 보내주는 json object를 받을 수 있는거다.
response안에 있는 json을 추출한거다.

그라믄 저기서 추출한 새로단 댓글의 아이디를 addComment함수안에 addCommnet(text, newCommentId) 요로코롭 넣어줌으로써 우리가 이걸로 지지고볶고 할 수 있겠다.

그러믄 이제 Javascript로 만드는 가짜 댓글에도 data-set을 가질 수 있게 되는거다.

***************************************************************************************************************************************
(commentSection.js)

const addComment = (text, id) => {                                          <- 요기서 id 아까 받은거고
    const videoComments = document.querySelector(".video__Comments ul");
    const newComment = document.createElement("li");
    newComment.className = "video__comment";
    newComment.dataset.id = id;                                         <- 짠 여기서 넣어주면 되지롱
    const icon = document.createElement("i");
    const span = document.createElement("span");
    const span2 = document.createElement("span");
    icon.className = "fas fa-comment";
    span.innerText = ` ${text}`;
    span2.innerText = "❌"; 
    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(span2);
    videoComments.prepend(newComment);

};
***************************************************************************************************************************************

fetch로 삭제 요청 할 때는 method: "DELETE" 하면 됨.
그리고 라우터에서는 apiRouter.delete("/내가패치에적은url", 그리고 실행하려는 함수) 
요렇게 받을 수 있음.

그리고 fetch에서 POST request 보낼 때 body는 필요없다. 마치 비디오 조회수 올렸던거처럼 그냥 요청만 보내서 삭제를 하는거다.

백엔드에서 해야 할 일은, URL 을 만드는것은 물론이고 
컨트롤러를 만들어서 내가 댓글의 작성자인지 확인도 해야한다.


--누군가의 댓글-------------
챌린지 과제
- 댓글 삭제하기 (삭제시 비디오나 유저 도큐먼트에서도 삭제 필요)

추가로 구현해볼 만한 기능들
- 댓글 추가 및 삭제시 실시간으로 댓글 갯수 변경
- 댓글 수정하기
- 좋아요
- 좋아요 취소
- 해시태그 클릭시 비디오 찾기

Element.remove()
Element.remove() 메서드는 해당 요소가 속한 트리에서 요소를 제거합니다.
(remove대신 removeChild를 사용해서 엘리먼트 삭제도 가능)
https://developer.mozilla.org/en-US/docs/Web/API/Element/remove
--------------------------

과제완료 

# Building the Backend 

자 이제 이 백엔드를 실제 서버에 배포해보자.
친구들에게 보여주자.

Heroku를 통해서 배포할건데, 이건 쉽지 않다.
어떤 node.js환경에서도 서버가 실행될 수 있게 설정을 바꿔야 한다.

DB도 설정을 바꿔야하는데..우린 진짜 DB를 만들지 않았다.
지금 DB는 MongoDB가 localhost에서 실행되고는 있지만 이건 좋지 않다.
그리고 파일들을 우리 서버가 아니라 아마존에 올려야 한다.

자 뭐 이런저런 해줘야할게 많은데 
우리의 코드를 production 방법으로 빌드해야 하고, 코드를 압축(minify) 해야한다.

일단 처음으로 실제서버에서 백엔드를 실행하는 모든 단계들을 해볼거다.

첫번쨰로 우리가 만든 코드를 실행하려면 
nodemon을 사용하여 babel-node 를 실행한다.

babel-node는 실제로 서비스되는곳이 아니라 개발할 때만 사용되는 목적으로 쓴다.
홰야면 babel-node는 나의 Javascript 코드를 실행할 수 있게 도와준다.
코드를 바꾸지 않고 babel-node가 우리의 코드를 실행시켜준다.

그치만 babel-node를 사용하면 performance에 문제가 있다.
babel-node는 그렇게 빠르지 않기 때문이다.

그래서 nodemon안에서 부를수있는 이 init.js를 일반적인 javascript 코드로 바꿔야한다.
완전 옛날 구버전 javascript 코드로 말이다.

그렇게 하기 위해서 babel-CLI를 사용할 거다.
babel-CLI는 내가 원하는대로 나의 코드를 바꿔준다.

일단 설치
$ npm install --save-dev @babel/cli

자 이제 script를 만들어 보자.
우리는 src폴더안의 init.js를 빌드할거다.
마지막에 -d는 directory의 약자인데 의미는 빌드한 코드를 어디에 저장할 지를 얘기하는거다.

***************************************************************************************************************************************
(package.json)

"scripts": {
    "build:server": "babel src/init.js -d build",
    "dev:server": "nodemon",
    "설명": "원래는 그냥 node index.js로 실행했었는데 우리가 @babel/node를 설치했기 때문에 babel-node라는 명령어를 쓸 수 있는거야. nodejs를 실행시키는데 babel도 같이 적용되서 최신문법코드를 동작 시킬 수 있지.",
    "dev:assets": "webpack --config webpack.config.js",
  },
***************************************************************************************************************************************

자 요래 위처럼 scripts 만들고 실행해보면 
 -> $ npm run build:server

build라는 폴더에 init.js라는 파일이 생겼다.
요 새로 만들어진 init.js는 구버전의 올드한 javascript로 변환된 파일아다.

근디 우리는 보면 init.js만 새로 만들었다.
Babel CLI는 nodemon처럼 실행하지 않는다.

nodemon은 파일을 실행하고 그 파일이 모든 걸 실행한다. 

babel의 경우, 한 파일만 실행하는게 아니라 모든 폴더를 빌드해서 실행해야 한다.
그러니 위처럼 하면 안되고
일단 build 폴더 지우고

아래처럼 src 폴더자체를 그냥 다 변환시켜줘야한다.
즉, babel이 src폴더를 빌드하고 결과물은 build폴더에 저장하는것이다.

***************************************************************************************************************************************
(package.json)

"scripts": {
    "build:server": "babel src -d build",
    "dev:server": "nodemon",
    "설명": "원래는 그냥 node index.js로 실행했었는데 우리가 @babel/node를 설치했기 때문에 babel-node라는 명령어를 쓸 수 있는거야. nodejs를 실행시키는데 babel도 같이 적용되서 최신문법코드를 동작 시킬 수 있지.",
    "dev:assets": "webpack --config webpack.config.js",
  },
***************************************************************************************************************************************

자 그리고 이렇게 만들어진 build폴더안의 코드들은 
완전히 호환이 가능한 Javascript 코드이다.

//음 그리고 이 build폴더를 gitignore에 추가 예전버전 그냥 서버등록용이니까

근데 문제는 코드를 빌드할 떄 client 부분도 빌드가 되었다.
client 코드는 별로 빌드하고싶지 않다.
왜냐면 백엔드를 babel로 바꾸는 거니까 client 코드를 빌드하면 안된다.

이건 추후 고쳐줄 예정

이렇게 우리는 핫한 최신의 섹시코드를 짠 후 
여기저기 아주 호환이 잘되는 이런 코드를 만들 때 빌드를 하는거다.

이제 "start"라는 새 명령어를 만들거다.
이거슨 아주 헌쫑야오다.
그리고 build/init.js를 실행할 거다.

기억해야할것은 nodemon은 babel-node src/init.js 를 실행한다.
난 node build/init.js 를 실행하고자 한다.
그러니 아래처럼 start 명령어에 "node build/init.js" 를 추가해준다.

***************************************************************************************************************************************
(package.json)

"scripts": {
    "start": "node build/init.js"
    "build:server": "babel src -d build",
    "dev:server": "nodemon",
    "설명": "원래는 그냥 node index.js로 실행했었는데 우리가 @babel/node를 설치했기 때문에 babel-node라는 명령어를 쓸 수 있는거야. nodejs를 실행시키는데 babel도 같이 적용되서 최신문법코드를 동작 시킬 수 있지.",
    "dev:assets": "webpack --config webpack.config.js"
  }
***************************************************************************************************************************************

build/init.js는 일반 Javascript 코드니까 node는 babel이 없어도 이해할 수 있다.

자 이제 
$ npm start
당차게 실행해주면...에러가 뜬다.ㅎㅎ

***************************************************************************************************************************************
    ReferenceError: regeneratorRuntime is not defined
    at Object.<anonymous> (/Users/seunghoon/Desktop/IhaveaDream/노마드코더/노마드코더강의용/Wetube/build/models/User.js:52:69)
    at Module._compile (node:internal/modules/cjs/loader:1101:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1153:10)
    at Module.load (node:internal/modules/cjs/loader:981:32)
    at Function.Module._load (node:internal/modules/cjs/loader:822:12)
    at Module.require (node:internal/modules/cjs/loader:1005:19)
    at require (node:internal/modules/cjs/helpers:102:18)
    at Object.<anonymous> (/Users/seunghoon/Desktop/IhaveaDream/노마드코더/노마드코더강의용/Wetube/build/init.js:9:36)
    at Module._compile (node:internal/modules/cjs/loader:1101:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1153:10)
***************************************************************************************************************************************

왤까

우리는 이전에 이런 에러를 본적이 있다.
async와 await를 사용하려고 했을 때 똑같은 에러를 본적이 있다.
그말은 저 에러를 우리가 고쳐야 한다는 말이겠지

자, async와 await를 사용할 때 이 regenerator가 필요한 데 보다시피 없다.
근디 지금은 벡엔드를 다루고있으니까 나중에 고쳐볼거다.
이 문제는 우리코드가 async와 await를 사용할 수 있게 알려줘야한다.

자 두번쨰 에러는 콘솔창에는 안뜨지만 
우리가 만든 build에 view가 없다는거다.
pug 파일이 없다는거다..?

첫번쨰 문제는 우리가 만든 build/init.js 파일의 맨위에 

import "regenerator-runtime";

이거 한줄이면 해결이다.

이제 다시 $ npm start 해주면 
***************************************************************************************************************************************
(터미널)

➜  Wetube git:(master) ✗ npm start

> wetube@1.0.0 start
> node build/init.js

✅Server listening on port http://localhost:4000🚀
✅Connected to DB
***************************************************************************************************************************************

서버가 잘 실행된다.

이제 babel이 우리 서버에서 실행되지 않는다.
node.js가 우리의 서버에서 실행되고 있다.

이제 babel의 도움이 필요없다. 왜냐하면 node.js가 build안의 이 코드를 모두 이해하기 때문이다.

근데 우리의 위튜브 홈페이지에 들어가면 아니 우리 build폴더에는 pug가 없는데 동작을허네?

이유는 build/server.js에 있다.

***************************************************************************************************************************************
(build/server.js)

app.set("views", process.cwd() + "/src/views");
***************************************************************************************************************************************

위의 view를 설정하는 부분을 보면 views폴더는 현재 working directory(=cwd)에서
이건 node를 실행한 폴더위치를 말한다.
즉, package.json을 가지고 있는 폴더를 의미하고, root폴더를 말한다.
그러니 이 root폴더 굳이 이름으로 따지면 WETUBE 폴더가 process.ced()인 것이다.
그러니 알아서 views파일을 잘 찾아가는거다.

이말은 views 폴더를 옮기지 않아도 된다.
왜냐면 이 구닥다리 코드를 가지고 있는 build/server.js가 
build의 백엔드가 직접 src/views로 이동했기 때문이다.

그렇기 때문에 나의 클라이언트가 정상동작하는것이다.

자 지금까지 우리는 백엔드서버를 빌드했다.
 = 예전것들과도 호환이 되는 요상한 코드로 만들었다.

자 이제 클라이언트 코드를 빌드해보자.

아 그리고 우리의 빌드서버는 환경변수에 접근할 수 있다.(DB_URL 뭐 이런거)



# Building the FrontEnd

Webpack은 두가지 모드가 있다.
development 와 production 이다.(production code가 훨씬 더 작다.)

자 이번에는 assets을 빌드할거다.

그러면 package.json의 scripts에 build:assets를 만들어야하겠지 아래처럼


***************************************************************************************************************************************
(package.json)

"scripts": {
    "start": "node build/init.js",
    "build:server": "babel src -d build",
    "build:assets": "webpack --mode=production",    <- 요기임 그리고 mode는 원래 webpack.config.json에서 정했었는데 그거 지우고 package.json에서 정해줄 수 있음. 
    "dev:server": "nodemon",
    "dev:assets": "webpack --mode=development",
    "설명": "원래는 그냥 node index.js로 실행했었는데 우리가 @babel/node를 설치했기 때문에 babel-node라는 명령어를 쓸 수 있는거야. nodejs를 실행시키는데 babel도 같이 적용되서 최신문법코드를 동작 시킬 수 있지."
  },
***************************************************************************************************************************************

$ npm run build:assets
을 실행해주면 production mode가 실행이 된다.

그리고 만들어진 assets/js/main.js를 보면 모든 코드가 한줄로 되어있는것을 볼 수 있다.
commentSection.js, vieoPlayer.js 도 같은방법으로 되어있다.
모든 코드가 엄청 압축되어 있다.

문제는 build:assets를 했지만 webpack은 여전히 watch모드에 있다는 것이다.
왜냐면 watch: true 해놨기 때문이다.

***************************************************************************************************************************************
(webpack.config.js)

module.exports = {
    entry: {
        main: "./src/client/js/main.js",
        videoPlayer: "./src/client/js/videoPlayer.js",
        recorder: "./src/client/js/recorder.js",
        commentSection: "./src/client/js/commentSection.js",
    },   
    watch: true,            <= 요기여!
    plugins: [
        new MiniCssExtractPlugin({
            filename: "css/style.css", 
        }),
    ],
***************************************************************************************************************************************

development 모드에서만 watch 모드를 true로 해야한다.
그러니 webpakc.config.js 에서 watch: true 를 지워주고 
package.json 에서 dev:assets 에 wathc 모드를 추가해주면 된다.


***************************************************************************************************************************************
(package.json)

"scripts": {
    "start": "node build/init.js",
    "build:server": "babel src -d build",
    "build:assets": "webpack --mode=production",
    "dev:server": "nodemon",
    "dev:assets": "webpack --mode=development -w",  <- 여기 -w 이거 하나 꼴랑 넣어주면 watch 모드를 true 로 해주는거임.
    "설명": "원래는 그냥 node index.js로 실행했었는데 우리가 @babel/node를 설치했기 때문에 babel-node라는 명령어를 쓸 수 있는거야. nodejs를 실행시키는데 babel도 같이 적용되서 최신문법코드를 동작 시킬 수 있지."
  },
***************************************************************************************************************************************

자 이제 webpack은 webpacj.config를 읽고 development 모드와 watch 모드를 한다.

이제
$ npm run build:assets
해주면 압축된 main.js를 확인할 수 있다.

그말은 이제 build: server를 실행할 수 있다.
build:server는 build:assets을 보게도리거다.

우리가 실행하는 모든 코드는 공개할 준비가 된(production-ready) 자바스크립트 코드다.
왜냐면 build:server를 실행하면 assets이 실행된다.
그치만 assets은 압축 돼 있다.

$ npm start
  -> build/init.js 실행

이제 localhost:4000으로 가면 build된 자바스크립트코드가 실행되었다.

개발자도구를 켜보고 불러온 commentSection.js를 보면 빌드된 압축된 자바스크립트 코드인걸 확인할 수 있다.

자 이제 서버는 실행되고 있고 서버가 code에서 실행되고 (이젠 더이상 babel의 도움이 필요 없다.)
프론트엔드 코드도 모든 브라우저가 이해할 수 있다.

이거로 빌드과정은 끝이 났다.

이제 이걸 Heroku에 추가해 줄 거다.
Heroku에 두는 이유는 이 코드들을 실제 서버에 두었을 때 어떻게 에러가 생기는지 보기 위함이다.

그전에 build:server와 build:assets은 묶어줄 수 있다.

***************************************************************************************************************************************
(package.json)

"scripts": {
    "start": "node build/init.js",
    "build": "npm run build:server && npm run build:assets",        <- 이거로 묶어서 한번에 실행하는겨 
    "build:server": "babel src -d build",
    "build:assets": "webpack --mode=production",
    "dev:server": "nodemon",
    "dev:assets": "webpack --mode=development -w",
    "설명": "원래는 그냥 node index.js로 실행했었는데 우리가 @babel/node를 설치했기 때문에 babel-node라는 명령어를 쓸 수 있는거야. nodejs를 실행시키는데 babel도 같이 적용되서 최신문법코드를 동작 시킬 수 있지."
  },

***************************************************************************************************************************************


자 끝났따.
이렇게 서버를 빌드 했다.
이제 babel은 안쓴다.



# Deploying To Heroku

이제 내가 만든 서버를 Heroku에 올릴거다.
Heroku는 서버를 배포하는 사이트다.

1. heroku CLI 설치
$ brew tap heroku/brew && brew install heroku

2. heroku login
$ heroku login

heroku: Press any key to open up the browser to login or q to exit: 
 -> 아무키나 누르고 브라우저가 열리면 login 클릭 후 터미널 확인시 

Opening browser to https://cli-auth.heroku.com/auth/cli/browser/071fa8ea-3e90-4ee3-bb00-a5f6b0339881?requestor=SFMyNTY.g2gDbQAAAAw4NC4xNy4zNC4xNThuBgCAt03gfwFiAAFRgA.OZo63j6xlXJnsR2n4vLeJFOa9QMlR90ajyi4MNwLMXA
Logging in... done
Logged in as si932174@gmail.com

이렇게 로그인이 된걸 확인 가능

이제 내 프로젝트는 git repository가 필요하다.
그래서 git init을 해야한다.

$ git init
Reinitialized existing Git repository in /Users/seunghoon/Desktop/IhaveaDream/노마드코더/노마드코더강의용/Wetube/.git/

$ git add .

$ heroku git:remote -a wetube-hoon
set git remote heroku to https://git.heroku.com/wetube-hoon.git

이제 Heroku remote를 하나 얻었다.
git에서 add, commit 등등을 하고 push를 Heroku에 할 수 있다는 말이다.

아래같은걸 할 수 있다는 거다.
________________________________________________________________________________
$ git add .
$ git commit -am "make it better"
$ git push heroku master
________________________________________________________________________________


$ heroku git:remote -a wetube-hoon

heroku는 오직 내 git history만 본다.

만약 코드를 바꾸고 commit을 안하면 heroku가 나의 코드를 볼 수 없다.
그래서 매번 코드를 바꾸면 항상 commit을 해야한다.
commit을 하면 heroku가 내 코드를 볼 수 있다.
왜냐면 heroku는 git으로 작동하니까

즉 오직 git이 볼 수 있는 코드만 heroku가 업로드 한다.
 -> .gitignore에 있는건 업로드 되지 않는다는 말이랑 같다.

이제 
$ git push heroku master
를 통해 배포 할 준비가 되었다.

근데 배포하기 전에 다른 commend를 먼저 실행 할 거다.
server나 Heroku의 로그를 볼 수 있게 해주는 commend 이다.

$ heroku logs --tail -> 이거다.
요건 우리에게 서버를 보여준다.
--tail은 실시간으로 로그를 보여주게 하는 명령어다.

___________________________________________________________________________________________________
2022-03-31T13:57:25.406138+00:00 app[api]: Release v1 created by user si932174@gmail.com
2022-03-31T13:57:25.406138+00:00 app[api]: Initial release by user si932174@gmail.com
2022-03-31T13:57:26.354641+00:00 app[api]: Release v2 created by user si932174@gmail.com
2022-03-31T13:57:26.354641+00:00 app[api]: Enable Logplex by user si932174@gmail.com
___________________________________________________________________________________________________

지금 당장의 위의 로그처럼 아무것도 없다.
근디 이제 
$ git push heroku master
이거를 해주는데
아니 근데 .env파일에 있는걸 git ignore헀기 때문에 .env가 Heroku에 없다.
그래서 뭐 Heroku에는 DB_URL도 없고 뭐 암튼 다없어서 그래서 DB가 없다.
요걸 어떻게 해야할까




# Mongo Atlas

일단 사이트 들어가서 가입부터 하고
클러스터를 만들건데 클러스터는 DB group 같은거다.

물론 DB 하나만 사용 할 거다.

mongodb+srv://hoon0123:<password>@cluster0.xvt9t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
  -> mongodb+srv://hoon0123:ihaveadream0628!@cluster0.xvt9t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority

흠...뭐 이것저것 뭐 가입하고 어쩌고 해서 mongo Atlas에서 DB를 만들었고 
그렇게 최종적으로 받은게 위의 URl인데 

우리 문제가 뭐였냐면 process.env.DB_URL 이 heroku에 없다는게 문제였다.

자 이제 뭐 가입하고 만들어서 DB의 URL을 얻었지만 어떻게 process.env.DB_URL에 둬야할지 모른다.

다시말하자면 .env파일을 업로드하거나 수정할 수 없다.
그렇게 하지 않을거다.

그래서 Heroku의 admin panel을 사용해서 이 DB_URL을 설정 할 거다.

이야 근데 Heroku의 setting에서 변수를 저장하는게 가능하게 거기에 저장한다.

지금까지는 내 컴퓨터에서 .env파일에 있는 DB_URL을 설정했다.
이제 Heroku를 사용할 땐 더이상 그렇게 못한다.
Heroku를 쓸 땐 웹사이트에서 변수를 설정할 수 있다.

변수설정하면 아래처럼 로그에 --tail 한 그 로그에 
아래처럼 뜬다.

2022-03-31T15:22:51.882182+00:00 app[api]: Set DB_URL config vars by user si932174@gmail.com
2022-03-31T15:22:51.882182+00:00 app[api]: Release v5 created by user si932174@gmail.com

자 일단 여기까지 
.env가 아니라 heroku에서 process.env 변수를 설정했다.


# Environment Variables

Heroku가 나의 서버로 연결을 시도했다.
나의 서버는 포트 4000으로 열려있다.
하지만 대부분의 경우 포트 4000은 Heroku가 우리에게 준게 아니다.
대부분 Heroku는 랜덤으로 PORT를 준다.

그래서 4000으로 연결하면 안된다.

Heroku가 우리에게 준 PORT로 연결해야한다.
그러니 init.js에서 아래처럼 PORT를 heroku에서 받도록 바꿔준다.

***************************************************************************************************************************************
(init.js)
const PORT = prcoess.env.PORT || 4000; <- heroku에서만 동작하니까 heroku에서 준거 아니면 4000
***************************************************************************************************************************************

변수가 OR 연산을 통해 둘다 가질 수 있다니 아주 놀랍다.

그리고 파일을 수정 했으니 git commit, push 이런거 또 해줘야한다.

우와 이제 들어가진다.

우와아. 로컬이 아니라 인터넷으로 나의 위튜브에 접속이 가능하다.


git hub token
vscode://vscode.github-authentication/did-authenticate?windowid=1&code=ba968eee10330a40fc1d&state=1a93e8b7-4359-4981-a590-c169877027ba




#  AWS S3

근디 이거 git push 해줄 때 마다 이거 내 비디오랑 썸네일파일이랑 다 없어진다.
왜냐믄 새로 배포 할 떄 마다 Heroku에서 서버를 재구성하면서 파일들도 다 없어지기 때무니다.

근디 나는 일단 프론트엔드를 지향하고 그쪽으로 공부할것이 많다.
글고 AWS 가입할 때 카드번호 입력하는거 좀 맘에 안듬.

그동안 수고 많았습니다. 으아
2022.01 ~ 2022.04 위튜브 강의 완강.
