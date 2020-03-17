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