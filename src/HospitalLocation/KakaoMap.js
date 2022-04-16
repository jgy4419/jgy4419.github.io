/* eslint-disable */
/* global kakao */

import axios from 'axios';
import React, {useState, useEffect, Component} from 'react';
import Spinner from '../Spinner';
import './KakaoMap.scss'

import {connect, useSelector, useDispatch} from 'react-redux';

const { kakao } = window;

function KakaoMap(){
    let state = useSelector(state => state);
    let dispatch = useDispatch();

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

    let [changeInfoDiv, setChangeInfoDiv] = useState('');

    useEffect(async () => {
        // 처음에 지도 표시해주기.
        mapContainer = document.getElementById('map'); // 지도를 표시할 div 
        mapOption = { 
            // 충주 중심좌표
            center: new kakao.maps.LatLng(36.99196502823086, 127.92563283606664),
            level: 7 // 지도의 확대 레벨
        };
        let testBtn = document.querySelector('.testBtn');
        function panTo() {
            // 이동할 위도 경도 위치를 생성합니다 
            var moveLatLon = new kakao.maps.LatLng(state[0].clickLocationsX, state[0].clickLocationsY);
                
            // 지도 중심을 부드럽게 이동시킵니다
            // 만약 이동할 거리가 지도 화면보다 크면 부드러운 효과 없이 이동합니다
            map.panTo(moveLatLon);             
        }       
        // /////////////////////////////
        // 테스트라는 변수에 함수를 보냄
        // dispatch({type: '테스트', payload: {func: panTo()}});
        ////////////////////////////////
        
        testBtn.addEventListener('click', function(){
            panTo();
        })
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
                    // 내위치를 지정.
                    dispatch({type: '내위치', payload: {x: latitude, y: longitude}});
                    // 위치를 찾으면 카카오맵의 위치를 현재위치로 재설정해서 재로딩 시켜줌.
                    // 실제 내 위치(마커적용)
                    resolve(mapReset(state[0].clickLocationsX, state[0].clickLocationsY));
                    // test 위치(마커적용)
                    // resolve(mapReset(36.99196502823086, 127.92563283606664));
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
    // 중심 좌표나 확대 수준이 변경됐을 때 지도 중심 좌표에 대한 주소 정보를 표시하도록 이벤트를 등록합니다
    kakao.maps.event.addListener(map, 'idle', function() {
        searchAddrFromCoords(map.getCenter(), displayCenterInfo);
    });
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
            // test 위치
            // center: new kakao.maps.LatLng(36.99196502823086, 127.92563283606664),
            // 내 위치
            center: new kakao.maps.LatLng(state[0].clickLocationsX, state[0].clickLocationsY), // 지도의 중심좌표
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
        function makeOverListener(map, marker, infowindow) {
            return function() {
                infowindow.open(map, marker);
            };
        }
        
        // 인포윈도우를 닫는 클로저를 만드는 함수입니다 
        function makeOutListener(infowindow) {
            return function() {
                infowindow.close();
            };
        }
        let customOverlay = new kakao.maps.CustomOverlay({
            map: map,
            position: markerPosition,
            content: content,
            yAnchor: 1
        });
                // 주소-좌표 변환 객체를 생성합니다
        var geocoder = new kakao.maps.services.Geocoder();

        var marker = new kakao.maps.Marker(), // 클릭한 위치를 표시할 마커입니다
            infowindow = new kakao.maps.InfoWindow({zindex:1}); // 클릭한 위치에 대한 주소를 표시할 인포윈도우입니다

        // 현재 지도 중심좌표로 주소를 검색해서 지도 좌측 상단에 표시합니다
        searchAddrFromCoords(map.getCenter(), displayCenterInfo);

        function searchAddrFromCoords(coords, callback) {
            // 좌표로 행정동 주소 정보를 요청합니다
            geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), callback);         
        }
    }
    // 지도 좌측상단에 지도 중심좌표에 대한 주소정보를 표출하는 함수입니다
    function displayCenterInfo(result, status) {
        var infowindow = new kakao.maps.InfoWindow({zIndex:1});
        if (status === kakao.maps.services.Status.OK) {
            // infoDiv의 innerHTML 값을 전송
            var infoDiv = document.getElementById('centerAddr');
            for(var i = 0; i < result.length; i++) {
                // 행정동의 region_type 값은 'H' 이므로
                if (result[i].region_type === 'H') {
                    infoDiv.innerHTML = result[i].address_name;
                    break;
                }
            }
            changeInfoDiv = infoDiv.innerHTML;
            // 장소 검색 객체를 생성합니다
            var ps = new kakao.maps.services.Places();
            // 키워드로 장소를 검색합니다
            ps.keywordSearch(`${changeInfoDiv} 병원`, placesSearchCB); 

            // 키워드 검색 완료 시 호출되는 콜백함수 입니다
            function placesSearchCB (data, status, pagination) {
                if (status === kakao.maps.services.Status.OK) {

                    // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
                    // LatLngBounds 객체에 좌표를 추가합니다
                    var bounds = new kakao.maps.LatLngBounds();

                    for (var i=0; i<data.length; i++) {
                        displayMarker(data[i]);    
                        bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
                    }       

                    // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
                    map.setBounds(bounds);
                } 
            }

                // 지도에 마커를 표시하는 함수입니다
            function displayMarker(place) {
                
                // 마커를 생성하고 지도에 표시합니다
                var marker = new kakao.maps.Marker({
                    map: map,
                    position: new kakao.maps.LatLng(place.y, place.x) 
                });
                // 병원 데이터들을 redux로 넣어주는 부분.
                // 나중에 추가적으로 좌표 작업하기.
                dispatch({type: '병원정보', payload: {
                    hospital: place
                }})
                // 마커에 클릭이벤트를 등록합니다
                kakao.maps.event.addListener(marker, 'mouseover', function() {
                    // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
                    infowindow.setContent(`<div style=
                        "padding:5px;
                        text-align: center;
                        width: 150px;
                        height: 30px;
                        font-size:13px;
                        font-weight: 700;"
                    >` + place.place_name + '</div>');
                    infowindow.open(map, marker);
                });
            }
        }
    }
    return(
        <div>
            <div id="map">
                {
                    spinner === true
                    ? (<Spinner/>)
                    : null
                }
                <div className="btn">
                    <button onClick={
                        reload
                    }>내 위치</button>
                    <button className="testBtn">병원 찾기</button>
                </div>
                <div className="hAddr">
                    <span className="title">지도중심기준 주소정보 : </span>
                    <span id="centerAddr"></span>
                </div>
            </div>
        </div>
    )
}
export default KakaoMap;