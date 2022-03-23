import React, {useState, useEffect} from 'react';
import './Main.scss'
import {Link, Route, Switch} from 'react-router-dom'
function Main(){
    useEffect(() => {
        pageLoding();
    })
    function pageLoding(){
      // transform: translateY(-100px); 이 효과 적용
      let title = document.querySelector('.title');
      let btn = document.querySelector('.btn');
      title.classList.add('event');
      let btnEvent = setTimeout(() => {
          btn.classList.add('event');
          clearTimeout(btnEvent);
      }, 1000);
    }
    return(
        <div className="mainContainer">
            <br/>
            <div className="inner">
                <p className="title">병원을 찾는 가장 빠른 방법</p>
                <Link to="/hospital"><button className="btn">찾으러 가기</button></Link>
            </div>
        </div>
    )
}
export default Main;