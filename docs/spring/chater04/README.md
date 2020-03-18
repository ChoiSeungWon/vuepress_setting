# Mustache로 화면 구성하기

## 1.mustache
- Logic-less template Engine
- 다양한 언어들을 지원 (Ruby, JavaScript, Python, Erlang, node.js, PHP, Perl, Objective-C, Java, .NET, Android, C++, Go, 
Lua, ooc, ActionScript, ColdFusion, Scala, Clojure, Fantom, CoffeeScript, D, Haskell, XQuery, ASP, Io, Dart, Haxe, and for Delphi)
- 수많은 언어를 지원한느 가장 심플한 템플릿 엔진

### Template Engine?
- 템플릿 엔진은 "프로그램 로직" <-> "프리젠테이션" 계층을 분리하기 위한 수단
- 예를 들어 Controller -> View로 데이터를 던지면 어떻게 계층을 분리하여 쉽게 표현할지를 도와주는 "도구"
- 프리젠테이션 계층에서 로직을 쉽게 표현하고 개발의 유연성을 향상 시킴 & 유지보수 효율 향상 

자바 진영에서는 JSP, Velocity, Freemarker, Thymeleaf 등 다양한 서버 템플릿 엔진이 존재

#### 다른 템플릿 엔진의 단점
- **JSP,Velocatity**: 스프링 부트에서는 권장하지 않는 템플릿 엔진입니다.
- **Freemarker** : 템플릿 엔진으로는 너무 과하게 많은 기능으 지원한다. 
- **Thymeleaf** : 스프링 진영에서 적극적으로 밀고 있지만 문법이 어렵다.


#### 머스테치의 장점
- 문법이 다른 템플릿 엔진보다 심플하다.
- 로직 코드를 사용할 수 없어 View의 역할과 서버의 역할을 명확하게 분리된다.

#### 머스테치 플러그인 설치
![mustache](../../images/spring/chater04/mustache1.png)

## 2. 기본 페이지 만들기
가장 먼저 스프링 부트 프로젝트에서 머스테치를 사용할 수 있도록 의존성을 build.gradle에 등록한다.
> ```
> compile('org.springframework.boot:spring-boot-starter-mustache')
> ```

보는 것처럼 머스테치는 **스프링 부투에서 공식 지원하는 템플릿 엔진**입니다.

- 머스테치의 파일 위치는 기본적으로 **src/main/resources/templates** 입니다.
> ![templates](../../images/spring/chater04/mustache2.png)
> 
> **index.mustache**
> ```html
><!DOCTYPE HTML>
><html>
><head>
>    <title>스프링 부트 웹서비스</title>
>    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
>
></head>
><body>
>    <h1>스프링 부트로 시작하는 웹 서비스</h1>
></body>
></html>
> ``` 
> **IndexController**
> ```java
>package com.swchoi.webservice.springboot.web;
>
>import org.springframework.stereotype.Controller;
>import org.springframework.web.bind.annotation.GetMapping;
>
>@Controller
>public class IndexController {
>
>    @GetMapping("/")
>    public String index() {
>        return "index";
>    }
>}
> ```

머스테치 스타터 덕분에 컨트롤러에서 문자열을 반환할 때 **앞의 경로와 뒤의 파일 확장자는 자동으로 지정** 됩니다.

> **IndexControllerTest**
> ```java
>package com.swchoi.webservice.springboot.web;
>
>import org.junit.Test;
>import org.junit.runner.RunWith;
>import org.springframework.beans.factory.annotation.Autowired;
>import org.springframework.boot.test.context.SpringBootTest;
>import org.springframework.boot.test.web.client.TestRestTemplate;
>import org.springframework.test.context.junit4.SpringRunner;
>
>import static org.assertj.core.api.Assertions.assertThat;
>import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;
>
>@RunWith(SpringRunner.class)
>@SpringBootTest(webEnvironment = RANDOM_PORT)
>public class IndexControllerTest {
>
>    @Autowired
>    private TestRestTemplate restTemplate;
>
>    @Test
>    public void 메인페이지_로딩() {
>        //when
>        String body = this.restTemplate.getForObject("/", String.class);
>
>        //then
>        assertThat(body).contains("스프링 부트로 시작하는 웹 서비스");
>    }
>}
> ```
> **테스트 결과**
>
> ![tset](../../images/spring/chater04/mustache3.png)
> 
> **브러우저 확인**
>
> ![tset](../../images/spring/chater04/mustache4.png)

## 3. 게시글 등록 화면 만들기

#### 공통 레이아웃 작성

src/main/resources/tmeplates 디렉토리에 layout 디렉토리를 추가로 생성합니다.
그리고 footer.mustache, header.mustache 파일을 생성합니다.

![layout](../../images/spring/chater04/mustache5.png)

> **header.mustache**
> ```html
><!DOCTYPE HTML>
><html>
><head>
>    <title>스프링 부트 웹서비스</title>
>    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
>    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
></head>
><body>
> ```
> **footer.mustache**
> ```html
><script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
><script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
></body>
></html>
> ```
> 부트스트랩, 제이쿼리 라이브러리 사용

```
    1. {{>layout/hader}}
        - {{>}}는 현재 머스테치 파일을 기준으로 다른 파일을 가져옵니다.
```

#### 게시글 등록 화면

> **index.mustache** 메인 페이지 수정
> ```html
>{{>layout/header}}
>    <h1>스프링 부트로 시작하는 웹 서비스</h1>
>    <div class="col-md-12">
>        <div class="row">
>            <div class="col-md-6">
>                <a href="/posts/save" role="button" class="btn btn-primary">글 등록</a>
>            </div>
>        </div>
>    </div>
>{{>layout/footer}}
> ```
>
> **IndexController** 게시글 등록 화면 이동 컨트롤러 작성
> ```java
>@Controller
>public class IndexController {
>	...
>
>    @GetMapping("/posts/save")
>    public String postsSave() {
>        return "posts-save";
>    }
>}
> ```
> **posts-save.mustache** 게시글 등록 화면 생성
> ```html
>{{>layout/header}}
>
><h1>게시글 등록</h1>
>
><div class="col-md-12">
>    <div class="col-md-4">
>        <form>
>            <div class="form-group">
>                <label for="title">제목</label>
>                <input type="text" class="form-control" id="title" placeholder="제목을 입력하세요">
>            </div>
>            <div class="form-group">
>                <label for="author">작성자</label>
>                <input type="text" class="form-control" id="author" placeholder="작성자를 입력하세요">
>            </div>
>            <div class="form-group">
>                <label for="content">내용</label>
>                <textarea class="form-control" id="content" placeholder="내용을 입력하세요"></textarea>
>            </div>
>        </form>
>        <a href="/" role="button" class="btn btn-secondary">글 취소</a>
>        <button type="button" class="btn btn-primary" id="btn-save">등록</button>
>    </div>
></div>
>{{>layout/footer}}
> ```
> **글 등록 화면**
>
> <img src="../../images/spring/chater04/mustache6.png" width="50%" height="70%" title="posts-save" alt="posts-save"></img><br/>

#### index.js 생성

![index.js](../../images/spring/chater04/mustache7.png)

> **index.js**
> ```javascript
>var main = {
>    init : function () {
>        var _this = this;
>        $('#btn-save').on('click', function () {
>            _this.save();
>        })
>    },
>    save : function () {
>        var data = {
>            title : $("#title").val(),
>            author : $("#author").val(),
>            content : $("#content").val()
>        };
>
>        $.ajax({
>            type : 'POST',
>            url : '/api/v1/posts',
>            dataType : 'json',
>            contentType : 'application/json; charset=utf-8',
>            data : JSON.stringify(data)
>        }).done(function () {
>            alert('글이 등록되었습니다.');
>            window.location.href = '/';
>        }).fail(function (error) {
>            alert(JSON.stringify(error));
>        })
>    }
>};
>
>main.init();
> ```

#### 게시글 등록 확인

> **등록 성공 alert**
>
> <img src="../../images/spring/chater04/mustache8.png" width="100%" height="70%" title="posts-save" alt="posts-save"></img><br/>
> **등록 데이터베이스 확인**
>
> <img src="../../images/spring/chater04/mustache9.png" width="100%" height="70%" title="posts-save" alt="posts-save"></img><br/>


## 4. 전체 조회 화면 만들기