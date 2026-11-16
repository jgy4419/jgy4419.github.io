---
title: .claude 폴더 활용 - skills, commands, hooks, agents
description: claude code에 skill, command, hook, agent 을 직접 만들어보기
draft: false
pubDate: 2026-11-17
updatedDate: ''
category: CLAUDE
tags:
  - clade
  - ai
heroImage: ''
---

## Commands / Skills - 커스텀 슬래시 명령

> 반복적으로 시키는 작업을 `/` 명령어 하나로 실행 시켜준다.

**Command / Skill 차이점**

> 처음에는 Command, Skill 둘 다 슬래시 커맨드로 호출되니 같은 거 아닌가? 싶었지만 원래는 별개 개념. 현재는 통합되어 둘 다 같은 `/` 명령어 인터페이스로 작동한다.

- `CLAUDE.md` : 매 세션마다 자동으로 로드되는 프로젝트 규칙
- `.claude/commands` : 내가 직접 / 명령어로 호출하는 커맨드. 내가 `/` 명령어를 직접 입력했을 때만 실행된다. (자동 실행 x)
- `.claude/skills/` : Claude가 대화 흐름을 보고 자동으로 감지해서 쓰는 스킬 (클로드가 지금 이 스킬이 필요한 상황이다. 판단하면 자동으로 로드한다. (내가 직접 호출할 수도 있지만 핵심은 `자동 감지`)

**Commands 를 쓰는 경우**

- 사이드이펙트가 있는 작업 (push, deploy, 파일 삭제)
- 내가 타이밍을 직접 제어해야 되는 작업
- 단순한 반복 작업 자동화

**Skills 를 쓰는 경우**

- Claude가 알아서 판단해서 써줬으면 하는 작업
- 지원 파일(스크립트, 템플릿)이 필요한 복잡한 작업
- 여러 프로젝트에서 공통으로 쓰는 방법론

**파일 위치**

- `.claude/commands/<name>.md` - 간단한 프롬프트
- `.claude/skills/<name>/SKILL.md` - 복잡한 로직 (디렉터리)

**ex. ESLine 전체 자동 수정**
경로 :  .claude/commands/lint-fix.md

```plain
---
description: "ESLint 전체 자동 수정"
allowed-tools: Bash(yarn:*)
---

!`yarn lint:fix`
변경된 파일 요약하고, 수정 안 된 에러 남아있으면 리스트업
```

- 실행 : 세션에서 `/lint-fix` 입력

**핵심 문법**

- $1, $2, $ARGUMENTS - 인자 접근
- !`bash command` - Bash 실행 결과 삽입
- @path/to/file - 파일 내용 삽입

**언제 사용?** : 매번 치는 명령어 조합이 2개 이상일 때

## 2. Hooks - 자동 트리거

> 특정 이벤트에 Bash 스크립트 자동 실행.

**파일 위치** : `.claude/settings.json` 의 `hooks` 섹션

**ex. 파일 저장 후 자동 lint**

```plain
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/lint.sh",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

**실행 시점 (주요 이벤트)**

| 이벤트 | 언제 | 차단 기능 |
| --- | --- | --- |
| PreToolUse | 도구 호출 전 | o (exit 2) |
| PostToolUse | 도구 호출 후 | X |
| SessionStart | 세션 열릴 때 | X |
| Stop | Claude 응답 끝날 때 | X |

**핵심 규약**

- stdin 으로 JSON 받음 (`tool_input.file.path` 등)
- exit 0 = 계속, exit 2 = 차단
- 새로운 세션에서만 로드된다.

**터미널 프로그램은 3개의 통로가 있음**

| 이름 | 역할 | 비유 |
| --- | --- | --- |
| stdin | 프로그램에 들어오는 입력 | 받은 편지함 |
| stdout | 프로그램이 내보내는 결과 | 보낸 편지함 |
| stderr | 프로그램이 내보내는 에러 메시지 | 오류 편지함 |

**언제 사용?** : "저장 후 lint", "민감 파일 차단", "완료 시  알림" 같은 자동 부착용.

## Agents - 서브 에이전트

> 격리된 컨텍스트에서 전문 작업 수행하는 보조 Claude.

**파일 위치** : `.claude/agents/<name>.md`

**예제**

**예제 파일 위치** : `.claude/agents/sql-reviewer.md`

```plain
---
name: sql-reviewer
description: "SQLite 마이그레이션/쿼리 변경 시 호출. injection, 배치 크기, 롤백 검토."
tools: Read, Grep, Glob
---

당신은 SQLite 전문가입니다. 변경사항을 다음 기준으로 검토:
- Prepared statement 사용
- 배치 INSERT 50행 한도
- 트랜잭션/롤백
```

**실행 방식**

- 메인 Claude가 description 보고 자동 호출 또는
- 사용자가 "sql-reviewer로 검토해줘" 라고 명시적 호출

**핵심 특성**

- 격리된 세션 : 메인 대화 이력 안 보임
- 결과만 메인에 반환 -> 메인 컨텍스트 보호
- `tools` 로 권한 제한 (리뷰 전용은 Write 제외)

**언제 쓰는지?**

- 긴 탐색이 메인 컨텍스트를 오염시킬 때
- 특정 영역 체크리스트를 반복 적용할 때
- 단순 작업에는 사용하지 않는다. (오버헤드 큼)
