---
title: Shell Script (.sh 파일)
description: 사용 방법 또는 적용 방법
draft: false
pubDate: 2026-11-15
updatedDate: ''
category: 리눅스
tags:
  - ShellScript
heroImage: ''
---

> 리눅스 터미널에서 직접 입력하는 명령어들을 하나의 파일에 작성해두고, 파일 실행만으로 여러 명령어를 순차적으로 자동 실행할 수 있도록 만든 파일

- 서버 운영이나 AI GPU 서버 관리에서도 상당히 자주 사용한다.

**Python + FastAPI 서버 기준으로 자동화할 수 있는 것들**

- Python 가상환경 활성화
- 필요한 라이브러리 설치
- FastAPI 서버 실행
- 특정 프로세스 종료
- 로그 파일 생성
- GPU 서버 상태 확인
- ComfyUI 서버 실행

**`.sh` 파일이란**

- 일반적인 터미널 명령어이다.

```plain
cd /data/mango
source venv/bin/activate
python main.py
```

- Shell Script 작성

```plain
#!/bin/bash

cd /data/mango
source venv/vin/activate
python main.py

# 위 처럼 만들어두고
./start.sh # 명렁으로 실행.
```

> 즉, 터미널에서 실행하는 명령어를 파일에 저장한 것이라 이해하기

**Shell 이란**

> 사용자와 리눅스 운영체제 사이에서 명령어를 해석하고 실행해 주는 프로그램이다.

| 종류 | 설명 |
| --- | --- |
| Zsh | macOS 에서 기본적으로 많이 사용한다. |
| Sh | POSIX 표준 기반의 기본 Shell |
| Fish | 사용자 편의성을 강조한 Shell |

- `.sh` 파일은 특정 Shell 에서 실행하도록 작성할 수 있다.
- 일반적으로 리눅스 서버에서는 Bash 를 많이 사용.

**`.sh`파일 생성 및 실행**

1. 파일 생성

```plain
touch start.sh
# 또는 편집기를 사용해 생성
vi start.sh
```

1. 기본 코드 작성

```plain
#!/bin/bash

echo "서버 실행을 시작합니다."

pwd

ls -al

echo "작업 완료"
```

| 코드 | 설명 |
| --- | --- |
| `#!/bin/bash` | Bash로 실행하겠다는 선언 |
| `echo` | 문자열 출력 |
| `pwd` | 현재 디렉터리 확인 |
| `ls -al` | 파일 및 디렉터리 목록 확인 |

1. 실행 권한 부여새로 만든 `.sh` 파일은 실행 권한이 없을 수 있다.# 권한 부여
chmoe +x start.sh

# 권한 확인

ls -l start.sh
ex.# x가 실행 권한임.
-rwxr-xr-x 1 user user 100 Nov 12 08:00 starth.sh

2. 실행 방법
    - 직접 실행`./start.sh` ← 실행 권한이 필요하다.
    - Bash로 실행`bash [start.sh](<http://start.sh>)` ← 실행 권한이 없어도 Bash가 파일을 읽어서 실행할 수 있다.

**Shell Script 기본 문법**

1. 주석

```plain
#!/bin/bash

# 서버 실행 스크립트

echo "Hello Linux"
```

2. 변수

```plain
#!/bin/bash

SERVER_NAME="AI SERVER"
PORT=9111

echo $SERVER_NAME
echo $PORT

# -----------------

# 이 아래부턴 출력

AI Server
9111
POST=9111 # 올바른 방식
PORT = 9111 # 잘못된 방식
echo ${PORT} # ${변수명} 형태를 사용한다면 다른 문자열과 구분하기 편하다

    - 변수 작성 시 주의 사항 (등호 앞뒤에 공백을 넣으면 안됨
    - 변수 사용 시 `$` 를 붙인다.
```

3. 사용자 입력#!/bin/bash

```plain
echo "실행할 서버 이름을 입력하세요"

read SERVER_NAME

echo "선택한 서버: ${SERVER_NAME}"
`read` 는 터미널에서 사용자의 입력을 받아 변수에 저장한다.
```

4. 조건문 (if)#!/bin/bash

```plain
PORT=9111

if [ $PORT -eq 9111 \]: then
	echo "AI 서버 포트입니다."
else
	echo "다른 포트입니다."
fi

// -----------------------

# 문법 및 구조

if [ 조건 ]; then
    실행할 명령어
elif [ 다른 조건 ]; then
    실행할 명령어
else
    실행할 명령어
fi
```

- 자주 사용하는 비교 연산자

| 연산자 | 의미 |
| --- | --- |
| `-eq` | 숫자가 길다 |
| `-ne` | 숫자가 다르다 |
| `-gt` | 크다 |
| `-lt` | 적다 |
| `-ge` | 크거나 같다 |
| `-le` | 작거나 같다 |

| `=` | 문자열이 같다 |\`
`| `!=\` | 문자열이 다르다 |

- 파일이나 디렉터리를 확인할 때는 아래처럼 같이 사용함.

| 조건 | 의미 |
| --- | --- |
| `-f` | 일반 파일이 존재하는가? |
| `-d` | 디렉터리가 존재하는가? |
| `-e` | 파일 또는 경로가 존재하는가? |
| `-x` | 실행이 가능한가? |

ex.

```python
#!/bin/bash

for PORT in 9111 9112 9113
do
	echo "확인할 포트: ${PORT}"
done

# 출력
확인할 포트: 9111
확인할 포트: 9112
확인할 포트: 9113
```

> 여러 서버나 프로세스 상태를 반복해서 확인할 때 유용하다.
>

5. 함수

```python
!!/bin/bash

start_server() {
	echo "AI 서버를 실행합니다."
}

stop_server() {
	echo "AI 서버를 종료합니다."
}

start_server
stop_server
```

> 함수로 자주 사용하는 명령어들을 묶어 놓을 수 있다.
>

**실무에서 자주 사용하는 문법**

1. 매개변수 전달

    > `.sh` 파일을 실행할 때 외부에서 값을 전달할 수 있다.
    > 

```python
#!/bin/bash

echo "첫 번째 값: $1"
echo "두 번째 값: $2"
echo "전체 전달된 값: $@"
echo "전달된 인자 개수: $#"
```

    - 실행 : `./start.sh AI 9111`
    - 출력

```python
첫 번째 값: AI
두 번째 값: 9111
전체 전달된 값: AI 9111
전달된 인자 개수: 2
```

    - 자주 사용하는 특수 변수

        | 변수 | 의미 |
        | --- | --- |
        | `$0` | 실행한 스크립트 이름 |
        | `$1` | 첫 번째 인자 |
        | `$2`  | 두 번째 인자 |
        | `$0` | 전달된 모든 인자 |
        | `$#` | 전달된 인자 개수 |\`
`       |`$?` | 직전 명령어의 종료 코드 |`
`       |`$$\` | 전체 Shell 프로세스의 PID |

        > 실무에서는 서버 포트나 실행 환경을 외부에서 전달할 때 유용하다.
        > 

2. 명령어 실행 결과를 변수에 저장

    > Shell Script 에서는 명령어 실행 결과도 변수에 담을 수 있다.
    > 

```python
#!/bin/bash

CURRENT_DIR=${pwd}
CURRENT_DATE=${date}

echo "현재 경로: ${CURRENT_DIR}"
echo "현재 시간: ${CURRENT_DATE}"
```

    `VARIABLE=${명령어}`

    - 명령어의 실행 결과(stdout)를 변수에 저장하는 방식
    - 예시로 실행 중인 Python 프로세스를 확인할 수 있다.

```python
PROCESS=${pqrep -f "main.py")

echo "Python PID: ${PROCESS}"
```

3. 파이프 (Pipe)

    > 앞 명령어의 결과를 다음 명령어의 입력으로 전달하는 기능
    > 

    `ps -ef | grep python`

    - 실행 흐름 : `ps -ef` (실행 중인 프로세스 전체 출력) → `grep python` (출력 결과에서 python 문자열 검색)

    ex. `ss -ltnp | grep ":9111"` → 포트 9111을 사용하는 프로세스를 검색

4. 출력 리다이렉션 (Redirect)

    > 명령어의 실행 결과를 파일에 저장할 수 있다.
    > 

```python
echo "Server Start" > server.log
```

    - `>` 는 기존 내용을 덮어쓴다.

```python
echo "Server Running" >> server.log
```

    - `>>` 는 기존 내용 뒤에 추가한다.
    - 에러 로그를 별도로 저장하는 것도 가능하다.

```python
python main.py > server.log 2> error.log
```
