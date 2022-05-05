import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import './Emergency.scss'
import EmeKakaoMap from './EmeKakaoMap';
import HospitalInformation from '../HospitalLocation/HospitalInformation'
// import KakaoMap from '../HospitalLocation/KakaoMap';

function Emergency(){
    let dispatch = useDispatch();
    let state = useSelector(state => state);
    useEffect(() => {
        dispatch({type: '지도기능', payload: {
            mapState: 1
        }})
        console.log(state[2].mapState);
    }, [])
    return(
        <>
            <div className="inner">
                <hr className="line"/>
                <div>
                </div>
                <section className="section">
                    <EmeKakaoMap/>
                    {/* input 값을 props로 보내기. */}
                    <HospitalInformation/>
                </section>
                {/* <button onClick={urlMain} className='backBtn'>
                    뒤로가기
                </button> */}
            </div>
        </>
    )
}

export default Emergency;