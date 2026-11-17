---
title: GPU 서버 다루기 (리눅스 서비스 관리 기초)
description: 리눅스 서버가 어떻게 동작하고 프로그램이 실행되는지 이해하기
draft: false
pubDate: 2026-11-17
updatedDate: ''
category: 리눅스
tags:
  - lunux
  - gpu
heroImage: ''
---

> 단순 리눅스 명령어를 외우기 보다는, 리눅스 서버가 어떻게 동작하고 프로그램이 실행되는지 이해하기

## 1. Linux 운영체제 기초

### Linux 기본 구조와 프로세스 관리

1. Linux 파일 시스템 : 파일과 디렉터리가 어떤 구조로 관리되는지 알아야 됨.

>

| 경로 | 파일 |
| --- | --- |
| `/` | 최상위 디렉터리 |
| `/home` | 사용자 홈 디렉터리 |
| `/etc` | 시스템 및 서비스 설정 파일 |
| `/var` | 로그, 캐시 등 가변 데이터 |
| `/usr` | 프로그램 및 라이브러리 |
| `/opt` | 별도로 설치한 프로그램 |
| `/tmp` | 임시 파일 |
| `/proc` | 프로세스 및 커널 정보 |
| `/dev` | 장치 파일 |

- Linux 에서는 Windows 처럼 C드라이브, D드라이브로 구분하는 방식이 아닌 하나의 루트 `/` 아래에 파일 시스템이 연결된다.

```plain
pwd # 현재 디렉터리 확인
ls # 파일 목록
cd # 디렉터리 이동
mkdir # 디렉터리 생성
cp # 파일 복사
mv # 파일 이동 및 이름 변경
rm # 파일 삭제
find # 파일 검색
cat # 파일 내용 출력
less # 파일 내용 페이지 단위 확인
head # 앞부분 확인
tail # 뒷부분 확인
```

추가로 `find, grep, sed` 는 앞으로 서버 소스를 분석할 때 자주 사용된다.

2. 프로세스와 PID

```plain
# ex.
ps aux | grep "[m]ain.py"
```

- `px aux` : 현재 실행 중인 프로세스를 확인하는 명령
- `ps -o pid,ppid,cmd -p 3028792` : 특정 PID의 프로세스 ID, 부모 프로세스 ID, 실행 명령어 확인
- PID : 현재 프로세스 ID
- PPID : 부모 프로세스의 ID
- Parent Process : 해당 프로세스를 실행시킨 부모 프로세스

**프로세스** : 실행 중인 프로그램을 의미한다.

- 예시로 GPU 서버에서 ComfyUI 를 실행했다 가정. `python main.py -port 9111`
- 이 명령어를 실행하면 Linux 는 해당 프로그램을 실행하기 위한 프로세스를 생성한다.
- 프로세스에서는 PID(Process ID)라는 고유 번호가 부여된다.

```plain
# ex. pid 기준으로 kill
kill 3028792
kill -9 3028792
```

> 둘 다 프로세스를 종료시키는 명령. 차이가 있다.

- `kill PID` : 기본적으로 SIGTERM 전달
- `kill -15 PID` : 정상 종료 요청
- `kill -9 PID` : SIGKILL, 강제 종료

중요한 건 `kill` 이 무조건 프로세스를 즉시 종료하는 명령어가 아니라는 것.

- SIGTERM은 프로그램에 종료할 기회를 주고, SIGKILL은 강제로 종료 시킨다.
- ComfyUI 처럼 GPU 메모리를 사용하는 프로그램은 정상 종료가 중요한 경우가 많아 무작정 `kill -9` 부터 사용하면 안됨.

**kill 명령어에서 -15, -9는 어느 시점에 종료?**

| 명령어 | 시그널 | 의미 |
| --- | --- | --- |
| `kill -15 PID` | SIGTERM | 정상 종료 요청 |
| `kill -9 PID` | SIGKILL | 강제 종료 |
| `kill -2 PID` | SIGINT | 인터럽트, Ctrl + C 와 유사 |
| `kill -1 PID` | SIGHUP | 연결 종료 등에 사용 |

**SIGTERM (-15) : 종료 요청 → 프로그램 정리 → 종료**
ex. `kill -15 PID`

> 뜻 : 이제 작업을 종료해줘, 종료 전에 정리할 거 있으면 정리하고 종료해. 프로그램은 이 신호를 받아서 종료 작업을 수행할 수 있다.

- 사용 기준 : 새로운 요청 접수 중단, 진행 중인 작업 정리, 파일 저장, 리소스 해제, 프로세스 종료

**SIGKILL (-9) : 운영체제가 강제 종료**

> 뜻 : 프로그램이 종료 요청을 무시하거나 정상적으로 종료되지 않을 때 사용하는 최후의 수단. SIGKILL은 프로그램이 가로채서 처리하거나 무시할 수 없다.

**추천 사용**

- ComfyUI 에서 영상 생성 작업이 진행 중이라면 SIGTERM 으로 정상 종료를 요청.
- SIGKILL은 작업이 중단되고 파일이 불완전하게 남는 등의 문제가 생길 수 있음

```python
# 추천 사용 순서
kill -15 PID

# 종료 여부 확인
ps -p PID

# 여전히 종료되지 않는다면 마지막 수단으로
kill -9 PID
```

참고로 `kill PID` 만 입력해도 기본 시그널인 SIGTERM 이 전달된다.

3. 포트와 네트워크 
`ss -lntp`

> 위 명령어는 현재 서버에서 어떤 프로그램이 어떤 TCP 포트를 열고 대기하고 있는지 확인하는 명령이다. (ss는 `Socket Statistics` - 소켓 통계의 약자)

- -l : Listening 상태인 소켓
- -t : TCP 소켓
- -n : 포트를 숫자로 표시
- -p : 해당 소켓을 사용하는 프로세스 표시

`ss -lntp | grep ":9111"`

> 9111 포트를 사용하는 프로세스만 필터링 하는 것. 아래 내용들을 알 수 있다.

- ComfyUI 서버가 실행되고 있는지?
- 9111 포트가 열려 있는지?
- 다른 프로그램이 이미 포트를 사용하고 있는지?
- 서버는 실행 중인데 API 요청이 실패하는 이유는 무엇인지
- 실행 폴더의 위치를 찾고 싶을 때 `pwdx PID` 로 찾기
- `systemctl` 에서 관리하는 프로세스인지 확인하려면 `systemctl status PID` 로 확인하기

## 2. Linux 서비스 관리 (systemd)

0. systemctl 서비스 등록 및 조회 방법

>

**조회**

```tsx
systemctl list-units --type=service // 으로 조회하고
systemctl list-units --type=service | grep "서비스명" // 이렇게 찾아서도 검색 가능
```

**서비스 명으로 검색**

```tsx
systemctl cat 서비스명
```

**서비스 등록 방법**

- 등록 위치

```tsx
cd /etc/systemd/system/ // 이 경로에 등록된 서비스들이 모여있음
```

- 등록

```tsx
[Unit]
Description=ComfyUI Server
After=network.target

[Service]
Type=simple
WorkingDirectory=<실행 경로>
ExecStart=<실행 명령어 보통 절대 경로로 지정하는 것 같음>
Restart=always
RestartSec=5
User=mango
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
```

> ExecStart는 쉘을 거치지 않아서 `source venv/bin/activate`  같은 건 못 씀 venv의 python/uvicorn을 절대경로로 직접 지정해야됨.

- 적용

```tsx
sudo systemctl daemon-reload // 유닛 파일 추가 / 수정 후 필수
sudo systemctl enable myservice.service // 부팅 시 자동 시작 등록
sudo systemctl start myservice.service
systemctl status myservice.service --no-pager
```

- 서비스 명으로 로그 확인

```tsx
// 이 로그는 python 소스의 logging.info(...) 로 등록된 소스가 실행되면 추가되는 방식
journalctl -u comfyui_api.service -f
```

1. systemd란?

- Linux 에서 서비스를 관리하는 시스템
- 예시로 ComfyUI 를 실행하는 방법은 여러 가지가 있다.

**직접 실행**

```plain
cd 절대경로
python main.py --port 9111
```

- 이렇게 실행 시 터미널 세션과 프로세스가 연결된다.
- 터미널을 종료하거나 실행 환경이 바뀌면 프로세스 관리가 번거로워질 수도 있음

**systemd 서비스로 실행**

```plain
systemctl start comfyui.service
```

- systemd가 해당 프로그램 서비스로 관리해준다.

**python main.py 와 systemd 서비스 차이**

> 실행되는 python 프로그램 자체는 같을 수 있음. 하지만 실행하고 관리하는 주체가 다르다.

직접 실행하는 방식

> `python main.py` 이면 사용자가 터미널에서 직접 Python 프로그램을 실행하는 것

- 직접 실행하고 종료 가능
- 실행 결과가 터미널에 출력
- 터미널과 프로세스의 관계를 고려해야 함
- 서버 재부팅 후 자동으로 실행되지 않는다.
- 별도의 프로세스 관리가 필요하다.

systemd 로 실행하는 방식

> `systemctl start comfyui.service` -> systemd 라는 서비스 관리자가 실행을 담당한다.

- 터미널과 독립적으로 관리 가능
- 서버 부팅 시 자동 실행 설정 가능
- 서비스 재시작 및 종료 가능
- 비정상 종료 시 자동 재시작 정책 설정 가능
- 로그를 `journalctl` 로 확인이 가능.

**추가 명령 리스트**

| `systemctl start` | 서비스 시작 |
| --- | --- |
| `systemctl stop` | 서비스 중지 |
| `systemctl restart` | 서비스 재시작 |
| `systemctl ststus` | 서비스 상태 확인 |
| `systemctl enable` | 부팅 시 자동 실행 등록 |
| `systemctl disable` | 자동 실행 해제 |
| `systemctl cat` | 서비스 설정 내용 확인 |
| `systemctl list-units` | 서비스 목록 확인 |

2. 서비스 설정 파일 이해하기

```plain
# 아래 명령어로 등록된 서비스 정보를 알 수 있다.
systemctl cat 서비스명
```

```plain
[Unit]
Description=ComfyUI Server
After=network.target

[Service]
Type=simple
WorkingDirectory=<실행 경로>
ExecStart=<실행 명령어 보통 절대 경로로 지정하는 것 같음>
Restart=always
RestartSec=5
User=mango
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
```

| 설정 | 의미 |
| --- | --- |
| `Description` | 서비스 설명 |
| `After` | 다른 서비스 이후 실행 |
| `User` | 서비스를 실행할 사용자 |
| `WorkingDirectory` | 실행 기준 디렉터리 |
| `ExecStart` | 실제 실행 명령어 |
| `Restart` | 종료 시 재시작 정책 |
| `WantedBy` | 부팅 시 서비스 연결 대상 |

- 특히 `ExecStart` 와 `WorkingDirectory` 는 반드시 이해하기
- 이유는 등록한 서비스 소스를 수정하고 재시작할 때 실제로 어떤 Python 환경과 경로에서 실행되는지 알아야 하기 때문.

3. 로그 확인하기

> 서비스를 재시작했는데 실행이 안된다면..? 등에 대한 이유 확인 차 로그를 확인하는데 이 때 사용하는 것이 `journalctl`

```plain
journalctl -u comfyui.service

# 순서별로
systemctl restart 서비스명 # 재시작
systemctl status 서비스명 # 상태 확인
journalctl -u 서비스명 -n 100 --no-pager
# -u(Unit) : 특정 시스템 서비스의 로그만 지정해서 보여주는 옵션 (서비스 로그만 확인 하겠다는 뜻)
# -n(Lines) : 출력할 로그의 줄 수를 제한. 지정안하면 최근 10줄을 보여줌.
# --no-pager : 로그 출력 시 화면 단위로 끊어서 보여주는 페이지 기능을 끄고 전체 로그를 한 번에 텍스트로 출력하라는 뜻
```

- 최근 로그만 확인하고 싶다면? `journalctl -u 서비스명 -n 100`
- 실시간으로 로그를 확인하고 싶다면? `journalctl - 서비스명 -f`
- 특정 시간 이후의 로그 확인 `journalctl -u 서비스명 --since :1 hour age"`
- GPU 상태 및 메모리 `nvidia-smi`
- Lunux 커널 오류 `journalctl -k`
- 현재 RAM 상태 `free -h`

> 예시로 GPU 드라이버나 시스템 메모리 부족으로 프로세스가 종료되는 경우에는 서비스 로그만으로 원인을 전부 파악하지 못할 수 있음. 그럴 땐 커널 로그도 확인

`journalctl -k -p err --since "1 hour ago"`

**여기까지 학습하면 아래 문제들 해결 가능**

- 서비스가 시작되지 않는 문제
- Python 패키지를 찾지 못하는 문제
- 포트 충돌 문제
- 서비스 실행 중 예외 발생

## 3. Linux 권한과 쉘

1. Linux 사용자의 권한

> Linux 는 여러 사용자가 동시에 시스템을 사용할 수 있도록 설계되어져 있다.
> 파일마다 읽기, 쓰기, 실행 권한이 존재한다.

```plain
# 입력
ls -l

# 결과
-rwxr -xr-- 1 계정 계정 1024 main.py
```

- 권한은 아래와 같다.

```plain
- rwx r-x r--
# rwx : 소유자
# r-x : 그룹
# r-- 기타 사용자
```

- `r` : 읽기
- `w` : 쓰기
- `x` : 실행

**함께 공부할 명령어**

```plain
chmod
chown
whoami
id
sudo
```

`whoami` (현재 사용자 확인) : 현재 터미널에서 로그인하여 작업 중인 사용자 계정의 이름을 출력한다.

`sudo` (관리자 권한으로 실행) : `Superuser Do` 의 줄임말로, 일반 사용자 계정에서 최고 관리자(root) 권한이 필요한 명령어를 일시적으로 실행할 때 사용한다.

- root 사용자의 암호가 아니라 현재 로그인한 내 계정의 비밀번호를 입력한다.
- `sudo -i` 또는 `sudo -s` : root 계정으로 완전히 전환
- `sudo -i` : 현재 내 계정이 실행할 수 있는 sudo 권한 목록 확인

`chmod` (파일/디렉터리 권한 변경) : 파일이나 디렉터리의 읽기, 쓰기, 실행 권한을 변경한다.

- 권한 구성 : 소유자(User), 그룹, 기타 사용자 3가지 주체로 나뉜다.
- 숫자 모드 이해하기 r(읽기) = 4, w(쓰기) = 2, x(실행) = 1

ex. `755` -> 소유자 (4 + 2 + 1 = 7 : 읽기/쓰기/실행), 그룹(4+1=5 : 읽기/실행)

- 사용 방법

```plain
chmod [권한값 또는 옵션] [파일명]

# ex. 스크립트 파일에 실행 권한 부여
chmod 755 script.sh
# ex. 하위 디렉터리 및 파일까지 모두 권한 변경 (-R 옵션)
chmoe -R 755 my_folder/
```

`chrown` (파일 / 디렉터리 소유자 및 그룹 변경) : `Change Owner` 의 줄임말로, 파일이나 디렉터리의 소유자와 소유 그룹을 변경한다.

- 사용 방법

```plain
chown [소유자] [파일명]
chown [소유자]:[그룹] [파일명]

# ex. 파일 소유자를 user1로 변경
sudo chown user1 file.txt
# ex. 소유자는 user1, 그룹은 group1로 동시 변경
suwo chown user1:group1 file.txt
# ex. 폴더와 그 안의 모든 파일 / 하위폴더 소유권 일괄 변경 (-R)
sudo chown -R user1:group1 /path/to/directory
```

> GPU 서버에서 파일을 수정하거나 서비스를 재시작할 때 권한 문제가 발생할 수 있으니 위 명령어 알아두기

2. 쉘과 파이프라인

```plain
# ex
P=$(find / -path "*/workflows-api/video/minimax-talking-avatar-api.json" 2>/dev/null | head -1)
```

| 문법 | 의미 |
| --- | --- |
| $() | 명령어 실행 결과를 반환 |
| l(특수문자로) | 앞 명령어의 결과를 다음 명령어로 전달 |
| > | 표준 출력을 파일로 저장 |
| 2> | 표준 오류를 파일로 저장 |
| 2>/dev/null | 오류 출력을 버림 |
| && | 앞 명령 성공 시 다음 명령 실행 |
| ; | 앞 명령 결과와 관계없이 다음 명령 실행 |
| $변수 | 변수에 저장된 값 사용 |

`P=$(...)` 형태로 하는 이유

- 위 명령기준 `find` 명령어의 실행 결과를 P 라는 변수에 저장하라는 것. 즉, `P = find_file()` 
- python의 변수 항당과 비슷하게 생각하기. 사용은 `echo $P` 로 사용. (P는 선언한 변수명)

예시로 `find / -name "main.py" 2>/dev/null | head -1` 명령어는 아래 순서대로 동작

- `find` : 전체 경로에서 main.py 검색
- `2>/dev/null` : 권한 오류 등의 메시지 무시
- `|` : 검색 결과를 다음 명령으로 전달
- `head -1` : 첫 번째 결과만 출력

이런 문법을 이해하면 `Claude` 가 작성해 주는 복잡한 Linux 명령어도 직접 분석할 수 있다

## 4. Linux 에서 Python 서버가 실행되는 구조

**실제 과정 이해하기**

1. Linux 서버 부팅
2. systemd가 서비스 실행
3. systemd가 Python 실행 명령어 호출
4. Python 인터프리터가 실행됨
5. Python이 FastAPI 또는 ComfyUI 코드를 읽음
6. 서버 프로그램이 지정된 포트에서 요청을 기다린다.
7. 클라이언트가 HTTP 요청을 보낸다.
8. 서버가 요청을 처리하고 응답한다.

**알아야되는 지식**

```plain
Python Interpreter : Python 코드를 실행하는 프로그램
Virtual Environment : 프로젝트별 Python 실행 환경
pip : Python 패키지 설치 도구
PATH : 실행 파일을 검색하는 경로
Environment Variables : 환경 변수
Uvicorn : ASGI 서버
Process : 실행 중인 프로그램
Thread : 프로세스 내 실행 흐름
Async / Await : 비동기 처리
```

**python 실행되는 경로 찾기**

- `which python` : 쉘이 찾아내는 Python 실행 경로 확인
- `python -c "import sys; print(sys.executable)"` : 실제 실행 중인 Python 인터프리터 경로를 확인

> GPU 서버에서는 Pyhon 환경이 여러 개 존재하는 경우가 많다.

```plain
# ex.
/usr/bin/python3
/data/mango/venv/bin/python
...
```

- 같은 파이썬 코드를 실행해도 어떤 인터프리터를 사용하느냐에 따라 설치된 라이브러리가 다를 수 있다.
- 이걸 모르는 경우 `ModuleNotFoundError` 같은 오류 발생 시 원인 찾기가 어려움

## 5. GPU 서버 운영에 필요한 기초

> 일반적인 Linux 서버 관리와 GPU 서버 관리는 조금 다르다.

**필요한 명령**

- `nvidia-smi` : GPU 사용량 및 메모리 확인
- `watch` : 명령어 주기적 실행
- `free -h` : RAM 사용량 확인

RAM 사용량 확인 결과에서 알아야 되는 구성
- total : 전체 RAM
- used : 현재 사용 중인 RAM
- free : 완전히 비어 있는 RAM
- shared : 공유 메모리
- buff/cache : 파일 캐시 및 버퍼 등
- available : 새로운 프로그램에서 사용할 수 있을 것으로 예상되는 메모리

> Linux 는 남는 RAM을 파일 캐시로 활용하기 때문에 `free` 가 적다고 무조거 메모리가 부족한 게 아니다. `available` 부분도 잘 확인하자.

Swap : 스왑 메모리
- RAM 이 부족할 때 디스크 공간 일부를 메모리처럼 활용하는 영역
- RAM 에 당장 사용하지 않는 메모리 페이지를 디스크로 옮겨서 RAM 공간 확보 가능.
- total : 전체 Swap 용량
- used : 사용 중인 Swap
- free : 남은 Swap

> Swap 은 RAM 과 속도가 다르다. 디스크를 사용하기 때문에 RAM보다 훨씬 느리다.

특히 GPU 영상 생성 서버에서 RAM 과 VRAM은 서로 다른 영역
- RAM : CPU가 사용하는 시스템 메모리
- VRAM : GPU가 사용하는 그래픽 메모리

**추가 알아야되는 명령**
- `df -h` : 디스크 용량 확인
- `du -sh` : 디렉터리 용량 확인
- `top` : 프로세스 및 CPU 사용량
- `htop` : 프로세스 모니터링
- `CUDA` : GPU 연산 플랫폼 - `nvidia-smi` 명령으로 확인
- `VRAM` : GPU 메모리 - 동일하기 `nvidia-smi` 명령으로 확인 가능. `watch -n 1 nvidia-smi` 로 실행하면 1초마다 GPU 사용량을 갱신시켜준다.

**`OOM` : 메모리 부족으로 인한 실패 시 대처 방법**
- GPU 메모리 부족한지 확인 : `nvidia-smi`
- 시스템 RAM 부족한지 확인 : `free -h`
- Linix 커널의 OOM Killer 동작 확인 : `journalctl -k | grep -i "out of memory"`
