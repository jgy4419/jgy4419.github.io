/* eslint-disable */
/* global kakao */

import React, {useState, useEffect} from 'react';
import './EmergencyList.scss';

function EmergencyList(){
    let [detailState, setDetailState] = useState(0);
    var mapContainer;
    var mapOption;
    var map;
    useEffect(() => {
        mapContainer = document.getElementById('map'); // 지도를 표시할 div 
        mapOption = { 
            // 충주 중심좌표
            center: new kakao.maps.LatLng(36.99196502823086, 127.92563283606664),
            level: 7 // 지도의 확대 레벨
        };
        // 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
        map = new kakao.maps.Map(mapContainer, mapOption);
    }, []);
    return(
        <>
            <div className="contain">
                <div className="settings">
                    <div className="list">
                        <div class="hospitalDetailBox" onClick={() => {setDetailState(1)}}>
                            <p className = "name">이름</p>
                            <p className = "tel">전화번호</p>
                            <p className = "address">주소</p>
                        </div>
                    </div>
                    <div className="list">
                        <div class="hospitalDetailBox" onClick={() => {setDetailState(1)}}>
                            <p className = "name">이름</p>
                            <p className = "tel">전화번호</p>
                            <p className = "address">주소</p>
                        </div>
                    </div>
                    <div className="list">
                        <div class="hospitalDetailBox" onClick={() => {setDetailState(1)}}>
                            <p className = "name">이름</p>
                            <p className = "tel">전화번호</p>
                            <p className = "address">주소</p>
                        </div>
                    </div>
                    <div className="list">
                        <div class="hospitalDetailBox" onClick={() => {setDetailState(1)}}>
                            <p className = "name">이름</p>
                            <p className = "tel">전화번호</p>
                            <p className = "address">주소</p>
                        </div>
                    </div>
                </div>
            </div>
            <HospitalDetail detailState={detailState} setDetailState = {setDetailState}/>
        </>
    )
}

export default EmergencyList;

function HospitalDetail(props){
    let [hospitalInformation1, setHospitalInformation1] = useState(['병원이름', '전화번호', '상세주소']);

    function activate({ target }){
        let hospitalInformation = document.querySelector('.hospitalModal');
        [...hospitalInformation.children].forEach(information => {
            information.classList.toggle('active', information === target);
        })
    }
    if(props.detailState === 1){
        return(
            <div className="hospitalDetail">
                <div className="back"/>
                <div className="information">
                    {/* onClick={props.setDetailState(0)} */}
                    <p className="close" onClick={() => {
                            props.setDetailState(0);

                        }
                    }>X</p>
                    <div className="hospitalDetail">
                        <h1>병원 상세정보</h1><br/>
                        {
                            hospitalInformation1.map(information => {
                                return(
                                    <p className = "firstInformation">{information}: </p>
                                )
                            })
                        }
                    </div>
                    <div className="hospitalDetail2">
                            <ul className="hospitalModal">
                                {
                                    ['병원정보', '진료정보'].map(e => {
                                        return(
                                            <li onClick={activate}>{e}</li>
                                        )
                                    })  
                                }
                            </ul><br/><br/>
                            <div className="hospitalDetail2Inner">
                                <h1 className="emergencyCall">응급실 연락처 : </h1>
                                <br/>
                                <h1>진료 시간</h1><br/>
                                <div className="weekBox">
                                {
                                    ['월', '화', '수', '목', '금', '토', '일'].map(week => {
                                        return(
                                                <p className="week">{week}</p>
                                        )
                                    })
                                }
                                </div> <br/>
                                <h1>진료 과목</h1><br/>
                                <div className="diagnosisBox">
                                    <p className="diagnosis">Test</p>
                                    <p className="diagnosis">Test</p>
                                    <p className="diagnosis">Test</p>
                                </div>
                            </div>
                        </div>
                </div>
            </div>
        )
    }else {
        return(
            null
        )
    }
}