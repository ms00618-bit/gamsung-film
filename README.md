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
WORKS 태그, 필터, NUMBERS 의 비율 막대가 **자동으로** 다시 계산됩니다.
숫자를 따로 적는 곳은 없습니다.

## 페이지 구성 (위에서 아래로)

| 구역 | 내용 |
|---|---|
| Hero | 스크롤에 맞춰 영상이 앞뒤로 감기는 화면. 3단계 카피 → 이름·메인 카피 → CTA |
| The Reel | 대표 릴 (다큐멘터리 「성수로운 발전」). 유튜브 영상 — 누르기 전에는 포스터만 보임 |
| Works | 작품 5편 인덱스 목록. LIVE / HYBRID / AI 태그와 필터, 행을 누르면 상세(유튜브 영상) |
| Pipeline | 촬영 → 생성 → 결합 3단계 |
| Numbers | 작품 데이터에서 계산한 수치 카운트업 + 실사:하이브리드:AI 비율 |
| About | 소개, 촬영 장비와 AI 도구를 같은 비중으로 |

## 영상 파일 상태

| 자리 | 상태 |
|---|---|
| `public/videos/hero-film.mp4` | ✅ 실제 HERO FILM (원본: 최종5인 포트폴리오/hero1.mp4). 소리를 빼고 스크롤용으로 다시 인코딩함 |
| `pipeline-01-shoot.mp4` | ✅ 촬영 현장 사진 4장을 디졸브로 이은 11초 반복 영상 (원본 사진: source-images/pipeline-01) |
| `pipeline-02-generate.mp4` | ✅ 생성 과정 이미지 3장을 디졸브로 이은 8.5초 반복 영상 (원본: source-images/pipeline-02) |
| `pipeline-03-combine.mp4` | ✅ 편집실 이미지 1장에 천천히 들어갔다 나오는 10초 반복 영상 (원본: source-images/pipeline-03) |
| 각 작품 `description` | 비어 있음. 채우면 상세 화면의 NOTE 에 나옵니다 |

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

## 배포용 파일 만들기

```
npm run build
```

`dist` 폴더가 만들어집니다. 약 17MB이고, 이 폴더를 그대로 올리면 됩니다.
