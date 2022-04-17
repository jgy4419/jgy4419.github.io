/* global kakao */
import React, {useState, useEffect} from 'react';
import { Link, Route } from 'react-router-dom';
import './HospitalLocation.scss'
import KakaoMap from './KakaoMap';
import HospitalInformation from './HospitalInformation'
import axios from 'axios';

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
    
    useEffect(()=>{
        // 처음에는 전체 리스트 보이도록 해주기.
        axios.get('http://localhost:8800/hospital')
        .then(res => {
            for(let i = 0; i < res.data.length; i++){
                setA([...res.data]);
                
            }
        }).catch((err) => {
            console.log('에러');
        })
    }, [])
    // enter 키 이벤트 (enter키를 누르면 검색이 실행된다.)
    const onkeyPress = e => {
        if(e.key == 'Enter'){
            // searchData();
            console.log(e.target.value)
            console.log('변수', inputValue);
            inputSend(e.target.value);
        }else{
            let searchBtn = document.querySelector('.btn');
            searchBtn.addEventListener('click', function(){
                inputSend(e.target.value);
            })
            console.log('클리', e.target.value)
        }
    }
    function inputSend(input){
        console.log('input', input);
        dispatch({type: '검색', payload: {
            sendInput: input,
        }})
        // console.log('검색 결과', state[2].search);
    }
    return(
        <main>
            <div className="inner">
                <div className="searchBox">
                    <div className="searchBox">
                        <input className="search" placeholder="Search" type="text"
                        onKeyPress={onkeyPress}
                        onChange={onChange}/>
                        {/* 만약 검색 내용을 입력 후 검색버튼을 누르면 / DB내의 데이터들과 검색어와 동일한 값을 전송 */}
                        <button className="btn"
                        >검색</button>
                    </div>
                </div>
                <hr className="line"/>
                <div>
                {/* <p>{inputValue}</p> */}
                </div>
                <div className="list">
                    <div>
                    {
                        list.map((i) => {
                            return(
                                <button>{i}</button>
                            )
                        })
                    }
                    </div>
                </div>
                <section className="section">
                    <KakaoMap/>
                    {/* input 값을 props로 보내기. */}
                    <HospitalInformation data={a}/>
                </section>
                <button className='backBtn'>
                    <Link to="/">
                        뒤로가기
                    </Link>
                </button>
            </div>
        </main>
    )
}
export default HospitalLocation;