# Spring Boot에서 JPA 사용하기

## 1. JPA(Java Persistence API)란 
* JPA는 여러 ORM 전문가가 참여한 EJB 3.0 스펙 작업에서 기존 EJB ORM이던 Entity Bean을 JPA라고 바꾸고 JavaSE, JavaEE를 위한 영속성(persistence) 관리와 ORM을 위한 표준 기술이다. JPA는 ORM 표준 기술로 Hibernate, OpenJPA, EclipseLink, TopLink Essentials과 같은 구현체가 있고 이에 표준 인터페이스가 바로 JPA이다.

* ORM(Object Relational Mapping)이란 RDB 테이블을 객체지향적으로 사용하기 위한 기술이다. RDB 테이블은 객체지향적 특징(상속, 다형성, 레퍼런스, 오브젝트 등)이 없고 자바와 같은 언어로 접근하기 쉽지 않다. 때문에 ORM을 사용해 오브젝트와 RDB 사이에 존재하는 개념과 접근을 객체지향적으로 다루기 위한 기술이다.


#### 장점
* 객체지향적으로 데이터를 관리할 수 있기 때문에 비즈니스 로직에 집중 할 수 있으며, 객체지향 개발이 가능하다.
* 테이블 생성, 변경, 관리가 쉽다. (JPA를 잘 이해하고 있는 경우)
* 로직을 쿼리에 집중하기 보다는 객체자체에 집중 할 수 있다.
* 빠른 개발이 가능하다.

#### 단점
* 어렵다. 장점을 더 극대화 하기 위해서 알아야 할게 많다.
* 잘 이해하고 사용하지 않으면 데이터 손실이 있을 수 있다. (persistence context)
* 성능상 문제가 있을 수 있다.(이 문제 또한 잘 이해해야 해결이 가능하다.)


### ORM(Object-relational mapping) 이란
* Object-relational mapping (객체 관계 매핑)
    * 객체는 객체대로 설계하고, 관계형 데이터베이스는 관계형 데이터베이스대로 설계한다.
    * ORM 프레임워크가 중간에서 매핑해준다.
* 대중적인 언어에는 대부분 ORM 기술이 존재한다.
* ORM은 객체와 RDB ```두 기둥 위에 있는 기술``` 이다.

```
- MyBatis, iBatis는 ORM이 아니다. SQL Mapper입니다. 
- ORM은 객체를 매핑하는 것이고, SQL Mapper는 쿼리를 매핑하는 것이다.
```

## 2. 요구사항 분석
jpa 기능을 사용하여 게시판과 회원 기능을 구현한다.
> ``post 기능``
> * **post 조회**
> * **post 등록**
> * **post 수정**
> * **post 삭제**

> ``member 기능``
> * **구글/ 네이버 로그인**
> * **로그인한 사용자 글 작성 권한**
> * **본인 작성 글에 대한 권한 관리**

## 3. Spring Data Jpa 적용하기
먼저 build.gradle에 다음과 같이 org.springframework.boot:spring-boot-stater-data-jpa와 com.h2database:h2 의존성들을 등록한다.
```
dependencies {
    compile('org.springframework.boot:spring-boot-starter-web')
    compile('org.projectlombok:lombok')
    compile('org.springframework.boot:spring-boot-stater-data-jpa')
    compile('com.h2database:h2')
    testCompile('org.springframework.boot:spring-boot-starter-test')
}
```

#### 코드설명
1. **spring-boot-stater-data-jpa**
    * 스프링 부트용 Spring Data Jpa 추상화 라이브러리
    * 스프링 부트 버전에 맞춰 자동으로 JPA관련 라이브러리들의 버전을 관리해준다.
2. **H2**
    * 인메모리 관계형 데이터베이스
    * 별도의 설치가 필요 없이 프로젝트 의존성만으로 관리할 수 있다.
    * 메모리에서 실행되기 때문에 애플리케이션 재시작할 때마다 초기화된다.


### Entity 클래스 생성
> Posts.class
```java
package com.swchoi.webservice.springboot.domain.posts;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Getter
@NoArgsConstructor
@Entity
public class Posts {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 500, nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private String author;

    @Builder
    public Posts(String title, String content, String author) {
        this.title = title;
        this.content = content;
        this.author = author;
    }
}
```
#### 코드설명
1. **@Entity**
    * 테이블과 링크될 클래스임을 나타낸다.
    * 기본값으로 크래스의 카멜케이스 이름을 언더 스커어 네이밍(_)으로 테이블 이름을 매칠한다.
    * ex) SalesManager.java -> sales_manager table
2. **@GeneratedValue**
    * PK 생성 규칙
    * 스프링 부트 2.0에서는 GenerationType.IDENTITY 옵션을 추가해야만 auto_increment가 된다.
3. **@Id**
    * 해당 테이블의 PK 필드를 나타낸다.  
4. **@Column**
    * 테이블의 컬럼을 나타내며 굳이 선언하지 않더라고 해당 클래스의 필드는 모두 컬럼이 된다.
    * 사용하는 이유는, 기본값 외에 추가로 변경이 필요한 옵셥이 있으면 사용한다.
4. **@Builder**
    * 해당 클래스의 빌더 패턴 클래스를 생성
    * 생성자 상단에 선언 시 생성자에 포함된 필드만 빌더에 포함          

이 Posts 클래스에는 한 가지 특이점이 있습니다. **setter 메소드가 없다**는 점입니다.
자바빈 규약을 생각하면서 **getter/setter를 무작정 생성**하는 경우 클래스의 인스턴스 값들이 언제 변경되는지 명확하게 알 수 없다.
- **Entity 클래스에서는 절대 Setter 메소드를 만들지 않는다.**

> 잘못된 사용 예
>```java
>public class Order{
>    public void setStatus(boolean status) {
>        this.status = status;
>    }
>}
>
>public void 주문서비스의 취소이벤트(){
>    order.setStatus(false);
>}
>```
> 올바른 사용
>```java
>public class Order{
>    public void cancelOrder() {
>        this.status = false;
>    }
>}
>
>public void 주문서비스의 취소이벤트(){
>    order.cancelOrder();
>}
>```

