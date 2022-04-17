import express, { application } from "express";
import morgan from "morgan";
// const express = require("express"); 이것과 위의 문장은 같은 뜻이다. 즉 "express" 라는 pacakage를 express라는 이름의 변수로 import 한것이지.
//위에처럼 적으면 내가 node_modules에서 express를 찾고 있따는것을 nodeJS와 npm이 알아낸다
//그러면 node_modules에서 express 폴더를 찾은뒤 그폴더의 index.js를 불러들이는거임.

const PORT = 4000;

const app = express(); // express function을 사용하면 express application을 생성해준다.그래서 app에 주는거지, 여기서는 app이나 server나 같은 말로 본다.
/*
서버란 무엇인가?
: app이 listen해야한다 했을 때 무엇을 listening해야 한다는 걸까?
서버는 항상 켜져있는 컴퓨터 같은거임. 보통은 키보드 화면도 없지만 그래도 컴퓨터다, 항상 켜져있는
서버는 항상 켜져있꼬, 인터넷에 연결돼있는 컴퓨터라 할수 있다.
그리고 request를 listening 하고있다.
request가 뭐냐면 내가 만약  google.com을 간다고 하면, 지금 google.com 에 request를 보내는거다. 내가 지금 거기로 간다고.
request : 브러우저가 서버한테 "나 이 URL 좀 가져다줘" 라고 하는거
서버는 request를 계속 주목하고 있고, 연결되어있는거다.
내가 구글에 접속하려한다? 그것도 request, 
내가 카톡에 메시지를 보낸다? 그것도 request, 내가 서버에 메시지를 보내면 서버는 나에게 응답을 보내 그래서 request인거지.
서버와 상호작용하는 모든것들이 request 인거지.
 */


//app.get : 내 applitcation에게 누군가가 어떤 route로, 이경우엔 home으로 get request를 보낸다면 그에 상응하는 콜백함수를 실행 하는 그런 뜻인거제..
//button.addEventlistner("click", handleClick) 요거랑 같은 메커니즘이다라고 보면 돼

//app.get("/", ()=>console.log("somebody is trying to go home"))
//위에처럼 작성하면 브라우저가 "/" URL달라고  get 요청을 보냇을 때 서버가 오케 그거 알았어 나 그거 뭔지 알어 기다려하고 함수를 호출하는데 함수는 그냥 console.log만 존나 하니까 브라우저는 기다리고 있는데 아무것도 안주니까 계속 브라우저는 로딩만 하다가(기다리다가) 뻑나는거지

//app..use는 global middleware를 만들수 있게 해준다. global middleware는 어느 URL에서도 작동하는 middleware다.
//middleware를 use하는게 먼저 오고, 그다음에 URL의 get이 와야한다. 
//모든 route에서 이 함수를 사용한다는 거다.
//근디 app.get을 위에다 놓고 홈을 들어가면 handleHome은 실행되는데 app.use는 실행이 안돼..왜지..? 아 글로벌 미들웨어를 만들어 주는거니까...?
//  아 handleHome은 next()가 없잔여 글고 그냥 rertun해서 연결을 종료시키니까

//gossipMiddleware
const logger = (req, res, next) => {
    //이 미들웨어는 아무것도 안하고 next함수만 호출 할거임.
    console.log(`${req.method} ,${req.url}`);
    //return res.send('middle end') 이렇게 중간에 리턴해버리면 뒤의 next는 실행안되고 그냥 response하고 끝나버리는겨 
    next()
;}

const handleHome = (req, res, next) => {
    return res.send("I love middleware"); 
    // request를 받았느면 response를 return해야해 아줒 중요해
    //return next() 라고 하면 웹페이지에서 cannot GET이라고 나온다. 
    //왜냐면 next()함수를 호출하려는데 호출하면 express가 handleHome의 
    //다음의 함수를 호출할 텐데 handleHome 다음에 함수가 없기 때문이지.
};

const privateMiddleware = (req, res, next) => {
    const url = req.url;
    if (url === "/protected") {
        return res.send ("<h1>Not allowed</h1>")
    }
    console.log("Allow, you may continue.");
    next();
};

const handleProtected = (req, res) => {
    return res.send("Welcome to the private lounge");
}; 




app.use(logger); 
app.use(privateMiddleware); // /protected로 들어오게 되면 이 privateMiddleware가 동작해서 밑으로 안내려가고 여기서 멈춤 즉, 밑의 app.get들이 실행이 안됨.
app.get("/", handleHome);
app.get("/protected", handleProtected);

//app.get("/", gossipMiddleware,handleHome);
//addEventlistner에서 콜백함수에 evnet 인자를 주는것 처럼 express에서도 get request가 오면 route handler에 request, response 이 2개의 인자(객체)를 준다.(순서대로)
//그리고 이제부터는 handler라고 안하고 controler라고 한다.
// request : 브라우저가 서버에 요청하는것, response : 서버가 브라우저한테 건내주는것 

//Middleware : 중간에 있는 소프트웨어,(request와 response사이의 중간) 브라우저가 request한다음, 그리고 내가(서버가) 응답하기 전 그사이에 미들웨어가 있는거여 즉, 사실 모든 controller는 미들웨어이고 모든 미들웨어는 controller다. 
//Middleware는 request를 response 하지 않고 계속 지속시켜주는 거야. 즉 middleware는 작업을 다음함수에게 넘기는 함수인거지. 응답하는함수가 아니고 

//원래 contorller에는 두개의 argument(req, res)말고도 하나가 더있다. 그건 바로 next
//next : 다음 함수를 호출해준다. 사용은 어떻게 하냐면 그냥 app.listen의 콜백자리에 앞에 순서대로 넣어주면 돼.                                            ex)app.get("/", gossipMidleware, handleListening) 사실 이렇게 되면 handleHome은 finalware긴 해. 그렇게되면 next가 필요없긴하지. 중요한건 모든 controller가 middleware가 될수 있다는거야.. 음 그니까 controller가 next함수를 호춣하면 미들웨어가 되는거고 그냥 리턴하면 컨트롤러인거지 뭐

const handleListening = () => console.log(`✅Server listening on port http://localhost:${PORT}🚀`);

app.listen(PORT, handleListening)
//서버가 사람들이 뭔가를 요청할 때 까지 기다리게 해야해. 바로 이 위의 app.listen 코드를 통해서  
//그리고 이안의 콜백함수는 서버가 시작될 떄 작동하는 함수다. 


------------------------------------------------------------------------------------------------------------------------------------

1. morgan middle ware

morgan('combined', {
    skip: function (req, res) { return res.statusCode < 400 }
  })

  morgan 함수를 호출하면, 내가 설정한 대로 middleware를 return 해준다. 

  -> morgan("dev") : req의 메소드, path, 상태코드, 응답시간 을 console.log 해준다.
  -> morgan("combined") : req의 시간, 메소드, http버전, 사용중인 브라우저, os등을 보여준다.

  이렇듯 morgan 미들웨어를 사용하게되면 그냥 next()해주는게 아니라 정보를 보여주고 넘겨주는거지 아주 유용하지 

  2.Router
   : 나의 컨트롤러와 URL의 관리를 쉽게 해준다. 쉽게말해 miniapplication을 만들게 해주는거지.

   자 우리의 라우터를 만들기전의 플랜.
   프로젝트에 대해 생각해볼 떄 가장 먼저 생각해야하는건 데이터다.
   어떤 종류의 데이터를 데이터를 사용할 것인가,.
   우리의 위튜브에는 총 2가지의 데이터가 있다. 1. 비디오, 2. 유저
   이 2가지가 우리 프로젝트의 도메인이다.  

   -. README에 적혀있듯 우리의 URL은 뭔가를 수정하거나 프로필을 삭제하거나 하는 행동들을 나타낸다.

   /delete-video -> /videos/delete 요렇게 바꿔줌으로서 라우터는 우리가 작업중인 주제를 기반으로 URL을 그룹화해준다.

요렇게 아래처럼 구분해줄수 있는거지

1. 글로벌 라우터
/ -> Home
/join -> join
/login -> login
/search -> Search

2.유저 라우터
/users/edit -> Edit Profile for User
/users/delete -> Delete Profile for User

3.비디오라우터
/videos/watch -> Watch Video
/videos/edit -> Edit Video
/videos/delete -> Delete Video
/videos/comments/delete -> Delete A Comment on a Video




워떻게 localhost:4000/users/edit 로 들어가면 딱 내가 원하는 Edit User가 나오는걸가?
나는 따로 경로를 /uesrs/edit 요렇게 지정해준적이 없는디?

일단 우리는 맨 아래에 있는 app.ues("/videos", videoRouter)를 이용한거여 
그래서 요 라우터(app.ues("/videos", videoRouter))가 express 한테 누군가가 "/videos"로 시작하는 url에 접근하면  
videoRouter에 있는 컨트롤러를 찾게 하는거다.
그리고 이 videoRouter안에는 "/watch"라는 url이 하나있다.

즉
누군가 와서 '/videos'로 시작하는 url을 찾는다면 
express는 여기[app.ues("/videos", videoRouter)] 있는 videoRouter 안으로 들어갈거다
그리고 videoRouter는 한가지 루트 "/watch" 밖에 없다.
그러니 우리는 videos 안의 '/watch'에 있는거다.. 
이게 '/videos/watch' 라는 url이 만들어진 방법이다.
그 다음엔 Express가 videoRouter.get("/watch", handleWatchVideo); 에서의 handleWatchVideo 함수를 실행할건데 
그러면 "Watch Video"를 반환하는거지 \




CLEAN CODE
1. 우리는 서버를 시작하도록하는 애플리케이션을 구성하고 있따.-> app.use(어쩌고)
2. 그리고 3가지 라우터를 만들고 있다 -> userRouter, globalRouter, videoRouter
3. 이 라우터들을 이용하고 있고 컨트롤러도 있따. -> 이게 재앙의 시초점이 될 수 있다. -> 왜냐면 컨트롤러들은 앞으로 존나 많아질거기 떄문 
    -> 그렇기에 우리는 이걸 쪼개서 정복해나갈것이다. -> 뭘로 쪼개냐 바로 컨트롤로와 라우터로 쪼개는거지 

    3-1. router라는 폴더를 만들어서 그 폴더 안에 각 3개의 라우터 파일을 만든다
     -> 그안에는 각각 express 를 새로 임포트해줘야한다. 왜냐면 우리가 만들고 있는 파일들은 다 하나의 모듈이기 때문. 그리고 그것들은 각각 독립되어있다.
     -> 그러니 한 파일안에서도 돌아가는 환경을 코드로 만들어야한다. 
    3-2. 각각의 Router 파일들을 server.js 로 불러와야한다. 
     -> server.js에서 import 하면돼 근데 import 하기전에 export먼저 해야겠지 왜냐하면 모든 파일들은 다 모듈이니까. 
     -> 근데 또 파일을 통쨰로 import 하고싶진 않아 라우터만 import 하고 싶어, 변수만 import 하고싶어 그러니 default export 라는걸 쓴다네..
     ->자 일단 아래처럼 export 하고

     ** export 방법 ************************************************************************************************************
     import express from "express";
        
     const globalRouter = express.Router(); <- 여기서 글로벌 라우터를 만들었고 
  
     const handleHome = (req, res) => res.send("Home"); <- 여기서 글로벌 라우터를 설정했고 
  
     globalRouter.get("/", handleHome); <- 여기서 글로벌 라우터를 설정했고 그 다음에 default로 글로벌 라우터를 export 하려고 한다. 

     export default globalRouter; <- 이렇게 하면 글로벌라우터를 export 하는겨 변수를 export 하는 거다잉. 그리고 그걸 디폴트로 하는거고 

     그래서 누구든 globalRouter.js를 import 하면, globalRouter 자체를 임포트하게 되는겨 

     만약 export 하지 않으면 에러가 뜬다, 'Router.use는 오브젝트가 아닌 미들웨어 함수가 필요하다' 라는 에러가 뜬다. 

    정리 : 내 프로젝트에 있는 모든 파일들은 분리된 모듈이다. 그래서 무언가를 바깥에 공유하기 위해서는 export 를 먼저 해줘야 한다.
          위의 경우는 globalRouter 라는 변수를 지금 export 하고 있는거다.  
          한가지 좋은점은 이게 default export 이기 때문에  server.js에 이름을 같게 유지할 필욘 없다.
          import lololololo from "./routers/rootRouter"; <- 이렇게 해도 된다는 거지 


     ************************************************************************************************************************

     -> import globalRouter from "./routers/rootRouter";import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
 코드를 이용해 글로벌 라우터를 임포트

     즉 정리하자면
     유저가 "/videos" 로 시작하는 url 에 들어가면 -> express 는 비디오 라우터 안에 들어가 -> 그다음에 비디오 라우터에서 express 는 url의 나머지 주소를 찾아
      그렇기 때문에 우리가 따로 /videps/watch 로 경로를 안찾고 그냥 videoRouter.get("/watch", handleWatchVideo); 로 찾을수가 있는거지.
      왜냐하면 우리는 이미 videoRouter안에 있고 videoRoutersms dlal '/videos' 니꼐능. 그리고 express 는 그걸 알지 


%%%요 아래부터는 이제 각 미니어플리케이션같은 라우터들을 손볼겨, 라우터는 url의 시작부분일 뿐이라는걸 기억해 
 즉, express 가 url을 보고 "/users" 로 시작하면 userRouter 로 가는겨야 그리고 userRouter 안에서 그다음 주소인 '/edit' 를 찾을거야

 지금 보면 라우터 안에 컨트롤러를 같이 넣어서 쓰고 있는데 이게 괜찮아 보일수 있어 하지만 우리의 컨트롤러는 앞으로 존나 많아지고 복잡해 질거야 
 그래서 우리는 라우터와 컨트롤러를 섞어서 쓰는게 좋지 않다는걸 깨달아야해 왜냐면 컨트롤러는 함수거든 그리고 라우터는 그 함수를 이용하는 입장인거고 
 그러니 둘을 같은곳에 두면 안되는거야 말이 안된다네 니꼬가  
 왜냐면 저 파일 이름은 videoRouter.js 잔여 videoRouter&videoController.js 가 아니라 
  
 그러니 컨트롤러를 위한 폴더를 따로 만들어서 정리 할거야 
 근데 userController.js 랑 videoController.js는 있는데 globalController.js는 없지 왜일까
 왜냐면 join 이나  누가 할까 바로 user 지 그래서 그 컨트롤러는 userController.js 파일에 들어갈거야 
 그리고 홈으로가면 뭐가 보이지? 비디오지 그래서 그건 videoController.js 에 들어갈거야.
 globalRouter 는 url을 깔끔하게 하기위해 쓰는거일 뿐이야.

 그럼 따로 만든 컨트롤러돌을 어떻게 라우터(파일) 로 가져올까?

 export 하면 되는데 아까 라우터처럼 default export lalalala; 이렇게 하면 안되지 하나의 변수만 export 할 수 있자나
 
 그러니

export const trending = (req, res) => res.send("Home Page Videos");
export const watch = (req, res) => res.send("Watch");
export const edit = (req, res) => res.send("Edit");

위와 같은 방식으로 모든 놈들을 다 export 하는 거지
그럼 이걸 어떻게 import 할까
 
import { join } from "../controllers/userController";
import { trending } from "../controllers/videoController";
-> 요렇게 하지

중요한게 디폴트로 익스포트할 때 는 
내가 원하는 어떤 이름으로던지 임포트 할 수가 있어. 왜냐면 default export 니까능. 하나만 내보냉게
하지만 export const edit = (req, res) => res.send("Edit"); 요런식으로 하게되면
impoert 할 떄 도 실제이름 똑같이 써야혀  
import { 컨트롤러에있는거랑이름이같아아혀 } from "../controllers/userController";
import { postEdit, postUpload, upload } from "./controllers/videoController";
import nodemon from "nodemon";

자이렇게 좋은 아키텍처가 생겼어 
라우터폴더, 콘트롤러폴더, 서버 도 있어 



------------------------------------------------------------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/:id 
-> 이게 무엇이냐. 이건 Parameter라고 부른다.  
굳이 id 일필욘 없어 /:potato 라고 해도 돼.
중요한건 이거로 URL 안에 변수를 포함시킬 수 있게 해준다는거지. 
만약 이 파라미터라는게 없다면 모든 영상마다 라우터를 새로 만들어야 한다.
ex)
videoRouter.get("/1", see);
videoRouter.get("/2", see);
videoRouter.get("/3", see);
.
.
.

이렇게 일일히 만들어줄수가 없는거다. 유저는 우리가 자는동안에도 영상을 만들수 있으니까.

그래서 이 Parameter를 사용하면 
유저가 "videos/12121212" 를 입력하면  Express 가 알아서 저 12121212를 /:id 에 넣어주는거지

즉 저 '/'뒤에 ':' 를 붙여주는건 express 한테 이게 변수라는걸 알려주기 위핵서야
그리고 express는 request 오브젝트에 이 파라미터(id)를 보내주지. 객체 방식으로 { parameterName: 'parameterValue'} 요렇게

ex)
videoRouter.get("/:id", see);

export const see = (req, res) => {
    console.log(req.params );
    return res.send("Watch");
}

라우터와 컨트롤러를 위와같이 설정하고 "/video/blabla" URL로 접속하면
콘솔창에 { id: 'blabla'} 를 확인할 수 있다.

리퀘스트 오브젝트는 리퀘스트에 대한 정보를 담고 있고 아주 유용하다.


-. 왜 아래의 순서처럼 라우터를 설정해놨을까?
 왜 '/upload'를 '/:id' 보다 위에 올려놓았을까?

videoRouter.get("/upload", upload);
videoRouter.get("/:id", see);
videoRouter.get("/:id/edit", edit);
videoRouter.get("/:id/delete", deleteVideo);

왜냐면 express는 top2btm 방식으로 코드를 볼텐데

만약
videoRouter.get("/:id", see);
videoRouter.get("/upload", upload);
videoRouter.get("/:id/edit", edit);
videoRouter.get("/:id/delete", deleteVideo);

이 방식으로 한다면 /videos/upload 의 URL을 요청했을때
upload 마저도 video의 id로 인식해서 see 컨트롤러를 실행시키기 때문
순서 잘보고 허자



-, 정규표현식으로 videos/:id에서 id값으로 숫자만 받아오고싶다면
videoRouter.get("/:id(\\d+)", see);  요렇게 해야한다.
요렇게 하면 videos/adsasdasd 로 리퀘스트하면 에러뜸.

이렇게 설정해 주면 upload를 굳이 위에 둘 필요가 없지.

videoRouter.get("/:id(\\d+)", see);  
videoRouter.get("/:id(\\d+)/edit", edit);
videoRouter.get("/:id(\\d+)/delete", deleteVideo);
videoRouter.get("/upload", upload);

이렇게 해도 무방.


------------------------------------------------------------------------------------------------------------------------------------

페이지를 만들 때 우리가 실제로 반환하고자 하는건 그저 텍스트가 아니지
HTML 을 반환을 해줘야하는데 그렇다고 컨트롤러 코드에 다 적을 순 없지
그걸 위해 존재하는게 PUG 다. 
(pug은 express 를위한 패키지다.)

PUG는 템플릿엔진이고 이걸 이용해서 뷰를 만드는걸 도울수 있다. 

설치하고, Express에게 html 헬퍼로 pug를 쓰겠다고 말해야한다. 

일단 app이 있으면 app 에서 내가 원하는 어떠한 것이든 설정할 수 있다.
그러기에 우리는 뷰엔진을 설정할 수 있다.
우리가 쓰려는 pug 가 바로 뷰엔진이다.  
이제 express 에게 이제부터 우리가 사용할 뷰엔진이 pug라고 말해주어야한다. 

server.js 에 
app.set("view engine", "pug"); 
라고 입력 한다. 이렇게 하면 pug를 사용할 수 있다. 
이게다야...? 
뷰엔진을 그냥 pug라고 세팅하는거짐 뭐 시발 이게 뭔 

이제 express 는 html 을 리턴하기 위해 pug 를 사용할 거다. 

정리하자면
1단계 : pug 를 설치한다. -> npm i pug
2단계 : pug 를 뷰엔진으로 설정한다. -> app.set("view engine", "pug"); 
3단계 : 실제로 pug 파일을 생성한다. 

***pug 코드 예시**********************************************************************************************************************
doctype html 
html(lang="ko")
    head 
        title Wetube 
    body 
        h1 Welcome to Wetube 
        footer &copy: 2022 Wetube     
************************************************************************************************************************************


기본적으로 express 는 views폴더(어디있는겨? express 패키지 폴더안에있는 그 view 인가 보다.) 안에 있는 파일을 찾는다. 
그리고 세팅도 고쳐준다. 
무슨세팅이냐면 view 에 대한 세팅이다. 
어플리케이션의 뷰에대한 디렉토리나 그 배열을 담고 있는 그 세팅

근데 그래도 좀 뭔가 납득이 되는건
app.set("view engine", "pug"); 
여기서 app 이 express 패키지 어플리케이션인거자나
그것 set 한다는 구문이니 얼추 이렇게 하면 뷰엔진이 내가 다운로드 받은 pug로 설정된다는게 좀 받아들여지네.

그리고 이 문맥안에서 뷰나 템플릿이나 html이나 뭐 일단 다 같은말이야
process.cwd() + '/views' 
뭐 위에같은 이런 방법으로 
express 는 현재 작업 디렉토리에서 /views라는 디렉토리를 찾아 
아 그건 그말은 우리가 /views라는 폴더를 만들어야 한다는걸 의미한다...
그리고 그 폴더 안에 pug 파일을 만들면 그걸 찾는거지... 

그리고 그 파일을 바로 그냥 유저에게 보내는게 아니야, 바로 그냥 send 하는게 아니라고
그 파일을 우선 pug 로 보내고 
pug 가 이 파일을 렌더링해서 평범한 html 로 변환해 줄거야. 

그러니까 유저는 home.pug 를 보는일이 없고 
우리가 pug 로 파일을 보내면 pug가 이파일을 평범한 html로 변환해 줄거야 
그러면 유저는 그걸 보는거지 

그리고 이 pug파일을 유저에게 보내는 방법은 

아래와 같이 Controller 를 만드는 거지 

****************************************************************************************
export const trending = (req, res) => {
    res.render("home"); <- 여기다가 view 를 적는거고 그 view 의 이름이 "home" 이다. 우리가 만든 pug 파일이름.
};
****************************************************************************************

위와같이 컨트롤러를 작성하면 우리는 home.pug 파일을 렌더링 하는것이다
이제 express 는 우리가 pug를 쓴다는걸 알거다. 
우리의 템플릿 엔진(뷰엔진) 으로서 말이지 

왜냐면 우리가 아까 server.js 파일에다가 app.set("view engine", "pug"); 이걸 했짠여

그리고 우리는 또 express 가 vuews 라는 디렉토리에 있는 view(home.pug) 를 본다는걸 안다. 
그래서 우리는 따로 임포트 할 필요도 없는거고 
왜냐면 express 가 views 디렉토리에서 pug 파일을 찾도록 설정되어있어서 
우리가 해야하는건 그저 res,render 로 home.pug 를 렌더링 하는거 뿐이여  

(랜더링이란 html,css,JavaScript등 개발자가 작성한 문서를 브라우저에서 그래픽 형태로 출력하는 과정을 말한다.//퍼옴)

앞으로 자주 보게될 에러여. 
Error: Failed to lookup view "home" in views directory
-> express 가 views 디렉토리에서 home 파일을 못찾았다는 뜻.
폴더 경로 조진경우니까 폴더 경로 잘 설정해 
우리같은 경우는 ./src/views 요렇게 찾았어야했지
app.set 으로 views 찰으려니까 server.js 에서 찾으려 해도 wetube 폴더부터 찾네
기본적으로 express 는 cwd + /views 에서 pug 파일을 찾아.
cwd = current working directory

console.log(process.cwd()); 하면 현재 경로를 알 수 있다. 

cwd 는 서버를 기동하는 파일의 위치에 따라 결정된다. 
어디서 노드를 부르고 있는지에 따라 결정된다.  
즉, 어디서 노드를 부르고 서보를 기동하고 있는가를 말한다. 

자 그럼 누가 서버를 가동하냐 바로 package.json 이지!!!

우리가 wetube안에 있는 package.json 에서 node.js 를 실행하고 있기 때문에 
이 디렉토리가 현재 작업 디렉토리가 되는거다 <- wetube 디렉토리 말이지 
server.js 가 있는 src 폴더가 아니고!~


--------------------------------------------------------------------------------------------------------------

1/8 
즉 현재 작업 디렉토리는 node.js 를 실행하는 디렉토리다.(최상위 wetube 폴더) 

Contoller에서 app.render 를 사용해서 home.pug 파일을 찾으려 해도 
views 파일을 wetube폴더내에서 직접적으로 찾을수가 없다(wetube폴더 안에 src폴더 안에 있으니)

views 디렉토리를 src 디렉토리 밖으로 꺼내주면 가능하긴하지만 그건 너무 구린 방법이다. 
그래서 우리는 views의 설정을 바꿀거다. 
 
server.js 에서 
app.set("views", process.cwd() + "/src/views");
-> 위의 코드를 통해서.. 그럼 끗..
-> 그니깐 디폴트값은 "현재작업 디렉토리 + /views"인데 우리의 경우에는 '현재작업 디렉토리 + /src/views' 로 바꿨다고 할수있다. 

app.set("views", process.cwd() + "/src/views"); 코드를 통해 views를 src폴더 안에 넣어도 동작할수있게 된다. 


-.이제 Controller 에서 그냥 텍스트데이터를 보내주던걸 pug를 이용해서 html파일들을 보내주는거로 수정할건데
pug가 뭐가 좋은지는 알고 써야 할것 아니여 

pug의 좋은점은
물론 간단한 방식으로 html을 작성할 수 있다는 것도 좋지만 그게 최고의 장점은 아니다. 
pug의 최고 장점은 반복할 필요가 없다는 거다. 

아래의 pug코드의 년도부분을 현재에 맞춰줄 필요가 있다. 
pug는 자바스크립트이기 때문에 우리는 pug에서 자바스크립트를 사용할 수 있다.
#{}<- pug안에서 자바스크립트를 사용하는 방법
****************************************************************************************************
doctype html 
html(lang="ko")
    head 
        title Wetube 
    body 
        h1 Watch Video!
        footer &copy: 2022 Wetube 
        -> footer &copy: #{new Date().getFullYear()} Wetube     
****************************************************************************************************
자 이제 좋은점을 알았으니 Controller들을 바꿔주자. 

return res.send(`Watch Video #${req.params.id}`);
 -> res.render("watch"); 요런식으로 render 로 하면 따로 return 해줄 필욘 없는거 같다. 
    -> render 할 떄 파일이름 pug파일 이름이랑 일치해야한다는것 잊으면 안됨.render
    -> pug파일 이름지을 때 유의사항 
    1. 파일명은 띄어쓰기가 있으면 안됨!
    2. 파일이름에 대문자 넣으면 안됨! 전부 소문자여야됨!!

     
자 이제 우리는 템플린(= 뷰 = html) 에 어느 자바스크립트 코드라도 넣을 수 있다는걸 배웠고
물론 자바스크립트 코드는 유저의 브라우저로 가지 않고 유저가 보기전에 평범한 텍스트로 변환된다. 
그게 바로 렌더링..
그니까 이게 퍼그가 하는일인데
pug는 이 pug코드를 받아서 모든걸 체크하고 자바스크립트를 실행한다. 
그리고 나서 그걸 유저에게 제공한다. 
그게 바로 렌더링.. 반복이쥬? 

그치 위의 pug 코드를 예시로 보자면 Pug 코드안에는 날짜를 표시해주는 자바스크립트가 있지만
pug가 유저에게 가기전에 이미 다해석해서 평범한 텍스트로 변환하여 유저에게 보내주기 때문에
유저는 어떠한 자바스크립트 코드도 볼수가 없는것이다. 

근데 우리는 문제가 있지 
뭐가 문제냐면 우리는 반복을 이미 하고 있지 
우리는 모든 페이지에 똑같은 footer를 넣고 싶은데 그걸 모든 pug 파일에서 반복하고 있자나 
그러니 footer 를 바꾸려면 보든 페이지에 들어가서 바꿔줘야하는 번거로움이 있지. 
 -> 그걸 위해 존재하는게 'partial'  요것이 pug의 진정한 강점이지 

어떻게 사용하는지 한번 araboza

1. views 폴더안에 partials 폴더를 만든다. 
2. partials 폴더안에 footer.pug 파일을 만든다. 
3. footer.pug 파일안에 반복적으로 사용되는 pug코드를 넣는다. 
 -> 우리의 경우는 / footer &copy: #{new Date().getFullYear()} Wetube /  가 되겠지.
4.  include partials/footer.pug / 코드를 pug코드의 원하는 위치에 입력 
 -> 'include + 원하는 파일이 있는 위치' 요렇게 넣어주면 Pug 가 알아서 가져와서 넣어줌 개꿀.
 -> 불러오려고 하는 파일이 있는 위치가 기준이다. 헷갈리지 말자  

즉, pug의 장점은 
1. 깔끔한 html을 작성하도록 해준다. 
2. 우리의 html에 자바스크립트를 포함시킬수 있다. 
3. 우리가 반복하지 않아도 되고 한 파일로 모든 템플릿을 업데이트 할 수 있다. 
 
하지만 한가지 더 문제가 있지 
개발자들은 반복이라는걸 존나 극혐하기 때문에 
 include partials/footer.pug 이 코드조차 복붙하는것이 싫다. 이 존나 게으른 천재들 
아니 그냥 doctype html 이런것도 다 반복되니까 그냥 다 꼴보기 싫은거지 

doctype html 
html(lang="ko")
    head 
        title Wetube 
    body 
        h1 Edit <- 이부분만 바뀌는거잖아 사실 나머지는 고대로 가져다 쓰는거고
    include partials/footer.pug
         


그래서 우리는 이제    inheritance(상속) 이라는 개념을 배우고 사용할것이다. 

상속이란 일종의 베이스를 만들어 준다. (레이아웃의 베이스, HTML의 베이스 등등..)
그러면 이제 모든 파일들이 그 베이스에서부터 확장해 나가는거지 

적용 방법
1. base.pug 파일을 만든다.
 ->
 doctype html 
html(lang="ko")
    head 
        title Wetube 
    body 
        h1 Base!
    include partials/footer.pug
         
2. edit, home, watch.pug 파일의 내용을 비워주고
그안에 만든 base를 확장(extends) 하게 한다. 

extends base.pug <- 요렇게 적어주면 됨. 

이렇게 되면 홈으로 들어가면 Base! 가 보이게 되곘지(video로 들어가도 똑같겠지 edit도 마찬가지고)

extend 라는게 이런거다. 베이스가 되는 파일을 그대로 가져다가 쓰는것. (복붙하는거랑 같은겨)

근데 이렇게 되면 어딜 들어가든 다 Base!만 보이게 될텐데 이건 우리가 원하는 바가 아니다. 

그러니 이제 '블록' 이란걸 배워보자, 블록은 템플릿의 창문같은거다. 
그 창문에다가 이것저것 집어 넣는거지 창문, 문, 공간, 블록...등등등 
뭐든간에 일단 무언가를 집어 넣을 수 있는 곳이란 거다. 

자 그럼 pug 코드에서 블록을 어떻게 만들고 사용하느냐 

일단 기본이 되는 Base.pug 코드에서 
우리가 수정할 부분인 body 부분을 아래와 같이 수정한다. 
**************************************************************************************************************
doctype html 
html(lang="ko")
    head 
        title Wetube 
    body 
        h1 Base! <- 원래 이거였는데 이거 지우고
        block content <- 요걸 집어 넣는거다.
    include partials/footer.pug
**************************************************************************************************************        
위에서 뭔짓을 한거냐면 base.pug 에 content를 위한 공간이 마련된 거다.

이건 매우 유용한데 예를들어 home으로 와서, content 블록안에 어떤 내용을 넣고 싶다고 하자 

그러기 위해서는 home.pug 로 와서 아래처럼 block content 라고 입력 하고 그 밑에 넣고자하는 내용을 입력한다 
**************************************************************************************************************
extends base.pug 

block content
    h1 Home!
**************************************************************************************************************  

그러면 이제 홈으로 가면 Home! 이 보이게 된다. watch, edit 에도 마찬가지로 해주면 각가 이제 원하는 것이 나오게 된다. 

즉, 우리의 home.pug, vidio.pug, edit.pug 파일들은 basic.pug 파일을 확장(extends) 하고 있기 때문에 
우리는 content의 내용을 집어 넣을 수 있게 된다는 거다. 
 -> 파일을 확장하면, 그 파일이 되는거다.  그러나 몇몇 부분을 지정해서 바꿔 줄 수 있다. 
 -> 그리고 그 블록에는 Javascript 를 집어넣을수도 있지. 

그럼 우리는 이제 URL을 바꿀때마다, 타이틀을 바꿔볼거다. 
일단 base.pug 파일을 아래와 같이 바꿔준다. 
         
**************************************************************************************************************
doctype html 
html(lang="ko")
    head 
        title Wetube <- 원래 이거였던걸
        block head <- 요렇게 블록화 해준다. 
    body 
        block content 
    include partials/footer.pug
**************************************************************************************************************  


다시 정리 하자면 우리가 content 나 head 같은 블록을 만드는건 
한마디로 다른 pug 파일들이 내용을 채워넣을 공간을 마련 하는거다. 
그리고 각 pug 파일들을 아래와같이 수정하여 head 블록의 내용을 수정해 준다.
 
**************************************************************************************************************
extends base.pug 

block head 
    title Home | Wetube  <- 요걸 넣어서 head 블록을 채워준다.

block content
    h1 Home!
**************************************************************************************************************  
    
근데 우리는 아직도 반복하는게 있다. 
title 태그라던지 | Wetube 라던지 이건것들의 반복은 어떻게 없애는지 알아보자.  


doctype html 
html(lang="ko")
    head 
        title #{pageTitle} | Wetube <- 요부분이 바뀐건데
    body 
        block content 
    include partials/footer.pug
         
이 pageTitle 이란 변수를 우리가 어떻게 보내줄수 있을까 = 어떻게 템플릿으로 변수를 보내줄수 있을까?
누가 템플릿을 렌더링 하는가? <- 컨트롤러가 렌더링 한다. 
일단 home.pug 를 예시로 할 때
home.pug(이하 home) 는 trending 컨트롤러 함수에서 온다.
trending 이 home을 렌더링하는 녀석이라는 거지. 
그리고 home은 base.pug 다.(base.pug 에서 확장된것이다.)
그래서 base.pug를 열어보면, base.pug는 pageTitle 이라는 변수가 필요하다. 
그러니 변수를 여기 pageTitle 로 보내보자. 
그 방법은 아래와 같다. 

(videoController.js 내부 소스)
export const trending = (req, res) => res.render("home", {});

위와 같이 pug파일을 가져오는 변수에서 쉼표를 쓰고 이안에 템플릿으로 보내고 싶은 모든 변수를 쓰는거다. 

그러니 렌더는 2개의 인수를 받는다. 
1. view의 이름 
2. 템플릿에 보낼 변수

그러면 이렇게 적으면 되겠지

export const trending = (req, res) => res.render("home", {pageTItle: "home"});

이렇게 적은 후 home 파일을 렌더링 하면 home파일은 base.pug 가 될테고 
base.pug 는 pageTitle 을 찾을 거야. 
우리는 res.render안에 pageTitle 을 전해 줬다. 

!!아 그리고 render 를 사용하면 express는 이미 템플릿을 렌더링하도록 설정되어있다. 


****************************************************************************************************************
doctype html 
html(lang="ko")
    head 
        title #{pageTitle} | Wetube <- title에서는 이렇게 #{} 으로 묶어줘야 하지만
        link(rel="stylesheet" href="https://unpkg.com/mvp.css")
    body 
        header  
            h1=pageTitle <- h1 에서는 이렇게 '=변수이름' 으로 적어주면 변수로 인식한다., 물론 #{변수이름} 으로 적어줘도 되고
        main 
            block content 
    include partials/footer.pug
         
****************************************************************************************************************

****************************************************************************************************************
근데 위에서 h1=pageTitle 로 적은 이유는 변수를 다른 text와 섞어서 쓰고있지 않기 때문 그래서 저렇게 적을수 있는거임. 
다른 텍스트와 섞어서 쓰면 저방법 불가

doctype html 
html(lang="ko")
    head 
        title #{pageTitle} | Wetube 
        link(rel="stylesheet" href="https://unpkg.com/mvp.css")
    body 
        header
            if fakeUser.loggedIn <- 이렇듯 pug에서도 조건문을 사용할 수 있다. 
                small Hello #{fakeUser.username}
            nav     
                ul 
                    if fakeUser.loggedIn
                        li 
                            a(href="/logout") Log out 
                    else         
                        li 
                            a(href="/login") Login   
            h1=pageTitle 
        main 
            block content 
    include partials/footer.pug
****************************************************************************************************************          



-. Iteration in PUG

****************************************************************************************************************
-> controller 에서 이렇게 아래처럼 배열을 만들어 주고
export const trending = (req, res) => {
    const videos = [1,2,3,4,5,6,7,8,9,10];
    res.render("home", {pageTitle: "Home", videos});
};

-> PUG에서 아래와 같이 반복문과 비슷한 형식으로 사용이 가능하다. 
    위의 videos array 안의 각 element에 대해서, list item을 만들어서, video를 그안에 넣어주는거다. 
    물론 꼭 video라고 안해도 돼 potato 라고해도 돼 그냥 배열안의 값을 나타내주는 말이다.
    단 videos는 controller부분의 videos와 같아야한다 꼭. 

    
    extends base.pug 

    block content
        h2 Welcome here you will see the trending videos
        ul 
            each video in videos  
                li=video <- 물론 li #{video} 이렇게 해도 메이꽌시
            else <- 이걸 쓰면 우리의 똑똑한 PUG는 배열안에 값이 있는지 없는지도 알아준다. 이건 Javascript가 아닌 그냥 PUG다.
                   <- 이전에 if, else 썻던건 Javascript가 맞다. 
                li Sottty nothing found.

****************************************************************************************************************
 

-. mixin의 개념 : base.pug 에서 봤던 partial 과 비슷. paritial 이긴 한데 데이터를 받을 수 있는 partial 이다. 

****************************************************************************************************************
-> 아래와 같이 비디오 객체를 만들어 놓고 
export const trending = (req, res) => {
    const videos = [
        {
            title: "First Video",
            rating: 5,
            comment:2, 
            createdAt: "2 minutes ago",
            views: 59,
            id: 1
        },
        {
            title: "Second Video",
            rating: 5,
            comment:2, 
            createdAt: "2 minutes ago",
            views: 59,
            id: 1
        },
        {
            title: "Third Video",
            rating: 5,
            comment:2, 
            createdAt: "2 minutes ago",
            views: 59,
            id: 1
        }
    ];
    res.render("home", {pageTitle: "Home", videos});
};



-> 요렇게 해주면

extends base.pug 

block content
    h2 Welcome here you will see the trending videos
    ul 
        each video in videos  
            div 
                h4=video.title 
                ul 
                    li #{video.rating}/5
                    li #{video.comment} comments.
                    li Posted #{video.createdAt} createdAt.
                    li #{video.views} views.      
        else 
            li Sottty nothing found.

-> 이것이 component라 불리우는 우리의 video 였다... 

**************************************************************************************************************** 
근디 우리는 저 component 들을 갱장히 자주 쓸것이고 우리는 개발자이고 개발자는 반복을 존나 피해야하고
그래서 복붙은 최소화 하되 똑같은 구조를 재사용 할것이다. 

고래서!! mixin 이라는걸 써볼거다. 
다시말하자면 mixin은 partial 같은 건데 데이터를 받을 수 있는 일종의 미리 만들어진 HTML block 이라고 볼수있다. 

우리가 이전에 partial을 만들 때는 별로 해준게 없었다. 그냥 HTML 일 뿐 근데 mixin은 조금 할게 있다. 
->아래와 같이 mixin을 사용하는 pug 파일을 하나 만들어 주게 되는데 이렇게 하면 괄호안의 받는 info는 객체가 되었고
    아래의 pug 코드는 info에 의거하여 얻게되는 HTML 이다. 즉, info는 mixin이 받게 될 데이터를 지칭한다. 
    그렇다면 이 mixin 파일을 어떻게 사용하느냐 
****************************************************************************************************************
    mixin video(info) 
    h4=info.title 
    ul 
        li #{info.rating}/5
        li #{info.comment} comments.
        li Posted #{info.createdAt} createdAt.
        li #{info.views} views.       

    -> home.pug에서 이렇게 사용하면 되지.(너무 video를 많이 써서 potato로 바꿧다 이름을 헷갈릴까봐)
        이렇게 하면 videos 안의 각각의 potato에 대해서, video라는 mixin을 호출해서('+video'가 mixin을 호출하는 부분)
        potato라는 정보 객체를 보내주고 있는거야 mixin하고 있는 파일에 말이지 
        그리고 그 보내진 객체는 video mixin 안의 info 가 될것이다.

    -> 이제 이 mixin은 어디서든 가져다가 쓸 수 있다. 검색페이지, 사이드바, 채널페이지 등등 아무곳이든 

        (home.pug)
        extends base.pug 
        include mixins/video  <- 여기서 video mixin을 가져온다. 

        block content
            h2 Welcome here you will see the trending videos 
            each potato in videos  
                +video(potato) <- 여기서 객체정보를 mixin으로 보내준다. 그리고 위의 mixin 파일에서 그정보를 이용해 HTML로 표기 
            else 
                li Sottty nothing found.
****************************************************************************************************************



DATABASE!!!!!!!!!!!!!!!!!!!!!!!!!
 -> 엄청 멋진 DATABASE 챕터의 시작 
 
 그전에 back end에 데이터를 어떻게 보내는지 먼저 배워야한다. 
 왜냐면 back end 에 데이터를 저장하는게 요점이기 때문이지 
 우리는 지금 데이터를 받기만 하니 이걸 저장할 수 있어야 한다. 

videoRouter.js 를 보면 우리가 하고있는건 get 빢에 없다. 
우리는 post 하는법을 배워야한다. 


-> 아래와 같이 vidoes 객체를 trending 컨트롤러에서 밖으로 뺴주면 모든 컨트롤러에서 사용할 수 있다. 
   videos 는 우리의 가짜 DATABASE 라고 생각하자. 


*********************************************************************************************************
let videos = [
    {
        title: "First Video",
        rating: 5,
        comment:2, 
        createdAt: "2 minutes ago",
        views: 59,
        id: 1
    },
    {
        title: "Second Video",
        rating: 5,
        comment:2, 
        createdAt: "2 minutes ago",
        views: 59,
        id: 2
    },
    {
        title: "Third Video",
        rating: 5,
        comment:2, 
        createdAt: "2 minutes ago",
        views: 59,
        id: 3
    }
];

export const trending = (req, res) => {    
    res.render("home", {pageTitle: "Home", videos});
};
export const see = (req, res) => res.render("watch");
export const edit = (req, res) => res.render("edit");
export const search = (req, res) => res.send("Search");
export const upload = (req, res) => res.send("Upload");
export const deleteVideo = (req, res) => {
    return res.send("Delete Video");
};
*********************************************************************************************************


우리의 미션 
1. 나의 가짜 DATEBASE 에 있는 모든 비디오들을 나열 
    -> 그건 이미 해결 home.pug가 비디오를 나열하고 있다.  
2. 유저가 하나의 비디오를 볼수 있게 한다. 
    -> see 컨트롤러 수정 필요 
    -> 왜냐면 videoRouter.get("/:id(\\d+)", see); 요기서의 url이 나를 위해 작동하길 바라기 떄문 
3. 비디오를 업로드 및 수정 


2번 미션 
 : 유저가 하나의 비디오를 볼 수 있게 한다. 
 = 제목을 클릭했을 때, /video/id넘버 로 이동 하도록 하게한다. 그러기위해선 이들을 위한 HTML을 누가 만드는 건지 찾아야한다. 
  -> 그건 바로 mixin 그러니 mixin을 수정해보자. 

*********************************************************************************************************
  mixin video(video) 
    h4 info.title
        -> 요렇게 되어있떤걸 아래와 같이 <a> 태그를 이용하여 클릭하면 갈수 있게 설정 
    h4
        a(href="/videos/#{video.id}")=info.title <- PUG에서 텍스트랑 변수 같이쓰는법 잊지 않았쥬??   
        -> 근디 이렇게 쓰면 'http://localhost:4000/videos/#{video.id}' 이주소로 간다. 
            그러니 템플릿 스트링을 사용하여야 한다. attribute 에는 사용할수없다.(href, class, id 뭐 이런것들)
            그러니 백틱안에 쓰는 방식을 사용해야한다. 
    h4
        a(href=`/videos/${video.id}`)=info.title <- 이게 맞쥬   
    ul 
        li #{video.rating}/5
        li #{video.comment} comments.
        li Posted #{video.createdAt} createdAt.
        li #{video.views} views.       
*********************************************************************************************************

 : see 컨트롤러를 수정한다. 

 export const see = (req, res) => {
    const id = req.params.id;
    const { id } = req.params; <- 요거랑 위에거랑 같은거여 ES6 문법인데 이게 더 보기좋다고하네.. 이 변태새끼들이 따라가자..
    res.render("watch");
} 

-----------------------------------------------------------------------------------------------------------------------------------
여기서부터어!@@@@!@!!!!!!@!@!@!@!정리시자악!!!@!@!@



Ternaty operator

아래의 코드는 watch.pug 이다. 여기서는 조회수를 보여주게 되어있다.
그런데 조회수가 만약에 1이라면 '1 views' 가 아니라 '1 view' 가 되어야 한다. 
조건문을 사용하면 된다. 
if문을 사용해도 되지만, 여기선 ternary operator를 사용해 볼것이다.
*********************************************************************************************************
(watch.pug)
extends base.pug 

block content
    h3 #{video.views} views 
    -> h3 #{video.views} #{video.views ===1 ? "view" : "views"} 
*********************************************************************************************************
 
Inline if문이며 ES6 부터 생긴 신규 문법  

-. Edit video
    -> 이제부터는 비디오를 수정하는 페이지를 만들거다. 

*********************************************************************************************************
(watch.pug)
extends base.pug 

block content
    h3 #{video.views} #{video.views ===1 ? "view" : "views"}
    a(href="edit") Edit Video &rarr; <- 오른쪽으로 향하는 화살표 만들어주는 HTML 태그
*********************************************************************************************************


위처럼 watch.pug 에 anchor를 하나 만들어서 미리 만들어 놓은 edit.pug 로 갈수있게 하려한다. 
근데 a(href="edit") 요렇게만 적어주게 되면 'localhost:4000/edit' 으로 가는게 아니라 
'localhost:4000/videos/edit' 으로 간다. 
a(href="/edit") 요렇게 하면 'localhost:4000/edit' 요기로 간다.

이게 머선 일이구?  

요게 바로 absolute 와relative url의 차이점 이다. 
만약 네가 hreg의 앞머리부분에 "/" 를 넣으면 a(href="/edit") 요런식으로 
너가 어디있든 상관 없다. 
그냥 'root경로 +/edit' 으로 가게 된다. 

근데 "/" 를 지운다? 그럼 relative url이 되는거다. 
a(href="edit") 요런거 말하는 거지 
이런거는 브라우저가 가장 끝부분을 바꿔주는 거다. 

-. 나는 videos/videos id/edit 이 경로로 edit anchor를 클릭했을 때 가고 싶다. 
    그걸 만들어 보자. 

*********************************************************************************************************
(watch.pug)
extends base.pug 

block content
    h3 #{video.views} #{video.views ===1 ? "view" : "views"}
    a(href="edit") Edit Video &rarr; // 이렇게 쓰게되면 video id가 사라지고 그자리에 edit이 오게된다. 
        -> a(href=`${video.id}/edit`) Edit Video &rarr;     
*********************************************************************************************************

요거다. 


-. 자이제 우리는 비디오 수정 페이지에 왔다.(구체적으로는 비디오3 에대한 수정 페이지)
우리한테는 id/edit 경로가 router에 등록되어있고 이것 edit 이라는 컨트롤러를 사용하는데 아직 이건 아무일도 안하니 여기에
watch 와 유사하게 뭔가를 만들어 보자 

1. 일단 무슨 비디오를 수정하는지 알아야 한다. 
********************************************************************************************************
(videoController.js)

export const edit = (req, res) => {
    const {id} = req.params;
    const video = videos[id-1]; 
    return res.render("edit", {pageTitle:`Editing: ${video.title}`}); 
};
********************************************************************************************************

2. 이제 edit 템플릿을 수정한다. 
 2-1 Title을 수정하기 위한 form을 만든다. 
********************************************************************************************************
(edit.pug)

extends base.pug 

block content
    h4 change Title of video 
    form(action="")
        input(placeholder="Video Title")
        input(value="Save", type="submit")
********************************************************************************************************

2-2 form에 데이터를 보내기 윈한 Controller 수정
이제 우리는 이 form을 통해서 수정하고자 하는 Title 제목을 'third video' 를 title로 가지는 객체에 보내 그 객체의 title값을 바꾸고자 한다.
->일단 edit.pug 안에는 pageTitle 이라는 변수를 쓸수 있다.(왜냐면 아까 컨트롤러에서 보내줬기 때문)
->근데 pageTitle은 'Editing: ' 로 시작하기에 이용하기 용이하지 않으니 그냥 video 객체를 edit.pug에 넣어준다. 

********************************************************************************************************
(videoController.js)
export const edit = (req, res) => {
    const {id} = req.params;
    const video = videos[id-1];
    return res.render("edit", {pageTitle:`Editing: ${video.title}`}, video);<- video 변수 추가
};
********************************************************************************************************

video 객체를 받는 edit.pug는 form 의 inputBox에 원하고자 하는 값을 넣을 수 있따. 
********************************************************************************************************
(edit.pug)
extends base.pug 

block content
    h4 change Title of video 
    form(action="")
        input(placeholder="Video Title", value=video.title, required)
        input(value="Save", type="submit")
********************************************************************************************************

2-3 이제 우리는 이걸 back end로 보낸다.(POST 방식의 이용)
1) POST 방식 설명 
우리가 만든 form의 save 버튼을 눌렀을 때 그값이 어디론가 가야겠지. 
그 가야할 곳이 edit.pug의 form 태그의 action 이라는 속성에 적혀있는거다. 
그값은 URL 이 될거다.  나의 서버가 가져야하는 URL 
근데 우리의 서버는 이미 edit 이라는 url을 가지고 있고 우리는 지금 그 edit url에 있다.(form을 보고있는 다면) 

차이점은 method 다. 
우리는 지금까지 계속 get 방식만을 사용했다. 왜냐하면 데이터를 똑같은 URL에 보내고 싶으니까. 
이제 post 방식을 사용할거고 이 메소드는 아직 우리 서버가 이해하지 못한다. 

********************************************************************************************************
(edit.pug)
extends base.pug 

block content
    h4 change Title of video 
    form(method="POST") <- 요렇게 하면 POST request 방식을 사용하여 데이터를 보내는겨
        input(placeholder="Video Title", value=video.title, required)
        input(value="Save", type="submit")
********************************************************************************************************

-. get 방식과 POST 방식의 차이 
1. get 방식으로 form을통해 서버에 리퀘스트 하는경우 주소창에 데이터가 다 나온다. 
2. POST 방식은 파일을 보내거나, database에 있는 값을 바꾸는 무언가를 보낼 때 사용한다. 로그인에도 사용한다. 당연하지 

ex)
1. GET 방식 
********************************************************************************************************
extends base.pug 

block content
    h4 change Title of video 
    form(action="/save-changes", method="GET")
        input(placeholder="Video Title", name="title",value=video.title, required)
        input(value="Save", type="submit")
********************************************************************************************************
위와같이 get 방식을 이용하여 서버에 리퀘스트를 보낼 경우 주소창에 
'http://localhost:4000/save-changes?title=Third+Video'
요렇게 다 정보가 포함이 되어있다. 
 -> 그렇기에 우리는 네이버나 구글처럼 비디오를 검색 할 때 사용할거다.


2. POST 방식
********************************************************************************************************
extends base.pug 

block content
    h4 change Title of video 
    form(action="/save-changes", method="POST")
        input(placeholder="Video Title", name="title",value=video.title, required)
        input(value="Save", type="submit")
********************************************************************************************************
위와같이 POST 방식으로 request를 보낼 경우 주소창에는 
'http://localhost:4000/save-changes'
요렇게 아까 GET 방식과는 다르게 url에 title이 없다. 

그리고 나는 별도의 url을 만들 계획이 없기에 저기 저 action 항목을 지울거다.

그리고 request를 보내게 되면 url의 변화 없이 POST 방식으로 request를 보낼수 있지 
우리가 save를 눌러서 리퀘스트를 보내도 우리의 서버는 post에 대해서 아는게 없다.  
이제부터 알려주자. 
 
2) 서버가 어떻게 POST 방식의 request를 이해하게 하는가
********************************************************************************************************

videoRouter.post("/:id(\\d+)/edit", postEdit);
-> 기존 GET 방식과 동일하지만 videoRouter.get 에서 videoRouter.post 로만 바꿔주면 된다. url은 동일
********************************************************************************************************

그리고 우리는 이 POST 방식의 요청이 들어왔을 때 처리해주는 함수를 만들어야하고 그게 'postEdit' 이다.
(기존의 edit 은 getEdit 으로 이름 변경 )
getEdit은 form을 화면에 보여주는 녀석이고,
postEdit은 변경사항을 저장해주는 녀석. 

다음에는 post request를 처리해볼거다. 
그리고 이 input 값을 사용해서, 영상의 제목을 업데이트 할것이다. 

-. 만약 그냥 데이터를 받는게 목적이라면, get을 사용하면 된다. 그런데 받은 데이터로 우리의 DATABASE 를 수정, 삭제, 업로드등을 하고싶다면 POST 방식을 사용해야 한다. 

우리는 지금까지 Save 버튼을 눌었을 때 "똑같은 URL" 로 post request를 보내줄거라는걸 배웠다. 
그이유는 action을 안썻기 때문(HTML 'form' 태그에서) 만약 action이 있다면, input 안의 데이터들을 특정 URL로 보낼 수 있다. 
하지만 우리는 action을 안쓸거기 때문에 'http://localhost:4000/videos/3/edit' 이 수정하는 화면의 URL 로 post request를 보내줄 것이다. 

정리하자면 우리는 edit 페이지를 get 방식으로 HTML을 받았고. save를 눌러보면 videoRouter 의 app.post에 의해서 반응 할거다. 
videoRouter의 post 가 postEdit을 부르고 실행한다. 


아래의 코드에서는 반복되는 부분이 있는데 같은 URL 을 쓰고 있기도 하고, 구조도 똑같다. 
다른점은 오직 get이냐 post 냐 이다. 
이걸 줄이는 방법은 아래와 같다. 
********************************************************************************************************
(videoRouter.js)
videoRouter.get("/:id(\\d+)/edit", getEdit);
videoRouter.post("/:id(\\d+)/edit", postEdit);
 -> videoRouter.route("/:id(\\d+)/edit").get(getEdit).post(postEdit); 이렇게 줄일 수 있다. 
********************************************************************************************************


Edit 페이지에서 Save 버튼을 눌렀을 때의 처리

1. watch 페이지로 다시 돌아가기 

이제 우리는 edit 페이지에서 save버튼(submit 하는 역할)을 눌었을 때 다시 watch 페이지로 돌아가도록 할거다. 
그렇게 하기 위해선 params 에서 id를 가져올 거다. 
왜냐하면 이 post request는 id를 params 로 가지고 있기 때문.
이건 매우 중요하다. 왜냐면 우리는 이거로 어느 비디오를 수정하는지 알 수 있기 때문. 
그렇기에 res.redirect(`/videos/${id}`) 요기를 통해 자동으로 현재 수정하던 비디오의 watch 페이지로 갈 수 있는거다. 
********************************************************************************************************
(videoController.js)

export const getEdit = (req, res) => {
    const {id} = req.params;
    const video = videos[id-1];
    return res.render("edit", {pageTitle:`Editing: ${video.title}`, video});
};
export const postEdit = (req, res) => {
    const { id } = req.params;
    return res.redirect(`/videos/${id}`)
};
********************************************************************************************************

자 그러면 우리는 편집용 form을 render 시켜 줄 거고, 유저가 submit을 하면 우리의 post request로 이동해서 
postEdit Controller 가 처리를 해줄 텐데, postEdit 은 route 로부터 id 를 얻어와서, 
'/videos/id' 페이지로 redirect 시켜줄거다. 

일단은 여기까지 뭐 업데이트 및 삭제 및 뭐 이런거는 아직 안하고 있지.<- 곧 할겨

2. input에 입력되는 value를 얻기 

자 우리는 req.params 라는게 있다. 
저건 우리에게 주어지는 정보지? 
왜냐하면 우리의 URL 이 
videoRouter.route("/:id(\\d+)/edit").get(getEdit).post(postEdit); 
요기서 "/:id(\\d+)/edit" 이렇게 생겼기 때문이지. 
EXPRESS 가 이 id 라는걸 알아서 우리한테 주는겨 
그래서 id 걊인 1,2,3 등을 얻을 수 있지. 

자 우리는 이제 form 으로부터 정보를 얻어야 하는거다. 
우리는 아래의 edit.pug 에서 첫번쨰 input(name="title") 안의 value 를 얻고 싶은거다.   
********************************************************************************************************
(edit.pug)
extends base.pug 

block content
    h4 change Title of video 
    form(method="POST")
        input(placeholder="Video Title", name="title",value=video.title, required)
        input(value="Save", type="submit")

********************************************************************************************************

위에서 우리의 form은 get 이 아닌 post를 하고 있기 때문에 이 데이터가 back end로 전송되고 있다는 건 아는데, 
어떻게 data를 받는지는 모르는거다.(get은 그냥 url을 통해서 정보를 전달한다. 사용자가 볼수도 있는거고) 
이거는 우리가 req.params 를 쓸수있던 것처럼, req.body 라는걸 통해 알 수 있다. 

근데 이걸 그냥 사용하면 안되고 express.urlencoded 라는 express안의 메소드를 사용해야한다. 
이놈은 내가 post 방식으로 보낸 form의 body를 이해할거다.  
그게 다다. 
몇가지 옵션이 있는데 예를들면 parameterLimit 이라는걸 써러 parameter 갯수에 제한을 줄소도 있고 뭐 그런걸 해준다. 

하지만 우리가 사용할 건 extended다. 
이놈은 body에 있는 정보들을 보기좋게 형식을 갖춰주는 일을 한다. 
일단은 이정도...처리를
요지는 이 extended가 나에게 이 form의 데이터를 JavaScript의 Object 형식으로 줄거라는거다. 

자 이제 이 Midddleware를 사용하려면 설치를 해야쥬 

거듭 강조하지만, 우린 routes를 사용하기 전에 이 middleware를 사용해야 한다. 
그럼 그 middldware 가 form을 이해하고, form 을  자바스크립트로 변형시켜줘서 우리가 사용하게 만드는거다. 
그걸 위해서는, middleware를 route를 사용하기 전에 사용해야한다. 
즉, server.js 에서 Routing 하기전에 써야한다는 거지. 아래처럼 쓰면 된다. 

********************************************************************************************************
(server.js)

import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";

const PORT = 4000;

const app = express(); 
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended: true})); <- 요기다 써야지 Routing 하기전에!!
-> 요 위놈이 뭘하냐면, 나의 EXPRESS application 이 form 의 value 들을 이해할 수 있도록 하고,
   우리가 쓸수있는 멋진 Javascript 형식으로 변형시켜 줄거다. 

app.use("/", globalRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);


const handleListening = () => console.log(`✅Server listening on port http://localhost:${PORT}🚀`);

app.listen(PORT, handleListening)
********************************************************************************************************

자 이렇게 server.js 에 우리의 post 방식으로 요청한 정보를 해석해줄수있는
express.urlencoded 라는 Middleware 를 사용해줬으니 우리는 edit 페이지에서 post 방식으로 보내는 req.body를 
사용할 수 있다.(이 미들웨어가 리퀘스트하는 데이터를 우리가 가공할 수 있는 자바스크립트 형식으로 바꿔줬으니)

자 그럼 이제 form 의 input(name="title") 안의 value를 받아서 한번 database 를 수정해보자 
********************************************************************************************************
export const postEdit = (req, res) => {
    const { id } = req.params;
    console.log(req.body); <- 요부분을 통해서 우리는 데이털르 받을 수 있는거고 이렇게 하면 
    input(name="title")에 'lolololol' 을 입력하고 save 버튼을 눌러서 submit 했을 때 
    { title: 'lolololol' } 이라는 아주 멋진 문구가 콘솔창에 뜨지 아주 멋지다. 

    const { title } = req.body; <- 그럼 우리는 이제 요기 title에 값을 받아서 저장할 수가 있지. 

    videos[id-1].title = title; <- 그리고 이걸 통해 우리의 database를 수정해줄수있지. 개쩔쥬 

    return res.redirect(`/videos/${id}`)
};

!!!! 우리가 요청하는 form 안의 input 에 name 이 없으면 req.body는 데이터를 볼 수 없다.! 그러니 꼭 name 설정을 해줘야 한다.!
      그러니 모든 input에 꼭 name을 넣어주자!

********************************************************************************************************

 


# 비디오를 업로드 해보자(우리의 가짜 데이터베이스를 활용하여 하는 연습)

1. 아래의 upload.pug 에서의 form을 통해 '/videos/upload' URL 에 post request를 보낸다.
  
********************************************************************************************************
(upload.pug)
extend base.pug 

block content  
    form(method="POST", action="/videos/upload")
        input(placeholder="TItle", required, type="text", name="title")
        input(type="submit", value="Upload Video")
********************************************************************************************************

2. 그럼 postUpload 라는 function이 호출이 되겠지 
    -> 우리의 post request 에는 'name' 이 있기 때문에 req.body 로부터 그 이름(title)으로 데이터를 받을 수 있는거다. 

3. 그런 다음에 newVidoe 라는 새로운 Object를 만든다.
    -> 이건 그냥 가짜 데이터인데, 이안에 title 만은 진짜 유저가 입력한 내용이다.(req.body를 통해 받은 데이터.)

4. 우리의 새 비디오를 우리의 가짜 DATABASE에 추가한다.(videos.push를 사용)
5. 그런다음 브라우저에게 홈으로 돌아가게 말한다.(res.redirect 를 통해서)
    -> 그럼 브라우저는 홈페이지로 돌아갈 거고, trending 컨트롤러가 호출된다. 
6. 위의 모든 일이 일어나면, 그시점에는 우리는 하나의 비디오를 더 가지게 된다. 

********************************************************************************************************
(videoController.js)

export const postUpload = (req, res) => {
    // here we will add a video to the videos array.
    const { title } = req.body;
    const newVideo = {
        title,
        rating: 0,
        comment: 0, 
        createdAt: "just now",
        views: 0,
        id: videos.length + 1        
    }
    videos.push(newVideo);
    return res.redirect("/");
}
********************************************************************************************************

# MongoDB
    -> document base의 DataBase 이며 mongoose 라는 미들웨어를 통해 Javascript로 제어할 수 있다.

-. 대략적인 사용법
1. '$ which brew' 로 homebrew 가 실행되고있는지 확인
2. '$ mongo' 로  mongocell 안으로 진입

# db.js
 ->이 db.js를 우리 컴퓨터에 실행되고 있는 mongo database 에 연결해 줄거다. 

terminal 에서 $mongo 를 실행했을 때 나오는 
'connecting to: mongodb://127.0.0.1:27017'
이것이 내 database 가 실행되고 있는 URL 이다. 

mongodb에 새로운 database를 만드는건 아주 간단하다. 
위에서 찾은 URL 에 연결한 뒤, '/' 뒤에 database 이름을 적어주면 된다. 
아래의 코드 참조

********************************************************************************************************
(db.js)

import mongoose, { Model, model, Mongoose } from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/nameofyourdb")

********************************************************************************************************

이렇게 위처럼 코드를 작성하면 mongoose 는 nameofyourdb 라는 mongo database로 연결해 줄거다. 
(db 이름은 wetube 로 할 예정)
database는 지금은 존재하지 않지만 곧 만들거다. 그러니 저기 URL 뒤에다가 꼭 이름을 명시해 줘야한다.

# db.js를 불러오기
지금 우리의 db.js는 하고있는일이 없다.  그냥 존재할 뿐
왜냐하면 우리가 이 파일을 서버에서 사용하고 있지 않기 때문이다. 
우리의 서버를 보면, 그 파일을 전혀 부르고 있지 않는다. 

그래서 우리는 이 db.js 파일을 server.js 파일에 import 할거다. (아래의 코드 참고)
우리가 import 하는건 그파일의 어느 한 function도 아니고 export default, export non-default 도 아니고, constant도 아닌
그냥 그 파일 자체를 import 해줄거다. 

서버는 
import "./db" 이라인 을 보는 순간 
이 파일을 import 해줌으로써, 내 서버가 mongo에 연결되는거다. 

********************************************************************************************************
(server.js) 

import "./db" <- 이부분!
import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";

********************************************************************************************************

db.js 파일을 import 해줬다고 우리가 wetube database를 직접 생성한 건 아니었다. 우린 아무것도 안해도 된다. 
우린 그냥 db.js를 써서 'wetube database' 에 연결하고 싶어요! 라고 한것 뿐이다. 

자, 여기서 mongodb와의 연결 성공여부나 에러를 console.log 로 출력하게 한다면 더 좋겠지 


connection에 event를 붙여준다. <- 이부분 뭔지 잘 모르겠음

db.on 적어주고, error 라는 event를 적어 줄 거다. 만약 error가 뜬다면 그 에러를 console.log 해줄거다.
즉, 저 db.on 안의 함수에서 error 를 받아서 그 error를 console.log 해주는거다.

그리고 database의 또다른 event 로는 database 로의 connection 을 여는 경우도 있다. 
connection이 열린다는 말은, 우리가 database 에 연결된다는 뜻이다. 
그럼 우리는 연결이 되었을 때 console.log 를 통해 database에 연결이 되었다고 출력되게 할것이다. 
이 event 는 once 를 사용할 거고 on 과 once의 차이점은, 

on은 여러번 계속 발생시킬 수 있다. 예를들면 클릭같은 이벤트들 
once는 오로지 한번 발생한다는 뜻이다.

아래와 같이 open 이벤트가 일어났을 때 handleOpen 함수가 실행되게 하며 handleOpen 함수는 
서버가 연결됬음을 console.log 해준다. 

********************************************************************************************************
(db.js)

import mongoose, { connection } from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/wetube", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

const handleOpen = () => console.log("✅Connected to DB");
const handleError = (error) => console.log("❌DB Error", error);

db.on("error", handleError);
db.once("open", handleOpen);

********************************************************************************************************

자 지금까지의 db.js 를 정리하자면 
wetube database에 연결이 됐고(mongoose.connect 부분을 통해),
mongoose 가 그 connection 에 대한 액세스를 줬다. 
그래서 우리는 서버와 database 서버 사이의 
현재 connection 에 액세스 할 수 있다. 
 
그리고 우리는 몇가지의 event를 듣고 있따. 
1. error 
-> error 가 뜰 떄 마다. database error 우리가 설정해놓은 방법에 의해 출력될 거다. 

2. open
-> connection 이 열릴 때 이벤트가 한번 발생 할 거다. 그럼 우리는 handleOpen 함수를 호출.

자 이제 잘 작동하고, 잘 실행된다. 
다시 말하지만, 우린 db파일을 import 해줬기 때문이다.
function을 import 한것도 아니고, db를 import 한것도 아니다. 
그냥 파일 자체를 import 해준거다. 그리고 그 파일은 import 되는 순간, 자동적으로 실행이 되는거다. 

그러니 db.js 가 import 되면, connection 이 될거고, 
또 우리가 event도 넣어줬으니까 그것들도 발생할거다. 

우리는 첫줄에 db.js 파일을 import 해줬지만
server.js 파일이 모두 실행된 후에 database 가 시작된다. 
왜냐면 좀더 느리기 때문....이라고 하는데

추정하기로는 asynchronous 통신으로 인해 일어난 현상이라 추측된다. 
이부분은 추가적인 공부가 필요 

# 진짜 database 를 만들기위한 계획

자. 이제 우리는 진짜 database에 데이터를 만들 준비가 되었다. 

이제부터의 진행 방향 
Homepage에 진짜 database를 이용하여 진짜 영상들의 목록이 보이게 하는걸 시작으로, create, uplopad, delete등의 동작을 가짜 객체 database가 아닌 진짜 database(동영상)을 사용하여 구현한다. 
CRUD
- Create
- Read 
- Update 
- Delete 

# 비디오 모델(모델이 뭐냐?)
일단 우리는 비디오 model을 만든다. 

model은 뭘까?
mongoose는 아주 멋지다. mongoose는 우리가 mongoDB와 대화할 수 있게 해준다. 
그렇게 하기 위해 우리는 mongoose를 조금 도와줄 필요가 있다. 
우리가 해야할 일은, mongoose에게 우리 application의 데이터들이 어떻게 생겼는지 알려줘야한다. 
(예를들면 그 비디오에 제목이 있고, 세부설명이 있고 등등)
이렇게 알려주면 mongoose는 우리가 CRUD할수있 게 도와줄것이다. 

예를들어, 우리의 비디오 컨트롤러에는 object만   있을 뿐이지만 이 object의 모양을 강제해주는 역할을 해주는건 없다. 
새로운 객체를 만들려고하면 우리가 직접 기존 객체들의 구성 및 모양을 확인하고 틀리지않게 주의해서 만들어줘야 했다. 
우리가 원하는 건, database가 우릴 도와줬으면 하는거다.(우리가 CURD 할 때 말이다.)
그러기 위해선 우리의 database가 어떻게 생겼는지 당연히 알려줘야한다. 
(이전걸 예로 든다면 작성자를 가지고있나?  댓글은? 댓글은 문자인가 숫자인가 배열인가, comment는 숫자가 들어와야하는가하는 뭐 이런것들의 설정)
그리고 이것을 알려주는게 우리가 model을 만드는 이유다. 

그렇게 알려줌으로써 database가 model을 만들고 model을 CURD 하는걸 도와줄 수 있다. 

자이제 video.js에서 이런것들을 시작한다. 

# video.js

video model을 만들기 위해선 mongoose를 mongoose에서 import 하는것부터 시작한다. 
그리고 model을 생성하기 전에 우리는 model의 형태를 정의해 줄 필요가 있다. 
그 model의 형태롤 보통 'schema' 라고 한다. 

사전적 정의 
-> 물리적인 장치로부터 논리적인 데이터 베이스 레코드(data base record)를 매핑(mapping)하는 데 사용되는 정의 정보를 말한다. 즉 쿠키틀 이라고 보면 될거같네요..!

********************************************************************************************************
(Video.js)

import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    //비디오 형식을 저장하는 구간
    title: String,
    description: String,
    createdAt: Date,
    hastags: [{ type: String }]
    meta: {
        views: Number,
        rating: Number
    }
});


********************************************************************************************************

이렇게 data model을 정의 해줬을떄 우리는 아래와같은 형식으로 데이터가 생겼을것이다.

const video = {
    title: "Heki",
    description: "lalalala",
    createAt: 12121212,
    hashtags: [
        "#hi",
        "#mongo"
    ],
    meta: {
        views: 123,
        rating: 1414
    }
}


이제 우리는 model을 만들어 줄거다. 

********************************************************************************************************
(Video.js)
import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    //비디오 형식을 저장하는 구간
    title: String,
    description: String,
    createdAt: Date,
    hastags: [{ type: String }]
    meta: {
        views: Number,
        rating: Number
    }
});

const Video = mongoose.model("Video", videoSchema); <-  요부분이 model을 만들어주는 부분!!

export default Video;
********************************************************************************************************

위처럼 마지막에 export 를 해주면
우리는 다른 파일에 비디오 model을 import 할수있다. 

import Video from "....." <- 요러한 형식으로 

우리는 default 로 export 했기에 같은 형식으로 import가 될거다.

자 이렇게 우리는 video model을 만들었고
이제 우리는 우리가 올린 비디오를 모두가 알 수 있도록 만들어야 한다. 

영상자체가 아니라 우리 video model의 존재를 알리는거다. 
지금 당장은 우리의 video model이 존재하지 않는다. 

왜냐하면 그 누구도 우리가 만든 video model을 import 하고 있지 않기 때문 
그러니까 video model을 미리 import 해서, 모두가 사용할 수 있게 하면 
모두가 바로 사용할 수 있다. 

모두가 알수있게 import 하는 방법은 server.js 에 심어버리는거다. 

server.js 에서 import "./db" 를 통해 mongoose를 이용하여 mongoDB와 연결하였으므로
그 아래에 video model을 import 하면 된다. 아래처럼. 

********************************************************************************************************
(server.js)

import "./db"
import Video from "./models/Video";
import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";

const PORT = 4000;
.
.

********************************************************************************************************

자 우리는 지금까지 우리 video 의 형태를 정의해줬다. 
데이터가 어떤 형태로 구성될지만 설정했을 뿐
실존하는 값을 작성하지는 않았다. 

그냥 특정 데이터, 예를 들면 'title은 String 형식을 가진다' 라고만 헀다.

나중에 우리 비디오를 진짜 만들고 title을 보내면 Mongoose 가 전달받은 데이터의 형식이 String 인지 확인해줄거다. 
여기에 필요한 Vaslidation 은 모두가 무료로 사용할수있다. <-??이거 무슨말이여 

즉, 먼저 데이터의 형식을 정의해주고
최대한 상세하게 형식에 대해 설명하고 
그 다음에 mongoose.model 을 사용하여 model을 만드는거다. 
model은 model의 이름과 데이터의 형태인 schema 로 구성하면 된다.

그 다음 해당 model을 default 로 export 해주면 된다. 

그리고나면 모두가 해당 model을 알 수 있게 해줘야하는데 
server.js 에 database를 import 해서 연결시킨 후 
해당 연결이 성공적일 때, Video.js의 video 를 import 해주는거다. (video 모델을 import)

이 연결로 db는 우리 video model을 인지하게 되는거다. 

가장 중요한건
"db를 mongoose 와 연결시켜서 video model을 인식시키는거다."


# init.js 
  ->import 하는 server의 부품들의 관리
  -> 이 파일이 database와 Video 를 Import 해주고 우리 application 을 작동시킬거다. 

그걸 위해서 아래의 코드들을 server.js -> init.js 로 옮겨준다. 

********************************************************************************************************
(init.js)

import "./db"
import Video from "./models/Video";


const PORT = 4000;

const handleListening = () => console.log(`✅Server listening on port http://localhost:${PORT}🚀`);

app.listen(PORT, handleListening)

********************************************************************************************************

그런데 이렇게 하게되면 app이 정의 되지 않아서 오류가 생긴다. 
이걸 해결하려면 먼저 server.js 에서 app을 configure(=환경을 설정하다.) 하고 
app을 export 해준 후 init.js 에서 export 한 app을 export 해준다. 

그럼 이렇게 아래처럼 해주면 되겠지 
********************************************************************************************************
(init.js)

import "./db"
import Video from "./models/Video";
import app from "./server" <- 이부분 app을 import 해주는 부분


const PORT = 4000;

const handleListening = () => console.log(`✅Server listening on port http://localhost:${PORT}🚀`);

app.listen(PORT, handleListening)
********************************************************************************************************


우리는 지금 관련된 부분들에 따라 분리시키고 있는데 
그이유는 server.js 는 express에 관련된 것들과 server의 configuration 에 관련된 코드만 처리하기 위해 만들어졌기 때문이다. 
database나 models 같은 것들을 import 하기 위함은 아니니까 

아마 지금은 우리의 nodemon이 정상 작동하지 않을것이다. 
왜냐하면 nodemon은 현재 server.js를 관찰하는데 
server.js는 app을 export할 뿐 작동시키지는 않기 때문이다. 

자 그럼 우리는 package.json을 수정해서 이 문제를 해결 할 수있겠지. 

src에 있는 server.js 대신 init.js 로 연결시키면 해결. ㅎㅎ

********************************************************************************************************
(package.json)

"scripts": {
    "dev": "nodemon --exec babel-node ./src/server.js ", <- 요부분을 바꿔주는거지
    "dev": "nodemon --exec babel-node ./src/init.js ", <- 요로케
    "설명": "원래는 그냥 node index.js로 실행했었는데 우리가 @babel/node를 설치했기 때문에 babel-node라는 명령어를 쓸 수 있는거야. nodejs를 실행시키는데 babel도 같이 적용되서 최신문법코드를 동작 시킬 수 있지."
  }
********************************************************************************************************

이렇게 하니 server listening 그리고 database와 연결 성공 

자 우리는 지금까지 관련된 것들끼리 분리시켜주고 있다. 
server.ja는 server 관련 코드만 처리하고 
init.js는 필요한 모든것들을 import 시키는 역할을 담당한다. 
import에 이상이 없다면 init.jssms app을 실행 시킬거다. 

자 이제 video 관련 코드를 짜기 시작.

database 내의 video에 대한 접근은 어려울까? 
아뇨 개쉽쥬?

자 이제 우리는 videoController.js 내의 가짜 database를 지운다. 그 가짜 객체 데이터들
그리고 관련된 코드들도 다 지워준다. 
그러면 남은것들은 express 관련 코드들뿐이다. 
res.render 같은 것들 말이다. 

아 그리고 'trending' -> 'home' 으로 변수명 변경해줄거다. 
그리고 Controller에서 이름을 바꿔줬으니 Router에서도 이름을 바꿔줘야 한다. 당연히 

# video model의 사용법 

자 그럼 이제 본격적읃로 video Data을 다루기 시작할건데
우리는 우리의 video model을 어떻게 사용하는가?
그건 아주 간단하쥬?

controller 폴더 안의 파일들을 수정해주면 되는데 
videoController.js 로 예를들어 설명하자면 

일단 videoController.js 에 Video 를 import 해줄거다.(video.js 의 Video)
********************************************************************************************************
(videoController.js)

import Video from "../models/Video" <- 이부분을 통해 Video model을 import 
********************************************************************************************************

자 이제 import 해줬으면 그걸 database와 연결해야 하는데
그걸 해결하려면 mongoose documantaion을 참고 

거기서 우리는 'model(우리는 video 겠지).find()' 를 사용하면 된다. 

video.find() 는 두 가지 사용법이 있는데 
1. callback function을 활용하는 방법 
2. promise 를 활용하는 방법 

뭔소리냐?
이걸 이해하기 위해서는 javascript와 promise 그리고 callback의 작동방식을 이해해야한다. 
아라보자 

1. callback?
-> callback 이란 무언가가 발생하고 난 다음 호출되는 function을 말한다. 
    init.js를 예로 들자면 'app.listen(PORT, handleListening)' 요게 callback 이라고 할수 있지 
    우리는 PORT 를 먼저 listen 하고 있는데 고거 lisetn 하고 나면 'handleListening' 함수가 실행 되자나
    바로 이 'handleListening' 함수가 callback function이다. 

    callback function은 javascript 에서 기다림을 표현하는 하나의 방법이라 생각하면 편하다. 

    위의 예시에서도 연결이 확인되면 특정 function이 발동하는 거니까. 
    무언가가 발생한 다음(then) 어떤 것을 한다는 식의 말을 계속 하고있는데 그렇기 떄문에 기다려야 한다는 거다. 
    어떤 것들은 실행과 동시에 적용되지 않기 때문이다. 

    예로 들자면 4000 PORT에 연결을 해야하는데 해당코드는 바로 실행되지 않을 수 있다는 거다. 
    1마이크로초라도 결과값 도출을 기다려야 한다는 말이다. 

    우리의 Video도 마찬가지다. 
    우린 데이터가 전송되는것을 기다려야 한다. 
    시간이 존나 길수도 짧을수도 있지만 뭣이됬던간에 일단 데이터가 완전히 전송될 때 까지 꼭 기다려야한다는 말이다. 

    그리고 코드 실행 중 오류가 발생할 가능성도 있다. 
    왜냐하면 우리가 받는 데이터는 javascript 파일속에 없기 때문이다. 

    'Javascript 파일속에 없는 데이터 이것이 바로 DATABASE 라는거다.'

    어쨋든 모르는 오류가 생길수도 있고 다양한 상황에 따라 데이터 처리에 시간이 걸릴수도 있다. 
    그래서 기다려야한다. 
    
    좀 더 쉬운 예를 들어 설명하자면 
    console.log( 1 + 1 ) 이런건 Javascript 가 알아서 혼자 처리할 수 있다. 
    Javascript 는 해당코드를 읽음과 동시에 출력하고 다음 작업으로 넘어갈 거다. 
    기다림도 필요없고 일어날 오류가 없기 때문이다. 

    하지만 video.find()의 경우 database 가 종료되거나, 바쁘거나 database의 전송속도가 느릴수도 있다. 
    그밖에 알수없는 수많은 문제들이 있을수 있다.
    왜냐하면 database는 Javascript 밖에 존재하니까!!
    그렇기 때문에 약간의 기다림이 필요한거다. 

    그래서 우리는 두가지 방법을 쓸수가 있는데 그게바로 'callback' 과 'promise'

    promise 가 좀 더 섹시한 방법이지만 우리는 먼저 callback을 사용하면서 각 작동 방식을 이해해볼거다. 


    1-1. callback의 동작방법 
    -> 아까 init.js 에서도 봤지만 configuration{ex. PORT}과 호출할 함수function{ex. handleListening}이 필요하다. 
        Video.find(이부분에 configuration을 넣어주면 된다. )로 일단 우리는 모든 형태으 비디오를 찾는다고 해보고 
        
        1-1-1. search term 설정
        Video.find({}, ) 
        -> 중괄호는 search terms를 나타내는데 이 search terms가 비어있으면 모든형식을 찾는다는 것을 뜻한다. 

        1-1-2. callback 전송 
        Video.find({}, (error, videos[([docs인데 그냥 우리는 비디오니까, 이름은 어차피 메이꽌시]) ) 
        ->callback은 err와 docs 라는 signature를 가진다(뭐 저런걸 대충 인자로 받는다는 거겠지)
        

#Javascript 코드를 사용해 데이터를 움직여 보자. 
하고자 하는것 
1. Video.find를 실행시킨 뒤 모든 값을 검색하고 
2. error 와 video를 불러왔다. 

Video.find({'이부분'}, (error, videos) => {
    
}); 
-> mongoose는 '이부분'을 database에서 불러올거다. 그리고 database가 반응하면 mongoose는 그뒤의 function을 실행시킬다.
-> 그 다음 mongoose는 err와 video의 값을 불러올거다. 

********************************************************************************************************
(videoController.js)

const handleSearch = (error, videos) => {
    console.log("errors", error);
    console.log("videos", viideos);
};

export const home = (req, res) => {   
    Video.find({}, handleSearch); 
    return res.render("home", {pageTitle: "Home", videos: []}); <- home.pug가 video 배열을 요구하니 만들어준 임시 배열 
};
********************************************************************************************************

위에 처럼 코드를 작성해주면 페이지를 리로드했을 때 콘솔창에 아래와 같은 문구를 발견할 수 있다.
errors null <-  에러는 없고
videos [] <- 비디오는 빈 array 고 

와우 대단하쥬 우리는 javascript 코드로 database와 아무런 에러도 없이 통신을 한거다. 

자 여기서 코드의 진행흐름을 한번 점검하자면
일단 callback을 사용하면 아무것도 return 되지 않아야 한다. 


예시)

아래처럼 Vidoe.find() 와 return 사이에 "hello" 를 콘솔할수있는 코드를 추가하였다. 
********************************************************************************************************
(videoController.js)


export const home = (req, res) => {   
    Video.find({}, (error, videos) => {
        console.log("errors", error);
        console.log("videos", videos);
    }); 

    console.log("hello"); <- 요부분 추가

    return res.render("home", {pageTitle: "Home", videos: []}); <- home.pug가 video 배열을 요구하니 만들어준 임시 배열 
};
********************************************************************************************************

(콘솔창 흐름)
✅Server listening on port http://localhost:4000🚀
✅Connected to DB
hello
GET / 304 84.277 ms - -
errors null
videos []

위의 콘솔창 흐름의 결과를 보면 아주 흥미롭다.

일단 당연히 서버의 연결상태를 알려주는 Server listening 이 먼저 뜨고
그다음에 import db를 통해 가져온 db와의 연결상태가 먼저 뜨고 

hello 가 먼저 출력되고 logger 가 출력되고 error와 videos가 출력된다. 

여기서 중요한건 이거여 hello -> errors -> videos 이 순서 
왜나하면 코드상에서는 logger가 server.js에서 제일먼저 실행되고 errors와 videos가 더 윗줄에 있으니까 더 먼저 나올거같은데 아니잔여?

그 이유는 다음과 같다. 

우리의 logger는 request가 완성되면 출력이 되어야 한다. 그니까 일단 
1. hello 를 출력할 때 request를 통해 연결이 되었고 
2. hello를 출력한다음 logger의 templete을 render 한 다음(콘솔창에 logger 출력) 
3. errors와 videos가 출력된거다.

그러니까 우리가 기억해야할것은 
우리는 page를 request 하고 -> console.log("hello"); 를 출력한 뒤 -> render 과정을 거쳐야 logger를 얻는다. 

GET / 304 84.277 ms - - 
우리가 요청해서 받은 response를 보면
여기서 '304' 이말은 우리가 response를 요청해서 받은 다음 다시 전송했다는 말이다. 
어쩃든 render와 response 과정 이후에 console.log 값들을 출력할 수 있다는 것이다. 

즉 hello를 출력하고, render 그리고 logger가 더 빨리 완료되었따는거다. 
코드는 분명이 error, videos가 더 먼저있는데

자 좀더 쉽게 설명하자면 아래의 코드를 예시로 만들면 
********************************************************************************************************
(videoController.js)

export const home = (req, res) => {
    console.log("Starting Search");   
    Video.find({}, (error, videos) => {
        console.log("Finished Search");
    }); 

    console.log("I should be the last one");

    return res.render("home", {pageTitle: "Home", videos: []});
};
********************************************************************************************************

이러한 콘솔창을 볼 수 있다. 
✅Server listening on port http://localhost:4000🚀
✅Connected to DB
Starting Search <- 데이터 검색이 먼저 이루어졌고 
I should be the last one <- 마지막에 있는 코드가 실행됐고 
GET / 304 126.336 ms - - <- 데이터 검색이 끝나야 rendering(res.render) 이 시작되야하는데 먼저 되버렸네
Finished Search <- 그다음에 Fished Search가 출력 되었다. 

이게 콜백함수의 힘..? 특정코드를 마지막에 실행되게 하는...그런 힘....?

자 이제 우리는 콜백함수의 사용법을 알았으니 그것을 응용해보자 
그걸 위해 우리는 home Controller를 아래와 같이 수정해 줄거다. 

********************************************************************************************************
(videoController.js)

import Video from "../models/Video"

export const home = (req, res) => {   
    console.log("start");
    Video.find({}, (error, videos) => {
        console.log("Finished");
        return res.render("home", {pageTitle: "Home", videos: []}); <- 이제 home.pug의 videos는 Video.find의 video argument 에서 올거다. 그러니 변경

        return res.render("home", {pageTitle: "Home", videos}); <- 요렇게 변경
    }); 
};
********************************************************************************************************

자 이제 browser는 해당 작업이 끝날 때까지 기다려줄거다.
즉 이제는 우리 database 검색이 끝나야 rendering이 시작된다는거다.

즉 원래 저 res.render가 Video.find 밖에 있을 때는 먼저 실행되고 Video.find 안의 코드가 나중에 진행이 되었는데
이제 video.Find안의 콜백함수로 넣어주니까 res.render를 맨 마지막에 해주는거다. 

즉 밖에있을 땐
console.log("start"); -> rendering -> console.log("Finished");
안에 callback함수로 넣어주면
console.log("start"); -> console.log("Finished"); -> rendering  
이렇게 바뀌는거다. 

이렇게 render를 맨 마지막에 실행시키는 이유는 database검색이 안끝났는대 render되는걸 방지하기 위함이다. 

2. promise
 -> callback의 최신 버전이라고 생각하면 된다. 

********************************************************************************************************
(videoController.js)

import Video From "../models/Video"

1. callback function을 썻을떄는 이렇게 사용하던걸
export const home = (req, res) => {
    Video.find({}, (error, video) => {
        return res.render("Watch", {pageTitle: "Home", videos});
    }); 
};

2. Promise를 쓰면 아래처럼 간단하게 바꿀수 있다. 
export const home = async(req, res) => {
    const videos = await Video.find({})
    return res.render("Watch", {pageTitle: "Home", videos});
};

********************************************************************************************************

이해를 돕기 위해 아래와 같이 home function을 수정하여 실행한후의 콘솔창을 확인하면
********************************************************************************************************
(videoController.js)

export const home = async(req, res) => {
    console.log("I start");
    const videos = await Video.find({})
    console.log("I finish");
    console.log(videos);
    return res.render("home", {pageTitle: "Home", videos});
};
********************************************************************************************************

✅Server listening on port http://localhost:4000🚀
✅Connected to DB
I start
I finish
[]
GET / 304 105.070 ms - -

위와같은 진행을 확인할 수 있는데 
I start가 출력되고 -> 비디오를 찾고 -> I finish를 출력하고 -> 찾은 video array를 출력했다. -> 그리고 render

callback 함수와의 차이점은 무엇일까 
차이점은, await를 Video.find앞에 적으면 find는 내가 callback을 필요로 하지 않는다는걸 알게되는거다. 
그렇기에 find는 찾아낸 비디오를 바로 출력해줄거다. 
findoperation의 결과값으로 말이다. 

그럼 에러들은 어떻게하나?
기존 callback함수에서 사용하던 error를 출력하기 위해서는 try catch문을 사용할 거다. 

********************************************************************************************************
(videoController.js)
export const home = async(req, res) => {
    try{
        const videos = await Video.find({})
        return res.render("home", {pageTitle: "Home", videos});
    } catch {
        return res.render("server-error")
    }
};
********************************************************************************************************

말 그대로 무언가를 try하고 무언가 error가 있다면 그 error들을 캐치해서 res.render를 통해 오류들을 출력할거다.


위의 예시를 만약 callback방식으로 한다면
********************************************************************************************************
(videoController.js)
export const home = async(req, res) => {
    
        Video.find({}. (error, videos) => {
            if(error){
                return res.render("server-error")
            }
            return res.render("home", {pageTitle: "Home", videos});
        })
};
********************************************************************************************************

자 뭐 그래 우리는 이제 promise가 try/catch를 사용한다는건 알았따. 
근데 뭐 대단히 좋은건 잘 모르겠는뎅.? 

이놈이 대단한 이유는 await가 database를 기다려주기 때문이다. 
********************************************************************************************************
(videoController.js)

import Video from "../models/Video"

export const home = (req, res) => {   
    console.log("start");
    Video.find({}, (error, videos) => {
        if(error){
            return res.render("server-error")    
        }
        console.log(videos);
        return res.render("home", {pageTitle: "Home", videos});
    }); 
    console.log("finished");
};
********************************************************************************************************

위와같이 callback함수를 사용하는 경우에는 

✅Server listening on port http://localhost:4000🚀
✅Connected to DB
start
finished 
[]
GET / 304 121.866 ms - -

이렇게 위와 같이 start -> finish -> videos array를 출력한다. 
왜냐하면 Javascript는 기다리는 기능이 없기때문이다. 
그저 위에서 아래로 순서대로 코드를 읽어냈었다. 
하지만 작업별로 시간이 달라 꼬이는 경우가 생겼고 
그래서 우리는 callback함수라는 해결책을 만들어냈다. 

callback 어떤 동작이 끝나면 특정 function을 부르도록 만들어졌다.
왜냐하면 JavaScript는 기다리는 기능이 없으니까.
그냥 위에서 아래로 순서대로 코드를 읽어내는거다. 

하지만 이 모든건 await가 탄생하고 달라졌다. 
await만 있다면 javascript는 계속 기다려줄거다. 

const videos = await Video.find({}) <- 요라인에서 database에게 결과값을 받을 때까지 계속 기다린다!

이게 async와 await의 장점이다 
아주 직관적으로 javascript가 어디서 어떻게 기다리는지 바로 알 수 있기 때문이다. 

callback 함수세계에서는 가장위의 예시를 보자면
start -> finished -> videos 출력 

하지만 promise 세계에서는 
아래처럼 하면
********************************************************************************************************
(videoController.js)
export const home = async(req, res) => {
    try{
        console.log("start");
        const videos = await Video.find({})
        console.log(videos);
        console.log("finished");
        return res.render("home", {pageTitle: "Home", videos});
    } catch {
        return res.render("server-error")
    }
};
********************************************************************************************************

순서대로 위에서 아래로 코드가 실행된다. 
즉 
start -> videos -> finished 이렇게 된다. 

이건 정말 큰 차이다.  이렇게하면 코드를 읽기가 편하기 때문이다. 


코딩 규칙상 await는 function안에서만 사용이 가능한데 
해당 function이 asynchronous 일 때만 가능하다. 
그렇기에 우리는 async를 적어주는거다. 

try/catch를 통해 error에 대응하는것에 대해 다시한번 복습하자면
try안의 코드를 진행중 뭐 예를들어 database가 꺼졌거나, 연결이 끊겼거나, 사람이 포화상태거나 등등 뭐 그런거면 
어떤 에러가 발생하든 javascript는 await내 출력값을 출력안하고 

아래 catch안의 에러출력코드를 실행시킨다. 

이런게 가능한것도 await 덕분이다. 

계속 말하지만 이 operation의 await가 있는 코드에 오류가 있다면 
await가 있는 코드는 출력되지 않는다. 
바로 에러 출력 코드가 발생한다. 
에러메세지는 아래와 같이 받을 수 있다. 
********************************************************************************************************
catch(error) {
    return res.render("server-error", {error})
}
********************************************************************************************************

에러는 나중에 다룰테니 일단 여기까지 

자 이제 우리는 진짜 database에서 비디오를 검색할 수 있게 되었다. 
위에서 우리는 async, await와 callback의 차이를 배웠다. 

# retrun 과 renders 
1. return의 역할 : 본질적인 return의 역할보다는 function을 마무리짓는 역할로 사용되고 있음.
- 이러한 경우 return이 없어도 정상적으로 동작하지만 실수를 방지하기 위해 return을 사용
- return 을 사용하게되면 함수를 마친다.(return아래의 코드는 실행하지 않는다.)

2. render한 것은 다시 render할 수 없음
- redirect(), sendStatus(), end() 등등 포함 (express에서 오류 발생)
- 혹시나 실수로 한 함수안에서 render 후에 또다시 render하는 실수를 방지하기 위해 'return'을 사용 

return이 아무것도 안하는데 왜 존재하죠?
 -> function을 종료시키기 위해서 

 #Creatin a Video part.1

 전에 말헀듯 schema는 우리 비디오의 형태를 정의해 준다.
  -> const videoSchema = new mongoose.Schema({...});

이걸 이해했다면 사용자가 비디오를 업로드할 때 해당 schema의 데이터들을 보내줄 수 있다는 말이다. 

그럼 이제 upload를 위한 view를 바꿔줄건데 왜냐하면 사용자는 아래의 video.js안의 schema에서 볼수있듯
title, description, hashtags를 직접 입력해줘야하기 때문이다. 
(meta, createAt은 javascript가 알아서 만들어주기 때문에 사용자가 입력할 필요가 없다.)
********************************************************************************************************
(video.js)

import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    //비디오 형식을 저장하는 구간
    title: String,
    description: String,
    createdAt: Date,
    hastags: [{ type: String }],
    meta: {
        views: Number,
        rating: Number
    }
});

const Video = mongoose.model("Video", videoSchema);

export default Video;
********************************************************************************************************

아래처럼 upload.pug에 description, hashtags를 입력하기 위한 input을 추가해준다.
아 그리고 input에는 꼭 name을 넣어줘야한다.
!!!! 우리가 요청하는 form 안의 input 에 name 이 없으면 req.body는 데이터를 볼 수 없다.! 그러니 꼭 name 설정을 해줘야 한다.!
      그러니 모든 input에 꼭 name을 넣어주자!
********************************************************************************************************
(upload.pug)

extend base.pug 

block content  
    form(method="POST", action="/videos/upload")
        input(placeholder="TItle", required, type="text", name="title")
        input(placeholder="Description", required, type="text", name="description")<-요거추가
        input(placeholder="Hashtags, seperated by comma.", required, type="text", name="hashtags")<-요거추가
        input(type="submit", value="Upload Video")
********************************************************************************************************

자 이제 우리의 controller가 form을 다룰수 있게 해줄거다
여기서 꼭 기억해야하는것은 form에는 URL이란 action이 있다. 
그리고 우리가 만약 action="/videos/upload" 이부분을 삭제한다면 HTML은 현재의 URL에 현재의 주소에 
form안의 Data들을 보내주는거다. 근데지금은 어차피 같아서 지워도 되긴하지만 명시해주기 위해 적어놓음 

자 그럼 이제 우리의 비디오라우터를 한번 다시 점검해보면
'/videos/upload' 경로가 있고
거기서 upload해주는 templete을 render하는 getUpload가 있고 
그리고 지금 다루고있는 postUpload가 있다. 

********************************************************************************************************
(videoRouter.js)

import express from "express";
import { 
    watch,
    getUpload,
    getEdit,
    postEdit, 
    postUpload} from "../controllers/videoController";

const videoRouter = express.Router(); 

videoRouter.route("/:id(\\d+)").get(watch);  
videoRouter.route("/:id(\\d+)/edit").get(getEdit).post(postEdit); 
videoRouter.get("/upload", getUpload);
videoRouter.post("/upload", postUpload);

export default videoRouter;
********************************************************************************************************


그리고 이 postUpload 함수에 우리가 description과 hashtags를 추가해줬으니
그것을 다루기위한 것도 추가를 해주면된다.

********************************************************************************************************
(videoController.js)

export const postUpload = (req, res) => {
    // here we will add a video to the videos array.
    const { title, description, hashtags } = req.body;
    return res.redirect("/");
********************************************************************************************************

근데 어떻게 비디오를 만들지?
일단 비디오를 만들기 위해서 우리는 document를 만들어줘야한다. 
document는 데이터를 가진 비디오라고 생각하면 편하다. 

그리고 document를 DataBase에 저장해야한다. 

자 그러니 일단 document를 만들어보자. 

********************************************************************************************************
(videoController.js)

export const postUpload = (req, res) => {
    // here we will add a video to the videos array.
    const { title, description, hashtags } = req.body;
    const video = new Video({
        title,              <- title: title, 이거랑 같은거여 새로운 문법이지.
        description,
        createAt: Date.now(),
        meta: {
            views: 0,
            rating: 0
        }
    })
    return res.redirect("/");
}********************************************************************************************************

자 우리는 현재 schema와 같은 모양으로 document를 만들었는데(hashtags는 일단 생략) 
schema와 document의 차이점이 있다면 document는 레알데이타라는 것이다. 

자 그럼 hashtags는 어떻게 해야지?
hashtags는 string으로 구성된 array인 점을 고려해야한다. 

여기서 사용하는게 split 메소드와 map 메소드인데 
사용법은 간단하다. 

split 사용 예시)
"LGD, LGE, LGC".split(",") 
요로케 split 메소드를 사용해주면 "," 를 기준으로 나누는 배열을 만들어 주지. 

["LGD", "LGE", "LGC"] <- 결과
 

map 사용 예시)
"LGD, LGE, LGC".split(",").map(word => `#${word}`)
배열의 각 요소에 map안의 함수를 적용시켜주는 뭐 그런거다.
요로케 백틱을 써서 각 배열앞에 '#' 을 붙여주면 앞에 '#' 이 다붙는거지 

["#LGD", "#LGE", "#LGC"] <- 결과

자 이런게 우리가 hashtags를 구성하는 원리가 될것이다. 

먼저 hashtags의 존재를 확실히 해줘야한다. 
그래도 우리가 upload.pug에서 hashtags의 input을 required로 해놔서 크게 걱정은 안해도 되겠찌만 
뭣이됬던간에 일단 만들어 보자 

********************************************************************************************************
(videoController.js)

export const postUpload = (req, res) => {
    // here we will add a video to the videos array.
    const { title, description, hashtags } = req.body;
    const video = new Video({
        title,
        description,
        createAt: Date.now(),
        hashtags: hashtags.split(",").map(word => `#${word}`),
        meta: {
            views: 0,
            rating: 0
        }
    })
    return res.redirect("/");
}
********************************************************************************************************

짠 이렇게 video object 하나가 완성이 되었다. 
저 video object는  form에서 전송되는 진짜 데이터로 이루어진 레알 데이터다. 

자 근데 여기서 내가 실수한게 아나있었는데 

아무리해도 hashtags가 안나오는겨 이상하다.
그래서 video밖에서 따로 hashtags를 만들어서 콘솔로그하면 또 나오고
그렇게 얼빠져서 삽질하고 있는데 알고보니 schema를 잘못 설정했던것. 
********************************************************************************************************
(video.js) 

import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    //비디오 형식을 저장하는 구간
    title: String,
    description: String,
    createdAt: Date,
    hashtags: [{ type: String }], <- 이걸 'hastags' 로 했었네 바보같이...
    meta: {
        views: Number,
        rating: Number
    }
});

const Video = mongoose.model("Video", videoSchema);

export default Video;
********************************************************************************************************

이걸통해서 우리가 처음에 설정해준 schema와 일치하지않는 데이터명을 사용하면 제대로 동작하지 않는다는걸 알수가 있다. 
우리는 mongoose를 이용해서 아주 똑똑한 객체를 만든거야 
어느정도 잘못된 데이터정보가 입력되는걸 막아주는거지 
올바르지 않은 데이터는 documnet에 기록될수없게 만드는거지 

자 이제 진짜 database에 우리의 데이터를 저장해보자 
현재는 database에는 없고(왜냐면 upload해도 home에서 확인이 안되자나)
그냥 javascript세계에서만 객체로 존재하는거니까 
이걸 database의 세계로 넘겨보자 

********************************************************************************************************
(videoController.js)

export const postUpload = (req, res) => {
    // here we will add a video to the videos array.
    const { title, description, hashtags } = req.body;
    
    const video = new Video({
        title,
        description,
        createdAt: Date.now(),
        hashtags: hashtags.split(",").map((word) => `#${word}`), 
        meta: {
            views: 0,
            rating: 0
        }
    })
    video.save(); <- 이걸 통해서 database로 넘겨줄수있다. 
    return res.redirect("/");
}
********************************************************************************************************

video가 mongoose model인 덕분에 많은 시스템지원을 받을 수 있다. 
그중하나가 'save()' 인거다. 
save는 promise를 return해줘야하는데 이말은 save작업이 끝날 때까지 기다려줘야 한다는거다. 
저기 생성자를 이용해서 video객체를 만들어주는 부분은 JavaScript안에서만 존재한다. 
그래서 기다려줄 필요가 없다.

하지만 save가 되는순간 우리는 기다려줘야한다. 
왜냐하면 database에 기록되고 저장되는데에는 시간이 조금 걸리니깐. 
기다리는건 진짜 중요하다.

database에 저장이 되고 HOME으로 돌아가야 home에서 저장된 비디오를 렌더링해줄것아니여!

********************************************************************************************************
(videoController.js)

export const postUpload = async (req, res) => {    <- 요기서 async써주는것 잊지말고 
    // here we will add a video to the videos array.
    const { title, description, hashtags } = req.body;
    
    const video = new Video({
        title,
        description,
        createdAt: Date.now(),
        hashtags: hashtags.split(",").map((word) => `#${word}`), 
        meta: {
            views: 0,
            rating: 0
        }
    })
    const dbVideo = await video.save(); <- 요기서 await해서 기다려주는거지
    return res.redirect("/");
}
********************************************************************************************************

이제 우리는 database에 파일이 저장되는것을 기다릴 수 있게 되었다. 
save는 promise를 return하고 이걸 await하면 우리는 document가 return된다...?

video.save는 생성된 video를 reuturn해준다. 
그리고 그 video는 database에 속한 video다. 

# 에러처리 

videoController.js에서 'createAt' 프로퍼티를 넣어주지 않아도 에러는 발생하지 않는다.
왜냐하면 video.js에서 videoSchema의 'createAt'이 required가 아니기 때문
따라서 아래와 같이 'createAt'에 required 속성을 부여해준다. 

********************************************************************************************************
(video.js)

import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    //비디오 형식을 저장하는 구간
    title: String,
    description: String,
    createdAt: { type: Date, required: true},  <- 요로케
    hashtags: [{ type: String }],
    meta: {
        views: Number,
        rating: Number
    }
});

const Video = mongoose.model("Video", videoSchema);

export default Video;
********************************************************************************************************

이렇게 해주면 createAt이 없으면 에러가 발생한다.
이렇듯 mongoose에서는 데이터 타입을 구체적으로 작성할수록 더 편하다.
우리는 그럼 아래와 같이 try/catch를 이용해서 에러가발생했을떄의 대처방안을 작성할 수 있다.

********************************************************************************************************
{videoController.js}

export const postUpload = async (req, res) => {
    // here we will add a video to the videos array.
    const { title, description, hashtags } = req.body;
    try{
        const video = new Video({
            title,
            description,
            createdAt: Date.now(),
            hashtags: hashtags.split(",").map((word) => `#${word}`), 
            meta: {
                views: 0,
                rating: 0
            }
        })
        await video.save();
        return res.redirect("/");
    } catch(error){
        console.log('error: ', error);
        return res.render("upload", {
            pageTitle: "Upload Video", 
            errorMessage: error._message}); <- 이건 에러메세지를 화면에 띄워주기 위함. 
    }
    
};
********************************************************************************************************

자 model을 작성할 떄 이러한 방법도 있다. 
미리 schema에 default로 값을 넣어놓는 방법. 

********************************************************************************************************
(video.js) 

import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    //비디오 형식을 저장하는 구간
    title: String,
    description: String,
    createdAt: { type: Date, required: true, default: Date.now}, <- 요부분에 default값을 넣으면
    hashtags: [{ type: String }],
    meta: {
        views: Number,
        rating: Number
    }
});

const Video = mongoose.model("Video", videoSchema);

export default Video;

{videoController.js}

export const postUpload = async (req, res) => {
    // here we will add a video to the videos array.
    const { title, description, hashtags } = req.body;
    try{
        const video = new Video({
            title,
            description,
            /*createdAt: Date.now(),*/ <- 여기 이거 없어도 됌.
            hashtags: hashtags.split(",").map((word) => `#${word}`), 
            meta: {
                views: 0,
                rating: 0
            }
        })
        await video.save();
        return res.redirect("/");
    } catch(error){
        console.log('error: ', error);
        return res.render("upload", {
            pageTitle: "Upload Video", 
            errorMessage: error._message});
    }
    
};
********************************************************************************************************

자 그럼 meta도 바꿔줄수가 있다. 


********************************************************************************************************
(video.js)

import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    //비디오 형식을 저장하는 구간
    title: { type: String, required: true},
    description: { type: String, required: true},
    createdAt: { type: Date, required: true, default: Date.now},
    hashtags: [{ type: String }],
    meta: {
        views: { type: Number, required: true, default: 0 },
        rating: { type: Number, required: true, default: 0 }
    }
});

const Video = mongoose.model("Video", videoSchema);

export default Video;
********************************************************************************************************

지금까지의 내용을 정리하자면 우리는 먼저 에러를 일부러 만들었다.(schema와 형식이 다르거나 뭐 데이터를 일부러 빼거나)
처음에는 에러가 발생하지 않았지만
해당 코드에 required, default를 추가해줌으로서 에러를 잡아낼수 있게되었다. 
그렇게 에러가 발생한 경우 try/catch를 통해서 에러메시지를 templete을 render해서 보낼 수 있께 되었따. 

우리의 templete이 정상일 때는 getUpload가 render하고 
에러가 있는 경우에는 에러메세지와 함께 render 된다. 

주요하게 기억해야할것은
'await'되는 코드에 오류가 있다면 
Javascript는 더 이상 코드를 실행시키지 않는다. 

그렇기에 try/catch를 넣은거고 Javascript는 try 한 뒤 catch 한다.
 
# More schema 

description: { type: String, required: true, uppercase: true}, <- 전부 그냥 대문자로 바꿔줌 
description: { type: String, required: true, trim: true}, <- 앞뒤 띄어쓰기 다 없애줌 


-. 글자수 제한
아래와 같이 videos.js에서 mongoose를 이용해 서버단에서 글자수 제한을 두면서
upload.pug에서 html을 이용해 유저단에서 애초에 글자수 입력을 못하게 하면 
유저도 어차피 글자수 제한에 맞춰서밖에 입력을 못하지만 혹시나 나의 HTML이 해킹당해도 서버단에서 글자수를 제한해 준다. 
어찌보면 보안의 역할을 해주는거지 

********************************************************************************************************
(video.js)

import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    //비디오 형식을 저장하는 구간
    title: { type: String, required: true, trim: true, maxLength: 80},
    description: { type: String, required: true, trim: true, minLength: 20},
    createdAt: { type: Date, required: true, default: Date.now, trim: true},
    hashtags: [{ type: String, trim: true }],
    meta: {
        views: { type: Number, required: true, default: 0, trim: true },
        rating: { type: Number, required: true, default: 0, trim: true }
    }
});

const Video = mongoose.model("Video", videoSchema);

export default Video;

(upload.pug)

extend base.pug 

block content  
    if errorMessage
        span=errorMessage
    form(method="POST", action="/videos/upload")
        input(placeholder="Title", required, type="text", name="title", maxlength=80)
        input(placeholder="Description", required, type="text", name="description", minlength=20)
        input(placeholder="Hashtags, seperated by comma.", required, type="text", name="hashtags")
        input(type="submit", value="Upload Video")
********************************************************************************************************

위와같은 공부를 통해 schema는 데이터의 종류와 필수여부를 구분할 줄 알고 
string의 길이도 검사할 수 있고, trim도 자동으로 실행되고 있다. 
여기에 더해 default값들도 설정되어 있다. 
이런것들이 바로 구체적인 schema의 힘이다. 
 
자 이제 비디오를 생성하는건 끝났다. 
이제 homePage를 좀 바꿔볼거다. 

이전의 가짜데이터를 위한 mixin을 수정해서 진짜 data를 위한 홈페이지로 만들어 볼거다. 

********************************************************************************************************
(video.pug)
 : 변경 전 기존
mixin video(video) 
    h4
        a(href=`/videos/${video.id}`)=video.title  
    ul 
        li #{video.rating}/5
        li #{video.comment} comments.
        li Posted #{video.createdAt} createdAt.
        li #{video.views} views.       
  : 변경 후 수정본
  mixin video(video) 
  h4
      a(href=`/videos/${video.id}`)=video.title  
  p=video.description <- 줄바꿈
  small=video.createdAt  <- 글자 작고 회색으로 만들어주는거
  hr            <- 선만들어주는거 

********************************************************************************************************

이정도만 일단 홈에서는 보여지면 될듯 나머지는 굳이 홈에서 보여주지 않을거다.

자그럼 막간을 이용해 mixin(video.pug)에대해 공부해보자면 
우리는 video.pug가 home.pug에서 사용되고있는걸 알고 있따. 
그리고 videoController가 home이란 controller function을 가지고 있다는것도 알고있다. 

home은 모든 video를 찾아내고 videos는 video들로 구성된 array다. 
우리는 이 videos를 home templete으로 전송하고 있다. 

home templete은 videos에 있는 각각의 video에 video mixin을 사용하고 있다. 
video object 전체를 mixin으로 보내고 있는거다. 
(여기서 video object들은 나의 mongoDB에 있는 내가 만든 video 객체들을  말한다. )

그리고 video.id 링크로 render 하고 있다. 
자 그런데 그 video.id 링크로 들어가면 
'Cannot GET /videos/61f8d0dba4a76365877b2d96'
요런 문구를 볼수가 있지 
이건 우리의 videoRouter때문인데 우리 videoRouter는 숫자만 인식하게 되어있다.
자 이걸 이제 바꿔볼거다.

********************************************************************************************************
(videoController.js)

export const home = async(req, res) => {
    try{
        const videos = await Video.find({})
        return res.render("home", {pageTitle: "Home", videos});
    } catch {
        return res.render("server-error")
    }
};

(home.pug)
extends base.pug 
include mixins/video

block content
    each potato in videos  
        +video(potato)
    else 
        li Sorry nothing found.

(video.pug)

mixin video(video) 
    h4
        a(href=`/videos/${video.id}`)=video.title  
    p=video.description 
    small=video.createdAt
    hr

********************************************************************************************************

61f8b32420eb097b54c10c3f이게 mongoose에서 랜덤으로 만들어주는 id의 예시다. 
mongoose documentation에서 확인해 보면 24자의 16진수라고 규정되어있다. 

그럼 videoRouter에서 그것을 정규표현식으로 설정해주면 되겠지. 

********************************************************************************************************
(videoRouter.js)

import express from "express";
import { 
    watch,
    getUpload,
    getEdit,
    postEdit, 
    postUpload} from "../controllers/videoController";

const videoRouter = express.Router(); 

videoRouter.route("/:id(\\d+)").get(watch);   <- 여기가 문제다. 현재는 '(\\d+)' 이거때문에 숫자만 id로 받아드리고있는데  
                                                 그렇다고 '(\\d+)' 이 정규표현식을 지우면 그냥죄다 id로 받아들여서 upload도 
                                                 id로 인식해 watch templete으로 찾아 가게된다.


videoRouter.route("/:id(\\d+)/edit").get(getEdit).post(postEdit); 
videoRouter.get("/upload", getUpload);
videoRouter.post("/upload", postUpload);

export default videoRouter;
********************************************************************************************************

그렇기에 '(\\d+)' 대신 24자의 16진수라는걸 알리는 표현식을 사용하면 된다. 
'[0-9a-f]{24}' <- 이거다. 0부터9 a부터f까지로 이루어진 24자리수 라는 뜻.

사실그냥 upload를 위로 올려줘도 되지만 정규표현식쓰는법도 알아야하니까 사용했다. 


자 이제 정규표현식을 사용해서 경로는 제대로 찾게 만들었다. 원하는 비디오의 watch page로 가게 한거다. 
그런데 막상 그 비디오의 watch페이지로 가게되면 에러를 볼수있다. 

********************************************************************************************************
TypeError: /Users/seunghoon/Desktop/IhaveaDream/노마드코더/노마드코더강의용/Wetube/src/views/watch.pug:4
    2| 
    3| block content
  > 4|     h3 #{video.views} #{video.views === 1 ? "view" : "views"}
    5|     a(href=`${video.id}/edit`) Edit Video &rarr;      

Cannot read properties of undefined (reading 'views')
at eval(...)
.
.
.

********************************************************************************************************
 
뭐 위와같은 에러인데 watch.pug에 지금 뭔가 문제가있따고 한다.
해결해 보자. 

********************************************************************************************************
(watch.pug) 

extends base.pug 

block content
    h3 #{video.views} #{video.views === 1 ? "view" : "views"}
    a(href=`${video.id}/edit`) Edit Video &rarr; 
    
(videoController.js)   
export const watch = (req, res) => {
    const { id } = req.params;
    return res.render("watch", { pageTitle: `Watching`});
} 
********************************************************************************************************

위의 watch.pug를 보면 templete은 video.views를 가지고 있다. 
하지만 우리의 video데이터에는 아직 views가 없는 상태다. 
그래서 undefined된 views의 property를 못부르고있다. 
이말은 정의되지않은 무엇안에서 views를 못찾고있음을 말한다. 

맞는말이다. 왜냐하면 우리는 video를 전송안하는데(videoController.js 의 wathc함수를 보면 알수있다.)
templete은 video를 전송받아야 작동하기 떄문이다.  

자 이제 일단 video를 정의 해주자. 
우린 현재 video는 없지만 id는 가지고있다. (const { id } = req.params;)
자 이말이 뭐냐면 우리는 id를 통해서 video를 찾을수있다는 말이다. 

어떻게 찾냐면 또 mongoose의 기능을 사용해서 찾는거다.
데이터를 찾는 메소드는 여러개가 있는데 그중에 2개를 소개하자면 
1. findOne
 -> 내가 보내는 모든 조건을 적용시켜서 찾아준다. 
 ex) 조회수가 25인 영상을 찾아주셈. 이런거 

2. findByID
 -> 말 그대로 id로 데이터를 찾아낼 수 있는 기능을 지원해준다. 
 
**************************************************************************************************************************
(videoController.js)

export const watch = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id); <- 요부분에서 id를 통해서 비디오를 찾은거다.그리고 그 비디오가 불려온거다.
    return res.render("watch", { pageTitle: video.title,video: video}); <- 정의된 video를 watch.pug에 넣어줘야한다. 
                                                                        그리고 pageTitle도 그 비디오의  타이틀에 맞게 변경해주었다. 
} 
**************************************************************************************************************************

자 이걸로 우리는 모든 video를 볼 수 있게 되었고 각 영상의 상세 페이지에도 접속할 수 있게 되었다. 


# 존재하지 않는 video 페이지를 방문하게 되면 어떻게 해야하는가? 

자 일단 존재하지 않는 비디오의 URL로 접속을 시도하면 브라우저는 무한로딩의 상태에 빠진다. 
그냥 멈춰있는거지 아무 반응도 없고 

뭐가 문제일까?

영상검색에 실패했기 떄문에 우리 video는 null인 상태다(videoController.js의 watch함수안의 video변수를 말하는거다.)
즉, watch templete을 렌더링하려고 title을 요청했는데 video가 존재하지 않아서 video가 널이니 title을 가져올수없는
에러상태인것이다. 

자 그럼 우리가 뭘 해야할까?
우리가 할수있는건 미리 확인하는거다. 
만약 video가 존재하면 그냥 templete을 렌더링하는걸 리턴하면 되고 
만약 video가 존재하지 않으면 뭐 그냥... 404 templete을 렌더링하면 되는거지 
404 templete은 새로 아래처럼 만들면 되지 

********************************************************************************************************
(videoController.js)

export const watch = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (video) {
        return res.render("watch", { pageTitle: video.title,video: video});
    }
    return res.render("404", { pageTitle: "Video not found" })
    
} 

(404.pug)
extends base <- 뭐 별다른게 필요하진 않고 videoController.js에서 그냥 비디오 없다고 pageTitle만 넣어준다. 
********************************************************************************************************


# Edit Video part one

자 우리는 2개의 edit video controller가 있다. 
-. getEdit 
-. posEdit 

자 일단 getEdit부터 작업해보자. 

1. getEdit 

id는 req.params에서 받아올거고 저 위에서 watch function에서 했던거랑 비슷한거 할거다. 
자 일단 비디오를 찾자 '아 그리고 비디오 찾을떄까지 기다려야 하니까 async/await 써야한다.'

아 그리고 에러처리할 때 중요한게 만약에 저 404렌더링하는거 앞에 'return' 이 없으면 
아래의 정상적인 상황에서 동작하는 코드도 실행이 되버리니까 꼭 return을 해줘서 저 함수를 끝내줘야 한다. 
********************************************************************************************************
(videoController.js) 

export const getEdit = async (req, res) => {
    const {id} = req.params;
    const video = await Video.findById(id); <- 자 여기서 비디오 찾아주고  
    if (video === null) {
        return res.render("404", {pageTitle: "Video not found."})
    }
    return res.render("edit", { pageTitle:`Editing`, video }); <- edit.pug에서 필요한 vidoe object 넣어줌.
};
********************************************************************************************************

자 이제 위의 코드에서는 video가 없을 때는 404 페이지를 출력해주고 비디오가 있을 때는 
edit 페이지를 출력해준다. 

그럼이제 edit page의 input들을 수정해줘야 한다. 
우리가 수정해줘야할 것들을 input란으로 만들어줘야한다는 거다.
근디 또 이걸 원래 upload.pug처럼 그냥 공란으로 두면 안되고 원래 값들이 채워져 있어야 수정할 떄 용이할것이 아니여 
그러니 value='' 를 이용해서 값을 채워준다. 

한가지 유의할 점은 video.hashtags는 배열의 형태이기 때문에 그것을 다시 문자열형태로 변환시켜줘야한다. 
video.hashtags.join() 요로케 join()이라는 메소드 사용하면 간단하게 해결 
[#mongo,#mongoose,#OMG]  -> "#mongo,#mongoose,#OMG" 이렇게 변환된다. 

**************************************************************************************************************************************
(edit.pug)
 : 기존 
extends base.pug 

block content
    h4 change Title of video 
    form(method="POST")
        input(placeholder="Video Title", name="title",value=video.title, required)
        input(value="Save", type="submit")

 : 수정 후
 extends base.pug 

 block content
     h4 change Title of video 
     form(method="POST")
         input(placeholder="Title", required, type="text", name="title", maxlength=80, value=video.title)
         input(placeholder="Description", required, type="text", name="description", minlength=20, value=video.description)
         input(placeholder="Hashtags, seperated by comma.", required, type="text", name="hashtags", value=video.hashtags.join())
         input(type="submit", value="Upload Video")
**************************************************************************************************************************************

# edit video part two

이제 edit form에서 요청된 req.body를 가지고 Video DataBase를 업데이트해야한다.
2가지 방법이 있는데 첫번쨰는 아래처럼 일일히 video object의 요소를 교체해주는것이다. 
이와같은 방법은 수정해줘야할것들이 많으면 아주 귀찮은 방법이다. 
저걸 언제 다 쓰고 앉아있냐 얼른 퇴근해야지 
********************************************************************************************************
(videoController.js)

export const postEdit = async (req, res) => {
    const { id } = req.params;
    const { title, description, hashtags } = req.body;
    const video = await Video.findById(id);
    if (video === null) {
        return res.render("404", "Video not found. ")
    }
    video.title = title;
    video.description = description;
    video.hashtags = hashtags.split(",").map((word) => word.startsWith("#") ? word : `#${word}`);
        -> 위에서 한거는 , 단위로 배열을 만들고 각 배열의 요소에 이게 #으로 시작하면 그냥 그대로, 아니면 #추가 요렇케 해서 
            video DataBase에 저장될수있게 만든거다. 
    await video.save();
    return res.redirect(`/videos/${id}`)
};
********************************************************************************************************

# Edit Video part three

-. Model.findByIdAndUpdate()

위에서 처럼 video object의 프로퍼티들을 일일히 수정하고 그 수정한 video obcject를
video.save를통해 video DB로 저장해줄 필요없이 한방에 해결할수있다. 
아주 간편하쥬?
********************************************************************************************************
(videoController.js)

export const postEdit = async (req, res) => {
    const { id } = req.params;
    const { title, description, hashtags } = req.body;
    const video = await Video.exists(_id : id);
     -> findByIdAndUpdate를 사용하는거면 굳이 video object를 가져올필요없이 video의 존재유무만 확인하면 된다. 
        그렇기에 Video.findById를 Video.exists로 대체 그안에는 어떤걸로 찾을지 인자를 넣어줘야하는데 우리는 id로 찾을거니
        id를 넣어주면 된다. 
        exists는 ID만 받는게 아니라 filter를 받는다는 거다. 
    if (video === null) {
        return res.render("404", "Video not found. ")
    }
    await Video.findByIdAndUpdate(id, {
        title: title,
        description: description,
        hashtags: hashtags.split(",").map((word) => word.startsWith("#") ? word : `#${word}`)
    })
    return res.redirect(`/videos/${id}`)
};
********************************************************************************************************

우리는 2가지의 비디오 업데이트방법을 쓸수있다. 
하나는 일단 데이터베이스에서 영상을 찾은 후에 
수동으로 video.title = something 이런식으로 수정하는 방법 

다른하나는 Mongoose에서 제공하는 function을 쓰는거다. 
Video는 우리가 쓰는 Model이고, findByIdAndUpdate() <- 요고는 Mongoose에서 제공하는 function이다. 
Video는 우리가 만든 영상 Model이다. 
video는 데이터베이스에서 검색한 영상 object고 아주 다르다. 

Video는 모델이기 떄문에 mongoose에서 제공하는 아름다은함수들을 쓸수있는거다. 



# Mongoose Middleware
 -> DataBase에 저장하기전에 우리는 많은것들을 처리한 후 저장해야한다. 
    에를들어서 저장하는 코멘트에 비속어가있는가? 혹은 저장하는사람의 e-mail이 실제로 존재하는 e-mail인가?등등. 
    이런것들을 저장하기전에 슬쩍 끼어들어서 해주는게 middleware다. 
    EXPRESS에 Middelware가 존재하듯 Mongoose에도 Middelware가 존재한다. 
    우리의 경우는 #을 붙여서 해시태그처럼 보이게하는게 그러하겠지. 

    자 이제 첫번쨰 mongoose 미들웨어를 만들어볼거다. 
    (미들웨어는 모델이 만들어지기전에 만들어야한다.)

아래에서 video.js에서 모델을 만들기 전에 pre middleware를 save 이벤트에 적용시킨것이다. 
이렇게 하면 우리가 컨트롤러에서 프론트단에서 받은 정보를직접 처리하는게 아니라
mongoose를 이용해 모델을 만들기 전에 미리 미들웨어로 해쉬태그들에 관한 정보를 처리한것이다...???

-> 어떤 이벤트가 발생하기전에 중간에 가로채서 우리 문서를 수정한거다.

********************************************************************************************************
(Video.js)
import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    //비디오 형식을 저장하는 구간
    title: { type: String, required: true, trim: true, maxLength: 80},
    description: { type: String, required: true, trim: true, minLength: 20},
    createdAt: { type: Date, required: true, default: Date.now, trim: true},
    hashtags: [{ type: String, trim: true }],
    meta: {
        views: { type: Number, required: true, default: 0, trim: true },
        rating: { type: Number, required: true, default: 0, trim: true }
    }
});

videoSchema.pre("save", async function() {
    this.hashtags = this.hashtags[0].split(",").map((word) => word.startsWith("#") ? word : `#${word}`);
    console.log("we are about to save: ", this);
})

const Video = mongoose.model("Video", videoSchema);

export default Video;

(videoController.js)

export const postUpload = async (req, res) => {
    // here we will add a video to the videos array.
    const { title, description, hashtags } = req.body;
    try{
        const video = new Video({
            title,
            description,
            hashtags
        })
        await video.save();
        return res.redirect("/");
    } catch(error){
        console.log('error: ', error);
        return res.render("upload", {
            pageTitle: "Upload Video",
            errorMessage: error._message            
        });
    }
    
};
********************************************************************************************************

-------------------------------------------------------------------------------------------------------- 
mongoDB 터미널 사용 명령어 

1. 몽고 사용하기
> mongo

2. 내가 가진 db 보기
> show dbs

3. 현재 사용 중인 db 확인
> db

4. 사용할 db 선택하기
> use dbName
(현재 수업에서는 `use wetube`)

5. db 컬렉션 보기
> show collections

6. db 컬렉션 안에 documents 보기
> db.collectionName.find()
(현재 수업에서는 `db.videos.find()`)

7. db 컬렉션 안에 documents 내용 모두 제거하기
> db.collectionName.remove({})
(현재 수업에서는 `db.videos.remove({})`)
--------------------------------------------------------------------------------------------------------


위는 일단 업로드시에만 사용하는거고 업데이트를 위한 미들웨어를 따로 만들어줘야한다.
그러니 한번에 처리할수있는 미들웨어를 만들어서 사용해보자.

********************************************************************************************************
(video.js)

import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    //비디오 형식을 저장하는 구간
    title: { type: String, required: true, trim: true, maxLength: 80},
    description: { type: String, required: true, trim: true, minLength: 20},
    createdAt: { type: Date, required: true, default: Date.now, trim: true},
    hashtags: [{ type: String, trim: true }],
    meta: {
        views: { type: Number, required: true, default: 0, trim: true },
        rating: { type: Number, required: true, default: 0, trim: true }
    }
});

videoSchema.static("formatHashtags", function (hashtags) {
    return hashtags.split(",").map((word) => word.startsWith("#") ? word : `#${word}`);
})
-> 이렇게 static을 사용하면 우리가 임의로 미들웨어를 만들어줄수있다. 



const Video = mongoose.model("Video", videoSchema);

export default Video;
********************************************************************************************************



# Delete Video 

1.
Watch.pug에서 보면 Edit Video 링크가 있다. 
똑같이 Delete Video링크를 하나 만들어 준다. 

********************************************************************************************************
(Watch.pug) 

extends base.pug 

block content
    div
        p=video.description
        small=video.createdAt
    a(href=`${video.id}/edit`) Edit Video &rarr;
    br
    a(href=`${video.id}/delete`) Delete Video &rarr;  <- 요거 만들어 주구용    
********************************************************************************************************

http://localhost:4000/videos/videoid들어가는부분/delete

우리는 위의 링크를 들어가게 되면 해당 id의 비디오를 삭제해 줄거다. 

2. 우리는 이 function의 라우터와 컨트롤러를 만들어 줘야한다. 
********************************************************************************************************
(videoRouter.js)

import express from "express";
import { 
    watch,
    getUpload,
    getEdit,
    postEdit, 
    postUpload,
    deleteVideo
} from "../controllers/videoController";

const videoRouter = express.Router(); 

videoRouter.route("/:id([0-9a-f]{24})").get(watch);  
videoRouter.route("/:id([0-9a-f]{24})/edit").get(getEdit).post(postEdit); 
videoRouter.route("/:id([0-9a-f]{24})/delete").get(deleteVideo); <-여기서 라우터만들어주고 
videoRouter.get("/upload", getUpload);
videoRouter.post("/upload", postUpload);

export default videoRouter;

(videoController.js)
-> 요 아래같이 컨트롤러 하나 만들어 준다.
export const deleteVideo = async (req,res) => {
    const { id } = req.params;
    //delete video
    console.log(id);
    res.redirect("/");
}
********************************************************************************************************

자 이제 라우터로 delete경로 지정해주고 delete URL로 들어왔을 때 실행시켜줄 컨트롤러함수도 만들어줬따. 
이제 mongoose를 이용해서 DB에서 지워주면 되는데 그 떄 사용하는 메소드는 
Model.findByIdAndDelete()다. 딱봐도 뭔가 지워줄거같은 느낌이 나쥬? 

********************************************************************************************************
(videoController.js)

export const deleteVideo = async (req,res) => {
    const { id } = req.params;
    //delete video
    await Video.findByIdAndDelete(id); <- 여기서 id 지정해주면 그거 지워준다. 
    res.redirect("/");
}
********************************************************************************************************

# Search Part one

현재 우리 홈페이지의 비디오 정렬방식은 최신것이 가장 아래에 있다. 
이것은 뭔가 마음에 들지 않는다. 
최신에 업로드한 동영상이 가장 위에있게 일단 바꿔보자. 

-> sort를 이용해 분류한다. 또한 특정항목을 asc(오름차순), desc(내림차순) 등으로 정렬할 수 있다. 
    우리는 createdAt의 내림차순기준으로 정렬한것이다. 즉, 최신것이 가장 위에 올라오게 한거다. 
********************************************************************************************************
(videoController.js)

export const home = async(req, res) => {
    try{
        const videos = await Video.find({}).sort({ createdAt : "desc" })
        return res.render("home", {pageTitle: "Home", videos});
    } catch {
        return res.render("server-error")
    }
};
********************************************************************************************************

자 이건 맛보기다. 

우리가 진짜 하려고하는건 새로운 페이지를 만드는거고, 그 새로운 페이지는 search 페이지다. 
만약 search페이지를 만드려면 어느 Router에 해야하는가?
당연히 globalRouter 겠지. 

아래처럼 일단 라우터와 컨트롤러를 생성한다. 
********************************************************************************************************
(globalRouter.js)
globalRouter.get("/search", search)

(videoController.js)
export const search = (res, req) => {
    return res.render("search", {pageTitle: "Search"});
}
********************************************************************************************************

현재 search 페이지가 없으니 search페이지를 만들어 준다. 
일단 search페이지로 가기 위한 링크를 base.pug에 추가해주고 
아래와 같이 search.pug를 만든다. 

********************************************************************************************************
(search.pug)

extends base.pug 

block content 
    form(method="GET")
        input(type="text" placeholder="Search by title", name="keyword") 
        input(type="submit", value="Search now")
********************************************************************************************************

여기서 하나 잊지 말것이 search.pug는 base.pug를 extend하는것이기 때문에 base.pug에서 쓰이는 변수인 
pageTitle을 꼭 입력해줘야 한다. (컨트롤러에서 넣어줘야함.)

자 이제 우리는 search now 버튼을 누르면 원하는 비디오가 있는 페이지로 넘어가게 할것이다. 

그전에 우리가 form을 통해 전송하는 정보들은 
"req.query" 를 통해서 받을 수 있다. 
즉 GET 방식으로 전달할때는 모든 정보가 URL 에 담겨있꼬 그것은 서버단에서 req.query를 통해 받을 수있다.
********************************************************************************************************
(videoController.js)

export const search = (req, res) => {
    console.log(req.query);
    return res.render("search", {pageTitle: "Search"});
}
********************************************************************************************************
예를들어 위와같이 컨트롤러를 만들고 keyword Input란에 "react" 라는 검색어를 넣고 Search now를 클릭하면 
{ keyword: 'react' }
요런거를 이제 우리의 콘솔창에서 볼수있다. 

이러면 이제 개쉬워지는거다. 

일단 keyword는 항상 존재하는게 아니다. 
뭔가를 검색해야만 keyword에 값이 있는거고 그냥 search페이지에 들어왔을 땐 keyword = undefined 이다. 

그러니 컨트롤러를 나눠줘야겠지. 

********************************************************************************************************
(videoController.js)

export const search = async (req, res) => {
    const {keyword} = req.query;
    let videos = [];
    if(keyword) {                      <- keyword가 있을 때
        videos = await Video.find({
            title: keyword
        });       
        return res.render("search", {pageTitle: "Search", videos}); <- 이때는 videos가 빈배열이 아니겠지.
    }
    return res.render("search", {pageTitle: "Search", videos}); <- 이때는 videos가 빈배열일테고 
}
********************************************************************************************************

자 그럼 우리의 search.pug는 videos라는 배열을 받는다. 
그러니 templete도 그에맞게 수정해줄 필요가 있다. 
home.pug에서 해줬떤것처럼 mixin을 가져오면 된다. 

********************************************************************************************************
(search.pug)

extends base.pug 
include mixins/video

block content 
    form(method="GET")
        input(type="text" placeholder="Search by title", name="keyword")
        input(type="submit", value="Search now")
    div  
        each video in videos 
            +video(video )
********************************************************************************************************

자 그런데 우리가 동영상을 검색할 떄 토씨하나 안틀리게 제목을 검색하진 않지 
그러니 정규표현식을 이용하여 검색방식을 좀 더 개선해 봅시다. 

********************************************************************************************************
(videoController.js)

export const search = async (req, res) => {
    const {keyword} = req.query;
    let videos = [];
    if(keyword) {
        videos = await Video.find({
            title: {
                $regex: new RegExp(keyword,"i") 
                ->일단 regex를 씀으로서 contain방식은 디폴트로 쓰인다. 그리고 뒤에 "i" 는 대소문자 구분없애주는거임.
                  정규표현식 방법은 필요할때마다 찾아서 쓰면 될듯. 
            }
        });       
        return res.render("search", {pageTitle: "Search", videos});
    }
    return res.render("search", {pageTitle: "Search", videos});
}
********************************************************************************************************

regexp는 mongoose가 해주는게 아니고 mongoDB가 해주는거다. 


######자 이제 USER 파트 시작################

# Create Account part one
 -> 우리가 만드는 앱에 계정을 생성하는 페이지를 만들어볼거다. 

일단 Video.js에서 비디오모델을 만들었던것과 유사하게 User.js를 만들어서 User정보에 대한 모델스키마를 만든다.
가장먼저 스키마를 만들어서 Mongo와 Mongoose에게 User가 어떻게 생겼는지 알려준 다음에
static을 만들고 모델을 export 할거다. 

********************************************************************************************************
(User.js)
import mongoose from "mongoose";
import userRouter from "../routers/userRouter";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    location: String
})

const User = mongoose.Model("User", userSchema);
export default User;
********************************************************************************************************

자 일단 위에서처럼 User 모델과 스키마를 만들었다.  
(User.js는 당연히 init.js에서 import 해야함.)

자 User를 만들었으니 templete을 만들어볼거다. 
회원가입을 할 수 있는 URL을 만드는거다. 

자 우리는 이미 userController.js에 join이라는 contorller를 만들어놓았다. 
********************************************************************************************************
(userController.js) 

export const join = (req, res) => res.send("Join"); <- 요기잉네?

-> 이렇게 아래처럼 바꿔줍시다. 
export const getJoin = (req, res) => res.render("join", {pageTitle: "Join"});
export const postJoin = (req, res) => {};
        
export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const login = (req, res) => res.send("Login");
export const logout = (req, res) => res.send("Logout")
export const see = (req, res) => res.send("See User");

********************************************************************************************************

자 위의 join 컨트롤러에서 res.send("join") 대신 
우리의 새로운 페이지를 띄우기 위해 
export const join = (req, res) => res.render("join", {pageTitle: Join}); 
(base.pug를 쓰니까 당연히 pagetTitle을 넣어줘야한다.)
을 만들어주고 이것은 GET 방식의 요청이들어왔을 때 페이지를 렌더링해주는 역할을 한다. 

form에 의한 POST 요청이 들어왔을때의 처리할 코드도 만들어놓았고 이제 form을 만들어 보려고한다.
export const postJoin = (req, res) => {};

이렇게 수정해주고 createAccount.pug 를 만들거다. 
일단은 base.pug만 extends해 놓는 상태 

자 이제 navigation을 수정한다. 
아 그전에 우리 globalRouter의 이름을 rootRouter로 수정해줄거다.
별다른 이유는 없고 그냥 사람들이 햇갈릴수 있으니까 
이건 root페이지를 위한 라우터니까 뭐 이게 맞다. 
그냥 하면된다. 

자 이제 아래처럼 join URL 에 대한 라우터를 추가해주면 된다. 
******************************************************************************************************* 
(rootRouter.js)

import express from "express";
import { getJoin, postJoin,login } from "../controllers/userController";
import { home, search } from "../controllers/videoController";

const rootRouter = express.Router(); 

rootRouter.get("/", home);
rootRouter.route("/join").get(getJoin).post(postJoin); <- 요렇게 Join URL 에 대한 라우터도 추가해줘야한다. 
********************************************************************************************************

이제 각 join 요청에 대한 네비게이션을 만들어줬으니 POST 요청을 위한 form을 만들어 볼거다. 

********************************************************************************************************
(join.pug)

extends base

block content 
    form(method="POST")
        input(name="name", type="text", required)
        input(name="email", type="email", required) <- type=email 인것 놓치지 말기
        input(name="username", type="text", required)
        input(name="password", type="password", required) <- type=password 인것 놓치지 말기
        input(name="location", type="text", required)
        input(type="submit", value="Join")
********************************************************************************************************

# Create Account part Two 

자 이제 form을 통해 요청한 데이터를 DB에 유저로 저장해보자. 
일단 userController.js에 User 모델을 import 한 후 
User.create()를 써서 DB에 저장할거다. 
당연히 DB에 데이터가 저장되는걸 기다려야 하니까 async/await를 써줘야한다. 

********************************************************************************************************
(userController.js)

import User from "../models/User"; <- 자 여기서 우리가 만든 모델을 import해주고

export const getJoin = (req, res) => res.render("join", {pageTitle: "Join"});
export const postJoin = async (req, res) => {
    const { name, username, email, password, location } = req.body;
    await User.create({
        name, 
        username,
        email,
        password,
        location
    })
};
 -> 요기 postJoin에서 POST 방식으로 받은 데이터들을 DB 에 저장, user를 생성한거지.
********************************************************************************************************

자 이렇게 계정을 만든 다음 뭘하면 될까?
일단 계정을 만들고 나서 유저를 로그인 페이지로 보내준다. 

우리는 이미 login 페이지로 가라는 라우터는 만들어 놓았으니 
res.redirect("/login") 만 써주면 되고 login페이지에서는 비번을 체크하는그런것들을 만들어볼 요량이다. 

그전에 우리는 우리가 만든 user 데이터를 터미널을 통해 확인해본결과
*****************************************************************************************************************************************
(터미널)

$ mongo 
$ show dbs 
$ use wetube 
$ show collections 
$ db.users.find()

{ "_id" : ObjectId("61fb77d21cab769df0dd2079"), "email" : "shl906@naver.com", "username" : "hoon0123", "password" : "123123", "name" : "hoon", "location" : "ilsan", "__v" : 0 }
*****************************************************************************************************************************************

우리의 패스워드가 완전 노출되어있는걸 확인할 수 있었다. 
이러면 보안이 전혀 안되겠지????
아주 위험하겠찌??
혹시라도 해킹당하면 온갖 비밀번호들이 죄다 노출되겠지?????

자 우리는 이 패스워드를 봐도 뭔말인지 이해핤 수 없게 만들거다. 
이런걸 'Password Hashing' 이라고 한다.

원래 password를 알지 못해도 password가 일치하는지 안하는지 알게 해주는거지
DB에 이상요상하게 저장해놔도어떻게 잘 일치하는지 확인을 해주는것이다.
개쩔쥬?

# Password Hasing 

hashing은 일방향 함수인데 hashing은 문자열이 필요하다. 
예를들어 '12121212' 라는 패스워드를 해싱하면
'aoidfhjioaheruwiklfghjkl' 뭐이딴 이상한 문자로 변환 시켜줄거다. 
그렇게 되면 우리는 DB에 원래 레알 패스워드를 저장하는게 아니라 해싱된 password를 저장해준다. 

정말 중요한건데 해싱은 일방향 함수이다. 
절대 되돌릴수 없다. 
'12121212' -> 'akluwdshf;ouhauwkler'
이렇게 변환을 해주지만 절대 출력값으로 입력값을 알아낼 수 없다. 
'입력값을 주면 출력값을 주지만 출력값으로는 입력값을 알아낼 수 없다.!!!'
그리고 같은 입력값으로는 항상 같은 출력값이 나온다. 

우리가 해싱할 떄 사용하는건 bcrypt라는 건데 이건 1999년에 만들어진거다. 
아직도 않은 사람들이 사용하고 있고 여러언어에서 사용이 가능하다. 
물론 Javascript에서도 사용이 가능하다. 

터미널에서 일단 
$ npm i bcrypt 로 설치

이제 User.js에 bcrypt import 후 사용 
********************************************************************************************************
(User.js)

import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    location: String
})

userSchema.pre("save", async function () {
    this.password = await bcrypt.hash(this.password, 5) <- 여기서 this는 create되는 User를 가리킨다, 
                                                           5는 5번 해싱한다는 의미 promise로 async/await 해주고있으니 
                                                           5다음에 콜백을 넣어줄 필요는 없다.
})

const User = mongoose.model("User", userSchema);
export default User;
********************************************************************************************************

자 이제 유저가 form에 입력한 패스워드가 그냥 바로 DB에 저장되는게 아니라 
5번 해싱되고 나서 DB에 그 해싱된 값이 저장될거다. 
그렇게 우리가 지금 미들웨어를 만든거다. 

자 이제 우리는 계정 생성할 떄 중복되는 계정을 막아보기위해 userController를 수정해볼거다.
만약 우리가 unique로 설정한 항목을 중복되게 계정을 생성한다면 
duplicate key error가 발생하게된다. 
왜냐하면 이미 존재하는 데이터를 저장하기 떄문 

하지만 이걸 우리만 콘솔로 알아선 안된다.(우리만 DB가 알려주는걸 봐선 안된다.) 
우리가 미리 알아서 체크한 뒤 유저가 알수있게 띄워줘야한다. 

자 이제 DB에서 에러가 발행지 않게, 에러가 발생하기 전에 미리 cach하게 할거다.
DB에서 에러가 발생하는건 최후의 상황에서만 보여줄거다. 

자 아래처럼 username과 email이 이미 존재하는지 일일히 확인하는 코드를 짤수도 있다. 
하지만 아래처럼 하면 중복되는 코드가 발생하게 된다. 
이것도 충분히 좋은 방법이지만 코드 중복을 최소화하는 방법을 사용해보자. 
********************************************************************************************************
(userController.js)

export const postJoin = async (req, res) => {
    const { name, username, email, password, location } = req.body;
    const usernameExists = await User.exists({username: username});
    if (usernameExists) {
        return res.render("join", {
            pageTitle: "Join",
            errorMessage: "This username is already taken."
        });
    }
    const emailExists = await User.exists({email: email});
    if (emailExists) {
        return res.render("join", {
            pageTitle: "Join",
            errorMessage: "This email is already taken."
        });
    }
    await User.create({
        name, 
        username,
        email,
        password,
        location
    })
    return res.redirect("/login");
};
********************************************************************************************************

# '$or operator' 사용 
********************************************************************************************************
(userController.js)

export const postJoin = async (req, res) => {
    const { name, username, email, password, location } = req.body;
    const exists = await User.exists($or: [{ username }, { email }]);
    if (exists) {
        return res.render("join", {
            pageTitle: "Join",
            errorMessage: "This username or email is already taken."
        });
    }
    await User.create({
        name, 
        username,
        email,
        password,
        location
    })
    return res.redirect("/login");
};
********************************************************************************************************


# Passowrd 확인창 만들기 

흔히 있는 비밀번호칸을 2개 만들어서 두개가 일치하는지 확인하는걸 만들어보자. 
쉽다. 
join.pug에서 input으로 password 확인란을 하나 만들어주고 
userController.js에서 각 password, password2가 일치하는지만 확인해주면 된다. 
********************************************************************************************************
(join.pug)

extends base

block content 
    if errorMessage 
        span=errorMessage
    form(method="POST")
        input(placeholder="Name", name="name", type="text", required)
        input(placeholder="Email", name="email", type="email", required)
        input(placeholder="Username", name="username", type="text", required)
        input(placeholder="Password", name="password", type="password", required)
        input(placeholder="Confirm Password", name="password2", type="password", required)
            -> 요기 패스워드확인란 하나 추가해주고 
        input(placeholder="Location", name="location", type="text", required)
        input(type="submit", value="Join")

(userController.js)

export const postJoin = async (req, res) => {
    const { name, username, email, password, password2,location } = req.body;
    if(password !== password2) {
        return res.status(400).render("join", {
            pageTitle: "Join",
            errorMessage: "Password confirmation does not match."
        })
    }
    const exists = await User.exists( {$or: [{ username }, { email }] });
    if (exists) {
        return res.render("join", {
            pageTitle: "Join",
            errorMessage: "This username or email is already taken."
        });
    }
        -> 혹시 또 모를 우리가 예상치 못하게 발생하는 에러에 대비해 아래처럼 catch/try문을 사용 
    try {
        await User.create({
            name, 
            username,
            email,
            password,
            location
        })
        return res.redirect("/login");
    } catch(error) {
        return res.status(400).render("join", {
            pageTitle: "Join",
            errorMessage: error._message
        })
    }
    
};
********************************************************************************************************

# Status Code 
Join에서 아이디랑 뭐 이것저것 만들고 조인버튼 눌렀는데 중복이라 에러메세지 뜨면서 거절됬지만
우리의 크롬브라우저는 성공한줄 알고 이거 아이디랑 비번 저장할거임? 
요롷케 물어본다.

이건 왜그러냐면 우리가 브라우저에서 서버로 POST 요청을 보낼 때
POST /join 200 52.598 ms - 1002
서버가 브라우저에 상태콕드가 위처럼 200으로 돌려주기 때문이다. 
200은 'Success' 라는 뜻임. 

이거 요원티다.  

물론 계정을 생성하려는 유저한테는 에러를 보여줬지 
근디 브라우저는 200을 받았기 때문에 계정생성이 잘 되었다고 판단하는거다. 

자 그럼 이제 이 상태코드를 한번 바꿔보자. 

res.render를 하게되면 기본적으로 상태코드 200 을 받는다. 
그래서 브라우저한테 render는 잘 되었는데 에러가 있습니다라고 알려줘야한다. 

400 이라고 알려줘야한다. 
왜냐면 400대가 "Client errors" 를 나타내는 구간이고 
그중에 400은 "Bad Request"를 나타내는 상태코드이기 때문. 
정확히는 클아이언트에서 발생한 에러 때문에 요청을 처리하지 못할 때 쓰면 되는코드. 

어떻게 render할 때 상태코드를 보낼수 있나? 
********************************************************************************************************
return res.status(400).render("join", ...
 ->res와 render 사이에 status 항목을 추가해주기만 하면 된다. 
********************************************************************************************************  
이렇게 해주면 render해줄 때 상태코드 400을 가지고 render한다. 
그러면 구글크롬은 뭔가 에러가 있다는걸 알수있꼬 패스워드 저장할거냐고 물어보지 않는다. 

이렇게 되면 우리가 이전에 비디오아이디 없는거 찾아 가는 getEdit 함수에서 
404 띄워주는곳에도 res.status(404).render(....)
로 상태코드를 표시해주는게 필요하겠지. 

이걸 별로 안중요하다고 생각할지 모르지만 중요하다. 
왜냐하면 예를들어, 브라우저에서 내가 방문한 웹사이트의 히스토리를 저장하는데 
어떤 웹사이트를 방문했을 떄, 상태 코드 200으로 응답하면 그 사이트를 방문했다고 히스토리에 기록을 남길거다. 
그런데 웹사이트를 방문하고 상태코드 400번대를 받는다면  
브라우저는 그 URL 을 히스토리에 남기지 않을거다. 

그래서 알맞은 상태코드를 보내주는게 유저를 위해서 좋다. 
그래야 브라우저가 적절한 행동을 취하니까. 

브라우저에게 잘못된 URL을 기록하지 말라고 하는 유일한 방법은 상태코드를 보내줘서 알려주는것 뿐이다. 

자 이제 우리는 잘못된 페이지를 들어갔을 때 브라우저에 기록을 남기지 않을거다.

# Login part One 

일단 join 페이지에서 로그인할수있는 화면으로 가기위한 앵커를 하나 만들어 준다. 
********************************************************************************************************
(join.pug) 

extends base

block content 
    if errorMessage 
        span=errorMessage
    form(method="POST")
        input(placeholder="Name", name="name", type="text", required)
        input(placeholder="Email", name="email", type="email", required)
        input(placeholder="Username", name="username", type="text", required)
        input(placeholder="Password", name="password", type="password", required)
        input(placeholder="Confirm Password", name="password2", type="password", required)
        input(placeholder="Location", name="location", type="text", required)
        input(type="submit", value="Join")
    hr
    div 
        span Already hane an account? 
        a(href="/login") Log in now &rarr;
********************************************************************************************************



그리고 우리는 이미 rootRouter에 "/login"으로 가주는 라우터가 있다. 
근데 기존에는 get만 써서 res.send해줬떤 거고 
우리는 이제 GET, POST 를 모두 써야함을 아니 아래처럼 라우터를 수정해준다. 
********************************************************************************************************
import express from "express";
import { getJoin, postJoin, getLogin, postLogin } from "../controllers/userController";
import { home, search } from "../controllers/videoController";

const rootRouter = express.Router(); 

rootRouter.get("/", home);
rootRouter.route("/join").get(getJoin).post(postJoin); 
rootRouter.get("/login", login);                      <- 원리 이랬던거를 
rootRouter.route("/login").get(getLogin).post(postLogin);  <- 이렇게 바꿔줍니다. 
rootRouter.get("/search", search)

export default rootRouter;
********************************************************************************************************

자 그럼 이제 login.pug 랑 컨트롤러를 만들어서 로그인 할 화면을 아래와 같이 만들어 준다. 
방식은 join.pug와 아주 유사하다.
뭐 사실 다를 이유가 없지
컨트롤로더 뭐 조인 컨트롤러랑 비슷해  
이건 너무 뭐 유사해서 자세히 적을것도 없어 나중에 생각안나면 Join 위에 써놓은거 자세히 다시 보셈. 

********************************************************************************************************
(login.pug) 

extends base

block content 
    if errorMessage 
        span=errorMessage
    form(method="POST")
        input(placeholder="Username", name="username", type="text", required)
        input(placeholder="Password", name="password", type="password", required)
        input(type="submit", value="Login")
    hr
    div 
        span Don't have an account? 
        a(href="/join") Create one now &rarr;

(userController.js)
export const getLogin = (req, res) => res.render("login", { pageTitle : "Login" });
********************************************************************************************************

자 이제 만들었으면 "/login" 으로 POST 요청 받았을 때 어떻게 하면 될까?
1. username을 가진 User가 존재하는지 확인 
2. password가 맞는지 확인 

자 POST Controller 만들어 봅시다. 
아주 쉽죠 
req.body 이용해서 form에서 올라오는 데이터 받고 (username, password)
User.exists({username}) 으로 가입한놈인지 아닌지 확인하고 
가입 한 사람아니면 바로 에러메세지 띄우는 일단 거기까지.

********************************************************************************************************
export const postLogin = async (req, res)  => {
    const { username, password } = req.body;
    const exists = await User.exists({username});
    if(!exists) {
        res.render("login", { 
            pageTitle: "login",
            errorMessage: "An account with this username does not exists."
        })
    }
    //check if accoutnt exists
    //check if password correct
    res.end();
}
********************************************************************************************************

자 이번엔 패스워드가 맞는지 확인할건데 해싱되어있는걸 어떻게 일치 하는지 확인할까하는 그걸 아라보자 
자 해싱은 입력값이 같으면 늘 같은 해싱값을 출력하지 
그러면 우리는 로그인할 떄 친 비밀번호를 해싱한 값과 우리의 DB에 있는 해싱된 값을 비교하면 되겠찌. 

근디 이 비교하는 메소드가 bcrypt에 이미 있지. 
1) 콜백함수를 이용하는방법
bcrypt.compare(로그인할떄입력한비번, DB에있는해시된비번).then(function(result){ <- 요기 result로 맞는지 틀린지 받는다.

});    

2) promise를 이용하는 방법 
const match = await bcrypt.compare(password, user.passwordHash);
 -> 위의 match가 이게 비번이 맞는지 틀린지 받아주는거지 
if (match) {
    //login
}

********************************************************************************************************
(userController.js)
import bcrypt from "bcrypt" <- 이거 꼭 가져와야함 까먹지 말기

export const postLogin = async (req, res)  => {
    const { username, password } = req.body;
    const pageTitle = "Login";                     <- 중복되니까 그냥 이렇게 하나로 만들고. 
    const exists = await User.exists({username}); <- 어차피 username을 받아야하니 얘는 없애고 
    const user = await User.findOne({ username }); <- 얘로 대체 얘는 user object를 다 가져오는거여 
    if(!user) {                                     <- 그럼얘도 if(!exists) 에서 이거로 바꿔주면 동일한 효과다.
        res.render("login", { 
            pageTitle,
            errorMessage: "An account with this username does not exists."
        });
    }
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) {
        res.render("login", { 
            pageTitle,
            errorMessage: "Wrong Password"
        });
    }
    res.end();
}
********************************************************************************************************

자 여기까지 유저가 로그인한건지는 알수있게 만들어놨다. 
어떻게 뭐 아이디가 이게있는건지 어쩐지 알수있게 되었고 이 비번이 아이디랑 맞는지아닌지는 알수있게된거다. 
유후 
자 이제 실제 로그인을 구현해볼거다.


# Sessions and Cookies part One 
 -> 유저를 기억하게 만들어보자.(어떤 유저가 로그인헀는지 알게해서 쿠키를 보내주자.)

-. 세션이 뭔가?
쿠키를 이해하기전에 세션이 뭔지를 알아야한다. 
세션은 백엔드와 브라우저 간에 어떤 활동을 했는지 기억하는것을 말한다. 
예를들어 유튜브에 로그인했다면 현재사용하고있는 브라우저와 유튜브 백엔드 사이에 세션이 존재하는거다. 
근데 뭐 아마 2주정도 지나면 이 세션이 사라지게될거다. 
그러면 다시 로그인해줘야한다. 
세션은 브라우저와 백엔드 사이의 memory, history같은거다. 
그런데 이게 작동하려면 백엔드와 브라우저가 서로에 대한 정보를 가지고 있어야한다. 
왜냐하면 지금까지 우리가만든 이 로그인 페이지에서 HTTP 요청을 하면 요청이 처리되고 끝나게 되는데  
그 이후로는 백엔드와 브라우저가 아무것도 할 수 없다. 

예를들어, Home 링크를 클릭하여 Home화면으로 이동하면 GET요청을 보내게 되는데 
백엔드가 HTML을 render하면 연결이 끝나게 되는거다. 
브라우저와 백엔드의 연결이 계속 유지되지 않는거다. 

GET요청을 받고 render 처리를 끝내면 서버에서는 누가 요청을 보냈는지 잊어버리게 되고  
브라우저도 마찬가지고 잊어버리게 된다. 서버가 더 이상 필요 없으니까. 

이런걸 stateless(무상태) 라고 한다. 
한번 연결이 되었다가 끝나는거다. 즉, 브라우저와 서버 둘 사이 연결에 state가 없는거다. 

그래서 우리는 유저한테 어떤 정보를 남겨줘야 한다. 
유저가 백엔드에 뭔가를 요청할 때마다 누가 요청하는지 알 수 있게 말이다. 

그래서 유저가 로그인 할 때마다 유저한테 뭔가 조그만한 텍스트같은걸 줄거다. 
"자 이게 너의 텍스트니까 잘 가지고 있으셈." 이렇게

그러면 유저가 우리한테 요청을 보낼 때마다.
그 텍스트를 같이 보내달라고 하는거다. 그러면 이제 서버가 
"아! 이거 너였구만!" 하고 바로 알 수 있고 그 유저의 정보를 보여줄 수 있는거다. 

자 이제 세션을 직접 써보고 이 텍스트가 뭔지에 대해 알아보자. 

중요한건 유저가 로그인 할 떄 서버가 유저한테 어떤 텍스트를 준다는거다. 
아직은 이게 뭔지 정확하게 모르지만 일단 유저가 누구인지 알 수 있게 해주는 무언가인거다. 

*세션과 쿠키 개념이 헷갈리시는 분들이 있으신데, 세션은 서버에서 가지고 있는 정보이며 쿠키는 사용자에게 발급된 세션을 열기 위한 열쇠(SESSION ID)를 의미합니다. 쿠키만으로 인증을 사용한다는 말은 서버의 자원은 사용하지 않는다는 것이며, 이는 즉 클라이언트가 인증 정보를 책임지게 됩니다. 그렇게 되면 위의 첫번째 방식처럼 HTTP 요청을 탈취당할 경우 다 털리게 됩니다. 따라서 보안과는 상관없는 단순히 장바구니나 자동로그인 설정 같은 경우에는 유용하게 쓰입니다.
결과적으로 인증의 책임을 서버가 지게하기 위해 세션을 사용하는 겁니다(사용자가 해킹당하는 것보단 서버가 해킹당하는게 훨씬 어려우니까요!) 사용자(클라이언트)는 쿠키를 이용하고, 서버에서는 쿠키를 받아 세션의 정보를 접근하는 방식으로 인증을 합니다. 


-. 세션의 사용(express session) 
세션을 사용할수있께 하는 미들웨어를 설치 해야한다. 
"express session" 이 미들웨어를 설치해서 어떻게 작동하는건지 알아볼거다. 
이 미들웨어는 express에서 세션을 처리할 수있게 해준다. 

1. 미들웨어 설치
$ npm i express-session 

2. server에서 미들웨어를 import 후 "router 앞에서" 초기화!
********************************************************************************************************
import express from "express";
import morgan from "morgan";
import session from "express-session" <- 자 요기서 import 한번 해주시고 
import rootRouter from "./routers/rootRouter";
.
.

app.use(logger);
app.use(express.urlencoded({ extended: true}));

app.use(session({    <- 요기서 꼭 Router 전에 초기화를 해줘야 혀.  
    secret: "Hello!",   <- 일단 "Hello" 로 한거고 나중에는 뭐 디게 알아보기 어려운 문자로 할거다. 
    resave: true,
    saveUninitialized: true
    })
);
app.use("/", rootRouter);
.
.
********************************************************************************************************

자 이제 우리는 저렇게 라우터전에 session미들웨어를 초기화해줬으니 이 미들웨어가 사이트로 들어오는 모두를 기억하게 될거다. 
로그인 하지 않았어도 기억하게 될거다. 
들어온 사람들한테 어떤 텍스트를 주고 그 텍스트를 가지고 유저가 누구인지 알아낼거다. 

자 이제 텍스트가 뭔지 한번 보자.
크롬에서 우클릭->검사->Application->Cookies->localhost:4000->새로고침 
요로코롬 한번 해주면 브라우저가 우리 서버에 요청을 보내고 서버에서는 session미들웨어가 브라우저한테 텍스트를 보낼거다. 
서버가 브라우저를 개별적으로 기억할 수 있게 말이다. 

자 그러면 Application에 뭔가 이상한 텍스트가 생겼다. 
아직 이게 뭔지 모른다. 그런데 내가 새로고침 할 때 마다, 백엔드(localhost, Domain이 localhost 니까)에 요청을 보낼 때 마다. 
요 이상한 텍스트가 백엔드로 같이 보내질거다. 
브라우저가 알아서 백엔드로 쿠키를 보내도록 되어있거든. 

예를 들어 server.js에서 
app.use(
    (req,res,next) => {
        어쩌고저쩌고
    }
)

라는 임시 미들웨어를 만들었다고 하면 
저 req는 객체고 그안에 header라는 프로퍼티에는 즉, req.header에는 cookie 값이 들어있어서 
우리가 서버에 뭔가 요청을 보낼 때는 무조건 cookie가 들어있는거다. 
"자 이거 나야!" 라고 알려주는거지 브라우저가 서버한테. 



# Sessions and Cookies part Two 

아래의 코드로 현재 서버에있는 세션들의 목록을 볼수 있다. 
********************************************************************************************************
(server.js)

app.use((req,res,next) => {
    req.sessionStore.all((err, sessions) => {
        console.log(sessions);
        next();
    });
});
********************************************************************************************************

일단 서버를 저장하고 재시작하면 어떻게 되는지 봐보자. 
어떻게 되냐면 세션이 사라지게되는데 왜냐하면 express가 세션을 메모리에 저장하고 있기 때문이다. 
그래서 서버를 재시작 할 때마다 세션이 사라지는거다. 

우리가 전에 fake DB를 만들었을 때 처럼 세션도 그렇게 되고 있는거다. 
나중에는 백엔드가 세션을 잊지않도록 세션을 mongoDB와 연결해볼거다. 

자 이제 백엔드가 쿠키를 가지고 어떻게 브라우저를 구분하는지 보자. 
(다른 브라우저로 현재우리가만든 페이지에 접속하면 각기 다른 쿠키를 가지게 된다.) 

브라우저의 개발자 도구의 Application에서 백엔드가 브라우저한테 요상한 텍스트를 보내는걸 확인했다. 
그런데 이 텍스트가 백엔드에서 세션 id로 사용되고있었다. 
백엔드의 메모리에 세션을 저장할 수 있는 DB가 생긴거다. 
백엔드의 각 세션들은 id를 가지고있었고 이 id를 브라우저에 보냈다. 

그러면 브라우저가 요청을 보낼 때 마다 그 id를 같이 보내줘서 크롭브라우저와 일치하는 세션이 뭔지 알수 있고
어떤 세션이 다른 뭐 사파이 브라우저와 일치하는지도 알 수 있다. 
(서로 다른 브라우저는 서로 다른 쿠키를 가지고 있으니까 서로다른 세션 id를 가지고 있는거다.)

정리해보면, 세션과 세션 id는 브라우저를 기억하는 방식 중 하나다. 
Application의 cookies에서 localhost:4000 에서 볼수있는 아래의 Cookie Value 
s%3Ac5D5p73RBxA0BlIEE3QPr-Xo0c1Ftx6G.LjEe1fsCGcRyN0RS7XvCTjnL%2BBLkr014tPqCEaJmRxA

그리고 브라우저와 백엔드 사이에는 WIFI처럼 유지되는 연결이 없으니까  
백엔드에 요청을 보낼 떄마다 이 id를 같이 보내주어야 한다. 
그러면 백엔드가 기억할 수 있는거다. 

그리고 이 세션 id를 가지고 있으면 세션 object에 정보를 추가할 수 있다. 
저 req.header에 우리의 세션 id가 들어있는데 
그것말고도 우리는 이세션을 위한 정보를 추가적으로 넣을수 있다는 말이다. 
뭐 예를들어, 숫자나 유저의 id같은 정보를 넣을 수 있겠지. 
이런 내가 원하는 모든 정보를 넣을 수 있는데 이 세션에서만 공유되는거다. 

예를 들면 server.js에 라우팅전에 아래와 같은 미들웨어를 만들었다고 해보자. 
 
********************************************************************************************************
(server.js) / '간단한 예시'

app.get("/add-one"  , (req, res, next) => {
    return res.send(`${req.session.id}`);
})

********************************************************************************************************

위와같이 미들웨어를 만들고 난 후 각기 다른 브라우저로 "localhost:4000/add-one" URL로 접속하게 되면 
브라우저마다 각기 다른 세션 id를 가진 텍스트를 보내고있는걸 볼수있다. 

그리고 이 세션 id가 cookie에도 있다는건 그냥 우연이 안니다. 

자 이렇게 보다시피 정말 간단하다. 
서버가 브라우저한테 세션 id를 주고있는걸 위의 '간단한 예시'를 통해 알수 있다.
그리고 브라우저가 요청을 보낼 때 마다 쿠키에서 세션 id를 가져와 보내주는거다.(브라우저가 서버한테)
그러면 서버가 그 세션 id를 읽고 우리가 누군지 알거다. 뭐 지금으로치면 어떤 브라우저인지를 알수있는거다.(크롬이냐 뭐 사파리냐)

자 그럼 이제 한가지 더 해보고 싶은게 있는데, "간단한 예시"에 더불어서 카운터(Counter) 를 만들어 볼거다. 

세션이라는건 Javascript object다. 
말그대로 그냥 JavaScript object 일 뿐이다. 
그리고 우리는 크롬, 사파리에서(각기 다른 브라우저에서) req.session.id가 다르다는걸 봤다. 

그러면 어떤 정보를 JavaScript object에 넣어보자.  
********************************************************************************************************
(server.js) / '간단한 예시'

app.get("/add-one"  , (req, res, next) => {
    req.session.potato += 1;
    return res.send(`${req.session.id}\n${req.session.potato}`);
})

********************************************************************************************************

위의 예시에서 세션 object안에 potato를 만들어 보았다. 
세션 object는 콘솔창에 아래처럼 나오는 이놈들이다. 
[Object: null prototype] {
    tDojrDyLVabOwjCoDkINOCW8MBQq3dnZ: {
      cookie: { originalMaxAge: null, expires: null, httpOnly: true, path: '/' }
    },
    BsPQj2jXZvXheHUDhvMFbxqx6sx_4OWc: {
      cookie: { originalMaxAge: null, expires: null, httpOnly: true, path: '/' }
    }

이제 세션안에 있는 potato에 1을 더하면 어떻게 나오는지 보자. 

자 일단 서버를 다시 저장하고 "/add-one" URl로 접속하면 session id가 바뀌어있느걸 볼수있다. 
왜냐하면 코드를 저장할 때 마다 서버에서 세션을 없애고 새로 만들기 때문이다. 
이 문제는 나중에 우리가 실제 DB와 연결할거니까 지금은 노상관.
일단 지금은 세션이 사라짐. 

[Object: null prototype] {
    'FCqOmEB-8IdbO5wFUuaJqO8MmtLAEuYA': {
      cookie: { originalMaxAge: null, expires: null, httpOnly: true, path: '/' },
      potato: 4
    },
    QIVkSZbstYBtK8f2Vwa_j2atdQ6Yvl16: {
      cookie: { originalMaxAge: null, expires: null, httpOnly: true, path: '/' },
      potato: 5
    }
  }
  

그리고 콘솔창에는 위처럼 페이지 리로드 횟수에 맞춰서 포테이토 카운트의 숫자가 올라간다. 
보다시피 백엔드가 브라우저한테 id를 주고있다.  
그리고 브라우저가 "/add-one" 뿐만 아니라 서버의 모든 URL을 방문할 때 마다 
브라우저가 받았던 id를 요청에 담아 보낼거다. 

중요한건 서버가 브라우저한테 준 id를 브라우저가 요청에 담아 보내주고있다는거다. 
그러면 서버는 백엔드의 세션 DB에서 브라우저가 보낸 id를 가진 세션을 찾는다. 
그리고 그 세션에 정보를 담을 수 있는거다. 

그러면 이제 유저정보를 기억할 수 있고 유저의 세션에 정보를 추가할 수도 있는거다. 

아직은 유저가 누구인지 모르고 있다. 
알고있는건 그냥 저기 세션id마다(브라우저마다)의 potato 카운트의 숫자들일뿐이다. 

내가 브라우저에서 웹사이트를 방문할 때 마다 이 세션 미들웨어가 있으면 
express는 알아서 그 브라우저를 위한 세션 id를 만들고 
브라우저한테 보내줄거다. 알아서 처리되는거지. 

그러면 브라우저가 쿠키에 그 세션 id를 저장하고 
express에서도 그 세션을 세션 DB에 저장할거다. 
세션 DB에 있는 id와 쿠키에 있는 id가 같도록 말이다. 

그러면 브라우저한테 보내서 쿠키에 저장한 세션 id를 
브라우저가 domain이 'localhost:4000'의 모든 URL에 요청을 보낼 때 마다 
세션 id를 요청과 함께 보낼거다. 

그러면 백엔드에서 어떤 유저가, 어떤 브라우저에서 요청을 보냈는지 알 수 있는거다. 

즉, 우리는 브라우저한테 우리 백엔드 URL을 방문할 때 마다 보여줘야하는 id카드를 준거다. 

쿠키는 이런 일처리를 해주기 때문에 좋은거다. 
유저들은 아무것도 할 필요가 없자나.
유저한테 쿠키를 주면 유저가 웹사이트를 방문할 때 마다 알아서 그 쿠키를 보내주니까 

지금까지 봤다시피 유저를 구분하는건 정말 좋은거다. 
예를 들어, 사파리 브라우저에서는 potato가 30이라는걸 기억하고 크롬브라우저에서는 potato가 20이라는걸 알수있으니까. 
이 모든건 세션, 세션id 덕분에 가능한거다.

부연 설명
세션은 서버측에서 제공해주는 데이터, 쿠키는 클라이언트측에서 저장하고 사용하는 데이터
req.sessiontStore() 사용했을때 한번은 undefined가 나온 이유가 세션은 서버에서 만들어줘야 하는데 클라이언트가 첫 요청때 세션을 가지고있을리 없으니 undefined이 나온거고 그 이후 요청부턴 첫번째 요청때 세션을 만들어서 넘겨줬으니 클라이언트가 해당 값을 쿠키에 저장하고 매 요청때마다 서버에게 전달
세션은 서버가 만들어서 제공해주다보니 서버가 재부팅되면 초기화 된다. (그래서 DB에 저장해서 관리를 한다는 소리. 실 운영에선 서버가 꺼지는 일은 없으니깐.)
세션의 값은 서버가 만들어주는 고유값이다보니 해당 값을 기준으로 클라이언트에서 요청한 건에 대해 유저를 특정지을 수 있다서버가 세션을 생성한 기점은 middleware로 express-session을 추가했을때부터 생성됨

# Logged In User 
 -> 유저를 기억하는걸 만들어 보자.(= 누가 로그인 했는지 알수있게 해보자)
    정확하게 하면 뭐 기억하는건 아니고 그떄그때 id를 확인해서 누군지 알수있게 하는거지 

일단 userController.js에 가서 유저가 로그인 하면 그 유저에 대한 정보를 세션에 담을거다. 
각 유저마다 서로 다른 req.session object를 가지고 있다는걸 기억하고 잊지마라. 
왜냐면 모두 서로 다른 id를 가지고 있으니까 
{}

********************************************************************************************************
export const postLogin = async (req, res)  => {
    const { username, password } = req.body;
    const pageTitle = "Login";                      
    const user = await User.findOne({ username });
    if(!user) {                                    
        res.render("login", { 
            pageTitle,
            errorMessage: "An account with this username does not exists."
        });
    }
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) {
        res.render("login", { 
            pageTitle,
            errorMessage: "Wrong Password"
        });
    }
    req.session.loggedIn = true;        <- 
    req.session.user = user;            <- 이렇게 2줄을 추가해주면 세션에 정보를 추가하는거다. user는 DB에서 찾은거 그대로 사용임.
    res.end();
}
********************************************************************************************************

위 처럼 userController를 수정한 후 로그인 한 뒤
세션 DB를 확인해보면 쿠키 id인 세션 id가 있는걸 볼 수 있다. 
특히 2개의 브라우저로 접속해서 페이지를 옮기고 리로드해보고 지지고볶고 다 해봐도 
우리는 로그인한 유저 한명과 로그인안한 유저 한명이 있따는걸 알수있다. 
이제 누가 로그인 헀는지 안했는지 알수가 있는거다. 
멋지쥬? 

[Object: null prototype] {
    FCZNw1h2gwt7BJCcBwt3375rBXViuKuv: {
      cookie: { originalMaxAge: null, expires: null, httpOnly: true, path: '/' },
      loggedIn: true,
      user: {
        _id: '61fbe920252ddffba01a3304',
        email: 'shl906@naver.com',
        username: 'hoon0123',
        password: '$2b$05$RQds62Th2nvRR4GGRE1dauBSSrGPpMvcu7W4N1hDUAz.z/qydmYHq',
        name: 'hoon',
        location: 'ilsan',
        __v: 0
      }
    },

    '7yDTEp-23Sz-HtOQokm7CTk0eUmkCubr': {
      cookie: { originalMaxAge: null, expires: null, httpOnly: true, path: '/' }
    }
  }

이제 그럼 이에 맞게 templete을 수정해 볼거다. 
만약 session.loggedIn 이 true 라면 'Join' 과 'Login' 을 가리고나서 
Logout을 보이게 만들어 줄거다. 

우리는 누가 user인지 알 수 있다. 
우리의 세션 DB를 통해서 말이다. 
그러니까 누가 유저인지는 알 수 있는데 그 정보를 pug 템플릿과 공유하지 못하는거다. 
이제 우리의 세션 DB를 템플릿과 공유할 수 있게 할거다. 

우리는 req.session object에 정보를 저장하고 있다. 
유저가 로그인 했는지 안했는지에 상관없이 말이다 일단 페이지 들어오면 가지고 있는거다. 
어떤 정보든지 req.session object에 추가할 수 있는데, 우리는 loggedIn과 user라는 정보를 추가했다. 

그리고 이제 pug 템플릿에서 유저가 로그인을 한건지 안한거지 알 수 있께 만들어볼거다. 
pug는 아직 req.session이 뭔지 모르니깐. 
  
#Logged In User part Two 

response object 안에는 locals 라는 object가있다. 
이 locals는 기본적으로 비어있는데 
이 locals object는 기본적으로 pug랑 Express가 서로 locals를 공유 할 수 있도록 되어있다. 
그렇기에 pug에서 접근할수가 있다.

이게 무슨 뜻이냐면 내가 locals object를 바꾼다고 한다면, 
templete에서 locals object의 내용을 확인 할 수 있다는거다. 

오 이건 뭐 그냥 뭐 이전에 햇던거처럼 뭐 컨트롤러에 {pageTitle:"blabla"}
이렇게 넣었던 것처럼 뭐 지정해줄것도 없이 
저기 뭐 server.js에서 

app.ues((req.res.next) => {
    res.loclas.sexy = 
})
요렇게 한번 넣어주면 

그냥 pug에서 #{sexy} 만 해줘도 알아서 들어간다. 
#{locals.sexy} 이것도 아니다 그냥 #{sexy} 이것만 넣어주면 된다. 
아주 신기하다. 

이 locals는 전역변수여서 모든 templete에서 다 쓸수있는거다. 
locals는 templete의 모든곳에 있는거다. 
"물론 middleware를 라우터 전에 적용을 했을 때에 한해서이다."
여기서 미들웨어는 아마 server.js에서 session을 적용한것을 말하는듯하다. 

다시 말하지만 이건 굉장히 좋은거다. 
왜냐하면 변수를 전역적으로 보낼수가 있기 때문이다. 
더이상 res.render에 얽메이지 않아도 된다. 
그냥 locals object로 templete에 변수를 전역적으로 보낼 수 있다. 

locals object는 이미 모든 pug templete에 import 되어있는 object 인거다. 

자 이제 그럼 이 locals object를 이용하여 유용한 미들웨어들을 만들어볼거다. 
일단 middleware.js 만들자. 

그리고 그안에 미들웨어를 만들어주고 그 미들웨어를 server.js로 import한 뒤 
라우터 전에 적용시켜준다. 

********************************************************************************************************
(middleware.js)
export const localsMiddleware = (req, res, next) => {
    res.locals.siteName = "Wetube"; <- 일단 첫 예시
    next();                         <- next()해주는거 잊지마셈 아니면 여기서 멈춤
}

(server.js)
import { localsMiddleware } from "./middleware"; <- import 해주고
.
.

app.use(localsMiddleware); <- 라우터전에 사용

app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
.
.
********************************************************************************************************

자 이제 locals를 통해 누가 로그인했는지 공유해 볼거다. 

아래와같이 미들웨어에서 req.session을 호출하도록 작성 후 코드를 실행하면 
우리의 미들웨어는 req.session에 접근할 수 있다. 
********************************************************************************************************
(middleware.js)
export const localsMiddleware = (req, res, next) => {
    console.log(req.session);
    res.locals.siteName = "Wetube";
    next();
}
********************************************************************************************************

다시한번 강조하는 부분이지만 이런게 가능한 이유는 
localsMiddleware가 session middleware 다음에 오기 때문에 가능한거다. 
그래야 localsMiddleware가 session object에 접근할 수 있기 때문이다.

결국 이 Locals object를 전역으로 쓸수있는건 session 미들웨어의 기능인거다. 

그리고 나는 우리의 백엔드가 기억하고있는 모든 사람들을 보고싶진 않으니까 
아래의 부분은 server.js에서 제거해준다. 
********************************************************************************************************
(server.js)

app.use((req,res,next) => {
    req.sessionStore.all((err, sessions) => {
        console.log(sessions);
        next();
    });
});
********************************************************************************************************

나는 오직 하나만 보고싶다.
여기서 하나는 현재 요청이 들어오는 페이지에대한 정보이다. 

아래의 코드는 session의 loggedIn이 true일 때 즉, 로그인되었을 때
그 사실을 locals에 저장해준다. 
********************************************************************************************************
(Middelware.js)
export const localsMiddleware = (req, res, next) => {
    // if(req.session.loggedIn) {
    //     res.locals.loggedIn = true;
    // }
    res.locals.loggedIn = Boolean(req.session.loggedIn); <- 위에 if문을 사용했을 때랑 같은 거다. 
    res.locals.siteName = "Wetube";
    console.log(res.locals);
    next();
}
********************************************************************************************************

코드를 저장하고 보다 나은 세션 저장소를 설정하지 못했기 때문에 
현재는 모든 세션이 저장할 때 마다 초기화된다. 사리지는거다. 
이거는 전에 말했듯 DB에 저장하기 시작하면 해결될 문제다. 

암튼 그렇게 사라지니까 저렇게 저장하고 페이지 리로드하면 
아래와같이 locals 가 비어있는거로 나오는거다. 그래도 뭐 일단 locals object는 잘 나오고있다. 
[Object: null prototype] { loggedIn: false, siteName: 'Wetube' }

아무튼 우리는 이 locals object가 templete과 공유되는걸 알고있다. 
그래서 이게 무슨뜻이냐면 
middleware.js에서 우리가 locals.loggedIn에 req.session.loggedIn을 넣어줬으니 
아래의 base.pug에서 loggedIn이 true인지 false인지 알수 있다는 소리고 
우리는 그를 통해서 아래처럼 loggedIn의 값에 따라 보여지는 값들을 달리 할 수 있다는 말이다. 

********************************************************************************************************
(baas.pug)
doctype html 
html(lang="ko")
    head 
        title #{pageTitle} | #{siteName} 
        link(rel="stylesheet" href="https://unpkg.com/mvp.css")
    body 
        header
            h1=pageTitle 
            nav 
                ul  
                    li 
                        a(href="/") Home
                    if loggedIn <- 여기는 if문이니까 #{loggedIn} 이렇게 안해줘도 된다. 
                        li    
                            a(href="/logout") Log out
                    else
                        li    
                            a(href="/join") Join
                        li    
                            a(href="/login") Login
                    li  
                        a(href="/search") Search
                    li 
                        a(href="/videos/upload") Upload Video
        main 
            block content 
    include partials/footer.pug
********************************************************************************************************

다시한번 기억해야 할 것은 pug파일에서 locals에 접근 할 수 있다는거다. 
내가 만약 locals에 어떤 값을 준다면 pug가 읽을수 있는거다. 
이게 바로 locals 

이를 통해서 나는 인증시스템을 만들었다. 
Login, Join, 비번암호화 이제 express로 세션도 다루고 쿠키도 다루고 
유저간에 구별도 가능해졌다. 

왜냐면 지금 봐도 크롬 로그인 후(서버 저장 다시 안한거임. 다시저장하면 로그인한 정보 날아가니까)
사파리로 들어가면 로그인 안된거로 나오니까.

자 근데 우린 더 많은것을 locals에 넣어줄수있다. 
req.session에는 user 도 있다.
로그인할 때 User.findOne()을통해 DB로부터 가져온 로그인한 회원의 데이터다. 

우리는 이값을 templete과 공유할 수 있다. 
아래처럼 locals에 user정보를 넣어주고 
********************************************************************************************************
(middleware.js)

export const localsMiddleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName = "Wetube";
    res.locals.loggedInUser = req.session.user;
    console.log(res.locals);
    next();
}
********************************************************************************************************

아래의 base.pug 동작원리는 다음과 같다. 
localsMiddleware덕분에 우리는 loggedInuser를 공유하고 있으니까 
user가 로그인 되어있지 않을 때, loggedInUser를 사용하면 안된다. 
그러니까 "if loggedIn" 부분을 통해 login되어있는지 일단 확인하고 
login 되어있으면 logout 버튼 누를수 있게 해주고 
또한 login 되어있다면 우리는 loggedInUser 객체의 loggedInUser.name을 사용할 수 있으니 고걸 가져와서 쓴거다.
********************************************************************************************************
doctype html 
html(lang="ko")
    head 
        title #{pageTitle} | #{siteName} 
        link(rel="stylesheet" href="https://unpkg.com/mvp.css")
    body 
        header
            h1=pageTitle 
            nav 
                ul  
                    li 
                        a(href="/") Home
                    if loggedIn
                        li    
                            a(href="/logout") Log out
                        li 
                            a(href="/my-profile") #{loggedInUser.name}의 Profile
                    else
                        li    
                            a(href="/join") Join
                        li    
                            a(href="/login") Login
                    li  
                        a(href="/search") Search
                    li 
                        a(href="/videos/upload") Upload Video
        main 
            block content 
    include partials/footer.pug
********************************************************************************************************

오예 이제 이 로그인한 회원의 정보를(mongoDB로 부터 가져온) templete의 모든 곳에서 공유하고 있다. 
모든 페이지에 들어가도 상단 메뉴바에 'logout' 과 'hoon의 Profile' 를 표기하고 있기 때문이다. 

나는 로그인 시스템을 만든거다 와우! 
session과 cookie, 패스워드 암호화, 패스워드 비교를 이용해서 말이다. 
그리고 locals를 사용해서 변수를 pug 전역에서 사용하는 법을 배웠다. 
 
# User Login Recap 
일단 우리는 session이라는 미들웨어를 생성했다. 
이 미들웨어는 express-session이라는 module로부터 주어진거다. 
이 미들웨어는 브라우저가 우리의 백엔드와 상호작용할 때마다 session이라는 미들웨어가 브라우저에 쿠키를 전송한다.

자 그럼 쿠키는 뭐냐면 백엔드가 나의 브라우저에 주는 정보인데 쿠키에는 정해진 규칙이 있기 때문에, 
내가 매번 백엔드에 request할 때 브라우저는 알아서 그 request에 쿠키를 덧붙인다. 
내가 뭐 안해줘도 알아서 쿠키를 붙인다. 

그러니 우리의 session 미들웨어가 브라우저에 쿠키를 보내고 브라우저는 쿠키로 뭘 할지, 
어디에 넣을지 모든 걸 알고있다. 

게다가 브라우저는 우리가 매번 백엔드 Localhost에 있는 URl로 request를 보낼 때마다 
쿠키가 reques랑 같이 전송된다는 것도 알고있다. 

그럼 쿠키에 무슨 정보를 넣을 수 있을까?
어떤거든 다 넣을수있다. 

근데 우리가 넣은거는 SessionID다. 
왜냐면 브라우저와 백엔드와의 연결이 평생 보장된 것은 없기 때문이다. 

왜냐면 우리는 http를 사용하기 때문이지 http는 stateless다. 

뭔말이냐면, 우리가 homepage를 들어가면 connection이 열리고 
render가 끝나면 connection이 끊어진다. 

connection이 계속 유지되지 않는거다. 
connection은 render가 끝나거나, redirect가 발생하거나, 
우리가 post request를 보내거나, 응답없음을 받으면 connection은 바로 끝난다. 

그래서 우리는 사용자에게 sessionID를 주는거다. 
그리고 그 sessionID를 넣을곳은 바로 cooklie 인거다. 

구분된 두개가 있는데, 
하나는 바로 쿠키이고 이걸 사용해서 백엔드와 프론트엔드간의 정보 교환을 하는거고, 
다른 하나는 sessionID이다. 
sessionID의 한 예는 브라우저에서 볼 수 있는데 그 개발자 도구 키고 Applicaion들어가서 보면 나오는
쿠키열고 거기서 주소 클릭하면 나오는 value 이게 sessionID이다. 

어찌보면 쿠키안에 포함되어있는값이다. 

즉, 브라우저는 sessionID가 포함된 쿠키를 가지고 있고, 
백엔드는 현재 사용중인 sessionID를 기억하고 있다. 

다시 말하자면, 쿠키랑 세션은 별개의 개념이다. 

쿠키는 단지 정보를 주고받는 방법인거고 그게 젠부여  
쿠키는 자동적으로 처리되니까 참 좋아 
쿠키를 받고, 보내는 과정에서 사용자는 암것도 안해도 되고 
별개의 코드를 작성할 필요도 없다. 왜냐면 우린 Http 표준을 따르고 있으니까 
자 이게 쿠키다. 

sessionID는 쿠키에 저장된다. 
왜냐면 쿠키는 sessionID를 정송하는데 사용되기 때문이다. 서로 다른거다 쿠키랑 sessionID는 
어쨌든 sessionID가 쿠키안에 저장되고, 우리의 백엔드에도 저장된다는게 요점이다. 
백엔드는 사용되고 있는 모든 sessionID를 유지하는데, 여기에 몇가지 문제가 있다. 
그건 다음에 다루기로 하자. 

아무든 백엔드는 생성된 모든 sessionID를 관리하는 곳이다.
만약 4명의 사용자가 있다면 session store에 4개의 session이 있는거다. 

session store는 우리가 session을 저장하는 곳이다. 
내가 매번 코드를 저장하면 서버가 재시작되는데, session store는 사라져서 비워진다. 
왜냐면 이건 테스트를 위한 저장소이기 때문이다. 
그리고 서버가 재시작되면 기존에 브라우저에있는 쿠키는 유요하지 않는다. 
그래서 서버를 재시작 후 브라우저를 새로고침하면 새로운 쿠키가 들어오는걸 볼수있다. 
왜냐면 완전히 다른 쿠키 store이기 때문이다. 
나중에 이 쿠키 store랑 mongoDB를 연결할거다. 

서버 재시작없이 브라우저만 새로고침할 땐 쿠키가 바뀌지 않는다. 
왜냐면 백엔드가 session store안에 sessionID를 저장하고 있기 때문이다. 

다시 말하지만 쿠키랑 세션은 다르다. 
우리는 쿠키를 사용해서 어떤 브라우저를 위한 sessionID인지 알수 있다. 
그러니 req.session은 브라우저마다 값이 다르다. 
req.session만 하면 잘 안보일수있는데 
req.sessionId로 console.log해보면 우리의 그 브라우저의 개발자도구에서 볼수있는
그 sessionID값이 브라우저마다 다른걸 알수있다. 

그리고 브라우저마다 req.session이 다르기 때문에 
몇몇 정보를 req.session object에 덧붙이는거다. 
session은 object니까 우리가 원하는걸 추가해서 덧붙일수있겠지 

그래서 우리는 사용자가 로그인하면 값이 true 가 되는 loggedIn 과 
우리가 DB 에서 찾은 사용자의 데이터를 user 에 넣어주었다. 

그래서 우리는 req.session.user를 controller 어디서나 사용할 수 있는거다. 
왜냐면 req.session 안에 있으니까능.

그다음에 우리는 localsMiddleware를 만들었는데 
locals는 뭐든 할 수있는 object 다. 
그리고 나의 templete들은 local object에 접근이 가능하다. 
왜냐면 그건 pug랑 express에서 이미 설정이 되어있는거다. 

그러니 나의 localsMiddleware 안에 res.locals.blabla에 뭐든 넣어서 
templete에서 사용할수가 있는거다. 


# Mongostore

우리는 session id는 쿠키에 저장하지만, 데이터 자체는 서버에 저장된다. 
그리고 서버에 저장되는 default session strotage는 
Memorystore이고, 실제 사용하기 위해 있는건 아니다. 
그래서 우리는 session store를 사용해야된다.....? 이시발 밑도끝도없이? 

세션을 database에 저장해야하는거다.,.

그래서 그 database의 종류는 많이 있는데 그중에 하나가 MongoDB이고 
그 DB에 저장할수있는 방법이 중 하나가 connect-mongo인 것이다. 

우리는 connect-mongo를 사용해서 세션을 MongoDB에 저장할거다. 
그래서 만약에 우리 서버가 재시작 하더라도 세션은 DB에 저장되어있기 때문에 
누군가 로그인 되어있어도 잊어버리지 않을거다. 

-. connect-mongo 사용법  

1. connect-mongo 설치 
    $ npm i connect-mongo 
2. MongoStore import 
******************************************************************************************************* 
    (server.js)
    import MongoStore from "connect-mongo";
********************************************************************************************************
3. MongoStore.create() 
 -> 우리의 MongoDB의 URL을 가지고 있는 configureation object를 만들어야한다. 
    session middleware는 option이 하나 있는데 바로 store다. 
    다시말해, default로 설정된 것과는 다른 store를 설정할 수 있다는거다. 

********************************************************************************************************
(server.js)
    app.use(
        session({
        secret: "Hello!",
        resave: true,
        saveUninitialized: true
        store: MongoStore.create({ mongoUrl: "mongodb://127.0.0.1:27017/wetube"})
         -> 우리가 사용할 MongoDB로의 URL을 넣어줌으로서 저장경로 지정..
        })
    );
********************************************************************************************************

이렇게 다 완료하면 우리의 세션들은 우리의 MongoDB database에 저장되어있다. 
실제로 터미널로 mongo실행 시키고 $ show collections 으로 보면 
wetube에 이어서 sessions라는 항목이 생긴거 볼수있따. 
즉, MongoDB의 sessions라는 항목에 나의 session들이 저장되는거다. 

근디 처음에 
$ dbs.sessions.find() 하면 아무것도 안나온다. 
왜냐면 당연히 아직 sessions가 존재하지 않으니까 

그럼 이제 세션을 만들어 볼거다. 
세션은 어떻게 만들까?
 -> 세션은 브라우저가 우리의 백엔드를 방문할 때 만들어진다. 

 서버를 재저장 후 세션이 비어있는상태에서 페이지를 리로드하면 mongoDB에 세션이 하나 생긴걸 볼 수 있다. 
 자 그리고 그상태에서 로그인을 한 후 session database를 보게되면 
 아까의 그 로그인전세션은 같은 id를 가지고 있고 loggedIn: true 와 user object가 생기게 되었다. 

 오잉 자그럼 백엔드를 껏다가 다시 켜본 후 페이지를 리로드해보면 어떨까

 와우 그래도 로그인이 계속 유지된다. 

 왜냐! 더이상 로그인 정보가 서버에 있는게 아니니깐 
 로그인 정보는 이제 MongoDB에 있는거다!! 와우 

 짱이네 이제 우리가 해야할 건 이 storage를 쓰는거다. 

 아까 저기 위에 app.use( session({ store: blabla }) <- 이부분을 지우면 세션은 다시 서버의 메모리에 저장된다. 
 그러면 서버를 재시작 할 때마다 메모리가 지워지기 때문에 세션을 database에 저장하도록 만든거다. 

 # Uninitialized Sessions 

******************************************************************************************************* 
app.use(
    session({
    secret: "Hello!",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: "mongodb://127.0.0.1:27017/wetube"})
    })
);
******************************************************************************************************* 

여기 위의 session 미들웨어에서 resave, saveUninitialized 의 차이점은 뭘까 아니 애쵸에 저건 대체 뭘까? 
이걸 알아가면서 session authentication(인증)을 사용하면서 생길수도있는 문제에 대해 배울수도 있다. 

쿠키를 지우고 페이지를 리로드하면 새로운 쿠키가 생긴다. 
이말은, 방문하는 모든 사용자에 대해 쿠키를 만들어주고 세션을 만든다는거다. 
사용자에게 쿠키를 주고, session은 DB에 저장하는거다. 

그렇다면 만약 봇이나 로그인하지않고 구경만 하려는 사용자들이 방문했다고 해보자 
지금 내가 만든건 모든 방문자에 대해 쿠키랑 session을 만들고 이 session을 모두 DB에 저장하는건데 
이거는 별로 좋은 생각이 아니다. 
로그인한 사용자의 session만 DB에 저장하는게 좋다. 

저 session 미들웨어의 resave와 saveUninitialized 를 'false' 로 바꾸게 되면 
로그인 하지않으면 쿠키를 주지 않게된다. 
당연 DB에도 session이 저장되지 않는다. 

뜻을 알아보자면 
saveUninitialized 
 : 세션이 새로 만들어지고 수정된 적이 없을 때 초기화안함. 즉, 새로운 세션이 있는데, 수정된 적 없으면 초기화 안함 

 그럼 세션을 어디에서 수정할까? 세션은 한곳에서만 수정될 수있는데 바로 내가만든 userController다. 
 그중에서도 req.session을 직접 건드리는 아래 코드의 저 부분.

******************************************************************************************************* 
(userController.js)

const ok = await bcrypt.compare(password, user.password);
    if(!ok) {
        res.render("login", { 
            pageTitle,
            errorMessage: "Wrong Password"
        });
    }
    req.session.loggedIn = true; 
    req.session.user = user; <-여기!
    res.redirect("/");         <-그리고 여기! 에서 세션을 initialize하는 부분이다. 
}
******************************************************************************************************* 

그니깐 saveUninitialized 이게 뭐하는거냐면, 세션을 수정할 때만 세션을 DB에 저장하고 쿠키를 넘겨주는거다. 
우리는 로그인할 때만 저기서 session을 수정하고있잖아.
다른 말로 표현하자면, 백엔드가 로그인한 사용자에게만 쿠키를 주도록 설정됐다는 말이다. 

이게 좋은 생각인 이유는, 백엔드가 DB에 저장하는게 session의 인증에서의 문제점 중 하나이기 때문이다. 

***************************************************************************************************************************************** 
세션/쿠키 인증방식의 장단점

(장점)
1. 세션/쿠키 방식은 기본적으로 쿠키를 매개로 인증을 거칩니다. 여기서 쿠키는 세션 저장소에 담긴 유저 정보를 얻기 위한 열쇠라고 보시면 됩니다. 따라서 쿠키가 담긴 HTTP 요청이 도중에 노출되더라도 쿠키 자체(세션 ID)는 유의미한 값을 갖고있지 않습니다(중요 정보는 서버 세션에) 이는 위의 계정정보를 담아 인증을 거치는 것보단 안전해 보입니다. 
 
 
2. 사용자 A는 1번, 사용자 B는 2번 이런식으로 고유의 ID값을 발급받게 됩니다. 그렇게 되면 서버에서는 쿠키 값을 받았을 때 일일이 회원정보를 확인할 필요 없이 바로 어떤 회원인지를 확인할 수 있어 서버의 자원에 접근하기 용이할 것입니다. 
 
 
(단점)
1. 장점 1에서 쿠키를 탈취당하더라도 안전할 수 있다고 언급했습니다. 그러나 문제가 하나 있습니다. 만일 A 사용자의 HTTP 요청을 B 사용자(해커)가 가로챘다면 그 안에 들어있는 쿠키도 충분히 훔칠 수 있습니다. 그리고 B 사용자는 그 훔친 쿠키를 이용해 HTTP 요청을 보내면 서버의 세션저장소에서는 A 사용자로 오인해 정보를 잘못 뿌려주게 되겠죠(세션 하이재킹 공격이라고 합니다) 
-> 해결책
1. HTTPS를 사용해 요청 자체를 탈취해도 안의 정보를 읽기 힘들게 한다. 2. 세션에 유효시간을 넣어준다. 
 
 
2. 서버에서 세션 저장소를 사용한다고 했습니다. 따라서 서버에서 추가적인 저장공간을 필요로 하게되고 자연스럽게 부하도 높아질 것입니다. 
***************************************************************************************************************************************** 
 
이걸 위한 해결책이 token authentication이다. 
예를들어 iOS나 안드로이드 앱을 만들 때 이것들은 쿠키를 갖지 않기 때문에 token을 사용한다. 

하지만 여기선 다르다. 브라우저에서 인증을 하니까 쿠키를 이용해서 세션인증을 할수있기 때문이다. 
물론 브라우저에서 token을 사용할수도있지만 이건 심화니까 나중에 

아무튼 뭐 session authentication(인증)은 브라우저에서 잘 동작한다.

그러면 이제 우리는 익명의 사용자에게는 쿠키를 주지않고 로그인한 우리의 유저에게만 쿠키를 줄수있게 되었다. 
******************************************************************************************************* 
app.use(
    session({
    secret: "Hello!",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: "mongodb://127.0.0.1:27017/wetube"})
    })
);
******************************************************************************************************* 

이 세션은 더 많은 설정을 가지고 있다. 
그리고 secret이라는게 있는데 이부분을 보호해야한다. 
왜냐하면 secret부분이랑, store의 URL 부분은 코드에서 보이면 안되기 떄문이다. 
이 웹사이트를 서버에 배포할 때, 이 DB URL 을 코드에 그냥 두면 안된다. 
왜냐면 저 URL을 가진 DB에는 username과 password가 다 들어있는 소중한 나의 저장소이기 때문이다. 

# 쿠키의 구성 

자 이제 쿠키의 프로퍼티에 대해 알아볼거다. 
Name, Value, Domain, Path, Expires / Max-Age..등등이 있다. 

1. secret 
secret은 우리가 쿠키에 sign할 때 사용하는 string이다. 
쿠키에 sign하는 이유는 우리 백엔드가 쿠키를 줬다는걸 보여주기 위함이다.(쿠키를 보여줘야 내가 누군지 서버가 알지)
왜냐면 session hijack(납치) 라는 공격유형이 있는데 이건 누군가가 나의 쿠키를 훔쳐서 나인척하고 서버에서 빼갈수가있다. 

secret 을 사용할 때는 string을 사용하는데 이걸 길고 무작위로 만들어야한다. 
이 string을 가지고 쿠키를 sign하고 우리가 만든 것임을 증명할 수 있기 때문이다. 
 
2. Domain 
이 쿠키를 만든 백엔드가 누구인지 알려준다. 
브라우저는 Domain에 따라 쿠키를 저장하도록 되어있다. 
그리고 쿠키는 Domain에 있는 백엔드로만 전송된다. 
예를 들어 localhost:4000가 사용자에게 쿠키를줬으면 
사용자는 어떤 요청을 하던간에 쿠키는 localhost 로 전송되는거다. 
즉, Domain은 쿠키가 어디서 왔는지, 어디로 가야하는지 알려주는거다. 

3. Path 
그냥 URL 임. 별거아님 

4. Expires 
만료되는 시점을 정해주는것이다. 
지금 우리는 session이라고 되어있는데 이것은 현재 쿠키의 만료날짜가 명시되지 않은거다. 
즉, 내가 만료날짜를 따로 지정하지 않으면 session cookie로 설정이 되고 
사용자가 브라우저를 닫으면 session cookie는 끝나게된다. 
예를 들어, 몇몇 브라우저에서 프로그램을 닫으면 쿠키가 사라지는거다. 
아니면 컴퓨터를 재시작 할 때 세션이 사리지거나. 
아무튼간에 사용자가 닫지 않는 한 계속 쿠키는 살아있다. 

5. Max-Age 
언제 세션이 만료되는지 알려주는거다. 
내가 따로 설정을 안해놔도 현재 나의 백엔드에서 쿠키데이터의 expires를 보면 대략 세션을 만들고 2주정도 뒤면 만료되게 설정되어있다. 
물론 내가 설정해줄수도있다(밀리초단위로 설정). 그러면 내가 설정해준 시간이 지나면 자동으로 로그아웃되는거다. 



# Environment File (환경변수)

다음으로, 우리는 우리의 DB URL을 보호해한다. 아 물론 secret string도 보호해야한다. 
우리의 코드에 다른사람이 보면 안되는 값을 써선 안된다. 
이걸 위해 environment File(환경변수) 를 만들거다. 

일단 WETUBE 최상위 폴더에 '.env' 파일을만들고 .gitignore안에 .env를 추가해야한다. 
왜냐면 .env파일은 깃헙에 올리면 안되니깐 
.env에는 코드에 들어가면 안되는 값들을 추가할거다. (설정값같은것들)
예를들어 우리의 secret과 DB URL 이 있다. 
관습적으로 env 파일에 추가하는 모든건 대문자로 적는다. 

******************************************************************************************************* 
(.env)
COOKIE_SECRET = asdawd16532wdaw54dq21r4wq32r11wdfv
DB_URL = mongodb://127.0.0.1:27017/wetube
******************************************************************************************************* 
위와같이 우리가 만든 env파일에 비밀로 해야하는 API key나 뭐 비밀로해야할 URL 이나 아무튼 뭐 숨기고싶은거 넣어주면 된다. 
 
그렇다면 .env 파일에 접근하는 방법은 뭘까 
그냥 "process.env.숨기고싶은거"  이렇게 적어주면 된다. 아주 쉽죠?

******************************************************************************************************* 
(server.js)
app.use(
    session({
    secret: process.env.COOKIE_SECRET, <- 요기서 한번 .env 가져다 쓰고 
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL}) <- 요기서도 .env에서 가져다 쓰쥬 
    })
);

(db.js)

mongoose.connect(process.env.DB_URL, { <- 요기도
    useNewUrlParser: true,
    useUnifiedTopology: true
});
******************************************************************************************************* 

아 근데 undefined 라고 에러 나오네 그냥 가져오면 되는게 아님. 역시 쉽지 않쥬?

자 지금까지 2/3 정도 했다. 

1. .env 파일 만들기(package.json 파일옆에 있어야함)
1-1. .env파일을 .gitignore안에 추가하기 왜냐면 .git에 업로드 하지 않을꺼니까 
2. 비밀로 해야하는 string을 process.env(환경변수) 로 바꾸기 



# How to access a variabels in .env file 

자 그럼 이제 어떻게 이 .env파일안에있는 값을 읽을수 있는지 araboza 
지금 우리가 사용하고 싶은것은 dotenv라고 부르는것이다. 
이 Package가 하는일이 무엇이냐면 나의 env파일을 읽고 
각각의 변수들(COOKIE_SECRET, DB_URL)을 process.env안에 넣는거다. 
 
prcoess.env를 console.log 해보면 많은것들이 나오는데 이것들이 nodeJS의 process의 환경이다. 
근디 여기서 process.env.DB_URL을 하면 undefined 가 나온다. 
왜냐면 아직 안넣었으니까 

그러면 이제 이 env파일안에있는 변수들은 process.env 안에 넣기위해 
dotenv를 설치하자. 

$ npm i dotenv

dotenv는 여러 언어로 구현되어있다. 
파이썬, 자바스크립트 등 다른 언어로도 구현이 되어있다. 

그럼 설치하고 어떻게 사용할까? 

require('dotenv').config() <- 요것만 해주면 되지롱

'나의 앱 안에서 최대한 먼저' 라고 사용설명서에 적혀있는데 이게 뭔말이냐. 
예를들어 
우리는 지금 .env 파일에서 변수를 가져오는걸 server.js 랑 db.js 에서 가져다 쓰고있는데 
server.js에서 만 require('dotenv').config() 해주면 db.js 에서 DB_URL 이나 COOKIE_SECRET 을 쓸수없다. 
왜냐면 가장먼서 require('dotenv').config() 을 실행 해준게 아니니까 

나의 앱은 init.js 로 시작한다. 

******************************************************************************************************* 
(init.js)

import "./db" <- 2. 여기선 require('dotenv').config() 안해준상태니까 DB_URL, COOKIE_SECRET 이 없는거다. 
import Video from "./models/Video";
import User from "./models/User";
import app from "./server" <-1. 여기서 require('dotenv').config() 해줘도 


const PORT = 4000;

const handleListening = () => console.log(`✅Server listening on port http://localhost:${PORT}🚀`);

app.listen(PORT, handleListening)
******************************************************************************************************* 

그러니 아래처럼 init.js에서 가장 먼저 require('dotenv').config() 을 해줘야 모든곳에서 .env안에있는 변수들에 접근할 수있다.
require('dotenv').config() 이게 .env안에있는 변수에 접근을 시켜주는거니깐 
require('dotenv').config() 이게 .env안에있는 변수를 정의시켜주는 역할이다. 
******************************************************************************************************* 
(init.js)
require('dotenv').config()

import "./db"
import Video from "./models/Video";
import User from "./models/User";
import app from "./server"


const PORT = 4000;

const handleListening = () => console.log(`✅Server listening on port http://localhost:${PORT}🚀`);

app.listen(PORT, handleListening)
******************************************************************************************************* 
 
근디 init.js에서 제일 먼저 require('dotenv').config() 해줘도 에러가 나오네?
문제는 우리가 두가지 방법으로 import 하는게 문제다. 

계속 'import' 사용하다가 갑자기 'require' 하니까 에러가 뜨는거다. 
'require'를 사용하려면 우리가 env 에서 변수를 가져오려는 모든 파일의 가장 윗부분에 require를 넣어야한다. 
근디 'import' 를 사용해서 가져오면 그럴필요없이 가장 먼저 시작하는 init.js 의 최상단에 import만 해주면 
모든파일에서 사용할 수 있다. 
아래의 코드처럼 하면 된다. 
******************************************************************************************************* 
(init.js)

require('dotenv').config() <- 이거말고
import "dotenv/config"; <- 이걸 쓰면 된다는거지 
import "./db";
import Video from "./models/Video";
import User from "./models/User";
import app from "./server"


const PORT = 4000;

const handleListening = () => console.log(`✅Server listening on port http://localhost:${PORT}🚀`);

app.listen(PORT, handleListening)
******************************************************************************************************* 

이렇게 하면 이제 모든 파일에서 .env안에있는 변수에 접근할 수 있지만 
내 git(Version Control) 에는 전송되지 않을거다. 
내 코드에도 없고 그냥 파일안에만 있을거다. 
즉 .env 파일로 비밀을 유지할 수 있는거다. 

# Githun Login

The web application flow to authorize users for your app is: 
( 내가 깃헙으로 로그인 하는 flow )

1. Users are redirected to request their GitHub identity
2. Users are redirected back to your site by GitHub 
3. Your app accesses the API with the user''s access token

-. 깃헙을 이용한 로그인 프로세스 

    사용자를 깃헙으로 보낸다. 
    사용자는 깃헙으로 에미일이랑 패스워드 등등을 넣게 되겠지 
    그리고 우리에게 정보를 공유하는것을 승인하게 될거다. 
    그러면 깃헙은 사용자를 우리 웹사이트로 돌려보낼거다. 
    그 단계가 되면, 깃헙은 사용자를 token과 함께 redirect 시킬거다. 
    그러면 우리가 그 token으로 사용자의 정보를 받아오는거다. 
    그 token은 빠르게 만료될것이다. 

자 그럼 이제 순서대로 해봅시다. 

1. Users are redirected to request their GitHub identity

일단 깃헙의 앱을 다운로드 받아야함 

->github.com/settings/apps 로 들어가서 OAuth Apps 클릭
그리고 캡쳐해놓은 화면처럼 입력
특히 Authorization callback URL 은 나중에 사용해야하니까 기억해놓고

->Register application 후 client ID 가 있는지 확인
Client secret은 나중에 만들어질거다. 


자 그럼 이제 login.pug로 가서 깃헙로그인을 위한 앵커를 하나 만들자 

******************************************************************************************************* 
(login.pug)

extends base

block content 
    if errorMessage 
        span=errorMessage
    form(method="POST")
        input(placeholder="Username", name="username", type="text", required)
        input(placeholder="Password", name="password", type="password", required)
        input(type="submit", value="Login")
        br 
        a(href="https://github.com/login/oauth/authorize") Continue with Github &rarr; <- 이거쥬 이거만든거쥬
    hr
    div 
        span Don't have an account? 
        a(href="/join") Create one now &rarr;
******************************************************************************************************* 

그리고 우리가 방금 만든 "Continue with Github" 링크로 들어가게되면 404 가 뜬다.
왜냐면 우리가 parameter들을 보내줘야하기 떄문이다. 

그중에 하나는 Client ID 다. 
그러면 일단 URL 에 Client ID 를 보내보자 

a(href="https://github.com/login/oauth/authorize?client_id=553e1a6414a4c580b98f") Continue with Github &rarr;

이거 알죠 이거 기억해야죠 GET 방식으로 URL 통해서 데이터 보내는법 
암 튼조금전에 내가 깃헙 홈페이지 들어가서 뭐 OAuth 앱에서 뭐 내 앱 등록하고 뭐 URL 입력하고 뭐 이런거 하고나서
받은 client ID 를  저렇게 URL로 보내주면 
이제는 404 아니고 Authorized Wetube 라는 곳으로 왔다.  이예 

(캡쳐해 놓은 화면 있음)
여기서 보면 Wetube by ihd0628 이 나의 계정에 접근하고 싶어한다고 한다. 
무슨 데이터를 보고싶어하냐면 public 데이터를 보고싶어한다. 
ID, 프로필사진 등등..
하지만 이것만 원하지는 않는다. 
나는 사용자의 이메일을 원한다. 
그말은 우리가 더 많은 정보를 요청해야 한다는 것이다. 

아래 보면 깃헙에서 만든거 아니라고 나와있고 만든지 하루도 안됐다고 나와있다. 
사용자도 10명도 안된다고 하네.
그리고 승인하면 localhost:4000 으로 redirect 될거라고도 나와있다. 

아직 redirect 하진 않을거다. 
사용자를 깃헙으로 보내면 깃헙에는 내가 이미 로그인 되어있기 때문에 
Authorize 가 뜬다.(로그인 안되어있으면 깃헙에 로그인하는 화면이 뜬다.)


이제 저 Authorize 화면 속 "Authorize ihd0628" 이걸 클릭해서 Authorize 하는건데 
저걸 그냥 지금 클릭하면 우리의 Wetube 사이트로 돌아가게 되는거다. 
문제는 내가 public 데이터보다 더 많은 정보를 받고 싶다는 것이다. 
그래서 scope 에 뭔가 전송할거다. 
우리는 공백으로 구분된 scope를 보낼거다. 
scope에는 내가 사용자에 대해 어디까지 알 수 있는지 적으면 된다. 

이렇게 scope 외에도 뭐 이것저것 있는데 
예를들어서 allow_signup은 사용자가 깃헙 계정이 없다면 계정 생성하게 할래?
아니면 이미 계정이 있는 사람만 하게할래? 뭐 이런걸 하게 할수도있다.

a(href="https://github.com/login/oauth/authorize?client_id=553e1a6414a4c580b98f&allow_signup=false") Continue with Github &rarr; <- 이렇게 

이렇게 1단계다 사용자를 깃헙으로 보낼 수 있고 URL 에 있는 것들을 바꿈으로써 다양한 방법으로 사용자를 승인할 수 있다.
사용자가 정보를 어디까지 공유해야하는지와 계정생성을 할수있게 할지말지를 설정할 수 있다. 

근데 아직 scope는 안다뤘으니 scope를 통해서 사용자의 이메일등 받아갈 정보를 정해보자 
scope는 유저에게서 얼마나 많이 정보를 읽어내고 어떤 정보를 가져올 것에 대한것이다. 

일단 scope에 대해 간략히 알아보자면
adminscope 를 가져오는걸 통해 
organization 을 일고 쓴다거나 public key에 접근이 가능하다(이게 뭔지는 추가 공부 필요)
혹은 모든 notification에 대해 watch/unwatch에 대한 접근이 가능하다. 

user도 마찬가지다. 
user의 프로필로부터 읽고 쓸수가 있다. 
내가 뭘 원하는지에 따라 달려있다. 
지금 우리는 그냥 read만 하면 된다. 
그리고 user:email 을 가져오기만 하면된다. 
우리가 원하는건 이게 다다.

자그럼 일단 email 주소를 가져오기위해서 어떻게 하면 되냐면

a(href="https://github.com/login/oauth/authorize?client_id=553e1a6414a4c580b98f&allow_signup=false&scope=user:email") Continue with Github &rarr;

이렇게 URL 에 '&scope=user:email' 요거만 추가해주면 되지롱

그러면 아까는 Public data 였던게 Personal user data 로 바뀌어있는걸 볼수 있다. 
"scope=user" 로 바꾸면 모든 Personal data 에 접근이 가능하다.(full access)
결국 이 scope parameter에 따라 달라지는거다. 

scope는 그리고 공백으로 구분이 가능하다. 
ex) '&scope=user:email read:user'

이 말인 즉슨, 내가 깃헙이랑 대화할 때 "나는 이런 정보를 원한다" 라고 요구하는것과 같다.
내가 어떤 정보를 요청하느냐에 따라 user는 승인을 받게 되고 
깃헙은 우리의 백엔드에게 정보에 접근할 수 있도록 토큰을 줄거다. 

모든것은 URL에 기반하고 있다. 
(카카오톡 로그인을 구현할 때에도 마찬가지로 똑같이 해줘야한다.)

그런데 저거 URL 엄청 긴거 일일히 비슷한거 scope만 변경된다던지 하는거 일일히 쓰고있으려면 아주 귀찮쥬?
그러니 한곳에 모아둡시다.

그 라우트는 '/users/github/start' 로 한다. 

******************************************************************************************************* 
(login.pug)
extends base

block content 
    if errorMessage 
        span=errorMessage
    form(method="POST")
        input(placeholder="Username", name="username", type="text", required)
        input(placeholder="Password", name="password", type="password", required)
        input(type="submit", value="Login")
        br 
        a(href="/users/github/start") Continue with Github &rarr; <- 요로케 변경 
    hr
    div 
        span Don't have an account? 
        a(href="/join") Create one now &rarr;
******************************************************************************************************* 

그리고 우리는 아직 이 라우트가 없으니 새로운 라우트를 만들거다. 

******************************************************************************************************* 
(userRouter.js) 

userRouter는 이미 있으니 그안에 '/github/start' 로 가기위한 라우터를 또 만들어 준다. 아래처럼. 

import express from "express"; 
import { edit, remove, logout, see, startGithubLogin } from "../controllers/userController";
import { finishGithubLogin } from "./controllers/userController";
    -> 새로운 컨트롤로 만들었으니 당연히 Import 해줘야겠주?

const userRouter = express.Router();

userRouter.get("/logout", logout);
userRouter.get("/edit", edit);
userRouter.get("/remove", remove);
userRouter.get("/github/start", startGithubLogin) <- 여기 만들어 준거고 저 컨트롤러는 아직 없으니 만들어줄거다. 
userRouter.get("/:id", see);

export default userRouter;
******************************************************************************************************* 


이제 '/github/start' 라는 URL 이 생겼다. 
이 URL 은 user를 깃헙으로 redirected 시킬건데 이제 이 URl을 좀더 이쁘게 만들어 볼거다. 
(우리의 scope는 user의 정보를 읽는것과 user의 이메일 주소다.)
******************************************************************************************************* 
(userController.js)

export const startGithubLogin = (req, res) => {
    const config = {
        clientId: "553e1a6414a4c580b98f",  <- 이렇게 하면 안돼 
        client_id: "553e1a6414a4c580b98f",  <- 이렇게 해야해 깃헙이 원하는 이름을 똑같이 써줘야해! 그래야 나중에 문자화해서 보낼 때 깃헙이 알아먹지!!
        allow_signup: false, 
        scope: "read:user user:email" <- scope는 꼭 공백으로 나눠줘야 함 
    };
    const baseUrl = "https://github.com/login/oauth/authorize";
}; 
******************************************************************************************************* 

자 우리가 만든 config 객체가 있다. 
이걸 이제 URL 로 바꿔보자. 
아니면 이걸 인코딩해서 URL 상에서도 동작할 수 있게 할수도 있다. 
그래서 우린 UrlSearchParams 라는 utility를 써볼거다. 

******************************************************************************************************* 
(userController.js)
export const startGithubLogin = (req, res) => {
    const config = {
        client_id: "553e1a6414a4c580b98f", 
        allow_signup: false, 
        scope: "read:user user:email"
    };
    const parmas = new URLSearchParams(config).toString(); 
    const baseUrl = "https://github.com/login/oauth/authorize?";
};  
******************************************************************************************************* 

new URLSearchParams(어떤객체).toString() 해주게되면 
객체안의 프로퍼티와 그 값들을 &로 구분하여 쭉 나열해준다. 

예를들어 위의 config 객체를 
new URLSearchParams(config).toString() 해주면

'client_id=553e1a6414a4c580b98f&allow_signup=false&scope=read%3Auser+user%3Aemail'
 -> 이런 멋진게 나오는거다. 

 자 이제 config도 있겠다, 보기좋게 코딩도 했겠다, params도 만들었겠다, baseUrl 도 있겠다,
 이제 뭘할거냐면 우리가 만든것들을 URL 로 집어넣어 보자. 

*******************************************************************************************************
(userController.js)

 export const startGithubLogin = (req, res) => {
    const baseUrl = `https://github.com/login/oauth/authorize`;
    const config = {
        client_id: "553e1a6414a4c580b98f", 
        allow_signup: false, 
        scope: "read:user user:email"
    };
    const parmas = new URLSearchParams(config).toString(); 
    const finalUrl = `${baseUrl}?${parmas}`; 
    return res.redirect(finalUrl); <- 최종적으로는 여기 finalUrl 로가게 해야함 
}; 
******************************************************************************************************* 

자 이렇게 하면 저기 pug 에다가 일일히 엄청 긴 URL 주소를 치는것보다는 훨씬 좋다. 
왜냐면 이제 어디서든 이 finalUrl 을 user 에게 보낼 수 있고 작동도 할 것이기 때문이다. 

자 그럼 이제 드디어 저 Github Authorization 페이지에서 "Authorize ihd0628" 버튼을 눌러볼 차례다. 
저 버튼을 눌러 보면 브라우저에 'Cannot GET /users/github/callback' 라는 텍스트를 볼수 있는데 

그말은 저 버튼이 'users/github/callback' 으로 다시 redirected 시킨다는 의미이다. 
(정확히는 'http://localhost:4000/users/github/callback?code=0bcba6b15d3cf559158e')

요기가 어디냐면 내가 맨처음에 뭐 사진 등록하고 OAuth 처음 등록할 떄 내가 직접 타이핑한 URL 이다. 

그니까 지금 무슨일이 일어나고 있는거냐면 만일 깃헙이 유저가 '예' 라고 답하면 
깃헙이 user를 어플리케이션의 내가 직접 정한 URL로 보내주게 된다. 
그리고 user에게 code를 보내주게 돼(그 코드는 URL 에 답겨있다.)

그리고 우리는 그 code를 사용할건데 그전에 일단 저 'users/github/callback' URL 과 컨트롤러를 만들어 줄거다. 

근디 'users/github/callback' ->'users/github/finish' 이거로 바꿔줄 거임. 

2. Users are redirected back to your site by Github 

자 이제 드디어 2단계로 왔다. 
user가 깃헙을 통해서 나의 웹사이트로 다시 redirect 될거다 이제. 
자 일단 User 가 깃헙을 통한 로그인을 클릭하면 'users/github/finish' 로 가긴 하는데 
우리는 라우터는 있지만 아직 컨트롤러에서 뭘 해주진 않는다. 
자 이제 뭔가를 해주면서 로그인이 되게 한번 해볼건데
뭘 해줘야하냐면 
일단 Github에서 받은 토큰을 Access 토큰으로 바꿔줘야한다.  

자 뭔말인지 하나도 모르겠지만 일단 해보자 

일단 깃헙에서 준 코드
'http://localhost:4000/users/github/finish?code=a58ad6a14b6d4da05e56'
깃헙을통한 로그인 클릭하면 가는 URL 에서 마지막에있는 코드 저게 깃헙에서 준 코드다. 
저 코드를 Access 토큰으로 바꿔보자. 

일단 다음과 같은 파라미터들과 함께 POST request를 보내야한다. 
client_id : 이건 뭔지 알쥬 
client_secret : 이건 절대 프론트엔드로 가지 않을거다. 
code: 이건 URL에 있죠 
등등이 있지만 일단 여기까지만 쓸거임 
'POST https://github.com/login/oauth/access_token'

자 근디 우리 지금 cilent_id 를 아주 반복적으로 쓰고있기 때문에 이것도 .env 파일에 넣어줄거다. 
client_id를 .env에 저장하는 이유는 client_id 가 어떤 비밀이라서는 아니다. 
어차피 URL 에 보여지는디 비밀로 할게 뭣이있겠어 
그냥 값을 한 장소에 몰아놓음으로서 어디서든 사용할 수 있게 하기 위함이다. 

client_secret 이거는 오직 백엔드에만 존재해야하는 secret 이다. 
이건 절대 어디 누구한테 보여주면 안되니까 진짜 .env 에 넣어줘야한다. 
(저 secret은 내 OAtuth 어플리케이션 페이지에서 복사 가능)

자 이제 code, secet, client_id 다 받았으니 한번 사용해보자 

일단 finishGithubLogin 컨트롤러에 config 객체를 만든다. 

******************************************************************************************************* 
(userController.js)

export const finishGithubLogin = (req, res) => {
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code                    <- URL에서 code를 가져오는것. 
    }
};
******************************************************************************************************* 

req.parmas와 req.query 헷갈리지 말자
req.params는 URL 에서 /:id 처럼 주소안에 있는거 가져오는거고 
req.query 는 ? 이후에 있는거 가져오는 거다. 

근데 일단 req.params, req.query 는 모두 GET 방식인거고 URL 에 있는 데이터를 가져오는거지만 
req.body는 POST 방식의 데이터를 가져올 때 쓰는거다. 헷갈리지 말자. 

아무튼 일단 저렇게 3개의 파라미터를 우리는 URL에 집어넣어야한다. 
왜냐하면 또 다른 request를 보내야하기 때문이다. 
저 3개의 파라미터를 가지고 POST request를 보내볼거다. 

******************************************************************************************************* 
(userController.js)

export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const data = await fetch(finalUrl, {
        method: "POST",   <- 이건 fetch 안의 URL 에 POST 방식으로 요청한다는건데 
        headers: {      <- 이건 뭔지 모르겠음 일단 깃헙이 이렇게 하라고 시킨거임. 
            Accept: "application/json",
        }
    })
    const json = await data.json();
    console.log(json);
};
******************************************************************************************************* 

fetch는 추후 다시 자세히 공부해볼 예정 
일단 지금은 특정 URL에서 데이터를 가져와 쓰는 용도라고 알고있자.

자 여기서 잠깐 정리 
finishGithubLogin 컨트롤러에는 우리가 사용할 baseUrl 이 있고 configration 객체도 만들었다. 
config 객체에는 client_id, client_secret, code 이렇게 3개의 파라미터를 가져야한다. 
UTLSearchParams().toString() 을 통해 URL 파라미터(parmas)를 만들었고 
baseUrl 과 params를 합쳐서 finalUrl 도 만들었다. 
그리고 finalUrl에 요청을 보낼거다. 

우선 fetch를 통해 'data'를 받아오고 
그 'data' 에서 JSON을 추출할거다. 
 -> data.json() 을 통해 JSON 추출 

아무튼 우리는 우리가만든 finalUrl에 POST 요청을 보내고 있을뿐이다. 
그리고 그 finalUrl 에는 client_id, client_secret, code 가 포함되어있는거다. 
그리고 그 값에 접근하기 위해 환경변수(.env) 를 사용하고 있다. 

자 그런데 이렇게 하고나서 봤떠니 에러가뜨네?
ReferenceError: fetch is not defined
왜냐면 fetch는 브라우저에서는 작동하지만 NodeJS 에서는 정의되지 않았기 때문이다. 
자그럼 이걸 한번 사부작사부작 써보자. 

-. node fetch 

그래서 브라우저말고 nodeJS 환경에서 쓸수있는 fetch를 사람들이 만들었다. 

1. 일단 설치 
$ npm i node-fetch

2. userController 에 import 
(userController.js)
import fetch from "node-fetch";

끝 이렇게 설치해서 import 해주면 사용가능 

그럼 이제 진짜 finalUrl에  POST request 해보자

request 해줬더니 뭔진 모르겠지만 일단 뭐가 콘솔창에 나오긴했다. 

******************************************************************************************************* 
(console.log(json))

{
    access_token: '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',
    token_type: 'bearer',
    scope: 'read:user,user:email'
}
******************************************************************************************************* 

깃헙에서 준 URL에 있는 코드를가지고 깃헙 백엔드에 request를 보내니 access_token 이 생겼다. 




3. Use the access token to access the API

자 3단계는 access_token을 가지고 API 에 접근하는거다. 
이제 access_token을 가지고 user의 정보를 얻을 수 있다. 

지금까지 한거 한번 간단히 읇어보자면 
우린 깃헙에 user를 보내고 
user가 깃헙에서 "예" 라고 하면 깃헙은 코드를 줄거다. 
그리고 그 코드를 가지고 access_token으로 바꿨다. 

그리고 이제 그 acces_token으로 Github_API 를 사용해 user 정보를 가져올거다. 

자 일단 JSON 에 있는 access_token을 가져와야한다. 
그전에 일단 아래처럼 10분이 지나거나 뭐 아니면 어떤 에러가 발생했을 때 login 페이지로 돌아가게 만들어 놓고 
******************************************************************************************************* 
(userController.js)
export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const data = await fetch(finalUrl, {
        method: "POST",
        headers: {
            Accept: "application/json",
        }
    })
    const json = await data.json();
    if("access_token" in json) {
            -> 이부분에서 access_token 에 접근해서 가져올거다.
    } else {
        res.redirect("/login");
    }
};
******************************************************************************************************* 

3단계를 계속 이어나가자면 
3단계는 
"Authorization: token OAUTH-TOKEN"
"GET https://api.github.com/user"
이 GET URL 을 통해서 인증을 위한 access_token을 보내줘야한다. 

******************************************************************************************************* 
(userController.js)
export const startGithubLogin = (req, res) => {
    const baseUrl = `https://github.com/login/oauth/authorize`;
    const config = {
        client_id: process.env.GH_CLIENT, 
        allow_signup: false, 
        scope: "read:user user:email"
    };
    const params = new URLSearchParams(config).toString(); 
    const finalUrl = `${baseUrl}?${params}`; 
    return res.redirect(finalUrl); 
}; 
export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await(        -> 자 여기서 변수에 받아서 다시 .json() 안하고 한번에 await 2개 써서 코드 줄임
        await fetch(finalUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
            }
        })
    ).json();
    
    if("access_token" in tokenRequest) {
        const { access_token } = tokenRequest;     <- 여기서 access_token 받고 
        const userRequest = await(                  <- 여기서 access_token을 이용해 유저정보를 받는다.
                await fetch("https://api.github.com/user", {
                headers: {
                    Authorization: `token ${access_token}`
                },
            })
        ).json();
        console.log(userRequest);    <- 유저정보 출력 
    } else {
        res.redirect("/login");
    }
};
******************************************************************************************************* 

와 내 깃헙 프로필정보가 나오네 
이게 어떤 플로우로 진행되는거냐면 
내가 'Continue with Github' 을 누르면 
우리는 깃헙으로 갔다가 코드를 가지고 다시 돌아오고
코드를 access_token으로 바꾼다음에 access_token을 이용해 
Github API 로 갈거다.("https://api.github.com/user")
 -> access_token은 Github API URL 을 fetch 하는데 사용되었다. 
그랬더니 우리는 user의 purblic 정보를 얻었다.
이건 우리가 처음에 URL로 scope를 설정해줘서 요런 정보를 받은거다. 
만약 scope에 read:user를 하지 않았다면 우리가 받은 코드로는 user의 정보를 읽을 수 있는 access_token을 받을 수 없다. 

다시 말해, access_token은 user가 모든걸 할 수 있게 해주진 않는다. 
(scope에 명시되어 있는대로만 해준다.)

기가 막힌다. 
하지만 문제가 하나있는데 내 email 값이 null 이네?
무슨말이냐면 내 email 이 없거나  private 이라는 뜻이다. 
(어떤 user들은 public email을 가지고 있을수도 있다. 하지만 그렇지 않은경우는 이러한 방식으로는 email을 가져올 수없다.)
그래서 email 값이 null 일 때를 대비해서 또 다른 request를 만들어야한다. 
user의 email을 요청하기 위해 똑같은 access_token을 써야한다. 

Github API 를 보면 
"List email addresses for the authenticated user"
라는게 있는데 모든 email 주소를 보여주는거라고 설명이 써있다. 
오 왠지 이거인거 같다. 

URL 은 기존 public user data를 가져올때와 유사하다.
"https://api.github.com/user/emails" <- 여기서 fetch 하는거다. 

아래의 코드에서 우린 두개의 request를 하고 있다. 

그리고 모든 eamil주소를 가져올 수 있는 URL 로 fetch 하여 email data를 eamilData 변수에 받는다. 

******************************************************************************************************* 
(userController.js)

export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await(
        await fetch(finalUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
            }
        })
    ).json();
    
    if("access_token" in tokenRequest) {
        const { access_token } = tokenRequest;
        const apiUrl = "https://api.github.com" 
        const userData = await( 
                await fetch(`${apiUrl}/user`, {
                headers: {
                    Authorization: `token ${access_token}`
                },
            })
        ).json();
        console.log(userData);
        const emailData = await( 
                await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`
                },
            })
        ).json();
        console.log(emailData);
    } else {
        res.redirect("/login");
    }
};
******************************************************************************************************* 

이렇게 했더니

******************************************************************************************************* 
console.log(emailData);
[
    {
      email: 'shl906@naver.com',
      primary: true,
      verified: true,
      visibility: 'private'
    },
    {
      email: '94297973+ihd0628@users.noreply.github.com',
      primary: false,
      verified: true,
      visibility: null
    }
]
******************************************************************************************************* 
콘솔창에 위와같이 email 데이터들이 나타났다. 홀리 쉿
그러면 우리는 이 email들 중 verified 이면서 primary 인걸 가져오면 된다. 
왜냐면 가끔 깃헙으로 계정 생성을 해도 primary 혹은 verified가 안되어있을수도 있기 때문이다. 

자 다시 말하지만 /user/emails 와 /user 로 보내지는 저 fetch를 통해 이루어지는 
request 들은 access_token이 볼 수 있게끔 허락해줬기 때문에 작동하는거다. 

그리고 그 access_token의 허용범위를 정해주는게 처음해 정한 scope다. 
모든건 scope에서 출발했다. 

아래처럼 우리가 사용하고 있는 fetch의 사용방식은

const tokenRequest = await(
    await fetch(finalUrl, {
        method: "POST",
        headers: {
            Accept: "application/json",
        }
    })
).json();

사실 위랑 아래랑 기능상으로는 같은거다. 

fetch(x).then(response => response.json()).then(json => asdasd)

근디 아래의 방식은 별로 좋지 않다. 
왜냐하면 우리는 아래의 방식을 사용할 경우 .then 안으로 들어가야 하기 때문이다.

예를 들어 
아우 그냥 뭐 fetch().then().then(fetch().then()) 
이런거 해줘야되는데 존나 보기만해도 머리가 터진다. 

그러니 promise 방식을 쓰는게 훨씬 깔끔하다. 

어쨋든 우리는 user데이터와 email 데이터를 불러오고 있다. 
그말은 우리는 유저의 Github ID 도 가지고 있고 user의 email 들도 알고 있다는거다. 

자 이제 verified와 primary가 true 인 email을 찾으면 되는데 그럴 때 사용하는데 .find() 메소드이다. 
이거 아주 신박하고 아주 훌륭하다. 
아래처럼 해주면 emailData 배열에서 primary, verified가 true 인 email을 찾아올수 있따. 
******************************************************************************************************* 
const email = emailData.find(
    (email) => email.primary === true && email.verified === true
);
******************************************************************************************************* 



******************************************************************************************************* 
(userController.js)
export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await(
        await fetch(finalUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
            }
        })
    ).json();
    
    if("access_token" in tokenRequest) {
        const { access_token } = tokenRequest;
        const apiUrl = "https://api.github.com"
        const userData = await( 
                await fetch(`${apiUrl}/user`, {
                headers: {
                    Authorization: `token ${access_token}`
                },
            })
        ).json();
        console.log(userData);
        const emailData = await( 
                await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`
                },
            })
        ).json();
        const email = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if(!email) {
            return res.redirect("/login");
        }
        -> "여기!!"
    } else {
        res.redirect("/login");
    }
};
******************************************************************************************************* 

만일 위의 코드에서 코드가 "여기!!"까지 왔다면 email도 받았고 user 데이터 또한 있다는 것이다.
그래서 그 User를 로그인시킬 수도 있고, 아니면 계정을 생성시킬수도 있다. 왜냐면 email이 없다는 뜻이니까

# 로그인 규칙을 어떻게 만들것인가?

예를들어 DB에 user가 하나 있는데, 이 user는 DB에 적혀있는 email을 가지고있다.(shl906@naver.com)
이미 해당 email로 계정도 있고 password도 있다. 
즉. 이 user는 username과 password로 login 할 수 있다. 

근데 만일 "Github으로 로그인" 버튼을 누르게 된다면 토큰 작업등 전부 거친 뒤, 
Github으로 로그인 한 user는 DB상에 똑같은 email과 password를 가진 user를 받을거다. 

그러니까 내 웹사이트로 와서 email과 password로 계정을 생성하고 
한달 후에 돌아와서 깃헙으로 로그인하려고 한다. 

깃헙은 서버에 email을 주고있다. 근데 회원가입한 똑같은 email이 있는상황이다. 
그러면 어떻게 해야할까? 

두가지 옵션이 있다. 
하나는 user에게  "그건 안됌. 이미 email이랑 password가 있으니 그거로 로그인하삼" 이라고 말할수있고, 
다른 하나는 "똑같은 email이 있다는걸 증명했으니 Github로 로그인해도 됨." 이라고 할수도있다. 
둘중 뭘하는 내맘이다. 

우리는 Github 로그인 같은 소셜 로그인을 할 때 만일 내가 email에 접근 권한이 있다는게 증명되면 
즉, password가 있거나 Github의 email이 verified 된거라면 내가 email의 주인이라는 뜻이니까. 
날 로그인 시켜 줄 수 있는거다. 

여기서 나는 일단 깃헙에서 받은 회원 정보중에 primary, verified가 true 인 email을 찾아서 쓸거다. 

흠..지금 약간 이해 부족인데 일단 뭘할거냐면 
만약 깃헙으로부터 primary인 email을 받고 DB에서 같은 email을 가진 user를 발견하면 
그 user들을 로그인시켜줄거다. 

email은 사실 string이 아닌 객체다.  


******************************************************************************************************* 
(userController.js)

export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await(
        await fetch(finalUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
            }
        })
    ).json();
    
    if("access_token" in tokenRequest) {
        const { access_token } = tokenRequest;
        const apiUrl = "https://api.github.com"
        const userData = await( 
                await fetch(`${apiUrl}/user`, {
                headers: {
                    Authorization: `token ${access_token}`
                },
            })
        ).json();
        console.log(userData);
        const emailData = await( 
                await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`
                },
            })
        ).json();
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        ); 
            ----> 깃헙이 주는 list에서 primary 이면서 verified된 email 객체를 찾아야한다. 

        if(!emailObj) {
            return res.redirect("/login"); 
        }
        const existingUser = await User.findOne({ email: emailObj.email });
            ---> 그리고 같은 email을 가진 user가 있다면 그 user를 로그인 시켜줄거다. 
        if(existingUser) {
            req.session.loggedIn = true;
            req.session.user = existingUser;
            return res.redirect("/");
        } else{
            //create am account
                ---> 해당 email로 User가 없으니 계정을 생성시켜야한다. 
        }
    } else {
        res.redirect("/login");
    }
};
******************************************************************************************************* 

아 그니깐 지금 하고있는건 회원가입안되어있는 사람도 그냥 로그인 하는게 아니라 
회원가입이 되어있는 사람이 동일 email로 깃헙에도 계정이 있다면 "깃헙으로 로그인"을 통해 로그인을 하는것 뿐이구나. 

존나 그냥 별거 아닌거하고있던거네..?

이제 "깃헙으로 로그인" 버튼 누르면 아마 로그인이 될것이다. 
왜냐하면 해당 email을 가지고있는 user가 이미 데이터베이스에 있고 깃헙이 API 에서 해당 email을 주기 때문이다. 
되었다. 아주 신기하군.

자 이제 "만일 계정이 없다면 어떻게 할것인가"에 대해 해볼거다. 
일단 회원가입 되어있는 user들을 지운다.  

User.js에 socailOnly 를 추가해준 이유는 user가 Github로 로그인했는지 여부를 알기 위해서다. 
이건 로그인 페이지에서 유저가 Email로 로그인하려는데 password가 없을 때 유용할 수 있다. 
깃헙을 이용해 계정을 만들었다면 password는 없을거다. 
그렇다면 Username과 passowrd form을 사용할 수 없다. 
그래서 나의 계정이 socailOnly = true 라는걸 알려줘야한다. 

******************************************************************************************************* 
(userController.js)

export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await(
        await fetch(finalUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
            }
        })
    ).json();
    
    if("access_token" in tokenRequest) {
        const { access_token } = tokenRequest;
        const apiUrl = "https://api.github.com"
        const userData = await( 
                await fetch(`${apiUrl}/user`, {
                headers: {
                    Authorization: `token ${access_token}`
                },
            })
        ).json();
        console.log(userData);
        const emailData = await( 
                await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`
                },
            })
        ).json();
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if(!emailObj) {
            return res.redirect("/login"); 
        }
        const existingUser = await User.findOne({ email: emailObj.email });
        if(existingUser) {
            req.session.loggedIn = true;
            req.session.user = existingUser;
            return res.redirect("/");
        } else {
            const user = await User.create({
                    --> 요기서 우리는 새로운 user를 생성한다. 
                name: userDate.name,
                username: userData.login,
                email: emailObj.email,
                password: "",
                socialOnly: true,
                location: userData.location,
                
            })  ---> User.create();는 새로만든 user를 return시켜준다. 
            req.session.loggedIn = true;
            req.session.user = existingUser; --> 그리고 우리는 이 user를 로그인 시켜줘야한다. 
            return res.redirect("/");
        }
    } else {
        res.redirect("/login");
    }
};
******************************************************************************************************* 


이건 다름 옵션인데 DB에 해당 email(깃헙에서 가져온)을 가진 user가 없을 때.
password 없이 깃헙의 데이터로 유저를 생성하고 그런 user에게는 socialOnly:true 값을 준다.
이건 이전에 했던 postLogin 에서도 유용하다. 
우리는 실제 DB에서의 password와 유저가 로그인시 시도한 password를 비교해볼텐데.(bcrypt .compare(password, user.password)) 
그러기 위해 일단 if else를 쓸것이다. 

user가 Github로 계정을 만들고 password로 로그인을 시도한다면 
난 user에게 "너는 깃헙로그인으로 계정만들었으니 깃헙로그인으로 로그인하삼" 이라고 말해줘야 하니까. 
아니면 뭐 password를 새로 생성하는 페이지를 만들던지. 그건 뭐 내맘.

아 근데 깃헙으로 계정 만들 때 password 없어서 못만든다고 하니까
User.js에서 일단 password: { required: false } 해주자. 

오케이 일단 DB엔 user가 없을테고 깃헙로그인으로 만든 user정보는 Github데이터로만 만들어져있을거다.
DB의 user data를 모두 지우고 "깃헙으로 로그인"을 하게되면 깃헙정보로만 이루어진 user 데이터가 DB에 생긴걸 확인 할 수 있다.

지금까지 한걸 정리하자면 
깃헙 프로필의 email이 데이터베이스에 있을 때 유저가 로그인 할 수 있게 만들어줬다. 
뭔말이냐면 깃헙이 주는 primary이면서 verified된 User의 Eamil을 쓰겠다는 거다. 

만일 찾았을 경우 그 email을 데이터베이스에서 찾을거다. 그리고 그 user를 들어오게 할거다. 
(로그인 시킨다는거다.)
그럼 누가 로그인 되느냐.
먼저 Github으로 계정을 만든 사람이거나 username과 Password로 계정을 만든 사람이 있는데 
두가지 모두 로그인이 가능하다.  왜냐하면 같은 email 이니까.

그래서 username과 Password로 계정을 만든 사람의 경우 Github을 통해서도 로그인이 가능하다는거다. 
왜냐하면 데이터베이스에있는 email과 Github에 있는 email이 같기 때문 
(이런식으로 유사하게 카카오톡을 이용해 로그인시키는 방법도 있겠지 카카오톡이 email을 return하면 내가 그 email을 찾고 
 해당되는 유저를 찾아서 로그인 시키는 거지.)

그저 User를 찾을 뿐이다. 어떤식으로 로그인헀는지는 관심없다.  
어떤식으로 계정을 만들었는지도 관심없고. Github이 준것과 똑같은 email을 찾게되면 
해당 user를 로그인 시킬거다. 
DB에 Github email을 가진 user가 없다면 새로운 계정을 만들어서 그 user를 로그인 시킬거다. 

근디 우리가 schema에 살짝 추가해준게 있는데 바로 socialOnly다. 
이 socialOnly는 우리에게 해당 계정을 password로 로그인할 수 없다는것을 알려줄거다. 
이건 오직 소셜 로그인으로만 로그인 할 수 있다는 소리다. 

그래서 우리가 무얼 해볼수가 있냐면 postLogin에서(username과 password 사용하려 로그인하는 컨트롤러)
username을 가진 유저를 찾을 때 socialOnly가 false인 유저만 찾게 만들 수 있다. 

******************************************************************************************************* 
(userController.js) 

export const postLogin = async (req, res)  => {
    const { username, password } = req.body;
    const pageTitle = "Login";                      
    const user = await User.findOne({ username, socialOnly: false }); <- socialOnly 조건으로 추가 쏘팅
    if(!user) {                                    
        res.render("login", { 
            pageTitle,
            errorMessage: "An account with this username does not exists."
        });
    }
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) {
        res.render("login", { 
            pageTitle,
            errorMessage: "Wrong Password"
        });
    }
    req.session.loggedIn = true; 
    req.session.user = user;
    res.redirect("/");
}
******************************************************************************************************* 

즉, postLogin에서 form에 입력한 username을 가지고 socialOnly가 false인 user를 찾는거다. 
왜냐하면 몇몇 사람들은 Github로 로그인 했는지 password를 통해 로그인했는지 잊어버리기 때문이다. 

그래서 User.create({}) 를 통해서 Github 데이터를 거지고 user를 생성하고 그 user를 로그인 시킨거다. 

근데 아래의 코드는 중복이 있으니 수정이 가능하다. 이런 중복을 없애는것에 신경을 많이 써야한다. 
******************************************************************************************************* 
(userController.js)

-. 수정전 
const existingUser = await User.findOne({ email: emailObj.email });
        if(existingUser) {
            req.session.loggedIn = true;
            req.session.user = existingUser;
            return res.redirect("/");
        } else {
            const user = await User.create({
                name: userData.name,
                username: userData.login,
                email: emailObj.email,
                password: "",
                socialOnly: true,
                location: userData.location,
            })  
            req.session.loggedIn = true;
            req.session.user = user;
            return res.redirect("/");
        }

-. 수정후
        let user = await User.findOne({ email: emailObj.email });
        if(!user) {
            user = await User.create({
                name: userData.name,
                username: userData.login,
                email: emailObj.email,
                password: "",
                socialOnly: true,
                location: userData.location,
            })  
        } 
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
******************************************************************************************************* 

아무튼 이렇게 user를 찾게되고 이 user를 찾게되면(기존에 DB에 이 email이 있으면)
user를 그냥 바로 로그인 시키는거다.
만일 user를 못찾았다면 user를 새로 만든 user로 정의하는거다. 

로그인은 이제 끗.


# Avatar URL
깃헙에서 가져오는 데이터는 굉장히 중요한 것이다. 
그러니 avatar_url을 저장해 볼 수도 있겠지...? 아니이 씨발놈은 진짜 양키새끼 말의 맥락이 없어
왜냐하면 우리는 이제 avatar와 파일들에 대해 다뤄볼거다. 

그래서 일단 이 avatar_url을 schema에 추가할거다, 
******************************************************************************************************* 
(User.js)
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    avataUrl: String,       <---추가유
    socialOnly: { type: Boolean, default: false },
    username: { type: String, required: true, unique: true },
    password: { type: String},
    name: { type: String, required: true },
    location: String
})
******************************************************************************************************* 

이 avata_url 은 굉장히 유용하다. 
왜냐면 우리는 user들이 avatar를 가지고 있기 원하기 때문이다. 

만일 user가 Github으로 부터 넘어왔다면 한가지를 더 추가해볼건데 
그게 바로 avatar_url이다.  

Github으로 받은 모든 user객체들은 모두 userData로 부터 온다. 
******************************************************************************************************* 
(userController.js)

let user = await User.findOne({ email: emailObj.email });
        if(!user) {
            user = await User.create({
                avatarUrl: userData.avatar_url,  <--- 이거 추가해준다는 말이다. 
                name: userData.name,
                username: userData.login,
                email: emailObj.email,
                password: "",
                socialOnly: true,
                location: userData.location,
            })  
        } 
    }
******************************************************************************************************* 

자 이제 user는 avatarUrl 을 가지게 되었다. 
이게 없는 user는 email과 password로만 계정을 만들었단 소리다. 


# Log out

******************************************************************************************************* 
(userController.js)

export const logout = (req, res) => {
    req.session.destroy(); <-- 세션만 그냥 다 박살내주면 도지롱 개쉽쥬
    res.redirect("/");
}  
******************************************************************************************************* 





# Edit Profile GET 

유저의 Profile 을 수정해보자. 
우린 이미 edit이라는 라우터와 컨트롤러를 만들어놨는데 
이전에 했던거처럼 GET, POST 방식을 통해서 이 profile을 수정할거다. 

1. 라우터와 컨트롤러 만들기  
 ->일단 getEdit, postEdit Contorller를 만들어서 export 한 후 라우터에서 import 해주자. 
******************************************************************************************************* 
(userController.js) 

export const getEdit = (req, res) => {
    return res.render("edit-profile", { pageTitle: "Edit Profile" });
}
export const postEdit = (req, res) => {
    return res.render("edit-profile");
}

(userRouter.js)

import express from "express"; 
import { getEdit,
         postEdit,
         logout, 
         see, 
         startGithubLogin, 
         finishGithubLogin, 
} from "../controllers/userController";

const userRouter = express.Router();

userRouter.get("/logout", logout);
userRouter.route("/edit").get(getEdit).post(postEdit);
userRouter.get("/github/start", startGithubLogin);
userRouter.get("/github/finish", finishGithubLogin);
userRouter.get("/:id", see);

export default userRouter;
******************************************************************************************************* 

2. /edit URL 에 접근 

일단 홈페이지에 edit 링크를 만들어주자. 사용자가 로그인되어있는 경우만 edit profile을 할 수 있다.(당연하쥬?)
******************************************************************************************************* 
(base.pug)
doctype html 
html(lang="ko")
    head 
        title #{pageTitle} | #{siteName} 
        link(rel="stylesheet" href="https://unpkg.com/mvp.css")
    body 
        header
            h1=pageTitle 
            nav 
                ul  
                    li 
                        a(href="/") Home
                    if loggedIn
                        li 
                            a(href="/users/edit") Edit Profile  <- 요기 요기 만들어준겨! 
                        li    
                            a(href="/users/logout") Log out
                    else
                        li    
                            a(href="/join") Join
                        li    
                            a(href="/login") Login
                    li  
                        a(href="/search") Search
                    li 
                        a(href="/videos/upload") Upload Video
        main 
            block content 
    include partials/footer.pug
*******************************************************************************************************             
base.pug에서의 loggedIn 이  localsMiddleware에서 온 변수라는걸 잊지 말자. 

자 이제 edit-profile.pug를 만들자. 
참고로 form을 쓸 때 action을 입력 안하면, 브라우저는 같은 현재의 URL 에 post request 를 보내는걸 안다. 
일단 name, email, username. location을 바꾸게 만들어 보자. 

*******************************************************************************************************        
(edit-profile.pug)
extends base

block content 
    form(method="POST")
        input(placeholder="Name", name="name", type="text", required)
        input(placeholder="Email", name="email", type="email", required)
        input(placeholder="Username", name="username", type="text", required)
        input(placeholder="Location", name="location", type="text", required)
        input(type="submit", value="Update Profile")
*******************************************************************************************************        

자 이렇게 하면 edit-profile 들어갔을때 수정할 값을 넣을수있는 페이지가 나온다. 
근데 입력란이 그냥 비어있는게 아니라 원래의 값이 들어가있으면 좋을거같다. 
(eidt Video에서 했던것과 비슷)
그러니 이 edit-pforile.pug templete으로 user object를 가져와 보자. 

물론 getEdit Controller에서 req.session.user 의 data를 보내줘도 된다. 
근데 우리는 이미 middelware.js가 있다. 
그안의 "res.locals.loggedInUser = req.session.user" 요기서 locals 에 넣어준게 있기 땜누에 
이 middleware 에서 현재 로그인 된 사용자를 알려준다. 
그러니 userController에 뭐 user 정보를 건내줄 필요가 없다. 
이미 locals 를 통해서 loggedInUser를 사용할 수 있다. 
(locals는 자동적으로 views로 import 됨.)
그러니 그냥 loggedInUser 쓰면 됨. 

기억해야할 점은 loggedInUser 도 user 다. 
그 말은 user model에 있는 모든 걸 templete 에서 사용이 가능하다는거다. 
우리가 만든 locals Middleware 덕분에 가능한 일이다. 
아래처럼 input 태그에 value 값으로 loclas 에 있는 값을 넣어주면 된다. 
*******************************************************************************************************        
(edit-profile.pug) 
extends base

block content 
    form(method="POST")
        input(placeholder="Name", name="name", type="text", required, value=loggedInUser.name)
        input(placeholder="Email", name="email", type="email", required, value=loggedInUser.email)
        input(placeholder="Username", name="username", type="text", required, value=loggedInUser.username)
        input(placeholder="Location", name="location", type="text", required, value=loggedInUser.location)
        input(type="submit", value="Update Profile")
*******************************************************************************************************        

만약 누군가가 로그인 되지 않은 상태로 저기 edit-profile page로 들어가면 어떻게 될까? 
에러 난다. 
undefined 의 property중 name을 읽을수 없다는 에러가 
    -> 이건 그냥 간단히 해결 가능
        middleware.js 에서 loggedInUser는 req.session.user인데 이게 undefined 일수있다. 
        왜냐면 req.session.user 가 비어있을수있자나 그러니 비어있는경우도 추가해주자.
        아래처럼 추가만 해주면 이제 누구든 우리의 edit-profile 페이지에 접근할 수 있다.(로그인이 안되어있는데도 말이다.)
*******************************************************************************************************        
(middleware.js)
        export const localsMiddleware = (req, res, next) => {
            res.locals.loggedIn = Boolean(req.session.loggedIn);
            res.locals.siteName = "Wetube";
            res.locals.loggedInUser = req.session.user; || {};  <- 요기다. 
            console.log(res.locals);
            next();
        }
*******************************************************************************************************        

자 지금 2가지 에러가 있다.
@ loggednInUser에 접근하려는데 로그인이 되어있지 않으면 생기는 에러 
@  로그인이 안되어있는데 eidt profile에 오게 되는 에러(URL을 직접 이용하여)


# Protector and Public Middlewares 

우리가 원하는건 로그인하지 않은 사람들이, 우리가 보호하려는 페이지에 가는걸 막는거다. 
그걸 위해서 protectoriddleware를 만들거다. 
이 ProtectorMiddleware는 사용자가 로그인되어있지 않은걸 확인하면, 로그인 페이지로 redirect 하게 할거다.
사용자가 로그인돼 있다면 request를 계속 하도록 할거고. 

그럼 이 controleer 에서는 user를 어떻게 찾을까 
정답은 request에 있다. 

만약 req.session.loggedIn 이 true 라면 (user가 로그인되어있다면)
  -> session에 저장되어있다면 어느 controller나 middleware에서도 사용할 수있다. 
next()함수를 호출하는거다. 이게다임 
만약 user가 로그인되어있지 않다면 로그인 페이지로 redirect할거다. 

*******************************************************************************************************        
(middleware.js)

export const protectorMiddleware = (req, res, next) => {
    if(req.session.loggedIn) {
        next();
    } else {
        return res.redirect("/login");
    }
}
*******************************************************************************************************        

로그인 돼 있지 않은 사람들만 접근할 수 있게하는 Middleware도 만들어보자. 
예를들어, 내가 로그인 되어있는 상태인데 다시 로그인 페이지로 가면 안되니까. 
이름은 publicOnlyMiddleware 로 한다. 
protectorMiddleware랑 완전 반대다. 
loggedIn 되어있지 않다면 next()함수를 호출한다. 
만약 loggedIn 되어있다면 '/'로 redirect 한다.

*******************************************************************************************************        
(middleware.js)

export const publicOnlyMiddleware = (req, res, next) => {
    if(!req.session.loggedIn) {
        return next();
    } else {
        res.redirect("/")
    }
}
*******************************************************************************************************        

자 이제 이걸 로그인 페이지에 적용해보자. 
userRouter에 있는 로그인페이지에서 로그인 되어있는 사람들만 로그아웃 페이지로 갈 수 있어야한다. 
그러니 아래처럼 logout으로 가게해주는 라우터에 protectorMiddleware를 추가해준다.(edit도 마찬가지) 


*******************************************************************************************************        
(userRouter.js)

userRouter.get("/logout", protectorMiddleware ,logout);
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
            -> 위의 edit에서 alldl 아주 유용한거임 get, poset등 어떤 http methode를 사용하든지 이 middleware를 사용한다는거다. 
            -> 아 물론 가장 먼저 써줘야한다. 먼저 적용이 되는거다. 
*******************************************************************************************************        

자 이제 startGithubLogin 이나 finishGithubLogin을 사용하려면 publicOnlyMiddleware를 적용해야한다. 
publicOnlyMiddleware는 로그아웃 돼 있어야 실행시키는걸 허락해주니까 로그인 되어있으면 해당 라우트로 올 수 없게 보호해주는거다. 

*******************************************************************************************************        
(userRouter.js)

userRouter.get("/github/start", publicOnlyMiddleware,startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware,finishGithubLogin);
*******************************************************************************************************        

publicOnlyMiddleware, protectorMiddleware로 우리의 URL 구조는 더욱 견고해졌다. 
이제 이 미들웨어들을 곳곳의 라우터들에게 다 적용시키면 된다. 뭐 예를들어 홈페이지는 누가나 오는거니까 안해도 되고  
/login, /join은 로그아웃된 사람만 갈수있고 뭐 이런거  

edit-profile 마무리 
edit-profile.pug 에서 user가 post request를 보내면 body를 받을 수 있다. 
그 받은걸 가지고 mongo를 사용해서 user를 찾아서 업데이트 해주어야한다. 
일단 user modeil이 있는걸 확인하고
 -> 최상단 User 확인 왜냐하면 우리는 저 User model을 통해서(mongo를 통해서) findById 뭐 이런걸 할 수 있는거니까. 

 *******************************************************************************************************       
 (userController.js)
  
 export const postEdit = async (req, res) => {              <- 밑에 await 쓰니까 async 넣어주고 
    const { name, email, username, location } = req.body;
        -> 이거는 아래처럼 id를 가져오는것과 한번에 묶을수가 있다. 
    const {
        session: {
            user: { id },
        },
        body: { name, email, username, location }
    } = req;
        -> 여기서 현재 로그인된 user의 id를 얻을 수 있다. req.session.user에서 왜냐면 우리가 user object를 넣었으니까. 
        -> const id = req.session.user.id 를 가져오면서 위의 name, email.. 등등을 동시에 가져올수도 있다.

    await User.findByIdAndUpdate(id, {
        name,
        email,
        username,
        location,       <- 요것들은 form에서 가져온것들이다.
    });
    return res.render("edit-profile");
}
*******************************************************************************************************        

자 위처럼 컨트롤러를 작성해주면 우리는 form으로부터 name, email, username, location을 받았다. 
(이정보들은 form으로부터 시작된 req.body로부터 받은것)
그리고 우리는 로그인된 user의 정보를 업데이트 하고 싶다.
그리고 이 edit페이지에서는 user가 누군지 물어보지 않는다. 
URL 로 부터 id를 받고 있는게 아니다. 
user id를 가지고있는 session으로부터 받은거다. 

그래서 findByIdAndUpdate 함수를 쓸 때 첫번쨰 argument는 id다. 
두번쨰는 UpdateQuery(update할 항목들) 다.

callback함수를 사용할 수 있지만 우리는 await를 사용한다. 아무리생각해도 이게 훨씬 간편하다. 

이제 Edit Users Profile 끗. 
인줄 알았찌만 안되지. 
email 주소를 변경했는데 화면에 나오는 email 주소가 그대로네?
왤까? 
왜냐면 User가 id를 안가지고 있을수도 있기 때문이다. 
 
와...req.session에 들어있는건 id가 아니라 _id 였다...

근데 이렇게 해도 화면상 보이는  email은 변경이 되지 않는다. 
그래서 DB를 확인해보니 또 DB에는 잘 변경이 되어있다. 
왤까?

우리는 edit-profile.pug에서 loggedInUser의 값을 input의 value로 지정해주었다.
근디 loggedInUser가 언제 생성된거냐면 localsMiddleware에서 생성된다. 
그리고 localsMiddleware에서 loggedInuser를 req.session.user 에서 받아온다. 
근디 req.session.user 는 로그인 할 때 DB에서 받아온다. 

그러니 DB는 업데이트 되었는데 아직 session은 업데이트가 안된거다. 
새로 로그인한게 아니니 session에있는 데이터는 구버전의 DB 로 부터 받아온거니까. 
session은 DB와 연결돼 있지 않다. 

그냥 req.session.user = 에 직접 넣어주는 방법도 있지만 이건 그닥 보기좋지않다. 
그리고 뭐 avatarUrl, socialOnly 등등 뭐 더 넣어주는것도 있어서 번거롭다. 
일단 아래처럼 하면 되긴 함.
*******************************************************************************************************        
(userController.js)

export const postEdit = async (req, res) => { 
    const {
        session: {
            user: { _id },
        },
        body: { name, email, username, location }
    } = req;

    await User.findByIdAndUpdate(_id, {
        name,
        email,
        username,
        location,
    });
    req.session.user = {
        ...req.session.user,  <- 기존에 있던 req.session.user에 있는 데이터를 다 넣어준다는 의미 
        name,
        email,
        username,
        location,
    }
    return res.render("edit-profile");
}
*******************************************************************************************************        
위처럼 해주면 DB랑 req.session을 똑같이 유지할수는 있다. 

 