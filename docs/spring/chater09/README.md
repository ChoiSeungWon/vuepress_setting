# Travis CI 배포 자동화

## 1. CI & CD 소개

#### CI(Continouous Integration - 지속적인 통합)
- 코드 버전 관리를 하는 VCS 시스템(Git Svn등)에 PUSH가 되면 자동으로 테스트와 빌드가 수행되어 **안정적인 배포 파일을 만드는 과정**
여기서 중요한 것은 **테스팅 자동화**입니다. 지속적으로 통합하기 위해선는 프로젝트가 완전한 상태임을 보장하기 위해 테스트 코드가 구현되어 있어야만 합니다.

#### CD(Continuous Deployment - 지속적인 배포)
- 빌드 결과를 자동으로 운영 서버에 무중단 배포까지 진행되는 과정


## 2. Travis CI 연동
Travis CI는 깃허브에서제공하는 무료 CI 서비스입니다.

### Travis CI 웹 서비스 설정
[Travis CI Web Service](https://travis-ci.org/)에서 깃허브 계정으로 로그인 후 설정창 이동

> ```travis 설정창 이동```
>
> <img src="../../images/spring/chater09/travis1.png" width="100%" height="100%" title="Naver" alt="Naver"></img><br/> 
> ```깃허브 저장소 활성화```
>
> <img src="../../images/spring/chater09/travis2.png" width="100%" height="100%" title="Naver" alt="Naver"></img><br/> 
> ```깃허브 저장소 빌드 목록```
>
> <img src="../../images/spring/chater09/travis3.png" width="100%" height="100%" title="Naver" alt="Naver"></img><br/> 


### 프로젝트 설정
Travis CI의 상세한 설정은 프로젝트에 존재하는 .travis.yml 파일로 할 수 있습니다.

프로젝트의 build.gradle과 같은 위치에서 .travis.yml을 생성한 후 다음의 코드를 작성한다.

> ```.travis.yml 작성```
> ```
>language: java
>jdk:
>  - openjdk8
>
>branches:
>  only:
>    - master
>
># Travis CI 서버의 Home
>cache:
>  directories:
>    - '$HOME/.m2/repository'
>    - '$HOME/.gradle'
>
>before_install:
>  - chmod +x gradlew
>      
>script: "./gradlew clean build"
>      
># CI 실행 완료 시 메일로 알람
>notifications:
>  email:
>    recipients: 
>      - 본인 메일 주소
>
> ```

#### 코드설명

1. **branches**
    - Travis CI를 어느 브랜치가 푸시될 때 수행할지 지정합니다.
    - 현재 옵션은 오직 master 브랜치에 push될 때만 수행합니다.
2. **cache**
    - 그레이들을 통해 의존성을 받게 되면 이를 해단 디렉토리에 캐시하여, **같은 의존성은 다음 배포 때부터 다시 받지 않도록** 설정
3. **script**
    - master 브랜치에 푸시되었을 때 수행하는 명령어입니다.
4. **notifications**   
    - Travis CI 실행 완료 시 자동으로 알람이 가도록 설정합니다.


>```master Push시 Travis CI 자동 실행```
>
> <img src="../../images/spring/chater09/travis4.png" width="100%" height="100%" title="Naver" alt="Naver"></img><br/> 
>```Travis CI 실행 알람 수신```
>
> <img src="../../images/spring/chater09/travis5.png" width="50%" height="100%" title="Naver" alt="Naver"></img><br/> 

## 3. Travis CI와 AWS S3 연동
S3란 AWS에서 제공하는 **일종의 파일 서버**입니다. 이미지 파일을 비롯한 정적 파일들을 관리하거나 배포 파일들을 관리하는 
등의 기능을 지원합니다. 

>```S3를 비롯한 AWS 서비스와 Travis CI 연동 전체 구조```
>
><img src="../../images/spring/chater09/travis6.png" width="70%" height="100%" title="" alt=""></img><br/> 


### AWS Key 발급
AWS 서비스에 **외부 서비스가 접근할 수 없습니다.** 그러므로 **접근 가능한 권한을 가진 Key**를 생성

IAM(Identiry and Access Management)은 AWS에서 제공하는 서비스의 접근 방식과 권한을 관리합니다.

> ```IAM 사용자 추가```
> 
> <img src="../../images/spring/chater09/travis7.png" width="90%" height="100%" title="IAM" alt="Naver"></img><br/> 
> ```사용자 세부 정보 설정```
> 
> <img src="../../images/spring/chater09/travis8.png" width="90%" height="100%" title="IAM" alt="IAM"></img><br/> 
> ```S3 권한 CodeDeploy 권한 추가```
> 
> <img src="../../images/spring/chater09/travis9.png" width="90%" height="100%" title="IAM" alt="IAM"></img><br/> 
> <img src="../../images/spring/chater09/travis10.png" width="90%" height="100%" title="IAM" alt="IAM"></img><br/> 
> ```태그 추가```
> 
> <img src="../../images/spring/chater09/travis11.png" width="90%" height="100%" title="IAM" alt="IAM"></img><br/> 
> ```검토```
> 
> <img src="../../images/spring/chater09/travis12.png" width="90%" height="100%" title="IAM" alt="IAM"></img><br/> 
> ```엑세스키 확인```
> 
> <img src="../../images/spring/chater09/travis13.png" width="90%" height="100%" title="IAM" alt="IAM"></img><br/> 

### Travis CI에 키 등록

> ```TravisCI의 환경변수 셋팅```
> 
> <img src="../../images/spring/chater09/travis14.png" width="90%" height="100%" title="Travis" alt="Travis"></img><br/> 

여기서 등록된 값들은 이제 .travis.yml에서 $AWS_ACCESS_KEY, $AWS_SECRET_KEY란 이름으로 사용할 수 있습니다.


### S3 버킷 생성
AWS의 S3서비스는 일종의 **파일 서버**입니다. 순수하게 파일들을 저장하고 접근 권한을 관리, 검색 등을 지원하는 파일 서버의 역할을 합니다.

> ```버킷 만들기```
> 
> <img src="../../images/spring/chater09/travis15.png" width="90%" height="100%" title="버킷" alt="버킷"></img><br/> 
> ```버킷 이름 짓기```
> 
> <img src="../../images/spring/chater09/travis16.png" width="90%" height="100%" title="버킷" alt="버킷"></img><br/> 
> ```모든 퍼블릭 엑세스 차단```
> 
> <img src="../../images/spring/chater09/travis17.png" width="90%" height="100%" title="버킷" alt="버킷"></img><br/> 
> ```버킷 생성 완료```
> 
> <img src="../../images/spring/chater09/travis18.png" width="90%" height="100%" title="버킷" alt="버킷"></img><br/> 

#### .travis.yml 추가

> ```.travis.yml 추가```
> ```
>language: java
>jdk:
>  - openjdk8
>
>branches:
>  only:
>    - master
>
># Travis CI 서버의 Home
>cache:
>  directories:
>    - '$HOME/.m2/repository'
>    - '$HOME/.gradle'
>
>before_install:
>  - chmod +x gradlew
>
>script: "./gradlew clean build"
>
>before_deploy:
>  - zip -r springboot-webservice ./*
>  - mkdir -p deploy
>  - mv springboot-webservice.zip deploy/springboot-webservice.zip
>
>deploy:
>  - provider: s3
>    access_key_id: $AWS_ACCESS_KEY
>    secret_access_key: $AWS_SECRET_KEY
>
>    bucket: swchoi-springboot-build
>    region: ap-northeast-2
>    skip_cleanup: true
>    acl: private
>    local_dir: deploy
>    wait_until_deployed : true
>
># CI 실행 완료 시 메일로 알람
>notifications:
>  email:
>    recipients:
>      - b088081@gmail.com
> ```

#### 코드설명
1. **before_deploy**
    - deploy 명령어가 실행되기 전 수행
    - CodeDeploy는 **Jar 파일은 인식하지 못하므로** Jar+ 기타 설정 파일들을 모아 압축(zip)
2. **zip -r springboot-webservice**
    - 현재 위치의 모든 파일을 압축
3. **deploy**
    - **외부 서비스와 연동될 행위들을 선언**
4. **local_dir: deploy**
    - **해당 위치의 파일들만** S3로 전송


> ```Travis CI 빌드 성공```
> 
> <img src="../../images/spring/chater09/travis19.png" width="90%" height="100%" title="Travis" alt="Travis"></img><br/> 
> ```S3 업로드 성공```
> 
> <img src="../../images/spring/chater09/travis20.png" width="90%" height="100%" title="Travis" alt="Travis"></img><br/> 


## 4. Travis CI와 AWS S3, CodeDeploy 연동

### EC2에 IAM 역할 추가하기

> ```IAM 역할 만들기```
> 
> <img src="../../images/spring/chater09/travis21.png" width="90%" height="100%" title="IAM" alt="IAM"></img><br/> 

- 역할
    - AWS 서비스에만 할당할 수 있는 권한
    - EC2, CodeDeploy, SQS 등
- 사용자
    - AWS 서비스 외에 사용할 수 있는 권한
    - 로컬 PC, IDC 서버등

> ```서비스 선택```
> 
> <img src="../../images/spring/chater09/travis22.png" width="90%" height="100%" title="IAM" alt="IAM"></img><br/>     
> ```정책 선택```
> 
> <img src="../../images/spring/chater09/travis23.png" width="90%" height="100%" title="IAM" alt="IAM"></img><br/>     
> ```태그 추가```
> 
> <img src="../../images/spring/chater09/travis24.png" width="90%" height="100%" title="IAM" alt="IAM"></img><br/>     
> ```검토```
> 
> <img src="../../images/spring/chater09/travis25.png" width="90%" height="100%" title="IAM" alt="IAM"></img><br/>
> 역할 만들기 완료
>    
> ```EC2 IAM 역할 변경하기```
> 
> <img src="../../images/spring/chater09/travis26.png" width="90%" height="100%" title="EC2" alt="EC2"></img><br/>    
> ```IAM 역할 선택```
> 
> <img src="../../images/spring/chater09/travis27.png" width="90%" height="100%" title="EC2" alt="EC2"></img><br/>  
> ```EC2 재부팅```
> 
> <img src="../../images/spring/chater09/travis28.png" width="90%" height="100%" title="EC2" alt="EC2"></img><br/>  
> ```EC2 접속 CodeDeploy 에이전트 설치```
> 
> <img src="../../images/spring/chater09/travis29.png" width="100%" height="100%" title="EC2" alt="EC2"></img><br/>  
> ``` 실행 권한 추가```
> ```
> chomd +x ./install
> ```
> ``` install 파일 설치 ```
> ```
> sudo ./install auto
> ```
> ``` Agent 상태 검사 ```
> ```
> sudo service codedeploy-agent status
> ```

### CodeDeploy를 위한 권한 생성

> ```IAM 역할 CodeDeploy 서비스 선택```
> 
><img src="../../images/spring/chater09/travis30.png" width="70%" height="100%" title="CodeDeploy" alt="CodeDeploy"></img><br/>  
> ```권한 선택```
> 
><img src="../../images/spring/chater09/travis31.png" width="90%" height="100%" title="CodeDeploy" alt="CodeDeploy"></img><br/>  
> ```태그 추가```
> 
><img src="../../images/spring/chater09/travis32.png" width="90%" height="100%" title="CodeDeploy" alt="CodeDeploy"></img><br/>  
> ```검토 후 역할 만들기```
> 
><img src="../../images/spring/chater09/travis33.png" width="90%" height="100%" title="CodeDeploy" alt="CodeDeploy"></img><br/>  


### CodeDeploy 생성
CodeDeploy는 AWS의 배포 삼형제 중 하나입니다.

1. Code Commit
     - 깃허브와 같은 코드 저장소의 역할을 합니다.
     - 프라이빗 기능을 지우너한다는 강점이 있지만, 현재 깃허브에서 무료로 프라이빗 지원을 하고 있어서 거의 사용되지 않습니다.
2. Code Build
    - Travis CI와 마찬가지로 **빌드용 서비스**
    - 젠킨스/팀시티등을 많이 사용한다.
3. CodeDeploy
    - AWS 배포 서비스
    - 앞에서 언급한 다른 서비스는 대체재가 있고, CodeDeploy는 대체제가 없습니다.
    - 오토 스케일링 그룹 배포, 블루 그린 배포, 롤링 배포, EC2 단독 배포 등 많은 기능을 지원한다.

> ```CodeDeploy 생성```
> 
><img src="../../images/spring/chater09/travis34.png" width="50%" height="100%" title="CodeDeploy" alt="CodeDeploy"></img><br/>    
> ```CodeDeploy 구성 선택```
> 
><img src="../../images/spring/chater09/travis35.png" width="70%" height="100%" title="CodeDeploy" alt="CodeDeploy"></img><br/>           
> ```배포 그룹 생성```
> 
><img src="../../images/spring/chater09/travis36.png" width="80%" height="100%" title="CodeDeploy" alt="CodeDeploy"></img><br/>     
> ```그룹 권한 입력```
> 
><img src="../../images/spring/chater09/travis37.png" width="80%" height="100%" title="CodeDeploy" alt="CodeDeploy"></img><br/>        
> ```배포 유형```
> 
><img src="../../images/spring/chater09/travis38.png" width="80%" height="100%" title="CodeDeploy" alt="CodeDeploy"></img><br/>         
> 배포할 서비스가 2대 이상이라면 블루/그린을 선택    
>
> ```환경 설정```
>
><img src="../../images/spring/chater09/travis41.png" width="80%" height="100%" title="CodeDeploy" alt="CodeDeploy"></img><br/>  
> ```배포 설정```
> 
><img src="../../images/spring/chater09/travis39.png" width="80%" height="100%" title="CodeDeploy" alt="CodeDeploy"></img><br/>       
> 배포 구성이란 한번 배포할 때 몇 대의 서버에 배포할지를 결정합니다. 2대 이상이라면 1대씩 배포할지, 30% 혹은 50%로 나눠서 배포할지 등등 여러 옵션을 사용할 수 있다.
>
> ```배포 그룹 생성 완료```
> 
><img src="../../images/spring/chater09/travis40.png" width="80%" height="100%" title="CodeDeploy" alt="CodeDeploy"></img><br/>     


### Travis CI, S3, CodeDeploy 연동

- S3에서 넘겨줄 zip 파일을 저장할 디렉토리 생성
>```EC2 디렉토리 생성```
>```
> mkdir ~/app/step2 && mkdir ~/app/step2/zip
>```

- AWS CodeDeploy의 설정은 **appspec.yml로 진행**합니다.
>```appspec.yml```
>```
>version: 0.0
>os : linux
>files :
>  - source : /
>    destination: /home/ec2-user/app/step2/zip/
>    overwrite : yes
>```

#### 코드설명
1. **version: 0.0**
    - CodeDeploy 버전
    - 프로젝트 버전이 아니므로 0.0 외에 다른 버전을 사용하면 오류가 발생
2. **source**
    - CodeDeploy에서 전달해 준 파일 중 destination으로 이동시킬 대상을 지정합니다.
    - 루트 경로(/)를 지정하면 전체 파일을 이야기 합니다.
3. **destination** 
    - source에서 지정된 파일을 받는 위치
    - 이후 Jar를 실행하는 등은 destination에서 옮긴 파일들로 진행
4.  **overwrite**
    - 기존에 파일들이 있으면 덮어쓸지를 결정       

- .travis.yml에도 CodeDeploy 내용 추가
> ```.travis.yml```
> ```
> ...
>deploy:
>	...
>
>  - provider: codedeploy
>    access_key_id: $AWS_ACCESS_KEY
>    secret_access_key: $AWS_SECRET_KEY
>
>    bucket: swchoi-springboot-build
>    key : springboot-webservice.zip
>
>    bundle_type : zip
>    application : springboot-webservice
>
>    deplyment_group : springboot-webservice-group
>    region: ap-northeast-2
>    wait-until-deployed : true
> ```    
> ```CodeDeploy 성공```
> 
><img src="../../images/spring/chater09/travis42.png" width="100%" height="100%" title="CodeDeploy" alt="CodeDeploy"></img><br/>     
> ```EC2 확인```
> ```
> cd /home/ec2-user/app/step2/zip
> ll
> ```
> 
><img src="../../images/spring/chater09/travis43.png" width="80%" height="100%" title="CodeDeploy" alt="CodeDeploy"></img><br/>     

## 5. 배포 자동화 구성

### deploy.sh 파일 추가

> ```deploy.sh```
> ```
>#!/bin/bash
>
>REPOSITORY=/home/ec2-user/app/step2
>PROJECT_NAME=springboot-webservice
>
>echo "> Build 파일 복사"
>
>cp $REPOSITORY/zip/*.jar $REPOSITORY/
>
>echo "> 현재 구동중인 애플리케이션 pid 확인"
>
>CURRENT_PID=$(pgrep -fl $PROJECT_NAME | grep jar | awk '{print $1}')
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
>echo "> 새 어플리케이션 배포"
>
>JAR_NAME=$(ls -tr $REPOSITORY/*.jar | tail -n 1)
>
>echo "> JAR Name: $JAR_NAME"
>
>echo "> $JAR_NAME 에 실행권한 추가"
>
>chmod +x $JAR_NAME
>
>echo "> $JAR_NAME 실행"
>
>nohup java -jar \
>   -Dspring.config.location=classpath:/application.properties,classpath:/application-real.properties,/home/ec2-user/app/application-oauth.properties,/home/ec2-user/app/application-real-db.properties \
>   -Dspring.profiles.active=real \
>   $JAR_NAME > $REPOSITORY/nohup.out 2>&1 &
> ``` 

#### 코드설명
1. **CURRENT_PID**
    -  현재 수행 중인 스프링 부트 애플리케이션 프로세스 ID를 찾습니다.

2. **$JAR_NAME > $REPOSITORY/nohup.out 2>&1 &**
    - nohup 실행 시 CodeDeploy는 무한 대기합니다.
    - nohup이 끝나기 전까지 CodeDeploy도 끝나지 않으니 꼭 이렇게 해야한다.

### .travis.yml 수정
> ```.travis.yml```
> ```
>language: java
>jdk:
>  - openjdk8
>
>branches:
>  only:
>    - master
>
># Travis CI 서버의 Home
>cache:
>  directories:
>    - '$HOME/.m2/repository'
>    - '$HOME/.gradle'
>
>before_install:
>  - chmod +x gradlew
>
>script: "./gradlew clean build"
>
>before_deploy:
>  - mkdir -p before-deploy
>  - cp scripts/*.sh before-deploy/
>  - cp appspec.yml before-deploy/
>  - cp build/libs/*.jar before-deploy/
>  - cd before-deploy && zip -r before-deploy *
>  - cd ../ && mkdir -p deploy
>  - mv before-deploy/before-deploy.zip deploy/springboot-webservice.zip
>
>deploy:
>  - provider: s3
>    access_key_id: $AWS_ACCESS_KEY
>    secret_access_key: $AWS_SECRET_KEY
>
>    bucket: swchoi-springboot-build
>    region: ap-northeast-2
>    skip_cleanup: true
>    acl: private
>    local_dir: deploy
>    wait-until-deployed : true
>
>  - provider: codedeploy
>    access_key_id: $AWS_ACCESS_KEY
>    secret_access_key: $AWS_SECRET_KEY
>    bucket: swchoi-springboot-build
>    key : springboot-webservice.zip
>    bundle_type : zip
>    application : springboot-webservice
>    deployment_group : springboot-webservice-group
>    region: ap-northeast-2
>    wait-until-deployed : true
>
>
># CI 실행 완료 시 메일로 알람
>notifications:
>  email:
>    recipients:
>      - b088081@gmail.com
> ```


### appspec.yml 추가

> ```appspec.yml```
> ```
>version: 0.0
>os : linux
>files :
>  - source : /
>    destination: /home/ec2-user/app/step2/zip/
>    overwrite : yes
>
> permissions:
>   - object: /
>     pattern: "**"
>     owner: ec2-user
>     group: ec2-user
>
>hooks:
>  ApplicationStart:
>    - location : deploy.sh
>      timeout: 60
>      runas: ec2-user
> ```

#### 코드설명
1. **permissions**
    - CodeDeploy에서 EC2 서버로 넘겨준 파일들을 모두 ec2-user 권한을 갖도록 한다.
2. **hooks**
    - CodeDeploy 배포 단계에서 실행할 명령어를 지정합니다.
    - ApplicationStart라는 단계에서 deploy.sh를 ec2-user 권한으로 실행하게 합니다.
    - timeout: 시간제한, 60초로 설정(무한정 기다릴 수 없다)


### CodeDeploy 로그 확인

```
cd /opt/codedeploy-agent/deploayment-root/
ll
drwxr-xr-x 2 root root 4096 Mar 26 22:47 deployment-instructions
drwxr-xr-x 2 root root 4096 Mar 26 21:44 deployment-logs
drwxr-xr-x 7 root root 4096 Mar 26 22:47 fde8b9de-07b8-48e2-ad25-aa46d16aad78
drwxr-xr-x 2 root root 4096 Mar 26 22:47 ongoing-deployment
```

1. /opt/codedeploy-agent/deploayment-root/deployment-logs/codedeploy-agent-deployments.log
    - CodeDeply 로그 파일입니다.
