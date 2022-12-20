class ActionIsNotAnObject extends Error {
  constructor(action) {
    super(`Action should be an object, but it has got ${kindOf(action)}`);
    this.name = "ActionIsNotAnObject";
  }
}
class ActionHasNoType extends Error {
  constructor() {
    super(`Action should have type property.`)
    this.name = "ActionHasNoType";
  }
}

function createStore(reducer, initialstate) {
  if (!isFunction(reducer)) {
    throw new Error(`Reducer should be a function but it has got ${kindOf(reducer)}`)
  }
  if (isFunction(initialstate)) {
    throw new Error(`initialstate can't be a function!`)
  }

  let state = initialstate;
  let isDispatching = false;
  let subscribers = [];

  function dispatch(action) {
    if (!isObject(action)) {
      throw new ActionIsNotAnObject();
    }
    if (!('type' in action)) {
      throw new ActionHasNoType();
    }

    if (isDispatching) {
      throw new Error('cannot do anything while processing');
    }

    try {
      isDispatching = true;
      state = reducer(state, action);

    } finally {
      isDispatching = false;
      broadcast();
    }
  }

  function broadcast() {
    for (const subscribe of subscribers) {
      subscribe();
    }
  }

  function subscribe(callbackFn) {
    subscribers.push(callbackFn);

    return function unsubscribe() {
      let nodeIndex = subscribers.indexOf(callbackFn);

      if (nodeIndex >= 0) {
        subscribers.splice(nodeIndex, 1);
      }
    }
  }

  dispatch({
    type: '@INIT'
  })

  function getState() {
    if (isDispatching) {
      throw new Error('Some reducers are updating and busy. please wait...');
    }
    return state;
  }

  return {
    dispatch,
    getState,
    subscribe,
  }

}

function shapeAssertionReducers(reducers) {
  Object.entries(reducers).forEach(([reducerKey, reducer]) => {
    const action = { type: "@INIT" };
    const state = reducer(undefined, action);
    state
    if (typeof state === "undefined") {
      throw new Error(
        `Reducer for key ${reducerKey} returns undefined for action ${JSON.stringify(
          action
        )}`
      );
    }

    const randomActionType = Math.random().toString(16).slice(2);
    const secondAction = { type: randomActionType };
    const secondState = reducer(undefined, secondAction);
    if (typeof secondState === "undefined") {
      throw new Error(
        `Reducer for key ${reducerKey} returns undefined for action ${JSON.stringify(
          secondAction
        )}`
      );
    }
  });
}
// function combineReducers(reducers) {
//   if (!isObject(reducers)) {
//       throw new Error('reducers should be in the form of objects.');
//   }
//   let finalreducers = {};
//   for (const reducerKey in reducers) {
//       const reducer = reducers[reducerKey];

//       if (isFunction(reducer)) {
//           finalreducers[reducerKey] = reducer;
//       }
//   }

//   let shapeError;
//   try {
//       shapeAssertionReducers(finalreducers);
//   } catch (error) {
//       shapeError = error;
//   }

//   return (state = {}, action) => {
//       if (shapeError) {
//         throw new shapeError
//       }

//       let nextState = state;
//       let hasChanged = false;

//       for(const reducerKey in reducers){
//       let targetReducer = finalreducers[target];
//       let reducerState = state[target] || undefined;
//       let reducerNewState = targetReducer(reducerState, action)
//       hasChanged = hasChanged || reducerNewState !== reducerState;
//       }
//       nextState[target] = hasChanged ? reducerNewState : reducerState;
//       }}

function combineReducers(reducers) {
  const finalReducers = {};

  for (const reducerKey in reducers) {
    const reducer = reducers[reducerKey];

    if (isFunction(reducer)) {
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
    // state
    if (shapeError) {
      throw shapeError;
    }
    // action;
    let hasChanged = false;
    const nextState = state || {};
    for (const reducerKey in finalReducers) {

      const reducer = finalReducers[reducerKey];
      const reducerState = state[reducerKey];
      const newReducerState = reducer(reducerState, action);
      hasChanged = hasChanged || newReducerState !== reducerState;
      nextState[reducerKey] = newReducerState;
      nextState

    }
    return hasChanged ? nextState : state;
  }
}



function kindOf(inp) {
  return Object.prototype.toString.call(inp).slice(8, -1).toLowerCase();
}
function isObject(inp) {
  return kindOf(inp) === "object"
}

function isFunction(inp) {
  return typeof inp === "function"
}

function taskReducer(initalstate = [], action) {
  let state = [...initalstate];
  if (action.type === "ADD") {
    state.push(action.payload);
  }

  if (action.type === "DELETE") {
    state = state.filter((i) => {
      if (i.id !== action.payload.id)
        return i;
    })
  }

  return state;
}

let store = createStore(taskReducer, []);

// function getId(state) {
//   if(!state.length) return 1;
//   else {
//     state[state.length].id + 1
//   }
// }

let addbtn = document.getElementById('addBtn')

// addbtn.addEventListener('click', () => {
//   let textInput = document.getElementById('myInput');
//   if(textInput.value.length){

//   let stateBefore = store.getState().filter(i => i.task);
//   let currentState = store.getState();
//   let task = textInput.value;

//   let id = getId(currentState)

//   if (document.querySelector('#newTask Input').value.length == 0) {
//     alert("Please Enter a Task");
//   }
//   store.dispatch({
//           type: "ADD",
//           payload:{
//             task,
//             id,
//             complete: false,
//           }
//         });

//         renderTasks(stateBefore);
//         textInput.value = null;
//       }
//     }, false)

addbtn.addEventListener('click', () => {
  let textInput = document.getElementById('myInput');
  if (textInput.value.length) {
    let stateBefore = store.getState().filter(i => i.task);
    let newState = store.getState();
    let task = textInput.value;
    let len = newState.length;
    let id = newState.length === 0 ? 1 : newState[len - 1].id + 1;
    store.dispatch({
      type: 'ADD',
      payload: {
        task,
        id,
        complete: false,
      }
    });

    //  let stores = [];
    localStorage.setItem("Task", task)
    //  stores = stores.push(localStorage.getItem("Task"));
    //  console.log(stores);

    renderTasks(stateBefore);
    textInput.value = null;
  }
}, false)


function renderTasks(stateBefore = []) {
  let tasks = store.getState();
  let todolist = document.getElementById('Todo-Tasks');

  for (let i = 0; i < tasks.length; i++) {
    const taskElm = tasks[i];
    if (i >= stateBefore.length || !stateBefore.includes(taskElm)) {

      let div = document.createElement('div');
      div.classList.add('todo-div')
      div.id = taskElm.id;

      // Add a "checked" symbol when clicking on a list item

      let checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'check';
      checkbox.classList.add('check');
      

      checkbox.addEventListener('change', (ev) => {
        let target = document.getElementById(taskElm.id)

        if (taskElm.complete) {
          store.dispatch({ type: "Completed", payload: { id: taskElm.id } })
          ev.target.toggle('checked');

        }
      })

      let deleteBtn = document.createElement('button');
      // span.className = "close"
      deleteBtn.textContent = '\u00D7';

      let taskText = document.createElement('span');
      taskText.textContent = taskElm.task;


      deleteBtn.addEventListener('click', () => {
        store.dispatch({ type: 'DELETE', payload: { id: taskElm.id } });
        let elmTask = document.getElementById(taskElm.id)
        let parentNode = elmTask.parentElement;
        parentNode.removeChild(elmTask);
        
      },)

      div.appendChild(checkbox);
      div.appendChild(taskText);
      div.appendChild(deleteBtn);
      todolist.append(div);
    }
  }
}

let unsubscribe = store.subscribe(() => {
  console.log(store.getState())
});

// function retrieveRecords(){ //retrieves items in the localStorage
//   var key = document.getElementById('Tasks-list').value; //gets key from user
//   var records = window.localStorage.getItem(key); //searches for the key in localStorage
//   var paragraph = document.createElement("p");
//   var infor = document.createTextNode(records);
//   paragraph.appendChild(infor);
//   var element = document.getElementById("retrieve");
//   element.appendChild(paragraph);
// }

// window.onload =function(){ //ensures the page is loaded before functions are executed.

//   document.getElementById("addBtn").onclick = retrieveRecords
// }