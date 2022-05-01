/* eslint-disable */

import React, {useState, useEffect} from 'react';
import './Main.scss'
import {Link, Route, Switch} from 'react-router-dom'

import { useDispatch, useSelector } from 'react-redux';

import data from '../data/test.json'
// json 서버 열기 => npx json-server ./test.json --watch --port 8800
function Main(){
    let state = useSelector(state => state);
    let dispatch = useDispatch();
    useEffect(() => {
        // 메인 페이지로 돌아오면 로컬스토리지 안에 search 값을 없애준다.
        localStorage.removeItem('search');
        localStorage.removeItem('count');
        pageLoding();
    }, [])
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
        // input(검색창)에 검색어를 누르면 enter키를 누르면
        if(e.key === 'Enter'){
            // 검색 결과를 localStorage에 저장 시키기.
            localStorage.setItem('search', e.target.value);
            // url 변경시켜주기.
            location.href = '/hospital';
        }

        const searchBtn = document.querySelector('.searchBtn');
        searchBtn.addEventListener('click', function(){
            localStorage.setItem('search', e.target.value);
        })
        
    }
    return(
        <div>
            <div className='inner'>
                <p className="title">병원을 찾는 <br/> 가장 빠른 방법.</p>
                    <div className='contain'>
                        <div className='item'>
                            <p className='title1'>어떤 <i className="fa fas fa-hospital"/>을 <br/>찾으세요?</p>
                            <div className='searchBox'>
                                <input onKeyPress={onKeyPress} className = 'search' placeholder='병원 이름을 입력해주세요!'/>
                                <Link to="/hospital"><button class="searchBtn">이동</button></Link>
                            </div>
                        </div>
                        <div className='item'>
                            <div>
                                <p className='title2'>내 위치 주변에 있는 <br/> 병원을 찾아봐요!</p>
                                <i className="fa fas fa-location-arrow"></i>
                            </div>
                            <Link to="/hospital"><button className="btn first">병원찾기!</button></Link>
                        </div>
                        <div className='item'>
                            <p className='title3'>개선할 점을 말해주세요! 👨‍💻🧑🏻‍💻👩🏻‍💻</p>
                            <Link to="/about"><button className="btnAbout">문의하기</button></Link>
                        </div>
                    </div>
            </div>
        </div>
    )
}
export default Main;