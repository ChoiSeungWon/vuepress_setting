# Travis CI 배포 자동화

## 1. CI & CD 소개

#### CI(Continouous Integration - 지속적인 통합)
- 코드 버전 관리를 하는 VCS 시스템(Git Svn등)에 PUSH가 되면 자동으로 테스트와 빌드가 수행되어 **안정적인 배포 파일을 만드는 과정**
여기서 중요한 것은 **테스팅 자동화**입니다. 지속적으로 통합하기 위해선는 프로젝트가 완전한 상태임을 보장하기 위해 테스트 코드가 구현되어 있어야만 합니다.

#### CD(Continuous Deployment - 지속적인 배포)
- 빌드 결과를 자동으로 운영 서버에 무중단 배포까지 진행되는 과정


## 2. Travis CI 연동하기
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

## 3. Travis CI와 AWS S3 연동하기
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