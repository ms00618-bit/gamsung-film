@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  감성필름사단 포트폴리오 사이트를 시작합니다.
echo  브라우저에서 http://localhost:5174 를 여세요.
echo  끌 때는 이 창에서 Ctrl+C 를 누르거나 창을 닫으면 됩니다.
echo.
if not exist node_modules (
  echo  처음 실행이라 준비 중입니다. 1분쯤 걸립니다...
  call npm install
)
start "" http://localhost:5174
call npm run dev
pause
