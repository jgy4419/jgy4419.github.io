---
title: Web Server 와 WAS
description: Web Server, WAS 구성 정리
draft: false
pubDate: 2026-11-25
updatedDate: ''
category: 개발
tags:
  - server
  - cs
heroImage: ''
---

## Nginx, Apache, WAS
> 위 세 개는 서로 경쟁하는 기술이라기 보다는 웹 서비스를 구성하는 각자의 역할이 있는 기술이다.

### 구조 이해하기
1. client (사용자) 가 HTTP / HTTPS 요청
2. Web Server (Nginx / Apache) 에서 정적 파일 제공, HTTPS 처리, 요청 분배, 프록시 요청 전달.
3. WAS / Application Server (Tomcat / Uvicon + FastAPI 등) 에서 비즈니스 로직, API 처리, 은증, 데이터 가공 작업
4. DB Server (MySQL) 또는 AI Server (ComfyUI / GPU 모델)로 요청 전송

**핵심**
- Web Server : 외부 요청을 받아서 적절한 곳으로 전달
- WAS : 실제 프로그램 로직을 실행
- DB Server : 데이터를 저장하고 조회
- AI Server : AI 모델을 실행하고 결과 생성

## Web Server 란?
> 대표적으로 Nginx, Apache HTTP Server 가 있다.

**주요 역할**

1, 정적 파일 제공
ex. React 로 개발한 웹 서비스를 배포했다 가정. 빌드하면 아래와 같은 파일들이 만들어 진다.

```
dist/
 ├── index.html
 ├── assets/
 │    ├── index.js
 │    └── index.css
 └── favicon.ico
```

> 사용자가 웹 사이트를 접속하면 Nginx 나 Apache 가 해당 파일을 전달할 수 있다. 이런 파일은 별도의 WAS 를 거치지 않고 제공할 수 있음.

2. Reverse Proxy (리버스 프록시)
> FastAPI 서버가 8000포트에서 실행 중이라 가정

- 사용자는 `https://example.com/api/users` 로 요청하지만, 실제 FastAPI 서버는 `localhost:8000` 에서 동작할 수 있음.
- Nginx가 중간에서 요청을 받아 FastAPI 로 전달하는 것.

```
server {
    listen 80;
    server_name example.com;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
    }
}
```

- 이렇게 하면 사용자는 8000번 포트를 직접 알 필요가 없음

3. HTTPS / SSL 처리
- SSL 인증서를 실행하고 HTTPS 통신을 처리할 수 있다.
- 일반적으로 Nginx나 Apache에 인증서를 설정하고 내부 WAS 에는 HTTP로 전달하는 구조도 많이 사용한다.

4. 요청 분배 (Load Balancing)
> 동일한 애플리케이셔 서버가 여러 대 있으면 요청을 분배할 수 있다.

```
              Nginx
                |
       ┌────────┼────────┐
       ↓        ↓        ↓
    WAS-1     WAS-2     WAS-3
```


이렇게 하면 하나의 서버에 요청이 집중되는 것 방지 가능.

## WAS 란?
- `Web Application Server` 의 약자
- 쉽게 말하면 사용자의 요청을 받아서 실제 프로그램 코드를 실행하는 서버라 이해하기.

**대표적인 기술**
|WAS / 애플리케이션 런타임|주요 사용 기술|
|---|---|
|Tomcat|Java / Spring|
|Uvicorn|Python / FastAPI|
|Gunicorn|Python 애플리케이션 시행 및 프로세스 관리|
|WildFly|Java / Jakarta EE|

**주의할 부분**
- Tomcat 은 전통적인 Java WAS에 해당하지만
- Uvicorn은 ASGI 서버이고 Gunicorn은 프로세스 관리자 역할을 하는 WSGI/ASGI 애플리케이션 서버 실행 도구이다.
- 모두 똑같은 WAS 가 아님.

ex. spring 으로 개발한 API
```java
@GetMapping("/users")
public List<User> getUsers() {
    return userService.findAll();
}
```

- 사용자가 `/users` 를 요청하면 WAS가 해당 코드를 실행하고 DB 에서 데이터를 조회한 다음 결과를 반환.
- 즉, Web Server 가 요청을 전달했다면 WAS는 실제 작업을 수행하는 역할이라 보면 된다.

## 꼭 Web Server 와 WAS 는 같이 사용해야 되나?
> 아님, 상황에 따라 다르다.

### 1. Web Server 없이 WAS 만 사용
> Client -> FastAPI(Uvicorn)
API 처리 + 응답만 수행

- 개발 환경이나 소규모 내부 서비스에서 사용 가능하다. 단, 운영 환경에서는 HTTPS, 접근 제어, 프록시 등의 요구사항을 별도로 고려해야됨.

### 2. Web Server + WAS
> Client -> Nginx -> FastAPI (Uvicorn) -> DB

- 정적 파일, HTTPS, Reverse Proxy 등을 Nginx 가 담당하고 FastAPI가 API 를 처리한다.

### 3. Web Server + 여러 WAS
> client -> Nginx (Load Balancing) -> Spring / Tomcat or FastAPI

- 여러 종류의 애플리케이션을 하나의 진입점에서 관리할 수 있다.

## 그럼 Vercel 은 어떤 역할을 해주나?
### Vercel 은 Web Server 역할을 대신 하는가? (맞음)
ex. React 프로젝트를 Vercel에 배포

```
React 프로젝트
      |
   npm run build
      |
   dist 생성
      |
    Vercel
      |
  사용자 브라우저
```
- React 는 빌드 시 HTML, CSS, JS 파일이 만들어진다.
- Vercel은 이 파일들을 저장하고 CDN 등을 통해 사용자에게 전달함.
- 이 과정에서 개발자가 직접 Nginx를 설치하거나 Apache를 설정할 필요가 없다.

**즉, 아래와 같은 작업을 Vercel이 플랫폼 차원에서 제공.**
- 정적 파일 호스팅
- CDN 을 통한 파일 전달
- HTTPS 인증서 및 도메인 연결
- 요청 라우팅
- 배포 버전 관리
- CI/CD (추가 기능)
