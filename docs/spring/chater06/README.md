# AWS 서버 환경을 만들어보자

AWS(Amazon Web Service)라는 클라우드 서비스를 이용해 서버환경을 구축해보자

## 1. EC2 인스턴스 생성하기
EC2(Elastic Compute Cloud)는 AWS에서 제공하는 성능, 용량 등을 유동적으로 사용할 수 있는 서버입니다.

> ```EC2 인스턴스 시작```
>
> <img src="../../images/spring/chater06/aws1.png" width="80%" height="70%" title="aws" alt="aws"></img><br/>
>
> 인스턴스를 생성하는 첫 단계는 AMI(Amazon Machine Image, 아마존 머신 이미지)를 선택하는 것입니다.
>
> ```Amazon Linux AMI 선택```
>
> <img src="../../images/spring/chater06/aws2.png" width="100%" height="100%" title="aws" alt="aws"></img><br/>
> ```인스턴스 유형 선택(t2.micro) ```
>
> <img src="../../images/spring/chater06/aws3.png" width="100%" height="100%" title="aws" alt="aws"></img><br/>
> ```인스턴스 세부정보 구성 ```
>
> <img src="../../images/spring/chater06/aws4.png" width="100%" height="100%" title="aws" alt="aws"></img><br/>
> ```스토리지 구성 ```
>
> <img src="../../images/spring/chater06/aws5.png" width="100%" height="100%" title="aws" alt="aws"></img><br/>
> 프리티어는 최대 30GB까지 선택 가능
>
> ```태그 추가```
>
> <img src="../../images/spring/chater06/aws6.png" width="100%" height="100%" title="aws" alt="aws"></img><br/>
> ```보안 그룹 추가```
>
> <img src="../../images/spring/chater06/aws7.png" width="100%" height="100%" title="aws" alt="aws"></img><br/>
> ```
> 지정된 IP에서만 ssh 접속이 가능하도록 구성하는 것이 안전합니다.
> ```
> ```인스턴스 검토 ```
>
> <img src="../../images/spring/chater06/aws8.png" width="100%" height="100%" title="aws" alt="aws"></img><br/>
> ```pem 키 생성```
>
> <img src="../../images/spring/chater06/aws9.png" width="100%" height="100%" title="aws" alt="aws"></img><br/>
> ```
> 인스턴스 접근하기 위해서는 pem 키가 필요합니다.
> ```
> ```인스턴스 생성 페이지```
>
> <img src="../../images/spring/chater06/aws10.png" width="100%" height="100%" title="aws" alt="aws"></img><br/>
> ```인스턴스 생성 완료```
>
> <img src="../../images/spring/chater06/aws11.png" width="100%" height="100%" title="aws" alt="aws"></img><br/>
> ``` 고정 ip 설정 EIP 할당```
>
> <img src="../../images/spring/chater06/aws12.png" width="30%" height="100%" title="aws" alt="aws"></img><br/>
> <img src="../../images/spring/chater06/aws13.png" width="90%" height="100%" title="aws" alt="aws"></img><br/>
> ``` 인스턴스와 주소연결 ```
>
> <img src="../../images/spring/chater06/aws14.png" width="90%" height="100%" title="aws" alt="aws"></img><br/>
> 탄력적 IP는 생성하고 EC2 서버에 연결하지 않으면 비용이 발생합니다. 즉, 생성한 탄력적 IP는 무조건 EC2에 바로 연결해야 하며 만약 더는 사용할 인스턴스가 없을 때도 탄력적 IP를 삭제해야 합니다.

## 2. EC2 서버에 접속하기

### Windows
- putty.exe
- puttygen.exe
두 파일을 설치합니다. [Putty](https://www.putty.org/)

> ```puttygen 실행```
>
> <img src="../../images/spring/chater06/putty1.png" width="60%" height="100%" title="puttygen" alt="puttygen"></img><br/>
> ```puttygen ppk 파일 생성```
>
> <img src="../../images/spring/chater06/putty2.png" width="60%" height="100%" title="putty" alt="putty"></img><br/>
> ```putty 실행```
>
> <img src="../../images/spring/chater06/putty3.png" width="60%" height="100%" title="putty" alt="putty"></img><br/>
- HostName : username@public_Ip를 등록합니다. ec2-user@탄력적 ip 주소
- Port : ssh 접속 포트인 22
- Connection type : SSH

> ```ppk 파일 설정```
>
> <img src="../../images/spring/chater06/putty4.png" width="60%" height="100%" title="putty" alt="putty"></img><br/>
> ```윈도우에서 EC2 접속 성공```
>
> <img src="../../images/spring/chater06/putty5.png" width="70%" height="100%" title="putty" alt="putty"></img><br/>

## 3. 아마존 리눅스 1 서버 생성 시 설정

1. Java 8 설치
2. 타임존 변경 : 기본 서버의 시간은 미국 시간대입니다. 한국 시간대가 되어야만 우리가 사용하는 시간이 모두 한국 시간으로 등록되고 사용됩니다.
3. 호스트네임 변경 : 현재 접속한 서버의 별명을 등록합니다.

### Java 8 설치
아마존 리눅스 1의 경우 기본 자바 버전이 7입니다.

EC2에서 다음의 명령어를 실행합니다.
> ```java 8 설치```
>```
>sudo yum install -y java-1.8.0-openjdk-devel.x86_64
>```
> ```JAVA 버전 변경```
>```
>sudo /usr/sbin/alternatives --config java
>```
>
> <img src="../../images/spring/chater06/putty6.png" width="80%" height="100%" title="java8" alt="java8"></img><br/>
> ```Java 버전 확인```
>
> <img src="../../images/spring/chater06/putty7.png" width="80%" height="100%" title="java8" alt="java8"></img><br/>
> ```Java 7 삭제```
> ```
> sudo yum remove java-1.7.0-openjdk
> ```


### 타임존 변경
EC2 서버의 기본 타임존은 UTC입니다. 이는 세계 표준 시간으로 한국의 시간대가 아닙니다.
즉, **한국의 시간과는  9시간차이**가 발생합니다.

> ```타임존 변경 전 시간 ```
> 
> <img src="../../images/spring/chater06/putty8.png" width="60%" height="100%" title="localtime" alt="localtime"></img><br/>
> ```타임존 변경 명령어```
> ```
> sudo rm /etc/localtime
> sudo ln -s /usr/share/zoneinfo/Asia/Seoul /etc/localtime
> ```
> ```타임존 변경 후 시간 ```
> 
> <img src="../../images/spring/chater06/putty9.png" width="60%" height="100%" title="localtime" alt="localtime"></img><br/>

### Hostname 변경
**IP만으로 어떤 서비스의 서버인지** 확인이 어렵기 때문에 Hostname을 설정합니다.

> ```Hostname 변경```
> ```
> sudo vim /etc/sysconfig/network
> ```
> ```Hostname 작성```
>
> <img src="../../images/spring/chater06/putty10.png" width="60%" height="100%" title="Hostname" alt="Hostname"></img><br/>
> ```서버 재부팅 ```
> ```
> sudo reboot
> ```
> ```변경 후 HOSTNAME```
>
> <img src="../../images/spring/chater06/putty11.png" width="70%" height="100%" title="Hostname" alt="Hostname"></img><br/> 

마지막으로 /etc/hosts에 변경한 hostname을 등록합니다.

> ```hosts 변경```
> ```
> sudo vim /etc/hosts
> ```
> ```hosts에 HOSTNAME 등록```
>
> <img src="../../images/spring/chater06/putty12.png" width="60%" height="100%" title="Hostname" alt="Hostname"></img><br/> 
> ```hosts에 등록 성공인 경우```
> 
> <img src="../../images/spring/chater06/putty13.png" width="100%" height="100%" title="Hostname" alt="Hostname"></img><br/> 