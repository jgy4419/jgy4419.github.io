import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import './Emergency.scss'
import EmeKakaoMap from './EmeKakaoMap';
import EmergencyList from './EmergencyList';

function Emergency(){
    let dispatch = useDispatch();
    let state = useSelector(state => state);
    useEffect(() => {
        dispatch({type: '지도기능', payload: {
            mapState: 1
        }})
        console.log(state[2].mapState);

        // url hispory
        // let unlisten = history.listen(location => {
        //     if(history.action === 'POP'){
        //         location.reload();
        //     }
        // });
    }, [])
    return(
        <div className="contain">
            <div className="inner">
                <hr className="line"/>
                <div>
                </div>
                <section className="section">
                    <EmeKakaoMap className="emeKakakaomap"/>
                    {/* input 값을 props로 보내기. */}
                    <EmergencyList className="emergencyList"/>
                </section>
                {/* <button onClick={urlMain} className='backBtn'>
                    뒤로가기
                </button> */}
            </div>
        </div>
    )
}

export default Emergency;