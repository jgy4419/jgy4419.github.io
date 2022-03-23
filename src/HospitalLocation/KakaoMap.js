/* global kakao */

import axios from 'axios';
import React, {useState, useEffect, Component} from 'react';
import Spinner from '../Spinner';
import './KakaoMap.scss'

const { kakao } = window;

function KakaoMap(){
    // 페이지가 로딩되면 카카오 지도 띄우도록 설정.
    let latitude = 0;
    let longitude = 0;
    let mapContainer;
    let mapOption;
    let map;
    let [spinner, spinnerChange] = useState(false);

    // x축, y축, 제목
    let allLocations = {
        x_axis: [], // 데이터에 있는 x축
        y_axis: [], // 데이터에 있는 y축
        title: [] // 병원 이름
    }

    useEffect(async () => {
        // 처음에 지도 표시해주기.
        mapContainer = document.getElementById('map'); // 지도를 표시할 div 
        mapOption = { 
            // 충주 중심좌표
            // center: new kakao.maps.LatLng(36.99196502823086, 127.92563283606664),
            center: new kakao.maps.LatLng(36.96908528922564, 127.87264184466144),
            level: 7 // 지도의 확대 레벨
        };

        // 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
        map = new kakao.maps.Map(mapContainer, mapOption);
        // 위치 찾기 버튼을 누르면 spinner 생성.
        spinnerChange(true)
        // 현재 내 위치를 찾아주고 찾아주면 그 위치로 지도를 이동시켜줌.
        return new Promise((resolve, reject) => {
            if(navigator.geolocation){
                navigator.geolocation.getCurrentPosition(function(position){
                    latitude = position.coords.latitude;
                    longitude = position.coords.longitude;
                    // 위치를 찾으면 카카오맵의 위치를 현재위치로 재설정해서 재로딩 시켜줌.
                    resolve(mapReset(latitude, longitude));
                }, function(error){
                    console.log(error);
                }, {
                    enableHighAccuracy: false,
                    maximumAge: 0,
                    timeout: Infinity
                });
            }else{
                alert('GPS를 지원하지 않습니다.');
                reject('실패');
            }
            // allLocation();
        })
    }, [])
    // 사이트가 재로딩되면서 내 위치를 새로 잡아줌.
    function reload(){
        window.location.reload();
    }
    // 내 위치 찾아주는 함수
    function mapReset(latitude, longitude){
        // 화면이 띄워지면 spinner 제거.
        spinnerChange(false);
        mapOption = { 
            center: new kakao.maps.LatLng(latitude, longitude), // 지도의 중심좌표
            level: 3 // 지도의 확대 레벨
        };
        map = new kakao.maps.Map(mapContainer, mapOption);   

        // 커스텀 오버레이에 표출될 내용으로 HTML 문자열이나 document element가 가능.
        let content = '<div class="customoverlay">' +
                        '<div class="textBox">' +
                            '<p class="myLocationText">내위치</p>' +
                        '</div>' +
                        '<img class = "myLocation" src="https://user-images.githubusercontent.com/76980526/159206316-67534985-8a03-4fe4-a375-68be2aa58149.jpeg"/>' +
                      '</div>';

        // 마커이미지 주소.
        var imageSrc = 'https://user-images.githubusercontent.com/76980526/159206316-67534985-8a03-4fe4-a375-68be2aa58149.jpeg',
            imageSize = new kakao.maps.Size(45, 45),
            imageOption = {offset: new kakao.maps.Point(27, 69)};

        // 마커가 표시될 위치
        var markerPosition  = new kakao.maps.LatLng(latitude, longitude),
            markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption); 
        

        // 전체 병원 위치 좌표 찍어주기.
        axios.get('http://localhost:8800/hospital')
        .then(res => {
            // 마커 이미지의 이미지 주소입니다
            var imageSrc = "https://st2.depositphotos.com/1561359/12005/v/600/depositphotos_120054088-stock-illustration-hospital-icon-sign.jpg"; 
                
            res.data.map(i => {
                var imageSize = new kakao.maps.Size(24, 35); 
                
                // 마커 이미지를 생성합니다    
                var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize); 
                
                // 마커를 생성합니다
                var marker = new kakao.maps.Marker({
                    map: map, // 마커를 표시할 지도
                    position: new kakao.maps.LatLng(i.xAxis, i.yAxis), // 마커를 표시할 위치 // 마커.. 여러개 띄우게 하기..
                    title : i.title, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
                    image : markerImage // 마커 이미지 
                });
            })
        })

        // 여기까지

        let customOverlay = new kakao.maps.CustomOverlay({
            map: map,
            position: markerPosition,
            content: content,
            yAnchor: 1
        });
    }
    return(
        <div>
            <div id="map">
                {
                    spinner === true
                    ? (<Spinner/>)
                    : null
                }
                <button onClick={
                    reload
                }>내 위치</button>
            </div>
        </div>
    )
}
export default KakaoMap;