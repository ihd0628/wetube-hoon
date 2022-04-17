import multer from "multer"
import User from "./models/User"

기본적으로 findByIdAndUpdate는 update되기 전의 데이터를 return 해주고 
new: true를 설정해주면 findByIdAndUpdate가 업데이트된 데이터를 return해준다. 
    ->무슨 뜻이냐면, mongoose한테 가장 최근에 업데이트된 Object를 원한다고 말하는거다. 

****************************************************************************************************************
(userController.js)

export const postEdit = async (req, res) => { 
    const {
        session: {
            user: { _id },
        },
        body: { name, email, username, location }
    } = req;

    const updatedUser = await User.findByIdAndUpdate( <- update된 정보를 return해서 updatedUser에 넣어주고
        _id, {
        name,
        email,
        username,   
        location,
    },{ new: true }
    );
    req.sesion.user = updatedUser; <- 고걸 다시 session 에 넣어준다. 
    return res.redirect("/users/edit");
}
****************************************************************************************************************

findByIdAndUpdate는 3개의 인자를 가지고 있다. 
1. 업데이트하려는 user의 id 
2. 업데이트하려는 정보(object)
3. options 
 
암튼 뭐 이렇게하면 일일히 업데이트 해주는것보다는 편한거 같다. 

자 그런데 문제가 있다. 
만약 username을 바꾸려는데 이미 있는 username이거나 
email을 바꾸려는데 이미 있는 email이면 어떻게 해야하나?
내가 알아서 해보자 

기존 join에서 했던 exist 방식을 사용하면 둘다 바꾸지 않는다면 항상 true가 될거다. 
왜냐면 둘중에 하나만 같아도 true를 돌려줄것이기 때문

그래서 아래처럼 헀지롱 
****************************************************************************************************************
(userController/js)

export const postEdit = async (req, res) => { 
    const {
        session: {
            user: { _id },
        },
        body: { name, email, username, location }
    } = req;
    const usernameExist = await User.exists( { username }) 
    const emailExist = await User.exists({ email }) 
    const compareUsername = (username === req.session.user.username);
    const compareEmail = (email === req.session.user.email);
    
    const ok = (!usernameExist || compareUsername) 
                && (!emailExist || compareEmail);

    if(!ok) {
        return res.render("edit-profile", {
            pageTitle: "Edit Profile",
            errorMessage: "This username or email is already taken."
        });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
        _id, 
        {
        name,
        email,
        username,
        location,
        },
        { new: true }
    );
    req.session.user = updatedUser;
    
    return res.redirect("/users/edit");
}
****************************************************************************************************************


# Change Password Part One

일단 비번 변경 페이지로 가기 위한 링크를 만들어준다.

****************************************************************************************************************
(eidt-profile.pug)

extends base

block content 
    if errorMessage 
        span=errorMessage
    form(method="POST")
        input(placeholder="Name", name="name", type="text", required, value=loggedInUser.name) 
        input(placeholder="Email", name="email", type="email", required, value=loggedInUser.email)
        input(placeholder="Username", name="username", type="text", required, value=loggedInUser.username)
        input(placeholder="Location", name="location", type="text", required, value=loggedInUser.location)
        input(type="submit", value="Update Profile")
        hr 
        a(href="chang-password") Change Password $rarr;
        -> 절대 URL (/로 시작) 이 아니라 상대 URL 사용, 맨마지막 /edit 부분만 바꿔서 가는겨 
        -> a(href="/users/change-password") 이거랑 같은거다 
****************************************************************************************************************

하지만 change-password URL은 없기 때문에 작동하지 않는다. 
이제 해당 URL 템플릿, 컨트롤러등 뭐 이것저것 똑같이 하던거 만들어보자. 

일단 간단하게 컨트롤러 만들고 
****************************************************************************************************************
(userController.js) 

export const getChangePassword = (req, res ,next) => {
    return res.render("change-password", { pageTitle: "Change Password" });    
};
export const postChangePassword = (req, res, next) => {
    // send notification 
    return res.redirect("/");
};
****************************************************************************************************************

이제 라우터 만드는데 
전부 protectorMiddleware로 보호하는걸 잊지 말자. 
****************************************************************************************************************
(userRouter.js)

userRouter
    .route("/change-password")
    .all(protectorMiddleware)
    .get(getChangePassword)
    .post(postChangePassword);
****************************************************************************************************************

이제 템플릿 만들자
****************************************************************************************************************
(change-password.pug)

extends base 

block content
    form(method="POST")
        input(placeholder="Old Password")
        input(placeholder="New Password")
        input(placeholder="New Password Confirmation")
        input(value="Chage Password", type="submit")
****************************************************************************************************************

그런데 문제가 하나있다. 
바로 깃헙을 통해 계정을 만든 경우에는 비밀번호 변경을 볼수 없어야 한다는 거다. 

두가지 옵션이 있다. 

하나는 userController의 getChangePassword에서 로그인된 사용자의 정보를 확인하는거다. 
아래처럼 하면 됨. 
깃헙 로그인한 사람이면 그냥 홈으로 돌려버리는거다. 
****************************************************************************************************************
(userController.js)

export const getChangePassword = (req, res ,next) => {
    if(req.session.user.socialOnly === true) {
        return res.redirect("/");
    };
    return res.render("change-password", { pageTitle: "Change Password" });    
};
****************************************************************************************************************

그리고 그냥 깃헙으로 로그인 한 사람한테는 edit-profile에서 change-Password 링크가 아예 안보이게 하는게 좋겠다. 
아래처럼 템플릿 수정 
****************************************************************************************************************
(edit-profile.pug)

extends base

block content 
    if errorMessage 
        span=errorMessage
    form(method="POST")
        input(placeholder="Name", name="name", type="text", required, value=loggedInUser.name) 
        input(placeholder="Email", name="email", type="email", required, value=loggedInUser.email)
        input(placeholder="Username", name="username", type="text", required, value=loggedInUser.username)
        input(placeholder="Location", name="location", type="text", required, value=loggedInUser.location)
        input(type="submit", value="Update Profile")
        if !loggedInUser.socialOnly
            hr 
            a(href="change-password") Change Password &rarr;
****************************************************************************************************************        

이렇게 하면 깃헙로그인한 사람은 아예 패스워드변경 링크가 안뜨고 
혹시 URL 로 접근한다고 해도 접근할수없이 그냥 home 으로 redirect 되게 된다. 



# Change Password Part two 

이제 다시 password 변경하는 form으로 돌아가서 
session에서 현재 로그인 된 사용자를 확인하고, form에서 정보를 가져오자. 
form에서는 사용자에게 누구냐고 묻지 않는다. 
사람들이 거짓말을 할 수 도 있고 사람들이 다른 사용자의 정보를 변경할 수 없어야하기 때문이다. 

****************************************************************************************************************        
(userController.js)

export const postChangePassword = (req, res, next) => {
    // send notification 
    const {
        session: {
            user: { _id },
        },
        body: { oldPassword, newPassword, newPasswordConfirmation }
    } = req;
    return res.redirect("/");
};
****************************************************************************************************************        

자 이제 실제 이 _id 를 가진 사용자가 존재하는지 확인하고 
그리고 비밀번호를 변경하면 된다. 
그리고 물론 async, await를 사용할거다. 

비밀번호 변경은 일단 newPassword와 newPasswordConfirmation이 일치하는지 확인하고 
서로 다르면 다르다고 메세지를 띄워주게 하자. 

자 근디 비밀번호랑 확인용 비번이랑 틀려도 브라우저는 틀린줄도 모르고 
비번 저장하냐고 물어보니 status code를 변경해줘서 이게 문제가 있다는걸 알려줘야한다. 

****************************************************************************************************************        
(userController.js)
export const postChangePassword = (req, res, next) => {
    // send notification 
    const {
        session: {
            user: { _id },
        },
        body: { oldPassword, newPassword, newPasswordConfirmation }
    } = req;
    if(newPassword !== newPasswordConfirmation) {
        return res.status(400).render("change-password", {    <- 여기서 status code를 통해 문제가 있음을 알려준다. 
            pageTitle: "Change Password",
            errorMessage: "The password does not match the confirmation", 
         })
    }
    return res.redirect("/");
};

(change-password.pug)
extends base 

block content
    if errorMessage                     <- 요기 요부분 추가 
        span=errorMessage 
    form(method="POST")
        input(placeholder="Old Password", type="password", name="oldPassword")
        input(placeholder="New Password", type="password", name="newPassword")
        input(placeholder="New Password Confirmation", type="password", name="newPasswordConfirmation")
        input(value="Chage Password", type="submit")
****************************************************************************************************************        

그다음에는 기존 비밀번호가 일치하는건지 확인해준다. 
****************************************************************************************************************        
(userController.js)

export const postChangePassword = async (req, res, next) => {      <- async 추가해주고 
    // send notification 
    const {
        session: {
            user: { _id, password },                                    <- 여기서 비빌번호 받아주고 
        },
        body: { oldPassword, newPassword, newPasswordConfirmation }
    } = req;
    const ok = await bcrypt.compare(oldPassword, password);             <- 여기서 비밀번호 맞는지 확인해준다. 
    if(!ok) {
        return res.status(400).render("change-password", { 
            pageTitle: "Change Password",
            errorMessage: "The current password is incorrect", 
         })
    }
    if(newPassword !== newPasswordConfirmation) {
        return res.status(400).render("change-password", { 
            pageTitle: "Change Password",
            errorMessage: "The password does not match the confirmation", 
         })
    }
    return res.redirect("/");
};
****************************************************************************************************************        

그다음에 비밀번호를 변경해주면 되는데 
소소한 이슈가 있다. 
우리의 비밀번호는 User.js에서 아래의 저 부분에 저장을 하는데 
****************************************************************************************************************        
(User.js)
userSchema.pre("save", async function () {                      <- 저 함수
    this.password = await bcrypt.hash(this.password, 5) 
})
****************************************************************************************************************        

비밀번호를 보내고 저장하면 저 함수가 비밀번호를 hash 해준다. 

저 함수를 작동 시키는 두가지 방법이 있다. 

하나는,  pre save middleware를 거치고 User.create를 사용하는거다. 
즉, pre save middleware가 비밀번호를 hash 해주는거다. 

다른 하나는 user.save()를 해도 pre save middleware를 작동시킨다. 
하지만 우리는 아직 user가 없다. 
그러니 우리는 user를 찾아야한다. 
하지만 우리는 이미 세션에서 받아온 _id 를 통해 user 누군지는 이미 안다. 

그러니 save()함수를 쓰기 위해서 session 에서 로그인된 user를 찾아와야한다. 
그 유저를 찾으면 save()함수를 쓸 수 있다. 

****************************************************************************************************************        
(userController.js)

export const postChangePassword = async (req, res, next) => {
    // send notification 
    const {
        session: {
            user: { _id, password },
        },
        body: { oldPassword, newPassword, newPasswordConfirmation }
    } = req;
    const ok = await bcrypt.compare(oldPassword, password);
    if(!ok) {
        return res.status(400).render("change-password", { 
            pageTitle: "Change Password",
            errorMessage: "The current password is incorrect", 
         })
    }
    if(newPassword !== newPasswordConfirmation) {
        return res.status(400).render("change-password", { 
            pageTitle: "Change Password",
            errorMessage: "The password does not match the confirmation", 
         })
    }
    const user = await User.findById(_id);         <- 여기서 user 찾아주고 
    user.password = newPassword;                            <- 변경한 비밀번호 넣어주고 
    await user.save();                                               <- 저장 
    return res.redirect("/");
};
****************************************************************************************************************        

user.save()를 하면, pre.save가 작동한다. 
이걸 작동시키려는 이유는, 새로운 비밀번호를 hash하기 위함이다. 

자 그럼 사용자가 비밀번호를 바꿧을 때 다시 로그인 시키기위해 비밀번호르 바꾸면 
로그아웃 시키는 기능을 추가해본다.

하지만 그전에 우리는 변경한 비밀번호를 DB에만 저장하고 session에는 저장하지 않았다. 
까먹지 말자. 

우리는 이 컨트롤러에서 session에 있는 hash된 비밀번호가 기존 비밀번호와 일치하는지 확인하고있다. 
그래서 session을 업데이트 해줘야한다. 

****************************************************************************************************************        
export const postChangePassword = async (req, res, next) => {
    // send notification 
    const {
        session: {
            user: { _id, password },
        },
        body: { oldPassword, newPassword, newPasswordConfirmation }
    } = req;
    const ok = await bcrypt.compare(oldPassword, password);
    if(!ok) {
        return res.status(400).render("change-password", { 
            pageTitle: "Change Password",
            errorMessage: "The current password is incorrect", 
         })
    }
    if(newPassword !== newPasswordConfirmation) {
        return res.status(400).render("change-password", { 
            pageTitle: "Change Password",
            errorMessage: "The password does not match the confirmation", 
         })
    }
    const user = await User.findById(_id);         
    user.password = newPassword;                            
    await user.save();                                
    req.session.user.password = user.password;  <- req.session.user.password에는 hash된게 들어있어야한다.
    return res.redirect("/users/logout");
};
****************************************************************************************************************        

우리는 DB와 session 두개의 저장소를 사용하고 있다. 
session에서 정보를 받으면,  업데이트도 해줘야한다. 

우리는 form에서 가져온 비밀번호랑, 현재 로그인된 사용자의 비밀번호를 비교하고 있다. 
그러니 Session을 업데이트 해줘야 한다. 

만약에 세션에 업데이트를 안해주면 비밀번호 변경하고 로그아웃안하고 다시 비밀번호 변경하려고 들어가면 변경하기전 아예 맨처음의 비밀번호가
비번인줄알고 현재 비번을 변경한 후 의 비번을 아무리 입력해도 비번이 틀리다고 나온다. 


# File Upload Part One

파일 업로드를 어떻게 하는가 

step#1

일단 로그인 해야함. 그리고 파일을 업로드할 input을 만들어야함.
로그인하고 edit-profile 페이지에 파일업로드할 수 있는 html을 생성. 
label은 아주 기본적인 html tag 이다. 

/*
-. label tag의 정의 및 특징 
<label> 태그는 사용자 인터페이스(UI) 요소의 라벨(label)을 정의할 때 사용합니다.

<label> 요소는 for 속성을 사용하여 다른 요소와 결합할 수 있으며, 이때 <label> 요소의 for 속성값은 결합하고자 하는 요소의 id 속성값과 같아야 합니다. 또한, <label> 요소를 결합하고자 하는 요소 내부에 위치시키면 for 속성을 사용하지 않더라도 해당 요소와 결합시킬 수 있습니다.

이러한 <label> 요소는 브라우저에 의해 일반적인 텍스트로 랜더링되지만, 사용자가 마우스로 해당 텍스트를 클릭할 경우 <label> 요소와 연결된 요소를 곧바로 선택할 수 있어 사용자의 편의성을 높일 수 있습니다.

<label> 요소를 사용할 수 있는 요소는 다음과 같습니다.
- <button>, <input>, <meter>, <output>, <progress>, <select>, <textarea></textarea>
</select>
*/
****************************************************************************************************************        
(edit-profile.pug)

extends base

block content 
    if errorMessage 
        span=errorMessage
    form(method="POST")
        label(for="avatar") Avatar                         <- 요기 label을 클릭하면 내 아바타를 선택할 수 있는 파일불러오기 창이 뜬다. 
        input(type="file", id="avatar", name="avatar", accept="image/*")      <- form에서 데이터를 보내주는거안에있으니 당연히 name이 있어야 한다. 
        input(placeholder="Name", name="name", type="text", required, value=loggedInUser.name) 
        input(placeholder="Email", name="email", type="email", required, value=loggedInUser.email)
        input(placeholder="Username", name="username", type="text", required, value=loggedInUser.username)
        input(placeholder="Location", name="location", type="text", required, value=loggedInUser.location)
        input(type="submit", value="Update Profile")
        if !loggedInUser.socialOnly
            hr 
            a(href="change-password") Change Password &rarr;
****************************************************************************************************************        
위에처럼 템플릿을 작성하고 나면 사용자가 파일을 선택할 수 있는데 
문제는 내가 pdf 같은 파일을 선택할 수 있다는거다. 좋지 않다. 
그러니 모든 이미지파일만 받아들인다고 설정해놓을수 있다. (accept="image/*")

step#2

우리를 도와줄 middleware를 사용해야한다. 
multer라는 middelware가 있다. 
multer는 우리가 파일을 업로드 할 수 있게 해준다. 
늘 그랫듯 
$ npm i multer 
를 통해서 다운로드 받는다. 

multer를 어떻게 사용해야할까 
https://kasterra.github.io/what-is-multipart-form-data/ <- 요기서 설명 참고 
1. 일단 form을 multipart form으로 만들어야한다. 

왜냐면 multer 설명란에 "multipart가 아닌 form은 처리하지 않습니다." 라고 적혀있다. 
form에 enctype="multipart/form-data" 을 추가해준다는건 무슨 의미냐면 
해당 form이 다르게 encode될 거란 의미다. 
그게 다임. 
enctype="multipart/form-data" 이게 파일을 업로드하기 위한 유일한 조건이다. 
form을 enctype="multipart/form-data" 로 만들어줘야 한다. 
이게 파일을 백엔드로 보내기 위해 필요한 encoding type(=enctype) 이다. 
****************************************************************************************************************        
(edit-profile.pug)

extends base

block content 
    if errorMessage 
        span=errorMessage
    form(method="POST", enctype="multipart/form-data")      <- 요기다가 multipart form인걸 적어주어야한다. 
        label(for="avatar") Avatar 
        input(type="file", id="avatar", name="avatar", accept="image/*")
        input(placeholder="Name", name="name", type="text", required, value=loggedInUser.name) 
        input(placeholder="Email", name="email", type="email", required, value=loggedInUser.email)
        input(placeholder="Username", name="username", type="text", required, value=loggedInUser.username)
        input(placeholder="Location", name="location", type="text", required, value=loggedInUser.location)
        input(type="submit", value="Update Profile")
        if !loggedInUser.socialOnly
            hr 
            a(href="change-password") Change Password &rarr;
        
****************************************************************************************************************        

2. middleware를 만들어줘야한다. 

ex) multer middleware 설명란에 적혀있는 예시 
var upload = multer({ dest: 'upload/' }) 
var app = express() 
app.post('/profile', upload.single('avatar'), (req, res, next) => blabla)

설정과 함께 multer 함수를 사용해서 middleware를 만들고 route에서 사용하는거다. 
음.. 뭔소린지 모르겠지만 일단 만들어 본다. 

일단 우리의 middleware 파일에 가서 함수를 하나 만드는데 여기는 req, res, next가 쓰이지 않고 
multer()를 먼저 쓰고 설정을 해준다. 
multer에는 configuration object가 있다. 
거기엔 여러가지 요소가 있는데 그중 하나가 dest(=destination) 이다. 
파일을 어디에 보낼지 정하는거다. 
이게 무슨뜻이냐면, 사용자가 파일을 보내면 그러니까 사용자로부터 파일을 받으면, 그 파일을 어딘가에 넣어야 한다. 
예를들면 하드드라이브같은 뭐 그런 곳. 
나중에는 이게 왜 좋은지 배우고, 다른 곳에 저장시킬거다. 
일단은, 파일들을 내 콤퓨타의 하드드라이브에 저장해야 된다고 해보자. 
우리는 upload라는 폴더를 하나 만들고 그리고 multer에게 사용자가 업로드하는 모든 파일들을 우리 서버의 upload 폴더에 저장하라고 하는거다. 
그 폴더 지정은 ({ dest: "uploads/" }) <- 요 구문을 통해서 해줄수있다.


****************************************************************************************************************        
(middleware.js)
import multer from "multer"
import Video from "./models/Video"
import videoRouter from "./routers/videoRouter"
import { watch } from "./controllers/videoController"
import { Mongoose } from "mongoose"
     <- 요거 잊지 맙시다. 

export const uploadFiles = multer({ dest: "uploads/" })
****************************************************************************************************************        

자 이제 요렇게 하면 우리는 사용자가 보낸 파일을 uploads 폴더에 저장하도록 설정된 middleware가 하나 생겼다. 
근디 아직 그 폴더가 없으니 만들어주고 

이제 이 미들웨어를 route에 사용할 거다. controller에 사용하지는 않는다! 
이 미들웨어는 eidt-profile에서 사용하는 거니까 userRouter.js의 "/edit" 으로 가게해주는 라우터에 미들웨어를 끼워줘야한다. 
근디 그중에서도 get이 아니라 post에서만 사용해줄거다. 

사용하는 방법은 https://www.npmjs.com/package/multer 에 있는
multer의 설명란에도 나와있지만 middleware를 쓰고 controller 함수를 사용하는거다. 

즉, URL 이 있고,  Middleware, 그리고 controller 함수를 쓰는거다. 
우리 라우터에는 이미 URL 은 있고 post에 middleware를 사용해주면 된다. 
그리고 controller함수를 쓰는거다.  


userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(postEdit); <- 맨처음 원래 상태 

먼저 uploadFiles 미들웨어를 써준다. 
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(uploadFiles.single(), postEdit); <- single은 파일을 하나만 업로드한다는 뜻 

그다음 fieldName을 써줘야한다.(form의 어디에서 파일이 오고있는가?)
우리의 경우는 avatar로부터 오고있다. 
(아까 템플릿에서 파일 input할 때의 name이다. 즉, 이렇게 어떤 input에 온걸 어디에 저장하는지 지정할수가 있는거다.)
Multer 미들웨어를 만들면서 폴더 지정을 해주면서 이름을 정해주고(uploadFiles = multer...) 그걸 input이랑 라우터에쓰는거랑 매칭시키고 뭐 그렇게..오호 
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(uploadFiles.single("avatar"), postEdit); 

자 한번 정리하자면 middleware를 실행한 다음, postEdit을 실행하는거다. 저 미들웨어가 postEdit 전에 딱 자리가 잡혀있짠아. 처음에 배운걸 생각해라 
왜 이렇게 하냐면. 
multer는 멋지기 때문에, input으로 avatar 파일을 받아서 그 파일을 uploads 폴더에 저장한 다음 그 파일 정보를 postEdit에 전달해 주는거다. 
기억해야할 건 미들웨어는 왼쪽에서 오른쪽 순서로 작동한다.  
그러니 multer 미들웨어가 먼저 실행되고 postEdit 이 실행이 되는거다. 

다시 반복하자면, uploadFiles.single이 하는 역할은 templete의 input에서 오는 avatar 파일을 가지고 
파일을 업로드하고 uploads 폴더에 저장할거다. 
그리고 다음 controller인 postEdit에 그파일의 정보를 전달하는거다. 

놀라운것은 이렇게하면 request에 req.file이 추가된다는거다. 아하 여기서 요기 request에 avatar 파일이 추가되는구나. 

이야 놀랍다. 
사용자가 저 우리의 POST 요청하는 form이 있는 URL 로 form을 보내면, 이 uploadFiels.single("avatar") 미들웨어를 거쳐서 
이 미들웨어가 사진을 시스템에 저장하고, req.file을 추가할거다. 
그리고 나서 우리의 postEdit 컨트롤러를 실행시키면 req.file 과 req.body를 사용할 수 있다. 

우리의 postEdit 컨트롤러는 이미 req.body는 잘 사용하고있지 그래서 프로필을 바꿔줬응니까 
하지만 아직 req.file은 어떻게 생겼는지 모른다. 
console.log(file); 해보면 

file:  {
    fieldname: 'avatar',
    originalname: '6A9D93FA-8BBE-4219-A8D1-CB5CB8877298.jpeg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    destination: 'uploads/',
    filename: '9e81ca419786a1fb014636f94e766651',
    path: 'uploads/9e81ca419786a1fb014636f94e766651',
    size: 413680
  }

뭐 요런게 나온다...
오오....
신기하다...
이게 우리가 받은 파일이다... 

파일 경로와 이름이있다. 이름은 원래이름과 랜덤으로 만들어진 이름이 있다. 
그밖에 뭐 이것저것 있다. 
이제 Uploads 폴더를 보면 내가 전송한 파일이 들어있는걸 볼 수 있다. 
와...존나 신기히다.... 

이 파일에는 Jpeg같은 확장자가 없다. 그래도 브라우저는 이해하니까 상관 없다. 

자 똑같은말 계속 하는거 같지만 그래도 중요하니 기억해야할 것은 
우리가 req.file을 사용할 수 있는 이유는 userRouter를 보면 
postEdit전에 multer를 사용하고 있기 때문이다. 
만약 요거 순서를 바꿔쓴다면 postEdit에서 req.file을 사용할 수 없다. 
미들웨어의 순서는 아주 중요하다는걸 알 수 있따. 

자 이제 우리에게 남은 필요한것은 경로(path) 다. 

왜냐면 Models의 User.js에 보면 avatarUrl이 있다. 
그게 이 방금 console.log 로 본 path 다. 

# File Upload part Two 

이제 req.file이 생겼고, 여기서 경로를 얻어야 한다. 
그리고 얻은 경호를  updatedUser의 findByIdAndUpdate 로 보낼거다. 
****************************************************************************************************************        
(userController.js)
export const postEdit = async (req, res) => { 
    const {
        session: {
            user: { _id },
        },
        body: { name, email, username, location },
        file: { path },                               <- 여기서 path를 얻고 
    } = req; 
    console.log("file: ", file);
    const usernameExist = await User.exists( { username }) 
    const emailExist = await User.exists({ email }) 
    const compareUsername = (username === req.session.user.username);
    const compareEmail = (email === req.session.user.email);
    
    const ok = (!usernameExist || compareUsername) 
                && (!emailExist || compareEmail);

    if(!ok) {
        return res.render("edit-profile", {
            pageTitle: "Edit Profile",
            errorMessage: "This username or email is already taken."
        });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
        _id, 
        {
        avatarUrl: path,                      <- 여기다가 path를 넣어준다. 
        name,
        email,
        username,
        location,
        },
        { new: true }
    );
    req.session.user = updatedUser;
    
    return res.redirect("/users/edit");
}
****************************************************************************************************************        

근디 약간의 문제가 있다. 
문제는, 사용자가 아바타를 바꾸지 않으면 어떻게 될것인가? 
그러니깐 아바타는 그대로 두고 이름이나 뭐 email만 바꾸면 어떻게 되는거냐는 말이다. 
에러가 발생한다.
    -> Cannot read property 'path' of undefined
왜?
file이 undefined 라서 path를 찾을수 없는거다. 
 왜냐면 나는 아바타를 바꾸고싶은게 아니라 파일을 가져오지 않았거든 

그러니까 위의 방식은 사용하면 안된다. 
내가 파일을 보내지 않으면,  req안에 file은 undefined 가 되기 떄문 
왜냐하면
파일 지정을 안해주면 file은 undefined가 되고 file이 존재하지 않으면 
avatarUrl: file.path 를 사용할수 없기 때문이다. 
avatarUrl을 빈내용으로 만드는거랑 마찬가지다. 
사용자가 이미 아바타가 있다면, undefined 인 아바타를 보내면 안된다. 
기존에 있던 아바타가 지워지게되기 때문이니까...? 

대신에 session으로 우리는 user 정보를 사용할 수 있었다. 
user에는 avatarUrl 이 있고, 그래서 기존 avatarUrl을 찾을 수 있다. 

그러면 아주 간단한 조건문을 통해 해결할 수 있다. 
아래처럼 
****************************************************************************************************************        
(userController.js)

export const postEdit = async (req, res) => { 
    const {
        session: {
            user: { _id, avatarUrl },           <- 일단 session에있는 user 정보에서 avatarUrl 가져오고 
        },
        body: { name, email, username, location },
        file,                                   <- 당연히 받은 req.file도 가져오고 
    } = req; 
    console.log("file: ", file);
    const usernameExist = await User.exists( { username }) 
    const emailExist = await User.exists({ email }) 
    const compareUsername = (username === req.session.user.username);
    const compareEmail = (email === req.session.user.email);
    
    const ok = (!usernameExist || compareUsername) 
                && (!emailExist || compareEmail);

    if(!ok) {
        return res.render("edit-profile", {
            pageTitle: "Edit Profile",
            errorMessage: "This username or email is already taken."
        });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
        _id, 
        {
        avatarUrl: file ? file.path : avatarUrl,        <- req.file이 존재하면 거기서 path 가져오고 아니면 원래거 유지니까 user꺼 가져와서 다시 복붙 
        name,
        email,
        username,
        location,
        },
        { new: true }
    );
    req.session.user = updatedUser;
    
    return res.redirect("/users/edit");
}
****************************************************************************************************************        

File이 존재한다는건 유저가 input으로 파일을 보냇다는거다. 
존재하지 않는다는건 유저가 아바타를 변경할 생각이 없어서 파일을 따로 업로드 해서 input하지 않았다는 거고. 

아 그리고 .gitignore 파일에 /uploads 지정하는것 잊지 말자. 

정리하자면 
form에 파일을 보낼 때도 있고, 아닐 때도 있다. 
그래서 form으로 파일을 보내는걸 확인하면, 그 파일을 새로운 avatarUrl로 저장해주는 거다. 
파일을 보내지 않으면 user에 기존 avatarUrl이 그대로 새로운 avatarUrl이 되는거다. 

자 이젠 파일을 보내지 않아도 에러가 생기지 않는다. 
이렇게 파일을 업로드하고, 파일 URL을 저장하게 되었다. 

# DB에 파일을 저장하면 안된다. 
NEVER SAVE A FILE ON A DATABASE!
NSTEAD I SAVE THE LOCATION OF THE FILE.
DB는 파일 저장을 위한게 아니다. 

오...이제 우리의 user data에는 고져스한 avatarUrl이 있으니 우린 이걸 사용할 수 있다. 
그래서 edit-profile 페이지에, 아주 멋진 이미지를 만들거다. 
 
****************************************************************************************************************        
(edit-profile.pug)

extends base

block content 
    img(src="/"+loggedInUser.avartarUrl, width="100", height="100")    <- 여기....여기다...!!!!!!, 절대 URL로 가야한다. 
                                                                        <-상대 URL로 가면 users/uploads 이렇게 주소로 간다. 
    if errorMessage 
        span=errorMessage
    form(method="POST", enctype="multipart/form-data")
        label(for="avatar") Avatar 
        input(type="file", id="avatar", name="avatar", accept="image/*")
        input(placeholder="Name", name="name", type="text", required, value=loggedInUser.name) 
        input(placeholder="Email", name="email", type="email", required, value=loggedInUser.email)
        input(placeholder="Username", name="username", type="text", required, value=loggedInUser.username)
        input(placeholder="Location", name="location", type="text", required, value=loggedInUser.location)
        input(type="submit", value="Update Profile")
        if !loggedInUser.socialOnly
            hr 
            a(href="change-password") Change Password &rarr;
****************************************************************************************************************                


다시 말하지만 loggedInUser는 현재 로그인 된 사용자고 localsMiddleware를 통해 pug에 전달되고 있다. 
알다시피 우리가 locals에 저장하는 모든 정보는 views에서 사용이 가능하다. 

으아니 근데 이미지가 안보인다. 
왜냐하면 '/uploads' 로 가는 라우트를 우리가 지정해준적이 없으니까... 

# Static Files

브라우저가 uploads 폴더에 있는 내용을 볼 수 있게 해줘야하는 상황이다. 
왜냐면 지금 브라우저가 서버에 있는 파일에 접근할 수 없으니까 
우리는 브라우저에게 어디로 가야 하는지 알려줘야한다. 
하지만 브라우저가 서버의 어떤 폴더로든 갈 수 있다면 보안상 좋진 않다. 
그러니 브라우저가 어떤 페이지와 폴더를 볼 수 있는지 알려줘야 한다. 

그러기 위해서, static files serving 이라는걸 활성화 할거다. 
폴더 전체를 브라우저에게 노출시킨다는 의미다. 
어떤 폴더를 가지고 그 폴더를 브라우저에게 노출 시키는거다. 

일단 /uploads route를 만들어야한다. 
server.js에 만들어줘야한다. 
****************************************************************************************************************
(server.js) 

.
.

app.use(localsMiddleware);
app.use("/uploads", express.static("uploads")); <- static 안에 내가 노출시키고자 하는 폴더의 이름을 넣어주면 된다. 
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

export default app;
****************************************************************************************************************
엥? 이렇게 하니까 그냥 사진이 나오네??
이렇게만 해주면 여기 폴더의 정적인 파일들을 내가 가져다가 쓸수있는거네???
아주 신기하네... 

# 파일업로드 정리 

처음 우리가 원했던건 파일을 업로드 하는거였다. 
우리는 서버로 파일을 보내려한거다. 

먼저 edit-profile.pug에 파일을 받는 input을 만들었다. 
그리고 이미지만 받는다고 설정했다. 
 -> input(type="file", id="avatar", name="avatar", accept="image/*") 

우리가 원하는건 서버에 이미지를 저장하고, 그 이미지에 대한 정보를 얻는 거였다. 
그래서 multer 라는 middleware를 사용했다. 
이건 우리가 form으로 보낸 파일을 업로드 해준다. 
그리고 그 파일에 관한 정보도 제공해준다. 
예를들면, 파일명을 완전히 랜덤으로 생성해주는 것 
    -> 만일 유저가 같은 이름의 파일을 업로드 해도 multer가 이름을 바꿔주기 때문에 문제가 없는거다. 멋지다. 
그리고 그 파일을 우리가 지정한 폴더에 저장해준다. (우리의 경우는 uploads폴더에 저장)

그리고 다음 순서의 controller에 파일의 정보를 제공해준다. 
파일이 업로드되고, 파일명이 바뀌고, 파일이 uploads폴더에 저장되고
그 팡리에 관한 정보를 받아서, 다음 controller(우리는 postEdit) 에 전달해 주는거다. 

이제 postEdit에서 req.file을 사용할 수 있다. 

postEdit에서는 avatarUrl을 업데이트 할 수 있는데 
유저가 파일을 보내지 않을 수도 있다. 
  -> avatarUrl: file ? file.path : avatarUrl,
고래서 요렇게 간단한 조건문을 사용했다. 
file이 undefined 냐 아니냐로 결정됨. 

만약 file이 undefined 가 아니면 file.path가 있는거니까 그냥 거기서 가져오면 되고 
만약 file이 없다면,  user의 avatarUrl은 기존의 것이랑 같다. 
기존의 아바타는 req.session.user.avatarUrl 에서 오는거다. 
기존 avatarUrl을 현재 로그인 된 유저로부터 가져오는거다. 

하지만 이렇게 아름다은 avatarUrl이 생기긴 했지만 
그것이 끝이 아니다. 왜냐면 브라우저는 아직 이 파일이 존재하는지 모르니까 
될줄알고 기뻐했지만 사진이 나오지 않았지 나의 멋진 셀카가. 

작동하지 않은 이유는 우리 서버가 /uploads/어쩌고 라는 url을 이해하도록 설정되지 않아서 그런거다. 
그래서 우리가 해준건 
Express에게 만약 누군가 /uploads로 가려고 한다면, uploads 폴더의 내용을 보여주라고 알려줬다. 
    -> app.use("/uploads", express.static("uploads"));  요걸로 

uploads 폴더는 multer가 파일을 저장하는 곳이다. 
지금은 내가 업로드하는 모든 사진이 uploads 폴더에 저장된다. 
이건 별로 좋은방법이 아니다. 그냥 사진만 가져와서 내 아바타를 업데이트 해주길 바란다. 

이 방법의 문제점은 
1. 우리가 파일을 서버에 저장한다는 거다. 
-> 서버는 계속 종료되고 다시 시작하는걸 반복한다. 뭔가 코드를 바꾸거나 업데이트하면 새로운 서버를 만들어서 재시작 하니깐 
    그 전 서버에 저장되있던 파일들은 다 날아가는거다. 그렇다고 서버 두개 만들어서 뭐 uploads 폴더를 공유하는것도 이상하고 뭐 낭비지 
    서버가 죽으면 어떡하누? 뭐 서버를 시작할 수 있는 코드를 가지고 다른 서버에서 다시 시작하면 된다. 
    근데 죽었을 때 코드와 업로드된 파일들이 있다면, 파일은 다 날리는거다. 
    그래서 우리는 나중에 파일을 우리 서버에 저장하는게 아니라 다른곳에 저장할거다. 
    서버가 사라졌다 다시 돌아와도 파일은 그대로 있도록 할수있게 말이다. 
    파일을 안전하게 저장하는거다. 
    이건 나중에 실제 서버에 배포할 때 해볼거다. 

한가지 또 기억해야할것은 DB에 절대 파일을 저장하면 안된다. 
DB는 파일 자체가 아니라, 파일의 위치를 저장하는거다. 

그래서 파일 원본은 Amazon의 하드드라이브 같은곳에 저장하면 된다. 
우리 DB에는 url을 저장하면 되는거고 

자 이제 우리는 우리 아바타에 사진을 추가한것처럼 
video에도 비디오를 추가해 볼거다. 레알 비디오.. 와우.. 
정확하게는 url을 추가하는거지만 




# Video Upload 

자 이제 드디어 비디오를 업로드 해볼건데 그러려면 비디오파일이 당연히 필요하곘지다. 
먼저 "views" 폴더의 "upload.pug" 에 들어가서 vidoe를 업로드할 레이블을 만든다. 
고 다음에는 type이 file인 input을 밑에 만들어 준다. 
accept에는 모든 종류의 video 형식을 받도록 설정해주고 
당연히 required 고 
label은 id를 활용하니까 꼭 id 추가해주고 
그리고 multer middleware를 사용하기 위해 name도 추가해준다. 

****************************************************************************************************************
(upload.pug)

extend base.pug 

block content  
    if errorMessage
        span=errorMessage
    form(method="POST", enctype="multipart/form-data")                                <= multer 쓰려면 이거 잊지마셈.
        label(for="video") Video File                                                   <- 레이블 추가해주고 
        input(type="file", accept="video/*", required, id="video", name="video")        <- 파일 업로드할 인풋도 추가해주고 !
        input(placeholder="Title", required, type="text", name="title", maxlength=80)
        input(placeholder="Description", required, type="text", name="description", minlength=20)
        input(placeholder="Hashtags, seperated by comma.", required, type="text", name="hashtags")
        input(type="submit", value="Upload Video")
****************************************************************************************************************

위처럼 템플릿을 설정해주면 이제 파일업로드 없이 "Upload Video"는 되지 않는다. 

그리고 내가 준비한 파일을 이제 업로드해주고 "Upload Video" 하깁전에 잠깐 videoRouter 수정할게 있다. 
multer 미들웨어를 이용한 uploadsFiles 미들웨어를 앞에써줘서 파일을 받아줘야한다. (사진 업로드할때랑 같은 거임)
근데 Multer 미들웨어에는 fileSize라는 옵션이 있다. 
파일 크기 제한해주는건데, 
이걸 가지고 avatar 파일의 업로드 용량을 3MB 이하로 하고 
video 파일의 용량을 10MB 제한하는걸 해볼거다. 
그렇기 때문에 uploadFiles 미들웨어를 2개로 나눠줄거다. 

****************************************************************************************************************
(middleware.js)
export const uploadFiles = multer({ dest: "uploads/" });  <- 원래 이거 하나 사용하던걸 

export const avatarUpload = multer({ dest: "uploads/avatars", limits: {
    fileSize: 3000000,   <- 바이트 단위임,  그리고 당연히 userRouter에서 미들웨어이름 바뀐거 적용시켜줘야함.  
} });
export const videoUpload = multer({ dest: "videos/upload/", limits: {
    fileSize: 10000000,     <- 이제 요거보다 용량이 큰건 업로드 안됨. 
} });



(videoRouter.js)
.
.
.
videoRouter.route("/:id([0-9a-f]{24})").get(watch);  
videoRouter.route("/:id([0-9a-f]{24})/edit").all(protectorMiddleware).get(getEdit).post(postEdit); 
videoRouter.route("/:id([0-9a-f]{24})/delete").get(protectorMiddleware, deleteVideo); 
videoRouter.get("/upload", protectorMiddleware, getUpload);
videoRouter.post("/upload", protectorMiddleware, videoUpload.single("video"), postUpload);   

export default videoRouter;
****************************************************************************************************************

파일이 너무 커서 업로드가 안될 때 그냥 err 텍스트를 화면에 띄우는게 아니라 
제대로된 메세지를 전달해주도록 만들어줄거다. 나중에 

일단 미들웨어를 2개로 나눴다. 
하나는 비디오를 업로드하는 미들웨어, 다른하나는 아바타를 업로드하는 미들웨어  
이제 파일을 받아서, 아니지 사실 우리가 원하는건 파일 자체가 아니라 파일의 경로지 
기억해야할것이 "multer"는 "req.file"을 제공해주는데 file 안에는 path가 있다. 

그러면 우리의 Video 모델에는 아직 fileUrl 항목은 없으니까 그거 일단 만들어준다. 
그리고 multer를 사용해서 파일을 업로드하고 싶다면 formdml encoding type 바꿔주는거 잊지 마삼!!


****************************************************************************************************************
(Video.js)
const videoSchema = new mongoose.Schema({
    //비디오 형식을 저장하는 구간
    title: { type: String, required: true, trim: true, maxLength: 80},
    fileUrl: { type:String, required: true },
    description: { type: String, required: true, trim: true, minLength: 20},
    createdAt: { type: Date, required: true, default: Date.now, trim: true},
    hashtags: [{ type: String, trim: true }],
    meta: {
        views: { type: Number, required: true, default: 0, trim: true },
        rating: { type: Number, required: true, default: 0, trim: true }
    }
});


(videoController.js)

export const postUpload = async (req, res) => {
    // here we will add a video to the videos array.
    const file = req.file;                              <- 여기서 file 받아주고
    const { title, description, hashtags } = req.body;
    try{
        const video = new Video({
            title,
            fileUrl: file.path,                         <- 요기서 경로 넣어주고 
            description,
            hashtags: Video.formatHashtags(hashtags)
        })
        console.log(video);
        await video.save();
        return res.redirect("/");
    } catch(error){
        console.log('error: ', error);
        return res.status(400).render("upload", {
            pageTitle: "Upload Video",
            errorMessage: error._message            
        });
    }
    
};


***************************************************************************************************************

우와 이렇게하고 업로드 하니까 DB에 내가 만든 비디오가 등록이 되었고 fileUrl도 잘 등록되어있고 내 폴더에도 잘 비디오가 업로드가 되어있따! 

이제 우리는 multer를 이용해서 uploads 폴더안 서로 다른 디렉토리에 저장할 수 있게 만들었다. 
아바타폴더와 비디오폴더가 있다. 아주 신기하다. 

이제 비디오를 재생시켜볼건데 예전에 만든대로 id를 가지고 비디오를 찾고있다. 
그리고 비디오 클릭해서 watch 페이지에 들어가면 video의 데이터들이 있다. 뭐 description이나 hashtags나 뭐 시간이나 그런거 
이제 여기에 video Element를 추가해주면 된다네? 
그냥 HTML tag인갑네? 
watch.pug는 videoController가 render하고 있는 templete이다. 
그 컨트롤러에서 video object를 통으로 templete에 넣어줬기 때문에 우리는 Path를 가져다 쓸 수 있는거다. 
그리고 아래처럼 템플릿에 비디오를 가져오면 재생이된다...와....개신기...
***************************************************************************************************************
(watch.pug)

extends base.pug 

block content
    video(src="/" + video.fileUrl, controls)      <- 요거 해주면 끝이네? 사진 가져올 때랑 똑같네??? controls넣으니까 영상 컨트롤러도 나오네?? 오이찌바!
    div
        p=video.description
        small=video.createdAt
    a(href=`${video.id}/edit`) Edit Video &rarr;
    br
    a(href=`${video.id}/delete`) Delete Video &rarr;      
***************************************************************************************************************

팁이 하나 있다. 

fileUrl = req.file.path; 
이거랑 
const { path: fileUrl } = req.file; 
이거랑 같다. 

es6 문법은 이렇게 틈틈히 알게될 때 기억해두자. 

# User Profile 

프로필에 들어가면 유저가 올린 영상들을 볼 수 있게 한다. 
추가적으로 영상을 틀면 누가 영상을 올렸는지도 알수있게하고 
영상소유자가 아니면 영상 삭제나 수정을 못하게 할거다. 
유저와 비디오를 연결시켜줄거다. 

1. My profile 링크를 만들거다. 

***************************************************************************************************************
(baser.pug)

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
                            a(href="/videos/upload") Upload Video
                        li 
                            a(href=`/users/${loggedInUser._id}`) My Profile       <- 일단 여기에 링크 만든다. 
                        li 
                            a(href="/users/edit") Edit Profile
                        li    
                            a(href="/users/logout") Log out
                    else
                        li    
                            a(href="/join") Join
                        li    
                            a(href="/login") Login
                    li  
                        a(href="/search") Search        
        main 
            block content 
    include partials/footer.pug
***************************************************************************************************************

2. 라우터와 컨트롤러 만들기 
라우터
 -> userRouter.get("/:id", see);

컨트롤러 
user session 에서 id를 가져오지 않을거다. 왜냐하면 이 페이지는 누구나 볼수있게 해야하기 때문 
그래서 URL에 있는 user id 를 가져올거다. 

***************************************************************************************************************
(userController.js)

export const see = async (req, res) => {
    const { id } = req.params;              <- id를 session에서 가져오는게 아니라 URL에서 가져오는겨 
    const user = await User.findById(id);
    if(!user){
        return res.status(404).render("404", { pageTitle: "User not found" }); <- user없으면 404 띄우고 
    }
    return res.render("profile", { pageTitle: `${user.name}`, user })
}
***************************************************************************************************************

이제 profile 템플릿을 만들자 

3. Profile 템플릿 만들기 

extends base 

block content 
    h1 hello 

일단 요정도만 만들어 놓고 비디오랑 user를 연결해줄거다. 


# Video Owner 

비디오랑 유저를 연결할 땐 id를 사용할거다 왜냐하면 유일하고 랜덤한 데이터이기 때문 
그럼 일단 비디오 모델에 owner를 추가해준다. 
type은 mongoose.Schema.Types.ObjectId 인데 이건 ObjectId가 javascript에서 제공하는게 아니고 
mongoose에서 제공하는거라 요렇게 적어주는거다. 
referenc도 추가해줄 필요가 있는데 
그 이유는 mongoose에게 owner에 id를 저장하곘다고 알려줘야 하기 때문이다. 
그런데 아직 어떤 model과 연결할지 알려주지도 않은 상태다. 
그래서 우린 이 mongoose에게 이 owner가 어떤 modeldml ObjectId 인지 알려줄거다. 
여기선 User model이 되는거다. 

***************************************************************************************************************
(Video.js)

const videoSchema = new mongoose.Schema({
    //비디오 형식을 저장하는 구간
    title: { type: String, required: true, trim: true, maxLength: 80},
    fileUrl: { type:String, required: true },
    description: { type: String, required: true, trim: true, minLength: 2},
    createdAt: { type: Date, required: true, default: Date.now, trim: true},
    hashtags: [{ type: String, trim: true }],
    meta: {
        views: { type: Number, required: true, default: 0, trim: true },
        rating: { type: Number, required: true, default: 0, trim: true }
    },
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});
***************************************************************************************************************

이제 영상을 업로드할 때 업로드하는 사용자의 'id'를 전송해줘야하기 때문에 controller를 수정해줘야한다. 
아래처럼 session으로부터 id를 받아서 video의 owner로 넣어준다. 

************************************************************************************************************
(videoController.js)

export const postUpload = async (req, res) => {
    // here we will add a video to the videos array.
    const {
        user: { _id },
    } = req.session;                                    <- 여기서 session에서 id 받아주고 

    const { path: fileUrl } = req.file;
    const { title, description, hashtags } = req.body;
    try{
        const video = new Video({
            title,
            description,
            fileUrl,
            owner: _id,                                 <- 여기서 video 정보에 넣어주고 
            hashtags: Video.formatHashtags(hashtags),
        })
        console.log(video);
        await video.save();
        return res.redirect("/");
    } catch(error){
        console.log('error: ', error);
        return res.status(400).render("upload", {
            pageTitle: "Upload Video",
            errorMessage: error._message            
        });
    }
    
};
************************************************************************************************************

이제 DB의 video를 보면 owner가 추가적으로 생긴걸 볼수있다. 
그럼 이제 우린 video와 user를 연결했다. 

이제 지금 보고있는 주인이 현재 로그인사람이랑 일치하는지 확인해서 
삭제및 수정을 볼수있게하냐마냐를 만들어줄수있따.  
    ->video.owner는 type이 ObjectId이기 때문에 String()으로 문자화 시켜줘야한다. 

************************************************************************************************************
(watch.pug)

extends base.pug 

block content
    video(src="/" + video.fileUrl, controls)
    div
        p=video.description
        small=video.createdAt
    if String(video.owner) === loggedInUser._id
        a(href=`${video.id}/edit`) Edit Video &rarr;
        br
        a(href=`${video.id}/delete`) Delete Video &rarr;      
************************************************************************************************************

자 이제 비디오 누가 만들어서 올린건지 표시해 줄거다. 
일단 컨트롤러에서 비디오 올리 user의 정보를 video.owner로 부터 가져온뒤 

************************************************************************************************************
(videoController.js)

export const watch = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    const owner = await User.findById(video.owner);        <- owner로 비디오 올리 user 객체를 user로부터 받아서
    if (video === null) {
        return res.render("404", { pageTitle: "Video not found" })
    }
    return res.render("watch", { pageTitle: video.title,video: video, owner });     <-템플릿에 넣어주고
    
} 
************************************************************************************************************

템플릿에 유저 이름 넣어주면 된다. 

************************************************************************************************************
extends base.pug 

block content
    video(src="/" + video.fileUrl, controls)
    div
        p=video.description
        small=video.createdAt
    div 
        small Uploaded by #{owner.name}                  <- 여기에 넣어주면 됨. 
    if String(video.owner) === loggedInUser._id
        a(href=`${video.id}/edit`) Edit Video &rarr;
        br
        a(href=`${video.id}/delete`) Delete Video &rarr;      
************************************************************************************************************

근데 더 좋은 방법이 있음 지금 여기서 우리는 DB에 정보를 2번이나 요청하고 있으니 좀 맘에 안든다. 

# Video Owner Part Two 

비디오 주인을 보여주는 기능을
같은 기능을 더 짧은 코드로 구현해보자. 

우리는 이미 video 객체에 owner에 대한 정보가 있고 
그 owner는 User 모델에서 참고해서 가져오는걸 아는데 뭐하러
video owner로 user 찾고 그 찾은 user에서 username 가져오고하는 뭐 그런 번거로운과정을 가지는가 
그냥 그런거 없이 모델에 있는 ref: User를 잘 이용해서 한번 사부작사부작 해보자 

(
그리고 mongoose는 onwer에서 ObjectId가 User에서 오는걸 아니까 도와줄거다. 
그러니 컨트롤러에서 findById로 user를 찾는거 대신에 mongoose가 그 역할을 대신 해줄수 있다. 
)

일단 도전적으로 컨트롤러에서 owner를 지워주자. 
그리고 video 변수(객체)에 populte("owner")를 추가해주는데 
populate는 video 객체의 owner 프로퍼티에 실제 User 데이터로 채워준다. 
흠 그러니까 우리는 Video model에서 owner부분을 populate 해주는거다. 
populate와 relationship만 적어주면된다...?

************************************************************************************************************
(videoController.js) 

export const watch = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id).populate("owner");      <- 2. 이 부분에 populate("owner") 추가 
    /* const owner = await User.findById(video.owner);*/    <- 1. 이부분 지우고 
    console.log('video: ', video);
    console.log('owner: ', owner);
    if (video === null) {
        return res.render("404", { pageTitle: "Video not found" })
    }
    return res.render("watch", { pageTitle: video.title,video: video });    <- 여기도 owner 없에준다.  
    
}

(Video.js)

const videoSchema = new mongoose.Schema({
    //비디오 형식을 저장하는 구간
    title: { type: String, required: true, trim: true, maxLength: 80},
    fileUrl: { type:String, required: true },
    description: { type: String, required: true, trim: true, minLength: 2},
    createdAt: { type: Date, required: true, default: Date.now, trim: true},
    hashtags: [{ type: String, trim: true }],
    meta: {
        views: { type: Number, required: true, default: 0, trim: true },
        rating: { type: Number, required: true, default: 0, trim: true }
    },
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});
************************************************************************************************************

자 이렇게 해주면 video 의 onwer 프로퍼티에는 User의 id string 만 들어가있는게 아니라 
User의 모든 정보 뭐 username, socialOnly. email..등등 하여간 그냥 다 들어가있게된다. 
아주 신기하다. 
아래처럼 나오는거다. 으아 아주 신기 
우리는 id를 저장하고 Mongoose에 이 id가 User model에서 왔다고 알려주기만 하면 되는거다. 
    -> 알려주고 저정하는건 watch.pug에서 해준겨 
그래서 이름을 다 통일하고 사전에 모든 model들을 import 해주는게 좋은거다.import { AutomaticPrefetchPlugin, webpack } from "webpack"
import { config } from "dotenv"
 (init.ja에서 import)
그래야 mongoose가 우리를 도와줄 수 있다.  
************************************************************************************************************
(populate("owner") 후 console.log(video);)

video:  {
    meta: { views: 0, rating: 0 },
    _id: new ObjectId("6220d0a147d8e7c0f536c26b"),
    title: 'Jimin Run',
    fileUrl: 'uploads/videos/bed777e98966e39f2c10c01c316f4129',
    description: 'Jimin Run slowly',
    hashtags: [ '#Jimin', '# Run', '# Turtle' ],
    owner: {
      _id: new ObjectId("6220cbc010e394ba38470af6"),
      email: 'shl906@naver.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/94297973?v=4',
      socialOnly: true,
      username: 'ihd0628',
      password: '$2b$05$84z0xrWjV1kLF5QA4CdCzuyQgGsB08NQJeuVeTkoXmmPd3r2FrAea',
      name: 'Seunghoon Lee',
      location: null,
      __v: 0
    }
************************************************************************************************************


이제 특정 사용자가 업로드한 모든 영상을 볼 수 있게 만들어 줄거다. 

일단 비디오주인 이름 클릭하면 그사람 프로필창으로 이동하게 아래처럼 템플릿을 수정해준다. 
************************************************************************************************************
(watch.pug)

extends base.pug 

block content
    video(src="/" + video.fileUrl, controls)
    div
        p=video.description
        small=video.createdAt
    div 
        small Uploaded by 
            a(href=`/users/${video.owner._id}`)=video.owner.name       <- 여기 해준겨 쉽쥬?
    if String(video.owner._id) === loggedInUser._id
        a(href=`${video.id}/edit`) Edit Video &rarr;
        br
        a(href=`${video.id}/delete`) Delete Video &rarr;      
************************************************************************************************************

이제 프로필에 내가 업로드한 영상들을 가져와서 보여줄거다. 

1. 일단 좀 허접한 긴 코드를 사용하는 방법

userController.j의 see 컨트롤러에서 우리는 user를 찾았다.(URL을 통해서)
그러면 내 id를 owner로 가진 video들을 찾을 수도 있겠네 
그거 찾아서 템플릿에 일단 넣어준다. 
************************************************************************************************************
(userController.js)

export const see = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if(!user){
        return res.status(404).render("404", { pageTitle: "User not found" });
    }
    const videos = await Video.find({ owner: user._id })                        <- user._id로 비디오 다 찾아서 
    return res.render("profile", { pageTitle: `${user.name}`, user, videos })   <- 넣어준다 
}
************************************************************************************************************

그리고 템플릿에선 컨트롤러에서 넣어준 비디오들을 그냥 home에서 처럼 다 띄워주면 된다. 
(mixin 이용)

************************************************************************************************************
(profile.pug)

extends base.pug 
include mixins/video

block content
    each potato in videos  
        +video(potato)
    else 
        li Sorry nothing found.
************************************************************************************************************

# Users Videos 

위에서 길게 한걸 여기서는 populate를 이용하여 별도의 videos 객체를 만들지 않고 
user에 다 넣어서 깔끔하게 처리할거다. 

video는 하나의 owner를 가지고 owner는 여러 videos를 가질 수 있다. 
video는 하나의 user를 가지지만 user는 여러 videos를 가질 수 있다. 

그러니 User 모델안에 videos array를 만들자. 
videos array안에는 object들로 구성되어질거다. 
정확히는 ObjectId를 가지는 array가 되는것이다. 

videos늰 Video model에 연결된 ObjectId로 구성된 array다. 
그리고 이건 배열이니까 많은 video 객체를 담을 수 있다. 
************************************************************************************************************
(Video.js)

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    avatarUrl: String,
    socialOnly: { type: Boolean, default: false },
    username: { type: String, required: true, unique: true },
    password: { type: String},
    name: { type: String, required: true },
    location: String,
    vieos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],    <- 이거다. 
})
************************************************************************************************************

이제 새로 업로드하는 "영상의 id" 를 User model에 저장해줄거다. 

************************************************************************************************************
(videoController.js)

export const postUpload = async (req, res) => {
    // here we will add a video to the videos array.
    const {
        user: { _id }
    } = req.session;
    const { path: fileUrl } = req.file;
    const { title, description, hashtags } = req.body;
    try{
        const newVideo = await Video.create({       <- 여기서 return 값으로 만든 객체를 리턴해주고 
            title,
            description,
            fileUrl,
            owner: _id,
            hashtags: Video.formatHashtags(hashtags)
        })
        const user = await User.findById(_id);      
        user.videos.push(newVideo._id);                 <- 여기서 video객체의 _id를 user의 videos 배열에 넣어준다. 
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
************************************************************************************************************

자 이제 video에는 업로드한 user의 id가 있고 user에는 video들의 id가 있다. 

//////////////////////////////////////////////////////////////////////////////////////////////////////
populate
Mongoose에는 populate()를 통해 다른 컬렉션의 문서를 참조할 수 있습니다. Population은 문서의 지정된 경로를 다른 컬렉션의 문서로 자동 교체하는 프로세스입니다. 단일 문서, 여러 문서, 일반 개체, 여러 일반 개체 또는 쿼리에서 반환된 모든 개체를 채울 수 있습니다.
const story = await Story.findOne({ title: 'Casino Royale' }).populate('author');
https://mongoosejs.com/docs/populate.html

Population
https://mongoosejs.com/docs/populate.html#population
//////////////////////////////////////////////////////////////////////////////////////////////////////


아래처럼 profile 화면에서 사용하는 see 컨트롤러에서 user 변수에 populate를 사용하여 
video 객체의 전부를 가져올 수 있다. 
id만 가진 array가 아니라 mongoose의 도움으로 video object로 구성된 array가 된거다. 

************************************************************************************************************
(userController.js)

export const see = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate("videos");
    if(!user){
        return res.status(404).render("404", { pageTitle: "User not found" });
    }
    const videos = await Video.find({ owner: user._id })
    return res.render("profile", { pageTitle: `${user.name}`, user, })
}
************************************************************************************************************

자 이제 그럼 user 안에 video 객체로 구성된 videos 배열을 넣어줬으니 
템플릿을 수정하면 된다. 

************************************************************************************************************
(profile.pug)

extends base.pug 
include mixins/video

block content
    each potato in videos  <- 요거에서 
    each potato in user.videos  <- 이거로 수정 왜냐믄 이제 videos 배열은 user안에 들어가 있응게 
        +video(potato)
    else 
        li Sorry nothing found.
************************************************************************************************************

populate 하나로 이렇게 정리가 된다. 

이제 나는 여러개의 video와 user가 어떻게 relationship을 가지면 되는지 알았다. 
 
# Bug fix 

1. 비디오 업로드하면 기존 비밀번호가 다시 hasing 되는 버그 
************************************************************************************************************
(User.js)
userSchema.pre("save", async function () {
    this.password = await bcrypt.hash(this.password, 5) 
})
************************************************************************************************************

내가 user를 save 할 때 마다 비밀번호를 반복적으로 hashing 하고 있다. 
이건 안좋당. 
왜냐하면 videoController에서 영상을 업로드할 떄 user.save() 실행하는데 
그렇게 되면 비번이 다시 또 hash된다. 
잉? 그러면 영상 업로드하면 비번이 바뀌는거다. 
문제다.  
특정 조건에서만 비밀번호가 hash되도록 만들어주자. 

특정조건은 비밀번호를 수정할 때만 hash를 하게 해줄거다. 

this의 메소드중에 .idModified("property") 라는게 있는데 
이것은 "property" 가 수정되면 this.isModified()  가 true를 반환해주는 메소드 이다. 

******************************************************************************************
(User.js)
1. 원래 이거였던걸 
userSchema.pre("save", async function () {
    this.password = await bcrypt.hash(this.password, 5) 
})

2. 이렇게 바꿔주면 password가 수정됬을 때 에만 hash해주게 되느거다. 
userSchema.pre("save", async function () {
    if(this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 5) ;
    }
});

******************************************************************************************

2. 영상주인이 아님에도 URL 을 통해서 video의 edit 페이지에 들어가 edit form을 보낼수있는 버그 
    -> 현재 로그인한 user의 _id 와 video의 owner를 비교해주면 된다. 
    -> 데이터 타입에 유의해야한다 .
******************************************************************************************
(videoController.js)

export const getEdit = async (req, res) => {
    const {id} = req.params;
    const {
        user: { _id },
    } = req.session;
    const video = await Video.findById(id);
    if (video === null) {
        return res.status(404).render("404", {pageTitle: "Video not found."})
    }
    if(String(video.owner) !== String(_id)) {       <- 데이터타입을 잘 확인해야함
        return res.status(403).redirect("/");
    }
    return res.render("edit", { pageTitle:`Edit ${video.title}`, video });
};
******************************************************************************************



자 여기까지 일단 대부분의 BackEnd는 끗!
이제 Front End로 넘어가보자 







# Webpack 

package.json을 보면 우리는 Babel Node를 사용하고 있다. 
극리고 우리가 Babel Node를 사용하였기 때문에 우리는 우리가 원하는 대로 코드를 써도 
Node.js 가 이해할 수 있는거다. 
이와 유사한걸 Front End javascript에서도 해줘야 한다. 

그리고 Style도 해야한다. 
지금 나의 페이지는 굉장히 못생겼다. 스타일링이 필요하다. 
스타일을 하기 위해선 CSS를 프론트엔드에 보내야한다. 

일반적으로 CSS를 작성하는것 보다 더 나은 방법이 있다. 
SCSS(Sassy CSS)이다. 
이것도 나중에 다뤄볼거다, 

중요한건, 우린 깔끔한 코드를 쓰고 싶다는 거다. 

우리는 섹시한 코드를 쓰고싶고 동시에 브라우저가 이해할 수 있는 코드를 넘겨줘야한다. 

예를들어 .scss 파일은 브라우저에서 바로 알아먹질 못한다. 
이걸 .css로 변환 해줘서 브라우저에게 줘야만 알아먹는다. 
왜냐하면 브라우저는 .css 만 이해 가능이니까. 

javascript에서도 마찬가지이다. 
여러가지 다양한 기술들을 쓰고 싶어도 브라우저가 이해를 못 할 수도 있고, 
크롱에서는 되는데 사파리에서는 안될수도 있다. 

그러니까 지금 원하는건 프론트엔드에서 javascript를 작성하면
모든 브라우저에서 인식 가능한 javascript로 바꿔주는 뭔가가 필요하다는 것이다. 

그래서 우리에게 Webpack이 필요하다. 

즉, Webpack은 내가 짠 완전 최신의 Javascript 코드 혹은 SCSS 코드를 
오래된 기본 Javascript 혹은 CSS로 변경시켜주는것이다. 

이번 Webpack 섹션에서는 Webpack configuration 파일을 작성해볼건데, 
굉장히 세련된 javascript파일을 작성해 볼거고 
그 코드들을 못생기고 지루하지만 호환성 있는 코드들로 전환하는법을 배울거다. 
(CSS도 마찬가지)


# Webpack Configuration Part One 

webpack이 어떤 것들을 바꿀 수 있느냐 
뭐 어지간한건 다 할수 있다고 볼수있다. 

jpg 파일을 예로 들면 webpack은 이걸 압축해서 압축된 jpg파일을 줄 수 있다. 
js를 오래된 버전의 js로, scss를 css로 

요점은 webpack은 이것들을 다 가져다가 모아서, 압축, 변형 시켜서 최소화 하고, 
필요한 과정을 거친다음 그 정리된 코드를 결과물로써 내어 놓는거다. 

일단 webpack 설치
지금 부터 이것저것 설치할 건데 이것들은 다 front-end 코드에 필요한 것들이다. 
이제 package.json안에 프론트엔드랑 백엔드에 필요한 패키지들을 한번에 정리하는거다. 

$ npm i webpack webpack-cli -D 
    -> -D는 이걸 저장하는게 package.json에서 "devDependencies"에 저장한다는 뜻이다. 

계속 말하고 있지만 webpack은 우리 파일들을 바꿔줄거다. 그게 전부다. 
그러니 우리가 webpack한테 할말은 
"여기에 소스파일들이 있고 여기가 너의 결과물들을 보낼 폴더다."
정도면 충분하다 

webpack을 설정하기 위해서는 "webpack.config.js" 라는 파일을 생성해야한다. 
(최상위 package.json이랑 같은 위치에 생성)
요 "webpack.config.js" 파일은 굉장히 오래된 Javascript 코드만 이해할 수 있다. 
그러니 import, export default 이런거 못알아 먹는다. 
require나 module.export 같은 예전 버전의 코드로 적어줘야한다. 

"webpack.config.js"에는 두가지 주의해야 할 점이 있는데, 
하나는 Entry다. Entry는 우리가 처리하고자 하는 파일들이다. 
우리가 만든 최신의 세련된 JS 같은것들 말이다. 
소스코드를 의미하는거지.
우리가 처리하고 싶은 파일. 우리의 경우엔 client 폴더 안에 있는 main.js 같은 파일이 되겠지. 
그렇다면 이 파일의 경로를 entry에 입력해야한다. 파일이 어디에 있는지 

그리고 이제 output을 위해서 파일명을 정해줘야한다. 
그리고 그 output file을 어디에 저장하는지도 정해줘야한다. 
저장경로는 path 에 입력해주면 된다. 

******************************************************************************************
(webpack.config.json)

module.exports = {
    entry: "./src/client/js/main.js", <- 그냥 뭐 경로 입력이다. 
    output: {
        filename: "main.js",            <- 어떤이름으로 파일을 출력할건지 
        path: "./assets/js",            <- 만든 파일은 어디에 저장할건지 
    }
}

******************************************************************************************

우리는 지금까지, Webpack과 Webpack CLI를 설치했고 
webpack CLI를 통해서 콘솔에서 webpack을 불러낼 수 있다. 
그리고 webpack.config.js에서는 webpack이 읽을 configration 파일을 내보낼거다. 

이 configration 개체에는 entry랑 output 2가지의 특성이 있는데 
이 2가지는 필수요건이고 이름은 webpack에서 지정한거라 고정이다. 

entry는 우리가 바꿔주려는 파일,
output은 구버전으로 바뀐 파일의 저장경로와 저장되는 이름이다. 

이제 webpack을 실행시킬거다. 
그러기 위해서 package.json에 script를 하나 만들어 줄건데 
npm run dev 에서 'dev' 가 들어 있는 그것이다.(dev 안에는 init.js가 들어있다.)
script는 명령어들을 좀 더 짧게 사용하는데 쓰인다는걸 잊지 말자. 

여기로 와서 "assets"라는 script를 만들어 줄거다. 
그리고 아래처럼 입력 
******************************************************************************************
"scripts": {
    "dev": "nodemon --exec babel-node ./src/init.js ",
    "설명": "원래는 그냥 node index.js로 실행했었는데 우리가 @babel/node를 설치했기 때문에 babel-node라는 명령어를 쓸 수 있는거야. nodejs를 실행시키는데 babel도 같이 적용되서 최신문법코드를 동작 시킬 수 있지.",
    "assets": "webpack --config webpack.config.js"  <-- 요기 요거 입력한거임 
  }
******************************************************************************************

이렇게 해서
$ npm run assets
을 통해 webpack을 실행하면 에러가 뜬다. 

******************************************************************************************
(error)
[webpack-cli] Invalid configuration object. Webpack has been initialized using a configuration object that does not match the API schema.
- configuration.output.path: The provided value "./assets/js" is not an absolute path!
-> The output directory as **absolute path** (required).
******************************************************************************************

webpack의 아웃풋 경로는 절대 경로로 설정해야지 상대 경로로 설정하면 안된다고 에러가 나왔다. 

# Webpack Configuration Part Two
절대경로란, 말 그대로 Webpack이 폴더로 접근할 수 있는 경로를 
처음 시작하는 폴더부터 끝까지, 완벽한 루트로 적으라고 요구하는것이다. 

그리고 그걸위해서 "__dirname" 이라는게 있다. 
directory name인데 말 그대로 파일까지의 경로 전체를 말하는거다. 

그리고 path.resolve()라는게 또 있다. 
require("path") 를 통해 모듈을 불러온 후 사용할수있는건데 
path.resolve() 가 하는 역할은 몇개가 되었든 내가 입력하는 파트들을 모아서 경로를 만들어 주는 거다. 

예를들어 path.resolve(__dirname, "assets", "js") 하게되면 
__dirname 을통해 얻은 현재까지의 전체경로 뒤에 /assets/js가 추가되게 되는거다. 
여기저기 "/" 를 넣을 번거로움 없이 알아서 경로를 만들어 주는거다.

그러면 신기하게도 폴더도 알아서 만들어주고 그 안에 우리가 지정한 이름의 파일을 저장해준다. 
그럼 우리는 assets/js 폴더 안에 main.js 파일이 생기게 된거다. 

******************************************************************************************
const path = require("path");

module.exports = {
    entry: "./src/client/js/main.js",                   <- 가져올 파일이 있는 경로
    output: {
        filename: "main.js",                            <- 만들 파일의 이름 
        path: path.resolve(__dirname, "assets", "js"),  <- 만들 파일의 절대 경로 
    }
}
******************************************************************************************

이렇게 하고 
$ npm run assets 
해주면 main.js에 이렇게 아래처럼 우리 코드가 압축된게 생기게된다.
******************************************************************************************
(main.js)
(async()=>{alert("hi its working"),await fetch("")})();
******************************************************************************************

위의 코드는 오래된 브라우저도 이해할 수 있는 구버전의 코드인거다. 
근데 아직도 어떤 코드들은 오래된 브라우저는 이해못하는게 있을수도 있다. 
그래서 우리는 이 코드에 호환성을 추가해야한다. 

Node.js에서 우리가 최신의 Javascript 코드를 쓰면 
그걸 구버전의 호환되는 Javascript로 바꿔주는 babel package가 있었다. 

그러니까 우리가 백엔드에서 코드를 babel을 이용해서 정리했듯이 
프론트엔드도 babel을 통해서 이용해서 처리할 수 있다는 말이다. 

하지만 그걸 package.json에서는 할수가 없고 프론트엔드 코드 처리는 webpack.config.js 에서 해줘야한다. 
그게 이제부터 우리가 해줄것이다. 

하지만 그전에, 우리는 rule이라는 컨셉에 대해 이해하고 넘어가야 한다. 
rules는 우리가 각각의 파일 종류에 따라 어떤 전환을 할지 정하는거다. 

rules안에서 test: 프로퍼티를 통해 어떤 파일들을 가져올지 정하고 
use: 프로퍼티안에 loader들을 설정해 줌으로써 (우리같은 경우는 babel-loader 가 필요하다.)
loader를 통해서 전환을 시키는거다. 

module이 뭐고 rules가 뭔소리며 이름을 왜 이따위로 지었는지는 나도 궁금하다. 모두가 궁금하다. 
하지만 뭐 어쩌겠냐 그냥 쓰라는대로 쓰는거지.
아무튼 rules는 array 타입이다. 여러가지 rules가 있을수 있으니까 

그리고 test라고 입력. 우리가 주는 regular expression 들을 확인해야 하니까.
아래와 같은 경우에 지금 우리가 하는건 모든 javascript 파일들을 가져다가 
몊가지 변환을 시키고자 하는것이다. 

그리고 우리는 babel loader를 사용함으로서 최신 Javascript코드를 구버전으로 바꿔주는 변환을 시켜줄거다.  
@babel/core를 설치해야 하지만 우린 이미 했고 
@babel/preset-env도 이미 설치 했고 
webpack도 이미 설치했다. 

이제부터 우리는 프론트엔드와 백엔드 양쪽에서 babel/core와 babel/preset-env를 사용할거다.     

하지만 우리는 아직 babel-loader는 없다. 
설치하자. 

$ npm i -D babel-loader

자 이렇게 설치했고 사용하는건 쉽다. 
그냥 babel-loader 홈페이지에서 가져온 사용방법 가져다 쓰는거다....
그냥 하라니까 일단 한다. 
그냥 아래처럼 options 가져다 붙여넣고 뭐 쓰란데로 쓰자. 

******************************************************************************************
(webpack.config.js)
const path = require("path");

module.exports = {
    entry: "./src/client/js/main.js",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "assets", "js"),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [["@babel/preset-env", { targets: "defaults" }]]
                    },
                },
            },
        ],
    },  
};
******************************************************************************************

자 이렇게 한게 뭐냐면 
javascript 코드를 babel-loader라는 loader로 가공하는거다. 
webpack은 node_modules에서 babel-loader를 찾을거고 
그리고 우린ㄴ 몇가지 옵션들을 전달하는거다. 
그게 다다...
(아 그러니까 webpack.config.js는 프론트엔드의 package.json이랑 얼추 비슷한거구나.)

요래하고 다시
$ npm run assets 
해주면(이전에 assets 폴더 및 파일은 다 지우고)

다시 main.js가 생기는데 요기에 아주 괴상하고 해괴한 코드들이 들어있다. 
잘된거다. 
모든 구버전의 브라우저들이 알아들을 수 있는 구버전의 코드가 들어있게 된것이다. 

우리에겐 main.js라는 entry 파일이 있었고 그 결과물도 main.js지만 이번엔
assets/js 에 있다. 

이제 우린 특정 종류의 파일들에게 변형을 적용시키는 법을 배웠다. 
지금같은 경우에는 우리들은 javascript 파일들을 변형시키는거다. 
우리는 loader를 사용해서 그 파일들을 처리하고 그 loader에 몇가지 옵션도 전달하고 있다. 


******************************************************
/\.js$/ = RegExp 정규표션식
정규표현식에선 .가 분류 커맨드이므로 그냥 .을 쓸려면 \.을 해줘야 된다.
따라서 \.js는 .js이다
******************************************************



자 근디 아까부터 아래와 같은 에러가 나오는데 이걸 해결해보자 
우리가 해야하는건 webpack한테 이 코드가 지금 개발중인지 아니면 완성품인지를 알려줘야한다. 
그러니까 우리는 webpack한테 아직 우리가 개발중이라고 말하고 나중에 우리가 이 백엔드를 서버에 직접 
올릴 때가 되면 바꾸는 법을 배울거다. 

******************************************************************************************
The 'mode' option has not been set, webpack will fallback to 'production' for this value.
Set 'mode' option to 'development' or 'production' to enable defaults for each environment.
You can also set it to 'none' to disable any default behavior. Learn more: https://webpack.js.org/configuration/mode/
******************************************************************************************


그러니 일단 지금은 개발중이라고 webpack한테 말해주면 된다. 
왜냐면 이거 Mode 설정 안해주면 기본으로 webpack은 production mode로 설정될거고 
그렇게 되면 코드들을 다 압축할 텐데(새로만드는 assets/js에 있는 main.js에다가)
개발중에는 안그랬으면 하거든 
왜냐면 개발중에는 압축없이 내가 어떻게 코드를 짜고있는지 봐야하잔여 
그래야 코드를 보고 어디 뭐 문제가 있나없나 알거아니여. 

mode: "development"
요거 추가해주면 된다. 아래처럼. 

******************************************************************************************
(webpack.config.js)

const path = require("path");

module.exports = {
    entry: "./src/client/js/main.js",
    mode: "development",        <- 요거 추가해준겨 
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "assets", "js"),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [["@babel/preset-env", { targets: "defaults" }]]
                    },
                },
            },
        ],
    },  
};
******************************************************************************************

요렇게 바꿔조고 
$ npm run assets
한번 더 해주면 새로만드는 main.js가 또 막 뭐가 신박하게 바뀌어있다. 
개발자에게 필요한 코멘트들도 달려있다. 
이건 production 코드가 아니라 그냥 알아보기 쉽게 만든거다. 
만약 내가 완성된 결과물을 원한다면 그냥 mode를 production으로 바꿔주면 된다. 

자 이제 이 새로만든 이 main.js를 어뜨케 우리의 프론트엔드에 적용시키는지 araboza

# Webpack Configuration Part Three

client 폴더가 앞으로 프론트엔드를 코딩할 폴더다.(webpack이 처리하기전) 
그리고 assets 폴더는 브라우저가 접근해서 볼 폴더이다. 
브라우저는 assests/js 안의 main.js 파일을 읽어갈거다.(webpack이 처리한 후)

근데 문제가 있는데 
localhost:4000/assets/js/main.js 로 접근해도 아무일도 안생긴다. 
왜냐면 서버는 아직 assets라는 폴더나 라우터가 있는지도 아직 모르기 때문이다. 
EXPRESS에게는 아직 존재하지 않는 폴더랑 파일이기 때문이다. 
그러니 알려줘야한다. 

uploads할때와 동일하게 처리해줄건데 
EXPRESS보고 사람들이 그 폴더안에 파일들에게 접근할수있게 해달라고 요청했듯이 동일하게. 
기본적으로 폴더들은 공개되어있지 않다. 그러니 따로 요청을 해야하는거다.(express.static())
서버가 오떤 폴더를 공개할지 정하는거다. 

이제 assets 폴더를 공개해주자. 
server.js에 static을 사용해주면된다. 
아래의 예시처럼 해주면 되는거다

******************************************************************************************
(server.js)

app.use(localsMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/assets", express.static("assets")); <- EXPRESS에게 assets폴더를 유저에게 공개해달라 요청
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

export default app;
******************************************************************************************

app.use("/assets", express.static("assets"));
에서 "/assets" 는 그냥 브라우저를 위한 URL 이고 express.statc("여기") 안의 "여기" 가 
진짜 폴더 이름이다. 

이제 assets/js/main.js를 base.pug 랑 연결시켜야한다. 
base.pug 파일이 main.js를 불러올 수 있도록 말이다. 

맨 밑에 script(src="/asstes/js/main.js")<- 요거 넣어주면 된다. 
이건 알지? 

이렇게 해주면 서버한테 assets폴더의 내용물을 /assets 주소를 통해 공개하라고 하는거다. 
만약 
app.use("/static", express.static("assets")); 이라고 server.js에 적어줬다면 
base.pug에
script(src="/static/js/main.js")
이라고 적어줘야한다. 

******************************************************************************************
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
                            a(href="/videos/upload") Upload Video
                        li 
                            a(href=`/users/${loggedInUser._id}`) My Profile 
                        li 
                            a(href="/users/edit") Edit Profile
                        li    
                            a(href="/users/logout") Log out
                    else
                        li    
                            a(href="/join") Join
                        li    
                            a(href="/login") Login
                    li  
                        a(href="/search") Search        
        main 
            block content 
    include partials/footer.pug
    script(src="/assets/js/main.js")    <- 여기서 불러오는거다. 
******************************************************************************************

잘된다. localhost:4000 으로 들어가니 HI 가 alert 된다. 

우리의 base.pug 파일이 main.js를 처리하며 생산된 결과물을 불러오고 있는거다. 
완벽하다. 

이제 저 clinet 폴더에 main.js뿐 아니라 다른 파일들도 세련된 최신 코드로 작성해줄거고 
그럼 그 코드들은 assets 로 보내질 거고 
그걸 pug가 불러올거다. 

# SCSS Loader 

scss 라는 폴더 만들것이다. 
그리고 style.scss, _variables.scss 파일을 그안에 만들어 준다. 

******************************************************************************************
(_variables.scss)
$red: red;

(style.scss)
@import "./variables";
body {
    background-color: $red;
}
******************************************************************************************

이 scss 파일을 main.js로 import 해줘야한다. 

******************************************************************************************
(main.js)
import "../scss/style.scss"     <- 이거로 scss파일 import

alert("HI");
******************************************************************************************

이렇게 하고 
$ npm run assets 
해주면 에러가 나오는데 

ERROR in ./src/client/scss/style.scss 1:0
Module parse failed: Unexpected character '@' (1:0)
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
> @import "./_variables";
import loader from "sass-loader"
import nodemon from "nodemon"
| body {
|     background-color: $red;
 @ ./src/client/js/main.js 1:0-28


뭐 이런 에러가 나온다. 
대충 뭐 저 _variables.scss파일을 가지고 뭘 할지를 모르겠다는 뜻이다. 
그리고 이 파일을 제대로 처리하기 위해서는 알맞은 loader가 필요할거라고 말해준다. 

자 loader는 파일들을 변환하는 장치이다. 
그래서 우리가 해야할 건, 모든 scss파일들을 변환하는거다. 

loader를 사용하는 방법은 두가지가 있다. 
하나는 main.js에서 사용했을 때 처럼 object를 사용하는 방법이다. 

다른 하나는, "여러가지 loader들을 가져다가 한 가지의 변형으로 만들 수 도 있다."
그래서 최종적으로 하고자 하는건 
    -> style.scss에 있는 이상하게 생긴 css를 가져다가 일반적인 CSS로 바꿔주는것 
    -> 그 바뀐 CSS를 우리의 웹사이트로 가져오는것 

그래서 이 경우는 3가지 loader가 필요하다. 

1. scss를 가져다가 일반 css로 변형하는 loader   
2. 폰트같은걸 불러올 때 css에 굉장히 유용하게 쓰일 loader
3. 변환한 css를 웹사이트에 적용시킬 Loader 

하나씩 해봅시다. 

1. 일단 설치 

-. sass-loader 설치: scss를 css로 변형시켜주는 로더 
    $ npm i sass-loader sass webpack --save-dev
-. css-loader 설치: @import랑 ur()을 풀어서 해석해주는 로더, 진행중인 import들을 처리해주는거라고 보자. 
    $ npm i --save-dev css-loader
-. style-loader 설치: css를 DOM에 주입하는 로더 
    $ npm i --save-dev style-loader

2. 로더들을 합치자 

제일 마지막 loader부터 시작해야한다.(역순) 
 sass-loader -> css-loader -> style-loader 순 

왜 역순으로 적어줄까?
간단하지 webpack이 뒤에서부터 시작해서 동작시키기 때문이지. 
그래서 webpack은 제일 먼저 sass-loader로 우리 코드를 가져다가 일반적인 css로 변경하고 
그런 다음 그 코드를 css-loader에 전달하고 style-loader가 css를 브라우저에 보이게 하는거다. 

******************************************************************************************
(webpack.config.js)

const path = require("path");

module.exports = {
    entry: "./src/client/js/main.js",
    mode: "development",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "assets", "js"),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [["@babel/preset-env", { targets: "defaults" }]]
                    },
                },
            },
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"], <- 역순으로 동작
            },
        ],
    },  
};
******************************************************************************************

자 이제 
$ npm run assets 
를 통해 실행시키면 어떤일이 일어날까

제일 먼저, webpack은 우리 entry 파일을 가져올거다. 
하나밖에 없지 "main.js"
webpack은 이게 Javascript라는걸 인식해서 babel을 이용해서 변환할거고 
그리고 나서 

webpack은 main.js안에서 import한게 scss파일이란걸 인식해서 
scss파일을 일반 css파일로 바꿀거다.(sass-loader) 
그리고 그 webpack이 직접 어떤 javascript 코드를 짤건데(css-loader) 
그 javascript 코드가 웹사이트에 컴파일된 css를 입력하는 역할을 할거다.(style-loader)

그래서 최종 javascript 파일에 새로운 코드들이 있을텐데 
그 코드가 컴파일된 CSS 를 어떤 아주 싱기방기한 그들만의 방식으로 우리 웹사이트에 적용시킬거다. 

그렇게 해서 실행을 시켰더니 

일단 assets 폴더안에 main.js가 아주 길어졌다. 
아주 길다. 이전에 alert("HI!") 한줄 있던거에 비하면 아주 길어졌다. 

그리고 우리의 페이지에 와보니 화면이 아주 빨갛게 의도대로 아주 잘 되어있다. 하하
그리고 console에 들어가보면 HI!가 아주 잘 보인다. 
뿌듯하다. 

복습하자면 일단 main.js 파일을 가공했고 
그리고 나서 그안에서 import한 scss 파일을 css파일로 컴파일 했다. 
그리고 나는 아직 모르는 어떤 방법으로 
webpack이 그 javascript를 나의 웹사이트의 head 안에 입력했다. 
(브라우저에서 Elements를 통해 코드를 확인하면 head안에 css코드가 들어가있다.)

그러니까 나는 scss파일을 만들고 그 scss파일을 javascript에 집어넣었는데
webpack이 그 둘을 정리해서 분류해놓았다. 

webpack이 그 javascript 파일을 babel로 처리해서 
나는 아직 모르는 어떤 방식으로 내 HTML의 head에 그 코드를 적용시키고있는거다. 



# MiniCssExtractPlugin

style loader를 쓰지 않을거다....?
여기서 알고자 하는건, 두 파일을 얻기 위해 webpack plugin을 쓰는 방법이다. 
우리는 방대한 javascript 파일(웹펙으로 변환된 구버전의 J파일)을 가지고 있고, 이 파일에는 CSS 코드가 들어있다. 
head에 CSS코드를 넣어주는건데 
우리는 javascript파일에서 CSS를 넣어주고 싶지 않다. 
우리는 분리된 CSS 파일을 만들고 싶다. 
왜냐하면 javascript가 로딩되는걸 기다리기 싫고 바로 화면에 띄우고 싶기 때문이다. 

pug에 CSS 가 포함되어 있듯. 
******************************************************************************************
(base.pug)
doctype html 
html(lang="ko")
    head 
        title #{pageTitle} | #{siteName} 
        link(rel="stylesheet" href="https://unpkg.com/mvp.css") <- 요기처럼
    body 
        header
            h1=pageTitle 
.
.

******************************************************************************************

위에서 한거처럼 하고싶다..?
잘 이해햐애한다...

sass-loader -> css-loader -> style-loader
위 3개의 loader만으로 우리가 원하는 scss코드를 적을 수 있고 
자동으로 우리거에 불러오고 적용하는거다. 

하지만 여전히 CSS 파일을 분리해두고 싶다. 

그러기 위해서 MiniCssExtractPlugin을 사용할 거다. 

이건 해당 코드를 다른 파일로 분리시키는 기능을 한다.

******************************************************************************************
(webpack.config.js)

const MiniCssExtractPlugin = require("mini-css-extract-plugin");    <- 요기서 파일 불러오고
const path = require("path");

module.exports = {
    entry: "./src/client/js/main.js",
    plugins: [new MiniCssExtractPlugin()],   <- 요기는 메뉴얼에 나와있는대로 넣어주고 
    mode: "development",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "assets", "js"),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [["@babel/preset-env", { targets: "defaults" }]]
                    },
                },
            },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],    <- 요기서 style-loader 대신에 넣어준다. 
            },
        ],
    },  
};
******************************************************************************************

다시 말해서 만들어진 main.js 파일은 CSS에서 다루는게 아니라 javascript에서 다루는거다. 
그리고 CSS 파일은 다른곳 어딘가에 만들어진거다. 
이렇게 style-loader를 대체한거다.. 

요렇게 만들고 npm run assets 하면 
main.css 가 생긴다. 
아주 신기하다. 

근디 css폴더와, javascript폴더를 구분시켜서 저장해야할 필요가 있다. 
아래처럼 구분 가능
******************************************************************************************
(webpack.config.js)

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

module.exports = {
    entry: "./src/client/js/main.js",
    plugins: [
        new MiniCssExtractPlugin({
            filename: "css/style.css",  <- 여기서 css 폴더 따로 해주고 
        }),
    ],
    mode: "development",
    output: {
        filename: "js/main.js",                 <- 여기서 js 따로 폴더 해주고 
        path: path.resolve(__dirname, "assets"),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [["@babel/preset-env", { targets: "defaults" }]]
                    },
                },
            },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            },
        ],
    },  
};
******************************************************************************************

모든건 client/js 에 있는 main.js 에서 시작한다. 
이 파일이 모든것의 importer다. 

javascript를 babel로 처리하고 CSS 를 추출한거다. 
둘다 assets에 main.js와 style.css로 만들어 진거다. 

이제 pug에 css 파일을 연결하면 된다. 


******************************************************************************************
(base.pug)

doctype html 
html(lang="ko")
    head 
        title #{pageTitle} | #{siteName} 
        link(rel="stylesheet", href="https://unpkg.com/mvp.css")
        link(rel="stylesheet", href="/static/css/style.css" ) <- 여기서 넣어준거임.
    body 
        header
            h1=pageTitle 
            nav 
                ul  
                    li 
                        a(href="/") Home
                    if loggedIn
                        li 
                            a(href="/videos/upload") Upload Video
                        li 
                            a(href=`/users/${loggedInUser._id}`) My Profile 
                        li 
                            a(href="/users/edit") Edit Profile
                        li    
                            a(href="/users/logout") Log out
                    else
                        li    
                            a(href="/join") Join
                        li    
                            a(href="/login") Login
                    li  
                        a(href="/search") Search        
        main 
            block content 
    include partials/footer.pug
    script(src="/static/js/main.js")
******************************************************************************************

자 지금까지 해서 우리는 모든것을 위한 파일을 가지고 있다. 
쩌는거다. 
아무것도 안 하고도 javascript로 CSS를 적용시켰다. 
이제 CSS를 추출해서 다른 파일로 분리시킬 수 있게 되었다. 

그리고 약간의 야매꿀팁으로 filename으로 assets이라는 같은 output 임에도 불구하고 
각각을 서로 다른 directory로 보낼수 있었다. 

다시 말하지만 base.pug가 이 파일들을 로딩하는 곳이란 걸 잊으면 안된다. 
(static 파일들을 로딩하는거란 뜻, client 파일들 말고, client파일들은 webpack에 의해서만 로딩되게할거임)

user, pug, browser는 저 assets폴더안에 있는것들만 보게 하는거다,
요게 바로 후론트엔드지. 


# Better Developer Experience 

프론트엔드의 main.js 를 수정할 때 마다 
폴더를 지우고 
$ npm run dev
를 해서 업데이트 해주는건 아주 번거롭다. 
그러니 자동으로 저장하면 업데이트되게 해보자. 
아래처럼 watch: true 
해주면 됨. 
내걸 계속 보고있는거다. 

******************************************************************************************
(webpack.config.js)

module.exports = {
    entry: "./src/client/js/main.js",
    mode: "development",
    watch: true
******************************************************************************************


자 이제 2개의 콘솔을 모두 실행시키는거에 익숙해져야한다. 
$ npm run dev
$ npm run assets 

이 2개를 모두 실행시키지 않으면 
scss를 바꿧는데 -> 이건 동작하지 않는다. CSS가 변경되지 않는다.
같은 에러메세지를 보게 될거다. 

그리고 아래와 같이 output에 clean: true 를 넣어주는데 
이게 뭐냐면 말 그대로 output folder를 build를 시작하기전에 
clean 해주는거다.(기존거 날리거 새로 다시 만들게 해주는 개념.)
당연히 이건 webpack을 재시작할때만 적용됨($ npm run assets)

******************************************************************************************
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

module.exports = {
    entry: "./src/client/js/main.js",
    mode: "development",
    watch: true,
    plugins: [
        new MiniCssExtractPlugin({
            filename: "css/style.css",
        }),
    ],
    output: {
        filename: "js/main.js",
        path: path.resolve(__dirname, "assets"),
        clean: true,                                <- 여기!!!
    }
******************************************************************************************

근데 프론트엔드의 main.js를 수정해서 저장한다고 
백엔드가 다시 재시작하길 바라진 않는다. 

그러기 위해선 nodemon에게 몇가지 파일이나 폴더들을 무시하는 방법을 알려줘야한다. 
아래처럼 nodemon.json 이라고 파일 만들어줘서 무시할것들 지정해주고 
******************************************************************************************
(nodemon.json)

{
    "ignore": ["webpack.config.js", "src/client/*", "assets/*"],
    "exec": "babel-node src/init.js"
}
******************************************************************************************

package.json에서 
아래처럼 수정해주면 된다. 

******************************************************************************************
(package.json)

"scripts": {
    "dev": "nodemon --exec babel-node ./src/init.js " <- 원래 이건데 
    "dev": "nodemon",   <- 이렇게 수정해주면 됨,
    "설명": "원래는 그냥 node index.js로 실행했었는데 우리가 @babel/node를 설치했기 때문에 babel-node라는 명령어를 쓸 수 있는거야. nodejs를 실행시키는데 babel도 같이 적용되서 최신문법코드를 동작 시킬 수 있지.",
    "assets": "webpack --config webpack.config.js"
  }
******************************************************************************************

이제 nodemon만 호출하면 자동으로 nodemon이 nodemon.json을 호출할거다. 

이제 프론트엔드의 파일을 저장한다고 백엔드가 재실행되지 않는다. 
그리고 또 중요하게 잊지말건, webpack과 nodemon은 서로 다른 console에서 실행시켜야 한다는 점이다. 


# Style Introduction 

지금까지 사용하던 MVP CSS를 지우고 이제 내가 한번 스타일링을 할건데 
일단 font-awesome 링크가져와서 base.pug에 넣어주고 

client 폴더안에 components랑 screens 라는 폴더를 만들고 
components 안에는 headers랑 footers 같은 것들을 넣을거고 
screens 안에는 home이랑 search 같은것들을 넣을거다. 

screen은 URL 같은거고 component는 header나 footer 같은거다. 

이후 css reset 해서 마진이나 패딩같은거 다 뭐 없애주고 
header를 빼서 partial에 넣어주고 뭐 이런저런것들을 굉장히 빠르게 넘어갔지만 
이것은 배워야할점인것은 맞지만 개인이 css를 공부해가며 기본적으로 해야할 css 구조화작업인거 같다. 

일단 스타일링 파트는 실습하며 따라해가며 공부한 뒤 추후에 정리하는게 맞을듯하다. 


