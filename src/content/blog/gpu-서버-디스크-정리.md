---
title: GPU 서버 디스크 정리
description: 서버에서 사용하지 않는 서비스, 모델, 노드 제거
draft: false
pubDate: 2026-11-24
updatedDate: ''
category: 리눅스
tags:
  - lunux
heroImage: ''
---

**작업 개요**

> 새로 오픈한 영상 서버에 모델 등을 설치하다 보니 디스크 용량이 92% 까지 차지하는 문제가 발생.

> 서버 내에 사용 안하고 있는 서비스, 사용 안 하는 모델들이 있는지 전체적으로 조사해 정리하는 작업 진행

## 0. 작업 순서

> 뭘 지울지 정하기 보다는 뭐가 용량을 막는지와 뭐가 실제로 쓰이는지 먼저 확정하기

1. 실행 중인 서비스 확인(systemd)
2. 각 서비스의 실행 경로 확정 (systemctl cat)
3. 용량 분포 파악 (du / find)
4. "실제 쓰는 모델" 목록 추출 (USED 집합)
5. 디스크 모델 - USED - 삭제후보
6. 삭제후보 역검증 (grep 재참조, refs=0만 통과)
7. 삭제 (격리 mv 또는 완전 rm)
8. 서비스 테스트

## 1. systemd (서비스 관리) - 개념과 명령어

> 리눅스에서 백그라운드로 계속 돌아가는 프로그램을 서비스라 하고, 이를 관리하는 시스템이 `systemd` 다. 각 서비스는 `.service` 라는 유닛 파일로 정의된다.

**예시 명령어**

```plain
# 실행 중인 서비스 목록 (grep 으로 필터)
systemctl list-units --type=service --state=running | grep -iE "comfy|python|tts"

# 특정 서비스의 정의 전체 보기 (실행 경로 / 명령 확인에 필수)
systemctl cat comfyui.service

# 그 중핵심 줄만 추출
systemctl cat comfyui.service | grep -iE "ExecStart|Working|Directory|Environment"

# 서비스 유닛 파일이 실제 어디 있는지
systemctl show comfyui.service -p FragmentPath --value

# 서비스 제어
systemctl stop <서비스> # 멈춤
systemctl start <서비스> # 시작
systemctl restart <서비스> # 재시작
systemctl disable <서비스> # 부팅 시 자동시작 해제
systemctl enable <서비스> # 부팅 시 자동시작 등록
```

### 유닛 파일에서 봐야 할 3가지

>

| 항목 | 의미 |
| --- | --- |
| `WorkingDirectory` | 서비스가 실행되는 작업 디렉토리(=소스/모델 경로의 기준) |
| `ExecStart` | 실제 실행되는 명령 (어떤 python, 어떤 포트, 어떤 옵션) |
| `Environment` / `EnvironmentFile` | 환경변수 (설정값이 여기 숨어있을 수 있음) |

**실제로 나온 결과**

```plain
WorkingDirectory=/<기본 경로>/comfyui_py3127/ComfyUI
ExecStart=/<기본 경로>/anaconda3/envs/comfyui/bin/python main.py --listen --port 9111 --use-sage-attention
```

> ComfyUI 는 `/<기본경로>/comfyui_py3127/ComfyUI` 에서, anaconda comfyui 환경의 python 으로, 9111 포트로 돈다.

### 사용 안하는 서비스를 완전 폐기하는 올바른 순서

> 그냥 폴더만 `rm` 하면 서비스는 죽은 채 계속 에러를 뱉는다. 아래 순서로 진행하기

```plain
# 1) 멈추고 자동시작 해제
systemctl stop videoEditor-common videoEditor-mosaic videoEditor-transparent
systemctl disable videoEditor-common videoEditor-mosaic videoEditor-transparent

# 2) 유닛 파일 삭제
rm -f /etc/systemd/system/videoEditor-*.service

# 3) systemd에 반영 (안하면 systemd가 계속 삭제된 유닛을 가져옴
systemctl daemon-reload
systemctl reset-failed

# 4) 확인
systemctl list-units --all | grep -i videoEditor # 없어야 정상

# 5) 그제서야 코드 / 모델 / 설정 삭제
rm -rf /<기본 경로>/videoEditor /etc/videoEditor
```

## 2. 용량 파악 - `du, find, df`

### `df`

> 파일시스템(디스크) 전체 사용량

```plain
df -h/
# 출력: 크기 / 사용 / 사용 / 사용% / 마운트 위치
# -h = human-readable (G, M 단위로)
```

> 참고 : `df` 는 파일 시스템 단위이다. 같은 파일 시스템 안에서 파일을 `mv` 해도 df 는 안 변한다. 공간이 실제로 반환되려면 `rm` 으로 완전히 삭제해야 한다.

### `du`

> 디렉토리 / 파일별 사용량

```plain
# 특정 폴더의 하위 2단계까지, 용량순 정렬 Top 30
du -h --max-depth=2 /<기본경로> | sort -rh | head -30

# 한 폴더의총합만
du -sh /<기본 경로>/videoEditor

# 여러 파일 함께 (삭제 전 총 몇 GB인가 확인용)
find ... | xargs -r du -ch | tail -1
```

| 옵션 | 의미 |
| --- | --- |
| `-h` | 사람이 읽기 쉬운 단위 |
| `-s` | summary 총합만 (하위 나열 안 함) |
| `--max-depth=N` | N단계까지만 내려감 |
| `-c` | 합계(total)줄 추가 |
| `sort -rh` | 역순(r) + 숫자단위(h) 정렬 -> 큰 것부터 |

### `find`

> 조건으로 파일 찾기

```plain
# 1GB 넘는 파일으르, 크기 + 경로로 출력, 큰 것부터
find /data -type f -size +1G -printf "%10s %p\n" 2>/dev/null | sort -rm

# 특정 이름의 파일 위치 + 크기
find "$COMFY/models" -name "wan2.1_14B_SCAIL_2_fp16.*" -printf "%10s %p/n"

# 찾으면서 바로 삭제 (-delete)
find "$COMFY/models" -name "something.safetensors" -printf "삭제: "p\n" -delete
```

| 옵션 | 의미 |
| --- | --- |
| `-type f` | 파일만 (디렉토리 제외) |
| `-size +1G` | 1GB 초과 |
| \`-name "패턴" | 이름 패턴 매칭(`*`와일드카드 기능) |
| `-printf "%s %p\n"` | %s=바이트크기, %p=경로 출력 |
| `-delete` | 찾은 것 삭제 (주의) |
| `2>/dev/null` | 에러 메시지(권한 없음 등) 숨김 |

## 격리 (mv) vs 완전 삭제 (rm) - 되돌릴 수 있는 삭제

> 삭제는 되돌릴 수 없으므로, 확신이 덜할 땐 `휴지통 격리` 방식을 쓴다.

```plain
# 격리 : _trash 폴더로 옮긴다. (복구 가능. 단 같은 디스크면 df 안 줄어든다.)
mkdir -p /기본 경로>/_trash_오늘날짜
mv -v /지울것 /기본 경로>/_trash_오늘날짜

# 며칠 관찰 또는 서비스 재시작해서 정상작동 확인되면 완전 삭제하기 (삭제해야 df 가 줄어든다)
rm -rf /<기본경로>/_trash_오늘날짜
```

## 4. ComfyUI 가 모델을 쓴다는 것

> 쓰이는 모델은 잘못 판단하면 서비스가 깨진다.

### ComfyUI 구조

```
ComfyUI/
├── main.py              ← 서버 본체
├── models/              ← 모델 파일들 (여기가 용량의 거의 전부)
│   ├── diffusion_models/, unet/, clip/, text_encoders/, vae/, loras/ ...
├── custom_nodes/        ← 커스텀 노드 (기능 확장, 용량은 작음)
└── extra_model_paths.yaml  ← (있으면) 바깥 경로의 모델도 읽게 하는 설정
```

- ComfyUI는 기본적으로 `ComfyUI/models/` 안에만 모델로 인식한다.
- `extra_model_paths.xml` 이 없으면, 그 밖의 `models` 폴더는 아무리 모델이 많아도 안 읽는다. 

## 5. 실제로 쓴 "참조 매핑" 기법 (추가로 학습)
### USED 집합 추출 (실제 쓰는 모델 목록 만들기)
```
API=/<기본 경로>/comfyui_py3127/comfyui_api
COMFY=/<기본 경로>/comfyui_py3127/ComfyUI
WORK=/tmp/cleanup_work; mkdir -p "$WORK"

# ① API 코드(.py)가 불러오는 워크플로우 json 파일명 목록
grep -rhoE "[A-Za-z0-9_\-]+\.json" "$API" --include=*.py | sort -u > "$WORK/referenced_json.txt"

# ② 그 json들이 참조하는 모델 파일명(.safetensors 등) 전부 추출
> "$WORK/used_models.txt"
while read j; do
  f=$(find "$API/workflows-api" -name "$j" 2>/dev/null | head -1)
  [ -n "$f" ] && grep -hoE "[A-Za-z0-9_./\-]+\.(safetensors|ckpt|pt|pth|gguf|bin)" "$f" \
                 | sed 's#.*/##' >> "$WORK/used_models.txt"
done < "$WORK/referenced_json.txt"
sort -u "$WORK/used_models.txt" -o "$WORK/used_models.txt"
```

### 삭제후보 = 디스크 모델 - USED
```
# 디스크의 큰 모델(200M+) 목록
find "$COMFY/models" -type f \( -name "*.safetensors" -o -name "*.gguf" -o -name "*.pt" -o -name "*.pth" \) \
     -size +200M -printf "%f\n" | sort -u > "$WORK/disk_models.txt"

# 차집합: 디스크엔 있는데 USED엔 없음 = 삭제후보
comm -23 "$WORK/disk_models.txt" "$WORK/used_models.txt"
```

### 역검증 (삭제후보가 정말 아무 데서 안 쓰이는지 최종 확인)
```
# 후보 하나하나를 전체 코드/워크플로우에서 재검색 → 0이면 진짜 미사용
for m in 후보1 후보2 ... ; do
  c=$(grep -rl "$m" "$API" "$COMFY/user" 2>/dev/null --include=*.json --include=*.py | wc -l)
  printf "%-50s refs=%s\n" "$m" "$c"
done

# 더 넓게: /data/mango 전체 코드에서 (다른 서비스가 상수로 부르는지)
grep -rl "$m" /<기본 경로> --include=*.py --include=*.json --include=*.env --include=*.sh 2>/dev/null \
  | grep -v "/_trash" | wc -l
```

## 6. grep / 정규식 - 공부 포인트
> 이번에 가장 많이 쓴 도구. 옵션 조합이 핵심.
`grep -rhoE "패턴" 경로 --include=*.py`

|옵션|의미|
|---|---|
|`-r`|하위 디렉터리까지 재귀적으로|
|`-l`|매칭된 파일명만 출력 (내용물 말고) <- 참조 "개수" 셀 때|
|`-h`|파일명 안 붙이고 매칭 내용만 <- 목록 만들 떼|
|`-o`|매칭된 부분만 출력 (줄 전체 말고)|
|`-E`|확장 정규식(`+`,`|
|`-i`|대소문자 무시|
|'-n`|줄 번호 표시|
|`-- include=*.py`|특정 확장자 파일만 검색|

**조합 예시**
- `grep -rhoE "...\,json" --include=*.py` -> "py 파일들에서 .json 파일명만 뽑아, 파일명 없이, 하위까지"
- `grep -rl "모델명" --include=*.json | wc -l` -> "json 중 이 모델명을 포함한 파일 개수"

**정규식**

- `[A-Za-z0-9_./\-]+` : 영문/숫자/밑줄/점/슬래시/하이픈이 1글자 이상
- `\.(safetensors|ckpt|pt|pth|gguf|bin)` : 이 확장자들 중 하나 (`\.` 은 진짜 점을 뜻함)
- `sed 's##.*/##'` : 경로에서 마지막 `/` 앞을 다 지움 -> 파일명만 남김
