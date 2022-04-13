import React, {useState, useEffect} from 'react';
import './Main.scss'
import {Link, Route, Switch} from 'react-router-dom'
// json 서버 열기 => npx json-server ./test.json --watch --port 8800
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
        <div className='mainContainer'>
            <div className='inner'>
            <p className="title">병원을 찾는 <br/> 가장 빠른 방법.</p>
                <div className='contain'>
                    <div className='item'>
                        <p className='title1'>어떤 <i className="fa fas fa-hospital"/>을 <br/>찾으세요?</p>
                        <Link to="/hospital"><button className="btn">찾으러 가기</button></Link>
                    </div>
                    <div className='item'>
                        <p className='title2'>내 위치 주변에 있는 <br/> 병원을 찾아봐요!</p>
                        <i className="fa fas fa-location-arrow"></i>
                    </div>
                    <div className='item'>
                        <p className='title3'>개선할 점을 말해주세요!👨‍💻🧑🏻‍💻👩🏻‍💻</p>
                        <Link to="/about"><button className="btnAbout">문의하기</button></Link>
                    </div>
                    </div>
            </div>
        </div>
    )
}
export default Main;