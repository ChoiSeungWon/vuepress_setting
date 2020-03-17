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

## 3. Spring Data JPA 적용하기
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

Post 클래스 생성이 끝났다면, Post 클래스로 Database를 접근하게 해 줄 JpaRepository를 생성한다.

![JPA](../../images/spring/chater03/jpa1.png)

> PostsRepository
>
>```java
>package com.swchoi.webservice.springboot.domain.posts;
>
>import org.springframework.data.jpa.repository.JpaRepository;
>
>public interface PostsRepository extends JpaRepository<Posts, Long> {
>}
>```

보통 ibatis나 MyBatis 등에서 Dao라고 불리는 DB Layer 접근자입니다.
JPA에선 Repository라고 부르며 **인터페이스**로 생성합니다. 인터페이스 생성 후 JpaRepository<Entity 클래스, PK 타입>을 상속하면 기본적인 CRUD 메소드가 자동으로 생성된다.
- **@Repository**를 추가할 필요 없다.
- Entity 클래스와 기본 Entity Repository는 함께 위치해야 한다.

## 4. Spring Data JPA 테스트 코드 작성하기

- PostsRepositoryTest 클래스 생성

![JPA TEST](../../images/spring/chater03/jpa2.png)


```java
package com.swchoi.webservice.springboot.domai.posts;

import com.swchoi.webservice.springboot.domain.posts.Posts;
import com.swchoi.webservice.springboot.domain.posts.PostsRepository;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest
public class PostsRepositoryTest {

    @Autowired
    PostsRepository postsRepository;

    @After
    public void cleanup() {
        postsRepository.deleteAll();
    }

    @Test
    public void 게시글저장_블러오기() {
        //given
        String title = "테스트 게시글";
        String content = "테스트 본문";

        postsRepository.save(Posts.builder()
                                    .title(title)
                                    .content(content)
                                    .author("b088081@gmail.com")
                                    .build());

        //when
        List<Posts> postsList = postsRepository.findAll();

        //then
        Posts posts = postsList.get(0);
        assertThat(posts.getTitle()).isEqualTo(title);
        assertThat(posts.getContent()).isEqualTo(content);
    }
}
```
#### 코드설명
1. **@After**
    * Junit에서 단위 테스트가 끝날 때마다 수행되는 메소드
    * 보통은 배포 전 전체 테스트를 수행할 때 테스트간 데이터 침범을 막기 위해 사용한다.
    * 여러 테스트가 동시에 수행되면 테스트용 데이터베이스인 H2에 데이터가 그대로 남아 있어 다음 테스트 실행 시 테스트가 실패할 수 있다.
2. **postsRepository.save**
    * 테이블 posts에 insert/update 쿼리를 실행한다.
    * id 값이 있다면 update, 없다면 insert 쿼리가 실행된다.
3. **postsRepository.findAll**
    * 테이블 posts에 있는 모든 데이터를 조회해오는 메소드
4. **@SpringBootTest**
    * 별다른 설정 없으면 **H2 데이터베이스**를 자동으로 실행해준다.     

### 쿼리 로그 추가

![properties](../../images/spring/chater03/jpa3.png)

> application.properties
>```
>spring.jpa.show-sql=true
>```

> 쿼리 로그 확인
> ![sql log](../../images/spring/chater03/jpa4.png)
- create table 쿼리를 보면 **id bigint generated by default as identity**라는 옵션으로 생성된다.
- 이는 H2 쿼리 문법으로 적용되었기 때문이다.
- 출력되는 쿼리 로그를 MySql 버전으로 변경해보자
> application.properties
>```
>spring.jpa.show-sql=true
>spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL5InnoDBDialect
>```
 ![sql log](../../images/spring/chater03/jpa5.png)

## 5. 등록/수정/조회 api 만들기
API를 만들기 위해 총 3개의 클래스가 필요합니다.

1. Request 데이터를 받을 Dto
2. API 요청을 받을 Controller
3. 트랜잭션, 도메인 기능 간의 순서를 보장하는 Service

Service는```트랜잭션, 도메인 간 순서 보장```의 역할만 합니다.

> Spring 웹 계층
> ![spring web](../../images/spring/chater03/jpa6.png)

* Web Layer
    * 흔히 사용하는 컨트롤러(@Controller)와 JSP/freemarker 등 뷰 템플릿 영역입니다.
    * 이외에도 필터(@Filter), 인터셉터, 컨트롤러 어드바이스(@ControllerAdvice)등 **외부 요청과 응답**에 대한 전반적인 영역을 이야기 합니다.
* Service Layer
    * @Service에 사용되는 서비스 영역입니다.
    * 일반적으로 Controller와 Dao의 중간 영역에서 사용됩니다.
    * @Transactional이 사용되어야 하는 영역이기도 합니다.    
* Repository Layer
    * **Database**와 같이 데이터 저장소에 접근하는 영역
    * Dao(Data Access Object) 영역
* Dtos
    * Dto(Data Transfer Object)는 **계층 간에 데이터 교환을 위한 객체**
* Domain Model
    * 도메인이라 불리는 개발 대상을 모든 사람이 동일한 관점에서 이해할 수 있고 공유할 수 있도록 단순화시킨 것을 도메인 모델이라고 한다.
    * 이를테면 택시 앱이라고 하면 배차, 탑승, 요금 등이 모두 도메인이 될 수 있습니다.
    * @Entity가 사용된 영역이 도메인 모델이다.

```Web,Service,Repository,Dto,Domain``` 이 5가지 레이어에서 비지니스 처리를 담당해야 할 곳은 어디일까요? 바로 **Domain**이다.

기존에 서비스로 처리하던 방식을 **트랜잭션 스크립트**라고 합니다. 주문 취소 로직을 작성한다면 다음과 같습니다.

> 슈도코드
> ```java
> @Transactional
> public Order cancelOrder(int orderId) {
>   1) 데이터베이스로부터 주문정보 (Orders), 결제정보(Billing)
>     , 배송정보(Delivery) 조회   
>   2) 배송 취소를 해야 하는지 확인
>   3) if(배송 중이라면) {
>       배송 취소로 변경
>      }
>   4) 각 테이블에 취소 상태 Update
> }
> ``` 
> 실제 코드
> ```java
> @Transactional
> public Order cancelOrder(int orderId) {
>    //1)
>    OrderDto order = ordersDao.selectOrders(orderId);
>    BillingDto billing = billingDao.selectBilling(orderId);
>    DeliverDto delivery = deliveryDao.selectDelivery(orderId);
>
>    //2)
>    String deliveryStatus = delivery.getStatus();
>    
>    //3)
>    if("IN_PROGRESS".equals(deliveryStatus)){
>       delivery.setStatus("CANCEL");
>       deliveryDao.update(delivery);
>    }
>
>    //4)
>    order.setStatus("CANCEL");
>    ordersDao.update(order);
>      
>    //5)
>    billing.setStatus("CANCEL");
>    billingDao.update(billing);
>
>    return order;
> }
> ```
> 모든 로직이 ```서비스 클래스 내부에서 처리됩니다.``` 그러다 보니 ```서비스 계층이 무의미하며, 객체란 단순히 데이터 덩어리``` 역할만 하게 됩니다.

반면 **도메인 모델에서 처리**할 경우 다음과 같은 코드가 될 수 있습니다.
> ```java
> @Transactional
> public Order cancelOrder(int orderId) {
>    //1)
>    Order order = ordersRepository.findById(orderId);
>    Billing billing = billingRepository.findById(orderId);
>    Deliver delivery = deliveryRepository.findById(orderId);    
>
>    //2-3)
>    delivery.cancel();
>
>    //4)
>    order.cancel();
>    billing.cancel();
>
>    return order;
> }
> ```
> order, billing, delivery가 각자 본인의 취소 이벤트 처리를 하면, ```서비스 메소드는 트랜잭션과 도메인 간의 순서만 보장```해 줍니다.

이러한 방식으로 등록, 수정, 삭제 기능을 만들어 보겠습니다.

- Controller,Service,Dto 생성

![posts Api](../../images/spring/chater03/jpa7.png)

### 등록
> **PostsApiController**
> ```java
>package com.swchoi.webservice.springboot.web;
>
>import com.swchoi.webservice.springboot.service.posts.PostService;
>import com.swchoi.webservice.springboot.web.dto.PostsSaveRequestDto;
>import lombok.RequiredArgsConstructor;
>import org.springframework.web.bind.annotation.PostMapping;
>import org.springframework.web.bind.annotation.RequestBody;
>import org.springframework.web.bind.annotation.RestController;
>
>@RequiredArgsConstructor
>@RestController
>public class PostsApiController {
>
>    private final PostService postService;
>
>    @PostMapping("/api/v1/posts")
>    public Long save(@RequestBody PostsSaveRequestDto requestDto) {
>
>        return postService.save(requestDto);
>    }
>}
> ```
> **PostService**
> ```java
>package com.swchoi.webservice.springboot.service.posts;
>
>import com.swchoi.webservice.springboot.domain.posts.PostsRepository;
>import com.swchoi.webservice.springboot.web.dto.PostsSaveRequestDto;
>import lombok.RequiredArgsConstructor;
>import org.springframework.stereotype.Service;
>
>import javax.transaction.Transactional;
>
>@RequiredArgsConstructor
>@Service
>public class PostService {
>    private final PostsRepository postsRepository;
>
>    @Transactional
>    public Long save(PostsSaveRequestDto requestDto) {
>        return postsRepository.save(requestDto.toEntity()).getId();
>    }
>}
> ```
스프링을 써보셨던 분들은 Controller 와 Service에서 @Autowired가 없는 것이 어색하게 느껴집니다. 스프링에선 Bean을 주입받는 방식들이 다음과 같습니다.
- @Autowired
- setter
- 생성자

이 중 가장 권장하는 방식이 **생성자로 주입**받는 방식입니다. 즉 **생성자로 Bean 객체**를 받도록 하면 @Autowired와 동일한 효과를 볼 수 있다.

- **@RequiredArgsConstructor**를 통해 **final이 선언된 모든 필드**를 생성한다.

> **PostsSaveRequestDto**
> ```java
>package com.swchoi.webservice.springboot.web.dto;
>
>import com.swchoi.webservice.springboot.domain.posts.Posts;
>import lombok.Builder;
>import lombok.Getter;
>import lombok.NoArgsConstructor;
>
>@Getter
>@NoArgsConstructor
>public class PostsSaveRequestDto {
>    private String title;
>    private String content;
>    private String author;
>    @Builder
>    public PostsSaveRequestDto(String title, String content,
>                                          String author) {
>        this.title = title;
>        this.content = content;
>        this.author = author;
>    }
>
>    public Posts toEntity() {
>        return Posts.builder()
>                .title(title)
>                .content(content)
>                .author(author)
>                .build();
>    }
>}
> ```

여기서 Entity 클래스와 거의 유사한 형태임에도 Dto클래스를 추가로 생성했습니다. 하지만, 절대로 **Entity 클래스를 Request/Response 클래스로 사용해서는 안된다.**
Entity 클래스는 **데이터베이스와 맞닿은 핵심 클래스**입니다.
- View Layer 와 DB Layer의 역할 분리를 철저하게 하는게 좋습니다.

> **PostsApiControllerTest**
> ```java
>package com.swchoi.webservice.springboot.web;
>
>import com.swchoi.webservice.springboot.domain.posts.Posts;
>import com.swchoi.webservice.springboot.domain.posts.PostsRepository;
>import com.swchoi.webservice.springboot.web.dto.PostsSaveRequestDto;
>import org.junit.After;
>import org.junit.Test;
>import org.junit.runner.RunWith;
>import org.springframework.beans.factory.annotation.Autowired;
>import org.springframework.boot.test.context.SpringBootTest;
>import org.springframework.boot.test.web.client.TestRestTemplate;
>import org.springframework.boot.web.server.LocalServerPort;
>import org.springframework.http.HttpStatus;
>import org.springframework.http.ResponseEntity;
>import org.springframework.test.context.junit4.SpringRunner;
>
>import java.util.List;
>
>import static org.assertj.core.api.Assertions.assertThat;
>
>@RunWith(SpringRunner.class)
>@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
>public class PostsApiControllerTest {
>
>    @LocalServerPort
>    private int port;
>
>    @Autowired
>    private TestRestTemplate restTemplate;
>
>    @Autowired
>    private PostsRepository postsRepository;
>
>    @After
>    public void tearDown() throws Exception {
>        postsRepository.deleteAll();
>    }
>
>    @Test
>    public void Posts_등록된다() throws Exception {
>        //given
>        String title = "title";
>        String content = "content";
>        PostsSaveRequestDto requestDto = PostsSaveRequestDto.builder()
>                .title(title)
>                .content(content)
>                .author("author")
>                .build();
>
>        String url = "http://localhost:" + port + "/api/v1/posts";
>
>        //when
>        ResponseEntity<Long> responseEntity = restTemplate.postForEntity(url, requestDto, Long.class);
>
>        //then
>        assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.OK);
>        assertThat(responseEntity.getBody()).isGreaterThan(0L);
>
>        List<Posts> all = postsRepository.findAll();
>        assertThat(all.get(0).getTitle()).isEqualTo(title);
>        assertThat(all.get(0).getContent()).isEqualTo(content);
>    }
>}
> ```

* @WebMvcTest의 경우 JPA 기능이 작동하지 않기 때문에 사용하지 않았다.
* @SpringBootTest와 TestRestTemplate 사용
* SpringBootTest.WebEnvironment.RANDOM_PORT 랜덤 포트 사용

### 수정/조회

> **PostsApiController**
> ```java
>@RequiredArgsConstructor
>@RestController
>public class PostsApiController {
>
>	...
>
>    @PutMapping("/api/v1/posts/{id}")
>    public Long update(@PathVariable Long id, @RequestBody 
>PostsUpdateRequestDto requestDto) {
>
>        return postService.update(id, requestDto);
>    }
>
>    @GetMapping("/api/v1/posts/{id}")
>    public PostsResponseDto findById (@PathVariable Long id) {
>
>        return postService.findById(id);
>    }
>}
> ```
> **PostsResponseDto**
> ```java
>package com.swchoi.webservice.springboot.web.dto;
>
>import com.swchoi.webservice.springboot.domain.posts.Posts;
>import lombok.Getter;
>
>@Getter
>public class PostsResponseDto {
>    private Long id;
>    private String title;
>    private String content;
>    private String author;
>
>    public PostsResponseDto(Posts entity) {
>        this.id = entity.getId();
>        this.title = entity.getTitle();
>        this.content = entity.getContent();
>        this.author = entity.getAuthor();
>    }
>}
> ```
> **PostsResponseDto**
> ```java
>package com.swchoi.webservice.springboot.web.dto;
>
>import lombok.Builder;
>import lombok.Getter;
>import lombok.NoArgsConstructor;
>
>@Getter
>@NoArgsConstructor
>public class PostsUpdateRequestDto {
>    private String title;
>    private String content;
>
>    @Builder
>    public PostsUpdateRequestDto(String title, String content) {
>        this.title = title;
>        this.content = content;
>    }
>}
> ```
> **Post**
> ```java
>@Getter
>@NoArgsConstructor
>@Entity
>public class Posts {
>
>	...
>	
>    public void update(String title, String content) {
>        this.title = title;
>        this.content = content;
>    }
>}
> ```
> **PostService**
> ```java
>@RequiredArgsConstructor
>@Service
>public class PostService {
>	
>	...
>
>    @Transactional
>    public Long update(Long id, PostsUpdateRequestDto requestDto) {
>        Posts posts = postsRepository.findById(id)
>                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 없습니다. id="+ id));
>
>        posts.update(requestDto.getTitle(), requestDto.getContent());
>        return id;
>    }
>
>    public PostsResponseDto findById (Long id) {
>        Posts entity = postsRepository.findById(id)
>                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 없습니다. id="+ id));
>
>        return new PostsResponseDto(entity);
>    }
>}
> ```

여기서 신기한 것이 있습니다. update 기능에서 데이터베이스에 **쿼리를 날리는 부분이 없습니다.** 이게 가능한 이유가 JPA의 **영속성 컨텍스트** 때문입니다.

영속성 컨텍스트란, **엔티티를 영구 저장하는 환경**입니다. 일종의 놀리적 개념이라고 보시면 되며, JPA의 핵심 내용은 **엔티티가 영속성 컨텍스트에 포함되어 있냐 아니냐**로 갈립니다.

JPA의 엔티티 매니저(EntityManager)가 활성화된 상태로(Spring Data Jpa를 쓴다면 기본옵션) **트랜잭션 안에서 데이터베이스에서 데이터를 가져오면** 이 데이터는 영속성 컨텍스트가 유지된 상태입니다.

이 상태에서 해당 데이터의 값을 변경하면 **트랜잭션이 끝나는 시점에 해당 테이블에 변경분을 반영**합니다. 즉 Entity 객체의 값만 변경하면 별도로 **Update 쿼리를 날릴 필요가 없다**는 것이죠, 이 개념을 **더티 체킹**이라고 합니다.

- 더티 체킹([Dirty Checking](https://jojoldu.tistory.com/415))이란?

> **PostsApiControllerTest**
> ```java
>@RunWith(SpringRunner.class)
>@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
>public class PostsApiControllerTest {
>
>	...
>
>    @Test
>    public void Posts_수정된다() throws Exception {
>        //given
>        Posts savePosts = postsRepository.save(Posts.builder()
>                .title("title")
>                .content("content")
>                .author("author")
>                .build());
>
>        Long updateId = savePosts.getId();
>        String expectedTitle = "title2";
>        String expectedContent = "content2";
>        PostsUpdateRequestDto requestDto = PostsUpdateRequestDto.builder()
>                .title(expectedTitle)
>                .content(expectedContent)
>                .build();
>
>        String url = "http://localhost:" + port + "/api/v1/posts/" + updateId;
>
>        HttpEntity<PostsUpdateRequestDto> requestEntity = new HttpEntity<>(requestDto);
>
>        //when
>        ResponseEntity<Long> responseEntity = restTemplate.exchange(url, HttpMethod.PUT, requestEntity, Long.class);
>
>        //then
>        assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.OK);
>        assertThat(responseEntity.getBody()).isGreaterThan(0L);
>
>        List<Posts> all = postsRepository.findAll();
>        assertThat(all.get(0).getTitle()).isEqualTo(expectedTitle);
>        assertThat(all.get(0).getContent()).isEqualTo(expectedContent);
>    }
>}
> ```

테스트 결과를 보면 update 쿼리가 수행된는 것을 확인 할 수 있습니다.
> Posts 수정 API 테스트 결과
>
> ![POST UPDATE LOG](../../images/spring/chater03/jpa8.png)

- **조회 기능은 실제로 톰갯을 실행**해서 확인해 보겠습니다.

> **application.properties** 추가
> ```
> spring.h2.console.enabled=true
> ```
> 톰캣 실행 후 http://localhost:8080/h2-console 접속
> <img src="../../images/spring/chater03/jpa9.png" width="70%" height="70%" title="h2console" alt="h2console"></img><br/>
> SELECT * FROM posts; 쿼리 실행
>
> <img src="../../images/spring/chater03/jpa10.png" width="70%" height="70%" title="h2console" alt="h2console"></img><br/>
> insert into posts(author, content, title) values ('author', 'content', 'title'); 쿼리실행
>
> <img src="../../images/spring/chater03/jpa11.png" width="70%" height="70%" title="h2console" alt="h2console"></img><br/>
> **브라우저로 Posts API 조회**
>
> <img src="../../images/spring/chater03/jpa12.png" width="70%" height="70%" title="h2console" alt="h2console"></img><br/>

