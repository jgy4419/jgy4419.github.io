import React, {useState, useEffect} from 'react';
import './Main.scss'
import {Link, Route, Switch} from 'react-router-dom'

import { useDispatch, useSelector } from 'react-redux';
// json 서버 열기 => npx json-server ./test.json --watch --port 8800
function Main(){
    
    let state = useSelector(state => state);
    let dispatch = useDispatch();

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
    const onKeyPress = e => {
        if(e.key === 'Enter'){
            // setTimeout(() => {
                dispatch({type: '검색', payload:{
                    mainInput: e.target.value,
                }});
                console.log(state[2].mainSearch);
                
            // }, 1000);
            // window.location.href = '/hospital';
            window.location.reload();
            // window.parent.location.hash = 'hospital';
            console.log(state[2].mainSearch);
        }
    }
    return(
        <div className='mainContainer'>
            <div className='inner'>
            <p className="title">병원을 찾는 <br/> 가장 빠른 방법.</p>
                <div className='contain'>
                    <div className='item'>
                        <p className='title1'>어떤 <i className="fa fas fa-hospital"/>을 <br/>찾으세요?</p>
                        <div className='searchBox'>
                            <input onKeyPress={onKeyPress} className = 'search' placeholder='병원 이름을 입력해주세요!'/>
                            {/* <Link to="/hospital"><button className="btn">검색</button></Link> */}
                        </div>
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