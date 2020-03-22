# AWS 데이터베이스 환경을 만들어보자

AWS(Amazon Web Service)라는 클라우드 서비스를 이용해 데이터베이스 환경을 구축해보자

## 1. RDS 인스턴스 생성하기

> ```데이터베이스 생성```
>
> <img src="../../images/spring/chater07/RDS1.png" width="100%" height="100%" title="RDS" alt="RDS"></img><br/> 
>
> ```DBMS MariaDB 선택```
>
> <img src="../../images/spring/chater07/RDS2.png" width="70%" height="100%" title="RDS" alt="RDS"></img><br/> 
> ```템플릿 선택```
>
> <img src="../../images/spring/chater07/RDS3.png" width="90%" height="100%" title="RDS" alt="RDS"></img><br/> 
> ```상세 설정```
>
> <img src="../../images/spring/chater07/RDS4.png" width="90%" height="100%" title="RDS" alt="RDS"></img><br/> 
> ```인스턴스 크기 설정```
>
> <img src="../../images/spring/chater07/RDS5.png" width="90%" height="100%" title="RDS" alt="RDS"></img><br/> 
> ```연결 설정```
>
> <img src="../../images/spring/chater07/RDS6.png" width="90%" height="100%" title="RDS" alt="RDS"></img><br/> 
> **퍼블릭 엑세스 가능 옵션 추가**
>
> ```데이터베이스 옵션```
>
> <img src="../../images/spring/chater07/RDS7.png" width="90%" height="100%" title="RDS" alt="RDS"></img><br/> 
> ```데이터베이스 생성```
>
> <img src="../../images/spring/chater07/RDS8.png" width="100%" height="100%" title="RDS" alt="RDS"></img><br/> 

## 2. RDS 운영환경에 맞는 파라미터 설정

RDS를 처음 생성하면 몇 가지 설정을 필수로 해야 합니다. 
- 타임존
- Charcater Set
- Max Connection

> ```파라미터 그룹 탭 선택 후 파리미터 그룹 생성```
>
> <img src="../../images/spring/chater07/RDS10.png" width="80%" height="100%" title="RDS" alt="RDS"></img><br/> 
>
> ```파라미터 생성 완료```
>
> <img src="../../images/spring/chater07/RDS11.png" width="100%" height="100%" title="RDS" alt="RDS"></img><br/> 
>
> ```파라미터 편집```
>
> <img src="../../images/spring/chater07/RDS12.png" width="80%" height="100%" title="RDS" alt="RDS"></img><br/> 
>
> ```타임존 수정```
>
> <img src="../../images/spring/chater07/RDS13.png" width="50%" height="100%" title="RDS" alt="RDS"></img><br/> 
>
> ```Charcater Set utf8mb4 설정```
>
> <img src="../../images/spring/chater07/RDS14.png" width="50%" height="100%" title="RDS" alt="RDS"></img><br/> 
> utf8은 이모지를 저장할 수 없지만, utf8mb4는 이모지를 저장할 수 있다.
>
> ```collation_server utf8mb4_general_ci 설정```
>
> <img src="../../images/spring/chater07/RDS15.png" width="50%" height="100%" title="RDS" alt="RDS"></img><br/> 
>
> ```max_connections 설정```
>
> <img src="../../images/spring/chater07/RDS16.png" width="50%" height="100%" title="RDS" alt="RDS"></img><br/>
> RDS 사양에 따라 변경하면 된다.
>
> ```데이터베이스 수정  ```
>
> <img src="../../images/spring/chater07/RDS17.png" width="100%" height="100%" title="RDS" alt="RDS"></img><br/>
>
> ```데이터베이스 옵션 변경```
>
> <img src="../../images/spring/chater07/RDS18.png" width="100%" height="100%" title="RDS" alt="RDS"></img><br/>
>
> ```수정 사항 즉시 적용```
>
> <img src="../../images/spring/chater07/RDS19.png" width="100%" height="100%" title="RDS" alt="RDS"></img><br/>
>
> ```수정 적용 후 DB 인스턴스 재부팅 실행```
>
> <img src="../../images/spring/chater07/RDS20.png" width="100%" height="100%" title="RDS" alt="RDS"></img><br/>


## 3. 내 PC에서 RDS 접속
로컬 PC에서 RDS로 접근하기 위해서 **RDS의 보안 그룹에 본인 PC의 IP를 추가**하겠습니다.

> ```VPC 보안 그룹 설정```
>
> <img src="../../images/spring/chater07/RDS29.png" width="100%" height="100%" title="RDS" alt="RDS"></img><br/>
>
> ```EC2의 보안 그룹 복사```
>
> <img src="../../images/spring/chater07/RDS21.png" width="100%" height="100%" title="RDS" alt="RDS"></img><br/>
>
> ```RDS 보안 그룹 인바운드 수정```
>
> <img src="../../images/spring/chater07/RDS22.png" width="100%" height="100%" title="RDS" alt="RDS"></img><br/>
1. EC2의 보안 그룹 추가
    - **EC2와 RDS 간에 접근** 가능
2. 현재 내 PC의 IP를 등록

### 로컬 접속
인텔리제이 Database 플로그인로 로컬 접속을 해보겠습니다.

> ```Database 플러그인 설치```
>
> <img src="../../images/spring/chater07/RDS23.png" width="80%" height="100%" title="RDS" alt="RDS"></img><br/>
>
> ```RDS 접속 정보 등록```
>
> <img src="../../images/spring/chater07/RDS24.png" width="80%" height="100%" title="RDS" alt="RDS"></img><br/>
>
> ```데이터베이스 확인```
>
> <img src="../../images/spring/chater07/RDS25.png" width="50%" height="100%" title="RDS" alt="RDS"></img><br/>
>
> ``` 설정 확인 ```
> ```
> use springboot_webservice;
> show variables like 'c%';
> ```
- character_set_database, collation_connection 2가지 항목이 Iatin1로 되어있습니다.
직접 변경해야한다.
> ```
> ALTER DATABASE springboot_webservice
> CHARACTER SET = 'utf8mb4'
> COLLATE = 'utf8mb4_general_ci';
> ```
> ```character set 변경 성공```
>
> <img src="../../images/spring/chater07/RDS26.png" width="70%" height="100%" title="RDS" alt="RDS"></img><br/>
>
> ```타임존 확인```
> 
> ```
> select @@time_zone, now();
> ```
> <img src="../../images/spring/chater07/RDS27.png" width="70%" height="100%" title="RDS" alt="RDS"></img><br/>
> ```테스트 테이블 생성```
> 
> ```
>CREATE TABLE test (
>    id bigint(20) NOT NULL AUTO_INCREMENT,
>    content varchar(255) DEFAULT NULL,
>    PRIMARY KEY (id)
>) ENGINE=InnoDB;
> ```
> <img src="../../images/spring/chater07/RDS28.png" width="50%" height="100%" title="RDS" alt="RDS"></img><br/>

로컬에서 RDS와 잘 연결되는지 확인했습니다.

## 4. EC2에서 RDS 접속

### Window
- putty 사용

> ```mysql cli 설치```
> ```
> sudo yum install mysql
> ```
> ```RDS 접속```
> ```
> mysql -u 계정 -p -h Host주소
> ```
> ```RDS 접속 성공```
> 
> <img src="../../images/spring/chater07/RDS30.png" width="100%" height="100%" title="RDS" alt="RDS"></img><br/>
> ```데이터베이스 목록 확인```
> 
> <img src="../../images/spring/chater07/RDS31.png" width="50%" height="100%" title="RDS" alt="RDS"></img><br/>



