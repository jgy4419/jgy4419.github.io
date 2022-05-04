import React, {useState, useEffect} from 'react';
import './Emergency.scss'
import KakaoMap from './KakaoMap';

function Emergency(){
    return(
        <>
            <div className="title">응급실 페이지</div>
            <KakaoMap/>
        </>
    )
}

export default Emergency;