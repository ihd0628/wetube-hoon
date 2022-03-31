const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtn = document.querySelectorAll("#delete")

const addComment = (text, id) => {
    const videoComments = document.querySelector(".video__Comments ul");
    const newComment = document.createElement("li");
    newComment.className = "video__comment";
    newComment.dataset.id = id;
    const icon = document.createElement("i");
    const span = document.createElement("span");
    const span2 = document.createElement("span");
    icon.className = "fas fa-comment";
    span.innerText = ` ${text}`;
    span2.innerText = "❌"; 
    //span2.id = "delete";
    span2.addEventListener("click", handleDeleteBtn);
    span2.dataset.id = id;
    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(span2);
    videoComments.prepend(newComment);

    const deleteBtn = document.getElementById("delete");
};

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
        const { newCommentId } = await response.json();
        addComment(text, newCommentId);
        textarea.value = "";
    }
};

const handleDeleteBtn = async (event) => {
    const commentId = event.path[1].dataset.id;
    

    const response = await fetch(`/api/commentDel`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentId }),      
    });
    if(response.status === 201){
        event.path[1].remove();
    }
    else {
        alert("개수작 부리지마라");
    }
}


if(form) {
    form.addEventListener("submit", handleSubmit);    
}

if(deleteBtn) {
    for (i = 0; i < deleteBtn.length; i++) {
        deleteBtn[i].addEventListener("click", handleDeleteBtn);
      }
}
