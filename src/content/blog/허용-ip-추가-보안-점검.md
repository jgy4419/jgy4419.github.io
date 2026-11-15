---
title: 허용 IP 추가, 보안 점검
description: 리눅스 기반 gpu 서버 보안 정리
draft: true
pubDate: 2026-11-15
updatedDate: ''
category: 리눅스
tags:
  - 리눅스
heroImage: ''
---

## 리눅스 서버 보안의 기본 구조

1. 네트워크 접근 제어 : 특정 IP 만 서버에 접속할 수 있도록 제한한다.
2. 인증 및 SSH 보안 :서버에 접속할 수 있는 사용자를 제한하고 인증을 강화함
3. 계정 및 권한 관리 : 사용자별로 실행할 수 있는 명령과 접근 가능한 파일을 제한한다.
4. 서비스 및 포트 보안 : 외부에 공개할 필요가 없는 서비스의 접근을 차단한다.
5. 로그 및 모니터링 : 누가 언제 접속했고 어떤 문제가 발생했는지 확인한다.

## 접속 IP 추가하기 (가장 중요 부분)

**ex. GPU 환경**

| 항목 | 값 |
| --- | --- |
| GPU 서버 IP | 192.168.0.100 |
| SSH 포트 | 22 |
| FastAPI 포트 | 9111 |
| ComfyUI 포트 | 8188 |
| 허용할 개발자 IP | 203.0.113.10 |

> 여기서 개발자 IP 만 SSH 접속을 허용하고 싶으면 방화벽에 해당 IP 등록

```plain
# 방화벽 실행 상태
sudo systemctl status firewalld # 입력 후 acrive 된 거 확인

# 방화벽 활성화 여부
sudo firewall-cmd --state # running 결과가 뜨는지 확인

# 현재 적용 중인 방화벽 규칙
sudo firewall-cmd --list-all

# 등록된 서비스 확인
sudo firewall-cmd --list-services

# 허용된 포트 확인
sudo firewall-cmd --list-ports
```

위 기준으로 어떤 인터페이스와 영역에 어떤 서비스 및 포트가 허용되어 있는지 확인 가능

### 특정 IP 접속 허용하기

> `203.0.113.10` IP 에서만 SSH 접속을 허용한다 가정

```plain
sudo firewall-cmd \
  --permanent \
  --add-rich-rule='rule family="ipv4" source address="203.0.113.10" port port="22" protocol="tcp" accept'
```

옵션은 다음과 같다

| 옵션 | 의미 |
| --- | --- |
| `--permanent` | 영구적으로 규칙 저장 |
| `--add-rich-rule` | 상세 방화벽 규칙 추가 |
| `family="ipv4"` | IPv4 대상 |
| `source address` | 접속을 허용할 출발지 IP |
| `port="22"` | SSH 포트 |
| `protocol="tcp"` | TCP 프로토콜 |
| `acceot` | 접속 허용 |

**설정 후 확인 명령**
> sudo firewall-cmd --reload

**IP 대역 자체를 허용하는 것도 가능**
> `source address="203.0.113.0/24"` 이는 해당 대역에 포함된 IP를 허용한다는 의미이다.

### 반드시 확인해야 하는 기존 SSH 허용 규칙
**정말 특정 ip 만 허용하려면 아래 순서로 작업해야 된다.**
1. 현재 설정 확인
```
sudo firewall-cmd --get-active-zones
sudo firewall-cmd --list-all
sudo firewall-cmd --list-rich-rules
```

2. 허용할 IP 규칙 추가
> `--add-rich-rule` 명령어를 사용한다.
3. 기존 전체 SSH 허용 규칙 제거
> `sudo firewall-cmd --permanent --remove-service=ssh`
만약 `22/tcp` 가 직접 등록 되어져 있다면 추가 확인
> `sudo firewall-cmd --permanent --remove-port=22/tcp`
4. 방화벽 적용
> `firewall-cmd --reload`
5. 결과 확인
```
firewall-cmd --list-all
firewall-cmd --list-rich-rules
```

### IP 접속 규칙 삭제하기
```
sudo firewall-cmd --permanent \
  --remove-rich-rule='rule family="ipv4" source address="203.0.113.10" port port="22" protocol="tcp" accept'

sudo firewall-cmd --reload

# 이후 등록된 IP 규칙 확인
sudo firewall-cmd --list-rich-rules
```

## SSH 접속 보안 강화 (이어서 하기)
