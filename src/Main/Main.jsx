/* eslint-disable */

import React, {useState, useEffect} from 'react';
import './Main.scss'
import {Link, Route, Switch} from 'react-router-dom'

import { useDispatch, useSelector } from 'react-redux';

import data from '../data/test.json'
// json 서버 열기 => npx json-server ./test.json --watch --port 8800
function Main(){
    let state = useSelector(state => state);
    let [helpState, setHelpState] = useState(0);
    let dispatch = useDispatch();
    useEffect(() => {
        // 메인 페이지로 돌아오면 로컬스토리지 안에 search 값을 없애준다.
        localStorage.removeItem('search');
        localStorage.removeItem('count');
        pageLoding();

        const helpBtn = document.querySelectorAll('.helpBtn');
        let helpInformation = document.querySelector('.helpInformation');
        for(let i = 0; i < helpBtn.length; i++){
            helpBtn[i].addEventListener('click', function(){
                helpInformation.classList.add('event');
            })
        }
        let closeBtn = document.querySelector('.closeBtn');
        closeBtn.addEventListener('click', function(){
            helpInformation.classList.remove('event');
        })
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
                            <button onClick={() => {setHelpState(0)}} class="helpBtn">!</button>
                        </div>
                        <div className='item'>
                            <div>
                                <p className='title2'>내 위치 주변에 있는 <br/> 병원을 찾아봐요!</p>
                                <i className="fa fas fa-location-arrow"></i>
                            </div>
                            <Link to="/hospital"><button className="btn first">병원찾기!</button></Link>
                            <button style={{
                                // marginBottom: "-40px"
                            }} onClick={() => {setHelpState(1)}} class="helpBtn">!</button>
                        </div>
                        <div className='item'>
                            <p className='title3'>🚨근처 응급실을 찾아봐요!🚨</p>
                            <Link to="/emergency"><button className="emergencyBtn">찾아보기</button></Link>
                            {/* <button class="helpBtn">!</button> */}
                        </div>
                        {/* <div className='item'>
                            <p className='title3'>개선할 점을 말해주세요! 👨‍💻🧑🏻‍💻👩🏻‍💻</p>
                            <Link to="/about"><button className="emergencyBtn">문의하기</button></Link>
                        </div> */}
                    </div>
            </div>
            <div className="helpInformation">
                <button className="closeBtn">X</button>
                <HelpInformation helpState={helpState}/>
            </div>
        </div>
    )
}
export default Main;

function HelpInformation(props){
    if(props.helpState === 0){
        return(
            <div className="helpContain">
                <h1 className="title">검색 결과로 병원 찾기</h1>
                <br/>
                <p>ex)</p>
                <h1>1.</h1>
                <img width="200" alt="image" src="https://user-images.githubusercontent.com/76980526/166665818-bb3bf5f5-c0cc-478f-ac39-73f2dacd17dd.png"/>
                <br/><br/>
                <p>먼저 찾고싶은 병원이나 큰 틀을 검색 창에 입력해줍니다.</p>
                <h1>2.</h1>
                <img width="400" alt="image" src="https://user-images.githubusercontent.com/76980526/166665965-c82f31fe-5aa3-4f6f-8a8f-9e8115d78fe3.png"></img>
                <br/><br/>
                <p>Enter키나, 이동 버튼을 누르면 사이트가 이동 되면서 검색한 병원들을 찾아줍니다.</p>
            </div>
        )
    }else if(props.helpState === 1){
        return(
            <div className="helpContain">
                <h1 className="title">내 위치 주변에 있는 병원을 찾기</h1>
                <br/>
                <h1>ex)</h1>
                <h1>1.</h1>
                <img width="200" alt="image" src="https://user-images.githubusercontent.com/76980526/166666817-ee8b19f7-9a4c-4a48-a7cb-c90b905942f5.png"></img>
                <br/><br/>
                <p>병원 찾기 버튼을 누르면</p>
                <h1>2.</h1>
                <img width="400" alt="image" src="https://user-images.githubusercontent.com/76980526/166666994-045861e8-e16a-49fc-ab2f-cc0c1d8f0ca1.png"></img>
                <br/><br/>
                <p>내 위치 주변에 있는 병원들을 찾아줍니다.</p>
            </div>
        )
    }
}