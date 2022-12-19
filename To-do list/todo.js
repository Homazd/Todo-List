
class ActionIsNotAnObject extends Error {
    constructor(action){
        super(`Action should be an object, but it has got ${kindOf(action)}`);
        this.name = "ActionIsNotAnObject";
    }
}
class ActionHasNoType extends Error{
    constructor(){
        super(`Action should have type property.`)
        this.name = "ActionHasNoType";
    }
}

class ActionHasNoTarget extends Error{
    constructor(){
        super(`Action should have target property.`)
        this.name = "ActionHasNoTarget";
    }
}
// Create Store 

function createStore(reducer, initialState){
    if(!isFunction(reducer)){
        throw new Error(`Reducer should be a function but it's got ${kindOf(reducer)}`)
    }
    if(isFunction(initialState)){
        throw new Error(`Initial State can not be function!`)
    }

    let state = initialState;
    let subscribers = [];
    let isDispatching = false;

    function dispatch(action){
        if(!isObject(action)){
          throw new ActionIsNotAnObject(action);
        }

        if(!("type" in action)){
            throw new ActionHasNoType();
        }

        const isInitType = action.type === "@INIT";
        if(!isInitType && !("target" in action)){
            throw new ActionHasNoTarget();
        }
        
        if(isDispatching){
            throw new Error(`Cann't handle any other actions while processing.`)
        }

        try{
            isDispatching = true;
            state = reducer(state, action);
        } finally {
            isDispatching = false;
            broadcast();
        }
    }

    function broadcast(){
        for (const subscriber of subscribers){
            subscribe();
        }
    }
    function getState(){
      if(isDispatching){
       throw new Error(`Some Reducers may be updating and are busy. please wait...`);
      }
      return state;
    }
    function subscribe(callbackFn){
      subscribers.push(callbackFn);

      return function unsubscribe(){
        const nodeIndex = subscribers.indexOf(callbackFn);
        if(nodeIndex >= 0){
          subscribers.splice(nodeIndex, 1);
        }
      }
    }

    dispatch({
      type: "@INIT"
    })

    return {
      dispatch,
      getState,
      subscribe,
    }
}

function shapeAssertionReducers(reducers){
  Object.entries(reducers).forEach(([reducerKey, reducer]) => {
    const action = {type: "@INIT", target : "reducerKey"}
    const state = reducer(undefined, action);

    if(typeof state === "undefined"){
      throw new Error(`Reducer for key ${reducerKey} return undefined for the action ${JSON.stringify(action)}`)
    }

    const randomActionType = Math.random().toString(16).slice(2);
    const secondAction = {type: randomActionType, target: reducerKey};
    const secondState = reducer(undefined, secondAction);

    if(typeof secondState === "undefined"){
      throw new Error(`Reducer for the key ${reducerKey} returns undefined for the action ${JSON.stringify(secondAction)}`);
    }
  })
}

function combineReducers(reducers){
  let finalReducers = {};

  for (const reducerKey in reducers){
    const reducer = reducers[reducerKey]
    if(isFunction(reducer)){
      finalReducers[reducerKey] = reducer;
    }

  }
  let shapeError;

  try {
    shapeAssertionReducers(finalReducers);
  } catch (e) {
    shapeError = e;
  }

  return (state = {}, action) => {
    if(shapeError){
      throw shapeError;
    }
    let hasChanged = false;
    const nextState = state;
    if(action.type === "@INIT" || action.target === "*"){
    for (const reducerKey in finalReducers){
      const reducer = finalReducers[reducerKey];
      const reducerState = state[reducerKey] || undefined;
      delete action.target;
      const newReducerState = reducer(reducerState, action);

      if(typeof newReducerState === "undefined"){
        throw new Error(`Reducer for the key ${reducerKey} returns undefined for the action's type ${action.type}`)
      }
      hasChanged = hasChanged || newReducerState !== reducerState;
      nextState[reducerKey] = newReducerState;
    }
  } else{
    const reducerKey = action.target;
    if(!(reducerKey in finalReducers)){
      throw new Error(`Target ${reducerKey} can't be found in finalReducers.`)
    }
    const reducer = finalReducers[reducerKey];
      const reducerState = state[reducerKey] || undefined;
      delete action.target;
      const newReducerState = reducer(reducerState, action);

      if (typeof newReducerState === "undefined") {
        throw new Error(
          `Reducer ${reducerKey} returns undefined for action's type ${action.type}.`
        );
      }

      hasChanged = reducerState !== newReducerState;

      if (hasChanged) nextState[reducerKey] = newReducerState;
  }
return hasChanged ? nextState : state;
};
}


function kindOf(inp){
    return Object.prototype.toString.call(inp).slice(8, -1).toLowerCase();
}
function isFunction(inp){
return typeof inp === "function";
}

function isObject(inp){
return kindOf(inp) === "object";
}


function taskReducer(state = [], action){
  if(action.type === "ADD"){
    const id = Math.random().toString(16).slice(2);
    return [
      ...state,
      {
        id,
        title: action.payload.title;
      }
    ]
  }

  else if(action.type === "Delete"){
    const id = action.payload.id;
    const newlist = state.filter((task) => task.id !== id);
    return newlist;
  }
  else return state;
}


// Create a "close" button and append it to each list item
var myNodelist = document.getElementsByTagName("LI");
var i;
for (i = 0; i < myNodelist.length; i++) {
  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  myNodelist[i].appendChild(span);
}

// Click on a close button to hide the current list item
var close = document.getElementsByClassName("close");
var i;
for (i = 0; i < close.length; i++) {
  close[i].onclick = function() {
    var div = this.parentElement;
    div.style.display = "none";
  }
}

// Add a "checked" symbol when clicking on a list item
var list = document.querySelector('ul');
list.addEventListener('click', function(ev) {
  if (ev.target.tagName === 'LI') {
    ev.target.classList.toggle('checked');
  }
}, false);

// Create a new list item when clicking on the "Add" button
function newElement() {
  var li = document.createElement("li");
  var inputValue = document.getElementById("myInput").value;
  var t = document.createTextNode(inputValue);
  li.appendChild(t);
  if (inputValue === '') {
    alert("You must write something!");
  } else {
    document.getElementById("myUL").appendChild(li);
  }
  document.getElementById("myInput").value = "";

  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  li.appendChild(span);

  for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
      var div = this.parentElement;
      div.style.display = "none";
    }
  }
}