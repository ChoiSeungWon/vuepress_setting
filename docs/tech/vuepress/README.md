### github vuepress 블로그 만들기

#### vuepress

 정적 사이트 generator, 기술 문서를 편리하게 작성할 수 있다.

---

- 기본 테마 제공
- pre-render
- vue, vue-router, webpack 으로 구현
  
- [vuepress 사이트](https://vuepress.vuejs.org)

- [셋팅 리포짓토리](https://github.com/mmmoikim/vuepress-setting)

---

## 셋팅

1. vuepress 설치

``` bash
npm install -D vuepress
```

2. 디렉토리 셋팅

``` bash
├─ docs
│  ├─ README.md
│  └─ .vuepress
│     └─ config.js
└─ package.json
```

3. package.json 런 스트립트 추가

``` javascript
{
  "scripts": {
    "docs:dev": "vuepress dev docs",
    "docs:build": "vuepress build docs"
  }
}
```

4. config.js 셋팅

``` javascript
module.exports = {
    title: 'Hello VuePress',
    description: 'Just playing around',
    base: '/<리파지토리 이름>/'
}
```

5. gh-pages 빈 브랜치 만들기
  
``` bash
git checkout --orphan gh-pages
git rm -rf .
git add index.html
git commit -m "First commit"
$git push origin gh-pages
```

6. github setting tab에서 github pages - Source - gh-pages branch 설정
7. deploy.sh 만들기


``` bash
#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run docs:build

# navigate into the build output directory
cd docs/.vuepress/dist

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# if you are deploying to https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

git push -f https://github.com/mmmoikim/vuepress-setting.git master:gh-pages

cd -
  ```

#### docs:dev 빌드시 TypeError: res.getHeader is not a function 에러

- npm install webpack-dev-middleware@3.6.0 설치

---

## plugin

- [플러그인 리스트](https://v1.vuepress.vuejs.org/plugin/official/plugin-active-header-links.html)

```js
    plugins: [
        ['@vuepress/last-updated'],//git에 마지막 커밋
        ['@vuepress/back-to-top', true],//위로 올라가기
        '@vuepress/pagination',//다음글, 이전글
        ['@vuepress/search', {//검색창
            searchMaxSuggestions: 10
        }],
        ['@vuepress/active-header-links', {//헤더 바로가기
            sidebarLinkSelector: '.sidebar-link',
            headerAnchorSelector: '.header-anchor',
            headerTopOffset: 120
        }]
    ]
```

## theme

- `node_module - vuepress - lib - default-theme`을 `.vuepress - theme` 에 복사해 놓고 스타일 찾으며 수정
- `<Content>`가 페이지 내용 컴포넌트
- `config.js`에 themeConfig로 설정해 놓은 값들은 `$site`전역변수에 들어 있음
- [테마 갤러리](https://vuepress.gallery/)
- [awesome-vuepress](https://github.com/meteorlxy/awesome-vuepress)

## 뱃지

---
<Badge text="warn" type="warn"/>
<Badge text="tip" vertical="middle"/>
<Badge text="error" type="error"/>

```md
<Badge text="warn" type="warn"/>
<Badge text="tip" vertical="middle"/>
<Badge text="error" type="error"/>
```