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

