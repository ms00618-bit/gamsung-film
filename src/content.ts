// ─────────────────────────────────────────────────────────────
//  이 파일 하나만 고치면 사이트 내용이 바뀝니다.
//  영상 파일은 public/videos, 포스터 이미지는 public/posters 에 넣습니다.
// ─────────────────────────────────────────────────────────────

/** 사이트가 어느 주소 아래에 올라가도(예: 아이디.github.io/저장소/) 파일을 찾게 앞에 붙인다 */
const asset = (path: string) => import.meta.env.BASE_URL + path

export type WorkType = 'live' | 'hybrid' | 'ai'

export interface Work {
  id: string
  no: string
  title: string
  /** 작품 부제 (괄호 안 제목) */
  subtitle: string
  /** 화면에 표시할 기간 */
  period: string
  /** 기간 계산용 — 'YYYY.MM' */
  periodStart: string
  periodEnd: string
  role: string
  /** 촬영 장비 */
  camera: string[]
  /** AI 도구 */
  model: string[]
  /** 편집 도구 */
  edit: string[]
  crew: string
  type: WorkType
  /** 태그에 마우스를 올렸을 때 나오는 한 줄 설명 */
  tagNote: string
  /** 유튜브 영상 ID — youtu.be/ 뒤의 글자 */
  youtubeId: string
  loop: string
  poster: string
  /** 한 문단 작업 설명 — 비워두면 상세 뷰에 TODO 안내가 표시됩니다 */
  description: string
}

export const works: Work[] = [
  {
    id: 'docu-seongsu',
    no: '01',
    title: '다큐멘터리',
    subtitle: '성수로운 발전',
    period: '2026.03 — 2026.06',
    periodStart: '2026.03',
    periodEnd: '2026.06',
    role: '기획 · 촬영 · 이미지/영상 생성',
    camera: ['SONY A7M3', 'DJI Osmo Pocket 3', 'Beyond Touch AirMic Pro'],
    model: ['Higgsfield AI'],
    edit: [],
    crew: '이민석 외 3인',
    type: 'hybrid',
    tagNote: '현장 촬영 소스에 부분 AI 생성 컷을 더해 한 편으로 붙였습니다.',
    youtubeId: 'mllgKr27pxw',
    loop: asset('videos/docu-seongsu-loop.mp4'),
    poster: asset('posters/docu-seongsu-poster.jpg'),
    description: '',
  },
  {
    id: 'button-100years',
    no: '02',
    title: '졸업작품',
    subtitle: '단추, 100년의 의지를 잇다',
    period: '2025.08 — 2026.05',
    periodStart: '2025.08',
    periodEnd: '2026.05',
    role: '기획 · 이미지/영상 생성',
    camera: [],
    model: ['Nano Banana', 'Kling'],
    edit: ['Photoshop', 'Premiere Pro'],
    crew: '이민석 외 2인',
    type: 'ai',
    tagNote: '촬영 없이 이미지 생성과 영상 생성만으로 장면을 만들었습니다.',
    youtubeId: '2bciDam4Oqs',
    loop: asset('videos/button-100years-loop.mp4'),
    poster: asset('posters/button-100years-poster.jpg'),
    description: '',
  },
  {
    id: 'arirang-mv',
    no: '03',
    title: '제1회 꿈꾸는 아리랑 AI 뮤직비디오 공모전',
    subtitle: '서로다른 우리',
    period: '2026.04',
    periodStart: '2026.04',
    periodEnd: '2026.04',
    role: '기획 · 이미지/영상 생성',
    camera: [],
    model: ['GPT Image', 'Seedance', 'Suno'],
    edit: ['Premiere Pro'],
    crew: '개인',
    type: 'ai',
    tagNote: '이미지와 영상, 음악까지 생성으로 만든 캐릭터 뮤직비디오입니다.',
    youtubeId: '7c2TBPxUEOI',
    loop: asset('videos/arirang-mv-loop.mp4'),
    poster: asset('posters/arirang-mv-poster.jpg'),
    description: '',
  },
  {
    id: 'informercial-hall',
    no: '04',
    title: '인포머셜 비디오',
    subtitle: '독립기념관',
    period: '2025.06',
    periodStart: '2025.06',
    periodEnd: '2025.06',
    role: '기획 · 촬영',
    camera: ['SONY A7M3', 'DJI Mini 4K'],
    model: [],
    edit: ['Premiere Pro'],
    crew: '이민석 외 2인',
    type: 'live',
    tagNote: '지상 촬영과 드론 촬영으로만 구성했습니다.',
    youtubeId: '-wtcw68hcMs',
    loop: asset('videos/informercial-hall-loop.mp4'),
    poster: asset('posters/informercial-hall-poster.jpg'),
    description: '',
  },
  {
    id: 'beauty-promo',
    no: '05',
    title: '뷰티보건학과 졸업작품 홍보영상',
    subtitle: '아름다움을 설계하다',
    period: '2025.04 — 2025.05',
    periodStart: '2025.04',
    periodEnd: '2025.05',
    role: '감독',
    camera: ['SONY A7M3', 'DJI Mic'],
    model: [],
    edit: ['After Effects', 'Premiere Pro'],
    crew: '이민석 외 3인',
    type: 'live',
    tagNote: '촬영본을 After Effects와 Premiere Pro로 편집했습니다.',
    youtubeId: 'EJx7_6pi1X4',
    loop: asset('videos/beauty-promo-loop.mp4'),
    poster: asset('posters/beauty-promo-poster.jpg'),
    description: '',
  },
]

/** 대표 릴로 쓸 작품 id */
export const reelWorkId = 'docu-seongsu'

export const heroFilm = {
  src: asset('videos/hero-film.mp4'),
  poster: asset('posters/hero-poster.jpg'),
  /**
   * true = 아직 HERO FILM이 생성되지 않아 임시 영상을 쓰고 있다는 뜻.
   * 실제 HERO FILM을 /videos/hero-film.mp4 에 덮어쓴 뒤 false 로 바꾸세요.
   */
  isPlaceholder: false,

  /** prefers-reduced-motion 환경에서 쓰는 대체 이미지 3장 */
  stills: [
    { src: asset('posters/hero-still-1.jpg'), caption: '촬영할 수 있는 부분은 촬영합니다' },
    { src: asset('posters/hero-still-2.jpg'), caption: '없는 장면을 만든다' },
    { src: asset('posters/hero-still-3.jpg'), caption: '하나의 화면이 된다' },
  ],
}

export const brand = {
  name: '이민석',
  team: '감성필름사단',
  headline: '그것이 감성필름사단입니다.',
  sub: '카메라가 닿지 못한 장면까지 설계합니다.',
  roleline: '실사 촬영 · AI 생성 · 편집',
  heroCaptions: {
    first: '먼저 감성있게 촬영합니다',
    second: '그다음, 없는 필름은 만들어 이어갑니다.',
  },
}

export const about = {
  /** 팀이 확정한 공식 문구 — 고치지 않습니다 */
  teamIntro: [
    'AI 기술에 우리의 감성을 더해, 새로운 이야기를 영상으로 만들어갑니다.',
    '평범한 순간을 특별한 장면으로 바꾸는 AI 콘텐츠 크리에이터 팀, 감성필름사단입니다.',
  ],
  cameraTools: [
    { name: 'SONY A7M3', note: '주력 바디. 인터뷰와 현장 촬영.' },
    { name: 'DJI Mini 4K', note: '드론. 공간 전체를 보여주는 컷.' },
    { name: 'DJI Osmo Pocket 3', note: '짐벌 내장. 좁은 공간의 이동 촬영.' },
    { name: 'DJI Mic', note: '무선 마이크. 현장 인터뷰 동시 녹음.' },
    { name: 'Beyond Touch AirMic Pro', note: '보조 무선 마이크.' },
  ],
  modelTools: [
    { name: 'GPT Image', note: '캐릭터와 키 비주얼 이미지 생성.' },
    { name: 'Nano Banana', note: '이미지 생성과 장면 단위 수정.' },
    { name: 'Seedance', note: '이미지를 영상 컷으로 전개.' },
    { name: 'Kling', note: '인물 동작이 있는 컷 생성.' },
    { name: 'Suno', note: '뮤직비디오용 음악 생성.' },
    { name: 'Higgsfield AI', note: '다큐멘터리 보조 컷 생성.' },
  ],
  editTools: [
    { name: 'Premiere Pro', note: '편집과 최종 출력.' },
    { name: 'After Effects', note: '모션 그래픽과 합성.' },
    { name: 'Photoshop', note: '생성 이미지 보정과 리터치.' },
  ],
}

export const pipeline = [
  {
    no: '01',
    title: '촬영',
    body: '현장 조명과 동선을 먼저 정합니다. 드론과 짐벌로 공간을 잡고, 인터뷰는 무선 마이크로 동시 녹음합니다.',
    tools: 'SONY A7M3 · DJI Mini 4K · DJI Osmo Pocket 3',
    /** 영상이 아직 없으면 빈 문자열 — 자리표시가 보입니다 */
    video: asset('videos/pipeline-01-shoot.mp4'),
    poster: asset('posters/pipeline-01-shoot-poster.jpg'),
  },
  {
    no: '02',
    title: '생성',
    body: '촬영으로 담을 수 없는 컷은 생성으로 만듭니다. 레퍼런스를 먼저 설계하고, 이미지를 만든 뒤 영상으로 전개합니다. 룩을 먼저 맞추고 시작합니다.',
    tools: 'GPT Image · Nano Banana · Seedance · Kling · Higgsfield AI',
    /** 영상이 아직 없으면 빈 문자열 — 자리표시가 보입니다 */
    video: asset('videos/pipeline-02-generate.mp4'),
    poster: asset('posters/pipeline-02-generate-poster.jpg'),
  },
  {
    no: '03',
    title: '결합',
    body: '생성 소스를 그대로 쓰지 않습니다. 실사 푸티지의 노출과 색온도, 그레인에 맞춰 보정한 다음 같은 타임라인에 올립니다. 판단은 편집실에서 끝납니다.',
    tools: 'Premiere Pro · After Effects · Photoshop',
    /** 영상이 아직 없으면 빈 문자열 — 자리표시가 보입니다 */
    video: asset('videos/pipeline-03-combine.mp4'),
    poster: asset('posters/pipeline-03-combine-poster.jpg'),
  },
]

export const contact = {
  email: 'ms00618@gmail.com',
  instagram: 'Gamsung_Film_2026',
  instagramUrl: 'https://instagram.com/Gamsung_Film_2026',
}

export const sections = [
  { id: 'hero', label: 'Top' },
  { id: 'reel', label: 'Reel' },
  { id: 'works', label: 'Works' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'numbers', label: 'Numbers' },
  { id: 'about', label: 'About' },
]
