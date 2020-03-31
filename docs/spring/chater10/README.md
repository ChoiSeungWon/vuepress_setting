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

### 3. real1, real2 profile 생성

> ```application-real1.properties```
> ```
>server.port=8081
>spring.profiles.include=oauth,real-db
>spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL5InnoDBDialect
>spring.session.store-type=jdbc
> ```
> ```application-real2.properties```
> ```
>server.port=8082
>spring.profiles.include=oauth,real-db
>spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL5InnoDBDialect
>spring.session.store-type=jdbc
> ```

### 4. 엔진엑스 설정 수정
무중단 배포의 핵심은 **엔진엑스 설정**입니다. 배포 때마다 엔진엑스의 프록시 설정(스프링 부트로 요청을 흘려 보내는)이 순식간에 교체됩니다.

엔진엑스 설정이 모여있는 /etc/nginx/conf.d/ 에 service-url.inc라는 파일을 생성합니다.

>```service-url.inc```
>```
>sudo vim /etc/nginx/conf.d/service-url.inc
>```
>``` 코드입력 ```
>```
> set $service_url http://127.0.0.1:8080; 
>```
>```nginx.conf```
>```
> sudo vim /etc/nginx/nginx.conf
>```
>```service_url 추가```
> 
> <img src="../../images/spring/chater10/nginx8.png" width="90%" height="100%" title="Nginx" alt="Nginx"></img><br/>  
>```nginx 재기동```
>```
> sudo service nginx restart
>```

### 5. 배포 스크립트 작성

> ```디렉토리 생성```
> ```
> mkdir ~/app/step3 && mkdir ~/app/step3/zip
> ```
> ```appspec.yml 수정```
> ```
> version: 0.0
>os: linux
>files:
>  - source:  /
>    destination: /home/ec2-user/app/step3/zip/
>    overwrite: yes
> ```

무중단 배포를 진행할 스크립트들은 총 5개입니다.

- stop.sh : 기존 엔진엑스에 연결되어 있진 않지만, 실행 중이던 스프링 부트 종료
- start.sh : 배포할 신규 버전 스프링 부트 프로젝트를 stop.sh로 종료한 'profile'로 실행
- health.sh : 'start.sh'로 실행시간 프로젝트가 정상적으로 실행됐는지 체크
- switch.sh : 엔진엑스가 바라보는 스프링 부트를 최신 버전으로 변경
- profile.sh : 앞선 4개 스크립트 파일에서 공용으로 사용할 'profile'과 포트 체크 로직

> ```appspec.yml 수정```
> ```
>hooks:
>  AfterInstall:
>    - location: stop.sh #엔진엑스와 연결되어 있지 않은 스프링 부트를 종료합니다.
>      timeout: 60
>      runas: ec2-user
>  ApplicationStart:
>    - location: start.sh # 엔진엑스와 연결되어 있지 않은 Port로 새 버전의 스프링 부트를 시작합니다.
>      timeout: 60
>      runas: ec2-user
>  ValidateService:
>    - location: health.sh # 새 스프링 부트가 정상적으로 실행됐는지 확인합니다.
>      timeout: 60
>      runas: ec2-user
> ```
- Jar 파일이 복사된 이후부터 차례로 앞선 스크립트들이 실행된다고 보면 된다.

> ```profile.sh```
> ```
>#!/usr/bin/env bash
>
># 쉬고 있는 profile 찾기: real1이 사용 중이라면 real2가 쉬고 있고, 반대면 real1이 쉬고있음
>
>function find_idle_profile(){
>  RESPONSE_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/profile)
>
>  if [ ${RESPONSE_CODE} -ge 400 ] # 400 보다 크면(즉, 40x/50x 에러 모두 포함)
>  then
>      CUREENT_PROFILE=real2
>  else
>      CUREENT_PROFILE=$(curl -s http://localhost/profile)
>  fi
>
>  if [ $(CUREENT_PROFILE) == real1 ]
>  then
>      IDLE_PROFILE=real2
>  else
>      IDLE_PROFILE=real1
>  fi
>
>  echo "${IDLE_PROFILE}"
>}
>
># 쉬고 있는 profile의 port 찾기
>function find_idel_port() {
>    IDLE_PROFILE=$(find_idle_profile)
>
>    if [ ${IDLE_PROFILE} == real1 ]
>    then
>        echo "8081"
>    else
>        echo "8082"
>    fi
>}
> ```

#### 코드 설명
1. **$(curl -s -o /dev/null -w "%{http_code}" http://localhost/profile)**
    - 현재 엔진엑스가 바라보고 있는 스프링 부트가 정상적으로 수행 중인지 확인
    - 응답값을 HttpStatus로 받습니다.
    - 정상이면 200, 오류가 발생한다면 400~503 사이로 발생하니 400 이상은 모두 예외로 보고 real2를 현재 profile로 사용
2. **IDLE_PROFILE**
    - 엔진엑스와 연결되지 않은 profile
    - 스프링 부트 프로젝트를 이 profile로 연결하기 위해 반환
3. **echo "${IDLE_PROFILE}"**
    - bash라는 스크립트는 **값을 반환하는 기능이 없습니다.**
    - 그래서 제일 마지막 줄에 echo로 결과를 출력 후, 클라이언트에서 그값을 잡아서 $(find_idle_profile) 사용합니다.
    - 중간에 echo를 사용해선 안됩니다.

> ```stop.sh```
> ```
>#!/usr/bin/env bash
>
>ABSPATH=$(readlink -f $0)
>ABSDIR=$(dirname $ABSPATH)
>source ${ABSDIR}/profile.sh
>
>IDLE_PORT=$(find_idle_port)
>
>echo "> $IDLE_PORT 에서 구동 중인 애플리케이션 pid 확인"
>IDLE_PID=$(lsof -ti tcp:${IDLE_PORT})
>
>if [ -z ${IDLE_PID} ]
>then
>  echo "> 현재 구동 중인 애플리케이션이 없으므로 종료하지 않습니다."
>else
>  echo "> kill -15 $IDLE_PID"
>  kill -15 ${IDLE_PID}
>  sleep 5
>fi
> ```

#### 코드설명
1. **ABSDIR=$(dirname $ABSPATH)**
    - 현재 stop.sh가 속해 있는 경로 찾기
2. **source ${ABSDIR}/profile.sh**
    - 자바로 보면 일종의 import 구문
    - 해당 코드로 인해 stop.sh에서도 profile.sh의 여러 function을 사용할 수 있게 됩니다.

> ```start.sh```
> ```
>#!/usr/bin/env bash
>
>ABSPATH=$(readlink -f $0)
>ABSDIR=$(dirname $ABSPATH)
>source ${ABSDIR}/profile.sh
>
>REPOSITORY=/home/ec2-user/app/step3
>PROJECT_NAME=springboot-webservice
>
>echo "> Build 파일 복사"
>echo "> cp $REPOSITORY/zip/*.jar $REPOSITORY/"
>
>cp $REPOSITORY/zip/*.jar $REPOSITORY/
>
>echo "> 새 애플리케이션 배포"
>JAR_NAME=$(ls -tr $REPOSITORY/*.jar | tail -n 1)
>
>echo "> JAR Name : $JAR_NAME"
>
>echo "> $JAR_NAME 에 실행권한 추가"
>
>chmod +x $JAR_NAME
>
>echo "> $JAR_NAME 실행"
>
>IDLE_PROFILE=$(find_idle_profile)
>
>echo "> $JAR_NAME 를 profile=$IDLE_PROFILE 로 실행합니다."
>
>nohup java -jar \
>   -Dspring.config.location=classpath:/application.properties,classpath:/application-$IDLE_PROFILE.properties,/home/ec2-user/app/application-oauth.properties,/home/ec2-user/app/application-real-db.properties \
>   -Dspring.profiles.active=$IDLE_PROFILE \
>   $JAR_NAME > $REPOSITORY/nohup.out 2>&1 &
> ```    

#### 코드설명
1. prfile.sh를 통해 IDLE_PROFILE를 가져온다.
    - -Dspring.profiles.active=$IDLE_PROFILE 설정
    - classpath:/application-$IDLE_PROFILE.properties 설정

> ```health.sh```
> ```
>#!/usr/bin/env bash
>
>ABSPATH=$(readlink -f $0)
>ABSDIR=$(dirname $ABSPATH)
>source ${ABSDIR}/profile.sh
>SOURCE ${ABSDIR}/switch.sh
>
>IDLE_PORT=$(find_idle_port)
>
>echo "> Health Check Start!"
>echo "> IDLE_PORT: $IDLE_PORT"
>echo "> curl -s http://localhost:$IDLE_PORT/profile"
>sleep 10
>
>for RETRY_COUNT in {1..10}
>do
>  RESPONSE=$(curl -s http://localhost:${IDLE_PORT}/profile)
>  UP_COUNT=$(echo ${RESPONSE} | grep 'real' | wc -l)
>
>  if [ ${UP_COUNT} -ge 1 ]
>  then #$up_count >= 1 ("real" 문자열이 있는지 검증)
>    echo "> Health check 성공"
>    switch_proxy
>    break
>  else
>    echo "> Health check의 응답을 알 수 없거나 혹은 실행 상태가 아닙니다."
>    echo "> Health check: ${RESPONSE}"
>  fi
>
>  if [ ${RETRY_COUNT} -eq 10 ]
>  then
>    echo "> Health check 실패. "
>    echo "> 엔진엑스에 연결하지 않고 배포를 종료합니다."
>    exit 1
>  fi
>
>  echo "> Health check 연결 실패. 재시도..."
>  sleep 10
>done
> ```    

#### 코드설명
1. 엔진엑스와 연결되지 않은 포트로 스프링 부트가 잘 수행되었는지 체크
2. 정상 확인 후 엔진엑스 프록시 설정 변경(switch_proxy)
3. 엔진엑스 프록시 설정 변경은 switch.sh에서 수행

> ```switch.sh```
> ```
>#!/usr/bin/env bash
>
>ABSPATH=$(readlink -f $0)
>ABSDIR=$(dirname $ABSPATH)
>source ${ABSDIR}/profile.sh
>
>function switch_proxy() {
>  IDLE_PORT=$(find_idle_port)
>
>  echo "> 전환할 Port: $IDLE_PORT"
>  echo "> Port 전환"
>  echo "set \$service_url http://127.0.0.1:${IDLE_PORT};" | sudo tee /etc/nginx/conf.d/service-url.inc
>
>  echo "> 엔진엑스 Reload"
>  sudo service nginx reload
>}
> ```

#### 코드설명
1. **echo "set \$service_url http://127.0.0.1:${IDLE_PORT};"**
    - 하나의 문장을 만들어 파이프라인(|)으로 넘겨주기 위해 echo를 사용
    - 엔진엑스가 변경할 프록시 주소를 생성
    - 쌍따옴표 (")를 사용해야 합니다.
    - 사용하지 않으면 $service_url을 그대로 인식하지 못하고 변수를 찾게 됩니다.
2. **sudo tee /etc/nginx/conf.d/service-url.inc**
    - 앞에서 넘겨준 문장을 service-url.inc에 덮어 씁니다.
3. **sudo service nginx reload**
    - 엔진엑스 설정을 **다시 불러**온다.
    - restart는 잠시 끊기는 현상이 있지만, reload는 끊김 없이 다시 블러온다.

## 무중단 배포 테스트            

> ```build.gradle 수정```
> ```
> version '1.0.1-SNAPSHOT-' + new Date().format("yyyyMMddHHmmss")
> ```
> ```CodeDeply 로그 확인```
> ```
> tail -f /opt/codedeploy-agent/deployment-root/deployment-logs/codedeploy-agent-deployments.log
> ```
> 
> <img src="../../images/spring/chater10/nginx9.png" width="100%" height="100%" title="Nginx" alt="Nginx"></img><br/>  
> ```스프링 부트 로그```
> ```
> vim ~/app/step3/nohup.out
> ```
> ```자바 애플리케이션 실행 여부```
> ```
> ps -ef | grep java
> ```
> ```
>ec2-user  1626     1  1 20:22 ?        00:00:17 java -jar -Dspring.config.location=classpath:/application.properties,classpath:/application-real1.properties,/home/ec2-user/app/application-oauth.properties,/home/ec2-user/app/application-real-db.properties -Dspring.profiles.active=real1 /home/ec2-user/app/step3/springboot-webservice-1.0.1-SNAPSHOT-20200330112116.jar
>ec2-user  1809     1  5 20:35 ?        00:00:15 java -jar -Dspring.config.location=classpath:/application.properties,classpath:/application-real2.properties,/home/ec2-user/app/application-oauth.properties,/home/ec2-user/app/application-real-db.properties -Dspring.profiles.active=real2 /home/ec2-user/app/step3/springboot-webservice-1.0.1-SNAPSHOT-20200330113405.jar
> ```
