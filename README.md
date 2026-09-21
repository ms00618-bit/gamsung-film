# 감성필름사단 / 이민석 포트폴리오 사이트

실사 촬영과 AI 생성을 함께 다루는 영상 디자이너의 한 페이지 포트폴리오.
React + TypeScript + Vite + Tailwind CSS.

## 실행하기

1. `dev.bat` 더블클릭 → 브라우저가 자동으로 열림 (http://localhost:5174)
   - 처음 한 번은 패키지 설치 때문에 1분쯤 걸립니다.
2. 코드를 고치고 저장하면 브라우저가 알아서 새로고침됩니다.
3. 끌 때는 검은 창에서 `Ctrl+C` 또는 창 닫기.

터미널에서 직접 실행하려면:

```
npm install
npm run dev
```

## 어디를 고치면 되나

| 파일/폴더 | 내용 |
|---|---|
| `src/content.ts` | **글자, 작품 목록, 영상 경로, 연락처** — 내용을 바꿀 때는 여기만 고치면 됩니다 |
| `public/videos/` | 영상 파일 |
| `public/posters/` | 포스터·정지 이미지 |
| `src/sections/` | 화면 구역별 코드 (Hero, Reel, Works, Pipeline, Numbers, About) |
| `src/components/` | 여러 곳에서 같이 쓰는 부품 (Nav, Footer, WorkTag, SectionHead) |
| `index.html` | 브라우저 탭에 보이는 제목 |

작품을 추가하려면 `src/content.ts` 의 `works` 배열에 항목을 하나 더 넣으면 됩니다.
`type` 을 `'live' | 'hybrid' | 'ai'` 중 하나로 적으면
WORKS 태그와 필터가 **자동으로** 바뀝니다.

NUMBERS 의 숫자는 모두 자동입니다. 작품 수와 실사·하이브리드·AI 편수는 `archive`(WORKS → ALL) 목록에서,
촬영 장비·AI 도구 수는 ABOUT 의 도구 목록 개수로 셉니다. AI 가 아닌 작품은 모두 실사(live)로 적습니다.

### 전체 작품(ALL)에 영상 링크 달기

`content.ts` 의 `archive` 목록에서 해당 작품의 `youtube: ''` 따옴표 사이에
유튜브 주소를 그대로 붙여 넣으면 됩니다. 쇼츠 주소(youtube.com/shorts/…)면 세로 화면으로 나옵니다.

## 페이지 구성 (위에서 아래로)

| 구역 | 내용 |
|---|---|
| Hero | 스크롤에 맞춰 영상이 앞뒤로 감기는 화면. 3단계 카피 → 이름·메인 카피 → CTA |
| The Reel | 대표 릴 (다큐멘터리 「성수로운 발전」). 유튜브 영상 — 누르기 전에는 포스터만 보임 |
| Works | TOP = 대표작 5편, ALL = 전체 작품(최신순). LIVE / HYBRID / AI 는 전체 중 종류별. 행을 누르면 상세(유튜브 영상) |
| Pipeline | 촬영 → 생성 → 편집 3단계 |
| Numbers | 전체 작품 수·장비·도구 수 카운트업 + 실사:하이브리드:AI 비율 |
| About | 소개, 촬영 장비와 AI 도구를 같은 비중으로 |

## 영상 파일 상태

| 자리 | 상태 |
|---|---|
| `public/videos/hero-film.mp4` | ✅ 실제 HERO FILM (원본: 최종5인 포트폴리오/hero1.mp4). 소리를 빼고 스크롤용으로 다시 인코딩함 |
| `pipeline-01-shoot.mp4` | ✅ 촬영 현장 사진 4장을 디졸브로 이은 11초 반복 영상 (원본 사진: source-images/pipeline-01) |
| `pipeline-02-generate.mp4` | ✅ 필름 스트립·어두운 작업실 이미지 2장을 디졸브로 이은 7초 반복 영상 (원본: source-images/pipeline-02) |
| `pipeline-03-combine.mp4` | ✅ 컬러 그레이딩 책상·밝은 작업실 이미지 2장을 디졸브로 이은 7초 반복 영상 (원본: source-images/pipeline-03) |

## 영상 변환

**작품 본편 5편은 유튜브에 올려서 불러옵니다.** 유튜브 주소가 바뀌면
`content.ts` 의 `youtubeId` (youtu.be/ 뒤의 글자)만 고치면 됩니다.

예전에 쓰던 1080p 본편 파일(`*-full.mp4`, 약 400MB)은 배포 용량 때문에
`C:\Users\user\capcut\gamsung-film-full-videos` 로 옮겨 두었습니다. 사이트에서는 쓰지 않습니다.

사이트 안에 직접 들어 있는 영상:

- `*-loop.mp4` — 6초 무음, 목록에서 마우스 올렸을 때
- `*-poster.jpg` — 영상 로딩 전에 보이는 이미지

히어로 영상은 스크롤로 되감기 때문에 키프레임을 촘촘하게(`-g 5`) 넣어 인코딩했습니다.
새 히어로 영상도 같은 옵션으로 변환해야 스크롤이 부드럽습니다.

```
ffmpeg -i 원본.mp4 -an -vf scale=1280:-2 -c:v libx264 -preset slow -crf 25 ^
  -g 5 -keyint_min 5 -sc_threshold 0 -movflags +faststart public/videos/hero-film.mp4
```

## 인터넷 주소

https://ms00618-bit.github.io/gamsung-film/

GitHub 저장소(ms00618-bit/gamsung-film)의 main 브랜치에 올리면
GitHub Actions 가 자동으로 빌드해서 1~2분 뒤 위 주소에 반영됩니다.

VS Code 에서 올리기: 왼쪽 **소스 제어** 아이콘 → 메시지 입력 → **커밋** → **변경 내용 동기화**

### 휴대폰용 히어로 사진 (public/hero-seq)

아이폰은 영상을 스크롤로 감는 방식을 잘 지원하지 않아서, 휴대폰·태블릿에서는
히어로 영상을 사진 120장으로 나눈 것을 스크롤에 맞춰 넘깁니다. (PC는 영상 그대로)
히어로 영상을 바꾸면 사진도 다시 만들어야 합니다.

```
ffmpeg -i public/videos/hero-film.mp4 -vf "fps=12,scale=1280:-2" -c:v libwebp -quality 68 public/hero-seq/f%03d.webp
```

사진 장수가 120장이 아니면 `content.ts` 의 `heroFilm.sequence.count` 를 맞춰 주세요.

### 문제 확인용 주소

주소 끝에 `?debug` 를 붙이면 히어로 왼쪽 위에 지금 어떤 방식으로 동작하는지 표시됩니다.

- `mode: sequence` — 휴대폰용 사진 넘기기
- `mode: video` — PC용 영상
- `mode: stills` — 영상 재생이 막혀서 사진 3장으로 대신하는 중
- `mode: reduced-motion` — 기기의 '동작 줄이기' 설정이 켜져 있음

## 배포용 파일 만들기 (직접 올릴 때만)

```
npm run build
```

`dist` 폴더가 만들어집니다. 약 17MB이고, 이 폴더를 그대로 올리면 됩니다.
