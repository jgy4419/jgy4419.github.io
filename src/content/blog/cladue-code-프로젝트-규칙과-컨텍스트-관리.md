---
title: Cladue Code 프로젝트 규칙과 컨텍스트 관리
description: 프로젝트 규칙을 AI 한테 전달
draft: false
pubDate: 2026-11-16
updatedDate: ''
category: AI
tags:
  - claude
  - ai
heroImage: ''
---

**학습내용**

- `CLAUDE.md`의 역할과 작성 방법
- `.claude/rules/`의 역할과 규칙 분리
- 공통 규칙과 특정 파일·폴더에 적용되는 규칙
- 규칙이 너무 많거나 중복될 때의 문제

# 1. [`CLAUDE.md`](http://CLAUDE.md) 의 역할과 작성 방법

> CLAUDE.md 에 모든 규칙을 넣지 않고도 Claude 에게 프로젝트 규칙을 전달하려면 어떻게 해야될까?

### 필요한 이유

> 일반적인 AI 코딩 요청은 사용자가 매번 필요한 정보를 설명.
> ex. "react와 ts를 사용하고 있고, api 호출은 기존 axios 인스턴스 사용해….. \~ 구조 유지하고 수정 후 타입 검사도 해줘" 이런식으로 물어본다.

- 이런 요청을 매번 반복하면 번거로움. 그래서
- `CLAUDE.md` 는 이런 프로제그에서 지속적으로 필요한 정보를 매번 반복해서 입력하지 않도록 관리하는 지침 파일.
- Claude Code 가 프로젝트를 이해하는 데 필요한 기본 정보와 작업 원치글 제공하는 출발점

### CLAUDE.md 가 담당할 내용

1. 프로젝트 개요 : 어떤 프레임워크와 라이브러리를 사용하고, 프로젝트가 어떤 목적으로 만들어졌는지 설명
2. 아키텍처 안내 : 주요 디렉터리의 역할, 모듈 간 관계, 코드를 배치하는 기본 원칙을 설명
3. 공통 개발 원칙 : 기존 구현을 먼저 확인하기, 불필요한 의존성 추가 금지. 수정 범위 최소화 같은 원칙을 작성한다.
4. 검증 방법 : 타입 검사, 린트, 테스트 명령어와 작업 완료 후 보고할 내용을 정리한다.

### 그럼 모든 규칙을 여기에?

> 기술적으로 많은 내용을 작성할 수 있지만, 관리 측면에서 추천 x.
예시로 아래 내용을 모두 넣는다 가정
> 
- react 컴포넌트 작성
- 커스텀 훅 설계
- API 응답 타입 정의 방법
- FastAPI 라우터와 서비스 계층 분리
- SQL 쿼리 작성 규칙
- 테스트 코드 작성 규칙

이렇게 되면`CLAUDE.md` 가 지나치게 커지고, 규칙의 수정과 적용 범위를 관리하기 어려워진다.

그래서 아래처럼 작성하기

| 내용 | 적절한 위치 |
| --- | --- |
| 프로젝트가 어떤 기술로 구성되어 있는가 | `CLAUDE.md` |
| 모든 작업에서 지켜야 하는 공통 원칙 | `CLAUDE.md` 또는 공통 rules |
| React 컴포넌트를 어떻게 작성하는가 | React 관련 rules |
| FastAPI API를 어떻게 작성하는가 | 백엔드 관련 rules |
| 특정 작업을 어떤 순서로 수행하는가 | 작업 지침 또는 Skill 검토 |

여기서 `CLAUDE.md` 와 공통 rules 의 역할은 일부 겹칠 수 있다. 중요한 것은 파일 이름 자체보다 각 규칙의 기준 위치를 정하고 중복을 최소화 시키기.

### 컨텍스트 관리

> 컨텍스트는 Claude가 현재 작업을 이해하고 수행하는 데 참고하는 정보라 생각.
> 
- ex. 로그인 화면을 수정하는데 무관한 데이터베이스 마이그레이션 규칙까지 항상 제공할 필요는 x.
- 따라서 컨텍스트 관리의 핵심은 단순히 정보를 많이 제공하는 것이 아닌. 작업에 필요한 정보를 적절한 시점에 제공하는 것.

### `CLAUDE.md` 와 `@파일경로` 의 관계

- `CLAUDE.md` 에서는 `@docs/archtecture.md` 같은 문법으로 다른 파일의 내용을 명시적으로 참조할 수 있다.
- **달라진 부분** 공식적으로 자동 로드되는 부분은 1. `~/.claude/CLAUDE.md(전역)` 2. 프로젝트 루트 CLAUDE.md 3. 작업 중인 파일이 속한 서브 디렉터리의 CLAUDE.md (재귀로 올리가며 전부)

**참조 시 주의할 점**

- `@docs/foo.md` 로 CLAUDE.md에 걸면 매 세션 전부 로드된다. (= 컨텍스트 소비)
- 그래서 모든 작업에서 참고해야 하는 공용 지식만 `@` 로 상시 로딩
- 특정 영역에서만 참고하면 되는 지식은 서브 CLAUDE.md 애 두거나, 거기서만 `@` 를 참조하기

아래와 같은 구성이라면

```python
// 내용이 달라짐
(x) my-project/
 ㄴ CLAUDE.md # 공통 지침
 ㄴ docs/
	 ㄴ architecture.md
 ㄴ .claude/
	 ㄴ rules/
		 ㄴ react.md
# paths frontmatter 없이도 Claude Code가 위치로 범위를 판단한다. (가장 권장)
(o 방식 A) my-project/
		ㄴ CLAUDE.md # 공통 지침
		ㄴ src/
			ㄴ features/
				ㄴ CLAUDE.md # features/ 아래 작업 시 자동 로드
			ㄴ services/
				ㄴ databases/
					ㄴ CLAUDE.md # database/ 아래 작업 시 자동 로드

# 자동 로드가 안 되므로 `CLAUDE.md 에서 @로 전부 끌어와야 함.
# 결국 전부 매번 로드돼서 "필요할 때만 로드" 효과가 없음
(o 방식 B 가능은 하나 비효율적) my-project/
			ㄴ CLAUDE.md
			ㄴ .claude/rules/
				ㄴ common.md
				ㄴ zustand.md
				ㄴ databases.md
```

> A방법이 가장 권장되는 방법이라 A를 기본으로, 공통 참조 문서는 `@docs/...` 로 포인터만 두는 혼합이 가장 효율적이다.
> 
- `CLAUDE.md` : 프로젝트의 기본 지침
- `@docs/architecture.md` : 아키텍처 문서를 명시적으로 참조
- `src/features/CLAUDE.md` : 해당 영역 작업 시에만 자동으로 추가 로드

이렇게 각각의 목적이 다름

### CLAUDE.md 작성 시 지켜야될 원칙

1. 짧고 명확하게 작성하기 : 장황한 설명보다 실행 가능한 지침을 우선.
2. 실제 프로젝트 기준으로 작성하기 : 존재하지 않는 폴더나 사용하지 않는 라이브러리를 기재하지 않는다.
3. 중복 줄이기 : 세부 규칙을 다른 파일에서 관리한다면 같은 내용으 반복해서 작성하지 않는다.
4. 검증 가능한 지침 작성하기 : 좋은 코드를 작성한다보다는 `"변경 후 프로젝트의 타입 검사 명령을 실행한다"` 처럼 구체적으로 작성

### .claude/

- `.claude/` 는 Claude Code 자체의 기능 확장 디렉터리에 가깝다. “규칙 / 문서를 담아 CLAUDE.md 에서 @로 불러오는 창고”로는 잘 안쓴다.

| 경로 | 용도 | 예시 |
| --- | --- | --- |
| .claude/settings.json | 권한, 훅, env 설정 | 자주 쓰는 명령 자동 승인 |
| .claude/commands/*.md | 커스텀 슬레시 커맨드 | /review, /init 같은 재사용 프롬프트 |
| .claude/agents/*.md | 커스텀 서브 에이전트 | 특정 작업 전문 에이전트 |
| .claude/skills/<name>/SKILL.md | 재사용 가능한 워크플로 | 복잡한 다단계 절차 |

> 지식 / 컨벤션 문서는 `docs/` 에 두고 CLAUDE.md 에서 @docs/파일.md 로 참조가 정석.
>

# 2. .claude/rules/ 의 역할과 규칙 분리
> `components.md` , `hooks.md` , `api.md` 를 어떤 기준으로 나누는 게 좋을까?
> 
     
### Rules는 왜 분리할까?
    
 - 프로젝트가 커질수록 모든 개발 규칙을 한 파일에 작성하는 것은 비효율적이다.
- 예시로 프론트엔드와 백엔드가 함께 있는 프로젝트라면 React 규칙과 FastAPI 규칙은 적용 대상도 다르고, 내용도 다르다.
- 이때 `.claude/rules/` 를 사용해 규칙을 주제별로 분리할 수 있다.

    
    ```python
    # (x)
    .claude/
    └── rules/
        ├── common.md
        ├── frontend/
        │   ├── architecture.md
        │   ├── components.md
        │   └── hooks.md
        └── backend/
            ├── architecture.md
            ├── api.md
            └── services.md
    
    # (o) 권장 수정 내용
    src/features/CLAUDE.md # frontend/architecture.md 역할
    src/features/*/components/CLAUDE.md # components.md 역할
    src/services/database/CLAUDE.md # backend/api.md 역할 (DB 쪽)
    src/services/apis/CLAUDE.md # api.md 역할
    ```
    
> 각 파일은 독립된 규칙 문서로 관리할 수 있다. 하위 디렉터리도 규칙 탐색 대상이므로 위처럼 폴더를 나눠도 됨.
> 
    
### Rules 파일에 들어갈 내용
    
> 각 폴더의`CLAUDE.md` 에는 컴포넌트 작성에 필요한 규칙을 작성한다.
> 
    
```python
// ex
    
# Component Rules
    
- 컴포넌트는 명확한 책임을 갖도록 작성한다.
- Props 타입을 명시한다.
- 기존 공통 컴포넌트를 먼저 확인한다.
- 복잡한 비즈니스 로직은 기존 훅 분리 패턴을 검토한다.
```
    
### 나누는 기준 (서브디렉터리 CLAUDE.md 기준)
    
 **적용 대상별 분리 - 가장 자연스러움**
    
- `src/features/CLADE.md` : feature 작성 규칙
- `src/servicesdatabase/CLAUDE.md` : DB 쿼리 규칙
- `src/services/apis/CLAUDE.md` : API 통신 규칙
    
**주제별 분리 - docs/ 로**
    
- `docs/3tier-code-convention.md` 같은 “주제 중심” 문서는 루트 / 서브 CLAUDE.md 에서 @로 참조
- 다만 `constants/CLAUDE.md` , `utils/CLAUDE.md` 를 무조건 만들어야 하는
- 그 영역에 별도로 지켜야 할 원칙이 있을 때만 분리하기

# 3. 공통 규칙과 경로별 규칙
> 모든 작업에서 지켜야 할 규칙은 루트 CLAUDE.md 에 둔다. Claude Code 는 세션이 시작될 때 루트 CLAUDE.md 를 항상 자동으로 로드한다.
> 

**예시로 루트 CLAUDE.md 에 아래 내용이 있다 가정**

```python
## 공통 개발 원칙

- 작업 전에 관련 코드를 먼저 확인한다.
- 기존 프로젝트의 구현 패턴을 우선한다.
- 요청 범위를 벗어나는 변경은 하지 않는다.
```

> 이 규칙은 특정 디렉터리에 한정하지 않는 공통 규칙으로, 어떤 파일을 수정하든 항상 적용된다.
> 

### 경로별 규칙 생성 방법

> React 컴포넌트에만 적용할 규칙을 작성한다면, `/components` 폴더에 CLAUDE.md 를 생성한다.
> 

이제 `Claude Code` 가 이 폴더 하위의 파일을 작업할 때, 루트 CLAUDE.md 에 더해 폴더 하위의 CLAUDE.md 규칙까지 함께 로드된다.

**알아야 될 점**

- 루트 `CLAUDE.md` : 프로젝트 전반에 항상 적용되는 규칙
- 서브디렉터리 CLAUDE.md : 그 폴더 및 하윙서 작업할 때 추가로 쌓이는 규칙
- frontmatter 불필요 : 폴더 위치 자체가 범위 지정 수단이므로 `paths:` 같은 메타데이터를 쓸 필요가 없다.
- 서브디렉터리 [CLAUDE.md 가 “자동으로 우선순위가 높다”는 뜻은 아니다. 상충되는 지침이 잇으면 사람이 정리해 통일해야됨.

### 여러 규칙이 동시에 적용될 수 있나?

> 예시로 `src/features/pill_identification_search/components/MarkModal.tsx` 를 수정하면 아래 규칙들이 동시에 로드된다.
> 

```python
프로젝트 루트
└── CLAUDE.md                                    ① 프로젝트 전반 지침
    └── src/features/
        └── CLAUDE.md                            ② Feature 공통 규칙
            └── pill_identification_search/
                └── components/
                    └── CLAUDE.md                ③ 컴포넌트 작성 규칙
                        └── MarkModal.tsx        ← 작업 대상
```

결과적으로

1. 프로젝트 기본 지침 (기슬 스택, 공통 원칙, 검증 명령어)
2. Feature 계층 구조 규칙 (atoms/molecules/organisms, 훅 분리 등)
3. 컴포넌트 작성 규칙 (Props 타입, 공통 컴포넌트 우선 등)

> 어떤 CLAUDE.md 가 적용될지를 완벽히 자동 판별한다는 보장은 아님. 여러 파일을 수정하는 과정 (컴포넌트 + API 함께 변경) 에서는 두 영역의 규칙이 모두 로드되므로, 실제 로드 여부와 지침 적용을 `Claude Code 응답에서 확인하는 습관을 들이기`
> 

### 규칙이 충돌하는 경우


> 예시로 루트 CLAUDE.md에는 "모든 상태는 Zustand로 관리한다"가 있고, 특정 Feature의 CLAUDE.md에는 "이 Feature는 로컬 useState로만 관리한다"가 있다면?
> 
- Claude Code 는 둘 다 로드하므로 어느 쪽을 따를지 혼동할 수 있다.
- 이럴 때는 **상위 규칙에 예외를 명시** 하거나, 하위 규칙에서 `루트 규칙 중 00을 이 폴더에서는 ~로 대체한다` 처럼 관계를 분명하게 적기.
- 가장 좋은 건 `애초에 상충이 생기지 않도록 상위 규칙을 "원칙"으로, 하위 규칙을 "구체 적용"으로` 성격을 나눠서 작성하기.

# 4. 규칙 과다, 중복, 충돌 관리

### 규칙이 많으면 무조건 좋을까?

- 아님. 규칙을 많이 작성한다고 Claude의 결곽 무조건 좋아지는 것은 아니다.
- `CLAUDE.md` 에 컴포넌트 규칙을 작성하고 `components.md` 에도 거의 동일한 내용을 작성했다고 가정했을 때
- 나중에 컴포넌트 설계 원칙을 변경하면 두 파일을 모두 수정해야 할 수 있다. 한쪽만 수정하면 서로 다른 기준이 남을 수 있음.

**규칙을 추가하기 전에 아래 질문들을 스스로한테 해보기**

1. 기존 규칙에 이미 같은 내용이 있는가?
2. 별도 파일로 관리할 만큼 독립적인 규칙인가?
3. 특정 경로에만 적용하면 되는 규칙인가?
4. 실제 프로젝트에서 지켜야 할 규칙인가?

### 규칙 충돌은 어떻게 해결할까?

```python
// ex CLAUDE.md
"API 요청은 기존 Axios 인스턴스를 사용한다.

// ex. api.md
"각 API 모듈에서 새로운 Axios 인스턴스를 생성한다.

두 규칙이 서로 충돌하므로 하나의 명확한 원칙으로 통일해야된다.
```

> 규칙 수정 시 단순 문구만 비교하는 것이 아닌 실제 코드도 확인해야된다.
프로젝트가 이미 공통 Axios 인스턴스를 사용하고 있다면, 그 구조를 기준으로 규칙을 정리하는 것이 합리적임.
> 

### 실제 프로젝트와 규칙이 일치하는지 확인하기

> 규칙 문서에 `src/stores/` 를 사용한다 작성했는데, 실제 프로젝트에서는 `src/shared/store/` 를 사용한다면 어떻게 될까?
> 
- 클로드가 잘못된 경로에 파일을 생성하거나 기존 구조와 다른 방식을 도입할 수 있다.
- 그래서 규칙을 만들기 전에 실제 코드부터 조사해야 된다.

**추천 순서**

1. 프로젝트 폴더 구조 확인
2. 주요 설정 파일과 의존성 확인
3. 대표적인 컴포넌트와 API 코드 확인
4. 실제 사용 중인 설계 패턴 정리
5. 그 결과를 바탕으로 `CLAUDE.md` 와 rules 작성
6. Claude Code 에서 적용 여부와 결과 검증

### 규칙 검증 프롬프트

> 규칙 파일을 작성한 뒤에는 아래처럼 검토를 요청할 수 있다.
> 

```python
현재 프로젝트의 루트 CLAUDE.md와 서브디렉터리 CLAUDE.md들 (src/**/CLAUDE.md), 그리고 CLAUDE.md 에서 @로 참조되는 docs 들을 검토해줘.
다음 항목을 확인해 줘.

1. 실제 프로젝트의 폴더 구조 및 라이브러리와 일치하는가?
2. 중복되거나 서로 충돌하는 규칙이 있는가?
3. 공통 규칙과 경로별 규칙이 적절하게 분리되어 있는가?
4. 불필요하게 세분화되거나 장황한 규칙이 있는가?
5. 규칙을 더 명확하고 검증 가능한 형태로 개선할 수 있는가?

먼저 문제점과 개선안을 보고해 줘. 아직 파일은 수정하지 말아 줘.
```



# `추가 내용`
### `/init` 을 각 폴더에서 돌리나?

> `/init` 은 루트 전용이고, 서브디렉터리는 수동으로 작성하는 게 정석.
> 
- `/init` 은 Claude Code 내장 명령인데 프로젝트 루트의 CLAUDE.md 1개를 생성하도록 설계돼 있음. 폴더 인자를 받지 않는다.
- 서브 CLAUDE.md 만들 때 /init 돌리면 중복 내용이 생성될 수도 있음.

**실무 패턴**

1. 루트 : /init 으로 1차 생성 → 다듬기
2. 서브 : 채팅으로 Claude 에게 요청
    
    > ex. 루트 CLAUDE.md 를 참고해서, src/features/CLAUDE.md 를 생성해줘. 루트와 중복되는 내용은 빼고 features 전반에만 적용될 규칙만 담아줘.
    > 
    
    이렇게 하면 Claude가 루트와 겹치지 않는 델타만 작성함.
    

### `features/CLAUDE.md` 가 모든 걸 다 담으면 토큰 낭비?

> 실제론 거의 문제 x
> 
1. 생각보다 작음
    
    > 잘 쓴 `src/features/CLAUDE.md` 는 50~200줄 정도 = 대량 500~2000 토큰. 반면 실제 코드 1~2개 열면 쉽게 10,000+ 토큰 사용됨. (사용이 미미함)
    > 
2. 세션당 1회 로드 + 캐시된
    
    > Claude Code 는 `CLAUDE.md` 를 세션 시작 시 한 번 읽어서 캐시한다. 이후 메시지에서 재로드 비용은 없음.
    > 
3. 안 쓰는 규칙도 로드되는 비용 vs 분산된 파일 찾기 비용
    
    
    | 방식 | 비용 |
    | --- | --- |
    | features/CLAUDE.md 하나에 다 담기 | 안 쓰는 규칙도 로드 (수백 토큰) |
    | hooks/CLAUDE.md, components/CLAUDE.md 분리 | Claude가 “어느 규칙이 적용되나” 판단 자체에 토큰 소비 + 유지보수 복잡 |

### 쪼개야 하는 임계점

> 보통 합쳐두는 게 효율적임 분리 비용 (파일 관리, 중복 위험)이 로드 비용보다 큼.
> 

**아래 조건을 동시에 만족할 때만 쪼개기**

1. 특정 카테고리 (ex. 훅)의 규칙이 100줄 이상으로 자라났고
2. 다른 카테고리와 거의 관계없는 독립 규칙이며
3. 그 카테고리만 작업하는 세션이 실제로 자주 있는 경우
    
    ```python
    src/features/CLAUDE.md                      # 공통 (아키텍처, 의존 방향)
    src/features/{feature}/hooks/CLAUDE.md      # 훅만 작업할 때 추가 로드
    ```
    

**중간 전략 - @docs/ 참조**

> 규칙이 커졌는데 쪼개긴 애매한 경우
> 

```python
# ex
<!-- src/features/CLAUDE.md -->

## 핵심 규칙 (요약)
- atoms/molecules/organisms 분류
- 훅은 use_*.ts 네이밍
- Store는 Dumb, 로직은 훅

## 상세 컨벤션
전체 Zustand 3-Tier 규칙은 @docs/3tier-code-convention.md 참조.
```


- `@` 참조는 자동 로드 이므로 토큰 절약 효과는 없고, 사람이 긴 규칙을 찾아 읽기 쉽게 만드는 게 주 목적.

- 토큰을 실제로 줄이려면 참조 없이 그 폴더에 Claude가 들어왔을 때만 로드되는 서브 CLAUDE.md를 쓰는 게 유일한 방법

### `.claude/` 폴더 활용 - 예시 + 지금 바로 적용 가능한 것들

1. `settings.json / settings.local.json` - 권한, 훅, env (가장 효과가 큼)
    
    ```python
    # 매번 “이 명령 실행해도 되나요?” 승인 프롬프트가 사라짐.
    {
      "permissions": {
        "allow": [
          "Bash(yarn lint)",
          "Bash(yarn lint:fix)",
          "Bash(yarn test:api)",
          "Bash(yarn jest *)",
          "Bash(yarn test)",
          "Bash(npx expo install *)",
          "Bash(npx expo-doctor)"
        ]
      }
    }
    ```
    
    ```python
    # 파일 수정 직후 자동으로 yarn lint:fix 돌림. 이미 pre-commit 훅이 있으니 중복일 수도 았음
    {
      "hooks": {
        "PostToolUse": [{
          "matcher": "Write|Edit",
          "hooks": [{
            "type": "command",
            "command": "yarn lint:fix $CLAUDE_FILE_PATHS"
          }]
        }]
      }
    }
    ```
    
    > `settings.json` 은 팀 공유, `settings.local.json` 은 개인용 / git ignore. 승인된 명령은 보통 공유용으로 올린다.
    > 
2. `.claude/commands/*.md` - 커스텀 슬래스 커맨드
        
        ```python
        <!-- .claude/commands/review-rules.md -->
        스터디 노트 챕터 4의 "규칙 검증 프롬프트"를 실행한다.
        
        현재 프로젝트의 루트 CLAUDE.md와 서브디렉터리 CLAUDE.md들
        (src/**/CLAUDE.md), 그리고 CLAUDE.md에서 @로 참조되는 docs들을 검토해줘.
        
        다음 항목을 확인해 줘:
        1. 실제 프로젝트의 폴더 구조 및 라이브러리와 일치하는가?
        2. 중복되거나 서로 충돌하는 규칙이 있는가?
        3. 공통 규칙과 경로별 규칙이 적절하게 분리되어 있는가?
        4. 불필요하게 세분화되거나 장황한 규칙이 있는가?
        5. 규칙을 더 명확하고 검증 가능한 형태로 개선할 수 있는가?
        
        먼저 문제점과 개선안을 보고해 줘. 아직 파일은 수정하지 말아 줘.
        ```
        
        > `/review-rules` 치면 즉시 실행
        > 
        
        ```python
        <!-- .claude/commands/add-feature.md -->
        `$ARGUMENTS`라는 새 feature를 추가해줘.
        
        - `src/features/$ARGUMENTS/` 생성
        - 가장 유사한 기존 feature 구조 참고 (ex. pill_identification_search)
        - 불필요한 폴더는 만들지 말고, 필요해지면 그때 추가
        - `index.ts`에 외부 노출 모듈만 re-export
        - `app/$ARGUMENTS/index.tsx` 얇은 wrapper 생성
        - src/features/CLAUDE.md 규칙 준수
        ```
        
        > `/add-feature pill_history` 식으로 사용.
        > 
        - `/review-rules` -> CLAUDE.md 자가 검증
        - `update-docs` - 코드 변경 후 docs/ 동기화
        - `/check-db-query` - 새 쿼리의 prepared statement/999 상한 체크
3. `.claude/agents/*.md` - 서브에이전트
            
> 특정 영역의 전문가를 분리할 수 있다.
> 
- 코드리뷰 전담 에이전트
- 특정 도메인 (ex. SQLite 쿼리 전문)
- 외부 API 통합 전담
            
> 반복적으로 범위가 명확한 작업에 유용. 지금은 CLAUDE.md 체계만으로 충분하고, 나중에 매번 비슷한 분석을 반복한다 싶을 때 만들기
            > 
4. `.claude/skills/<name>/SKILL.md` - 재사용 워크플로우
            
 > 여러 단계로 나뉘는 반복 작업을 캡슐화.
> 
- 앱 리뷰 분석 → Linear 이슈 생성 같은 멀티스텝
- DB 스키마 변경 → 마이그레이션 작성 → 테스트 추가 같은 체인
