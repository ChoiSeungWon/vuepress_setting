# Spring Boot 테스트 코드 작성

## 1. TTD란?
```"테스트 주도 개발: 테스트가 개발을 이끌어 나간다."```라고 정의할 수 있다.

메소드 나 함수 같은 프로그램 모듈을 작성할 때

‘작성 종료조건을 먼저 정해놓고 코딩을 시작 한다’는 의미로 받아들이면 편하다.

<img src="../../images/spring/chater02/test1.png" width="450px" height="450px" title="TDD" alt="TDD"></img><br/>

- ```RED``` : 항상 실패하는 테스트를 먼저 작성
- ```GREEN``` : 테스트에 통과하는 프로덕션 코드 작성
- ```REFACTOR``` : 테스트가 통과하면 프로덕션 코드를 리팩토링

위의 레드 그린 사이클 처럼 우선 테스트를 작성하고 그걸 통과하는 코드를 만들고 해당 과정을 반복하면서 

제대로 동작하는지에 대한 피드백을 적극적으로 받는 것이다.

### TDD를 왜 사용하는가?

- 개발 단계 초기에 문제를 발견하게 해준다.
- 추후에 코드를 리팩토링하거나 라이브러리 업그레이드 등에서 기존기능이 올바르게 작동하는지 확인할 수 있다.
- 기능에 대한 불확실성을 감소시켜준다.
- 시스템에 대한 실제 문서를 제공한다. 즉, 단위 테스트 자체가 문서로 사용할 수 있다.


## 2. Controller 테스트 코드 작성하기


### Application Class 작성
```java
package com.swchoi.webservice.springboot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```
Application 클래스는 앞으로 만들 프로젝트의 **메인 클래스**가 됩니다.
- **@SpringBootApplication**으로 인해 스프링 부트의 자동설정, 스프링 Bean 일기기와 생성을 모두 자동으로 설정된다.
- **@SpringBootApplication이 있는 위치부터 설정을 읽어**가기 때문에 이 클래스는 항상 **프로젝트의 최상단에 위치**해야 한다.
- main 메소드에서 실행하는 **SpringApplication.run**으로 인해 내장 WAS(Web Application Server, 웹 어플리케이션 서버)를 실행한다.
- 내장 WAS란 별도로 외부에 WAS를 두지 않고 애플리케이션을 실행할 때 내부에서 WAS를 실행하는 것을 이야기한다. 이렇게 되면 항상 서버에 톰캣(Tomcat)을 설치할 필요가 없게 되고, 스프링 부트로 만들어진 Jar 파일(실행 가능한 Java 패키징 파일)로 실행하면 된다.


### HelloController Class 작성
```java
package com.swchoi.webservice.springboot.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello(){
        return "hello";
    }
}
```

> 코드설명
> 1. @RestController
>    * 컨트롤러를 JSON을 반환하는 컨트롤러로 만들어 줍니다.
>    * 예전에는 @ResponseBody를 각 메소드마다 선언했던 것을 한번에 사용할 수 있게 해준다.
> 2. @GetMapping
>    * HTTP Method인 Get인 요청을 받을 수 있는 API를 만들어 준다.
>    * 예전에는 @RequestMapping(method = RequestMethod.GET)으로 사용되었습니다.

### HelloControllerTest Class 작성
```java
package com.swchoi.webservice.springboot.web;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@WebMvcTest(controllers = HelloController.class)
public class HelloControllerTest {

    @Autowired
    private MockMvc mvc;

    @Test
    public void hello가_리턴된다() throws  Exception {
        String hello = "hello";

        mvc.perform(get("/hello"))
                .andExpect(status().isOk())
                .andExpect(content().string(hello));
    }
}
```

> 코드설명
> 1. @RunWith(SpringRunner.class)
>      * 테스트를 진행할 때 JUint에 내장된 실행자 외에 다른 실행자를 실행시킵니다.
>      * 여기서는 SpringRunner라는 스프링 실행자를 사용합니다.
>      * 즉, 스프링 부트 테스트와 JUnit 사이에 연갈자 역할을 합니다.
> 2. @WebMvcTest      
>    * 여러 스프링 테스트 어노테이션 중, Web(Spring MVC)에 집중할 수 있는 어노테이션입니다.
>    * 선언할 경우 @Controller, @ControllerAdvice 등을 사용할 수 있습니다.
>    * 단, @Service, @Component, @Repository 등은 사용할 수 없다.
>    * 여기서는 컨트롤러만 사용한다.
> 3. @Autowired
>    * 스프링이 관리하는 빈(Bean)을 주입 받는다.
> 4. private MockMvc mvc
>    * 웹 API를 테스트할 때 사용
>    * 스프링 MVC 테스트의 시작점
>    * 이 클래스를 통해 HTTP GET,POST 등에 대한 API 테스트를 할 수 있다.
> 5. mvc.perform(get("/hello"))
>    * MockMvc를 통해 /hello 주소로 HTTP GET 요청을 한다.
>    * 체이닝이 지원되어 아래와 같이 여러 검증 기능을 이어서 선언할 수 있다.
> 6. .andExpect(status().isOk())
>    * mvc.perform의 결과를 검증한다.
>    * HTTP Header의 Status를 검증합니다.
>    * 우리가 흔히 알고 있는 200,404,500 등의 상태를 검증한다.
> 7. .andExpect(content().string(hello))    
>    * mvc.perform의 결과를 검증한다.
>    * 응답 본문의 내용을 검증한다.


## 3. Lombok 소개 및 설치하기

 **자바 개발자들의 필수 라이브러리 롬북(Lombok)** 입니다.
 > build.gradle 파일에 추가 한다.
 > ``` 
 > compile('org.projectlombok:lombok')
 > ```
> ![lombok](../../images/spring/chater02/test2.png)

 > 인텔리j lombok 플러그인 추가
 >
 > ![lombok 플러그인](../../images/spring/chater02/test3.png)

 > 롬북 설정 (Enalbe annotation processing 체크)
 >
 > ![lombok 설정](../../images/spring/chater02/test4.png)


## 4. DTO 롬북 테스트 코드 작성하기
### HelloResponseDto 클래스 생성
>```JAVA
>package com.swchoi.webservice.springboot.web.dto;
>import lombok.Getter;
>import lombok.RequiredArgsConstructor;
>
>@Getter
>@RequiredArgsConstructor
>public class HelloResponseDto {
>
>    private final String name;
>    private final int amount;
>}
>
>```
#### 코드설명
1. **@Getter**
    * 선언된 모든 필드의 get 메소드를 생성해 줍니다.
2. **@RequiredArgsConstructor**
    * 선언된 모든 final 필드가 포함된 생성자를 생성해 줍니다.
    * final이 없는 필드는 생성자에 포함되지 않습니다.

### HelloResponseDtoTest 클래스 생성
>```JAVA
>package com.swchoi.webservice.springboot.web.dto;
>
>import org.junit.Test;
>import static org.assertj.core.api.Assertions.assertThat;
>public class HelloResponseDtoTest {
>
>    @Test
>    public void 롬북_기능_테스트() {
>        //given
>        String name = "test";
>        int amount = 1000;
>
>        //when
>        HelloResponseDto dto = new HelloResponseDto(name,amount);
>
>        //then
>        assertThat(dto.getName()).isEqualTo(name);
>        assertThat(dto.getAmount()).isEqualTo(amount);
>    }
>}
>
>```
#### 코드설명
1. **assertThat**
    * assertj라는 테스트 검증 라이브러리의 검증 메소드입니다.
2. **isEqualTo**
    * 검증하고 싶은 대상을 메소드 인자로 받는다.
    * 메소드 체이닝이 지원되어 isEqualTo와 같이 메소드를 이어서 사용할 수 있다.


### HelloController 메소드 추가
```java
    @GetMapping("/hello/dto")
    public HelloResponseDto helloDto(@RequestParam("name") String name,
                                     @RequestParam("amount") int amount) {
        return new HelloResponseDto(name, amount);
    }
```
#### 코드설명
1. **@RequestParam**
    * 외부에서 API로 넘긴 파라미터를 가져오는 어노테이션


### HelloControllerTest 메소드 추가
```java
    @Test
    public void helloDto가_리턴된다() throws  Exception {
        String name = "hello";
        int amount = 1000;

        mvc.perform(
                    get("/hello/dto")
                            .param("name", name)
                            .param("amount", String.valueOf(amount)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is(name)))
                .andExpect(jsonPath("$.amount", is(amount)));
    }
```
#### 코드설명
1. **param**
    * API 테스트할 때 사용될 요청 파라미터를 설정
    * 단, 값은 String만 허용됩니다.
    * 숫자/날짜 등의 데이터도 작성할 때는 문자열로 변경해야한 가능
2. **jsonPath**
    * JSON 응답값을 필드별로 검증할 수 있는 메소드입니다.
    * $를 기준으로 필드명을 명시합니다.
