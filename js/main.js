//--Amber Folkert
//--INF 651
//--Professor Gray
//--11/8/21

function createElemWithText(elemType = "p", textContent = "", className){
    const myElem = document.createElement(elemType);
    myElem.id = textContent;
    myElem.textContent = textContent;
    if(className) myElem.classList.add(className);
    return myElem;
}

function createSelectOptions(data){
    if(data){
        let userArray = [];
        data.forEach(user => {
            const myElem = document.createElement("option")
            myElem.value = user.id;
            myElem.textContent = user.name;
            userArray.push(myElem);
        });
        return userArray;
    }
    return undefined;
}

function toggleCommentSection(postId){
    if(!postId) return;
    let myData = document.querySelector(`section[data-post-id='${postId}']`); 
    if(myData){
        myData.classList.toggle("hide");
    }
    return myData;
}

function toggleCommentButton(postId){
    if(!postId) return;
    let myData = document.querySelector(`button[data-post-id='${postId}']`); 
    if(myData){
        myData.textContent = (myData.textContent === "Show Comments")?"Hide Comments":"Show Comments";
    }
    return myData;
}

function deleteChildElements(parentElement){
    if(!(parentElement instanceof HTMLElement)) return;
    let child = parentElement.lastElementChild;
    while(child){
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
    return parentElement;
}

function addButtonListeners(){
    let buttons = document.querySelectorAll("main button");
    if(buttons){
        buttons.forEach(button =>{
            let data = button.dataset.postId;
            button.addEventListener("click", function(e){
                toggleComments(e, data)}, false);
        });
    }
    return buttons;
}

function removeButtonListeners(){
    let buttons = document.querySelectorAll("main button");
    if(buttons){
        buttons.forEach(button =>{
            let data = button.dataset.postId;
            button.removeEventListener("click", function(e){
                toggleComments(e, data)}, false);
        });
    }
    return buttons;
}

function createComments(comments){
    if(!comments) return;
    let fragElem = document.createDocumentFragment();
    comments.forEach(comment =>{
        let art = document.createElement('article');
        let h = createElemWithText('h3', comment.name);
        let p1 = createElemWithText('p', comment.body);
        let p2 = createElemWithText('p', `From: ${comment.email}`);
        art.append(h, p1, p2);
        fragElem.append(art);
    });
    return fragElem;
}

function populateSelectMenu(data){
    if(!data) return;
    let menu = document.getElementById('selectMenu');
    let selectOptions = createSelectOptions(data);
    selectOptions.forEach(option =>{
        menu.append(option);
    });
    return menu;
}

const getUsers= async() => {
    try{
        const users = await fetch('https://jsonplaceholder.typicode.com/users');
        if(!users.ok) throw new Error("Status code is bad.");
        return await users.json();
    } catch(e){
        console.log(e);
    }
}

const getUserPosts = async(userID) => {
    if(!userID) return;
    try{
        const posts = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userID}`);
        if(!posts.ok) throw new Error("Status code is bad.");
        return await posts.json();
    } catch(e){
        console.log(e);
    }
}

const getUser = async (userID) => {
    try{
      const result = await fetch(`https://jsonplaceholder.typicode.com/users?id=${userID}`);
      if(!result.ok) throw new Error("Status code is bad.");
        let res = await result.json();
        return res[0];
    } catch (e){
      console.log(e);
    }
}

const getPostComments = async(postID) => {
    if(!postID) return;
    try{
        const comments = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postID}`);
        if(!comments.ok) throw new Error("Status code is bad.");
        return await comments.json();
    } catch(e){
        console.log(e);
    }
}

const displayComments = async(postID) =>{
    if(!postID) return;
    let section = document.createElement("section");
    section.dataset.postId = postID;
    section.classList.add("comments");
    section.classList.add("hide");
    let comments = await getPostComments(postID);
    let fragment = createComments(comments);
    section.append(fragment);
    return section;
}

const createPosts = async(posts) =>{
    if(!posts) return;
    let fragElem = document.createDocumentFragment();
    for(let i = 0; i < posts.length; i++){
        const art = document.createElement('article');
        const h = createElemWithText('h2', posts[i].title);
        const p1 = createElemWithText('p', posts[i].body);
        const p2 = createElemWithText('p', `Post ID: ${posts[i].id}`);
        const author = await getUser(posts[i].userId);
        const p3 = createElemWithText('p', `Author: ${author.name} with ${author.company.name}`);
        const p4 = createElemWithText('p', `${author.company.catchPhrase}`);
        const btn = createElemWithText('button', 'Show Comments');
        btn.dataset.postId = posts[i].id;
        art.append(h,p1,p2,p3,p4,btn);
        const section = await displayComments(posts[i].id);
        art.append(section);
        fragElem.append(art);
    }
    return fragElem;
}

const displayPosts = async(posts) =>{
    const main = document.querySelector('main');
    const element = (posts)?await createPosts(posts):createElemWithText('p', 'Select an Employee to display their posts.', 'default-text');
    main.append(element);
    return element;
}

function toggleComments(e, postId){
    if(!e && !postId) return;
    e.target.listener = true;
    let section = toggleCommentSection(postId);
    let button = toggleCommentButton(postId);
    return [section, button];
}

const refreshPosts = async(posts) =>{
    if(!posts) return;
    const removeButtons = removeButtonListeners();
    const main = deleteChildElements(document.querySelector('main'));
    const fragment = await displayPosts(posts);
    const addButtons = addButtonListeners();
    return [removeButtons, main, fragment, addButtons];
}

const selectMenuChangeEventHandler = async() =>{
    const userId = event?.target?.value || 1;
    const posts = await getUserPosts(userId);
    const refreshPostsArray = await refreshPosts(posts);
    return [userId, posts, refreshPostsArray];
}

const initPage = async() =>{
    const users = await getUsers();
    const select = populateSelectMenu(users);
    return [users, select];
}

function initApp(){
    initPage();
    let menu = document.querySelector('#selectMenu');
    menu.addEventListener("change", function(e){
        selectMenuChangeEventHandler();
    });
}

document.addEventListener('DOMContentLoaded', initApp);
