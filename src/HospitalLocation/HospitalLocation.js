/* eslint-disable */
/* global kakao */
import React, {useState, useEffect} from 'react';
import { Link, Route } from 'react-router-dom';
import './HospitalLocation.scss'
import KakaoMap from './KakaoMap';
import HospitalInformation from './HospitalInformation'
import axios from 'axios';

import data from '../data/test.json';

import { useDispatch, useSelector } from 'react-redux';
// JSON 파일 서버 : npx json-server ./data.json(저장한 파일명) --watch --port 8080

function HospitalLocation(){
    let [list, listChange] = useState(['전체', '연수동', '연수동', '대소원', '호암동', '교현동', '지현동', '칠금동'])
    let [inputValue, setInputValue] = useState('');
    let [a, setA] = useState([]);
    const onChange = (e) => {
        // input에 입력한 값을 HospitalInformation에 보냄.
        setInputValue(e.target.value);
        console.log(e.target.value);
    }

    let state = useSelector(state => state);
    let dispatch = useDispatch();

    let [test, setTest] = useState(5);

    const counts = (value) => {
        setTest(value);
    }
    // function propsCount(value){
    //     test = value
    //     console.log(value);
    // }

    // enter 키 이벤트 (enter키를 누르면 검색이 실행된다.)
    const onkeyPress = e => {
        if(e.key == 'Enter'){
            // searchData();
            // console.log(e.target.value)
            // console.log('변수', inputValue);
            
            // inputSend(e.target.value);
            data[0].kakaoMapSearch = e.target.value;
            // dispatch({type: '검색', payload: {
            //     sendInput: inputValue,
            // }})
            console.log('검색 결과', data[0].kakaoMapSearch);
        }
    }
    function clickBtn(e){
        let searchBtn = document.querySelector('.btn');
        let search = document.querySelector('.search');
        let test = searchBtn.addEventListener('click', function(){
            console.log('클리', search.textContent);
            dispatch({type: '검색', payload: {
                sendInput: e.target.value,
            }})
        })
    }
    return(
        <main>
            <div className="inner">
                {/* <div className="searchBox">
                    <div className="searchBox">
                        <input className="search" placeholder="Search" type="text"
                        onKeyPress={onkeyPress}
                        onChange={onChange}/>
                        <button className="btn"
                        onClick={clickBtn}
                        >검색</button>
                    </div>
                </div> */}
                <hr className="line"/>
                <div>
                {/* <p>{inputValue}</p> */}
                </div>
                {/* <div className="list">
                    <div>
                    {
                        list.map((i) => {
                            return(
                                <button>{i}</button>
                            )
                        })
                    }
                    </div>
                </div> */}
                <section className="section">
                    <KakaoMap test={test}/>
                    {/* input 값을 props로 보내기. */}
                    <HospitalInformation propsCount={counts}/>
                </section>
                <button className='backBtn'>
                    <Link to="/">
                        뒤로가기
                    </Link>
                </button>
                <button>{test}</button>
            </div>
        </main>
    )
}
export default HospitalLocation;