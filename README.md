# INNO 리볼버 퀀트 시스템 (INNO Revolver Quant System)

GitHub Pages 및 정적 웹 호스팅 환경에 즉시 배포할 수 있는 월가 멀티팩터 퀀트 트레이딩 대시보드입니다.

## 주요 기능

1. **실시간 종목 차트 (화면 1/3 비중) + MDD 낙폭 라인 & 지지/저항(S/R)**
   - 상단 티커 입력창 또는 빠른 선택 버튼으로 미국 증시 종목(`NVDA`, `TSLA`, `AAPL`, `MSFT`, `PLTR`, `TQQQ`, `SPY` 및 임의 티커) 분석 전환
   - 실시간 가격, Envelope(20, 2.5%), 주요 저항(R1/R2)·지지(S1/S2) 레벨 및 하단 **MDD(최대낙폭) 라인** 실시간 렌더링
2. **월가 퀀트 매수(BUY) / 매도(SELL) 시그널 오실레이터**
   - MACD, RSI, MFI, OBV, 3중 Slow Stochastic `%K` (`(5,3,3)`, `(12,5,5)`, `(20,12,12)`), Momentum, Envelope, VR 통합 반영
   - 다크풀 거래량, 기관 수급, 스마트머니 포지션, 지정학적 위기 지수, 매크로 지표, 거시경제 뉴스, 섹터별 수급 이동 현황 연동
3. **INNO 퀀트 종합 점수 (1~100점)**
   - 기술적 지표(35%) + 수급·옵션(40%) + 매크로·지정학·섹터(25%) 가중치 기반 종합 점수 및 등급 표시
4. **공매도 · 풋/콜 옵션 우위 & 위험도**
   - 풋/콜 옵션 비율(PCR) 우위, 공매도 비율 및 커버일수, 95% VaR, 감마 노출(GEX), 위험도 배지 표시
5. **글로벌 SNS 투자 심리 지수 (1~100점)**
   - X(Twitter), Reddit, StockTwits 통합 투자 심리 점수 및 채널별 세부 지수 표시
6. **글로벌 매크로 상단 바**
   - 공포탐욕지수, VIX 변동성 지수, 지정학적 위기 지수(GPR) 실시간 표시

## GitHub 업로드 및 GitHub Pages 배포 방법

1. GitHub에서 새 저장소(Repository)를 생성합니다. (예: `inno-revolver-quant`)
2. 저장소 루트에 `index.html`, `README.md`, `.github/workflows/deploy-pages.yml` 파일을 업로드합니다.
3. GitHub 저장소의 **Settings > Pages** 메뉴에서 **Source**를 **GitHub Actions**로 설정합니다.
4. `main` 브랜치에 푸시(Push)하면 자동으로 GitHub Pages URL이 생성됩니다.

> **참고**: 브라우저 단독 실행 환경에서도 즉시 동작하도록 실시간 시뮬레이션 스트리밍 엔진이 내장되어 있으며, 실계좌/실시간 유료 API(Polygon, Finnhub, Alpha Vantage, Tradier 등)를 연결하려면 `updateDashboardTick()` 내부 데이터 피드 부분을 해당 REST/WebSocket 엔드포인트로 교체하면 됩니다.
