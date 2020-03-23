# EC2 서버에 스프링부트 배포

## 1. EC2에 프로젝트 Clone 받기
먼저 깃허브에서 코드를 받아올 수 있게 EC2에 깃을 설치해야한다.

EC2로 접속해서 다음과 같이 명령어를 입력합니다.
> ```git 설치```
>```
>sudo yum install git
>```
> ```git 버전 확인```
>```
>git --version
>```
> ```프로젝트 디렉토리 생성```
>```
> mkdir ~/app && mkdir ~/app/step1
>```
> ```프로젝트 디렉트리 이동```
>```
> cd ~/app/step1
>```
> ```git clone```
>```
> git clone 주소
>```
> <img src="../../images/spring/chater08/deploy1.png" width="100%" height="100%" title="git clone" alt="git clone"></img><br/>
> ```프로젝트 확인```
> ```
> cd 프로젝트명
> ll
> ```
> <img src="../../images/spring/chater08/deploy2.png" width="100%" height="100%" title="ll" alt="ll"></img><br/>
> 
> ```단위 테스트만 수행```
> ```
> ./gradlew test
> ```
> ``` 실행 결과 ```
> 
> <img src="../../images/spring/chater08/deploy3.png" width="100%" height="100%" title="gradlew" alt="gradlew"></img><br/>
> ```실행 권한 추가```
> ```
> chmod +x ./gradlew
> ```
> ```단위 테스트만 수행```
> ```
> ./gradlew test
> ```
> <img src="../../images/spring/chater08/deploy4.png" width="100%" height="100%" title="gradlew" alt="gradlew"></img><br/>
> 현재 ec2엔 그레이들(Gradle)을 설치하지 않았습니다. 하지만 Gradle Task(test)를 수행 할 수 있습니다. 이는 프로젝트 내부에 포함된 gradlew 파일 때문입니다.

## 2. 배포 스크립트 만들기
1. git clone 혹은 git pull을 통해 새 버전의 프로젝트 받음
2. Gradle이나 Maven을 통해 프로젝트 테스트와 빌드
3. EC2 서버에서 해당 프로젝트 실행 및 재실행

이 3가지에 대해서 쉘스크립트를 작성하겠습니다.

>```deploy.sh 생성```
>```
>vim ~/app/step1/deploy.sh
>```
>```deploy.sh 작성```
>```
>#!/bin/bash
>
>REPOSITORY=/home/ec2-user/app/step1
>PROJECT_NAME=springboot-webservice
>
>cd $REPOSITORY/$PROJECT_NAME/
>
>echo "> Git Pull"
>
>git pull
>
>echo "> 프로젝트 Build 시작"
>
>./gradlew build
>
>echo "> step1 디렉토리 이동"
>
>cd $REPOSITORY
>
>echo "> Build 파일 복사"
>
>cp $REPOSITORY/$PROJECT_NAME/build/libs/*.jar $REPOSITORY/
>
>echo "> 현재 구동중인 애플리케이션 pid 확인"
>
>CURRENT_PID=$(pgrep -f ${PROJECT_NAME}*.jar)
>
>echo "현재 구동 중인 애플리케이션 pid: $CURRENT_PID"
>
>if [ -z "$CURRENT_PID" ]; then
>    echo "> 현재 구동 중인 애플리케이션이 없으므로 종료하지 않습니다."
>else
>    echo "> kill -15 $CURRENT_PID"
>    kill -15 $CURRENT_PID
>    sleep 5
>fi
>
>echo "> 새 애플리케이션 배포"
>
>JAR_NAME=$(ls -tr $REPOSITORY/ | grep *.jar | tail -n 1)
>
>echo "> JAR Name: $JAR_NAME"
>
>nohup java -jar $REPOSITORY/$JAR_NAME 2>&1 &
>```

#### 코드 설명
1. **변수 지정**
    - 프로젝트 디렉토리 주소는 스크립트 내에서 자주 사용하는 값이 때문에 변수 지정
    - REPOSITORY=/home/ec2-user/app/step1
    - PROJECT_NAME=springboot-webservice
    - 쉘에서는 타입 ㅇ벗이 선언하여 지정합니다.
    - 쉘에서는 $ 변수명으로 변수를 사용할 수 있습니다.
2. **git pull**
    - master 브랜치의 최신 내용을 받습니다.
3. **./gradlew build**
    - 프로젝트 내부의 gradlew로 build를 수행합니다.     
4. **CURRENT_PID=$(pgrep -f ${PROJECT_NAME}*.jar)**
    - 기존에 수행 중이던 스프링 부트 process id 추출 명령어
    - -f 옵션은 프로세스 이름으로 찻습니다.
5. **JAR_NAME=$(ls -tr $REPOSITORY/ | grep *.jar | tail -n 1)**
    - 새로 실행할 jar 파일명을 찾습니다.
    - 여러 jar 파일이 생기기 때문에 tail -n로 가장 나중의 jar파일을 변수에 저장합니다.    
6. **nohup java -jar $REPOSITORY/$JAR_NAME 2>&1 &**
    - 찾은 jar 파일명으로 해당 jar파일을 nohup으로 실행합니다.
    - 스프링 부트의 장점으로 특별히 외장 톰캣을 설치할 필요가 없습니다.
    - 내장 톰캣을 사용해서 jar 파일만 있으면 바로 웹 애플리케이션 서버를 실행할 수 있습니다.
    - nohup으로 실행을 시키려면 실행파일 권한이 755이상으로 되어있어야 함
    - 명령어 뒤에 '&'를 추가하면 백그라운드로 실행됨 
    - nohup 을 통해 프로그램을 실행시키면 nohup.log 라는 로그 파일 생성

>```deploy.sh 실행 권한 추가```
>```
> chmod +x ./deploy.sh
>```
> <img src="../../images/spring/chater08/deploy5.png" width="100%" height="100%" title="deploy.sh" alt="deploy.sh"></img><br/>
>
>```deploy.sh 실행```
>```
> ./deploy.sh
>```
> <img src="../../images/spring/chater08/deploy6.png" width="100%" height="100%" title="deploy.sh" alt="deploy.sh"></img><br/>

배포 스크립트가 잘 실행되는 것을 볼 수 있다.

## 3. 외부 Security 파일 등록
oauth 관련 proerties를 작성하자

>```application-oauth.properties 작성```
>```
> vim /home/ec2-user/app/application-oauth.properties
>```
> 로컬에 있는 application-oauth.properties 파일 내용 그대로 붙여넣기를 합니다.
> ```deploy.sh 파일 수정```
> ```
> ...
> nohup java -jar \ 
>    -Dspring.config.location=classpath:/application.properties,/home/ec2-user/app/application-oauth.properties \ 
> $JAR_NAME > $REPOSITORY/$JAR_NAME 2>&1 &
> ```

#### 코드설명
1. **-Dspring.config.location**
    - 스프링 설정 파일 위치를 지정합니다.
    - classpath가 붙으면 jar 안에 있는 resources 디렉트리 기준으로 경로가 생성됩니다.
    - application-oauth.properties은 절대경로를 사용합니다.

## 4. 스프링 부트 프로젝트로 RDS 접근하기

1. 테이블 생성 : H2에서 자동 생성해주던 테이블들을 MariaDB에선 직접 쿼리를 이용
2. 프로젝트 설정: MariaDB 드라이버 설정
3. EC2설정

### RDS 테이블 생성

>```테이블 생성```
> ```
>Hibernate: create table posts (id bigint not null auto_increment, create_date datetime, modified_date datetime, author varchar(255), content TEXT not null, title varchar(500) not null, primary key (id)) engine=InnoDB
>Hibernate: create table user (id bigint not null auto_increment, create_date datetime, modified_date datetime, email varchar(255) not null, name varchar(255) not null, picture varchar(255), role varchar(255) not null, primary key (id)) engine=InnoDB
> ```
>```스프링 세션 테이블```
>```
>CREATE TABLE SPRING_SESSION (
>	PRIMARY_ID CHAR(36) NOT NULL,
>	SESSION_ID CHAR(36) NOT NULL,
>	CREATION_TIME BIGINT NOT NULL,
>	LAST_ACCESS_TIME BIGINT NOT NULL,
>	MAX_INACTIVE_INTERVAL INT NOT NULL,
>	EXPIRY_TIME BIGINT NOT NULL,
>	PRINCIPAL_NAME VARCHAR(100),
>	CONSTRAINT SPRING_SESSION_PK PRIMARY KEY (PRIMARY_ID)
>) ENGINE=InnoDB ROW_FORMAT=DYNAMIC;
>
>CREATE UNIQUE INDEX SPRING_SESSION_IX1 ON SPRING_SESSION (SESSION_ID);
>CREATE INDEX SPRING_SESSION_IX2 ON SPRING_SESSION (EXPIRY_TIME);
>CREATE INDEX SPRING_SESSION_IX3 ON SPRING_SESSION (PRINCIPAL_NAME);
>
>CREATE TABLE SPRING_SESSION_ATTRIBUTES (
>	SESSION_PRIMARY_ID CHAR(36) NOT NULL,
>	ATTRIBUTE_NAME VARCHAR(200) NOT NULL,
>	ATTRIBUTE_BYTES BLOB NOT NULL,
>	CONSTRAINT SPRING_SESSION_ATTRIBUTES_PK PRIMARY KEY (SESSION_PRIMARY_ID, ATTRIBUTE_NAME),
>	CONSTRAINT SPRING_SESSION_ATTRIBUTES_FK FOREIGN KEY (SESSION_PRIMARY_ID) REFERENCES SPRING_SESSION(PRIMARY_ID) ON DELETE CASCADE
>) ENGINE=InnoDB ROW_FORMAT=DYNAMIC;
>```

### 프로젝트 설정

>```build.gradle```
>```
> compile("org.mariadb.jdbc:mariadb-java-client")
>```
> ```운영 application-real.properties 작성```
>```
>spring.profiles.include=oauth,real-db
>spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL5InnoDBDialect
>spring.session.store-type=jdbc
>```

### EC2 설정
> ```운영 application-real-db.properties 생성```
> ```
> vim ~/app/application-real-db.properties
> ```
> ```운영 application-real-db.properties 작성```
> ```
>spring.jpa.hibernate.ddl-auto=none
>
>spring.datasource.url=jdbc:mariadb://rds주소:포트명(기본은 3306)/database명
>spring.datasource.username=db계정
>spring.datasource.password=db계정 비밀번호
>spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
> ```

#### 코드설명
1. **spring.jpa.hibernate.ddl-auto=none**
    - JPA로 테이블이 자동 생성되는 옵션을 None(생성하지 않음)으로 지정
    - RDS에는 실제 운영으로 사용될 테이블이니 절대 스프링 부트에서 새로 만들지 않도록 해야 합니다.
    - 이 옵션을 하지 않으면 자칫 테이블이 모두 새로 생성될 수 있습니다.
    - 주의해야 하는 옵션입니다.

> ```deploy.sh 수정```
> ```
> ...
> nohup java -jar \
>    -Dspring.config.location=classpath:/application.properties,classpath:/application-real.properties,/home/ec2-user/app/application-oauth.properties,/home/ec2-user/app/application-real-db.properties \
>    -Dspring.profiles.active=real \
>    $JAR_NAME > $REPOSITORY/nohup.out 2>&1 &
> ```    
> ```deploy.sh 재실행```
> ```
> ./deploy.sh
> ```
> ``` curl localhost:8080 확인```
>
> <img src="../../images/spring/chater08/deploy9.png" width="100%" height="100%" title="deploy.sh" alt="deploy.sh"></img><br/>

## 5. EC2에서 소셜 로그인 설정

#### AWS 보안 그룹 변경

> ```EC2 보안 그룹 체크```
>
> <img src="../../images/spring/chater08/deploy10.png" width="100%" height="100%" title="보안" alt="보안"></img><br/>


#### AWS EC2 도메인으로 접속
> ```EC2 퍼블릭 DNS 확인```
>
> <img src="../../images/spring/chater08/deploy11.png" width="80%" height="100%" title="DNS" alt="DNS"></img><br/>
> ```EC2 퍼블릭 DNS 접속```
>
> <img src="../../images/spring/chater08/deploy12.png" width="100%" height="100%" title="DNS" alt="DNS"></img><br/> 

#### 구글 EC2 주소 등록

> ```OAuth 동의 화면 승인된 도메인 등록```
>
> <img src="../../images/spring/chater08/deploy13.png" width="80%" height="100%" title="DNS" alt="DNS"></img><br/> 
> ```사용자 인증 정보 추가```
>
> <img src="../../images/spring/chater08/deploy14.png" width="80%" height="100%" title="DNS" alt="DNS"></img><br/> 
> ```EC2에서 구글 로그인 성공```
>
> <img src="../../images/spring/chater08/deploy15.png" width="80%" height="100%" title="Google" alt="Google"></img><br/> 

#### 네이버 EC2 주소 등록

>```네이버 애플리케이션 설정```
>
> <img src="../../images/spring/chater08/deploy16.png" width="80%" height="100%" title="Naver" alt="Naver"></img><br/> 

1. 서비스 URL
    - 로그인을 시도하는 서비스가 네이버에 등록된 서비스인지 판단하기 위한 항목
    - 포트 제외하고 실제 도메인 주소만 입력합니다.
    - 네이버에서 아직 지원되지 않아 하나만 등록 가능합니다.
2. Callback URL
    - 전체 주소를 등록합니다.(EC2 퍼블릭 DNS:8080/login/oauth2/code/naver)

> ```EC2에서 네이버 로그인 성공```
>
> <img src="../../images/spring/chater08/deploy17.png" width="80%" height="100%" title="Naver" alt="Naver"></img><br/> 