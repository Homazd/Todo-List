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

function createStore(reducer, initalstate) {
  if (!isFunction(reducer)) {
    throw new Error(`Reducer should be a function but it has got ${kindOf(reducer)}`)
}
if (isFunction(initalstate)) {
    throw new Error(`initialstate can't be a function!`)
}

  let state = initalstate;
  let isDispached = false;
  let subscribers = [];

  function dispatch(action) {
    if (!isObject(action)) {
      throw new ActionIsNotAnObject();
  }
      if (!('type' in action)) {
          throw new ActionHasNoType();
      }

      if (isDispached) {
          throw new Error('cannot do anything while processing');
      }

      try {
          isDispached = true;
          state = reducer(state, action);

      } finally {
          isDispached = false;
          broadcast();
      }
  }

  function broadcast() {
      for (const subscribe of subscribers) {
          subscribe();
      }
  }

  function subscribe(listener) {
      subscribtions.push(listener);

      return function unsubscribe() {
          let listenerIndex = subscribtions.indexOf(listener);
          if (listenerIndex >= 0) {
              subscribtions.splice(listenerIndex, 1);
          }
      }
  }

  dispatch({
      type: '@INIT'
  })

  function getState() {
      if (isDispached) {
          throw new Error('cannot show state while processing');
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
function combineReducers(reducers) {
  if (!isObject(reducers)) {
      throw new Error('reducers should be in the form of objects.');
  }
  let finalreducers = {};
  for (const reducerKey in reducers) {
      const reducer = reducers[reducerKey];

      if (isFunction(reducer)) {
          finalreducers[reducerKey] = reducer;
      }
  }

  let shapeError;
  try {
      shapeAssertionReducers(finalreducers);
  } catch (error) {
      shapeError = error;
  }

  return (state = {}, action) => {
      if (shapeError) {
        throw new shapeError
      }

      let nextState = state;
      let hasChanged = false;
              
      let targetReducer = finalreducers[target];
      let reducerState = state[target] || undefined;
      let reducerNewState = targetReducer(reducerState, action)
      hasChanged = hasChanged || reducerNewState !== reducerState;
      nextState[target] = hasChanged ? reducerNewState : reducerState;
      }}


function kindOf(inp) {
  return Object.prototype.toString.call(inp).slice(8, -1).toLowerCase();
}
function isObject(inp){
  return kindOf(inp) === "object"
}

function isFunction(inp){
  return typeof inp === "function"
}

function taskReducer(initalstate = [], action) {
  let state = [...initalstate];
  if(action.type === "ADD") {
  state.push(action.payload);
  }

  if(action.type === "DELETE") {
          state = state.filter((i) => {
              if(i.id !== action.payload.id)
                  return i;
          })
        }
  
  return state;
}

let store = createStore(taskReducer, []);

const counterValue = localStorage.getItem("Task");
console.log({ counterValue, });

function getId(state) {
  if(!state.length) return 1;
  else {
    state[state.length].id + 1
  }
}

let addbtn = document.getElementById('addBtn')

addbtn.addEventListener('click', () => {
  let textInput = document.getElementById('myInput');
  if (textInput.value.length) {
      let stateBefore = store.getState().filter(i => i.task);
      let stateAfter = store.getState();
      let task = textInput.value;
      let id = getId(stateAfter);
      store.dispatch({
        type: 'ADD',
        payload: { task,
        id,
        complete: false,
      }});
      
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

          let checkbox = document.createElement('input');
          checkbox.type = 'checkbox'
          checkbox.classList.add('todo-check');
          checkbox.id = 'todo-check';
        
        
         // Add a "checked" symbol when clicking on a list item

          checkbox.addEventListener('change', (ev) => {
              let target = document.getElementById(taskElm.id)

              if (taskElm.complete) {
                  store.dispatch({ type: "Completed", payload: { id: taskElm.id } })
                  ev.target.toggle('checked');
                  
              }
          })

          
          let taskText = document.createElement('span');
          taskText.textContent = taskElm.task;
          let deleteBtn = document.createElement('button');
          // span.className = "close"
          deleteBtn.textContent = '\u00D7';

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






// // function getId(state) {
// //   return state.todos.reduce((maxId, todo) => {
// //     return Math.max(todo.id, maxId)
// //   }, -1) + 1
// // }


// function taskReducer(initialState = [], action) {
//   switch (action.type) {
//     case "ADD": 
//       return [
//         ...state,
//         {
//           ...action.payload,
//         }
//       ]
    
//     case "DELETE":

//     state = state.filter((i) => {
//     if(i.id !== action.payload.id)
//     return i;
//   })
// }
//       return state;
// }

// // let actions = {
// //   addTodo: function(title) {
// //     return {
// //       type: 'ADD',
// //       title: title,
// //     }
// //   },
// //   deleteTodo: function(id) {
// //     return {
// //       type: 'DELETE',
// //       id: id
// //      }
// //   }
// // }

// // const counterValue = localStorage.getItem("counter");
// // console.log({ counterValue, });

// // const counterInitialState = counterValue ? Number(counterValue) : 0;

// // function counterReducer(state = counterInitialState, action){
// //   if(action.type = "INC") return state + 1;
// //   if(action.type = "DEC") return state - 1;
// //   return state;
// // }

// const store = createStore(taskReducer, []);


// let addbtn = document.getElementById('addbtn')

// addbtn.addEventListener('click', () => {
//     let textInput = document.getElementById('myInput');
//     if (textInput.value.length) {
//         let prevState = store.getState().filter(i => i.task);
//         let currentStore = store.getState();
//         let task = " " + textInput.value;
//         let id = !currentStore.length ? 1 : currentStore[currentStore.length - 1].id + 1;
//         let action = { type: 'ADD', payload: { task, id, } }
//         store.dispatch(action);
//         renderTasks(prevState);
//         textInput.value = null;
//     }
// }, false)

// // document.querySelector('.addBtn').addEventListener('click', function () {
// //   let textInput = document.getElementById('myInput');
// //   if(textInput.value.length){
// //   let prevState = store.getState().filter((t) => t.task);
// //   let currentState = store.getState();
// //   let task = " " + textInput.value;
// //   let id = !currentState.length ? 1 : currentState[currentState.length - 1].id + 1;

//   // if (document.querySelector('#myDIV input').value.length == 0) {
//   //   alert("Please Enter a Task");
//   // }

// //   store.dispatch({
// //       type: "ADD",
// //       payload:{
// //         task,
// //         id,
// //       }
// //     });
  
// //     renderTasks(prevState);
// //     textInput.value = null;
// //   }
// // }, false)
//     // document.querySelector('#Tasks-list').innerHTML += `
//     //       <div class="task">
//     //           <span id="taskname">
//     //               ${document.querySelector('#myDIV input').value}
//     //           </span>
//     //           <button class="close">
//     //               <i class="far fa-trash-alt"></i>
//     //           </button>
//     //       </div>
// //       `;
// //     //  let taskText = document.querySelectorAll("#taskname").innerHTML;
// // let lastId = 0;
// //     store.dispatch({
// //       type: "ADD",
// //       text: this.input.value,
// //       id: lastId + 1,
// //     });
// // lastId++
// //   }
// //   renderTasks()
// // })

// /////////////////

// ////////////////
// // let addBtn = document.querySelector('addBtn');

// // addBtn.addEventListener("click", () => {
// //   if(this.input.value) {
// //   dispatch({
// //     type: "ADD",
// //     text: this.input.value,
// //   })
// //   this.input.value ='';
// // }
// // })



// // // // Click on a close button to hide the current list item
// // var close = document.getElementsByClassName("close");
// // var i;
// // close.addEventListener("click", function() {
// //   var div = this.parentElement;
// //     // div.style.display = "none";
// //     renderTask();
// // })


// // // Add a "checked" symbol when clicking on a list item
// // var list = document.querySelector('ul');
// // list.addEventListener('click', function(ev) {
// //   if (ev.target.tagName === 'LI') {
// //     ev.target.classList.toggle('checked');
// //   }
// // }, false);

