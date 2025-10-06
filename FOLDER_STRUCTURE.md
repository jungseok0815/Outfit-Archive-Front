# 폴더 구조 리팩토링 완료

## 변경 사항

### 1. 폴더명 수정 (철자/명명 규칙)
- ❌ `componets` → ✅ `components` (철자 수정)
- ❌ `utill` → ✅ `utils` (철자 수정)
- ❌ `page` → ✅ `pages` (복수형)
- ❌ `Route` → ✅ `routes` (소문자, 복수형)
- ❌ `stores` → ✅ `store` (단수형)

### 2. 파일명 수정
- ❌ `button.jsx` → ✅ `Button.jsx` (컴포넌트는 대문자 시작)
- ❌ `UseDidMountEffect.jsx` → ✅ `useDidMountEffect.js` (훅은 소문자 시작, .js)
- ❌ `FormUtill.jsx` → ✅ `formUtils.js` (유틸은 소문자, .js)
- API 파일들: `.jsx` → `.js` (api.js, auth.js, product.js, brand.js)

### 3. 구조 개선
- `components/common/` 폴더 생성
- `components/admin/button/` → `components/common/Button/` 이동
- `components/modal/` → `components/common/Modal/` 이동

### 4. Import 경로 수정
- 모든 파일의 import 문이 새로운 경로로 업데이트됨

## 최종 폴더 구조

```
src/
├── api/                    # API 통신 (*.js)
│   ├── api.js
│   ├── auth.js
│   ├── brand.js
│   └── product.js
├── components/             # 재사용 컴포넌트
│   ├── admin/             # 관리자 전용
│   │   ├── brand/
│   │   ├── product/
│   │   └── searchbar/
│   ├── common/            # 공통 컴포넌트
│   │   ├── Button/
│   │   └── Modal/
│   ├── main/              # 메인 페이지용
│   └── user/              # 사용자 전용
│       └── header/
├── hooks/                 # 커스텀 훅 (*.js)
│   └── useDidMountEffect.js
├── pages/                 # 페이지 컴포넌트
│   ├── admin/
│   │   ├── brandManagement/
│   │   ├── orderManagement/
│   │   ├── productManagement/
│   │   ├── saleManagement/
│   │   └── AdminMainPage.jsx
│   ├── auth/
│   │   ├── AuthPage.jsx
│   │   ├── LoginForm.jsx
│   │   └── JoinForm.jsx
│   └── user/
│       └── userMain/
├── routes/                # 라우팅
│   ├── PrivateMasterRoute.jsx
│   ├── PrivatePublicRoute.jsx
│   └── PrivateVendorRoute.jsx
├── store/                 # 상태 관리
│   ├── context/
│   │   ├── ModalProvider.jsx
│   │   └── UserContext.jsx
│   └── redux/
│       └── redux.jsx
├── styles/                # CSS 파일
│   ├── admin/
│   ├── auth/
│   └── user/
├── utils/                 # 유틸리티 (*.js)
│   └── formUtils.js
├── App.js
├── App.css
└── index.js
```

## React 모범 사례 적용

✅ **명명 규칙**
- 컴포넌트: PascalCase (Button.jsx)
- 훅: camelCase + use 접두사 (useDidMountEffect.js)
- 유틸리티: camelCase (formUtils.js)
- 폴더: camelCase 또는 kebab-case (소문자)

✅ **파일 확장자**
- React 컴포넌트: .jsx
- 일반 JavaScript: .js
- API/Utils: .js

✅ **폴더 구조**
- pages/: 라우트별 페이지 컴포넌트
- components/: 재사용 가능한 컴포넌트
- components/common/: 프로젝트 전체에서 공통으로 사용
- hooks/: 커스텀 훅
- utils/: 유틸리티 함수
- api/: API 통신 로직
- routes/: 라우팅 관련
- store/: 상태 관리

## 빌드 확인

✅ 빌드 성공
- 경고는 있지만 치명적 오류 없음
- 모든 import 경로가 정상 작동

## 추가 권장 사항

1. **절대 경로 설정** (선택사항)
   - jsconfig.json 또는 tsconfig.json에 path alias 설정
   - `@/components`, `@/pages` 등으로 깔끔한 import 가능

2. **컴포넌트별 스타일 관리** (선택사항)
   - 현재는 styles 폴더에 분리되어 있음
   - CSS Modules 또는 styled-components 사용 권장
   - 각 컴포넌트 폴더 내에 스타일 파일 배치

3. **index.js 배럴 파일** (선택사항)
   - 각 폴더에 index.js 생성하여 export 관리
   - 예: `import { Button } from '@/components/common'`
