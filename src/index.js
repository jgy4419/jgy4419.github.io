import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// bootstrap 스타일 가져오기.
import 'bootstrap/dist/css/bootstrap.css';

import { BrowserRouter } from 'react-router-dom';

import {Provider} from 'react-redux'
import { createStore } from 'redux';
import { combineReducers } from 'redux';

let defaultState = [
  {clickLocationsX: 0, clickLocationsY: 0, myLocationX: 0, myLocationY: 0, hospitalName: ''},
  {hospitalName: 'b', hospitalPhone: 'ㅠ', hospitalUrl: '', hospitalAddress: ''}
]

function reducer(state = defaultState, action){
  let copy = [...state];
  if(action.type === '좌표변경'){
    // copy[0].hospitalName = action.payload.hospitalNames
    copy[0].clickLocationsX = action.payload.x;
    copy[0].clickLocationsY = action.payload.y;
    return copy;
  }else if(action.type === '내위치'){
    copy[0].clickLocationsX = action.payload.x;
    copy[0].clickLocationsY = action.payload.y;
  }else if(action.type === '병원정보'){
    copy[1].hospitalName = action.payload.name;
    copy[1].hospitalPhone = action.payload.phone;
    copy[1].hospitalUrl = action.payload.url;
    copy[1].hospitalAddress = action.payload.address
  }else{
    return state;
  }
}

// 병원들 정보 가져오면 병원들의 정보들을 가져옴. (좌표값 추가적으로 가져와서 넣기.)
function hospitalInformation(state = defaultState, action){
  let copy = [...state];
  if(action.type === '병원정보'){
    copy[1].hospitalName = action.payload.name;
    copy[1].hospitalPhone = action.payload.phone;
    copy[1].hospitalUrl = action.payload.url;
    copy[1].hospitalAddress = action.payload.address
    return copy;
  }
  return state;
}
// const rootReducer = combineReducers({
//   reducer, 
//   hospitalInformation
// })

// combineReducers를 사용해서 reducer 여러 개 등록.
let store = createStore(reducer);

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
