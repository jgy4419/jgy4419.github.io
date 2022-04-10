import logo from './logo.svg';
import React, {useState} from 'react';
import {Link, Route, Switch} from 'react-router-dom'
import Main from './Main/Main'
import HospitalLocation from './HospitalLocation/HospitalLocation'
import Header from './Header';
import './App.scss';

function App() {
  return (
    <div className="App">
      <Header/>
      <Route exact path="/">

        <Main/>
      </Route>
      <Route exact path="/hospital">
        <HospitalLocation/>
      </Route>
    </div>
  );
}

export default App;