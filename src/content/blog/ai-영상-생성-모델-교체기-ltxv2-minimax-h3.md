---
title: AI 영상 생성 모델 교체기 LTXv2 -> Minimax H3
description: 영상 만들기 모델 교체 작업 하면서 느낀점
draft: false
pubDate: 2026-11-19
updatedDate: ''
category: 회고
tags:
  - 리눅스
  - 영상 만들기
  - ai
heroImage: ''
---

# AI 영상 만들기 모델 교체 프로젝트 진행 (2026-10-23 \~ 2026-11-19)

> **목적**: LTXV2 → MiniMax H3 전환부터 운영 3대 반영까지, 약 한 달간의 작업 이력·문제·해결을 **이 문서 하나로 완결**.
> (원본 문서들의 상세 내용을 모두 본문에 통합. 다른 파일 참조 불필요.)
>
> **한 줄 요약**: videMaker 영상 생성 백엔드를 LTXV2에서 MiniMax H3로 교체하고, 토킹아바타 서비스를 신설한 뒤, 운영 GPU 서버에 반영하는 대장정. 유광·품질·노드·배포·URL까지 전 계층 트러블슈팅.

***

## 🗺️ 전체 그림 — 이 작업이 건드린 5개 계층

```plain
① MangoReact (videoMaker 프론트)      — 요청/응답, saveAsFile, URL 조합
② 허브 Tomcat (aivideo.jsp)           — 노드 분배(LB), 파일 저장, videoUrl 치환
③ 프록시 (implement_lora :4001)        — video.py, prompt.py, .env
④ GPU API (comfyui_api :8000)          — main/comfyuiservice/videoservice.py, 워크플로우 json
⑤ ComfyUI 본체 (:9111) + 모델/노드     — 버전·패키지·커스텀노드·가중치
```

**관통 교훈**: "증상이 같아도 원인 계층이 다르다." 유광 하나도 모델 가중치(⑤)·노드(⑤)·입력(①) 어디든 범인일 수 있었음.

***

# 📅 시간순 상세 이력

## 개념 정립 & 동작전이 (10/23 \~ 10/29)

MiniMax H3 기반 동작전이 + 토킹아바타 서비스화 방향 수립.

**개념 정립 (4가지 방식)**

- 일반 i2v/t2v / Fun ControlNet(동작전이·전체 재생성) / 인페인팅(SAM3·마스크 영역만) / 토킹아바타(ref2va+오디오)
- → "원본 유지 + 특정만 교체"는 모델이 아니라 **방식(인페인팅)** 문제.

**동작전이 트러블**

- 모래바람 = 프롬프트 빈값 / 비율 왜곡 = aspect 불일치 / 생성 6분 = resolution_steps 55→32 / 인물 보존 실패 = 프롬프트 외형 특정 제거.

**라이선스**

- MiniMax H3 Community License(한/미/EU/UK 상업제외지역, 허가 받음, UI 표기 의무), Wav2Lip 상업 금지.

***

## 서버 셋업 & 유광 대전 (10/30 \~ 11/04)

### 서버 기동 실패 → 전용 env 신설

- **문제**: 원격 GPU PC에서 videoMaker FastAPI(포트 4000) 기동 실패.
- **원인**: run_server.bat이 호출하는 conda env `bgremove`가 원격에 없음. 전역 파이썬 의존성 깨짐(starlette import 실패). PATH에 MS Store 껍데기 python.exe만 잡힘.
- **해결**: 전용 conda env `videoMaker`(py3.10) 신규 생성. run_server.bat이 절대경로 파이썬 직접 호출(`C:\Users\dmango\.conda\envs\videoMaker\python.exe`). 주의: `.env` 필수, 첫 pip 수 분, 이미지/영상은 원격 ComfyUI 동반 필요.

### 🔴 유광/플라스틱 (최대 난제)

- **증상**: LTXV2→MiniMax 교체 후 **토킹아바타 영상만** oily/waxy(원본 사진은 매트).
- **진범**: `minimax_h3_ref2va` 모델의 **AdaLN(adaln_proj) 변조 가중치만 손상된 배포본 결함**. 가중치 97%는 fl2va와 동일하나 AdaLN이 톤/질감/조명 조건 분배를 담당 → 피부가 oily/waxy. 설정(steps/LoRA/sigma/prompt)으로 안 고쳐진 이유 = 원인이 샘플링이 아니라 **모델 가중치**라서.
- **해결**: `MiniMaxH3HybridLoader`(scottmudge) 노드로 base=fl2va + overlay=ref2va의 AdaLN(block 25\~49)만 병합. base/overlay는 소켓이 아니라 **파일 드롭다운**(UNETLoader 연결 금지). 체인: 171 HybridLoader → 170 SigmaShift(12/3) → 161 H3AudioDriveLong(steps 8).
- **삽질 교훈 (효과 없던 시도들)**: anti-gloss 프롬프트(무시됨), ImageSharpen(역효과·악화), steps 조정, turbo LoRA strength↓/bypass/버전교체, sigma_shift(motion용·유광무관).
- **핵심 교훈 3개**: ①설정 다 돌려도 안 바뀌면 원인은 모델 가중치 ②노드 배선은 블로그 말고 `object_info/<ClassName>` API로 확인 ③class명 대소문자 정확히(`Minimax`≠`MiniMax`).
- **함정**: fl2va 모델 없으면 Proxy Error / hf CLI 없어 python 우회 / 포트 충돌 시 kill만 하고 자동 재기동 대기(nohup 금지) / int8 양자화 + AdaLN 블록조작 shape 충돌 가능 → 에러 시 bf16 비양자화로.

### BGM 무음 [해결]

- **증상**: BGM(시네마틱 등) 선택해도 영상 무음.
- **원인(두 겹)**: ①GPU `get_minimax_make_video_json`의 "BGM 없음일 때 audio 끊기" 로직이, bgm 값이 director로 유실될 때 음악 선택했는데도 audio 끊어 무음화. ②GPU 8000이 systemd라 kill해도 자동 재시작 → 최신 코드 미반영.
- **해결**: ①`comfyuiservice.py`에서 audio 끊기 블록 삭제 → SaveMp4 audio 항상 유지(무음/음악은 프롬프트 [Audio]가 담당). ②반영은 `systemctl restart comfyui_api.service`(kill 금지), 로그는 `journalctl`.
- **헛짚음**: ACE-Step 후합성(H3는 프롬프트대로 음악 잘 만듦), 프록시 mute(이미 주석처리, 무죄).

### 앱 통합 (11장 분량)

- minimax-director 엔드포인트 신설, system prompt 4분기, 비율 100% 유지(16:9↔9:16 뒤집힘 버그 수정), `.env` MINIMAX_SERVER_URL **9111→8000**(405 해결)
- T2V/T2I 이미지없이 생성, "같은 영상(마동석)만 나옴"(OOM 실패 폴백 → **`prompt_id 기반 조회`** + 폴백 금지).
- **🔴 미해결 OOM**: 토킹아바타 H3AudioDriveLong \~31GB 피크 OOM. 원인 확정 = 9111이 `--disable-dynamic-vram`로 기동돼 CLIP+UNET 상주. 해결(권장) = `--disable-dynamic-vram` 제거 후 9111 재시작(공용 엔진이라 트래픽 없는 시간에). 차선 = GPU 분산(9112) 또는 해상도/길이 하향.

***

## 3기 — 품질 개선 & 노드 패치 (11/05 \~ 11/06)

### 유광 2종 구분 (교차 적용 금지!)

> 겉보기는 같은 유광이지만 원인이 다름:

- **토킹아바타** = `ref2va` AdaLN 가중치 결함 → HybridLoader로 fl2va AdaLN 병합. 프롬프트/LoRA/steps/sampler 전부 무효.
- **영상만들기** = `BlockSparseAttention`(VSA) 가속 노드. keep_percent=10으로 attention 90% 버려 저주파(매트한 면) 손실 + 하이라이트 환각. → **VSA 노드 제거**(KSampler model 입력을 ModelAttentionBackend에 직결). RTX5090에선 속도 손해 거의 없음.

### 토킹 아바타 품질 개선 관련 4가지 작업 (①②③=system prompt .txt, ④=전처리 .py, GPU 무죄)

- **① 행동 부족**: MOTION BUDGET이 행동 최소화(과보수) → USER 행동을 각 Timeline 블록에 필수 렌더링하도록 완화.
- **② 얼굴 확대**: CAMERA 지시 자기모순("mouth detail 위해 크게" vs "tight close-up 피하라") + push-in 허용 → 모순 제거, push-in 제외, **FRAMING LOCK**(참조와 동일 샷 크기 고정) 신설.
- **③ 영상 분할**: 텍스트-전용 단일 샷 고정 약함 + VISIBILITY LEDGER가 전환 유도 → **SINGLE SCENE** 규칙(기본=한 장소·한 샷) 신설.
- **④ 이중 레이어**(거대 얼굴 배경 + 작은 전신): 전신 참조 × 얼굴 립싱크 모델 스케일 충돌 → 커스텀 노트 내 `crop_to_portrait()`를 고정 4:5 크롭(MediaPipe 얼굴검출)으로 + FRAMING LOCK 강화. (단 이건 1차 시도, 근본 해결은 아래)

### 텍스트-전용 버그 2개

- **① "Failed to generate reference image"**: `.env`의 `IMAGE_CREATE_MODEL`이 find/replace 사고로 손상(`gpt-image-LTXV2_SERVER_URL2.5-flare`) → 존재 안 하는 모델 호출 → OpenAI 거부. **해결**: `gpt-image-2.5-flare`로 복원.
- **② 텍스트-전용 립싱크 실패(입만 안 움직임)**: `/api/generate-prompt-minimax`가 `REFERENCES:`에 `Audio 1` 트랙 미선언 → LLM이 오디오 신호 못 받음. **해결**: `prompt.py`에서 talking_avatar면 이미지 유무 무관 `Audio 1` 항상 선언 + 립싱크 지시 + 누락 시 WARNING.

### 🔑 이중 레이어 근본 해결 (④의 후속)

- **진짜 원인(소스로 확정)**: 원격 노드 `H3AudioDriveLong`의 `_text_cond` 함수가 `ref_image`를 CLIP vision 힌트로만 넣고 **`minimax_keyframes`엔 미주입** → 프레임 앵커 없이 H3가 구도 자유 재창조 → 이중 레이어. (입력을 어떻게 크롭해도 실패한 이유 = 문제는 입력이 아니라 keyframe 미주입)
- **해결(설계)**: 표준 `MiniMaxH3ImageToVideo`처럼 ref_image를 프레임0 keyframe으로 앵커. 변경 2가지(resize `center`→`disabled`, keyframe 2줄 추가). 원격 .py 패치 + ComfyUI 재시작.
- **리스크**: window 2+ 립싱크 깨짐 가능(노드 주석 경고). 대안 A(minimax_refs 통로)/B(윈도우0만)/C(resize만).

***

## 설치 레퍼런스 & 자동화 (11/09 \~ 11/15)

### 3개 워크플로우별 모델·노드 출처 (HF/GitHub 교차검증)

- **ltx-director**: 노드 `whatdreamscost-comfyui`(2.0.0), 모델 8개 — 5개=Kijai/LTX2.3_comfy, gemma=Comfy-Org/ltx-2, 업스케일러=Lightricks/LTX-2.3, 토킹헤드 LoRA=elix3r.
- **make-video**: FastH3 I2V(VSA 제거판). 노드 Pixaroma/MiniMaxH3(ImageToVideo·SigmaShift·ModelAttentionBackend). 모델 4개(FastVideo/FastVideo-FastH3-Comfy + Comfy-Org/MiniMax-H3). qwen3vl=`nvfp4_awq`.
- **talking-avatar**: HybridLoader(fl2va+ref2va). 노드 MiniMaxH3HybridLoader(scottmudge)/H3AudioDriveLong(lebao-arch)/AudioCrop(christian-byrne)/FancyTimer(PGCRT). 모델 5개(ref2va·fl2va 둘 다, qwen3vl=`int8_convrot`로 make-video와 다름).

### 공통 설치 함정 (암기)

1. `hf download`가 레포 내부 경로 그대로 중첩 재현(`vae/vae/...`) → **`mv`로 수동 평탄화 필수**
2. 노드가 보는 폴더가 직관과 다름 — `taeltx2_3`는 `vae_approx/`가 아니라 **`vae/`**(VAELoaderKJ 기준)
3. 파일명 철자 하드코딩 — `nvfp4_awq` ≠ `int8_convrot` (json과 정확히 일치해야 "not in list" 안 남)
4. 본체 버전 의존 — `comfy_extras` 내장 노드는 git clone 아니라 **본체 git pull**
5. systemd가 kill해도 옛 코드 부활 → **`systemctl restart`로만 반영**
6. 검증은 **object_info만** 신뢰(grep은 Manager DB·참조코드로 오탐 심함)
7. 중복 재다운로드 방지 — 설치 전 중복 확인

- **암기 원칙**: "노드=clone·모델=download → mv 평탄화 → json 철자까지 일치 → systemctl restart → object_info 검증. 막히면 거의 항상 **경로·폴더·철자** 셋 중 하나."

### 용량 레퍼런스

- LTXV2 \~40GB / make-video \~43GB / talking-avatar \~100GB(fl2va+ref2va 각 34GB non-pruned)

### 설치 자동화 스크립트 (`scripts/`)

- 멱등·dry-run·scope(all/ltxv2/minimax)·manifest 기반. `install.sh` / `verify.sh` / `models.manifest` / `nodes.manifest`.
- 플래그: `--no-pip`(모델 download + 노드 clone, pip 제외) / `--pip-only`(clone된 노드 pip만, 모델 skip) — 모델 미리 받고 pip은 재시작 직전.

***

## make-error 디버깅 & MiniMax 수렴 계획 (11/16 \~ 11/18)

### "make error" 간헐 500 디버깅

- **증상**: `{"code":500,"result":"make error"}` 간헐적 영상/이미지 생성 실패.
- **진짜 원인**: 허브 `aivideo.jsp` **노드 분배 목록에 죽은 노드(218.38.16.75/79:4001)가 남아** → 거기로 분배 → `Connection refused` → 즉시 500. 서비스는 disabled인데 JSP 분배 목록에선 안 빠졌고, prompt 경로가 열려 그리로 샘.
- **해결**: 그 경로도 막아 해결. (노드 disable은 **"분배 목록에서 빼기"까지** 해야 완결)
- **추적 어려웠던 이유**: Connection refused라 요청이 **Python(ai40x)까지 도달 못 함** → Python 로그에 안 남음. 진짜 로그는 **허브 Tomcat 로그**에 있었음. (가짜 단서: invalid_image_file, JSONDecodeError, FileNotFoundError 전부 무죄)
- **재사용 교훈**: 응답 형식으로 계층 판별 — `{"code":500,"result":...}`=Java/JSP 허브, `{"detail":...}`=Python FastAPI. "간헐 실패"의 전형 = 특정 노드 1곳 죽음 + LB가 거기로 분배.

***

## 운영 3대 반영 대장정 (11/19) ★

> ai411 1대에서 **10개 문제** 연쇄 해결 → ltxv2 유지 + MiniMax 전체(영상/아바타/TTS) + 결과 재생까지 확인. 이후에 나머지 2대에 반영

### ① 설치 스크립트 분할

`--no-pip`/`--pip-only` 플래그 추가. 파일 복사/다운로드는 재시작 안 함, pip은 ltxv2 공유 패키지(torch) 건드릴 수 있어 재시작 직전으로 분리.

### ② transformers 5.23 → qwen-tts 깨짐

> 노드 pip이 transformers 5.23으로 끌어올림 → `import qwen_tts` `TypeError: check_model_inputs() missing 'func'`. qwen-tts는 `==4.57.3` 요구. **해결**: `pip install transformers==4.57.3`(모든 커스텀 노드는 `>=`라 만족).

### ③ TTS "connection failed"

> `.env`의 `TTS_SERVER_URL`이 실제 TTS 서버(localhost:8004)와 불일치. **해결**: .env 그 키만 수정.

### ④ make-video 400 = ModelAttentionBackend 노드 없음

> 본체 내장(comfy_extras) 노드라 git clone 불가. v0.32+ 존재, 현재 v0.30.2엔 없음. +CRT-Nodes도 `comfy.ldm.minimax.controlnet`(v0.35+) 없음. → 본체 업그레이드 필요.

### ⑤ v0.35.2 시도 → AsymW4A8Int8Layout 기동 실패

> comfy_kitchen 0.2.26 불일치로 ComfyUI 기동 실패. 교훈: **본체만 올리면 안 됨, 동반 패키지도 맞춰야.**

### ⑥ v0.45.4(개발 서버 조합)로 재시도 → 동반 패키지 연쇄

- 개발 서버(ltxv2+MiniMax 둘 다 되는 검증 서버) 조합 통째 복제. 본체 **v0.45.4**.
- `comfy_kitchen==0.2.41`(fp4/int8 backend) + `comfy-aimdo==0.6.0`(0.4.11엔 storage 모듈 없어 기동 실패).
- **bernini 보존**: checkout 전후 `comfy_extras/nodes_bernini.py`(reference_images Tensor 처리 버그픽스) stash/pop.
- **dry-run 필수**: pip 전 `--dry-run`으로 torch 안 건드리는지 확인(torch 2.13→2.14는 대공사). kitchen/aimdo는 torch 안 건드림 확인.
- **결과**: ltxv2 유지 + MiniMax 영상/아바타 생성 성공 ✅

### ⑦ 허브 JSP 엔드포인트 미등록 (400 invalid api)

aivideo.jsp/aivideo_test.jsp 맵에 ltx만 있고 minimax 없음. **해결**: 두 맵에 추가(2개 파일 다). JSP는 저장만 하면 자동 재컴파일.

```java
apiTimeoutSec.put("comfy/minimax-director", 620);
apiTimeoutSec.put("generate-prompt-minimax", 320);
apiSystemName.put("comfy/minimax-director", "aivvideo");
apiSystemName.put("generate-prompt-minimax", "aivprompt");
```

### ⑧ 405 Method Not Allowed (노드별 재시작 타이밍)

> 라운드로빈인데 일부 노드(.235/.236)가 아직 재시작 전이라 엔드포인트 없음 → 405. 재시작 완료되면 소멸. 검증: `curl -X POST .../minimax-director -d '{}'` → 400(정상) vs 405(엔드포인트 없음). 슬래시 없이 호출.

### ⑨ aivvideo 노드풀 503 (ltx·minimax 공용)

> prompt(aivprompt)는 되고 director(aivvideo)만 **바로 503** = GPU 도달 전 허브 분배 실패(requestFull). aivvideo 노드풀만 고장(슬롯 full or 죽은 노드). NodeDistributor 목록 정리 + 전 노드 재시작으로 해결.

### ⑩ 영상 결과 base64/검은네모 → URL 매칭 실패 ★ (최종 완결)

- **진범**: `saveAsFile=true` 파일 방식으로 전환(큰 base64 프록시 문제 회피)했는데, 생성된 mp4를 **실제 웹서빙 폴더 `aivideo/`에 저장하는 주체가 없었음** → `/aivideo/ltx_xxx.mp4` 404 → 검은 네모.
    - FastAPI(GPU, video.py): `temp/`에만 저장 + `videoFile`(파일명)만 반환. 다운로드만 제공, aivideo 저장 없음.
    - 허브 aivideo.jsp: 원래 순수 passthrough라 저장 안 함. (과거 base64 방식일 땐 허브가 받아 저장했었음)
- **해결 (3단 모두)**:
    1. **GPU/프록시 video.py**: `if body.get("saveAsFile")` → 파일 저장(ltx\_<hex>.mp4) → `{"videoFile": ...}` 반환. ltx·minimax 둘 다 + 다운로드 엔드포인트 `/api/comfy/{ltx,minimax}-result`. import `Path`, `FileResponse`.
    2. **클라 MangoReact videoMaker**: `buildLtxDirectorBody`·`buildMinimaxDirectorBody`에 `saveAsFile: true` + 타입에 필드. `useVideoGeneration.ts`에 `videoUrl||videoFile||video` 폴백, `videoResultUrl.ts`에 순수 파일명이면 `aivideo/` 프리픽스 안전망.
    3. **허브 aivideo.jsp (저장 주체 복원)**: ①director 요청에 saveAsFile=true 주입(Gson) ②응답 videoFile 추출 + `ltx_[0-9a-f]{32}\.(mp4|webm)` 검증 ③같은 nodeServer의 `/api/comfy/{minimax|ltx}-result?file=`로 다운로드(**ltx/minimax 엔드포인트 다름! 분기 필수**) ④`/var/lib/tomcat/webapps/riamoreMedia/aivideo/`에 Files.copy ⑤응답 videoFile 제거 + `videoUrl:"/aivideo/<file>"` 치환.
***

# 🔑 반복된 핵심 교훈 (회고 하이라이트)

1. **"설정 다 돌려도 안 바뀌면 원인은 설정이 아니다."** 유광(AdaLN 가중치), 분할(첫프레임 프롬프트 누수), 이중레이어(keyframe 미주입) — 전부 표면 다이얼이 아니라 더 깊은 층. 삽질의 대부분이 "설정으로 고치려다" 소비됨.
2. **"증상이 같아도 원인 계층이 다르다."** 유광 하나도 토킹아바타=가중치(⑤), 영상만들기=VSA노드(⑤), 입력=크롭(①). 교차 적용 금지.
3. **"요청이 어느 계층까지 도달했는지부터 확인."** make-error=Connection refused(Python 도달 못 함, 허브 로그가 진짜) / 503=GPU 도달 전 분배 실패 / 405=노드 도달했으나 엔드포인트 없음. 응답 형식(`{"code":...}` vs `{"detail":...}`)으로 계층 판별.
4. **"반영 안 되면 systemd 자동재시작 의심."** kill해도 옛 코드 부활. `systemctl restart` + `journalctl`로만. 검증은 object_info(grep 오탐).
5. **"본체만 올리면 안 된다 — 동반 패키지 세트로."** v0.45.4 ← comfy_kitchen 0.2.41 + comfy-aimdo 0.6.0. ai503(검증된 서버) 조합 통째 복제가 핑퐁을 끝냈음.
6. **"설치 함정은 거의 항상 경로·폴더·철자."** hf 중첩→mv 평탄화 / 노드 폴더 직관과 다름 / 파일명 철자.
7. **"결과 반환은 전 계층이 한 약속을 지켜야."** URL 하나 나오는 데 video.py(saveAsFile) + 허브 JSP(저장+치환) + 클라(폴백) 3단이 전부 맞아야 함.

***

# 🔴 미해결 / 오픈 이슈 (다음 작업 후보)
>

| 이슈 | 상태 | 비고 |
| --- | --- | --- |
| abort 전파 안 됨 | 미구현 | 클라 새로고침/뒤로가기가 ComfyUI까지 전파 안 돼 GPU 끝까지 렌더 |
| 3계층 로그 분리 | 미착수 | app / comfyui_api / ComfyUI본체 로그 분리 |

***
