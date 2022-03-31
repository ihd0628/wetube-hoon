import User from "../models/User";
import Video from "../models/Video";
import fetch from "node-fetch";
import bcrypt from "bcrypt"
import { application, response } from "express";

export const getJoin = (req, res) => res.render("join", {pageTitle: "Join"});
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
export const getLogin = (req, res) => res.render("login", { pageTitle : "Login" });
export const postLogin = async (req, res)  => {
    const { username, password } = req.body;
    const pageTitle = "Login";                      
    const user = await User.findOne({ username, socialOnly: false });
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
};

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
        let user = await User.findOne({ email: emailObj.email });
        if(!user) {
            user = await User.create({
                avatarUrl: userData.avatar_url,
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
    } else {
        res.redirect("/login");
    }
};
export const logout = (req, res) => {
    req.session.destroy();
    res.redirect("/");
} 

export const getEdit = (req, res) => {
    return res.render("edit-profile", { pageTitle: "Edit Profile" });
}
export const postEdit = async (req, res) => { 
    const {
        session: {
            user: { _id, avatarUrl },
        },
        body: { name, email, username, location },
        file,
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
        avatarUrl: file ? file.path : avatarUrl,
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

export const getChangePassword = (req, res ,next) => {
    if(req.session.user.socialOnly === true) {
        req.flash("error", "깃헙로그인이라 비번 못바꿈");
        return res.redirect("/");
    };
    return res.render("change-password", { pageTitle: "Change Password" });    
};
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
    req.session.user.password = user.password;
    req.flash("info", "비번 바뀜");
    return res.redirect("/users/logout");
};
export const see = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate({
        path: "videos",     // path는 내가 populate 하고 싶은것을 명시 
        populate : {
            path: "owner",
            model: "User",
        },
    });
    if(!user){
        return res.status(404).render("404", { pageTitle: "User not found" });
    }
    console.log("아니 이게 뭐여 시발", user.videos);
    return res.render("profile", { pageTitle: `${user.name}`, user, })
}
    




