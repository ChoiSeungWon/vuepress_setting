# NGINX 무중단 배포

무중단 배포 방식에는 몇 가지가 있습니다.

- AWS에서 블루 그린(Blue-Green) 무중단 배포
- 도커를 이용한 웹서비스 무중단 배포

우리가 진행할 방법은 엔진엑스(Nginx)를 이용한 무중단 배포 입니다.

## Nginx의 개요

<img src="../../images/spring/chater10/nginx1.png" width="50%" height="100%" title="Nginx" alt="Nginx"></img><br/>     

엔진엑스는 lgor Sysoev라는 러시아 개발자 **동시접속 처리에 특화된** 웹 서버 프로그램이다. **Apache**보다 동작이 단순하고, 전달자 역할만 하기 때문에 동시 접속 처리에 특화되어 있다.

### 1. Nginx(웹서버)의 역할

1. 정적 파일을 처리하는 HTTP 서버로서의 역할
    - 웹서버의 역할 HTML, CSS, Javascript, 이미지와 같은 정보를 웹 브라우저에 전송하는 역할(HTTP 프로토콜을 준수)
2. 응용프로그램 서버에 요청을 보내는 리버스 프록시로서의 역할
    - 클라이언트는 서버에 요청하면, 프록시 서버가 배후 서버(reverse sever)로부터 데이터를 가져오는 역할
    - 프록시 서버가 **Nginx**, 리버스 서버가 **응용프로그램 서버**     
    - 여러대의 응용프로그램 서버에 **배분** 하는 역할을 한다.
3. 비동기 Event-Drive 기반 구조

## 엔진엑스 무중단 배포 구성

엔진엑스 1대와 **스프링 부트 Jar**를 2대 사용
- 엔진엑스는 80(http), 443(https) 포트를 할당
- 스프링 부트1은 8081포트 실행
- 스프링 부트2은 8082포트 실행

> ```무중단 배포 전체 구조```
>
> <img src="../../images/spring/chater10/nginx2.png" width="90%" height="100%" title="Nginx" alt="Nginx"></img><br/>     

### 1. 엔진엑스 설치와 스프링 부트 연동

> ```EC2 엔진엑스 설치```
> ```
> sudo yum install nginx
> ```
> ```엔진엑스 실행```
> ```
> sudo service nginx start
> ```

#### 보안 그룹 추가
엔진엑스의 포트번호는 기본적으로 80입니다. EC2 인바운드 보안그룹 추가 설정을 합니다.

<img src="../../images/spring/chater10/nginx3.png" width="90%" height="100%" title="Nginx" alt="Nginx"></img><br/>    


> ```80번 포트로 접속```
> <img src="../../images/spring/chater10/nginx4.png" width="90%" height="100%" title="Nginx" alt="Nginx"></img><br/>    


#### 엔진엑스와 스프링 부트 연동
엔진엑스가 현재 실행 중인 스프링 부트 프로젝트를 바라 볼 수 있도록 프록시 설정을 하겠스빈다.

>```엔진엑스 설정 파일```
> ```
> sudo vim /etc/nginx/nginx.conf
> ```
>```엔진엑스 설정 추가```
> 
> <img src="../../images/spring/chater10/nginx5.png" width="90%" height="100%" title="Nginx" alt="Nginx"></img><br/>   
> ```
> proxy_pass http://localhost:8080;
> proxy_set_header X-Real-IP $remote_addr;
> proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
> proxy_set_header Host $http_host;
> ```
#### 코드 설명
1. **proxy_pass**
    - 엔진엑스로 요청이 오면 http://localhost:8080로 전달
2. **proxy_set_header XXX**    
    - 실제 요청 데이터를 header의 각 항목에 할당합니다.
    - proxy_set_header X-Real-IP $remote_addr 요청자의 ip를 저장합니다.

> ```엔진엑스 재시작```
> ```
> sudo service nginx restart
> ```
> ```스프링 부트 연동완료```
> 
> <img src="../../images/spring/chater10/nginx6.png" width="90%" height="100%" title="Nginx" alt="Nginx"></img><br/>  

### 2. 무중단 배포 스크립트 만들기
무중단 배포 스크립트 작업 전 API를 하나 추가하겠습니다. 이 API는 이후 배포 시에 8081을 쓸지, 8082를 쓸지 판단하는 기준이 됩니다.

> ```profile API 추가```
> ``` JAVA
>package com.swchoi.webservice.springboot.web;
>
>import lombok.RequiredArgsConstructor;
>import org.springframework.core.env.Environment;
>import org.springframework.web.bind.annotation.GetMapping;
>import org.springframework.web.bind.annotation.RestController;
>
>import java.util.Arrays;
>import java.util.List;
>
>@RequiredArgsConstructor
>@RestController
>public class ProfileController {
>    private final Environment env;
>
>    @GetMapping("/profile")
>    public String profile() {
>        List<String> profiles = Arrays.asList(env.getActiveProfiles());
>        List<String> realProfiles = Arrays.asList("real", "real1", "real2");
>
>        String defaultProfile = profiles.isEmpty() ? "default" : profiles.get(0);
>
>        return profiles.stream()
>                .filter(realProfiles::contains)
>                .findAny()
>                .orElse(defaultProfile);
>    }
>}
> ```
#### 코드설명
1. **env.getActiveProfiles()**
    - 현재 실행 중인 ActiveProfile을 모두 가져옵니다.
    - 즉, real, oauth,real-db등이 활성화되어 있다면(active) 3개가 모두 담겨 있습니다.

> ```ProfileControllerTest 코드 작성```
> ```java
>package com.swchoi.webservice.springboot.web;
>
>import org.junit.Test;
>import org.springframework.mock.env.MockEnvironment;
>
>import static org.assertj.core.api.Assertions.assertThat;
>
>public class ProfileControllerTest {
>
>    @Test
>    public void real_profile이_조회된다() {
>        //given
>        String expectedProfile = "real";
>        MockEnvironment env = new MockEnvironment();
>        env.addActiveProfile(expectedProfile);
>        env.addActiveProfile("oauth");
>        env.addActiveProfile("real-db");
>
>        ProfileController controller = new ProfileController(env);
>
>        //when
>        String profile = controller.profile();
>
>        //then
>        assertThat(profile).isEqualTo(expectedProfile);
>    }
>
>    @Test
>    public void real_profile이_없으면_첫번째가_조회된다() {
>        //given
>        String expectedProfile = "oauth";
>        MockEnvironment env = new MockEnvironment();
>
>        env.addActiveProfile(expectedProfile);
>        env.addActiveProfile("real-db");
>
>        ProfileController controller = new ProfileController(env);
>
>        //when
>        String profile = controller.profile();
>
>        //then
>        assertThat(profile).isEqualTo(expectedProfile);
>    }
>
>    @Test
>    public void active_profile이_없으면_default가_조회된다() {
>        //given
>        String expectedProfile = "default";
>        MockEnvironment env = new MockEnvironment();
>        ProfileController controller = new ProfileController(env);
>
>        //when
>        String profile = controller.profile();
>
>        //then
>        assertThat(profile).isEqualTo(expectedProfile);
>    }
>
>}
> ```
> **SecurityConfig 클래스 추가**
> ```
> .antMatchers("/", "/css/**", "/images/**",
>                            "/js/**", "/h2-console/**", "/profile").permitAll()
> ```
> **SecurityConfig 변경 확인 테스트 추가**
> ``` java
>package com.swchoi.webservice.springboot.web;
>
>import org.junit.Test;
>import org.junit.runner.RunWith;
>import org.springframework.beans.factory.annotation.Autowired;
>import org.springframework.boot.test.context.SpringBootTest;
>import org.springframework.boot.test.web.client.TestRestTemplate;
>import org.springframework.boot.web.server.LocalServerPort;
>import org.springframework.http.HttpStatus;
>import org.springframework.http.ResponseEntity;
>import org.springframework.mock.env.MockEnvironment;
>import org.springframework.test.context.junit4.SpringRunner;
>
>import static org.assertj.core.api.Assertions.assertThat;
>import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
>
>@RunWith(SpringRunner.class)
>@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
>public class ProfileControllerTest {
>
>    @LocalServerPort
>    private int port;
>
>    @Autowired
>    private TestRestTemplate restTemplate;
>
>    @Test
>    public void profile은_인증없이_호출된다() throws Exception{
>        String expected = "default";
>
>        ResponseEntity<String> response = restTemplate.getForEntity("/profile", String.class);
>
>        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
>        assertThat(response.getBody()).isEqualTo(expected);
>    }
> ```
>
> ```git push 배포 확인```
> 
> <img src="../../images/spring/chater10/nginx7.png" width="90%" height="100%" title="Nginx" alt="Nginx"></img><br/>  
