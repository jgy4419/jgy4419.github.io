---
title: .claude 폴더 활용 - settings.json
description: .claude 폴더 하위에 settings.json 내용 정리
draft: true
pubDate: 2026-11-16
updatedDate: 2026-11-17
category: CLAUDE
tags:
  - AI
  - claude
heroImage: ''
---

---
title: .claude 폴더 활용 - settings.json
description: .claude 폴더 하위에 settings.json 내용 정리
draft: false
pubDate: 2026-11-16
updatedDate: ''
category: CLAUDE
tags:
  - claude
  - AI
heroImage: ''
---

> 참조 : [https://daleseo.com/claude-code-settings/](https://daleseo.com/claude-code-settings/)

### 1. 위치와 범위

> 프로젝트별 설정, 메모리, 커스텀 기능을 .claude/ 폴더에 저장한다. 

| 위치 | 범위 | 용도 |
| --- | --- | --- |
| `.claude/ (프로젝트 루트)` | 프로젝트 | 팀 전체가 공유할 설정, hooks, permissions |
| `./ .claude/ (홈)\` | 글로벌 | 개인 선호도 (테마, 기본 모델, 글로벌 스킬) |

**환경 변수 : `CLAUDE_CONFIG_DIR` 로 \~/claude 위치 변경 가능.**

**설정 우선순위 (높은 순)**

1. Managed Settings - 조직 정책 (MDM)
2. CLI 플래그 - `--settings, --model` 등
3. Project Local - `.claude/settings.local.json`
4. Shared Project - `.claude/settings.json`
5. User - `~/.claude/settings.json`

> 배열 설정 (permissions.allow 등)은 덮어쓰지 않고 merge 된다.

## 2. 주요 파일 / 디렉터리

### **`settings.json - 핵심 설정 파일`**

> 클로드 코드를 설치하고 기본 사용법을 익혔다면 나한테 맞는 환경을 만든다. `settings.json` 이라는 설정 파일로 권한 관리부터 모델 선택, 환경 변수, 샌드박스, 커밋 메시지 서명까지 폭넓게 제어가능.

**설정 파일의 계층 구조**

| **우선순위** | **범위** | **위치** | **용도** |
| --- | --- | --- | --- |
| 1 (최고) | 관리형 | 시스템 경로, MDM, 관리 콘솔 | 조직 전체 정책 (IT 관리자용) |
| 2 | 명령줄 | `claude --settings <JSON>` | 일회성 세션 설정 |
| 3 | 로컬 프로젝트 | `.claude/settings.local.json\` | 개인 프로젝트 설정 (Git 커밋 제외) |
| 4 | 공유 프로젝트 | `.claude/settings.json` | 팀 공유 설정 (Git 커밋 대상) |
| 5 (최저) | 사용자 | `~/.claude/settings.json` | 모든 프로젝트에 쓰는 개인 설정 |

- 기본 규칙은 **“같은 키라면 높은 우선순위의 값이 이긴다”** 이다.
- 다만 `permissions.allow` 같은 배열은 덮어쓰지 않고 합쳐진다. 사용자 설정의 허용 규칙과 프로젝트 설정의 허용 규칙이 모두 적용되는 것.
- 권한 규칙은 어느 파일에 있든 차단(deny) 규칙을 먼저 평가하기 때문에, 사용자 설정에서 허용한 명령도 프로젝트 설정이 막으면 막힌다.

**어디에 무엇을 넣을까?**

> 실무에서는 주로 세 가지 파일을 쓰게 된다. 클로드 코드를 설치한다고 파일들이 자동으로 생기는 것이 아니니 필요할 때 직접 만들면 된다.

- `~/.claude/settings.json` (사용자 설정)은 모든 프로젝트에 공통으로 적용되는 개인 설정이다.
- 선호하는 모델이나 응답 언어, 자주 쓰는 명령어 허용 규칙 같은 것도 넣어 두면 된다.

```plain
{
  "model": "opus",
  "language": "korean",
  "permissions": {
    "allow": ["Bash(* --version)", "Bash(* --help *)"]
  }
}
```

- `.claude/settings.json` (공유 프로젝트 설정)은 팀원 모두가 공유하는 설정 파일이다.
- Git에 커밋하면 저장소를 클론한 사람 모두에게 같은 규칙이 적용된다.
- 프로젝트에서 쓰는 빌드나 테스트 명령어를 허용하고 민감한 파일 접근을 막는 용도로 활용한다.

```plain
{
  "permissions": {
    "allow": [
      "Bash(bun run build)",
      "Bash(bun run test *)",
      "Bash(bun run lint)"
    ],
    "deny": ["Read(./.env)", "Read(./.env.*)", "Read(./secrets/**)"]
  }
}
```

- 커밋된 프로젝트 설정의 `allow` 규칙과 대부분의 `env` 값이 팀원 각자가 해당 폴더를 신뢰한 뒤에야 적용된다는 것.
- 낯선 저장소를 클론하자마자 그 안의 설정이 명령을 마음대로 허용하지 못하게 하려는 장치이다.
- 반대로 `deny` 와 `ask` 규칙은 신뢰 여부와 상관없이 바로 적용된다.
- `.claude/settings.local.json` (로컬 프로젝트 설정)은 이 프로젝트에서 나에게만 적용되는 설정이다.
- 팀 설정 위에 나만의 예외를 얹을 때 씀. 권한 요청에 `“Yes, and don’t ask again”` 을 고르면 클로드 코드가 그 규칙을 이 파일에 저장한다.\`
`- 이때 Git 전역 제외 파일에 `\*\*/.claude/settings.json\` 을 추가해 주기 때문에 실수로 커밋될 걱정도 없다.
- 이 파일을 손으로 먼저 만들었다면 `.gitignore` 에 직접 넣어야됨

**`/config` 로 간편하게 설정하기**

> JSON 파일을 직접 편집하기 번거롭다면 `/config` 슬래시 커맨드의 대화형 UI를 써도 된다.

- 클로드 코드 세션에서 `/config` 를 입력하고 Config 탭으로 이동하면 자주 바꾸는 개인 설정 목록이 나온다.
- 항목을 골라 값을 바꾸면 클로드 코드가 알맞은 파일에 대신 저장해준다.
- 메뉴를 거치지 않고 한 줄로 바꿀 수 있다. ex. `/config verbose=true`

**권한 설정**

> 클로드 코드를 쓰다 보면 자주 마주치는 것이 권한 요청 팝업이다. `permissions` 설정을 잘 잡아 두면 이런 번거로움이 준다.

```plain
{
  "permissions": {
    "allow": ["Bash(bun run *)"],
    "ask": ["Bash(git push *)"],
    "deny": ["Read(./.env)"],
    "defaultMode": "acceptEdits"
  }
}
```

- 권한 규칙은 `도구(패턴)` 형식으로 작성한다. `Bash(bun run *)` , `Read(./.env)` , `WebFetch(domain:example.com)` , `mcp__github__create_issue` 처럼 도구마다 패턴 문법이 다르고, 규칙은 deny, ask, allow 순서로 평가한다.
- 그래서 넓은 deny 규칙에 걸리는 명령은 더 구체적인 allow 규칙이 있어도 막힌다.
- `default` 모드는 새 세션이 시작할 권한 모드를 정한다.
- `default, acceptEdits, plan, auto, dontAsk, bypassPermissions` 중에서 고름.
- `auto` 와 `bypassPermissions` 는 프로젝트 설정이나 로컬 설정에 적어도 무시되고
- 사용자 설정이나 관리형 설정에서만 적용된다. (저장소에 커밋된 파일 하나로 확인 절차가 통째로 꺼지는 일을 막으려는 것)

**`availableModels` 는 고를 수 있는 모델을 제한한다. ex.** `"availableModels": ["sonnet", "haiku"]`

```
{
  "availableModels": ["sonnet", "haiku"]
}
```

**`effortLevel` 은 모델이 응답에 얼마나 공을 들일지 정한다.**
```
{
  "effortLevel": "high"
}
```

- 사고(thinking) 분량만이 아니라 도구 호출 횟수와 응답 길이, 설명의 상세함까지 영향을 받는다.
- `"low", "medium", "high", "xhigh"` 중 하나를 정한다. ex. `"effortLevel": "high"`

**`alwaysThinkingEnabled` 는 확장 사고를 켜고 끈다.**

> 지원하는 모델에서는 확장 사고가 기본적으로 켜져 있으니 끄고 싶을 때 `false` 로 사용하는 용도

**언어 출력과 스타일**

> `language` 는 클로드 코드의 기본 응답 언어를 지정한다.

- `korean` 으로 설정하면 영어로 질문해도 한국어로 답해 줘서, 클로드 코드로 한국어로 쓰고 싶을 때 가장 먼저 넣는 설정.
- 값은 언어 이름이면 무엇이든 되고 클로드 코드가 따로 검증하진 않는다.

```plain
{
  "language": "korean"
}
```

- `outputStyle` 은 응답 스타일을 이름으로 고른다.
- `Explanatory` 로 설정하면 코드만 달랑 주는 대신 구현을 그렇게 선택한 이유를 함께 설명해준다.
- 직접 만든 스타일 이름을 적을 수도 있다.

```plain
{
  "outputStyle": "Explanatory"
}
```

**환경 변수와 업데이트, 대화 기록**

> `env` 는 셸 설정 파일 (`.bashrc, .zshrc`) 을 고치지 않고 클로드 코드 세션과 그 하위 프로세스에만 적용되는 환경 변수를 지정한다.

- 타임아웃이나 토큰 제한을 조정할 때 사용하면 되며
- 여러 세션이 같은 **태스크 리스트**를 공유하도록 `CLAUDE_CODE_TASK_LIST_ID` 를 설정하는 것도 가능함.

```plain
{
  "env": {
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "16384",
    "BASH_DEFAULT_TIMEOUT_MS": "30000",
    "MCP_TIMEOUT": "10000"
  }
}
```

**`autoUpdatesChannel`**

- `autoUpdatesChannel` 은 자동 업데이트가 따라갈 릴리즈 채널이다. 기본 값은 `"lastest"` 이고m `"stable"` 로 바꾸면 보통 일주일쯤 지난 버전 중 큰 회귀가 없는 버전을 받을 수 있다.\`
`- 안정성이 중요한 팀이면 `"stable"\` 을 고려해볼만하다.

```plain
{
  "autoUpdatesChannel": "stable",
}
```

**`cleanupPeriodDays`**

- `cleanupPeriodDays` 는 대화 기록(transcript)을 며칠 동안 보관할지 정한다.
- 기본값을 30일이고, 이 기간이 지난 세션은 조용히 지워져 `/resume` 목록에도 사라진다.

```plain
{
  "cleanupPeriodDays": 90
}
```

### 커밋 메시지와 PR 서명

> 클로드 코드가 Git 커밋이나 PR을 만들 때 붙이는 서명은 `attribution` 으로 바꾼다.

```plain
{
  "attribution": {
    "commit": "Co-Authored-By: Claude <noreply@anthropic.com>",
    "pr": ""
  }
}
```

- `commit` 은 커밋 메시지 끝에 붙는 텍스트이다. 아무것도 지정하지 않으면 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` 처럼 커밋할 때 쓴 모델 이름이 들어간 트레일러가 붙는다.
- 모델 이름 없이 `claude` 로만 남기고 싶으면 위에처럼 적기. `""` 으로 두면 서명이 빠진다.\`
`- 커밋과 PR 서명을 한 번에 모두 없애고 싶다면 `"attribution": false"\` 로 설정하기

### MCP 서버 설정

> 프로젝트의 `.mcp.json` 에 정의된 MCP 서버는 처음 연결할 때 승인을 받는다. 모두 자동으로 승인하려면 아래 옵션 추가

```plain
{
  "enableAllProjectMcpServers": true
}
```

- 모든 서버를 한꺼번에 승인하는 대신 특정 서버만 골라서 승인하거나 거부할 수도 있다.
- `disabledMcpjsonServers` 에 넣은 서버는 자동 승인을 켜 두었더라도 거부된다.

```plain
{
  "enabledMcpjsonServers": ["memory", "github"],
  "disabledMcpjsonServers": ["filesystem"]
}
```

- 다만 이 승인 키들은 아직 신뢰하지 않은 폴더라면 공유 프로젝트 설정에 적어도 무시된다.
- 팀원 각자가 폴더를 신뢰하고 나면 그때부터 매번 승인할 필요가 없어진다.

### 샌드박스 설정

> 샌드박스란? : Claude Code가 실행하는 명령어와 코드가 로컬 시스템 전체에 해를 끼치지 않도록 운영체제(OS) 수준에서 파일 시스템과 네트워크 접근 범위를 제한하는 보안 격리 메커니즘

- macOS : Apple의 `Seatbelt` 프레임워크 사용
- Linux / WSL2 : `bubblewrap` 및 `socat` 활용
- 파일 시스템 격리 : 작업 디렉터리 (현재 폴더) 내의 읽기, 쓰기는 허용하되, 민감한 시스템 파일이나 설정 파일 ex. `~/.bashrc` , 주요 설정 및 비밀번호 파일 등)에 대한 접근은 차단됨
- 네트워크 격리 : 외부 프록시를 통해 네트워크 요청을 감시하며, 사전에 허용된 도메인 외에는 접속을 차단한다. 프롬프트 인젝션 등으로 악성 스크립트나 승인되지 않은 API를 호출하려 해도 OS 레벨에서 막힘!

```plain
{
  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true,
    "excludedCommands": ["docker *"],
    "allowUnsandboxedCommands": false,
    "network": {
      "allowedDomains": ["github.com", "*.npmjs.org"],
      "allowLocalBinding": true
    }
  }
}
```

- `enabled` : 샌드박스 활성화 여부
- `autoAllowBashIfSandboxed` : 샌드박스 안에서 실행되는 Bash 명령은 권한 확인 없이 실행
- `excludedCommands` : 샌드박스 밖에서 실행할 명령 패턴
- `allowUnsandboxedCommands` : 샌드박스에 막힌 명령을 샌드박스 밖에서 재시도하도록 허용할지 여부
- `network.allowedDomains` : 확인 없이 접근을 허용할 도메인
- `network.allowLocalBinding` : macOS 에서 포트를 열고 localhost에 접속하도록 허용(개발 서버용)

### 개인 개발자들을 위한 설정

```plain
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "model": "opus",
  "language": "korean",
  "outputStyle": "Explanatory",
  "permissions": {
    "allow": [
      "Bash(bun run *)",
      "Bash(git add *)",
      "Bash(git commit *)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(git status)",
      "Bash(* --version)",
      "Bash(* --help *)"
    ],
    "ask": ["Bash(git push *)"],
    "deny": ["Bash(rm -rf *)", "Bash(sudo *)"],
    "defaultMode": "acceptEdits"
  },
  "attribution": {
    "commit": "Co-Authored-By: Claude <noreply@anthropic.com>"
  },
  "cleanupPeriodDays": 90
}
```

> 팀 프로젝트나 CI/CD 환경별 추천 설정은 클로드 코드 권한 설정에서 확인할 수 있다.

### Hooks와 함께 사용하기

> 클로드 코드 Hooks 도 setting.json에 정의한다. 예시로 코드를 수정한 뒤 자동으로 포맷터를 실행하는 Hook 추가해보기

```plain
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs bunx prettier --write"
          }
        ]
      }
    ]
  }
}
```

- `PostToolUse` 이벤트에 `Edit|Write` 매처를 걸어 두면 클로드가 파일을 수정할 때마다 Prettier가 실행된다.
- Hook 명령은 도구 호출 정보를 표준 입력의 JSON으로 받기 때문에 `jq` 로 `tool_input.file_path` 를 꺼내 Prettier에 넘기는 것.
