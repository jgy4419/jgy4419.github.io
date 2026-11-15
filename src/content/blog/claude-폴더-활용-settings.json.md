---
title: .claude 폴더 활용 - settings.json
description: .claude 폴더 하위에 settings.json 내용 정리
draft: true
pubDate: 2026-11-16
updatedDate: ''
category: CLAUDE
tags:
  - AI
  - claude
heroImage: ''
---

> 프로젝트별 설정, 메모리, 커스텀 기능을 .claude/ 폴더에 저장한다.

### 1. 위치와 범위

| 위치 | 범위 | 용도 |
| --- | --- | --- |
| .claude/ (프로젝트 루트) | 프로젝트 | 팀 전체가 공유할 설정, hooks, permissions |
| ./ .claude/ (홈) | 글로벌 | 개인 선호도 (테마, 기본 모델, 글로벌 스킬) |

**환경 변수 : `CLAUDE_CONFIG_DIR` 로 \~/claude 위치 변경 가능.**

**설정 우선순위 (높은 순)**

1. Managed Settings - 조직 정책 (MDM)
2. CLI 플래그 - `--settings, --model` 등
3. Project Local - `.claude/settings.local.json`
4. Shared Project - `.claude/settings.json`
5. User - `~/.claude/settings.json`

> 배열 설정 (permissions.allow 등)은 덮어쓰지 않고 merge 된다
