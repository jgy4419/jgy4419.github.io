/* global kakao */
import React, {useState, useEffect} from 'react';
import { Link, Route } from 'react-router-dom';
import './HospitalLocation.scss'
import KakaoMap from './KakaoMap';
import HospitalInformation from './HospitalInformation'
import axios from 'axios';
// JSON 파일 서버 : npx json-server ./data.json(저장한 파일명) --watch --port 8080

function HospitalLocation(){
    let [list, listChange] = useState(['전체', '연수동', '연수동', '대소원', '호암동', '교현동', '지현동', '칠금동'])
    let [inputValue, inputValueChange] = useState('');
    let [a, setA] = useState([]);
    const onChange = (e) => {
        // input에 입력한 값을 HospitalInformation에 보냄.
        inputValueChange(e.target.value);
    }
    let [searchText, setSearchText] = useState('');
    
    useEffect(()=>{
        // var is_action = false;
        // axios.get('http://localhost:8800/hospital')
        // .then(res => {
        //     for(let i = 0; i < res.data.length; i++){
        //         if(inputValue === ''){
        //             setA([...res.data]);
        //         }
        //     }
        // }).catch(err => {
        //     console.log(err)
        // })
        // is_action = true;
    })
    function searchData(){
        axios.get('http://localhost:8800/hospital')
        .then(res => {
            for(let i = 0; i < res.data.length; i++){
                // 만약 json데이터 안에 name 중 input이랑 같은 값이 있으면
                if(res.data[i].name === inputValue){
                    const filterData = res.data.filter(data => data.name === inputValue);
                    setA([filterData[0]]);
                    console.log('a', a);
                }else if(inputValue == ''){
                    // input 검색창에 아무것도 없을 떄 데이터 전부 다 보이기.
                    setA([...res.data]);
                }
            }
        }).catch((err) => {
            console.log('에러');
        })
    }
    return(
        <main>
            <div className="inner">
                <div className="searchBox">
                    <div className="searchBox">
                        <input className="search" placeholder="Search" type="text"
                        onChange={onChange}/>
                        {/* 만약 검색 내용을 입력 후 검색버튼을 누르면 / DB내의 데이터들과 검색어와 동일한 값을 전송 */}
                        <button className="btn" 
                        // 클릭하면 input에 있는 데이터를 전송
                        onClick={() => {
                            setSearchText(inputValue);
                            searchData();
                        }}
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
                    <HospitalInformation searchText={searchText} data={a}/>
                </section>
                <button>
                    <Link to="/">
                        뒤로가기
                    </Link>
                </button>
            </div>
        </main>
    )
}
export default HospitalLocation;